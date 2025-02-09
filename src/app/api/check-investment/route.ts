import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const endpoint = process.env.NEXT_PUBLIC_CHECK_INVESTMENT_ENDPOINT;
    if (!endpoint) {
        return NextResponse.json(
            { error: "Check investment endpoint is not defined" },
            { status: 500 }
        );
    }

    try {
        // Expecting a JSON payload
        const body = await req.json();

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Uncomment the following line if your external API requires an API key
                // "Authorization": `Bearer ${process.env.MY_SECRET_API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to check investment" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in check-investment:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}
