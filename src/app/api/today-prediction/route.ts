// import { NextRequest, NextResponse } from "next/server";

// export async function GET(_req: NextRequest) {
//   const endpoint = process.env.NEXT_PUBLIC_PREDICTION_API;  
//   if (!endpoint) {
//     return NextResponse.json(
//       { error: "PREDICTION_API is not defined" },
//       { status: 500 }
//     );
//   }

//   try {
//     // force a fresh fetch every time
//     const res = await fetch(endpoint, { cache: "no-store" });
//     if (!res.ok) {
//       return NextResponse.json(
//         { error: `Upstream error (${res.status})` },
//         { status: res.status }
//       );
//     }

//     const data = await res.json();
//     // also tell the client not to cache this response
//     return NextResponse.json(data, {
//       status: 200,
//       headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
//     });
//   } catch (err) {
//     console.error("Error proxying /today-prediction:", err);
//     return NextResponse.json(
//       { error: "Something went wrong fetching prediction" },
//       { status: 500 }
//     );
//   }
// }


// pages/api/today-prediction.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const endpoint = process.env.NEXT_PUBLIC_PREDICTION_API;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (!endpoint) {
    return NextResponse.json({ error: "PREDICTION_API is not defined" }, { status: 500 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: "PREDICTION_API_KEY is not defined" }, { status: 500 });
  }

  try {
    const res = await fetch(endpoint, {
      cache: "no-store",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream error (${res.status})` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    console.error("Error proxying /today-prediction:", err);
    return NextResponse.json(
      { error: "Something went wrong fetching prediction" },
      { status: 500 }
    );
  }
}
