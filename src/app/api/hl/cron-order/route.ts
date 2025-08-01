

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
//         console.log('🔍 Checking wallet:', MAIN_WALLET);

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

// // ——— Auto-Close Old Positions Function ——————————————————————————————
// async function closeOldPositions() {
//     try {
//         console.log('🕐 Checking for positions older than 1 hour...');

//         // Get current positions
//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });


//         const perpState = await perpResponse.json();
//         const positions = perpState?.assetPositions || [];

//         if (positions.length === 0) {
//             console.log('✅ No open positions to check');
//             return { closedPositions: 0, freedMargin: 0 };
//         }

//         console.log(`📊 Found ${positions.length} open positions`);

//         const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour ago
//         let closedPositions = 0;
//         let freedMargin = 0;

//         // Get user fills to determine position age
//         const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'userFills',
//                 user: USER_WALLET
//             })
//         });

//         const fills = await fillsResponse.json();

//         for (const position of positions) {
//             const coin = position.position.coin;
//             const size = parseFloat(position.position.szi);
//             const marginUsed = parseFloat(position.position.marginUsed);

//             // Find the most recent fill for this coin to determine position age
//             const coinFills = fills.filter((fill: any) => fill.coin === coin);
//             const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

//             if (!latestFill) {
//                 console.log(`⚠️ No fills found for ${coin}, skipping...`);
//                 continue;
//             }

//             const positionAge = Date.now() - latestFill.time;
//             const ageHours = positionAge / (60 * 60 * 1000);

//             console.log(`📊 ${coin} position: ${size} | Age: ${ageHours.toFixed(2)}h | Margin: ${marginUsed}`);

//             // Close positions older than 1 hour
//             if (positionAge > (60 * 60 * 1000)) {
//                 console.log(`🔴 Closing ${coin} position (${ageHours.toFixed(2)}h old)`);

//                 try {
//                     // Determine order side (opposite of position)
//                     const isBuy = size < 0; // If short position, buy to close
//                     const absSize = Math.abs(size);

//                     // Get current market price for market order
//                     const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({
//                             type: 'allMids'
//                         })
//                     });

//                     const allMids = await priceResponse.json();
//                     const coinPrice = allMids[`${coin}`];

//                     if (!coinPrice) {
//                         console.error(`❌ No price found for ${coin}`);
//                         continue;
//                     }

//                     // Place market order to close position
//                     const closeOrderParams = {
//                         coin: `${coin}-PERP`,
//                         is_buy: isBuy,
//                         sz: absSize,
//                         limit_px: isBuy ? coinPrice * 1.005 : coinPrice * 0.995, // 0.5% slippage
//                         order_type: { limit: { tif: 'Ioc' as Tif } }, // Immediate or Cancel (market-like)
//                         reduce_only: true // Important: only close existing position
//                     };

//                     console.log(`📤 Closing ${coin} position with params:`, closeOrderParams);

//                     const closeResult = await sdk.exchange.placeOrder(closeOrderParams);

//                     if (closeResult.status === 'ok') {
//                         console.log(`✅ Successfully closed ${coin} position`);
//                         closedPositions++;
//                         freedMargin += marginUsed;

//                         // Track the close in day state
//                         const statuses = closeResult.response.data.statuses ?? [];
//                         statuses.forEach((s: any) => {
//                             if ('filled' in s && s.filled) {
//                                 const { avgPx, totalSz, oid } = s.filled;
//                                 const pnl = isBuy ?
//                                     (latestFill.px - avgPx) * totalSz :
//                                     (avgPx - latestFill.px) * totalSz;

//                                 pushTrade({
//                                     id: String(oid),
//                                     pnl,
//                                     side: 'CLOSE',
//                                     size: totalSz,
//                                     avgPrice: avgPx,
//                                     leverage: position.position.leverage.value,
//                                     timestamp: Date.now()
//                                 });
//                             }
//                         });
//                     } else {
//                         console.error(`❌ Failed to close ${coin} position:`, closeResult);
//                     }

//                 } catch (closeError) {
//                     console.error(`❌ Error closing ${coin} position:`, closeError);
//                 }

//                 // Wait between closes to avoid rate limits
//                 await new Promise(resolve => setTimeout(resolve, 1000));
//             }
//         }

//         if (closedPositions > 0) {
//             console.log(`✅ Closed ${closedPositions} old positions, freed ${freedMargin.toFixed(2)} margin`);
//         }

//         return { closedPositions, freedMargin };

//     } catch (error) {
//         console.error('❌ Error checking/closing old positions:', error);
//         return { closedPositions: 0, freedMargin: 0, error: error };
//     }
// }
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
//         // 🕐 STEP 1: Close old positions BEFORE anything else
//         console.log('🕐 Step 1: Auto-closing positions older than 1 hour...');
//         const closeResult = await closeOldPositions();

//         if (closeResult.error) {
//             console.warn('⚠️ Error closing old positions:', closeResult.error);
//         } else if (closeResult.closedPositions > 0) {
//             console.log(`✅ Freed ${closeResult.freedMargin.toFixed(2)} by closing ${closeResult.closedPositions} old positions`);

//             // Wait for balance to update after closes
//             console.log('⏳ Waiting for balance to update...');
//             await new Promise(resolve => setTimeout(resolve, 3000));
//         }

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
//             console.log(`🛑 Daily loss limit reached (${DAILY_LOSS_LIMIT}). Stopping trades.`);
//             return NextResponse.json({
//                 message: `Daily loss limit reached: ${dayState.realizedLoss}`,
//                 oldPositionsClosed: closeResult.closedPositions,
//                 marginFreed: closeResult.freedMargin
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
//             oldPositionsClosed: closeResult.closedPositions,
//             marginFreed: closeResult.freedMargin,
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

// // ——— Auto-Close Old Positions Function ——————————————————————————————
// async function closeOldPositions() {
//     try {
//         console.log('🕐 Checking for positions older than 1 hour...');

//         // Get current positions
//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
//         const positions = perpState?.assetPositions || [];

//         if (positions.length === 0) {
//             console.log('✅ No open positions to check');
//             return { closedPositions: 0, freedMargin: 0 };
//         }

//         console.log(`📊 Found ${positions.length} open positions`);

//         const oneHourAgo = Date.now() - (60 * 60 * 1000); // 1 hour ago
//         let closedPositions = 0;
//         let freedMargin = 0;

//         // Get user fills to determine position age
//         const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'userFills',
//                 user: USER_WALLET
//             })
//         });

//         const fills = await fillsResponse.json();

//         for (const position of positions) {
//             const coin = position.position.coin;
//             const size = parseFloat(position.position.szi);
//             const marginUsed = parseFloat(position.position.marginUsed);

//             // Find the most recent fill for this coin to determine position age
//             const coinFills = fills.filter((fill: any) => fill.coin === coin);
//             const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

//             if (!latestFill) {
//                 console.log(`⚠️ No fills found for ${coin}, skipping...`);
//                 continue;
//             }

//             const positionAge = Date.now() - latestFill.time;
//             const ageHours = positionAge / (60 * 60 * 1000);

//             console.log(`📊 ${coin} position: ${size} | Age: ${ageHours.toFixed(2)}h | Margin: ${marginUsed}`);

//             // Close positions older than 1 hour
//             if (positionAge > (60 * 60 * 1000)) {
//                 console.log(`🔴 Closing ${coin} position (${ageHours.toFixed(2)}h old)`);

//                 try {
//                     // Determine order side (opposite of position)
//                     const isBuy = size < 0; // If short position, buy to close
//                     const absSize = Math.abs(size);

//                     // Get current market price for market order
//                     const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
//                         method: 'POST',
//                         headers: { 'Content-Type': 'application/json' },
//                         body: JSON.stringify({
//                             type: 'allMids'
//                         })
//                     });

//                     const allMids = await priceResponse.json();
//                     const coinPrice = allMids[`${coin}`];

//                     if (!coinPrice) {
//                         console.error(`❌ No price found for ${coin}`);
//                         continue;
//                     }

//                     // Place market order to close position
//                     const closeOrderParams = {
//                         coin: `${coin}-PERP`,
//                         is_buy: isBuy,
//                         sz: absSize,
//                         limit_px: isBuy ? coinPrice * 1.005 : coinPrice * 0.995, // 0.5% slippage
//                         order_type: { limit: { tif: 'Ioc' as Tif } }, // Immediate or Cancel (market-like)
//                         reduce_only: true // Important: only close existing position
//                     };

//                     console.log(`📤 Closing ${coin} position with params:`, closeOrderParams);

//                     const closeResult = await sdk.exchange.placeOrder(closeOrderParams);
//                     console.log('Close order result:', closeResult);

//                     if (closeResult.status === 'ok') {
//                         console.log(`✅ Successfully closed ${coin} position`);
//                         closedPositions++;
//                         freedMargin += marginUsed;

//                         // Track the close in day state
//                         const statuses = closeResult.response.data.statuses ?? [];
//                         statuses.forEach((s: any) => {
//                             if ('filled' in s && s.filled) {
//                                 const { avgPx, totalSz, oid } = s.filled;
//                                 const pnl = isBuy ?
//                                     (latestFill.px - avgPx) * totalSz :
//                                     (avgPx - latestFill.px) * totalSz;

//                                 pushTrade({
//                                     id: String(oid),
//                                     pnl,
//                                     side: 'CLOSE',
//                                     size: totalSz,
//                                     avgPrice: avgPx,
//                                     leverage: position.position.leverage.value,
//                                     timestamp: Date.now()
//                                 });
//                             }
//                         });
//                     } else {
//                         console.error(`❌ Failed to close ${coin} position:`, closeResult);
//                     }

//                 } catch (closeError) {
//                     console.error(`❌ Error closing ${coin} position:`, closeError);
//                 }

//                 // Wait between closes to avoid rate limits
//                 await new Promise(resolve => setTimeout(resolve, 1000));
//             }
//         }

//         if (closedPositions > 0) {
//             console.log(`✅ Closed ${closedPositions} old positions, freed ${freedMargin.toFixed(2)} margin`);
//         }

//         return { closedPositions, freedMargin };

//     } catch (error) {
//         console.error('❌ Error checking/closing old positions:', error);
//         return { closedPositions: 0, freedMargin: 0, error: error };
//     }
// }

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
//         // 🕐 STEP 1: Close old positions BEFORE anything else
//         console.log('🕐 Step 1: Auto-closing positions older than 1 hour...');
//         const closeResult = await closeOldPositions();

//         if (closeResult.error) {
//             console.warn('⚠️ Error closing old positions:', closeResult.error);
//         } else if (closeResult.closedPositions > 0) {
//             console.log(`✅ Freed ${closeResult.freedMargin.toFixed(2)} by closing ${closeResult.closedPositions} old positions`);

//             // Wait for balance to update after closes
//             console.log('⏳ Waiting for balance to update...');
//             await new Promise(resolve => setTimeout(resolve, 3000));
//         }

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
//             console.log(`🛑 Daily loss limit reached (${DAILY_LOSS_LIMIT}). Stopping trades.`);
//             return NextResponse.json({
//                 message: `Daily loss limit reached: ${dayState.realizedLoss}`,
//                 oldPositionsClosed: closeResult.closedPositions,
//                 marginFreed: closeResult.freedMargin
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
//             oldPositionsClosed: closeResult.closedPositions,
//             marginFreed: closeResult.freedMargin,
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
// const DAILY_LOSS_LIMIT = 250;
// const CAPITAL_USAGE_PERCENT = 0.30; // Use 90% of available USDC per trade
// const MAX_LEVERAGE = 25; // Increased for higher profits
// const MIN_LEVERAGE = 5;  // Higher minimum for aggressive targets

