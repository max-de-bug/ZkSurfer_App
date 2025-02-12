import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_TOTAL_USD_AMOUNT_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json(
      { error: "Total USD amount endpoint is not defined" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // "Authorization": `Bearer ${process.env.MY_SECRET_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch total USD amount" },
        { status: response.status }
      );
    }

    // Assuming the external API returns plain text
    const textData = await response.text();
    return NextResponse.json({ totalUsd: textData });
  } catch (error) {
    console.error("Error in total-usd-amount:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
