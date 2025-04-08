import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Parse the form data from the incoming request.
        const formData = await request.formData();

        // Extract the fields with the same keys as in your client code
        const imageFile = formData.get('image_file');
        const positivePrompt = formData.get('positive_prompt');
        const seed = formData.get('seed') || '0';
        const steps = formData.get('steps') || '20';
        const cfg = formData.get('cfg') || '6';
        const samplerName = formData.get('sampler_name') || 'uni_pc';
        const scheduler = formData.get('scheduler') || 'simple';
        const number = formData.get('number') || '1';
        const videoLength = formData.get('video_length') || '120';
        const width = formData.get('width') || '512';
        const height = formData.get('height') || '512';
        const outputFps = formData.get('output_fps') || '16';
        const outputQuality = formData.get('output_quality') || '90';
        const outputFormat = formData.get('output_format') || 'mp4';

        // Validate critical fields
        if (!imageFile || !positivePrompt) {
            return NextResponse.json(
                { error: 'Image and positive prompt are required.' },
                { status: 400 }
            );
        }

        // Retrieve your external API endpoint from environment variables.
        const externalApiUrl = process.env.NEXT_PUBLIC_WAN_IMG_TO_VIDEO;
        if (!externalApiUrl) {
            throw new Error('NEXT_PUBLIC_WAN_IMG_TO_VIDEO is not set in the environment!');
        }

        // Rebuild form data for the external API
        const forwardFormData = new FormData();
        forwardFormData.append('image_file', imageFile);
        forwardFormData.append('positive_prompt', positivePrompt.toString());
        forwardFormData.append('seed', seed.toString());
        forwardFormData.append('steps', steps.toString());
        forwardFormData.append('cfg', cfg.toString());
        forwardFormData.append('sampler_name', samplerName.toString());
        forwardFormData.append('scheduler', scheduler.toString());
        forwardFormData.append('number', number.toString());
        forwardFormData.append('video_length', videoLength.toString());
        forwardFormData.append('width', width.toString());
        forwardFormData.append('height', height.toString());
        forwardFormData.append('output_fps', outputFps.toString());
        forwardFormData.append('output_quality', outputQuality.toString());
        forwardFormData.append('output_format', outputFormat.toString());

        // Forward the request to the external API.
        const externalResponse = await fetch(externalApiUrl, {
            method: 'POST',
            body: forwardFormData,
        });

        if (!externalResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to generate video from external API.' },
                { status: externalResponse.status }
            );
        }

        // Check the content type to verify that a video is returned.
        const contentType = externalResponse.headers.get('Content-Type') || '';
        if (!contentType.startsWith('video/')) {
            const errorJson = await externalResponse.json().catch(() => null);
            return NextResponse.json(
                {
                    error: `Expected a video, got content-type: ${contentType}`,
                    details: errorJson,
                },
                { status: 500 }
            );
        }

        // Return the video as a blob.
        const arrayBuffer = await externalResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return new NextResponse(buffer, {
            status: 200,
            headers: { 'Content-Type': contentType },
        });
    } catch (error: any) {
        console.error('Error in /api/imgToVideo route:', error);
        return NextResponse.json(
            { error: error.message || 'Something went wrong.' },
            { status: 500 }
        );
    }
}
