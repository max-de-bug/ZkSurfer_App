

// // pages/api/hl/cron-order.ts
// import { NextResponse } from 'next/server';
// import { Hyperliquid, Tif } from 'hyperliquid';
// import { getDayState, pushTrade } from '@/lib/dayState';

// export const runtime = 'nodejs';  // must be Node.js for the SDK

// // ——— SDK Configuration ————————————————————————————————————————————————
// const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
// const MAIN_WALLET_RAW = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;
// const USER_WALLET_RAW = process.env.NEXT_PUBLIC_HL_USER_WALLET;
// if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
// if (!MAIN_WALLET_RAW) throw new Error('HL_MAIN_WALLET missing in env');
// if (!USER_WALLET_RAW) throw new Error('USER_WALLET_RAW missing in env');

// // Create properly typed constants
// const MAIN_WALLET: string = MAIN_WALLET_RAW;
// const USER_WALLET: string = USER_WALLET_RAW;

// const sdk = new Hyperliquid({
//     privateKey: PK,
//     walletAddress: MAIN_WALLET,
//     testnet: false
// });

// // ——— Dynamic Position Sizing Constants ———————————————————————————————
// const LOT_SIZE = 0.00001;
// const MIN_ORDER_SIZE = 0.0001;
// const MIN_PROFIT_PER_TRADE = 17.5; // MINIMUM profit target (not fixed)
// const MAX_LOSS_PER_TRADE = 30;
// const DAILY_LOSS_LIMIT = 150;
// const CAPITAL_USAGE_PERCENT = 0.90; // Use 90% of available USDC per trade
// const MAX_LEVERAGE = 25; // Increased for higher profits
// const MIN_LEVERAGE = 5;  // Higher minimum for aggressive targets

// // ——— Helper Functions ————————————————————————————————————————————————
// function roundLot(x: number) {
//     const lots = Math.max(
//         Math.floor(x / LOT_SIZE),
//         Math.ceil(MIN_ORDER_SIZE / LOT_SIZE)
//     );
//     return lots * LOT_SIZE;
// }

// // ——— Get Real-Time USDC Balance (2025 CORRECT METHOD) ————————————————
// async function getAvailableUSDC() {
//     try {
//         console.log('🔍 Checking wallet:', USER_WALLET);

//         // Method 1: CORRECT 2025 API - Direct POST request for perpetuals
//         console.log('📊 Checking Perpetuals Account (Direct API)...');
//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
//         console.log('🏦 Perpetuals State:', JSON.stringify(perpState, null, 2));

//         // Method 2: CORRECT 2025 API - Direct POST request for spot  
//         console.log('💱 Checking Spot Account (Direct API)...');
//         const spotResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'spotClearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const spotState = await spotResponse.json();
//         console.log('🏪 Spot State:', JSON.stringify(spotState, null, 2));

//         // Extract balances from responses
//         const perpBalance = parseFloat(perpState?.marginSummary?.accountValue || '0');
//         const spotBalances = spotState?.balances || [];
//         const usdcSpot = spotBalances.find((b: any) => b.coin === 'USDC');
//         const spotUSDC = parseFloat(usdcSpot?.total || '0');

//         console.log('💰 Balance Breakdown:', {
//             perpetualsUSDC: perpBalance,
//             spotUSDC: spotUSDC,
//             totalUSDC: perpBalance + spotUSDC,
//             perpWithdrawable: parseFloat(perpState?.withdrawable || '0'),
//             spotHold: parseFloat(usdcSpot?.hold || '0')
//         });

//         // Return valid balances
//         if (perpBalance > 0) {
//             return {
//                 totalUSDC: perpBalance,
//                 availableMargin: parseFloat(perpState.withdrawable || perpState.marginSummary.accountValue),
//                 source: 'perpetuals'
//             };
//         }

//         if (spotUSDC > 0) {
//             return {
//                 totalUSDC: spotUSDC,
//                 availableMargin: spotUSDC,
//                 needsTransfer: true,
//                 spotAmount: spotUSDC,
//                 source: 'spot'
//             };
//         }

//         // No funds found
//         console.error('❌ No USDC found in either account!');
//         return { totalUSDC: 0, availableMargin: 0, noFunds: true };

//     } catch (err) {
//         console.error('❌ API Error:', err);
//         return { totalUSDC: 0, availableMargin: 0, error: err };
//     }
// }

// // ——— Aggressive Dynamic Leverage (HIGHER FOR PROFITS) ————————————————
// function calculateDynamicLeverage(profit: number, loss: number, confidence?: number) {
//     // VERY aggressive to maximize profit potential
//     if (loss >= 120) return 3;   // Emergency brake only
//     if (loss >= 80) return 6;    // Heavy caution
//     if (profit >= 300 && loss <= 30) return 25; // MAX leverage on hot streak
//     if (profit >= 200 && loss <= 50) return 20; // High leverage for good performance  
//     if (profit >= 100 && loss <= 40) return 18; // Above average performance
//     if (loss <= 40) return 15;   // Normal aggressive mode
//     if (loss >= 60) return 10;   // Defensive mode
//     return 12; // Default aggressive (increased from 10)
// }

// // ——— MINIMUM Profit-Target Based Sizing (DYNAMIC UPWARD) ——————————————
// function calculateOptimalSize(
//     price: number,
//     availableUSDC: number,
//     currentProfit: number,
//     currentLoss: number,
//     expectedMovePercent = 2.0 // Slightly higher expected move
// ) {
//     // MINIMUM profit scaling - increases with performance
//     let targetProfit = MIN_PROFIT_PER_TRADE;

//     // DYNAMIC UPWARD SCALING based on performance
//     if (currentProfit >= 150 && currentLoss <= 30) {
//         targetProfit = Math.min(40, targetProfit * 1.8); // Up to $40 on hot streak
//     } else if (currentProfit >= 100 && currentLoss <= 50) {
//         targetProfit = Math.min(30, targetProfit * 1.5); // Up to $30 when doing well
//     } else if (currentProfit >= 50 && currentLoss <= 60) {
//         targetProfit = Math.min(25, targetProfit * 1.3); // Scale up moderately
//     }

