// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const { agentType, trade, tradeMode } = await req.json();

//     if (!trade || trade.trim() === "") {
//       return NextResponse.json(
//         { error: "Trade (telegramId) is required." },
//         { status: 400 }
//       );
//     }

//     // Read endpoints from environment variables.
//     const swapAuthenticate = process.env.NEXT_PUBLIC_SWAP_AUTHENTICATE;
//     const swapAutomate = process.env.NEXT_PUBLIC_SWAP_AUTOMATE;

//     if (!swapAuthenticate || !swapAutomate) {
//       return NextResponse.json(
//         { error: "Swap endpoints are not defined in the environment variables." },
//         { status: 500 }
//       );
//     }

//     // Determine which swap endpoint to use.
//     let swapUrl: string;
//     let swapHeaders: Record<string, string> = { "Content-Type": "application/json" };

//     if (agentType === "micro-agent" && tradeMode === "authentication") {
//       swapUrl = swapAuthenticate;
//     } else {
//       swapUrl = swapAutomate;
//       // For super-agent or micro-agent in 'automation' mode, include the API key.
//       swapHeaders["x-api-key"] = "swap123"; // You can also store the API key in an env variable.
//     }

//     // Build the payload for the swap API.
//     const swapPayload = {
//       telegramId: trade,
//       outputMint: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
//     };

//     // Call the swap API.
//     const swapResponse = await fetch(swapUrl, {
//       method: "POST",
//       headers: swapHeaders,
//       body: JSON.stringify(swapPayload),
//     });

//     if (!swapResponse.ok) {
//       const errorData = await swapResponse.json();
//       // Check for a specific error message.
//       if (
//         swapResponse.status === 500 &&
//         errorData.error ===
//           "Swap failed: Swap failed: The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined"
//       ) {
//         return NextResponse.json(
//           {
//             error:
//               "Please add balance to your wallet; you'll find the wallet address inside your Telegram bot. Add at least 0.01 SOL as balance.",
//           },
//           { status: 500 }
//         );
//       } else {
//         return NextResponse.json(
//           { error: `Failed to complete Telegram wallet setup: ${swapResponse.statusText}` },
//           { status: swapResponse.status }
//         );
//       }
//     }

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error: any) {
//     console.error("Error processing swap API request:", error);
//     return NextResponse.json(
//       { error: "Something went wrong while processing the swap request." },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        // Expect telegramIds as an array from the request body.
        const { agentType, telegramIds, tradeMode } = await req.json();

        // Validate that telegramIds is a non-empty array and that each id is a non-empty string.
        if (
            !telegramIds ||
            !Array.isArray(telegramIds) ||
            telegramIds.length === 0 ||
            telegramIds.some((id: string) => !id || id.trim() === "")
        ) {
            return NextResponse.json(
                { error: "At least one valid telegramId is required." },
                { status: 400 }
            );
        }

        // Read endpoints from environment variables.
        const swapAuthenticate = process.env.NEXT_PUBLIC_SWAP_AUTHENTICATE;
        const swapAutomate = process.env.NEXT_PUBLIC_SWAP_AUTOMATE;

        if (!swapAuthenticate || !swapAutomate) {
            return NextResponse.json(
                { error: "Swap endpoints are not defined in the environment variables." },
                { status: 500 }
            );
        }

        // Determine which swap endpoint to use.
        let swapUrl: string;
        let swapHeaders: Record<string, string> = { "Content-Type": "application/json" };

        if (agentType === "micro-agent" && tradeMode === "authentication") {
            swapUrl = swapAuthenticate;
        } else {
            swapUrl = swapAutomate;
            // For super-agent or micro-agent in 'automation' mode, include the API key.
            swapHeaders["x-api-key"] = "swap123"; // You can also store the API key in an environment variable.
        }

        // Build the payload for the swap API.
        // The payload now contains an array of telegram IDs.
        const swapPayload = {
            telegramIds,
            outputMint: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
        };

        // Call the swap API.
        const swapResponse = await fetch(swapUrl, {
            method: "POST",
            headers: swapHeaders,
            body: JSON.stringify(swapPayload),
        });

        if (!swapResponse.ok) {
            const errorData = await swapResponse.json();
            // Check for a specific error message.
            if (
                swapResponse.status === 500 &&
                errorData.error ===
                "Swap failed: Swap failed: The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined"
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Please add balance to your wallet; you'll find the wallet address inside your Telegram bot. Add at least 0.01 SOL as balance.",
                    },
                    { status: 500 }
                );
            } else {
                return NextResponse.json(
                    { error: `Failed to complete Telegram wallet setup: ${swapResponse.statusText}` },
                    { status: swapResponse.status }
                );
            }
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error("Error processing swap API request:", error);
        return NextResponse.json(
            { error: "Something went wrong while processing the swap request." },
            { status: 500 }
        );
    }
}

// import { NextRequest, NextResponse } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     // Expect telegramIds as an array from the request body.
//     const { agentType, telegramIds, tradeMode } = await req.json();

//     // Validate that telegramIds is a non-empty array and each id is a non-empty string.
//     if (
//       !telegramIds ||
//       !Array.isArray(telegramIds) ||
//       telegramIds.length === 0 ||
//       telegramIds.some((id: string) => !id || id.trim() === "")
//     ) {
//       return NextResponse.json(
//         { error: "At least one valid telegramId is required." },
//         { status: 400 }
//       );
//     }

//     // Read endpoints from environment variables.
//     const swapAuthenticate = process.env.NEXT_PUBLIC_SWAP_AUTHENTICATE;
//     const swapAutomate = process.env.NEXT_PUBLIC_SWAP_AUTOMATE;

//     if (!swapAuthenticate || !swapAutomate) {
//       return NextResponse.json(
//         { error: "Swap endpoints are not defined in the environment variables." },
//         { status: 500 }
//       );
//     }

//     // Determine which swap endpoint to use.
//     let swapUrl: string;
//     let swapHeaders: Record<string, string> = { "Content-Type": "application/json" };

//     if (agentType === "micro-agent" && tradeMode === "authentication") {
//       swapUrl = swapAuthenticate;
//     } else {
//       swapUrl = swapAutomate;
//       // For super-agent or micro-agent in 'automation' mode, include the API key.
//       swapHeaders["x-api-key"] = "swap123"; // You can also store the API key in an env variable.
//     }

//     // Build the payload for the swap API.
//     // Here, we assume the swap API expects an array of telegram IDs under "telegramIds".
//     const swapPayload = {
//       telegramIds,
//       outputMint: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
//     };

//     // Call the swap API.
//     const swapResponse = await fetch(swapUrl, {
//       method: "POST",
//       headers: swapHeaders,
//       body: JSON.stringify(swapPayload),
//     });

//     if (!swapResponse.ok) {
//       const errorData = await swapResponse.json();
//       // Check for a specific error message.
//       if (
//         swapResponse.status === 500 &&
//         errorData.error ===
//           "Swap failed: Swap failed: The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received undefined"
//       ) {
//         return NextResponse.json(
//           {
//             error:
//               "Please add balance to your wallet; you'll find the wallet address inside your Telegram bot. Add at least 0.01 SOL as balance.",
//           },
//           { status: 500 }
//         );
//       } else {
//         return NextResponse.json(
//           { error: `Failed to complete Telegram wallet setup: ${swapResponse.statusText}` },
//           { status: swapResponse.status }
//         );
//       }
//     }

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error: any) {
//     console.error("Error processing swap API request:", error);
//     return NextResponse.json(
//       { error: "Something went wrong while processing the swap request." },
//       { status: 500 }
//     );
//   }
// }
