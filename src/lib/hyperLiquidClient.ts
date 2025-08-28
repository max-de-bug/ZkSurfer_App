import fetch from 'cross-fetch';
import { signAction } from './hyperLiquidSigner';

// REST endpoint for Hyperliquid exchange
const API_URL = 'https://api.hyperliquid.xyz/exchange';
// WebSocket endpoint for order updates
const WS_URL = 'wss://api.hyperliquid.xyz/ws';

// Simple WebSocket singleton
let ws: WebSocket | null = null;
function getWebSocket(): WebSocket {
  if (ws === null || ws.readyState === WebSocket.CLOSED) {
    ws = new WebSocket(WS_URL);
  }
  return ws;
}

/**
 * Place a testnet order on Hyperliquid
 * @param asset   Asset index (e.g. 10000 for PURR/USDC)
 * @param isBuy   true for LONG, false for SHORT
 * @param price   Limit price as string
 * @param size    Order size as string
 */
export async function placeTestOrder(
  asset: number,
  isBuy: boolean,
  price: string,
  size: string,
): Promise<{ status: string; response: any }> {
  const action = {
    type: 'order',
    orders: [{
      a: asset,
      b: isBuy,
      p: price,
      s: size,
      r: false,
      t: { limit: { tif: 'Gtc' as const } }
    }],
    grouping: 'normalTpsl' as const
  };

  const nonce = Date.now();
  const signature = await signAction({ action, nonce, hyperliquidChain: 'Testnet' });

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, nonce, signature })
  });

  if (!res.ok) {
    throw new Error(`Hyperliquid API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Subscribe to WebSocket order updates and resolve when matched
 * @param oid     Order ID returned by placeTestOrder
 */
export function getOrderStatus(
  oid: number,
  timeoutMs = 60_000
): Promise<{ filled: boolean; fillPrice?: number }> {
  return new Promise((resolve, reject) => {
    const socket = getWebSocket();

    // On open, subscribe to this specific order
    const onOpen = () => {
      socket.send(JSON.stringify({ type: 'subscribe', channel: 'orders', payload: { oid } }));
    };
    socket.addEventListener('open', onOpen, { once: true });

    // Handle incoming messages
    const onMessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        // Expecting: { type: 'orderUpdate', data: { oid, filled, fillPrice } }
        if ((msg.type === 'orderUpdate' || msg.type === 'order')
          && msg.data
          && msg.data.oid === oid) {
          const { filled, fillPrice } = msg.data;
          cleanup();
          resolve({ filled, fillPrice });
        }
      } catch { }
    };
    socket.addEventListener('message', onMessage);

    // Timeout if no update
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timeout waiting for order ${oid} update`));
    }, timeoutMs);

    // Cleanup listeners
    function cleanup() {
      clearTimeout(timer);
      socket.removeEventListener('open', onOpen);
      socket.removeEventListener('message', onMessage);
    }
  });
}