//     // Use HIGH percentage of available capital (90%)
//     const capitalPerTrade = availableUSDC * CAPITAL_USAGE_PERCENT;

//     // Calculate required notional for DYNAMIC profit target
//     const requiredNotional = (targetProfit / expectedMovePercent) * 100;

//     // Calculate needed leverage for target
//     const neededLeverage = Math.min(
//         requiredNotional / capitalPerTrade,
//         MAX_LEVERAGE
//     );

//     // But also check what leverage gives us maximum safe size
//     const maxSafeLeverage = MAX_LEVERAGE;
//     const maxSafeNotional = capitalPerTrade * maxSafeLeverage;

//     // Use the HIGHER of: target-based or maximum safe leverage
//     const leverage = Math.max(
//         Math.max(MIN_LEVERAGE, Math.round(neededLeverage)),
//         Math.round(maxSafeNotional / requiredNotional * MIN_LEVERAGE)
//     );

//     const finalLeverage = Math.min(leverage, MAX_LEVERAGE);
//     const notionalValue = capitalPerTrade * finalLeverage;
//     const positionSize = notionalValue / price;

//     // Calculate ACTUAL expected profit (could be higher than minimum)
//     const actualExpectedProfit = (notionalValue * expectedMovePercent) / 100;

//     console.log(`💰 Capital: $${capitalPerTrade.toFixed(0)}, Leverage: ${finalLeverage}x`);
//     console.log(`📊 Notional: $${notionalValue.toFixed(0)}, Size: ${positionSize.toFixed(5)}`);
//     console.log(`🎯 MIN Target: $${MIN_PROFIT_PER_TRADE}, DYNAMIC Target: $${targetProfit.toFixed(1)}, ACTUAL Expected: $${actualExpectedProfit.toFixed(1)}`);

//     return {
//         size: roundLot(positionSize),
//         leverage: finalLeverage,
//         notionalValue,
//         capitalUsed: capitalPerTrade,
//         expectedProfit: actualExpectedProfit, // This can be MUCH higher than minimum
//         dynamicTarget: targetProfit,
//         maxRisk: Math.min((notionalValue * 2.5) / 100, MAX_LOSS_PER_TRADE) // 2.5% max adverse move
//     };
// }

// // ——— Dynamic Size Calculator (NO UPPER LIMITS) ———————————————————————
// async function calcDynamicSize(price: number, signal: string, confidence?: number) {
//     const balanceInfo = await getAvailableUSDC();
//     const availableMargin = balanceInfo.availableMargin || 0;
//     const dayState = getDayState();

//     console.log('💰 Balance Info for Calculation:', {
//         totalUSDC: balanceInfo.totalUSDC,
//         availableMargin: availableMargin,
//         needsTransfer: balanceInfo.needsTransfer || false,
//         spotAmount: balanceInfo.spotAmount || 0
//     });

//     // Calculate base leverage from performance
//     const baseLeverage = calculateDynamicLeverage(
//         Math.max(0, dayState.realizedPnl),
//         dayState.realizedLoss,
//         confidence
//     );

//     // Skip calculation if no funds available
//     if (availableMargin <= 0) {
//         return {
//             size: MIN_ORDER_SIZE.toFixed(5),
//             leverage: MIN_LEVERAGE,
//             notional: 0,
//             expectedProfit: 0,
//             minTarget: MIN_PROFIT_PER_TRADE,
//             maxRisk: 0,
//             capitalUsed: 0,
//             availableUSDC: 0,
//             profitPotential: 'NO_FUNDS'
//         };
//     }

//     // Calculate optimal position for MINIMUM profit target (can go higher)
//     const optimal = calculateOptimalSize(
//         price,
//         availableMargin,
//         Math.max(0, dayState.realizedPnl),
//         dayState.realizedLoss
//     );

//     // Use the HIGHER leverage for maximum profit potential
//     const finalLeverage = Math.max(baseLeverage, optimal.leverage);

//     // Recalculate with MAXIMUM leverage between the two
//     const capitalPerTrade = availableMargin * CAPITAL_USAGE_PERCENT;
//     const finalNotional = capitalPerTrade * finalLeverage;
//     const finalSize = finalNotional / price;

//     // ACTUAL expected profit (will likely exceed minimum)
//     const actualExpectedProfit = (finalNotional * 2.0) / 100; // 2% expected move
//     const maxRisk = Math.min((finalNotional * 2.5) / 100, MAX_LOSS_PER_TRADE);

//     return {
//         size: roundLot(finalSize).toFixed(5),
//         leverage: finalLeverage,
//         notional: finalNotional,
//         expectedProfit: actualExpectedProfit,
//         minTarget: MIN_PROFIT_PER_TRADE,
//         maxRisk,
//         capitalUsed: capitalPerTrade,
//         availableUSDC: availableMargin,
//         profitPotential: actualExpectedProfit >= MIN_PROFIT_PER_TRADE ? 'TARGET_EXCEEDED' : 'MINIMUM_MET'
//     };
// }

// // ——— Main Cron Handler ————————————————————————————————————————————————
// export async function GET() {
//     try {
//         // 1️⃣ Fetch the forecast directly from your Python backend
//         const apiKey = process.env.NEXT_PUBLIC_API_KEY;
//         if (!apiKey) {
//             return NextResponse.json(
//                 { error: 'NEXT_PUBLIC_API_KEY not defined' },
//                 { status: 500 }
//             );
//         }

//         const forecastRes = await fetch('https://zynapse.zkagi.ai/today', {
//             method: 'GET',
//             cache: 'no-store',
//             headers: {
//                 accept: 'application/json',
//                 'api-key': apiKey
//             }
//         });

