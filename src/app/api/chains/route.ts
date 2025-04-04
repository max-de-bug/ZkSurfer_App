import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Retrieve the chain API URL from environment variables.
    const chainUrl = process.env.NEXT_PUBLIC_CHAIN;
    if (!chainUrl) {
      throw new Error("NEXT_PUBLIC_CHAIN is not defined");
    }

    // Call the external chain API.
    const response = await fetch(chainUrl, {
      headers: { accept: 'application/json' },
    });

    // Parse the returned JSON.
    const data = await response.json();

    // Validate and update chain data.
    if (data.Chain && Array.isArray(data.Chain)) {
      const updatedChains = data.Chain.map((chain: any) => {
        // Disable specific chains.
        if (["Berachain", "Tron", "Solana"].includes(chain.name)) {
          return { ...chain, disabled: true };
        }
        return chain;
      });

      // Return the updated chain data.
      return NextResponse.json({ Chain: updatedChains });
    } else {
      throw new Error("Invalid chain data from API.");
    }
  } catch (error: any) {
    console.error("Error fetching chains:", error);
    return NextResponse.json(
      { error: "Error fetching chains.", message: error.message },
      { status: 500 }
    );
  }
}
