import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // You can either hardcode the endpoint or read it from an environment variable.
  // For example, setNEXT_PUBLIC_VOICE_CLONE in your .env file.
  const endpoint =
    process.env.NEXT_PUBLIC_VOICE_CLONE;

  if (!endpoint) {
    return NextResponse.json(
      { error: "VOICE_CLONE_API environment variable is not defined" },
      { status: 500 }
    );
  }

  try {
    // Extract FormData from the incoming request.
    const body = await req.formData();
    const apiKey = req.headers.get('x-api-key');
    const currentCredits = req.headers.get('x-current-credits');

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!currentCredits || parseInt(currentCredits) <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 } // Payment Required
      );
    }

    // Forward the request to the voice clone API endpoint with the same FormData.
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "accept": "application/json",
      },
      body: body, // FormData is passed directly.
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to generate voice clone." },
        { status: response.status }
      );
    }

    // Get the API response as a blob (typically an audio file).
    const blob = await response.blob();

    // Return the blob with the appropriate content type.
    return new Response(blob, {
      headers: {
        "Content-Type": "audio/wav", // Adjust this if your API returns a different audio format.
      },
    });
  } catch (error) {
    console.error("Error processing voice clone request:", error);
    return NextResponse.json(
      { error: "Something went wrong while processing the voice clone request." },
      { status: 500 }
    );
  }
}