// // ——— PROFIT TAKING & STOP LOSS CONSTANTS ————————————————————————————————————————
// const PROFIT_TAKING_THRESHOLD = 15; // Take profits at $15+ per position
// const QUICK_PROFIT_THRESHOLD = 25;  // Take quick profits at $25+
// const MAX_POSITION_AGE_MINUTES = 30; // Close profitable positions after 30 minutes

// // ——— STOP LOSS CONSTANTS ————————————————————————————————————————
// const INDIVIDUAL_STOP_LOSS = -30;    // Close individual positions at -$30 loss
// const EMERGENCY_STOP_LOSS = -50;     // Emergency close at -$50 loss  
// const DAILY_TOTAL_STOP_LOSS = -250;  // Close ALL positions if daily loss hits -$150

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

// // ——— GUARANTEED INSTANT CLOSE FUNCTION ————————————————————————————————————
// async function guaranteedInstantClose(coin: string, size: number, isBuy: boolean, reason: string = 'AUTO') {
//     console.log(`🎯 GUARANTEEING INSTANT CLOSE: ${coin} | Size: ${size} | Side: ${isBuy ? 'BUY' : 'SELL'} | Reason: ${reason}`);

//     try {
//         // STEP 1: Get REAL-TIME order book for aggressive pricing
//         console.log('📊 Fetching real-time order book for guaranteed execution...');

//         const l2Response = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'l2Book',
//                 coin: coin,
//                 nSigFigs: 5 // High precision
//             })
//         });

//         const l2Book = await l2Response.json();
//         console.log(`📊 ${coin} Order Book Depth:`, {
//             topBid: l2Book?.levels?.[1]?.[0], // Best bid [price, size]
//             topAsk: l2Book?.levels?.[0]?.[0]  // Best ask [price, size]
//         });

//         let aggressivePrice;
//         let priceMethod;

//         // STEP 2: Use order book data for GUARANTEED execution
//         if (isBuy && l2Book?.levels?.[0]?.[0]) {
//             // Buying to close SHORT - pay MORE than best ask
//             const bestAsk = parseFloat(l2Book.levels[0][0].px);
//             aggressivePrice = bestAsk * 1.015; // 1.5% ABOVE best ask (guaranteed fill)
//             priceMethod = `BEST_ASK_+1.5% (${bestAsk} -> ${aggressivePrice})`;
//         } else if (!isBuy && l2Book?.levels?.[1]?.[0]) {
//             // Selling to close LONG - accept LESS than best bid  
//             const bestBid = parseFloat(l2Book.levels[1][0].px);
//             aggressivePrice = bestBid * 0.985; // 1.5% BELOW best bid (guaranteed fill)
//             priceMethod = `BEST_BID_-1.5% (${bestBid} -> ${aggressivePrice})`;
//         } else {
//             // FALLBACK: Use mid-price with GUARANTEED slippage
//             console.log('⚠️ Order book data unavailable, using mid-price fallback...');

//             const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ type: 'allMids' })
//             });

//             const allMids = await midResponse.json();
//             const midPrice = allMids[coin];

//             if (!midPrice) {
//                 throw new Error(`No price data available for ${coin}`);
//             }

//             // GUARANTEED slippage for instant fill
//             aggressivePrice = midPrice * (isBuy ? 1.025 : 0.975); // 2.5% slippage
//             priceMethod = `MID_PRICE_2.5% (${midPrice} -> ${aggressivePrice})`;
//         }

//         console.log(`💰 AGGRESSIVE PRICING: ${priceMethod}`);

//         // STEP 3: Place GUARANTEED execution limit order with IoC
//         const aggressiveParams = {
//             coin: `${coin}-PERP`,
//             is_buy: isBuy,
//             sz: Math.abs(size),
//             limit_px: Math.round(aggressivePrice), // Round to avoid precision issues
//             order_type: { limit: { tif: 'Ioc' as Tif } }, // Immediate or Cancel
//             reduce_only: true
//         };

//         console.log('📤 GUARANTEED CLOSE ORDER:', aggressiveParams);

//         const result = await sdk.exchange.placeOrder(aggressiveParams);
//         console.log('📥 Execution Result:', JSON.stringify(result, null, 2));

//         if (result.status === 'ok') {
//             // Check if it actually filled
//             const statuses = result.response?.data?.statuses || [];
//             const filled = statuses.some((s: any) => 'filled' in s && s.filled);

//             if (filled) {
//                 console.log('✅ SUCCESS: Position closed with aggressive limit order!');
//                 return { success: true, method: 'AGGRESSIVE_LIMIT', result, priceMethod };
//             } else {
//                 console.log('⚠️ Order placed but not filled, trying NUCLEAR fallback...');

//                 // STEP 4: NUCLEAR OPTION - Extreme slippage
//                 return await nuclearClose(coin, size, isBuy);
//             }
//         } else {
//             throw new Error(`Order placement failed: ${JSON.stringify(result)}`);
//         }

//     } catch (error) {
//         console.error(`❌ Error in guaranteed close for ${coin}:`, error);

//         // FINAL FALLBACK: Nuclear close
//         console.log('🔥 Attempting NUCLEAR CLOSE as final fallback...');
//         return await nuclearClose(coin, size, isBuy);
//     }
// }

// // ——— NUCLEAR option for guaranteed execution ————————————————————————————————
// async function nuclearClose(coin: string, size: number, isBuy: boolean) {
//     console.log('🔥 NUCLEAR CLOSE: Using extreme 5% slippage for guaranteed execution');

//     try {
//         // Get current price
//         const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ type: 'allMids' })
//         });

//         const allMids = await midResponse.json();
//         const midPrice = allMids[coin];

//         if (!midPrice) {
//             throw new Error(`No price data for nuclear close of ${coin}`);
//         }

//         // EXTREME 5% slippage - this WILL fill
//         const nuclearPrice = midPrice * (isBuy ? 1.05 : 0.95);

//         console.log(`💣 NUCLEAR PRICING: ${midPrice} -> ${nuclearPrice} (${isBuy ? '+5%' : '-5%'})`);

//         const nuclearParams = {
//             coin: `${coin}-PERP`,
//             is_buy: isBuy,
//             sz: Math.abs(size),
//             limit_px: Math.round(nuclearPrice),
//             order_type: { limit: { tif: 'Ioc' as Tif } },
//             reduce_only: true
//         };

//         const result = await sdk.exchange.placeOrder(nuclearParams);
//         console.log('💥 NUCLEAR RESULT:', result);

//         return {
//             success: result.status === 'ok',
//             method: 'NUCLEAR_5%_SLIPPAGE',
//             result,
//             warning: 'Used extreme 5% slippage for guaranteed execution'
//         };

//     } catch (error) {
//         console.error('💥 Nuclear close failed:', error);
//         return {
//             success: false,
//             method: 'NUCLEAR_FAILED',
//             error: error
//         };
//     }
// }

// // ——— ENHANCED PROFIT TAKING & STOP LOSS FUNCTION ——————————————————————————————————————
// async function checkProfitsAndStopLosses() {
//     try {
//         console.log('💰 Checking positions for profit-taking AND stop-loss opportunities...');

//         // Get current positions
//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
//         const positions = perpState?.assetPositions || [];

//         if (positions.length === 0) {
//             console.log('✅ No positions to check');
//             return { profitsTaken: 0, totalProfit: 0, lossesStop: 0, totalLosses: 0 };
//         }

//         // Get current market prices
//         const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ type: 'allMids' })
//         });
//         const allMids = await priceResponse.json();

//         // Get fills for entry price calculation
//         const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'userFills',
//                 user: USER_WALLET
//             })
//         });
//         const fills = await fillsResponse.json();

//         let profitsTaken = 0;
//         let totalProfit = 0;
//         let lossesStop = 0;
//         let totalLosses = 0;

//         // Check daily state for emergency stop
//         const dayState = getDayState();
//         const currentDailyLoss = Math.abs(dayState.realizedLoss); // Make positive for comparison

//         console.log(`📊 Current Daily Loss: ${currentDailyLoss.toFixed(2)} / ${Math.abs(DAILY_TOTAL_STOP_LOSS)} limit`);

//         for (const position of positions) {
//             const coin = position.position.coin;
//             const size = parseFloat(position.position.szi);
//             const currentPrice = allMids[coin];

//             if (!currentPrice) {
//                 console.log(`⚠️ No current price for ${coin}, skipping...`);
//                 continue;
//             }

//             // Find entry price from fills
//             const coinFills = fills.filter((fill: any) => fill.coin === coin);
//             const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

//             if (!latestFill) {
//                 console.log(`⚠️ No fills found for ${coin}, skipping...`);
//                 continue;
//             }

//             const entryPrice = latestFill.px;
//             const positionAge = Date.now() - latestFill.time;
//             const ageMinutes = positionAge / (60 * 1000);

//             // Calculate current profit/loss
//             const isLong = size > 0;
//             const unrealizedPnl = isLong ?
//                 (currentPrice - entryPrice) * Math.abs(size) :
//                 (entryPrice - currentPrice) * Math.abs(size);

//             console.log(`📊 ${coin} Position Analysis:`);
//             console.log(`   Size: ${size}, Entry: ${entryPrice}, Current: ${currentPrice}`);
//             console.log(`   Unrealized PnL: ${unrealizedPnl.toFixed(2)}, Age: ${ageMinutes.toFixed(1)} mins`);

//             // DECISION LOGIC
//             let shouldClose = false;
//             let reason = '';

//             // 🛑 EMERGENCY STOP LOSS - Close ALL positions if daily loss too high
//             if (currentDailyLoss >= Math.abs(DAILY_TOTAL_STOP_LOSS)) {
//                 shouldClose = true;
//                 reason = `EMERGENCY_DAILY_LOSS_${currentDailyLoss.toFixed(2)}`;
//             }
//             // 🛑 INDIVIDUAL EMERGENCY STOP LOSS
//             else if (unrealizedPnl <= EMERGENCY_STOP_LOSS) {
//                 shouldClose = true;
//                 reason = `EMERGENCY_STOP_${unrealizedPnl.toFixed(2)}`;
//             }
//             // 🛑 INDIVIDUAL STOP LOSS
//             else if (unrealizedPnl <= INDIVIDUAL_STOP_LOSS) {
//                 shouldClose = true;
//                 reason = `STOP_LOSS_${unrealizedPnl.toFixed(2)}`;
//             }
//             // 💰 QUICK PROFIT TAKING
//             else if (unrealizedPnl >= QUICK_PROFIT_THRESHOLD) {
//                 shouldClose = true;
//                 reason = `QUICK_PROFIT_${unrealizedPnl.toFixed(2)}`;
//             }
//             // 💰 STANDARD PROFIT TAKING
//             else if (unrealizedPnl >= PROFIT_TAKING_THRESHOLD) {
//                 shouldClose = true;
//                 reason = `PROFIT_TARGET_${unrealizedPnl.toFixed(2)}`;
//             }
//             // ⏰ TIME-BASED PROFIT TAKING (take any profit after time limit)
//             else if (unrealizedPnl > 5 && ageMinutes >= MAX_POSITION_AGE_MINUTES) {
//                 shouldClose = true;
//                 reason = `TIME_BASED_PROFIT_${unrealizedPnl.toFixed(2)}_${ageMinutes.toFixed(1)}min`;
//             }

//             if (shouldClose) {
//                 const isProfit = unrealizedPnl > 0;
//                 const actionType = isProfit ? 'TAKING PROFITS' : 'CUTTING LOSSES';