//         if (!forecastRes.ok) {
//             const txt = await forecastRes.text();
//             console.error('Forecast API error:', txt);
//             return NextResponse.json(
//                 { error: `Forecast API error (${forecastRes.status})` },
//                 { status: forecastRes.status }
//             );
//         }

//         const { forecast_today_hourly } = await forecastRes.json();

//         // 2️⃣ Pick the latest hourly slot
//         const slot = Array.isArray(forecast_today_hourly) && forecast_today_hourly.length > 0
//             ? forecast_today_hourly[forecast_today_hourly.length - 1]
//             : null;
//         console.log('📊 [Forecast Response]', JSON.stringify(slot, null, 2));

//         if (
//             !slot ||
//             slot.signal === 'HOLD' ||
//             slot.forecast_price == null ||
//             typeof slot.signal !== 'string'
//         ) {
//             console.warn('⚠️ No valid trade signal. Skipping.');
//             return NextResponse.json({ message: 'No trade signal' });
//         }

//         // 3️⃣ Check daily loss limit BEFORE sizing
//         const dayState = getDayState();
//         if (dayState.realizedLoss >= DAILY_LOSS_LIMIT) {
//             console.log(`🛑 Daily loss limit reached ($${DAILY_LOSS_LIMIT}). Stopping trades.`);
//             return NextResponse.json({
//                 message: `Daily loss limit reached: $${dayState.realizedLoss}`
//             });
//         }

//         // 4️⃣ AGGRESSIVE Dynamic position sizing (NO UPPER LIMITS)
//         const price = Math.round(slot.forecast_price);
//         const balanceInfo = await getAvailableUSDC();

//         // Handle special cases
//         if (balanceInfo.noFunds) {
//             console.error('❌ No USDC found in any account. Please deposit funds.');
//             return NextResponse.json({
//                 error: 'No USDC balance found. Please deposit funds to your Hyperliquid account.',
//                 balanceInfo
//             });
//         }

//         if (balanceInfo.needsTransfer && balanceInfo.spotAmount && balanceInfo.spotAmount > 0) {
//             console.log(`💸 Auto-transferring ${balanceInfo.spotAmount} USDC from Spot to Perpetuals...`);
//             try {
//                 const transferResult = await sdk.exchange.transferBetweenSpotAndPerp(
//                     balanceInfo.spotAmount,
//                     true // true = spot to perp
//                 );
//                 console.log('✅ Transfer successful:', transferResult);

//                 // Re-fetch balance after transfer
//                 const updatedBalance = await getAvailableUSDC();
//                 console.log('🔄 Updated balance after transfer:', updatedBalance);
//             } catch (transferErr) {
//                 console.error('❌ Auto-transfer failed:', transferErr);
//                 return NextResponse.json({
//                     error: `Auto-transfer failed: ${transferErr}. Please manually transfer USDC from Spot to Perpetuals.`,
//                     spotAmount: balanceInfo.spotAmount
//                 });
//             }
//         }

//         // Recalculate position after any transfers
//         const positionCalc = await calcDynamicSize(price, slot.signal, slot.confidence_90?.[1]);

//         // Final check: ensure we have enough funds to trade
//         if (positionCalc.availableUSDC < 10) { // Need at least $10 to trade meaningfully
//             console.error('❌ Insufficient funds for trading after all checks.');
//             return NextResponse.json({
//                 error: `Insufficient funds: Only ${positionCalc.availableUSDC} available. Need at least $10.`,
//                 positionCalc
//             });
//         }

//         console.log('🚀 AGGRESSIVE Position Calculation:', {
//             availableUSDC: positionCalc.availableUSDC.toFixed(0),
//             capitalUsed: positionCalc.capitalUsed.toFixed(0),
//             usagePercent: positionCalc.availableUSDC > 0 ? (positionCalc.capitalUsed / positionCalc.availableUSDC * 100).toFixed(1) + '%' : 'N/A',
//             size: positionCalc.size,
//             leverage: positionCalc.leverage,
//             notional: positionCalc.notional.toFixed(0),
//             minTarget: positionCalc.minTarget.toFixed(1),
//             expectedProfit: positionCalc.expectedProfit.toFixed(2),
//             profitPotential: positionCalc.profitPotential,
//             maxRisk: positionCalc.maxRisk.toFixed(2),
//             currentDayLoss: dayState.realizedLoss.toFixed(2),
//             balanceStatus: balanceInfo.needsTransfer ? 'NEEDS_TRANSFER' : 'OK'
//         });

//         // 5️⃣ Build the SDK order params
//         const coin = 'BTC-PERP';
//         const isBuy = slot.signal === 'LONG';
//         const orderParams = {
//             coin,
//             is_buy: isBuy,
//             sz: Number(positionCalc.size),
//             limit_px: price,
//             order_type: { limit: { tif: 'Gtc' as Tif } },
//             reduce_only: false,
//             ...(slot.take_profit != null && { tp: Number(slot.take_profit) }),
//             ...(slot.stop_loss != null && { sl: Number(slot.stop_loss) })
//         };

//         console.log('📤 Placing LARGE order with params:', orderParams);

//         // 6️⃣ Place the order via the Hyperliquid SDK
//         const result = await sdk.exchange.placeOrder(orderParams);
//         console.log('📥 [SDK Response]', JSON.stringify(result, null, 2));

//         if (result.status === 'err') {
//             throw new Error(`SDK order error: ${result.response}`);
//         }

//         // 7️⃣ Track any fills
//         const statuses = result.response.data.statuses ?? [];
//         statuses.forEach((s: { filled: { avgPx: any; totalSz: any; oid: any; }; }) => {
//             if ('filled' in s && s.filled) {
//                 const { avgPx, totalSz, oid } = s.filled;
//                 const pnl = (isBuy ? avgPx - price : price - avgPx) * totalSz;
//                 pushTrade({
//                     id: String(oid),
//                     pnl,
//                     side: slot.signal,
//                     size: totalSz,
//                     avgPrice: avgPx,
//                     leverage: positionCalc.leverage,
//                     timestamp: Date.now()
//                 });
//             }
//         });

