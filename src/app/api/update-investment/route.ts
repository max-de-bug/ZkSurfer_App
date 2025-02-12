import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_UPDATE_INVESTMENT_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json(
      { error: "Update investment endpoint is not defined" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        "Accept": "/",
        // "Authorization": `Bearer ${process.env.MY_SECRET_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to update investment" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in update-investment:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