//                 console.log(`${isProfit ? '💰' : '🛑'} ${actionType}: ${coin} - ${reason}`);

//                 const isBuy = size < 0; // If short, buy to close
//                 const closeResult = await guaranteedInstantClose(coin, size, isBuy, reason);

//                 if (closeResult.success) {
//                     console.log(`✅ ${actionType} SUCCESSFUL: ${coin} - ${unrealizedPnl.toFixed(2)}`);

//                     if (isProfit) {
//                         profitsTaken++;
//                         totalProfit += unrealizedPnl;
//                     } else {
//                         lossesStop++;
//                         totalLosses += Math.abs(unrealizedPnl);
//                     }

//                     // Track the trade
//                     if (closeResult.result?.response?.data?.statuses) {
//                         const statuses = closeResult.result.response.data.statuses;
//                         statuses.forEach((s: any) => {
//                             if ('filled' in s && s.filled) {
//                                 const { avgPx, totalSz, oid } = s.filled;
//                                 const actualPnl = isLong ?
//                                     (avgPx - entryPrice) * totalSz :
//                                     (entryPrice - avgPx) * totalSz;

//                                 pushTrade({
//                                     id: String(oid),
//                                     pnl: actualPnl,
//                                     side: isProfit ? `PROFIT_${reason}` : `STOP_${reason}`,
//                                     size: totalSz,
//                                     avgPrice: avgPx,
//                                     leverage: position.position.leverage?.value || 1,
//                                     timestamp: Date.now()
//                                 });
//                             }
//                         });
//                     }
//                 } else {
//                     console.error(`❌ Failed to ${actionType.toLowerCase()} on ${coin}: ${closeResult}`);
//                 }

//                 // Brief pause between closes
//                 await new Promise(resolve => setTimeout(resolve, 1000));
//             }
//         }

//         // Summary logging
//         if (profitsTaken > 0 || lossesStop > 0) {
//             console.log(`🏁 RISK MANAGEMENT SUMMARY:`);
//             console.log(`   💰 Profits: ${profitsTaken} positions, ${totalProfit.toFixed(2)} total`);
//             console.log(`   🛑 Losses: ${lossesStop} positions, ${totalLosses.toFixed(2)} total`);
//             console.log(`   📊 Net: ${(totalProfit - totalLosses).toFixed(2)}`);
//         }

//         return { profitsTaken, totalProfit, lossesStop, totalLosses };

//     } catch (error) {
//         console.error('❌ Error in profit/loss management:', error);
//         return { profitsTaken: 0, totalProfit: 0, lossesStop: 0, totalLosses: 0, error: error };
//     }
// }

// // ——— AUTO-CLOSE OLD POSITIONS WITH GUARANTEED EXECUTION ————————————————————————
// async function closeOldPositions() {
//     try {
//         console.log('🕐 Checking for positions older than 1 hour...');

//         // Get current positions
//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
//         const positions = perpState?.assetPositions || [];

//         if (positions.length === 0) {
//             console.log('✅ No open positions to check');
//             return { closedPositions: 0, freedMargin: 0 };
//         }

//         console.log(`📊 Found ${positions.length} open positions`);

//         const oneHourAgo = Date.now() - (60 * 60 * 1000);
//         let closedPositions = 0;
//         let freedMargin = 0;
//         const closeResults = [];

//         // Get fills for age calculation
//         const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'userFills',
//                 user: USER_WALLET
//             })
//         });

//         const fills = await fillsResponse.json();

//         for (const position of positions) {
//             const coin = position.position.coin;
//             const size = parseFloat(position.position.szi);
//             const marginUsed = parseFloat(position.position.marginUsed);

//             // Find position age
//             const coinFills = fills.filter((fill: any) => fill.coin === coin);
//             const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

//             if (!latestFill) {
//                 console.log(`⚠️ No fills found for ${coin}, skipping...`);
//                 continue;
//             }

//             const positionAge = Date.now() - latestFill.time;
//             const ageHours = positionAge / (60 * 60 * 1000);

//             console.log(`📊 ${coin}: ${size} | Age: ${ageHours.toFixed(2)}h | Margin: $${marginUsed}`);

//             // Close old positions with GUARANTEED execution
//             if (positionAge > (60 * 60 * 1000)) {
//                 console.log(`🔴 GUARANTEED CLOSING: ${coin} (${ageHours.toFixed(2)}h old)`);

//                 const isBuy = size < 0; // If short, buy to close

//                 // Use guaranteed close function
//                 const closeResult = await guaranteedInstantClose(coin, size, isBuy, `OLD_POSITION_${ageHours.toFixed(1)}h`);

//                 if (closeResult.success) {
//                     console.log(`✅ SUCCESSFULLY CLOSED ${coin} using ${closeResult.method}`);
//                     closedPositions++;
//                     freedMargin += marginUsed;

//                     closeResults.push({
//                         coin,
//                         method: closeResult.method,
//                         success: true
//                     });

//                     // Track fills if available
//                     if (closeResult.result?.response?.data?.statuses) {
//                         const statuses = closeResult.result.response.data.statuses;
//                         statuses.forEach((s: any) => {
//                             if ('filled' in s && s.filled) {
//                                 const { avgPx, totalSz, oid } = s.filled;
//                                 const pnl = isBuy ?
//                                     (latestFill.px - avgPx) * totalSz :
//                                     (avgPx - latestFill.px) * totalSz;

//                                 console.log(`💰 ${coin} CLOSED: Entry: $${latestFill.px}, Exit: $${avgPx}, PnL: $${pnl.toFixed(2)}`);

//                                 pushTrade({
//                                     id: String(oid),
//                                     pnl,
//                                     side: `CLOSE_${closeResult.method}`,
//                                     size: totalSz,
//                                     avgPrice: avgPx,
//                                     leverage: position.position.leverage?.value || 1,
//                                     timestamp: Date.now()
//                                 });
//                             }
//                         });
//                     }
//                 } else {
//                     console.error(`❌ FAILED to close ${coin} even with guaranteed method!`);
//                     closeResults.push({
//                         coin,
//                         method: closeResult.method || 'UNKNOWN',
//                         success: false,
//                         error: closeResult
//                     });
//                 }

//                 // Brief pause between closes
//                 await new Promise(resolve => setTimeout(resolve, 1000));
//             }
//         }

//         console.log(`🏁 CLOSE SUMMARY: ${closedPositions}/${positions.length} positions closed, $${freedMargin.toFixed(2)} margin freed`);

//         return {
//             closedPositions,
//             freedMargin,
//             closeResults,
//             totalPositions: positions.length
//         };

//     } catch (error) {
//         console.error('❌ Error in guaranteed position closing:', error);
//         return { closedPositions: 0, freedMargin: 0, error: error };
//     }
// }

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

// // ——— Main Cron Handler with PROFIT TAKING ————————————————————————————————————————————————
// export async function GET() {
//     try {
//         // 🕐 STEP 1: Check for profit-taking AND stop-loss opportunities FIRST
//         console.log('💰🛑 Step 1: Checking for profit-taking AND stop-loss opportunities...');
//         const profitLossResult = await checkProfitsAndStopLosses();

//         if (profitLossResult.profitsTaken > 0 || profitLossResult.lossesStop > 0) {
//             console.log(`🎯 RISK MANAGEMENT COMPLETE:`);
//             console.log(`   💰 Profits: ${profitLossResult.profitsTaken} positions, ${profitLossResult.totalProfit.toFixed(2)}`);
//             console.log(`   🛑 Losses: ${profitLossResult.lossesStop} positions, ${profitLossResult.totalLosses.toFixed(2)}`);
//             console.log(`   📊 Net Impact: ${(profitLossResult.totalProfit - profitLossResult.totalLosses).toFixed(2)}`);
//         }

//         // 🕐 STEP 2: Close old positions BEFORE anything else
//         console.log('🕐 Step 2: Auto-closing positions older than 1 hour...');
//         const closeResult = await closeOldPositions();

//         if (closeResult.error) {
//             console.warn('⚠️ Error closing old positions:', closeResult.error);
//         } else if (closeResult.closedPositions > 0) {
//             console.log(`✅ Freed ${closeResult.freedMargin.toFixed(2)} by closing ${closeResult.closedPositions} old positions`);

//             // Wait for balance to update after closes
//             console.log('⏳ Waiting for balance to update...');
//             await new Promise(resolve => setTimeout(resolve, 3000));
//         }

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
//             return NextResponse.json({
//                 message: 'No trade signal',
//                 profitsTaken: profitLossResult.profitsTaken,
//                 profitAmount: profitLossResult.totalProfit,
//                 lossesStop: profitLossResult.lossesStop,
//                 lossAmount: profitLossResult.totalLosses,
//                 oldPositionsClosed: closeResult.closedPositions,
//                 marginFreed: closeResult.freedMargin
//             });
//         }

//         // 3️⃣ Check daily loss limit BEFORE sizing
//         const dayState = getDayState();
//         if (dayState.realizedLoss >= DAILY_LOSS_LIMIT) {
//             console.log(`🛑 Daily loss limit reached (${DAILY_LOSS_LIMIT}). Stopping trades.`);
//             return NextResponse.json({
//                 message: `Daily loss limit reached: ${dayState.realizedLoss}`,
//                 profitsTaken: profitLossResult.profitsTaken,
//                 profitAmount: profitLossResult.totalProfit,
//                 lossesStop: profitLossResult.lossesStop,
//                 lossAmount: profitLossResult.totalLosses,
//                 oldPositionsClosed: closeResult.closedPositions,
//                 marginFreed: closeResult.freedMargin
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
//                 balanceInfo,
//                 profitsTaken: profitLossResult.profitsTaken,
//                 profitAmount: profitLossResult.totalProfit,
//                 lossesStop: profitLossResult.lossesStop,
//                 lossAmount: profitLossResult.totalLosses
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
//                     spotAmount: balanceInfo.spotAmount,
//                     profitsTaken: profitLossResult.profitsTaken,
//                     profitAmount: profitLossResult.totalProfit,
//                     lossesStop: profitLossResult.lossesStop,
//                     lossAmount: profitLossResult.totalLosses
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
//                 positionCalc,
//                 profitsTaken: profitLossResult.profitsTaken,
//                 profitAmount: profitLossResult.totalProfit,
//                 lossesStop: profitLossResult.lossesStop,
//                 lossAmount: profitLossResult.totalLosses
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

//         // 5️⃣ Build the SDK order params with AGGRESSIVE SLIPPAGE for instant fills
//         const coin = 'BTC-PERP';
//         const isBuy = slot.signal === 'LONG';

//         // USE AGGRESSIVE PRICING for instant fills instead of exact forecast price
//         const currentMarketPrice = (await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ type: 'allMids' })
//         }).then(r => r.json()))['BTC'];

//         // Use market price with 1% slippage for instant fills
//         const aggressivePrice = isBuy ?
//             Math.round(currentMarketPrice * 1.01) : // 1% above market for buys
//             Math.round(currentMarketPrice * 0.99);  // 1% below market for sells

//         console.log(`💰 Pricing Strategy: Market: $${currentMarketPrice}, Order: $${aggressivePrice} (${isBuy ? '+1%' : '-1%'} for instant fill)`);

//         const orderParams = {
//             coin,
//             is_buy: isBuy,
//             sz: Number(positionCalc.size),
//             limit_px: aggressivePrice, // Use aggressive price instead of forecast price
//             order_type: { limit: { tif: 'Ioc' as Tif } }, // Changed to IoC for instant fills
//             reduce_only: false,
//             ...(slot.take_profit != null && { tp: Number(slot.take_profit) }),
//             ...(slot.stop_loss != null && { sl: Number(slot.stop_loss) })
//         };