//         // 8️⃣ Return comprehensive success response
//         const payload = {
//             success: true,
//             timestamp: new Date().toISOString(),
//             forecastSlot: slot,
//             positionDetails: {
//                 size: positionCalc.size,
//                 leverage: positionCalc.leverage,
//                 notional: positionCalc.notional,
//                 minProfitTarget: positionCalc.minTarget,
//                 expectedProfit: positionCalc.expectedProfit,
//                 profitPotential: positionCalc.profitPotential,
//                 maxRisk: positionCalc.maxRisk,
//                 capitalUsed: positionCalc.capitalUsed,
//                 availableUSDC: positionCalc.availableUSDC,
//                 capitalUsagePercent: (positionCalc.capitalUsed / positionCalc.availableUSDC * 100)
//             },
//             payload: {
//                 asset: 0,
//                 side: slot.signal,
//                 price,
//                 size: positionCalc.size,
//                 leverage: positionCalc.leverage
//             },
//             sdkResponse: result
//         };

//         console.log('📤 [Returning AGGRESSIVE Payload]', JSON.stringify(payload, null, 2));
//         return NextResponse.json(payload);

//     } catch (err: any) {
//         console.error('❌ Cron order error:', err);
//         return NextResponse.json({ error: err.message }, { status: 500 });
//     }
// }

import { NextResponse } from 'next/server';
import { Hyperliquid, Tif } from 'hyperliquid';
import { getDayState, pushTrade } from '@/lib/dayState';

export const runtime = 'nodejs';  // must be Node.js for the SDK

// ——— Enhanced Logging Function ———————————————————————————————————————
function logWithTimestamp(level: 'INFO' | 'ERROR' | 'WARN' | 'SUCCESS', message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const emoji = {
        INFO: '🔍',
        ERROR: '❌',
        WARN: '⚠️',
        SUCCESS: '✅'
    }[level];

    const logMessage = `[${timestamp}] ${emoji} ${message}`;

    if (level === 'ERROR') {
        console.error(logMessage, data ? JSON.stringify(data, null, 2) : '');
    } else {
        console.log(logMessage, data ? JSON.stringify(data, null, 2) : '');
    }

    // Force flush for Vercel
    if (typeof process !== 'undefined' && process.stdout) {
        process.stdout.write('');
    }
}

// ——— SDK Configuration ————————————————————————————————————————————————
const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
const MAIN_WALLET_RAW = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;
const USER_WALLET_RAW = process.env.NEXT_PUBLIC_HL_USER_WALLET;

if (!PK) {
    logWithTimestamp('ERROR', 'HL_PRIVATE_KEY missing in env');
    throw new Error('HL_PRIVATE_KEY missing in env');
}
if (!MAIN_WALLET_RAW) {
    logWithTimestamp('ERROR', 'HL_MAIN_WALLET missing in env');
    throw new Error('HL_MAIN_WALLET missing in env');
}
if (!USER_WALLET_RAW) {
    logWithTimestamp('ERROR', 'USER_WALLET_RAW missing in env');
    throw new Error('USER_WALLET_RAW missing in env');
}

// Create properly typed constants
const MAIN_WALLET: string = MAIN_WALLET_RAW;
const USER_WALLET: string = USER_WALLET_RAW;

const sdk = new Hyperliquid({
    privateKey: PK,
    walletAddress: MAIN_WALLET,
    testnet: false
});

// ——— Dynamic Position Sizing Constants ———————————————————————————————
const LOT_SIZE = 0.00001;
const MIN_ORDER_SIZE = 0.0001;
const MIN_PROFIT_PER_TRADE = 17.5; // MINIMUM profit target (not fixed)
const MAX_LOSS_PER_TRADE = 30;
const DAILY_LOSS_LIMIT = 150;
const CAPITAL_USAGE_PERCENT = 0.90; // Use 90% of available USDC per trade
const MAX_LEVERAGE = 25; // Increased for higher profits
const MIN_LEVERAGE = 5;  // Higher minimum for aggressive targets
const ORDER_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const BTC_ASSET_INDEX = 0; // BTC-PERP asset index

// ——— Helper Functions ————————————————————————————————————————————————
function roundLot(x: number) {
    const lots = Math.max(
        Math.floor(x / LOT_SIZE),
        Math.ceil(MIN_ORDER_SIZE / LOT_SIZE)
    );
    return lots * LOT_SIZE;
}

// ——— Get Open Orders for BTC ————————————————————————————————————————
async function getBTCOpenOrders() {
    try {
        logWithTimestamp('INFO', 'Fetching BTC open orders...');

        const response = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'openOrders',
                user: USER_WALLET
            })
        });

        if (!response.ok) {
            logWithTimestamp('ERROR', `Open orders API error: ${response.status} ${response.statusText}`);
            return [];
        }

        const orders = await response.json();
        logWithTimestamp('INFO', 'All Open Orders received', orders);

        // Filter for BTC orders only
        const btcOrders = orders.filter((order: any) => order.coin === 'BTC');
        logWithTimestamp('INFO', `Found ${btcOrders.length} BTC open orders`, btcOrders);

        return btcOrders;
    } catch (err) {
        logWithTimestamp('ERROR', 'Error fetching open orders', err);
        return [];
    }
}

