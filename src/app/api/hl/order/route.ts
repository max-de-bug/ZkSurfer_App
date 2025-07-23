

// import { NextRequest } from 'next/server';
// import { Hyperliquid } from 'hyperliquid';

// export const runtime = 'nodejs';

// // CRITICAL: Remove NEXT_PUBLIC_ - it exposes your private key to the client!
// const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY; // API wallet private key
// const MAIN_WALLET = process.env.NEXT_PUBLIC_HL_MAIN_WALLET; // Your main trading wallet address

// if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
// if (!MAIN_WALLET) throw new Error('HL_MAIN_WALLET missing in env');

// // Initialize SDK once
// const sdk = new Hyperliquid({
//   privateKey: PK,
//   walletAddress: MAIN_WALLET, // Your main wallet that holds funds
//   testnet: false
// });

// console.log('[HL] SDK initialized for wallet:', MAIN_WALLET);

// // Asset mapping - BTC is index 0
// const ASSET_MAP = {
//   0: 'BTC-PERP',
//   // 1: 'ETH-PERP',
//   // Add more as needed
// };

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     console.log('[HL] inbound body:', body);

//     const { asset, side, price, size, takeProfit, stopLoss } = body;
//     // const coin = ASSET_MAP[asset] || 'BTC-PERP';
//    const coin = ASSET_MAP[Number(asset) as keyof typeof ASSET_MAP] || 'BTC-PERP';
//     const isBuy = side === 'LONG';

//     console.log(`[HL] Placing order: ${coin} ${side} ${size} @ ${price}`);

//     // Place main order with TP/SL
//     const orderParams = {
//       coin,
//       is_buy: isBuy,
//       sz: size,
//       limit_px: price,
//       order_type: { limit: { tif: 'Gtc' } },
//       reduce_only: false
//     };

//     // Add TP/SL if provided
//     if (takeProfit || stopLoss) {
//       orderParams.order_type = {
//         limit: { tif: 'Gtc' },
//         ...(takeProfit && { tp: takeProfit }),
//         ...(stopLoss && { sl: stopLoss })
//       };
//     }

//     console.log('[HL] Order params:', JSON.stringify(orderParams, null, 2));

//     const result = await sdk.exchange.placeOrder(orderParams);

//     console.log('[HL] Order result:', JSON.stringify(result, null, 2));

//     if (result.status === 'err') {
//       throw new Error(result.response);
//     }

//     return new Response(JSON.stringify(result), { status: 200 });

//   } catch (e: any) {
//     console.error('HL order error:', e);
//     return new Response(JSON.stringify({ error: e.message }), { status: 500 });
//   }
// }


import { NextRequest } from 'next/server';
import { Hyperliquid, Tif } from 'hyperliquid'; // import Tif!

export const runtime = 'nodejs';

const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
const MAIN_WALLET = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;

if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
if (!MAIN_WALLET) throw new Error('HL_MAIN_WALLET missing in env');

const sdk = new Hyperliquid({
  privateKey: PK,
  walletAddress: MAIN_WALLET,
  testnet: false
});

const ASSET_MAP = { 0: 'BTC-PERP' };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { asset, side, price, size, takeProfit, stopLoss } = body;
    const coin = ASSET_MAP[Number(asset) as keyof typeof ASSET_MAP] || 'BTC-PERP';
    const isBuy = side === 'LONG';

    const orderParams = {
      coin,
      is_buy: isBuy,
      sz: size,
      limit_px: price,
      order_type: { limit: { tif: 'Gtc' as Tif } },
      reduce_only: false
    };

    if (takeProfit || stopLoss) {
      orderParams.order_type = {
        limit: { tif: 'Gtc' as Tif },
        ...(takeProfit && { tp: takeProfit }),
        ...(stopLoss && { sl: stopLoss })
      };
    }

    const result = await sdk.exchange.placeOrder(orderParams);
    if (result.status === 'err') throw new Error(result.response);

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e: any) {
    console.error('HL order error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