//         console.log('📤 Placing INSTANT-FILL order with params:', orderParams);

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
//                 const pnl = (isBuy ? avgPx - aggressivePrice : aggressivePrice - avgPx) * totalSz;
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
//             profitsTaken: profitLossResult.profitsTaken,
//             profitAmount: profitLossResult.totalProfit,
//             lossesStop: profitLossResult.lossesStop,
//             lossAmount: profitLossResult.totalLosses,
//             netRiskManagement: profitLossResult.totalProfit - profitLossResult.totalLosses,
//             oldPositionsClosed: closeResult.closedPositions,
//             marginFreed: closeResult.freedMargin,
//             forecastSlot: slot,
//             pricingStrategy: {
//                 forecastPrice: price,
//                 marketPrice: currentMarketPrice,
//                 orderPrice: aggressivePrice,
//                 slippage: isBuy ? '+1.0%' : '-1.0%',
//                 reason: 'INSTANT_FILL_GUARANTEE'
//             },
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
//                 price: aggressivePrice, // Return actual order price, not forecast price
//                 size: positionCalc.size,
//                 leverage: positionCalc.leverage
//             },
//             sdkResponse: result
//         };

//         console.log('📤 [Returning ENHANCED Payload with Profit Taking & Stop Losses]', JSON.stringify(payload, null, 2));
//         return NextResponse.json(payload);

//     } catch (err: any) {
//         console.error('❌ Cron order error:', err);
//         return NextResponse.json({ error: err.message }, { status: 500 });
//     }
// }

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
// const MAX_LOSS_PER_TRADE = 20;
// const DAILY_LOSS_LIMIT = 150;
// const CAPITAL_USAGE_PERCENT = 0.30; // Use 30% of available USDC per trade
// const MAX_LEVERAGE = 25; // Increased for higher profits
// const MIN_LEVERAGE = 5;  // Higher minimum for aggressive targets
// const DAILY_TOTAL_STOP_LOSS = 150;

// // ——— DYNAMIC PERCENTAGE-BASED PROFIT/LOSS CONSTANTS ————————————————————————————————————————
// const BASE_TAKE_PROFIT_PERCENT = 2.0;     // 2% base take profit
// const MIN_STOP_LOSS_PERCENT = 0.5;        // 0.5% minimum stop loss
// const EMERGENCY_STOP_LOSS_PERCENT = 1.5;  // 1.5% emergency stop loss
// const MAX_POSITION_AGE_MINUTES = 30;      // Close profitable positions after 30 minutes

// // ——— DYNAMIC PROFIT SCALING FACTORS ————————————————————————————————————————
// const QUICK_PROFIT_MULTIPLIER = 1.5;      // 3% take profit for high confidence
// const EXTENDED_PROFIT_MULTIPLIER = 2.0;   // 4% take profit for very high confidence  
// const CONFIDENCE_THRESHOLD_HIGH = 95;     // Above 95% confidence = extended profits
// const CONFIDENCE_THRESHOLD_QUICK = 90;    // Above 90% confidence = quick profits

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

// // ——— GUARANTEED INSTANT CLOSE FUNCTION ————————————————————————————————————
// async function guaranteedInstantClose(coin: string, size: number, isBuy: boolean, reason: string = 'AUTO') {
//     console.log(`🎯 GUARANTEEING INSTANT CLOSE: ${coin} | Size: ${size} | Side: ${isBuy ? 'BUY' : 'SELL'} | Reason: ${reason}`);

//     try {
//         // STEP 1: Get REAL-TIME order book for aggressive pricing
//         console.log('📊 Fetching real-time order book for guaranteed execution...');

//         const l2Response = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'l2Book',
//                 coin: coin,
//                 nSigFigs: 5 // High precision
//             })
//         });

//         const l2Book = await l2Response.json();
//         console.log(`📊 ${coin} Order Book Depth:`, {
//             topBid: l2Book?.levels?.[1]?.[0], // Best bid [price, size]
//             topAsk: l2Book?.levels?.[0]?.[0]  // Best ask [price, size]
//         });

//         let aggressivePrice;
//         let priceMethod;

//         // STEP 2: Use order book data for GUARANTEED execution
//         if (isBuy && l2Book?.levels?.[0]?.[0]) {
//             // Buying to close SHORT - pay MORE than best ask
//             const bestAsk = parseFloat(l2Book.levels[0][0].px);
//             aggressivePrice = bestAsk * 1.015; // 1.5% ABOVE best ask (guaranteed fill)
//             priceMethod = `BEST_ASK_+1.5% (${bestAsk} -> ${aggressivePrice})`;
//         } else if (!isBuy && l2Book?.levels?.[1]?.[0]) {
//             // Selling to close LONG - accept LESS than best bid  
//             const bestBid = parseFloat(l2Book.levels[1][0].px);
//             aggressivePrice = bestBid * 0.985; // 1.5% BELOW best bid (guaranteed fill)
//             priceMethod = `BEST_BID_-1.5% (${bestBid} -> ${aggressivePrice})`;
//         } else {
//             // FALLBACK: Use mid-price with GUARANTEED slippage
//             console.log('⚠️ Order book data unavailable, using mid-price fallback...');

//             const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ type: 'allMids' })
//             });

//             const allMids = await midResponse.json();
//             const midPrice = allMids[coin];

//             if (!midPrice) {
//                 throw new Error(`No price data available for ${coin}`);
//             }

//             // GUARANTEED slippage for instant fill
//             aggressivePrice = midPrice * (isBuy ? 1.025 : 0.975); // 2.5% slippage
//             priceMethod = `MID_PRICE_2.5% (${midPrice} -> ${aggressivePrice})`;
//         }

//         console.log(`💰 AGGRESSIVE PRICING: ${priceMethod}`);

//         // STEP 3: Place GUARANTEED execution limit order with IoC
//         const aggressiveParams = {
//             coin: `${coin}-PERP`,
//             is_buy: isBuy,
//             sz: Math.abs(size),
//             limit_px: Math.round(aggressivePrice), // Round to avoid precision issues
//             order_type: { limit: { tif: 'Ioc' as Tif } }, // Immediate or Cancel
//             reduce_only: true
//         };

//         console.log('📤 GUARANTEED CLOSE ORDER:', aggressiveParams);

//         const result = await sdk.exchange.placeOrder(aggressiveParams);
//         console.log('📥 Execution Result:', JSON.stringify(result, null, 2));

//         if (result.status === 'ok') {
//             // Check if it actually filled
//             const statuses = result.response?.data?.statuses || [];
//             const filled = statuses.some((s: any) => 'filled' in s && s.filled);

//             if (filled) {
//                 console.log('✅ SUCCESS: Position closed with aggressive limit order!');
//                 return { success: true, method: 'AGGRESSIVE_LIMIT', result, priceMethod };
//             } else {
//                 console.log('⚠️ Order placed but not filled, trying NUCLEAR fallback...');

//                 // STEP 4: NUCLEAR OPTION - Extreme slippage
//                 return await nuclearClose(coin, size, isBuy);
//             }
//         } else {
//             throw new Error(`Order placement failed: ${JSON.stringify(result)}`);
//         }

//     } catch (error) {
//         console.error(`❌ Error in guaranteed close for ${coin}:`, error);

//         // FINAL FALLBACK: Nuclear close
//         console.log('🔥 Attempting NUCLEAR CLOSE as final fallback...');
//         return await nuclearClose(coin, size, isBuy);
//     }
// }

// // ——— NUCLEAR option for guaranteed execution ————————————————————————————————
// async function nuclearClose(coin: string, size: number, isBuy: boolean) {
//     console.log('🔥 NUCLEAR CLOSE: Using extreme 5% slippage for guaranteed execution');

//     try {
//         // Get current price
//         const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ type: 'allMids' })
//         });

//         const allMids = await midResponse.json();
//         const midPrice = allMids[coin];

//         if (!midPrice) {
//             throw new Error(`No price data for nuclear close of ${coin}`);
//         }

//         // EXTREME 5% slippage - this WILL fill
//         const nuclearPrice = midPrice * (isBuy ? 1.05 : 0.95);

//         console.log(`💣 NUCLEAR PRICING: ${midPrice} -> ${nuclearPrice} (${isBuy ? '+5%' : '-5%'})`);

//         const nuclearParams = {
//             coin: `${coin}-PERP`,
//             is_buy: isBuy,
//             sz: Math.abs(size),
//             limit_px: Math.round(nuclearPrice),
//             order_type: { limit: { tif: 'Ioc' as Tif } },
//             reduce_only: true
//         };

//         const result = await sdk.exchange.placeOrder(nuclearParams);
//         console.log('💥 NUCLEAR RESULT:', result);

//         return {
//             success: result.status === 'ok',
//             method: 'NUCLEAR_5%_SLIPPAGE',
//             result,
//             warning: 'Used extreme 5% slippage for guaranteed execution'
//         };

//     } catch (error) {
//         console.error('💥 Nuclear close failed:', error);
//         return {
//             success: false,
//             method: 'NUCLEAR_FAILED',
//             error: error
//         };
//     }
// }

// // ——— DYNAMIC PROFIT/LOSS CALCULATOR ————————————————————————————————————————
// function calculateDynamicProfitLoss(entryPrice: number, currentConfidence: number = 85, marketConditions: any = {}) {
//     let takeProfitPercent = BASE_TAKE_PROFIT_PERCENT;
//     let stopLossPercent = MIN_STOP_LOSS_PERCENT;

//     // DYNAMIC PROFIT SCALING based on confidence
//     if (currentConfidence >= CONFIDENCE_THRESHOLD_HIGH) {
//         takeProfitPercent = BASE_TAKE_PROFIT_PERCENT * EXTENDED_PROFIT_MULTIPLIER; // 4%
//         console.log(`🚀 EXTENDED PROFIT TARGET: ${takeProfitPercent}% (Confidence: ${currentConfidence}%)`);
//     } else if (currentConfidence >= CONFIDENCE_THRESHOLD_QUICK) {
//         takeProfitPercent = BASE_TAKE_PROFIT_PERCENT * QUICK_PROFIT_MULTIPLIER; // 3%
//         console.log(`⚡ QUICK PROFIT TARGET: ${takeProfitPercent}% (Confidence: ${currentConfidence}%)`);
//     } else {
//         console.log(`📊 BASE PROFIT TARGET: ${takeProfitPercent}% (Confidence: ${currentConfidence}%)`);
//     }

//     // DYNAMIC STOP LOSS ADJUSTMENT (could be tighter based on volatility)
//     const dayState = getDayState();
//     if (dayState.realizedLoss > 100) {
//         stopLossPercent = MIN_STOP_LOSS_PERCENT * 0.8; // Tighter stop when already losing
//         console.log(`🛑 TIGHTER STOP LOSS: ${stopLossPercent}% (Daily Loss: ${dayState.realizedLoss})`);
//     }

//     // Calculate actual price levels
//     const takeProfitPrice = entryPrice * (1 + takeProfitPercent / 100);
//     const stopLossPrice = entryPrice * (1 - stopLossPercent / 100);
//     const emergencyStopPrice = entryPrice * (1 - EMERGENCY_STOP_LOSS_PERCENT / 100);

//     return {
//         takeProfitPercent,
//         stopLossPercent,
//         takeProfitPrice,
//         stopLossPrice,
//         emergencyStopPrice,
//         dynamicReason: currentConfidence >= CONFIDENCE_THRESHOLD_HIGH ? 'EXTENDED' :
//             currentConfidence >= CONFIDENCE_THRESHOLD_QUICK ? 'QUICK' : 'BASE'
//     };
// }
// async function checkProfitsAndStopLosses(currentConfidence: number = 85) {
//     try {
//         console.log('💰 Checking positions for profit-taking AND stop-loss opportunities...');

