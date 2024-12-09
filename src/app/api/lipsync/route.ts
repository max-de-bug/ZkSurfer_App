import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const endpoint = process.env.NEXT_PUBLIC_LIP_SYNC;

    if (!endpoint) {
        return NextResponse.json(
            { error: "LIP_SYN environment variable is not defined" },
            { status: 500 }
        );
    }

    try {
        // Extract FormData from the incoming request
        const body = await req.formData();

        // Forward the request to the actual API with the same FormData
        const response = await fetch(endpoint, {
            method: "POST",
            body: body, // FormData is passed directly
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to process request" },
                { status: response.status }
            );
        }

        // Fetch the response as a Blob and return it
        const blob = await response.blob();
        return new Response(blob, {
            headers: {
                "Content-Type": "video/mp4", // Adjust content type based on API response
            },
        });
    } catch (error) {
        console.error("Error processing lipsync request:", error);
        return NextResponse.json(
            { error: "Something went wrong while processing the request" },
            { status: 500 }
        );
    }
}
