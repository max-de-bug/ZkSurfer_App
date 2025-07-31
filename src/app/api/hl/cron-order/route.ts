

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

// pages/api/hl/cron-order.ts
import { NextResponse } from 'next/server';
import { Hyperliquid, Tif } from 'hyperliquid';
import { getDayState, pushTrade } from '@/lib/dayState';

export const runtime = 'nodejs';  // must be Node.js for the SDK

// ——— SDK Configuration ————————————————————————————————————————————————
const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
const MAIN_WALLET_RAW = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;
if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
if (!MAIN_WALLET_RAW) throw new Error('HL_MAIN_WALLET missing in env');

// Create properly typed constants
const MAIN_WALLET: string = MAIN_WALLET_RAW;

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

// ——— Helper Functions ————————————————————————————————————————————————
function roundLot(x: number) {
    const lots = Math.max(
        Math.floor(x / LOT_SIZE),
        Math.ceil(MIN_ORDER_SIZE / LOT_SIZE)
    );
    return lots * LOT_SIZE;
}

// ——— Get Real-Time USDC Balance (2025 CORRECT METHOD) ————————————————
async function getAvailableUSDC() {
    try {
        console.log('🔍 Checking wallet:', MAIN_WALLET);

        // Method 1: CORRECT 2025 API - Direct POST request for perpetuals
        console.log('📊 Checking Perpetuals Account (Direct API)...');
        const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'clearinghouseState',
                user: MAIN_WALLET
            })
        });

        const perpState = await perpResponse.json();
        console.log('🏦 Perpetuals State:', JSON.stringify(perpState, null, 2));

        // Method 2: CORRECT 2025 API - Direct POST request for spot  
        console.log('💱 Checking Spot Account (Direct API)...');
        const spotResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'spotClearinghouseState',
                user: MAIN_WALLET
            })
        });

        const spotState = await spotResponse.json();
        console.log('🏪 Spot State:', JSON.stringify(spotState, null, 2));

        // Extract balances from responses
        const perpBalance = parseFloat(perpState?.marginSummary?.accountValue || '0');
        const spotBalances = spotState?.balances || [];
        const usdcSpot = spotBalances.find((b: any) => b.coin === 'USDC');
        const spotUSDC = parseFloat(usdcSpot?.total || '0');

        console.log('💰 Balance Breakdown:', {
            perpetualsUSDC: perpBalance,
            spotUSDC: spotUSDC,
            totalUSDC: perpBalance + spotUSDC,
            perpWithdrawable: parseFloat(perpState?.withdrawable || '0'),
            spotHold: parseFloat(usdcSpot?.hold || '0')
        });

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
        console.error('❌ No USDC found in either account!');
        return { totalUSDC: 0, availableMargin: 0, noFunds: true };

    } catch (err) {
        console.error('❌ API Error:', err);
        return { totalUSDC: 0, availableMargin: 0, error: err };
    }
}