//         // Get current positions
//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
//         const positions = perpState?.assetPositions || [];

//         if (positions.length === 0) {
//             console.log('✅ No positions to check');
//             return { profitsTaken: 0, totalProfit: 0, lossesStop: 0, totalLosses: 0 };
//         }

//         // Get current market prices
//         const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ type: 'allMids' })
//         });
//         const allMids = await priceResponse.json();

//         // Get fills for entry price calculation
//         const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'userFills',
//                 user: USER_WALLET
//             })
//         });
//         const fills = await fillsResponse.json();

//         let profitsTaken = 0;
//         let totalProfit = 0;
//         let lossesStop = 0;
//         let totalLosses = 0;

//         // Check daily state for emergency stop
//         const dayState = getDayState();
//         const currentDailyLoss = Math.abs(dayState.realizedLoss); // Make positive for comparison

//         console.log(`📊 Current Daily Loss: ${currentDailyLoss.toFixed(2)} / ${Math.abs(DAILY_TOTAL_STOP_LOSS)} limit`);

//         for (const position of positions) {
//             const coin = position.position.coin;
//             const size = parseFloat(position.position.szi);
//             const currentPrice = allMids[coin];

//             if (!currentPrice) {
//                 console.log(`⚠️ No current price for ${coin}, skipping...`);
//                 continue;
//             }

//             // Find entry price from fills
//             const coinFills = fills.filter((fill: any) => fill.coin === coin);
//             const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

//             if (!latestFill) {
//                 console.log(`⚠️ No fills found for ${coin}, skipping...`);
//                 continue;
//             }

//             const entryPrice = latestFill.px;
//             const positionAge = Date.now() - latestFill.time;
//             const ageMinutes = positionAge / (60 * 1000);

//             // Calculate current profit/loss percentage and dollar amount
//             const isLong = size > 0;
//             const priceChangePercent = ((currentPrice - entryPrice) / entryPrice) * 100;
//             const adjustedChangePercent = isLong ? priceChangePercent : -priceChangePercent;
//             const unrealizedPnl = isLong ?
//                 (currentPrice - entryPrice) * Math.abs(size) :
//                 (entryPrice - currentPrice) * Math.abs(size);

//             // Get dynamic profit/loss levels using actual prediction confidence
//             const dynamicLevels = calculateDynamicProfitLoss(entryPrice, currentConfidence);

//             console.log(`📊 ${coin} Position Analysis:`);
//             console.log(`   Size: ${size}, Entry: ${entryPrice}, Current: ${currentPrice}`);
//             console.log(`   Price Change: ${adjustedChangePercent.toFixed(3)}%, PnL: ${unrealizedPnl.toFixed(2)}`);
//             console.log(`   🎯 Take Profit: ${dynamicLevels.takeProfitPercent}% (${dynamicLevels.takeProfitPrice.toFixed(0)})`);
//             console.log(`   🛑 Stop Loss: ${dynamicLevels.stopLossPercent}% (${dynamicLevels.stopLossPrice.toFixed(0)})`);
//             console.log(`   Age: ${ageMinutes.toFixed(1)} mins, Strategy: ${dynamicLevels.dynamicReason}`);

//             // DECISION LOGIC - NOW PROPERLY using percentage-based levels
//             let shouldClose = false;
//             let reason = '';

//             // 🛑 EMERGENCY STOP LOSS - Close ALL positions if daily loss too high
//             if (currentDailyLoss >= DAILY_TOTAL_STOP_LOSS) {
//                 shouldClose = true;
//                 reason = `EMERGENCY_DAILY_LOSS_${currentDailyLoss.toFixed(2)}`;
//             }
//             // 🛑 EMERGENCY PERCENTAGE STOP LOSS (1.5%)
//             else if ((isLong && currentPrice <= dynamicLevels.emergencyStopPrice) ||
//                 (!isLong && currentPrice >= (entryPrice * (1 + EMERGENCY_STOP_LOSS_PERCENT / 100)))) {
//                 shouldClose = true;
//                 reason = `EMERGENCY_STOP_${EMERGENCY_STOP_LOSS_PERCENT}%_${unrealizedPnl.toFixed(2)}`;
//             }
//             // 🛑 STANDARD PERCENTAGE STOP LOSS (0.5% or dynamic)
//             else if ((isLong && currentPrice <= dynamicLevels.stopLossPrice) ||
//                 (!isLong && currentPrice >= (entryPrice * (1 + dynamicLevels.stopLossPercent / 100)))) {
//                 shouldClose = true;
//                 reason = `STOP_LOSS_${dynamicLevels.stopLossPercent}%_${unrealizedPnl.toFixed(2)}`;
//             }
//             // 💰 DYNAMIC PERCENTAGE-BASED PROFIT TAKING
//             else if ((isLong && currentPrice >= dynamicLevels.takeProfitPrice) ||
//                 (!isLong && currentPrice <= (entryPrice * (1 - dynamicLevels.takeProfitPercent / 100)))) {
//                 shouldClose = true;
//                 reason = `${dynamicLevels.dynamicReason}_PROFIT_${dynamicLevels.takeProfitPercent}%_${unrealizedPnl.toFixed(2)}`;
//             }
//             // ⏰ TIME-BASED PROFIT TAKING (take any profit after time limit)
//             else if (unrealizedPnl > 25 && ageMinutes >= MAX_POSITION_AGE_MINUTES) {
//                 shouldClose = true;
//                 reason = `TIME_BASED_PROFIT_${unrealizedPnl.toFixed(2)}_${ageMinutes.toFixed(1)}min`;
//             }

//             if (shouldClose) {
//                 const isProfit = unrealizedPnl > 0;
//                 const actionType = isProfit ? 'TAKING PROFITS' : 'CUTTING LOSSES';

//                 console.log(`${isProfit ? '💰' : '🛑'} ${actionType}: ${coin} - ${reason}`);

//                 const isBuy = size < 0; // If short, buy to close
//                 const closeResult = await guaranteedInstantClose(coin, size, isBuy, reason);

//                 if (closeResult.success) {
//                     console.log(`✅ ${actionType} SUCCESSFUL: ${coin} - ${unrealizedPnl.toFixed(2)}`);

//                     if (isProfit) {
//                         profitsTaken++;
//                         totalProfit += unrealizedPnl;
//                     } else {
//                         lossesStop++;
//                         totalLosses += Math.abs(unrealizedPnl);
//                     }

//                     // Track the trade
//                     if (closeResult.result?.response?.data?.statuses) {
//                         const statuses = closeResult.result.response.data.statuses;
//                         statuses.forEach((s: any) => {
//                             if ('filled' in s && s.filled) {
//                                 const { avgPx, totalSz, oid } = s.filled;
//                                 const actualPnl = isLong ?
//                                     (avgPx - entryPrice) * totalSz :
//                                     (entryPrice - avgPx) * totalSz;

//                                 pushTrade({
//                                     id: String(oid),
//                                     pnl: actualPnl,
//                                     side: isProfit ? `PROFIT_${reason}` : `STOP_${reason}`,
//                                     size: totalSz,
//                                     avgPrice: avgPx,
//                                     leverage: position.position.leverage?.value || 1,
//                                     timestamp: Date.now()
//                                 });
//                             }
//                         });
//                     }
//                 } else {
//                     console.error(`❌ Failed to ${actionType.toLowerCase()} on ${coin}: ${closeResult}`);
//                 }

//                 // Brief pause between closes
//                 await new Promise(resolve => setTimeout(resolve, 1000));
//             }
//         }

//         // Summary logging
//         if (profitsTaken > 0 || lossesStop > 0) {
//             console.log(`🏁 RISK MANAGEMENT SUMMARY:`);
//             console.log(`   💰 Profits: ${profitsTaken} positions, ${totalProfit.toFixed(2)} total`);
//             console.log(`   🛑 Losses: ${lossesStop} positions, ${totalLosses.toFixed(2)} total`);
//             console.log(`   📊 Net: ${(totalProfit - totalLosses).toFixed(2)}`);
//         }

//         return { profitsTaken, totalProfit, lossesStop, totalLosses };

//     } catch (error) {
//         console.error('❌ Error in profit/loss management:', error);
//         return { profitsTaken: 0, totalProfit: 0, lossesStop: 0, totalLosses: 0, error: error };
//     }
// }

// // ——— AUTO-CLOSE OLD POSITIONS WITH GUARANTEED EXECUTION ————————————————————————
// async function closeOldPositions() {
//     try {
//         console.log('🕐 Checking for positions older than 1 hour...');

//         // Get current positions
//         const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'clearinghouseState',
//                 user: USER_WALLET
//             })
//         });

//         const perpState = await perpResponse.json();
//         const positions = perpState?.assetPositions || [];

//         if (positions.length === 0) {
//             console.log('✅ No open positions to check');
//             return { closedPositions: 0, freedMargin: 0 };
//         }

//         console.log(`📊 Found ${positions.length} open positions`);

//         const oneHourAgo = Date.now() - (60 * 60 * 1000);
//         let closedPositions = 0;
//         let freedMargin = 0;
//         const closeResults = [];

//         // Get fills for age calculation
//         const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//                 type: 'userFills',
//                 user: USER_WALLET
//             })
//         });

//         const fills = await fillsResponse.json();

//         for (const position of positions) {
//             const coin = position.position.coin;
//             const size = parseFloat(position.position.szi);
//             const marginUsed = parseFloat(position.position.marginUsed);

//             // Find position age
//             const coinFills = fills.filter((fill: any) => fill.coin === coin);
//             const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

//             if (!latestFill) {
//                 console.log(`⚠️ No fills found for ${coin}, skipping...`);
//                 continue;
//             }

//             const positionAge = Date.now() - latestFill.time;
//             const ageHours = positionAge / (60 * 60 * 1000);

//             console.log(`📊 ${coin}: ${size} | Age: ${ageHours.toFixed(2)}h | Margin: $${marginUsed}`);

//             // Close old positions with GUARANTEED execution
//             if (positionAge > (60 * 60 * 1000)) {
//                 console.log(`🔴 GUARANTEED CLOSING: ${coin} (${ageHours.toFixed(2)}h old)`);

//                 const isBuy = size < 0; // If short, buy to close

//                 // Use guaranteed close function
//                 const closeResult = await guaranteedInstantClose(coin, size, isBuy, `OLD_POSITION_${ageHours.toFixed(1)}h`);

//                 if (closeResult.success) {
//                     console.log(`✅ SUCCESSFULLY CLOSED ${coin} using ${closeResult.method}`);
//                     closedPositions++;
//                     freedMargin += marginUsed;

//                     closeResults.push({
//                         coin,
//                         method: closeResult.method,
//                         success: true
//                     });

//                     // Track fills if available
//                     if (closeResult.result?.response?.data?.statuses) {
//                         const statuses = closeResult.result.response.data.statuses;
//                         statuses.forEach((s: any) => {
//                             if ('filled' in s && s.filled) {
//                                 const { avgPx, totalSz, oid } = s.filled;
//                                 const pnl = isBuy ?
//                                     (latestFill.px - avgPx) * totalSz :
//                                     (avgPx - latestFill.px) * totalSz;

//                                 console.log(`💰 ${coin} CLOSED: Entry: $${latestFill.px}, Exit: $${avgPx}, PnL: $${pnl.toFixed(2)}`);

