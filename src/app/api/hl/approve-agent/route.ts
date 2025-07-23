import { NextRequest } from 'next/server';
import { Wallet, utils } from 'ethers';
import fetch from 'cross-fetch';

export const runtime = 'nodejs';
const API_URL = 'https://api.hyperliquid.xyz/exchange';

const MASTER_PK = process.env.HL_MASTER_KEY!;
const wallet = new Wallet(MASTER_PK);
const { keccak256, toUtf8Bytes } = utils;

function canonical(obj: any) { return JSON.stringify(obj, Object.keys(obj).sort()); }
function sign(payload: any) {
  const digest = keccak256(toUtf8Bytes(canonical(payload)));
  const { r, s, v } = wallet._signingKey().signDigest(digest);
  return { r, s, v, address: wallet.address, signatureChainId: '0xa4b1', hyperliquidChain: 'Testnet' };
}

export async function POST(req: NextRequest) {
  const { agentAddress } = await req.json();
  const nonce = Date.now();
  const action = {
    type: 'approveAgent',
    hyperliquidChain: 'Testnet',
    signatureChainId: '0xa4b1',
    agentAddress,
    nonce
  };
  const signature = sign({ action, nonce });
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ action, nonce, signature })
  });
  const text = await res.text();
  if (!res.ok) return new Response(text, { status: 500 });
  return new Response(text);
}
