import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_SOL_PRICE_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json(
      { error: "SOL price endpoint is not defined" },
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
        { error: "Failed to fetch SOL price" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in sol-price:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
