// // /app/api/video-gen/route.ts
// import { NextRequest, NextResponse } from 'next/server';

// export async function POST(request: NextRequest) {
//     try {
//         // 1. Parse the incoming JSON from the client.
//         const body = await request.json();
//         const prompt = body.prompt?.trim();
//         if (!prompt) {
//             return NextResponse.json(
//                 { error: 'Missing required field: prompt' },
//                 { status: 400 }
//             );
//         }

//         // 2. Build the payload to send to the external “generate-video” service.
//         //    You can tweak any of these parameters (lora_scale, sample_steps, etc.) 
//         //    or even allow them to come from the client. For now, we hard-code.
//         const externalPayload = {
//             prompt,
//             fast_mode: 'Balanced',
//             lora_scale: 1,
//             num_frames: 81,
//             aspect_ratio: '16:9',
//             sample_shift: 5,
//             sample_steps: 30,
//             frames_per_second: 16,
//             sample_guide_scale: 5,
//         };

//         // 3. Fire off the request to the external API.
//         //    (Assumes you’ve stored your Zynapse API key as an env var, e.g. NEXT_PUBLIC_VIDEO_GEN_API_KEY.)
//         const externalResponse = await fetch(
//             'https://zynapse.zkagi.ai/v1/generate-video',
//             {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     // If the external service requires an X-API-Key header:
//                     'X-API-Key': process.env.NEXT_PUBLIC_VIDEO_GEN_API_KEY || '',
//                 },
//                 body: JSON.stringify(externalPayload),
//             }
//         );

//         if (!externalResponse.ok) {
//             const text = await externalResponse.text();
//             return NextResponse.json(
//                 { error: `External API error: ${text}` },
//                 { status: externalResponse.status }
//             );
//         }

//         // 4. Assume the external returns JSON (e.g. { video_url: 'https://…' } or maybe base64).
//         const data = await externalResponse.json();
//         return NextResponse.json(data);
//     } catch (err: any) {
//         console.error('Error in /api/video-gen:', err);
//         return NextResponse.json(
//             { error: err.message || 'Something went wrong.' },
//             { status: 500 }
//         );
//     }
// }

// app/api/video-gen/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // 1) Read the external endpoint from env (or hardcode if you prefer).
  const externalEndpoint = process.env.NEXT_PUBLIC_VIDEO_GEN_ENDPOINT
    || "https://zynapse.zkagi.ai/v1/generate-video";
  if (!externalEndpoint) {
    return NextResponse.json(
      { error: "VIDEO_GEN_API endpoint is not defined" },
      { status: 500 }
    );
  }

  try {
    // 2) Read the API key and current credits from request headers.
    const apiKey = request.headers.get("x-api-key");
    const currentCreditsHeader = request.headers.get("x-current-credits");
    const currentCredits = currentCreditsHeader ? parseInt(currentCreditsHeader, 10) : 0;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 }
      );
    }

    if (!currentCreditsHeader || isNaN(currentCredits) || currentCredits <= 0) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 } // 402 Payment Required
      );
    }

    // 3) Parse the JSON body to extract { prompt }.
    //    We expect the client to send: { prompt: string, …other optional fields }
    const jsonBody = await request.json();
    const prompt = typeof jsonBody.prompt === "string"
      ? jsonBody.prompt.trim()
      : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 }
      );
    }

    // 4) Build the payload exactly as the external service expects.
    //    You can add or remove any of these keys if they’re optional:
    const externalPayload = {
      prompt,
      fast_mode: "Balanced",
      lora_scale: 1,
      num_frames: 81,
      aspect_ratio: "16:9",
      sample_shift: 5,
      sample_steps: 30,
      frames_per_second: 16,
      sample_guide_scale: 5,
      // … you could accept overrides from jsonBody if you liked:
      // ...jsonBody.fast_mode && { fast_mode: jsonBody.fast_mode },
    };

    // 5) Forward the POST to the external endpoint.
    const externalResponse = await fetch(externalEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        accept: "application/json",
      },
      body: JSON.stringify(externalPayload),
    });

    if (!externalResponse.ok) {
      // Try to unwrap any JSON error they returned:
      let errJson: any = null;
      try {
        errJson = await externalResponse.json();
      } catch {
        // If it wasn’t valid JSON, fall back to text
      }

      if (errJson && typeof errJson === "object") {
        return NextResponse.json(
          {
            error: `External service failed`,
            details: errJson,
          },
          { status: externalResponse.status }
        );
      } else {
        const errText = await externalResponse.text();
        return NextResponse.json(
          {
            error: `External service failed: ${errText}`,
          },
          { status: externalResponse.status }
        );
      }
    }

    // 6) Otherwise, parse the JSON response (e.g. { video_url: "https://…" })
    const data = await externalResponse.json();

    // 7) Return it to the client, and let the client deduct 1 credit locally.
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (err: any) {
    console.error("Error in /api/video-gen:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong." },
      { status: 500 }
    );
  }
}
