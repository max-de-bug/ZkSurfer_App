import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
    const endpoint = process.env.NEXT_PUBLIC_PAST_PREDICTION_API;
    if (!endpoint) {
        return NextResponse.json(
            { error: "NEXT_PUBLIC_PAST_PREDICTION_API is not defined" },
            { status: 500 }
        );
    }

    try {
        const upstream = await fetch(endpoint, {
            method: "GET",
            headers: { accept: "application/json" }
        });

        if (!upstream.ok) {
            return NextResponse.json(
                { error: `Upstream error (${upstream.status})` },
                { status: upstream.status }
            );
        }

        const data = await upstream.json();
        return NextResponse.json(data);
    } catch (e) {
        console.error("Error proxying /past-prediction:", e);
        return NextResponse.json(
            { error: "Failed to fetch past predictions" },
            { status: 500 }
        );
    }
}