//                                 pushTrade({
//                                     id: String(oid),
//                                     pnl,
//                                     side: `CLOSE_${closeResult.method}`,
//                                     size: totalSz,
//                                     avgPrice: avgPx,
//                                     leverage: position.position.leverage?.value || 1,
//                                     timestamp: Date.now()
//                                 });
//                             }
//                         });
//                     }
//                 } else {
//                     console.error(`❌ FAILED to close ${coin} even with guaranteed method!`);
//                     closeResults.push({
//                         coin,
//                         method: closeResult.method || 'UNKNOWN',
//                         success: false,
//                         error: closeResult
//                     });
//                 }

//                 // Brief pause between closes
//                 await new Promise(resolve => setTimeout(resolve, 1000));
//             }
//         }

//         console.log(`🏁 CLOSE SUMMARY: ${closedPositions}/${positions.length} positions closed, $${freedMargin.toFixed(2)} margin freed`);

//         return {
//             closedPositions,
//             freedMargin,
//             closeResults,
//             totalPositions: positions.length
//         };

//     } catch (error) {
//         console.error('❌ Error in guaranteed position closing:', error);
//         return { closedPositions: 0, freedMargin: 0, error: error };
//     }
// }

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

// // ——— Main Cron Handler with PROFIT TAKING ————————————————————————————————————————————————
// export async function GET() {
//     try {
//         // 🕐 STEP 1: Check for profit-taking AND stop-loss opportunities FIRST
//         console.log('💰🛑 Step 1: Checking for profit-taking AND stop-loss opportunities...');
//         const profitLossResult = await checkProfitsAndStopLosses();

//         if (profitLossResult.profitsTaken > 0 || profitLossResult.lossesStop > 0) {
//             console.log(`🎯 RISK MANAGEMENT COMPLETE:`);
//             console.log(`   💰 Profits: ${profitLossResult.profitsTaken} positions, ${profitLossResult.totalProfit.toFixed(2)}`);
//             console.log(`   🛑 Losses: ${profitLossResult.lossesStop} positions, ${profitLossResult.totalLosses.toFixed(2)}`);
//             console.log(`   📊 Net Impact: ${(profitLossResult.totalProfit - profitLossResult.totalLosses).toFixed(2)}`);
//         }

//         // 🕐 STEP 2: Close old positions BEFORE anything else
//         console.log('🕐 Step 2: Auto-closing positions older than 1 hour...');
//         const closeResult = await closeOldPositions();

//         if (closeResult.error) {
//             console.warn('⚠️ Error closing old positions:', closeResult.error);
//         } else if (closeResult.closedPositions > 0) {
//             console.log(`✅ Freed ${closeResult.freedMargin.toFixed(2)} by closing ${closeResult.closedPositions} old positions`);

//             // Wait for balance to update after closes
//             console.log('⏳ Waiting for balance to update...');
//             await new Promise(resolve => setTimeout(resolve, 3000));
//         }

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
//             return NextResponse.json({
//                 message: 'No trade signal',
//                 profitsTaken: profitLossResult.profitsTaken,
//                 profitAmount: profitLossResult.totalProfit,
//                 lossesStop: profitLossResult.lossesStop,
//                 lossAmount: profitLossResult.totalLosses,
//                 oldPositionsClosed: closeResult.closedPositions,
//                 marginFreed: closeResult.freedMargin
//             });
//         }

//         // 3️⃣ Check daily loss limit BEFORE sizing
//         const dayState = getDayState();
//         if (dayState.realizedLoss >= DAILY_LOSS_LIMIT) {
//             console.log(`🛑 Daily loss limit reached (${DAILY_LOSS_LIMIT}). Stopping trades.`);
//             return NextResponse.json({
//                 message: `Daily loss limit reached: ${dayState.realizedLoss}`,
//                 profitsTaken: profitLossResult.profitsTaken,
//                 profitAmount: profitLossResult.totalProfit,
//                 lossesStop: profitLossResult.lossesStop,
//                 lossAmount: profitLossResult.totalLosses,
//                 oldPositionsClosed: closeResult.closedPositions,
//                 marginFreed: closeResult.freedMargin
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
//                 balanceInfo,
//                 profitsTaken: profitLossResult.profitsTaken,
//                 profitAmount: profitLossResult.totalProfit,
//                 lossesStop: profitLossResult.lossesStop,
//                 lossAmount: profitLossResult.totalLosses
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
//                     spotAmount: balanceInfo.spotAmount,
//                     profitsTaken: profitLossResult.profitsTaken,
//                     profitAmount: profitLossResult.totalProfit,
//                     lossesStop: profitLossResult.lossesStop,
//                     lossAmount: profitLossResult.totalLosses
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
//                 positionCalc,
//                 profitsTaken: profitLossResult.profitsTaken,
//                 profitAmount: profitLossResult.totalProfit,
//                 lossesStop: profitLossResult.lossesStop,
//                 lossAmount: profitLossResult.totalLosses
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

//         // 5️⃣ Build the SDK order params with AGGRESSIVE SLIPPAGE for instant fills
//         const coin = 'BTC-PERP';
//         const isBuy = slot.signal === 'LONG';

//         // USE AGGRESSIVE PRICING for instant fills instead of exact forecast price
//         const currentMarketPrice = (await fetch('https://api.hyperliquid.xyz/info', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ type: 'allMids' })
//         }).then(r => r.json()))['BTC'];

//         // Use market price with 1% slippage for instant fills
//         const aggressivePrice = isBuy ?
//             Math.round(currentMarketPrice * 1.01) : // 1% above market for buys
//             Math.round(currentMarketPrice * 0.99);  // 1% below market for sells

//         console.log(`💰 Pricing Strategy: Market: $${currentMarketPrice}, Order: $${aggressivePrice} (${isBuy ? '+1%' : '-1%'} for instant fill)`);

//         const orderParams = {
//             coin,
//             is_buy: isBuy,
//             sz: Number(positionCalc.size),
//             limit_px: aggressivePrice, // Use aggressive price instead of forecast price
//             order_type: { limit: { tif: 'Ioc' as Tif } }, // Changed to IoC for instant fills
//             reduce_only: false,
//             ...(slot.take_profit != null && { tp: Number(slot.take_profit) }),
//             ...(slot.stop_loss != null && { sl: Number(slot.stop_loss) })
//         };

//         console.log('📤 Placing INSTANT-FILL order with params:', orderParams);

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
//                 const pnl = (isBuy ? avgPx - aggressivePrice : aggressivePrice - avgPx) * totalSz;
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
//             profitsTaken: profitLossResult.profitsTaken,
//             profitAmount: profitLossResult.totalProfit,
//             lossesStop: profitLossResult.lossesStop,
//             lossAmount: profitLossResult.totalLosses,
//             netRiskManagement: profitLossResult.totalProfit - profitLossResult.totalLosses,
//             oldPositionsClosed: closeResult.closedPositions,
//             marginFreed: closeResult.freedMargin,
//             forecastSlot: slot,
//             pricingStrategy: {
//                 forecastPrice: price,
//                 marketPrice: currentMarketPrice,
//                 orderPrice: aggressivePrice,
//                 slippage: isBuy ? '+1.0%' : '-1.0%',
//                 reason: 'INSTANT_FILL_GUARANTEE'
//             },
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
//                 price: aggressivePrice, // Return actual order price, not forecast price
//                 size: positionCalc.size,
//                 leverage: positionCalc.leverage
//             },
//             sdkResponse: result
//         };

//         console.log('📤 [Returning ENHANCED Payload with Profit Taking & Stop Losses]', JSON.stringify(payload, null, 2));
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

// ——— SDK Configuration ————————————————————————————————————————————————
const PK = process.env.NEXT_PUBLIC_HL_PRIVATE_KEY;
const MAIN_WALLET_RAW = process.env.NEXT_PUBLIC_HL_MAIN_WALLET;
const USER_WALLET_RAW = process.env.NEXT_PUBLIC_HL_USER_WALLET;

if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
if (!MAIN_WALLET_RAW) throw new Error('HL_MAIN_WALLET missing in env');
if (!USER_WALLET_RAW) throw new Error('USER_WALLET_RAW missing in env');

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
const DAILY_TOTAL_STOP_LOSS = 150;

// ——— DYNAMIC PERCENTAGE-BASED PROFIT/LOSS CONSTANTS ————————————————————————————————————————
const BASE_TAKE_PROFIT_PERCENT = 2.0;     // 2% base take profit
const MIN_STOP_LOSS_PERCENT = 0.25;        // 0.5% minimum stop loss
const EMERGENCY_STOP_LOSS_PERCENT = 1.5;  // 1.5% emergency stop loss
const MAX_POSITION_AGE_MINUTES = 30;      // Close profitable positions after 30 minutes

// ——— DYNAMIC PROFIT SCALING FACTORS ————————————————————————————————————————
const QUICK_PROFIT_MULTIPLIER = 1.5;      // 3% take profit for high confidence
const EXTENDED_PROFIT_MULTIPLIER = 2.0;   // 4% take profit for very high confidence  
const CONFIDENCE_THRESHOLD_HIGH = 95;     // Above 95% confidence = extended profits
const CONFIDENCE_THRESHOLD_QUICK = 90;    // Above 90% confidence = quick profits

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
        console.log('🔍 Checking wallet:', USER_WALLET);

        // Method 1: CORRECT 2025 API - Direct POST request for perpetuals
        console.log('📊 Checking Perpetuals Account (Direct API)...');
        const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'clearinghouseState',
                user: USER_WALLET
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
                user: USER_WALLET
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

// ——— GUARANTEED INSTANT CLOSE FUNCTION ————————————————————————————————————
async function guaranteedInstantClose(coin: string, size: number, isBuy: boolean, reason: string = 'AUTO') {
    console.log(`🎯 GUARANTEEING INSTANT CLOSE: ${coin} | Size: ${size} | Side: ${isBuy ? 'BUY' : 'SELL'} | Reason: ${reason}`);

    try {
        // STEP 1: Get REAL-TIME order book for aggressive pricing
        console.log('📊 Fetching real-time order book for guaranteed execution...');

        const l2Response = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'l2Book',
                coin: coin,
                nSigFigs: 5 // High precision
            })
        });

        const l2Book = await l2Response.json();
        console.log(`📊 ${coin} Order Book Depth:`, {
            topBid: l2Book?.levels?.[1]?.[0], // Best bid [price, size]
            topAsk: l2Book?.levels?.[0]?.[0]  // Best ask [price, size]
        });

        let aggressivePrice;
        let priceMethod;

        // STEP 2: Use order book data for GUARANTEED execution
        if (isBuy && l2Book?.levels?.[0]?.[0]) {
            // Buying to close SHORT - pay MORE than best ask
            const bestAsk = parseFloat(l2Book.levels[0][0].px);
            aggressivePrice = bestAsk * 1.015; // 1.5% ABOVE best ask (guaranteed fill)
            priceMethod = `BEST_ASK_+1.5% (${bestAsk} -> ${aggressivePrice})`;
        } else if (!isBuy && l2Book?.levels?.[1]?.[0]) {
            // Selling to close LONG - accept LESS than best bid  
            const bestBid = parseFloat(l2Book.levels[1][0].px);
            aggressivePrice = bestBid * 0.985; // 1.5% BELOW best bid (guaranteed fill)
            priceMethod = `BEST_BID_-1.5% (${bestBid} -> ${aggressivePrice})`;
        } else {
            // FALLBACK: Use mid-price with GUARANTEED slippage
            console.log('⚠️ Order book data unavailable, using mid-price fallback...');

            const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'allMids' })
            });

            const allMids = await midResponse.json();
            const midPrice = allMids[coin];

            if (!midPrice) {
                throw new Error(`No price data available for ${coin}`);
            }

            // GUARANTEED slippage for instant fill
            aggressivePrice = midPrice * (isBuy ? 1.025 : 0.975); // 2.5% slippage
            priceMethod = `MID_PRICE_2.5% (${midPrice} -> ${aggressivePrice})`;
        }

        console.log(`💰 AGGRESSIVE PRICING: ${priceMethod}`);

        // STEP 3: Place GUARANTEED execution limit order with IoC
        const aggressiveParams = {
            coin: `${coin}-PERP`,
            is_buy: isBuy,
            sz: Math.abs(size),
            limit_px: Math.round(aggressivePrice), // Round to avoid precision issues
            order_type: { limit: { tif: 'Ioc' as Tif } }, // Immediate or Cancel
            reduce_only: true
        };

        console.log('📤 GUARANTEED CLOSE ORDER:', aggressiveParams);

        const result = await sdk.exchange.placeOrder(aggressiveParams);
        console.log('📥 Execution Result:', JSON.stringify(result, null, 2));

        if (result.status === 'ok') {
            // Check if it actually filled
            const statuses = result.response?.data?.statuses || [];
            const filled = statuses.some((s: any) => 'filled' in s && s.filled);

            if (filled) {
                console.log('✅ SUCCESS: Position closed with aggressive limit order!');
                return { success: true, method: 'AGGRESSIVE_LIMIT', result, priceMethod };
            } else {
                console.log('⚠️ Order placed but not filled, trying NUCLEAR fallback...');

                // STEP 4: NUCLEAR OPTION - Extreme slippage
                return await nuclearClose(coin, size, isBuy);
            }
        } else {
            throw new Error(`Order placement failed: ${JSON.stringify(result)}`);
        }

    } catch (error) {
        console.error(`❌ Error in guaranteed close for ${coin}:`, error);

        // FINAL FALLBACK: Nuclear close
        console.log('🔥 Attempting NUCLEAR CLOSE as final fallback...');
        return await nuclearClose(coin, size, isBuy);
    }
}

