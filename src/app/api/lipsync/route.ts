import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // Access the environment variable on the server side
    const endpoint = process.env.LIP_SYN;

    if (!endpoint) {
        return NextResponse.json(
            { error: "LIP_SYN environment variable is not defined" },
            { status: 500 }
        );
    }

    try {
        // Retrieve the FormData from the request
        const body = await req.formData();

        // Forward the request to the actual API
        const response = await fetch(endpoint, {
            method: "POST",
            body: body,
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to process request" },
                { status: response.status }
            );
        }

        // Return the API's response back to the client
        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            { error: "Something went wrong while processing the request" },
            { status: 500 }
        );
    }
}