// ——— Auto-Close Old Positions Function ——————————————————————————————
async function closeOldPositions() {
    try {
        console.log('🕐 Checking for positions older than 1 hour...');

        // Get current positions
        const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'clearinghouseState',
                user: MAIN_WALLET
            })
        });

        const perpState = await perpResponse.json();
        const positions = perpState?.assetPositions || [];

        if (positions.length === 0) {
            console.log('✅ No open positions to check');
            return { closedPositions: 0, freedMargin: 0 };
        }

        console.log(`📊 Found ${positions.length} open positions`);

        const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour ago
        let closedPositions = 0;
        let freedMargin = 0;

        // Get user fills to determine position age
        const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'userFills',
                user: MAIN_WALLET
            })
        });

        const fills = await fillsResponse.json();

        for (const position of positions) {
            const coin = position.position.coin;
            const size = parseFloat(position.position.szi);
            const marginUsed = parseFloat(position.position.marginUsed);

            // Find the most recent fill for this coin to determine position age
            const coinFills = fills.filter((fill: any) => fill.coin === coin);
            const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

            if (!latestFill) {
                console.log(`⚠️ No fills found for ${coin}, skipping...`);
                continue;
            }

            const positionAge = Date.now() - latestFill.time;
            const ageHours = positionAge / (60 * 60 * 1000);

            console.log(`📊 ${coin} position: ${size} | Age: ${ageHours.toFixed(2)}h | Margin: ${marginUsed}`);

            // Close positions older than 1 hour
            if (positionAge > (60 * 60 * 1000)) {
                console.log(`🔴 Closing ${coin} position (${ageHours.toFixed(2)}h old)`);

                try {
                    // Determine order side (opposite of position)
                    const isBuy = size < 0; // If short position, buy to close
                    const absSize = Math.abs(size);

                    // Get current market price for market order
                    const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'allMids'
                        })
                    });

                    const allMids = await priceResponse.json();
                    const coinPrice = allMids[`${coin}-PERP`];

                    if (!coinPrice) {
                        console.error(`❌ No price found for ${coin}`);
                        continue;
                    }

                    // Place market order to close position
                    const closeOrderParams = {
                        coin: `${coin}-PERP`,
                        is_buy: isBuy,
                        sz: absSize,
                        limit_px: isBuy ? coinPrice * 1.005 : coinPrice * 0.995, // 0.5% slippage
                        order_type: { limit: { tif: 'Ioc' as Tif } }, // Immediate or Cancel (market-like)
                        reduce_only: true // Important: only close existing position
                    };

                    console.log(`📤 Closing ${coin} position with params:`, closeOrderParams);

                    const closeResult = await sdk.exchange.placeOrder(closeOrderParams);

                    if (closeResult.status === 'ok') {
                        console.log(`✅ Successfully closed ${coin} position`);
                        closedPositions++;
                        freedMargin += marginUsed;

                        // Track the close in day state
                        const statuses = closeResult.response.data.statuses ?? [];
                        statuses.forEach((s: any) => {
                            if ('filled' in s && s.filled) {
                                const { avgPx, totalSz, oid } = s.filled;
                                const pnl = isBuy ?
                                    (latestFill.px - avgPx) * totalSz :
                                    (avgPx - latestFill.px) * totalSz;

                                pushTrade({
                                    id: String(oid),
                                    pnl,
                                    side: 'CLOSE',
                                    size: totalSz,
                                    avgPrice: avgPx,
                                    leverage: position.position.leverage.value,
                                    timestamp: Date.now()
                                });
                            }
                        });
                    } else {
                        console.error(`❌ Failed to close ${coin} position:`, closeResult);
                    }

                } catch (closeError) {
                    console.error(`❌ Error closing ${coin} position:`, closeError);
                }

                // Wait between closes to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        if (closedPositions > 0) {
            console.log(`✅ Closed ${closedPositions} old positions, freed ${freedMargin.toFixed(2)} margin`);
        }

        return { closedPositions, freedMargin };

    } catch (error) {
        console.error('❌ Error checking/closing old positions:', error);
        return { closedPositions: 0, freedMargin: 0, error: error };
    }
}
function calculateDynamicLeverage(profit: number, loss: number, confidence?: number) {
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

    console.log(`💰 Capital: $${capitalPerTrade.toFixed(0)}, Leverage: ${finalLeverage}x`);
    console.log(`📊 Notional: $${notionalValue.toFixed(0)}, Size: ${positionSize.toFixed(5)}`);
    console.log(`🎯 MIN Target: $${MIN_PROFIT_PER_TRADE}, DYNAMIC Target: $${targetProfit.toFixed(1)}, ACTUAL Expected: $${actualExpectedProfit.toFixed(1)}`);

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
    const balanceInfo = await getAvailableUSDC();
    const availableMargin = balanceInfo.availableMargin || 0;
    const dayState = getDayState();

    console.log('💰 Balance Info for Calculation:', {
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

    return {
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
}

// ——— Main Cron Handler ————————————————————————————————————————————————
export async function GET() {
    try {
        // 🕐 STEP 1: Close old positions BEFORE anything else
        console.log('🕐 Step 1: Auto-closing positions older than 1 hour...');
        const closeResult = await closeOldPositions();

        if (closeResult.error) {
            console.warn('⚠️ Error closing old positions:', closeResult.error);
        } else if (closeResult.closedPositions > 0) {
            console.log(`✅ Freed ${closeResult.freedMargin.toFixed(2)} by closing ${closeResult.closedPositions} old positions`);

            // Wait for balance to update after closes
            console.log('⏳ Waiting for balance to update...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // 1️⃣ Fetch the forecast directly from your Python backend
        const apiKey = process.env.NEXT_PUBLIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'NEXT_PUBLIC_API_KEY not defined' },
                { status: 500 }
            );
        }

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
            console.error('Forecast API error:', txt);
            return NextResponse.json(
                { error: `Forecast API error (${forecastRes.status})` },
                { status: forecastRes.status }
            );
        }

        const { forecast_today_hourly } = await forecastRes.json();

        // 2️⃣ Pick the latest hourly slot
        const slot = Array.isArray(forecast_today_hourly) && forecast_today_hourly.length > 0
            ? forecast_today_hourly[forecast_today_hourly.length - 1]
            : null;
        console.log('📊 [Forecast Response]', JSON.stringify(slot, null, 2));

        if (
            !slot ||
            slot.signal === 'HOLD' ||
            slot.forecast_price == null ||
            typeof slot.signal !== 'string'
        ) {
            console.warn('⚠️ No valid trade signal. Skipping.');
            return NextResponse.json({ message: 'No trade signal' });
        }

        // 3️⃣ Check daily loss limit BEFORE sizing
        const dayState = getDayState();
        if (dayState.realizedLoss >= DAILY_LOSS_LIMIT) {
            console.log(`🛑 Daily loss limit reached (${DAILY_LOSS_LIMIT}). Stopping trades.`);
            return NextResponse.json({
                message: `Daily loss limit reached: ${dayState.realizedLoss}`,
                oldPositionsClosed: closeResult.closedPositions,
                marginFreed: closeResult.freedMargin
            });
        }

        // 4️⃣ AGGRESSIVE Dynamic position sizing (NO UPPER LIMITS)
        const price = Math.round(slot.forecast_price);
        const balanceInfo = await getAvailableUSDC();

        // Handle special cases
        if (balanceInfo.noFunds) {
            console.error('❌ No USDC found in any account. Please deposit funds.');
            return NextResponse.json({
                error: 'No USDC balance found. Please deposit funds to your Hyperliquid account.',
                balanceInfo
            });
        }

        if (balanceInfo.needsTransfer && balanceInfo.spotAmount && balanceInfo.spotAmount > 0) {
            console.log(`💸 Auto-transferring ${balanceInfo.spotAmount} USDC from Spot to Perpetuals...`);
            try {
                const transferResult = await sdk.exchange.transferBetweenSpotAndPerp(
                    balanceInfo.spotAmount,
                    true // true = spot to perp
                );
                console.log('✅ Transfer successful:', transferResult);

                // Re-fetch balance after transfer
                const updatedBalance = await getAvailableUSDC();
                console.log('🔄 Updated balance after transfer:', updatedBalance);
            } catch (transferErr) {
                console.error('❌ Auto-transfer failed:', transferErr);
                return NextResponse.json({
                    error: `Auto-transfer failed: ${transferErr}. Please manually transfer USDC from Spot to Perpetuals.`,
                    spotAmount: balanceInfo.spotAmount
                });
            }
        }

        // Recalculate position after any transfers
        const positionCalc = await calcDynamicSize(price, slot.signal, slot.confidence_90?.[1]);

        // Final check: ensure we have enough funds to trade
        if (positionCalc.availableUSDC < 10) { // Need at least $10 to trade meaningfully
            console.error('❌ Insufficient funds for trading after all checks.');
            return NextResponse.json({
                error: `Insufficient funds: Only ${positionCalc.availableUSDC} available. Need at least $10.`,
                positionCalc
            });
        }

        console.log('🚀 AGGRESSIVE Position Calculation:', {
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
        });

        // 5️⃣ Build the SDK order params
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

        console.log('📤 Placing LARGE order with params:', orderParams);

        // 6️⃣ Place the order via the Hyperliquid SDK
        const result = await sdk.exchange.placeOrder(orderParams);
        console.log('📥 [SDK Response]', JSON.stringify(result, null, 2));

        if (result.status === 'err') {
            throw new Error(`SDK order error: ${result.response}`);
        }

        // 7️⃣ Track any fills
        const statuses = result.response.data.statuses ?? [];
        statuses.forEach((s: { filled: { avgPx: any; totalSz: any; oid: any; }; }) => {
            if ('filled' in s && s.filled) {
                const { avgPx, totalSz, oid } = s.filled;
                const pnl = (isBuy ? avgPx - price : price - avgPx) * totalSz;
                pushTrade({
                    id: String(oid),
                    pnl,
                    side: slot.signal,
                    size: totalSz,
                    avgPrice: avgPx,
                    leverage: positionCalc.leverage,
                    timestamp: Date.now()
                });
            }
        });

        // 8️⃣ Return comprehensive success response
        const payload = {
            success: true,
            timestamp: new Date().toISOString(),
            oldPositionsClosed: closeResult.closedPositions,
            marginFreed: closeResult.freedMargin,
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
            payload: {
                asset: 0,
                side: slot.signal,
                price,
                size: positionCalc.size,
                leverage: positionCalc.leverage
            },
            sdkResponse: result
        };

        console.log('📤 [Returning AGGRESSIVE Payload]', JSON.stringify(payload, null, 2));
        return NextResponse.json(payload);

    } catch (err: any) {
        console.error('❌ Cron order error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}