// ——— Cancel Stale Orders (older than 1 hour) ————————————————————————
async function cancelStaleOrders() {
    try {
        logWithTimestamp('INFO', 'Starting stale order cancellation check...');

        const openOrders = await getBTCOpenOrders();
        const currentTime = Date.now();
        const staleOrders = openOrders.filter((order: any) => {
            const orderAge = currentTime - order.timestamp;
            return orderAge > ORDER_TIMEOUT_MS;
        });

        logWithTimestamp('INFO', `Found ${staleOrders.length} stale orders (older than 1 hour)`);

        if (staleOrders.length === 0) {
            return { success: true, canceledOrders: [] };
        }

        // Prepare cancel requests
        const cancels = staleOrders.map((order: any) => ({
            a: BTC_ASSET_INDEX, // BTC asset index  
            o: order.oid        // order ID
        }));

        logWithTimestamp('INFO', 'Canceling stale orders', cancels);

        // Cancel orders using SDK
        const cancelResult = await sdk.exchange.cancelOrder(cancels);
        logWithTimestamp('INFO', 'Cancel operation result', cancelResult);

        if (cancelResult.status === 'ok') {
            const statuses = cancelResult.response.data.statuses;
            const successfulCancels = statuses.filter((status: any) => status === 'success');

            logWithTimestamp('SUCCESS', `Successfully canceled ${successfulCancels.length}/${staleOrders.length} stale orders`);

            return {
                success: successfulCancels.length > 0,
                canceledOrders: staleOrders,
                cancelResults: statuses
            };
        } else {
            logWithTimestamp('ERROR', 'Cancel request failed', cancelResult);
            return { success: false, error: cancelResult };
        }

    } catch (err) {
        logWithTimestamp('ERROR', 'Error canceling stale orders', err);
        return { success: false, error: err };
    }
}

// ——— Enhanced Position Sizing with Order Timeout Logic ——————————————
async function placeOrderWithTimeout(orderParams: any, expectedProfit: number) {
    try {
        logWithTimestamp('INFO', 'Placing order with timeout protection', orderParams);

        // Place the main order
        const result = await sdk.exchange.placeOrder(orderParams);
        logWithTimestamp('INFO', 'Order placement result received', result);

        if (result.status !== 'ok') {
            throw new Error(`Order placement failed: ${JSON.stringify(result)}`);
        }

        // Extract order ID for timeout tracking
        const statuses = result.response.data.statuses ?? [];
        let placedOrderId = null;

        for (const status of statuses) {
            if ('resting' in status && status.resting) {
                placedOrderId = status.resting.oid;
                logWithTimestamp('INFO', `Order ${placedOrderId} placed and resting`);
                break;
            }
            if ('filled' in status && status.filled) {
                // Order immediately filled, no need for timeout tracking
                const { avgPx, totalSz, oid } = status.filled;
                const pnl = (orderParams.is_buy ? avgPx - orderParams.limit_px : orderParams.limit_px - avgPx) * totalSz;

                logWithTimestamp('SUCCESS', `Order ${oid} immediately filled`, {
                    avgPrice: avgPx,
                    size: totalSz,
                    pnl: pnl
                });

                pushTrade({
                    id: String(oid),
                    pnl,
                    side: orderParams.is_buy ? 'LONG' : 'SHORT',
                    size: totalSz,
                    avgPrice: avgPx,
                    leverage: orderParams.leverage || 1,
                    timestamp: Date.now()
                });
                return { success: true, immediatelyFilled: true, result };
            }
        }

        if (placedOrderId) {
            logWithTimestamp('INFO', `Order ${placedOrderId} placed successfully. Will auto-cancel in 1 hour if not filled.`);

            return {
                success: true,
                orderId: placedOrderId,
                result,
                timeoutScheduled: true
            };
        }

        return { success: true, result };

    } catch (err: any) {
        logWithTimestamp('ERROR', 'Error placing order with timeout', err);
        return { success: false, error: err.message };
    }
}

// ——— Get Real-Time USDC Balance (2025 CORRECT METHOD) ————————————————
async function getAvailableUSDC() {
    try {
        logWithTimestamp('INFO', `Checking wallet: ${USER_WALLET}`);

        // Method 1: CORRECT 2025 API - Direct POST request for perpetuals
        logWithTimestamp('INFO', 'Checking Perpetuals Account (Direct API)...');
        const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'clearinghouseState',
                user: USER_WALLET
            })
        });

        if (!perpResponse.ok) {
            logWithTimestamp('ERROR', `Perpetuals API error: ${perpResponse.status}`);
            return { totalUSDC: 0, availableMargin: 0, error: `Perp API: ${perpResponse.status}` };
        }

        const perpState = await perpResponse.json();
        logWithTimestamp('INFO', 'Perpetuals State received', perpState);

        // Method 2: CORRECT 2025 API - Direct POST request for spot  
        logWithTimestamp('INFO', 'Checking Spot Account (Direct API)...');
        const spotResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'spotClearinghouseState',
                user: USER_WALLET
            })
        });

        if (!spotResponse.ok) {
            logWithTimestamp('WARN', `Spot API error: ${spotResponse.status} (continuing with perp only)`);
        }

        const spotState = spotResponse.ok ? await spotResponse.json() : { balances: [] };
        logWithTimestamp('INFO', 'Spot State received', spotState);

        // Extract balances from responses
        const perpBalance = parseFloat(perpState?.marginSummary?.accountValue || '0');
        const spotBalances = spotState?.balances || [];
        const usdcSpot = spotBalances.find((b: any) => b.coin === 'USDC');
        const spotUSDC = parseFloat(usdcSpot?.total || '0');

        const balanceBreakdown = {
            perpetualsUSDC: perpBalance,
            spotUSDC: spotUSDC,
            totalUSDC: perpBalance + spotUSDC,
            perpWithdrawable: parseFloat(perpState?.withdrawable || '0'),
            spotHold: parseFloat(usdcSpot?.hold || '0')
        };

        logWithTimestamp('INFO', 'Balance Breakdown', balanceBreakdown);

        // Return valid balances
        if (perpBalance > 0) {
            return {
                totalUSDC: perpBalance,
                availableMargin: parseFloat(perpState.withdrawable || perpState.marginSummary.accountValue),
                source: 'perpetuals'
            };
        }

        if (spotUSDC > 0) {
            return {
                totalUSDC: spotUSDC,
                availableMargin: spotUSDC,
                needsTransfer: true,
                spotAmount: spotUSDC,
                source: 'spot'
            };
        }

        // No funds found
        logWithTimestamp('ERROR', 'No USDC found in either account!');
        return { totalUSDC: 0, availableMargin: 0, noFunds: true };

    } catch (err) {
        logWithTimestamp('ERROR', 'API Error in getAvailableUSDC', err);
        return { totalUSDC: 0, availableMargin: 0, error: err };
    }
}