// ——— NUCLEAR option for guaranteed execution ————————————————————————————————
async function nuclearClose(coin: string, size: number, isBuy: boolean) {
    console.log('🔥 NUCLEAR CLOSE: Using extreme 5% slippage for guaranteed execution');

    try {
        // Get current price
        const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'allMids' })
        });

        const allMids = await midResponse.json();
        const midPrice = allMids[coin];

        if (!midPrice) {
            throw new Error(`No price data for nuclear close of ${coin}`);
        }

        // EXTREME 5% slippage - this WILL fill
        const nuclearPrice = midPrice * (isBuy ? 1.05 : 0.95);

        console.log(`💣 NUCLEAR PRICING: ${midPrice} -> ${nuclearPrice} (${isBuy ? '+5%' : '-5%'})`);

        const nuclearParams = {
            coin: `${coin}-PERP`,
            is_buy: isBuy,
            sz: Math.abs(size),
            limit_px: Math.round(nuclearPrice),
            order_type: { limit: { tif: 'Ioc' as Tif } },
            reduce_only: true
        };

        const result = await sdk.exchange.placeOrder(nuclearParams);
        console.log('💥 NUCLEAR RESULT:', result);

        return {
            success: result.status === 'ok',
            method: 'NUCLEAR_5%_SLIPPAGE',
            result,
            warning: 'Used extreme 5% slippage for guaranteed execution'
        };

    } catch (error) {
        console.error('💥 Nuclear close failed:', error);
        return {
            success: false,
            method: 'NUCLEAR_FAILED',
            error: error
        };
    }
}

// ——— DYNAMIC PROFIT/LOSS CALCULATOR ————————————————————————————————————————
function calculateDynamicProfitLoss(entryPrice: number, currentConfidence: number = 85, marketConditions: any = {}) {
    let takeProfitPercent = BASE_TAKE_PROFIT_PERCENT;
    let stopLossPercent = MIN_STOP_LOSS_PERCENT;

    // DYNAMIC PROFIT SCALING based on confidence
    if (currentConfidence >= CONFIDENCE_THRESHOLD_HIGH) {
        takeProfitPercent = BASE_TAKE_PROFIT_PERCENT * EXTENDED_PROFIT_MULTIPLIER; // 4%
        console.log(`🚀 EXTENDED PROFIT TARGET: ${takeProfitPercent}% (Confidence: ${currentConfidence}%)`);
    } else if (currentConfidence >= CONFIDENCE_THRESHOLD_QUICK) {
        takeProfitPercent = BASE_TAKE_PROFIT_PERCENT * QUICK_PROFIT_MULTIPLIER; // 3%
        console.log(`⚡ QUICK PROFIT TARGET: ${takeProfitPercent}% (Confidence: ${currentConfidence}%)`);
    } else {
        console.log(`📊 BASE PROFIT TARGET: ${takeProfitPercent}% (Confidence: ${currentConfidence}%)`);
    }

    // DYNAMIC STOP LOSS ADJUSTMENT (could be tighter based on volatility)
    const dayState = getDayState();
    if (dayState.realizedLoss > 100) {
        stopLossPercent = MIN_STOP_LOSS_PERCENT * 0.8; // Tighter stop when already losing
        console.log(`🛑 TIGHTER STOP LOSS: ${stopLossPercent}% (Daily Loss: ${dayState.realizedLoss})`);
    }

    // Calculate actual price levels
    const takeProfitPrice = entryPrice * (1 + takeProfitPercent / 100);
    const stopLossPrice = entryPrice * (1 - stopLossPercent / 100);
    const emergencyStopPrice = entryPrice * (1 - EMERGENCY_STOP_LOSS_PERCENT / 100);

    return {
        takeProfitPercent,
        stopLossPercent,
        takeProfitPrice,
        stopLossPrice,
        emergencyStopPrice,
        dynamicReason: currentConfidence >= CONFIDENCE_THRESHOLD_HIGH ? 'EXTENDED' :
            currentConfidence >= CONFIDENCE_THRESHOLD_QUICK ? 'QUICK' : 'BASE'
    };
}
async function checkProfitsAndStopLosses(currentConfidence: number = 85) {
    try {
        console.log('💰 Checking positions for profit-taking AND stop-loss opportunities...');

        // Get current positions
        const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'clearinghouseState',
                user: USER_WALLET
            })
        });

        const perpState = await perpResponse.json();
        const positions = perpState?.assetPositions || [];

        if (positions.length === 0) {
            console.log('✅ No positions to check');
            return { profitsTaken: 0, totalProfit: 0, lossesStop: 0, totalLosses: 0 };
        }

        // Get current market prices
        const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'allMids' })
        });
        const allMids = await priceResponse.json();

        // Get fills for entry price calculation
        const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'userFills',
                user: USER_WALLET
            })
        });
        const fills = await fillsResponse.json();

        let profitsTaken = 0;
        let totalProfit = 0;
        let lossesStop = 0;
        let totalLosses = 0;

        // Check daily state for emergency stop
        const dayState = getDayState();
        const currentDailyLoss = Math.abs(dayState.realizedLoss); // Make positive for comparison

        console.log(`📊 Current Daily Loss: ${currentDailyLoss.toFixed(2)} / ${Math.abs(DAILY_TOTAL_STOP_LOSS)} limit`);

        for (const position of positions) {
            const coin = position.position.coin;
            const size = parseFloat(position.position.szi);
            const currentPrice = allMids[coin];

            if (!currentPrice) {
                console.log(`⚠️ No current price for ${coin}, skipping...`);
                continue;
            }

            // Find entry price from fills
            const coinFills = fills.filter((fill: any) => fill.coin === coin);
            const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

            if (!latestFill) {
                console.log(`⚠️ No fills found for ${coin}, skipping...`);
                continue;
            }

            const entryPrice = latestFill.px;
            const positionAge = Date.now() - latestFill.time;
            const ageMinutes = positionAge / (60 * 1000);

            // Calculate current profit/loss percentage and dollar amount
            const isLong = size > 0;
            const priceChangePercent = ((currentPrice - entryPrice) / entryPrice) * 100;
            const adjustedChangePercent = isLong ? priceChangePercent : -priceChangePercent;
            const unrealizedPnl = isLong ?
                (currentPrice - entryPrice) * Math.abs(size) :
                (entryPrice - currentPrice) * Math.abs(size);

            // Get dynamic profit/loss levels using actual prediction confidence
            const dynamicLevels = calculateDynamicProfitLoss(entryPrice, currentConfidence);

            console.log(`📊 ${coin} Position Analysis:`);
            console.log(`   Size: ${size}, Entry: ${entryPrice}, Current: ${currentPrice}`);
            console.log(`   Price Change: ${adjustedChangePercent.toFixed(3)}%, PnL: ${unrealizedPnl.toFixed(2)}`);
            console.log(`   🎯 Take Profit: ${dynamicLevels.takeProfitPercent}% (${dynamicLevels.takeProfitPrice.toFixed(0)})`);
            console.log(`   🛑 Stop Loss: ${dynamicLevels.stopLossPercent}% (${dynamicLevels.stopLossPrice.toFixed(0)})`);
            console.log(`   Age: ${ageMinutes.toFixed(1)} mins, Strategy: ${dynamicLevels.dynamicReason}`);

            // DECISION LOGIC - NOW PROPERLY using percentage-based levels
            let shouldClose = false;
            let reason = '';

            // 🛑 EMERGENCY STOP LOSS - Close ALL positions if daily loss too high
            if (currentDailyLoss >= DAILY_TOTAL_STOP_LOSS) {
                shouldClose = true;
                reason = `EMERGENCY_DAILY_LOSS_${currentDailyLoss.toFixed(2)}`;
            }
            // 🛑 EMERGENCY PERCENTAGE STOP LOSS (1.5%)
            else if ((isLong && currentPrice <= dynamicLevels.emergencyStopPrice) ||
                (!isLong && currentPrice >= (entryPrice * (1 + EMERGENCY_STOP_LOSS_PERCENT / 100)))) {
                shouldClose = true;
                reason = `EMERGENCY_STOP_${EMERGENCY_STOP_LOSS_PERCENT}%_${unrealizedPnl.toFixed(2)}`;
            }
            // 🛑 STANDARD PERCENTAGE STOP LOSS (0.5% or dynamic)
            else if ((isLong && currentPrice <= dynamicLevels.stopLossPrice) ||
                (!isLong && currentPrice >= (entryPrice * (1 + dynamicLevels.stopLossPercent / 100)))) {
                shouldClose = true;
                reason = `STOP_LOSS_${dynamicLevels.stopLossPercent}%_${unrealizedPnl.toFixed(2)}`;
            }
            // 💰 DYNAMIC PERCENTAGE-BASED PROFIT TAKING
            else if ((isLong && currentPrice >= dynamicLevels.takeProfitPrice) ||
                (!isLong && currentPrice <= (entryPrice * (1 - dynamicLevels.takeProfitPercent / 100)))) {
                shouldClose = true;
                reason = `${dynamicLevels.dynamicReason}_PROFIT_${dynamicLevels.takeProfitPercent}%_${unrealizedPnl.toFixed(2)}`;
            }
            // ⏰ TIME-BASED PROFIT TAKING (take any profit after time limit)
            else if (unrealizedPnl > 5 && ageMinutes >= MAX_POSITION_AGE_MINUTES) {
                shouldClose = true;
                reason = `TIME_BASED_PROFIT_${unrealizedPnl.toFixed(2)}_${ageMinutes.toFixed(1)}min`;
            }

            if (shouldClose) {
                const isProfit = unrealizedPnl > 0;
                const actionType = isProfit ? 'TAKING PROFITS' : 'CUTTING LOSSES';

                console.log(`${isProfit ? '💰' : '🛑'} ${actionType}: ${coin} - ${reason}`);

                const isBuy = size < 0; // If short, buy to close
                const closeResult = await guaranteedInstantClose(coin, size, isBuy, reason);

                if (closeResult.success) {
                    console.log(`✅ ${actionType} SUCCESSFUL: ${coin} - ${unrealizedPnl.toFixed(2)}`);

                    if (isProfit) {
                        profitsTaken++;
                        totalProfit += unrealizedPnl;
                    } else {
                        lossesStop++;
                        totalLosses += Math.abs(unrealizedPnl);
                    }

                    // Track the trade
                    if (closeResult.result?.response?.data?.statuses) {
                        const statuses = closeResult.result.response.data.statuses;
                        statuses.forEach((s: any) => {
                            if ('filled' in s && s.filled) {
                                const { avgPx, totalSz, oid } = s.filled;
                                const actualPnl = isLong ?
                                    (avgPx - entryPrice) * totalSz :
                                    (entryPrice - avgPx) * totalSz;

                                pushTrade({
                                    id: String(oid),
                                    pnl: actualPnl,
                                    side: isProfit ? `PROFIT_${reason}` : `STOP_${reason}`,
                                    size: totalSz,
                                    avgPrice: avgPx,
                                    leverage: position.position.leverage?.value || 1,
                                    timestamp: Date.now()
                                });
                            }
                        });
                    }
                } else {
                    console.error(`❌ Failed to ${actionType.toLowerCase()} on ${coin}: ${closeResult}`);
                }

                // Brief pause between closes
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Summary logging
        if (profitsTaken > 0 || lossesStop > 0) {
            console.log(`🏁 RISK MANAGEMENT SUMMARY:`);
            console.log(`   💰 Profits: ${profitsTaken} positions, ${totalProfit.toFixed(2)} total`);
            console.log(`   🛑 Losses: ${lossesStop} positions, ${totalLosses.toFixed(2)} total`);
            console.log(`   📊 Net: ${(totalProfit - totalLosses).toFixed(2)}`);
        }

        return { profitsTaken, totalProfit, lossesStop, totalLosses };

    } catch (error) {
        console.error('❌ Error in profit/loss management:', error);
        return { profitsTaken: 0, totalProfit: 0, lossesStop: 0, totalLosses: 0, error: error };
    }
}

