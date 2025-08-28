import { NextRequest } from 'next/server';
import { Hyperliquid } from 'hyperliquid';

export const runtime = 'nodejs';

const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
const MAIN_WALLET = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;

if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
if (!MAIN_WALLET) throw new Error('HL_MAIN_WALLET missing in env');

// Initialize SDK
const sdk = new Hyperliquid({
  privateKey: PK,
  walletAddress: MAIN_WALLET,
  testnet: false
});

console.log('[HL] Cancel SDK initialized for wallet:', MAIN_WALLET);

// Asset mapping
const ASSET_MAP: Record<number, string> = {
  0: 'BTC-PERP',
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[HL] Cancel request body:', body);

    const { action, asset, orderId, coin } = body;

    // Handle different cancel actions
    switch (action) {
      case 'cancel_order':
        return await cancelSpecificOrder(asset, orderId, coin);

      case 'cancel_all':
        return await cancelAllOrders();

      case 'cancel_all_for_asset':
        return await cancelAllForAsset(asset, coin);

      case 'cancel_open_orders':
        return await cancelOpenOrders();

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (e: any) {
    console.error('HL cancel error:', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}

// Cancel a specific order by ID
async function cancelSpecificOrder(asset?: number, orderId?: number, coin?: string) {
  if (!orderId) {
    throw new Error('Order ID is required');
  }

  const coinSymbol = coin || ASSET_MAP[asset || 0] || 'BTC-PERP';

  console.log(`[HL] Canceling order ${orderId} for ${coinSymbol}`);

  const result = await (sdk.exchange as any).cancelOrder({
    coin: coinSymbol,
    o: orderId
  });

  console.log('[HL] Cancel order result:', JSON.stringify(result, null, 2));
  return new Response(JSON.stringify(result), { status: 200 });
}

// Cancel all orders
async function cancelAllOrders() {
  console.log('[HL] Canceling all orders');

  const result = await (sdk.custom as any).cancelAllOrders();

  console.log('[HL] Cancel all orders result:', JSON.stringify(result, null, 2));
  return new Response(JSON.stringify(result), { status: 200 });
}

// Cancel all orders for a specific asset
async function cancelAllForAsset(asset?: number, coin?: string) {
  const coinSymbol = coin || ASSET_MAP[asset || 0] || 'BTC-PERP';

  console.log(`[HL] Canceling all orders for ${coinSymbol}`);

  const result = await (sdk.custom as any).cancelAllOrders(coinSymbol);

  console.log('[HL] Cancel all for asset result:', JSON.stringify(result, null, 2));
  return new Response(JSON.stringify(result), { status: 200 });
}

// Cancel all open orders (get open orders first, then cancel them)
async function cancelOpenOrders() {
  try {
    console.log('[HL] Getting open orders first...');

    // Get open orders
    const openOrders = await (sdk.info.perpetuals as any).getOpenOrders(MAIN_WALLET);
    console.log('[HL] Open orders:', JSON.stringify(openOrders, null, 2));

    if (!openOrders || openOrders.length === 0) {
      return new Response(JSON.stringify({
        status: 'ok',
        message: 'No open orders to cancel'
      }), { status: 200 });
    }

    // Cancel each order individually
    const cancelResults = [];
    for (const order of openOrders) {
      try {
        const result = await (sdk.exchange as any).cancelOrder({
          coin: order.coin,
          o: order.oid
        });
        cancelResults.push({ orderId: order.oid, result });
        console.log(`[HL] Canceled order ${order.oid}:`, result);
      } catch (orderError) {
        console.error(`[HL] Failed to cancel order ${order.oid}:`, orderError);
        cancelResults.push({
          orderId: order.oid,
        });
      }
    }

    const response = {
      status: 'ok',
      message: `Processed ${openOrders.length} orders`,
      results: cancelResults
    };

    return new Response(JSON.stringify(response), { status: 200 });

  } catch (error) {
    console.error('[HL] Error getting/canceling open orders:', error);
    throw error;
  }
}