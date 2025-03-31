import { NextRequest, NextResponse } from "next/server";

// Get the base endpoint from environment variables
const KIMA_API_BASE = process.env.NEXT_PUBLIC_KIMA_API;

if (!KIMA_API_BASE) {
    throw new Error("NEXT_PUBLIC_KIMA_API environment variable is not defined");
}

// This handler will forward GET requests
export async function GET(req: NextRequest) {
    try {
        // Get the current URL, then remove the /api/kima prefix so we can forward the rest of the path
        const url = new URL(req.url);
        const pathAfterApi = url.pathname.replace("/api/kima", "");
        const targetUrl = `${KIMA_API_BASE}${pathAfterApi}${url.search}`;

        const response = await fetch(targetUrl, {
            method: "GET",
            headers: req.headers,
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to fetch from Kima API" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in GET request:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}

// This handler will forward POST requests
export async function POST(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const pathAfterApi = url.pathname.replace("/api/kima", "");
        const targetUrl = `${KIMA_API_BASE}${pathAfterApi}${url.search}`;

        // Determine how to read the body based on the content type
        const contentType = req.headers.get("content-type") || "";
        let body;
        if (contentType.includes("application/json")) {
            body = await req.text(); // Passing JSON as text
        } else {
            body = await req.formData(); // If it's FormData (like in your lipsync example)
        }

        const response = await fetch(targetUrl, {
            method: "POST",
            headers: req.headers,
            body,
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to post to Kima API" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in POST request:", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