// ——— AUTO-CLOSE OLD POSITIONS WITH GUARANTEED EXECUTION ————————————————————————
async function closeOldPositions() {
    try {
        console.log('🕐 Checking for positions older than 1 hour...');

        // Get current positions
        const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'clearinghouseState',
                user: USER_WALLET
            })
        });

        const perpState = await perpResponse.json();
        const positions = perpState?.assetPositions || [];

        if (positions.length === 0) {
            console.log('✅ No open positions to check');
            return { closedPositions: 0, freedMargin: 0 };
        }

        console.log(`📊 Found ${positions.length} open positions`);

        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        let closedPositions = 0;
        let freedMargin = 0;
        const closeResults = [];

        // Get fills for age calculation
        const fillsResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'userFills',
                user: USER_WALLET
            })
        });

        const fills = await fillsResponse.json();

        for (const position of positions) {
            const coin = position.position.coin;
            const size = parseFloat(position.position.szi);
            const marginUsed = parseFloat(position.position.marginUsed);

            // Find position age
            const coinFills = fills.filter((fill: any) => fill.coin === coin);
            const latestFill = coinFills.sort((a: any, b: any) => b.time - a.time)[0];

            if (!latestFill) {
                console.log(`⚠️ No fills found for ${coin}, skipping...`);
                continue;
            }

            const positionAge = Date.now() - latestFill.time;
            const ageHours = positionAge / (60 * 60 * 1000);

            console.log(`📊 ${coin}: ${size} | Age: ${ageHours.toFixed(2)}h | Margin: $${marginUsed}`);

            // Close old positions with GUARANTEED execution
            if (positionAge > (60 * 60 * 1000)) {
                console.log(`🔴 GUARANTEED CLOSING: ${coin} (${ageHours.toFixed(2)}h old)`);

                const isBuy = size < 0; // If short, buy to close

                // Use guaranteed close function
                const closeResult = await guaranteedInstantClose(coin, size, isBuy, `OLD_POSITION_${ageHours.toFixed(1)}h`);

                if (closeResult.success) {
                    console.log(`✅ SUCCESSFULLY CLOSED ${coin} using ${closeResult.method}`);
                    closedPositions++;
                    freedMargin += marginUsed;

                    closeResults.push({
                        coin,
                        method: closeResult.method,
                        success: true
                    });

                    // Track fills if available
                    if (closeResult.result?.response?.data?.statuses) {
                        const statuses = closeResult.result.response.data.statuses;
                        statuses.forEach((s: any) => {
                            if ('filled' in s && s.filled) {
                                const { avgPx, totalSz, oid } = s.filled;
                                const pnl = isBuy ?
                                    (latestFill.px - avgPx) * totalSz :
                                    (avgPx - latestFill.px) * totalSz;

                                console.log(`💰 ${coin} CLOSED: Entry: $${latestFill.px}, Exit: $${avgPx}, PnL: $${pnl.toFixed(2)}`);

                                pushTrade({
                                    id: String(oid),
                                    pnl,
                                    side: `CLOSE_${closeResult.method}`,
                                    size: totalSz,
                                    avgPrice: avgPx,
                                    leverage: position.position.leverage?.value || 1,
                                    timestamp: Date.now()
                                });
                            }
                        });
                    }
                } else {
                    console.error(`❌ FAILED to close ${coin} even with guaranteed method!`);
                    closeResults.push({
                        coin,
                        method: closeResult.method || 'UNKNOWN',
                        success: false,
                        error: closeResult
                    });
                }

                // Brief pause between closes
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`🏁 CLOSE SUMMARY: ${closedPositions}/${positions.length} positions closed, $${freedMargin.toFixed(2)} margin freed`);

        return {
            closedPositions,
            freedMargin,
            closeResults,
            totalPositions: positions.length
        };

    } catch (error) {
        console.error('❌ Error in guaranteed position closing:', error);
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

// ——— Main Cron Handler with PROFIT TAKING ————————————————————————————————————————————————
export async function GET() {
    try {
        // 🕐 STEP 1: Check for profit-taking AND stop-loss opportunities FIRST
        console.log('💰🛑 Step 1: Checking for profit-taking AND stop-loss opportunities...');
        const profitLossResult = await checkProfitsAndStopLosses();

        if (profitLossResult.profitsTaken > 0 || profitLossResult.lossesStop > 0) {
            console.log(`🎯 RISK MANAGEMENT COMPLETE:`);
            console.log(`   💰 Profits: ${profitLossResult.profitsTaken} positions, ${profitLossResult.totalProfit.toFixed(2)}`);
            console.log(`   🛑 Losses: ${profitLossResult.lossesStop} positions, ${profitLossResult.totalLosses.toFixed(2)}`);
            console.log(`   📊 Net Impact: ${(profitLossResult.totalProfit - profitLossResult.totalLosses).toFixed(2)}`);
        }

        // 🕐 STEP 2: Close old positions BEFORE anything else
        console.log('🕐 Step 2: Auto-closing positions older than 1 hour...');
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
            return NextResponse.json({
                message: 'No trade signal',
                profitsTaken: profitLossResult.profitsTaken,
                profitAmount: profitLossResult.totalProfit,
                lossesStop: profitLossResult.lossesStop,
                lossAmount: profitLossResult.totalLosses,
                oldPositionsClosed: closeResult.closedPositions,
                marginFreed: closeResult.freedMargin
            });
        }

        // 3️⃣ Check daily loss limit BEFORE sizing
        const dayState = getDayState();
        if (dayState.realizedLoss >= DAILY_LOSS_LIMIT) {
            console.log(`🛑 Daily loss limit reached (${DAILY_LOSS_LIMIT}). Stopping trades.`);
            return NextResponse.json({
                message: `Daily loss limit reached: ${dayState.realizedLoss}`,
                profitsTaken: profitLossResult.profitsTaken,
                profitAmount: profitLossResult.totalProfit,
                lossesStop: profitLossResult.lossesStop,
                lossAmount: profitLossResult.totalLosses,
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
                balanceInfo,
                profitsTaken: profitLossResult.profitsTaken,
                profitAmount: profitLossResult.totalProfit,
                lossesStop: profitLossResult.lossesStop,
                lossAmount: profitLossResult.totalLosses
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
                    spotAmount: balanceInfo.spotAmount,
                    profitsTaken: profitLossResult.profitsTaken,
                    profitAmount: profitLossResult.totalProfit,
                    lossesStop: profitLossResult.lossesStop,
                    lossAmount: profitLossResult.totalLosses
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
                positionCalc,
                profitsTaken: profitLossResult.profitsTaken,
                profitAmount: profitLossResult.totalProfit,
                lossesStop: profitLossResult.lossesStop,
                lossAmount: profitLossResult.totalLosses
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

        // 5️⃣ Build the SDK order params with AGGRESSIVE SLIPPAGE for instant fills
        const coin = 'BTC-PERP';
        const isBuy = slot.signal === 'LONG';

        // USE AGGRESSIVE PRICING for instant fills instead of exact forecast price
        const currentMarketPrice = (await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'allMids' })
        }).then(r => r.json()))['BTC'];

        // Use market price with 1% slippage for instant fills
        const aggressivePrice = isBuy ?
            Math.round(currentMarketPrice * 1.01) : // 1% above market for buys
            Math.round(currentMarketPrice * 0.99);  // 1% below market for sells

        console.log(`💰 Pricing Strategy: Market: $${currentMarketPrice}, Order: $${aggressivePrice} (${isBuy ? '+1%' : '-1%'} for instant fill)`);

        const orderParams = {
            coin,
            is_buy: isBuy,
            sz: Number(positionCalc.size),
            limit_px: aggressivePrice, // Use aggressive price instead of forecast price
            order_type: { limit: { tif: 'Ioc' as Tif } }, // Changed to IoC for instant fills
            reduce_only: false,
            ...(slot.take_profit != null && { tp: Number(slot.take_profit) }),
            ...(slot.stop_loss != null && { sl: Number(slot.stop_loss) })
        };

        console.log('📤 Placing INSTANT-FILL order with params:', orderParams);

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
                const pnl = (isBuy ? avgPx - aggressivePrice : aggressivePrice - avgPx) * totalSz;
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
            profitsTaken: profitLossResult.profitsTaken,
            profitAmount: profitLossResult.totalProfit,
            lossesStop: profitLossResult.lossesStop,
            lossAmount: profitLossResult.totalLosses,
            netRiskManagement: profitLossResult.totalProfit - profitLossResult.totalLosses,
            oldPositionsClosed: closeResult.closedPositions,
            marginFreed: closeResult.freedMargin,
            forecastSlot: slot,
            pricingStrategy: {
                forecastPrice: price,
                marketPrice: currentMarketPrice,
                orderPrice: aggressivePrice,
                slippage: isBuy ? '+1.0%' : '-1.0%',
                reason: 'INSTANT_FILL_GUARANTEE'
            },
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
                price: aggressivePrice, // Return actual order price, not forecast price
                size: positionCalc.size,
                leverage: positionCalc.leverage
            },
            sdkResponse: result
        };

        console.log('📤 [Returning ENHANCED Payload with Profit Taking & Stop Losses]', JSON.stringify(payload, null, 2));
        return NextResponse.json(payload);

    } catch (err: any) {
        console.error('❌ Cron order error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}