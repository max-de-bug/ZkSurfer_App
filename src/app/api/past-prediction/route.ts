// import { NextRequest, NextResponse } from "next/server";

// export async function GET(_req: NextRequest) {
//     const endpoint = process.env.NEXT_PUBLIC_PAST_PREDICTION_API;
//     if (!endpoint) {
//         return NextResponse.json(
//             { error: "NEXT_PUBLIC_PAST_PREDICTION_API is not defined" },
//             { status: 500 }
//         );
//     }

//     try {
//         const upstream = await fetch(endpoint, {
//             method: "GET",
//             headers: { accept: "application/json" }
//         });

//         if (!upstream.ok) {
//             return NextResponse.json(
//                 { error: `Upstream error (${upstream.status})` },
//                 { status: upstream.status }
//             );
//         }

//         const data = await upstream.json();
//         return NextResponse.json(data);
//     } catch (e) {
//         console.error("Error proxying /past-prediction:", e);
//         return NextResponse.json(
//             { error: "Failed to fetch past predictions" },
//             { status: 500 }
//         );
//     }
// }

// app/api/past-prediction/route.ts
import { NextRequest, NextResponse } from "next/server";

// force the route to be treated as dynamic
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_PAST_PREDICTION_API;
  if (!endpoint) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_PAST_PREDICTION_API is not defined" },
      { status: 500 }
    );
  }

  try {
    // 1. disable fetch caching
    const upstream = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      headers: { accept: "application/json" },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream error (${upstream.status})` },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();

    // 2. disable response caching
    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (e) {
    console.error("Error proxying /past-prediction:", e);
    return NextResponse.json(
      { error: "Failed to fetch past predictions" },
      { status: 500 }
    );
  }
}
