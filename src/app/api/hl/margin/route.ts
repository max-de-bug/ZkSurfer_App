// pages/api/hl/margin.ts
import { NextRequest, NextResponse } from 'next/server';
import { Hyperliquid } from 'hyperliquid';

const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY!;
const MAIN_WALLET = process.env.NEXT_PUBLIC_HL_MAIN_WALLET!;

const sdk = new Hyperliquid({
  privateKey: PK,
  walletAddress: MAIN_WALLET,
  testnet: false,       // or true for testnet
});

export async function GET(_: NextRequest) {
  const state = await sdk.info.perpetuals.getClearinghouseState(MAIN_WALLET);
  const availableMargin = Number(state.marginSummary.accountValue);
  return NextResponse.json({ availableMargin });
}