// ——— Aggressive Dynamic Leverage (HIGHER FOR PROFITS) ————————————————
function calculateDynamicLeverage(profit: number, loss: number, confidence?: number) {
    logWithTimestamp('INFO', `Calculating dynamic leverage - Profit: ${profit}, Loss: ${loss}, Confidence: ${confidence}`);

    // VERY aggressive to maximize profit potential
    if (loss >= 120) return 3;   // Emergency brake only
    if (loss >= 80) return 6;    // Heavy caution
    if (profit >= 300 && loss <= 30) return 25; // MAX leverage on hot streak
    if (profit >= 200 && loss <= 50) return 20; // High leverage for good performance  
    if (profit >= 100 && loss <= 40) return 18; // Above average performance
    if (loss <= 40) return 15;   // Normal aggressive mode
    if (loss >= 60) return 10;   // Defensive mode
    return 12; // Default aggressive (increased from 10)
}

// ——— MINIMUM Profit-Target Based Sizing (DYNAMIC UPWARD) ——————————————
function calculateOptimalSize(
    price: number,
    availableUSDC: number,
    currentProfit: number,
    currentLoss: number,
    expectedMovePercent = 2.0 // Slightly higher expected move
) {
    logWithTimestamp('INFO', `Calculating optimal size - Price: ${price}, Available: ${availableUSDC}, Profit: ${currentProfit}, Loss: ${currentLoss}`);

    // MINIMUM profit scaling - increases with performance
    let targetProfit = MIN_PROFIT_PER_TRADE;

    // DYNAMIC UPWARD SCALING based on performance
    if (currentProfit >= 150 && currentLoss <= 30) {
        targetProfit = Math.min(40, targetProfit * 1.8); // Up to $40 on hot streak
    } else if (currentProfit >= 100 && currentLoss <= 50) {
        targetProfit = Math.min(30, targetProfit * 1.5); // Up to $30 when doing well
    } else if (currentProfit >= 50 && currentLoss <= 60) {
        targetProfit = Math.min(25, targetProfit * 1.3); // Scale up moderately
    }

    // Use HIGH percentage of available capital (90%)
    const capitalPerTrade = availableUSDC * CAPITAL_USAGE_PERCENT;

    // Calculate required notional for DYNAMIC profit target
    const requiredNotional = (targetProfit / expectedMovePercent) * 100;

    // Calculate needed leverage for target
    const neededLeverage = Math.min(
        requiredNotional / capitalPerTrade,
        MAX_LEVERAGE
    );

    // But also check what leverage gives us maximum safe size
    const maxSafeLeverage = MAX_LEVERAGE;
    const maxSafeNotional = capitalPerTrade * maxSafeLeverage;

    // Use the HIGHER of: target-based or maximum safe leverage
    const leverage = Math.max(
        Math.max(MIN_LEVERAGE, Math.round(neededLeverage)),
        Math.round(maxSafeNotional / requiredNotional * MIN_LEVERAGE)
    );

    const finalLeverage = Math.min(leverage, MAX_LEVERAGE);
    const notionalValue = capitalPerTrade * finalLeverage;
    const positionSize = notionalValue / price;

    // Calculate ACTUAL expected profit (could be higher than minimum)
    const actualExpectedProfit = (notionalValue * expectedMovePercent) / 100;

    const sizeCalc = {
        capital: capitalPerTrade,
        leverage: finalLeverage,
        notional: notionalValue,
        size: positionSize,
        minTarget: MIN_PROFIT_PER_TRADE,
        dynamicTarget: targetProfit,
        actualExpected: actualExpectedProfit
    };

    logWithTimestamp('INFO', 'Size calculation completed', sizeCalc);

    return {
        size: roundLot(positionSize),
        leverage: finalLeverage,
        notionalValue,
        capitalUsed: capitalPerTrade,
        expectedProfit: actualExpectedProfit, // This can be MUCH higher than minimum
        dynamicTarget: targetProfit,
        maxRisk: Math.min((notionalValue * 2.5) / 100, MAX_LOSS_PER_TRADE) // 2.5% max adverse move
    };
}

// ——— Dynamic Size Calculator (NO UPPER LIMITS) ———————————————————————
async function calcDynamicSize(price: number, signal: string, confidence?: number) {
    logWithTimestamp('INFO', `Calculating dynamic size for ${signal} signal at price ${price}`);

    const balanceInfo = await getAvailableUSDC();
    const availableMargin = balanceInfo.availableMargin || 0;
    const dayState = getDayState();

    logWithTimestamp('INFO', 'Balance Info for Calculation', {
        totalUSDC: balanceInfo.totalUSDC,
        availableMargin: availableMargin,
        needsTransfer: balanceInfo.needsTransfer || false,
        spotAmount: balanceInfo.spotAmount || 0
    });

    // Calculate base leverage from performance
    const baseLeverage = calculateDynamicLeverage(
        Math.max(0, dayState.realizedPnl),
        dayState.realizedLoss,
        confidence
    );

    // Skip calculation if no funds available
    if (availableMargin <= 0) {
        logWithTimestamp('WARN', 'No funds available for calculation');
        return {
            size: MIN_ORDER_SIZE.toFixed(5),
            leverage: MIN_LEVERAGE,
            notional: 0,
            expectedProfit: 0,
            minTarget: MIN_PROFIT_PER_TRADE,
            maxRisk: 0,
            capitalUsed: 0,
            availableUSDC: 0,
            profitPotential: 'NO_FUNDS'
        };
    }

    // Calculate optimal position for MINIMUM profit target (can go higher)
    const optimal = calculateOptimalSize(
        price,
        availableMargin,
        Math.max(0, dayState.realizedPnl),
        dayState.realizedLoss
    );

    // Use the HIGHER leverage for maximum profit potential
    const finalLeverage = Math.max(baseLeverage, optimal.leverage);

    // Recalculate with MAXIMUM leverage between the two
    const capitalPerTrade = availableMargin * CAPITAL_USAGE_PERCENT;
    const finalNotional = capitalPerTrade * finalLeverage;
    const finalSize = finalNotional / price;

    // ACTUAL expected profit (will likely exceed minimum)
    const actualExpectedProfit = (finalNotional * 2.0) / 100; // 2% expected move
    const maxRisk = Math.min((finalNotional * 2.5) / 100, MAX_LOSS_PER_TRADE);

    const finalResult = {
        size: roundLot(finalSize).toFixed(5),
        leverage: finalLeverage,
        notional: finalNotional,
        expectedProfit: actualExpectedProfit,
        minTarget: MIN_PROFIT_PER_TRADE,
        maxRisk,
        capitalUsed: capitalPerTrade,
        availableUSDC: availableMargin,
        profitPotential: actualExpectedProfit >= MIN_PROFIT_PER_TRADE ? 'TARGET_EXCEEDED' : 'MINIMUM_MET'
    };

    logWithTimestamp('SUCCESS', 'Dynamic size calculation completed', finalResult);

    return finalResult;
}

