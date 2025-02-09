import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Get the external endpoint from environment variables.
  const endpoint = process.env.NEXT_PUBLIC_CHECK_WHITELIST_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json(
      { error: "Check whitelist endpoint is not defined" },
      { status: 500 }
    );
  }

  try {
    // Parse the incoming JSON body.
    const body = await req.json();

    // Forward the request to the external whitelist-check API.
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Uncomment below if your external API requires an API key:
        // "Authorization": `Bearer ${process.env.MY_SECRET_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to check whitelist" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in check-whitelist route:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
