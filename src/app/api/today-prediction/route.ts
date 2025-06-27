// file: app/api/today-prediction/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
    const endpoint = process.env.NEXT_PUBLIC_PREDICTION_API;           // ← set this in your .env (not NEXT_PUBLIC_)
    if (!endpoint) {
        return NextResponse.json(
            { error: "NEXT_PUBLIC_PREDICTION_API is not defined" },
            { status: 500 }
        );
    }

    try {
        const res = await fetch(endpoint);                       // server-side fetch avoids mixed-content errors
        if (!res.ok) {
            return NextResponse.json(
                { error: `Upstream error (${res.status})` },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        console.error("Error proxying /today-prediction:", err);
        return NextResponse.json(
            { error: "Something went wrong fetching prediction" },
            { status: 500 }
        );
    }
}