// ——— Main Cron Handler ————————————————————————————————————————————————
export async function GET() {
    const startTime = Date.now();
    logWithTimestamp('INFO', '🚀 Starting enhanced trading bot with order management...');

    try {
        // 1️⃣ FIRST: Cancel any stale orders (older than 1 hour)
        logWithTimestamp('INFO', '🕐 Step 1: Checking for stale orders...');
        const cancelResult = await cancelStaleOrders();

        if (!cancelResult.success && cancelResult.error) {
            logWithTimestamp('WARN', 'Failed to cancel some stale orders, but continuing...', cancelResult.error);
        } else if (cancelResult.canceledOrders && cancelResult.canceledOrders.length > 0) {
            logWithTimestamp('SUCCESS', `Successfully handled ${cancelResult.canceledOrders.length} stale orders`);
        }

        // 2️⃣ Check if we have any remaining open orders - if so, don't place new ones
        const remainingOrders = await getBTCOpenOrders();
        if (remainingOrders.length > 0) {
            logWithTimestamp('INFO', `⏳ Still have ${remainingOrders.length} open BTC orders. Skipping new order placement.`);
            return NextResponse.json({
                message: 'Skipped: Still have open orders',
                openOrders: remainingOrders.length,
                canceledStaleOrders: cancelResult.canceledOrders?.length || 0,
                executionTime: Date.now() - startTime
            });
        }

        // 3️⃣ Fetch the forecast directly from your Python backend
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (!apiKey) {
            logWithTimestamp('ERROR', 'NEXT_PUBLIC_API_KEY not defined');
            return NextResponse.json(
                { error: 'NEXT_PUBLIC_API_KEY not defined' },
                { status: 500 }
            );
        }

        logWithTimestamp('INFO', 'Fetching forecast from API...');
        const forecastRes = await fetch('https://zynapse.zkagi.ai/today', {
            method: 'GET',
            cache: 'no-store',
            headers: {
                accept: 'application/json',
                'api-key': apiKey
            }
        });

        if (!forecastRes.ok) {
            const txt = await forecastRes.text();
            logWithTimestamp('ERROR', `Forecast API error (${forecastRes.status})`, txt);
            return NextResponse.json(
                { error: `Forecast API error (${forecastRes.status})` },
                { status: forecastRes.status }
            );
        }

        const forecastData = await forecastRes.json();
        const { forecast_today_hourly } = forecastData;

        // 4️⃣ Pick the latest hourly slot
        const slot = Array.isArray(forecast_today_hourly) && forecast_today_hourly.length > 0
            ? forecast_today_hourly[forecast_today_hourly.length - 1]
            : null;

        logWithTimestamp('INFO', 'Forecast Response received', slot);

        if (
            !slot ||
            slot.signal === 'HOLD' ||
            slot.forecast_price == null ||
            typeof slot.signal !== 'string'
        ) {
            logWithTimestamp('WARN', '⚠️ No valid trade signal. Skipping.');
            return NextResponse.json({
                message: 'No trade signal',
                canceledStaleOrders: cancelResult.canceledOrders?.length || 0,
                executionTime: Date.now() - startTime
            });
        }

        // 5️⃣ Check daily loss limit BEFORE sizing
        const dayState = getDayState();
        if (dayState.realizedLoss >= DAILY_LOSS_LIMIT) {
            logWithTimestamp('ERROR', `🛑 Daily loss limit reached ($${DAILY_LOSS_LIMIT}). Stopping trades.`);
            return NextResponse.json({
                message: `Daily loss limit reached: $${dayState.realizedLoss}`,
                canceledStaleOrders: cancelResult.canceledOrders?.length || 0,
                executionTime: Date.now() - startTime
            });
        }

        // 6️⃣ AGGRESSIVE Dynamic position sizing (NO UPPER LIMITS)
        const price = Math.round(slot.forecast_price);
        logWithTimestamp('INFO', `Processing signal: ${slot.signal} at price: ${price}`);

        const balanceInfo = await getAvailableUSDC();

        // Handle special cases
        if (balanceInfo.noFunds) {
            logWithTimestamp('ERROR', '❌ No USDC found in any account. Please deposit funds.');
            return NextResponse.json({
                error: 'No USDC balance found. Please deposit funds to your Hyperliquid account.',
                balanceInfo,
                canceledStaleOrders: cancelResult.canceledOrders?.length || 0,
                executionTime: Date.now() - startTime
            });
        }

        if (balanceInfo.needsTransfer && balanceInfo.spotAmount && balanceInfo.spotAmount > 0) {
            logWithTimestamp('INFO', `💸 Auto-transferring ${balanceInfo.spotAmount} USDC from Spot to Perpetuals...`);
            try {
                const transferResult = await sdk.exchange.transferBetweenSpotAndPerp(
                    balanceInfo.spotAmount,
                    true // true = spot to perp
                );
                logWithTimestamp('SUCCESS', 'Transfer successful', transferResult);

                // Re-fetch balance after transfer
                const updatedBalance = await getAvailableUSDC();
                logWithTimestamp('INFO', 'Updated balance after transfer', updatedBalance);
            } catch (transferErr) {
                logWithTimestamp('ERROR', 'Auto-transfer failed', transferErr);
                return NextResponse.json({
                    error: `Auto-transfer failed: ${transferErr}. Please manually transfer USDC from Spot to Perpetuals.`,
                    spotAmount: balanceInfo.spotAmount,
                    canceledStaleOrders: cancelResult.canceledOrders?.length || 0,
                    executionTime: Date.now() - startTime
                });
            }
        }

        // Recalculate position after any transfers
        const positionCalc = await calcDynamicSize(price, slot.signal, slot.confidence_90?.[1]);

        // Final check: ensure we have enough funds to trade
        if (positionCalc.availableUSDC < 10) { // Need at least $10 to trade meaningfully
            logWithTimestamp('ERROR', `❌ Insufficient funds for trading: Only ${positionCalc.availableUSDC} available`);
            return NextResponse.json({
                error: `Insufficient funds: Only ${positionCalc.availableUSDC} available. Need at least $10.`,
                positionCalc,
                canceledStaleOrders: cancelResult.canceledOrders?.length || 0,
                executionTime: Date.now() - startTime
            });
        }

        const positionSummary = {
            availableUSDC: positionCalc.availableUSDC.toFixed(0),
            capitalUsed: positionCalc.capitalUsed.toFixed(0),
            usagePercent: positionCalc.availableUSDC > 0 ? (positionCalc.capitalUsed / positionCalc.availableUSDC * 100).toFixed(1) + '%' : 'N/A',
            size: positionCalc.size,
            leverage: positionCalc.leverage,
            notional: positionCalc.notional.toFixed(0),
            minTarget: positionCalc.minTarget.toFixed(1),
            expectedProfit: positionCalc.expectedProfit.toFixed(2),
            profitPotential: positionCalc.profitPotential,
            maxRisk: positionCalc.maxRisk.toFixed(2),
            currentDayLoss: dayState.realizedLoss.toFixed(2),
            balanceStatus: balanceInfo.needsTransfer ? 'NEEDS_TRANSFER' : 'OK'
        };

        logWithTimestamp('SUCCESS', '🚀 AGGRESSIVE Position Calculation', positionSummary);

        // 7️⃣ Build the SDK order params with timeout protection
        const coin = 'BTC-PERP';
        const isBuy = slot.signal === 'LONG';
        const orderParams = {
            coin,
            is_buy: isBuy,
            sz: Number(positionCalc.size),
            limit_px: price,
            order_type: { limit: { tif: 'Gtc' as Tif } },
            reduce_only: false,
            ...(slot.take_profit != null && { tp: Number(slot.take_profit) }),
            ...(slot.stop_loss != null && { sl: Number(slot.stop_loss) })
        };

        logWithTimestamp('INFO', '📤 Placing LARGE order with timeout protection', orderParams);

        // 8️⃣ Place the order with timeout management
        const orderResult = await placeOrderWithTimeout(orderParams, positionCalc.expectedProfit);

        if (!orderResult.success) {
            logWithTimestamp('ERROR', '❌ Failed to place order', orderResult.error);
            return NextResponse.json({
                error: `Failed to place order: ${orderResult.error}`,
                canceledStaleOrders: cancelResult.canceledOrders?.length || 0,
                executionTime: Date.now() - startTime
            }, { status: 500 });
        }

        // 9️⃣ Return comprehensive success response
        const payload = {
            success: true,
            timestamp: new Date().toISOString(),
            executionTime: Date.now() - startTime,
            orderManagement: {
                canceledStaleOrders: cancelResult.canceledOrders?.length || 0,
                orderTimeoutEnabled: true,
                orderTimeoutMs: ORDER_TIMEOUT_MS
            },
            forecastSlot: slot,
            positionDetails: {
                size: positionCalc.size,
                leverage: positionCalc.leverage,
                notional: positionCalc.notional,
                minProfitTarget: positionCalc.minTarget,
                expectedProfit: positionCalc.expectedProfit,
                profitPotential: positionCalc.profitPotential,
                maxRisk: positionCalc.maxRisk,
                capitalUsed: positionCalc.capitalUsed,
                availableUSDC: positionCalc.availableUSDC,
                capitalUsagePercent: (positionCalc.capitalUsed / positionCalc.availableUSDC * 100)
            },
            orderResult: {
                orderId: orderResult.orderId,
                immediatelyFilled: orderResult.immediatelyFilled || false,
                timeoutScheduled: orderResult.timeoutScheduled || false
            },
            payload: {
                asset: 0,
                side: slot.signal,
                price,
                size: positionCalc.size,
                leverage: positionCalc.leverage
            },
            sdkResponse: orderResult.result
        };

        logWithTimestamp('SUCCESS', '📤 Returning ENHANCED Payload', payload);

        // Force final log flush
        if (typeof process !== 'undefined' && process.stdout) {
            process.stdout.write('\n');
        }

        return NextResponse.json(payload);

    } catch (err: any) {
        const errorDetails = {
            message: err.message,
            stack: err.stack,
            name: err.name,
            executionTime: Date.now() - startTime
        };

        logWithTimestamp('ERROR', '❌ Enhanced cron order error', errorDetails);

        // Force error log flush
        if (typeof process !== 'undefined' && process.stderr) {
            process.stderr.write('\n');
        }

        return NextResponse.json({
            error: err.message,
            details: errorDetails
        }, { status: 500 });
    }
}