
import { NextResponse } from 'next/server';
import { Keypair } from '@solana/web3.js';

export async function POST(request: Request) {
  // 1) parse the incoming JSON
  const { plan } = await request.json();

  // 2) generate a fresh reference key
  const keypair = Keypair.generate();

  // TODO: persist keypair.publicKey.toBase58() + plan + userId in your database

  // 3) return it
  return NextResponse.json({ reference: keypair.publicKey.toBase58() });
}
