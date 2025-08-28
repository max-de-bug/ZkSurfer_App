// // lib/orderBuilder.ts
import { Tif } from 'hyperliquid';

// export function buildOrder(params: {
//   coin: string;
//   isBuy: boolean;
//   px: number;
//   sz: string;
//   tp?: number;
//   sl?: number;
// }) {
//   const { coin, isBuy, px, sz, tp, sl } = params;
//   const order: any = {
//     coin,
//     is_buy: isBuy,
//     sz,
//     limit_px: px,
//     order_type: { limit: { tif: 'Alo' as Tif } },  // post‑only for low fees
//     reduce_only: false,
//     // optional client order id for tracking
//     c: '0x' + crypto.randomUUID().replace(/-/g, '').slice(0, 32)
//   };
//   if (tp !== undefined) order.order_type.tp = tp;
//   if (sl !== undefined) order.order_type.sl = sl;
//   return order;
// }


// lib/orderBuilder.ts
export function buildOrder(params: {
  coin: string;
  isBuy: boolean;
  px: number;
  sz: string;
  tp?: number;
  sl?: number;
}) {
  const { coin, isBuy, px, sz, tp, sl } = params;
  const order: any = {
    coin,
    is_buy: isBuy,
    sz,
    limit_px: px,
    order_type: { limit: { tif: 'Alo' } },
    reduce_only: false,
    c: '0x'+crypto.randomUUID().replace(/-/g,'').slice(0,32)
  };
  if (tp !== undefined) order.order_type.tp = tp;
  if (sl !== undefined) order.order_type.sl = sl;
  return order;
}
