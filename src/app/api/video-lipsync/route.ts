import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data from the incoming request.
    const formData = await request.formData();

    // Extract required files/fields.
    const referenceImage = formData.get('reference_image');
    const inputAudio = formData.get('input_audio');
    const animationMode = formData.get('animation_mode');
    const drivingMultiplier = formData.get('driving_multiplier') || '1.0';
    const scale = formData.get('scale') || '2.3';
    const flagRelativeMotion = formData.get('flag_relative_motion') || 'false';

    // Basic validation: ensure image and audio exist.
    if (!referenceImage || !inputAudio || !animationMode) {
      return NextResponse.json(
        { error: 'Missing required fields: reference_image, input_audio, or animation_mode' },
        { status: 400 }
      );
    }

    // Rebuild the FormData to forward to the external API.
    const forwardFormData = new FormData();
    forwardFormData.append('reference_image', referenceImage);
    forwardFormData.append('input_audio', inputAudio);
    forwardFormData.append('animation_mode', animationMode.toString());
    forwardFormData.append('driving_multiplier', drivingMultiplier.toString());
    forwardFormData.append('scale', scale.toString());
    forwardFormData.append('flag_relative_motion', flagRelativeMotion.toString());

    // Retrieve the external API URL from the environment variable.
    const externalApiUrl = process.env.NEXT_PUBLIC_VIDEO_LIPSYNC;
    if (!externalApiUrl) {
      throw new Error('NEXT_PUBLIC_VIDEO_LIPSYNC is not set!');
    }

    // Forward the request to the external video-lipsync API.
    const externalResponse = await fetch(externalApiUrl, {
      method: 'POST',
      body: forwardFormData,
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      return NextResponse.json(
        { error: `External API error: ${errorText}` },
        { status: externalResponse.status }
      );
    }

    // Ensure that the response is of video content type.
    const contentType = externalResponse.headers.get('Content-Type') || '';
    if (!contentType.startsWith('video/')) {
      const errorJson = await externalResponse.json().catch(() => null);
      return NextResponse.json(
        {
          error: `Expected a video response, but received content-type: ${contentType}`,
          details: errorJson,
        },
        { status: 500 }
      );
    }

    // Get the video blob and return it.
    const arrayBuffer = await externalResponse.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: { 'Content-Type': contentType },
    });
  } catch (error: any) {
    console.error('Error in /api/lipsync route:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong.' },
      { status: 500 }
    );
  }
}
