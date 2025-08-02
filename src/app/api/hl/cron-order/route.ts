

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
// const CAPITAL_USAGE_PERCENT = 0.30; // Use 90% of available USDC per trade
// const MAX_LEVERAGE = 25; // Increased for higher profits
// const MIN_LEVERAGE = 5;  // Higher minimum for aggressive targets

// // ——— DYNAMIC PERCENTAGE-BASED PROFIT/LOSS CONSTANTS ————————————————————————————————————————
// const BASE_TAKE_PROFIT_PERCENT = 2.0;     // 2% base take profit
// const MIN_STOP_LOSS_PERCENT = 0.25;        // 0.5% minimum stop loss
// const EMERGENCY_STOP_LOSS_PERCENT = 1.0;  // 1.5% emergency stop loss
// const MAX_POSITION_AGE_MINUTES = 30;      // Close profitable positions after 30 minutes

// // ——— FIXED DOLLAR PROFIT TARGETS (LEVERAGE-INDEPENDENT) ————————————————————————————————————————
// const MAX_PROFIT_TARGET = 100;            // Close at $100 profit (maximum target)
// const MIN_PROFIT_TARGET = 50;             // Close at $50 profit (minimum target)

// // ——— DYNAMIC PROFIT SCALING FACTORS ————————————————————————————————————————
// const QUICK_PROFIT_MULTIPLIER = 1.5;      // 3% take profit for high confidence
// const EXTENDED_PROFIT_MULTIPLIER = 2.0;   // 4% take profit for very high confidence  
// const CONFIDENCE_THRESHOLD_HIGH = 95;     // Above 95% confidence = extended profits
// const CONFIDENCE_THRESHOLD_QUICK = 90;    // Above 90% confidence = quick profits
// const DAILY_TOTAL_STOP_LOSS = 150;

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

import { NextResponse } from 'next/server';
import { Hyperliquid, Tif } from 'hyperliquid';
import { getDayState, pushTrade } from '@/lib/dayState';

export const runtime = 'nodejs';

// ——— TYPESCRIPT INTERFACES & TYPES ————————————————————————————————————————

interface EnvironmentVariables {
    NEXT_PUBLIC_HL_PRIVATE_KEY: string;
    NEXT_PUBLIC_HL_MAIN_WALLET: string;
    NEXT_PUBLIC_HL_USER_WALLET: string;
    NEXT_PUBLIC_API_KEY: string;
}

interface TradingSignal {
    signal: 'LONG' | 'SHORT' | 'HOLD';
    forecast_price: number;
    take_profit?: number;
    stop_loss?: number;
    confidence_90?: [number, number];
}

interface ForecastAPIResponse {
    forecast_today_hourly: TradingSignal[];
}

interface BalanceInfo {
    totalUSDC: number;
    availableMargin: number;
    source: 'perpetuals' | 'spot';
    error?: Error;
}

interface PositionCalculation {
    size: number;
    leverage: number;
    capitalUsed: number;
    positionValue: number;
    maxRisk: number;
    expectedProfit1Percent: number;
    expectedProfit2Percent: number;
    accountUsagePercent: number;
    riskRewardRatio: number;
}

interface OrderResult {
    success: boolean;
    result?: any;
    pricing?: {
        marketPrice: number;
        orderPrice: number;
    };
    error?: any;
}

interface HyperliquidOrderParams {
    coin: string;
    is_buy: boolean;
    sz: number;
    limit_px: number;
    order_type: { limit: { tif: Tif } };
    reduce_only: boolean;
}

interface HyperliquidFillStatus {
    filled?: {
        avgPx: number;
        totalSz: number;
        oid: string;
    };
}

interface HyperliquidOrderResponse {
    status: 'ok' | 'err';
    response?: {
        data?: {
            statuses?: HyperliquidFillStatus[];
        };
    };
}

interface TradeAction {
    action: 'HOLD' | 'AI_TAKE_PROFIT' | 'AI_STOP_LOSS' | 'EMERGENCY_ZONE4_STOP' |
    'ZONE3_PARTIAL_CLOSE' | 'ZONE2_PARTIAL_CLOSE' | 'ZONE1_TIME_STOP' |
    'RECOVERY_PROFIT_SECURE' | 'RECOVERY_PROTECTION' | 'HOLD_RECOVERY' |
    'RECOVERY_TIMEOUT' | 'BIG_WIN_PARTIAL' | 'START_TRAILING' | 'PARTIAL_PROFIT' |
    'SECURE_PROFIT' | 'TIME_PROFIT_EXIT' | 'TIME_SMALL_LOSS_EXIT' | 'DRAWDOWN_PROTECTION';
    percentage?: number;
    reason: string;
    priority?: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface PartialClose {
    percentage: number;
    reason: string;
    zone: number;
    timestamp: number;
}

interface TradeActionRecord {
    action: string;
    reason: string;
    percentage: number;
    pnl: number;
    timestamp: number;
    zone: number;
}

interface Trade {
    tradeId: string;
    entryPrice: number;
    originalSize: number;
    currentSize: number;
    leverage: number;
    entryTime: number;

    // AI targets
    aiTakeProfit?: number;
    aiStopLoss?: number;
    confidence: number;

    // Current state
    currentPrice: number;
    unrealizedPnl: number;
    maxProfit: number;
    maxLoss: number;

    // Recovery zone tracking
    currentZone: 1 | 2 | 3 | 4;
    zoneChangeTime: number;
    partialCloses: PartialClose[];

    // Quick recovery tracking
    recoveryMode: boolean;
    recoveryStartPrice: number | null;
    recoveryStartTime: number | null;
    rapidRecoveryDetected: boolean;
    recoveryAttempts: number;

    // Micro-management flags
    profitSecured: boolean;
    partialTaken: boolean;
    trailingActive: boolean;

    // Actions log
    actions: TradeActionRecord[];

    // Trade metadata
    isLong: boolean;
    originalSignal: 'LONG' | 'SHORT';
}

interface DailyStats {
    tradesPlaced: number;
    profitableTrades: number;
    totalProfit: number;
    totalLoss: number;
    bigWins: number;
    microProfitsSecured: number;
    aiTPHits: number;
    aiSLHits: number;
    quickRecoveries: number;
    avgTradeTime: number;
    recoverySuccesses: number;
    emergencyStops: number;
    netPnl: string;
    winRate: string;
    activeTrades: number;
    avgPnlPerTrade: string;
    recoveryAttempts: number;
    recoverySuccessRate: string;
}

interface RecoveryHistoryEntry {
    tradeId: string;
    initialLoss: number;
    finalPnl: number;
    recoveryAttempts: number;
    rapidRecovery: boolean;
    success: boolean;
}

interface ExecutionResult {
    success: boolean;
    pnl?: number;
    error?: string;
}

interface CloseResult {
    success: boolean;
    result?: HyperliquidOrderResponse;
    method: string;
    error?: any;
}

interface APIErrorResponse {
    error: string;
    timestamp?: string;
    dailyStats?: DailyStats;
}

interface APISuccessResponse {
    success: boolean;
    timestamp: string;
    newTrade?: {
        tradeId: string | null;
        signal: string;
        confidence: number;
        entryPrice?: number;
        size: number;
        leverage: number;
        capitalUsed: number;
        positionValue: number;
        expectedProfit1Percent: number;
        expectedProfit2Percent: number;
        maxRisk: number;
        riskRewardRatio: number;
        aiTakeProfit?: number;
        aiStopLoss?: number;
    };
    systemStatus: {
        activeTrades: number;
        maxConcurrentTrades: number;
        totalAccountUsed: string;
        availableForNextTrade: boolean;
        dailyLossUsed: number;
        dailyLossLimit: number;
        remainingCapacity: number;
    };
    dailyStats: DailyStats;
    orderExecution: {
        success: boolean;
        marketPrice?: number;
        orderPrice?: number;
        microManagementActive: boolean;
        recoverySystemActive: boolean;
    };
}

// ——— SDK Configuration with Type Safety ————————————————————————————————————————————————
const env = process.env as unknown as EnvironmentVariables;

const PK: string = env.NEXT_PUBLIC_HL_PRIVATE_KEY;
const MAIN_WALLET_RAW: string = env.NEXT_PUBLIC_HL_MAIN_WALLET;
const USER_WALLET_RAW: string = env.NEXT_PUBLIC_HL_USER_WALLET;

if (!PK) throw new Error('HL_PRIVATE_KEY missing in env');
if (!MAIN_WALLET_RAW) throw new Error('HL_MAIN_WALLET missing in env');
if (!USER_WALLET_RAW) throw new Error('USER_WALLET_RAW missing in env');

const MAIN_WALLET: string = MAIN_WALLET_RAW;
const USER_WALLET: string = USER_WALLET_RAW;

const sdk = new Hyperliquid({
    privateKey: PK,
    walletAddress: MAIN_WALLET,
    testnet: false
});

// ——— TYPED CONSTANTS ————————————————————————————————————————
const AGGRESSIVE_CONSTANTS = {
    // Risk limits per trade
    MAX_LOSS_PER_TRADE: 10 as const,
    MIN_PROFIT_TARGET: 10 as const,
    OPTIMAL_PROFIT_TARGET: 25 as const,
    BIG_WIN_TARGET: 100 as const,
    DAILY_LOSS_LIMIT: 100 as const,

    // Position sizing
    CAPITAL_PER_TRADE_PERCENT: 0.30 as const,

    // Leverage system
    MIN_LEVERAGE: 5 as const,
    MAX_LEVERAGE: 20 as const,

    // Recovery detection
    RECOVERY_WATCH_LOSS: 7 as const,
    QUICK_RECOVERY_SECONDS: 180 as const,
    RAPID_RECOVERY_PERCENT: 0.15 as const,
    RECOVERY_HOLD_TIME: 300 as const,

    // Profit management
    SECURE_PROFIT_AT: 12 as const,
    PARTIAL_PROFIT_AT: 20 as const,
    TRAIL_FROM: 40 as const,

    // Time management
    PROFIT_PROTECTION_START: 5 as const,
    FINAL_EXIT_MINUTES: 55 as const,
    CHECK_INTERVAL: 30 as const,

    // Concurrent trades
    MAX_CONCURRENT_TRADES: 2 as const
} as const;

const RECOVERY_ZONES = {
    ZONE_1_LOSS_THRESHOLD: 8 as const,
    ZONE_1_TIME_LIMIT: 15 as const,

    ZONE_2_LOSS_THRESHOLD: 15 as const,
    ZONE_2_TIME_LIMIT: 30 as const,
    ZONE_2_PARTIAL_CLOSE: 0.4 as const,

    ZONE_3_LOSS_THRESHOLD: 25 as const,
    ZONE_3_TIME_LIMIT: 45 as const,
    ZONE_3_PARTIAL_CLOSE: 0.7 as const,

    ZONE_4_LOSS_THRESHOLD: 35 as const,
    ZONE_4_IMMEDIATE_CLOSE: true as const
} as const;

// ——— TYPED TRADE MANAGER CLASS ————————————————————————————————————————
class AggressiveTradeManager {
    private activeTrades: Map<string, Trade>;
    private dailyStats: Omit<DailyStats, 'netPnl' | 'winRate' | 'activeTrades' | 'avgPnlPerTrade' | 'recoveryAttempts' | 'recoverySuccessRate'>;
    private recoveryHistory: RecoveryHistoryEntry[];

    constructor() {
        this.activeTrades = new Map<string, Trade>();
        this.dailyStats = this.initDailyStats();
        this.recoveryHistory = [];
    }

    private initDailyStats(): Omit<DailyStats, 'netPnl' | 'winRate' | 'activeTrades' | 'avgPnlPerTrade' | 'recoveryAttempts' | 'recoverySuccessRate'> {
        return {
            tradesPlaced: 0,
            profitableTrades: 0,
            totalProfit: 0,
            totalLoss: 0,
            bigWins: 0,
            microProfitsSecured: 0,
            aiTPHits: 0,
            aiSLHits: 0,
            quickRecoveries: 0,
            avgTradeTime: 0,
            recoverySuccesses: 0,
            emergencyStops: 0
        };
    }

    public startTrade(signal: TradingSignal, entryPrice: number, size: number, leverage: number): string {
        const tradeId: string = `AGG_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const trade: Trade = {
            tradeId,
            entryPrice,
            originalSize: size,
            currentSize: size,
            leverage,
            entryTime: Date.now(),

            // AI's original targets
            aiTakeProfit: signal.take_profit,
            aiStopLoss: signal.stop_loss,
            confidence: signal.confidence_90?.[1] || 85,

            // Current state
            currentPrice: entryPrice,
            unrealizedPnl: 0,
            maxProfit: 0,
            maxLoss: 0,

            // Recovery zone tracking
            currentZone: 1,
            zoneChangeTime: Date.now(),
            partialCloses: [],

            // Quick recovery tracking
            recoveryMode: false,
            recoveryStartPrice: null,
            recoveryStartTime: null,
            rapidRecoveryDetected: false,
            recoveryAttempts: 0,

            // Micro-management flags
            profitSecured: false,
            partialTaken: false,
            trailingActive: false,

            // Actions log
            actions: [],

            // Trade metadata
            isLong: size > 0,
            originalSignal: signal.signal as 'LONG' | 'SHORT'
        };

        this.activeTrades.set(tradeId, trade);
        this.dailyStats.tradesPlaced++;

        console.log(`🚀 NEW AGGRESSIVE TRADE: ${tradeId}`);
        console.log(`   Signal: ${signal.signal}, Entry: $${entryPrice}`);
        console.log(`   AI TP: $${signal.take_profit || 'N/A'}, AI SL: $${signal.stop_loss || 'N/A'}`);
        console.log(`   Size: ${size}, Leverage: ${leverage}x, Confidence: ${trade.confidence}%`);

        return tradeId;
    }

    public updateTrade(tradeId: string, currentPrice: number): TradeAction | null {
        const trade = this.activeTrades.get(tradeId);
        if (!trade) return null;

        // Update price and PnL
        trade.currentPrice = currentPrice;
        const priceChange: number = currentPrice - trade.entryPrice;
        const pnlPercent: number = (priceChange / trade.entryPrice) * 100;
        const adjustedPnlPercent: number = trade.isLong ? pnlPercent : -pnlPercent;
        trade.unrealizedPnl = (adjustedPnlPercent * Math.abs(trade.currentSize) * trade.entryPrice * trade.leverage) / 100;

        // Update max profit/loss
        trade.maxProfit = Math.max(trade.maxProfit, trade.unrealizedPnl);
        trade.maxLoss = Math.min(trade.maxLoss, trade.unrealizedPnl);

        // Update recovery zone
        this.updateRecoveryZone(trade);

        // Quick recovery detection
        this.detectQuickRecovery(trade);

        // Get management action
        return this.getTradeAction(trade);
    }

    private updateRecoveryZone(trade: Trade): void {
        const absLoss: number = Math.abs(trade.unrealizedPnl);
        let newZone: 1 | 2 | 3 | 4 = 1;

        if (absLoss >= RECOVERY_ZONES.ZONE_4_LOSS_THRESHOLD) newZone = 4;
        else if (absLoss >= RECOVERY_ZONES.ZONE_3_LOSS_THRESHOLD) newZone = 3;
        else if (absLoss >= RECOVERY_ZONES.ZONE_2_LOSS_THRESHOLD) newZone = 2;

        if (newZone !== trade.currentZone) {
            console.log(`🔄 ${trade.tradeId}: Zone change ${trade.currentZone} → ${newZone}`);
            trade.currentZone = newZone;
            trade.zoneChangeTime = Date.now();
        }
    }

    private detectQuickRecovery(trade: Trade): void {
        const pnl: number = trade.unrealizedPnl;

        // Enter recovery mode if loss exceeds threshold
        if (!trade.recoveryMode && Math.abs(pnl) >= AGGRESSIVE_CONSTANTS.RECOVERY_WATCH_LOSS) {
            trade.recoveryMode = true;
            trade.recoveryStartPrice = trade.currentPrice;
            trade.recoveryStartTime = Date.now();
            trade.recoveryAttempts++;

            console.log(`🔍 ${trade.tradeId}: RECOVERY MODE at $${pnl.toFixed(2)} loss (Attempt ${trade.recoveryAttempts})`);
        }

        // Detect rapid recovery if in recovery mode
        if (trade.recoveryMode && trade.recoveryStartPrice !== null && trade.recoveryStartTime !== null) {
            const recoveryPercent: number = Math.abs((trade.currentPrice - trade.recoveryStartPrice) / trade.recoveryStartPrice) * 100;
            const timeInRecovery: number = Date.now() - trade.recoveryStartTime;

            // Rapid recovery detection
            if (recoveryPercent >= AGGRESSIVE_CONSTANTS.RAPID_RECOVERY_PERCENT &&
                timeInRecovery <= AGGRESSIVE_CONSTANTS.QUICK_RECOVERY_SECONDS * 1000) {
                trade.rapidRecoveryDetected = true;
                this.dailyStats.quickRecoveries++;

                console.log(`⚡ ${trade.tradeId}: RAPID RECOVERY! ${recoveryPercent.toFixed(2)}% in ${(timeInRecovery / 1000).toFixed(0)}s`);
            }
        }
    }

    private getTradeAction(trade: Trade): TradeAction {
        const pnl: number = trade.unrealizedPnl;
        const ageMinutes: number = (Date.now() - trade.entryTime) / (60 * 1000);
        const currentPrice: number = trade.currentPrice;
        const absLoss: number = Math.abs(pnl);

        // AI's take profit / stop loss
        if (trade.aiTakeProfit &&
            ((trade.isLong && currentPrice >= trade.aiTakeProfit) ||
                (!trade.isLong && currentPrice <= trade.aiTakeProfit))) {
            this.dailyStats.aiTPHits++;
            return {
                action: 'AI_TAKE_PROFIT',
                percentage: 1.0,
                reason: `AI_TP_HIT_$${pnl.toFixed(2)}`,
                priority: 'IMMEDIATE'
            };
        }

        if (trade.aiStopLoss &&
            ((trade.isLong && currentPrice <= trade.aiStopLoss) ||
                (!trade.isLong && currentPrice >= trade.aiStopLoss))) {
            this.dailyStats.aiSLHits++;
            return {
                action: 'AI_STOP_LOSS',
                percentage: 1.0,
                reason: `AI_SL_HIT_$${pnl.toFixed(2)}`,
                priority: 'IMMEDIATE'
            };
        }

        // Recovery zone management for losing trades
        if (pnl < 0) {
            const zoneAction: TradeAction = this.getRecoveryZoneAction(trade, ageMinutes);
            if (zoneAction.action !== 'HOLD') {
                return zoneAction;
            }
        }

        // Quick recovery handling
        if (trade.rapidRecoveryDetected && trade.recoveryStartTime !== null) {
            const timeInRecovery: number = Date.now() - trade.recoveryStartTime;

            if (timeInRecovery <= AGGRESSIVE_CONSTANTS.RECOVERY_HOLD_TIME * 1000) {
                if (pnl >= AGGRESSIVE_CONSTANTS.MIN_PROFIT_TARGET) {
                    return {
                        action: 'RECOVERY_PROFIT_SECURE',
                        percentage: 0.6,
                        reason: `RECOVERY_SUCCESS_$${pnl.toFixed(2)}`,
                        priority: 'HIGH'
                    };
                }

                if (absLoss >= 8 && !trade.partialCloses.some(pc => pc.reason.includes('RECOVERY'))) {
                    return {
                        action: 'RECOVERY_PROTECTION',
                        percentage: 0.5,
                        reason: `RECOVERY_PROTECTION_$${pnl.toFixed(2)}`,
                        priority: 'HIGH'
                    };
                }

                return {
                    action: 'HOLD_RECOVERY',
                    reason: `RAPID_RECOVERY_HOLD_${(timeInRecovery / 1000).toFixed(0)}s`,
                    priority: 'MEDIUM'
                };
            } else {
                return {
                    action: 'RECOVERY_TIMEOUT',
                    percentage: 1.0,
                    reason: `RECOVERY_TIMEOUT_$${pnl.toFixed(2)}`,
                    priority: 'HIGH'
                };
            }
        }

        // Aggressive profit management
        if (pnl >= AGGRESSIVE_CONSTANTS.BIG_WIN_TARGET && !trade.partialTaken) {
            return {
                action: 'BIG_WIN_PARTIAL',
                percentage: 0.7,
                reason: `BIG_WIN_$${pnl.toFixed(2)}`,
                priority: 'HIGH'
            };
        }

        if (pnl >= AGGRESSIVE_CONSTANTS.TRAIL_FROM && !trade.trailingActive) {
            trade.trailingActive = true;
            return {
                action: 'START_TRAILING',
                reason: `TRAIL_FROM_$${pnl.toFixed(2)}`,
                priority: 'LOW'
            };
        }

        if (pnl >= AGGRESSIVE_CONSTANTS.PARTIAL_PROFIT_AT && !trade.partialTaken) {
            return {
                action: 'PARTIAL_PROFIT',
                percentage: 0.5,
                reason: `PARTIAL_$${pnl.toFixed(2)}`,
                priority: 'MEDIUM'
            };
        }

        if (pnl >= AGGRESSIVE_CONSTANTS.SECURE_PROFIT_AT && !trade.profitSecured) {
            return {
                action: 'SECURE_PROFIT',
                percentage: 0.3,
                reason: `SECURE_$${pnl.toFixed(2)}`,
                priority: 'MEDIUM'
            };
        }

        // Time-based management
        if (ageMinutes >= AGGRESSIVE_CONSTANTS.FINAL_EXIT_MINUTES) {
            if (pnl >= AGGRESSIVE_CONSTANTS.MIN_PROFIT_TARGET) {
                return {
                    action: 'TIME_PROFIT_EXIT',
                    percentage: 1.0,
                    reason: `TIME_EXIT_PROFIT_$${pnl.toFixed(2)}`,
                    priority: 'HIGH'
                };
            } else if (pnl >= -5) {
                return {
                    action: 'TIME_SMALL_LOSS_EXIT',
                    percentage: 1.0,
                    reason: `TIME_EXIT_SMALL_LOSS_$${pnl.toFixed(2)}`,
                    priority: 'HIGH'
                };
            }
        }

        // Profit protection after time
        if (ageMinutes >= AGGRESSIVE_CONSTANTS.PROFIT_PROTECTION_START &&
            pnl >= AGGRESSIVE_CONSTANTS.MIN_PROFIT_TARGET) {
            const drawdownFromMax: number = trade.maxProfit - pnl;
            if (drawdownFromMax >= 8) {
                return {
                    action: 'DRAWDOWN_PROTECTION',
                    percentage: 0.6,
                    reason: `PROTECT_$${pnl.toFixed(2)}_FROM_MAX_$${trade.maxProfit.toFixed(2)}`,
                    priority: 'MEDIUM'
                };
            }
        }

        return { action: 'HOLD', reason: 'MONITORING' };
    }

    private getRecoveryZoneAction(trade: Trade, ageMinutes: number): TradeAction {
        const pnl: number = trade.unrealizedPnl;
        const absLoss: number = Math.abs(pnl);
        const zone: number = trade.currentZone;

        // Zone 4: Emergency stop
        if (zone === 4 || absLoss >= AGGRESSIVE_CONSTANTS.MAX_LOSS_PER_TRADE) {
            this.dailyStats.emergencyStops++;
            return {
                action: 'EMERGENCY_ZONE4_STOP',
                percentage: 1.0,
                reason: `ZONE4_EMERGENCY_$${absLoss.toFixed(2)}`,
                priority: 'IMMEDIATE'
            };
        }

        // Zone 3: Deep recovery
        if (zone === 3) {
            const hasZone3Close: boolean = trade.partialCloses.some(pc => pc.zone === 3);

            if (ageMinutes >= RECOVERY_ZONES.ZONE_3_TIME_LIMIT) {
                return {
                    action: 'ZONE3_PARTIAL_CLOSE',
                    percentage: 1.0,
                    reason: `ZONE3_TIME_LIMIT_${ageMinutes.toFixed(1)}min`,
                    priority: 'HIGH'
                };
            }

            if (!hasZone3Close) {
                return {
                    action: 'ZONE3_PARTIAL_CLOSE',
                    percentage: RECOVERY_ZONES.ZONE_3_PARTIAL_CLOSE,
                    reason: `ZONE3_RISK_REDUCTION_$${absLoss.toFixed(2)}`,
                    priority: 'HIGH'
                };
            }
        }

        // Zone 2: Recovery watch
        if (zone === 2) {
            const hasZone2Close: boolean = trade.partialCloses.some(pc => pc.zone === 2);

            if (ageMinutes >= RECOVERY_ZONES.ZONE_2_TIME_LIMIT) {
                return {
                    action: 'ZONE2_PARTIAL_CLOSE',
                    percentage: 1.0,
                    reason: `ZONE2_TIME_LIMIT_${ageMinutes.toFixed(1)}min`,
                    priority: 'HIGH'
                };
            }

            if (!hasZone2Close) {
                return {
                    action: 'ZONE2_PARTIAL_CLOSE',
                    percentage: RECOVERY_ZONES.ZONE_2_PARTIAL_CLOSE,
                    reason: `ZONE2_RISK_REDUCTION_$${absLoss.toFixed(2)}`,
                    priority: 'MEDIUM'
                };
            }
        }

        // Zone 1: Normal operations
        if (zone === 1 && ageMinutes >= RECOVERY_ZONES.ZONE_1_TIME_LIMIT && pnl < -5) {
            return {
                action: 'ZONE1_TIME_STOP',
                percentage: 1.0,
                reason: `ZONE1_TIME_STOP_${ageMinutes.toFixed(1)}min`,
                priority: 'MEDIUM'
            };
        }

        return { action: 'HOLD', reason: `ZONE${zone}_MONITORING` };
    }

    public async executeAction(tradeId: string, action: TradeAction): Promise<ExecutionResult> {
        const trade = this.activeTrades.get(tradeId);
        if (!trade) return { success: false, error: 'Trade not found' };

        try {
            const coin = 'BTC';
            const isBuy: boolean = !trade.isLong;
            let sizeToClose: number = Math.abs(trade.currentSize);

            if (action.percentage && action.percentage < 1.0) {
                sizeToClose = sizeToClose * action.percentage;
            }

            const closeResult: CloseResult = await guaranteedInstantClose(
                coin,
                sizeToClose,
                isBuy,
                action.reason
            );

            if (closeResult.success) {
                const actualPnl: number = trade.unrealizedPnl * (action.percentage || 1.0);

                // Record action
                const actionRecord: TradeActionRecord = {
                    action: action.action,
                    reason: action.reason,
                    percentage: action.percentage || 1.0,
                    pnl: actualPnl,
                    timestamp: Date.now(),
                    zone: trade.currentZone
                };
                trade.actions.push(actionRecord);

                // Record partial close for zone tracking
                if (action.percentage && action.percentage < 1.0) {
                    const partialClose: PartialClose = {
                        percentage: action.percentage,
                        reason: action.reason,
                        zone: trade.currentZone,
                        timestamp: Date.now()
                    };
                    trade.partialCloses.push(partialClose);
                }

                // Update flags
                if (action.action.includes('SECURE')) {
                    trade.profitSecured = true;
                    this.dailyStats.microProfitsSecured++;
                }
                if (action.action.includes('PARTIAL')) {
                    trade.partialTaken = true;
                }
                if (action.action.includes('RECOVERY_SUCCESS')) {
                    this.dailyStats.recoverySuccesses++;
                }

                // If full close, complete trade
                if ((action.percentage || 1.0) >= 1.0) {
                    this.completeTrade(tradeId, trade.unrealizedPnl, action.reason);
                } else {
                    // Update position size for partial close
                    trade.currentSize *= (1 - (action.percentage || 1.0));
                }

                console.log(`✅ ${trade.tradeId}: ${action.action} - $${actualPnl.toFixed(2)}`);
                return { success: true, pnl: actualPnl };
            }

            return { success: false, error: closeResult.error };

        } catch (error) {
            console.error('❌ Action execution error:', error);
            return { success: false, error: String(error) };
        }
    }

    private completeTrade(tradeId: string, finalPnl: number, reason: string): void {
        const trade = this.activeTrades.get(tradeId);
        if (!trade) return;

        const tradeDuration: number = (Date.now() - trade.entryTime) / (60 * 1000);

        // Update daily stats
        if (finalPnl > 0) {
            this.dailyStats.profitableTrades++;
            this.dailyStats.totalProfit += finalPnl;
            if (finalPnl >= AGGRESSIVE_CONSTANTS.BIG_WIN_TARGET) {
                this.dailyStats.bigWins++;
            }
        } else {
            this.dailyStats.totalLoss += Math.abs(finalPnl);
        }

        // Track recovery if applicable
        if (trade.recoveryMode) {
            const recoveryEntry: RecoveryHistoryEntry = {
                tradeId,
                initialLoss: trade.maxLoss,
                finalPnl,
                recoveryAttempts: trade.recoveryAttempts,
                rapidRecovery: trade.rapidRecoveryDetected,
                success: finalPnl > trade.maxLoss * 0.5
            };
            this.recoveryHistory.push(recoveryEntry);
        }

        // Update average trade time
        this.dailyStats.avgTradeTime = (this.dailyStats.avgTradeTime * (this.dailyStats.tradesPlaced - 1) + tradeDuration) / this.dailyStats.tradesPlaced;

        console.log(`🏁 TRADE COMPLETE: ${tradeId}`);
        console.log(`   Duration: ${tradeDuration.toFixed(1)} min`);
        console.log(`   Final PnL: $${finalPnl.toFixed(2)}`);
        console.log(`   Max Profit: $${trade.maxProfit.toFixed(2)}`);
        console.log(`   Max Loss: $${trade.maxLoss.toFixed(2)}`);
        console.log(`   Actions: ${trade.actions.length}`);
        console.log(`   Recovery: ${trade.recoveryMode ? (trade.rapidRecoveryDetected ? 'RAPID' : 'ATTEMPTED') : 'NONE'}`);
        console.log(`   Reason: ${reason}`);

        this.activeTrades.delete(tradeId);

        // Push to day state
        pushTrade({
            id: tradeId,
            pnl: finalPnl,
            side: reason,
            size: Math.abs(trade.originalSize),
            avgPrice: trade.entryPrice,
            leverage: trade.leverage,
            timestamp: Date.now()
        });
    }

    public getDailyStats(): DailyStats {
        const netPnl: number = this.dailyStats.totalProfit - this.dailyStats.totalLoss;
        const winRate: number = this.dailyStats.tradesPlaced > 0
            ? (this.dailyStats.profitableTrades / this.dailyStats.tradesPlaced * 100)
            : 0;

        const recoverySuccessRate: number = this.recoveryHistory.length > 0
            ? (this.recoveryHistory.filter(r => r.success).length / this.recoveryHistory.length * 100)
            : 0;

        return {
            ...this.dailyStats,
            netPnl: netPnl.toFixed(2),
            winRate: winRate.toFixed(1),
            activeTrades: this.activeTrades.size,
            avgPnlPerTrade: this.dailyStats.tradesPlaced > 0
                ? (netPnl / this.dailyStats.tradesPlaced).toFixed(2)
                : '0',
            recoveryAttempts: this.recoveryHistory.length,
            recoverySuccessRate: recoverySuccessRate.toFixed(1)
        };
    }

    public get activeTradesCount(): number {
        return this.activeTrades.size;
    }

    public getActiveTrades(): Map<string, Trade> {
        return this.activeTrades;
    }
}

// ——— GLOBAL TYPED INSTANCE ————————————————————————————————————————————————
const aggressiveManager = new AggressiveTradeManager();

// ——— TYPED HELPER FUNCTIONS ————————————————————————————————————————————————

function roundLot(x: number): number {
    const LOT_SIZE = 0.00001;
    const MIN_ORDER_SIZE = 0.0001;
    const lots: number = Math.max(
        Math.floor(x / LOT_SIZE),
        Math.ceil(MIN_ORDER_SIZE / LOT_SIZE)
    );
    return lots * LOT_SIZE;
}

async function getAvailableUSDC(): Promise<BalanceInfo> {
    try {
        const perpResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'clearinghouseState',
                user: USER_WALLET
            })
        });

        const perpState: any = await perpResponse.json();
        const accountValue: number = parseFloat(perpState?.marginSummary?.accountValue || '0');
        const withdrawable: number = parseFloat(perpState?.withdrawable || '0');

        console.log(`💰 Account Balance: $${accountValue.toFixed(0)}, Available: $${withdrawable.toFixed(0)}`);

        return {
            totalUSDC: accountValue,
            availableMargin: withdrawable,
            source: 'perpetuals'
        };

    } catch (err) {
        console.error('❌ Balance check error:', err);
        return {
            totalUSDC: 0,
            availableMargin: 0,
            source: 'perpetuals',
            error: err as Error
        };
    }
}

function calculateAggressivePosition(price: number, totalAccountBalance: number, confidence: number = 85): PositionCalculation {
    const capitalPerTrade: number = totalAccountBalance * AGGRESSIVE_CONSTANTS.CAPITAL_PER_TRADE_PERCENT;
    const dynamicLeverage: number = calculateDynamicLeverage(confidence, totalAccountBalance);

    const positionValue: number = capitalPerTrade * dynamicLeverage;
    const positionSize: number = positionValue / price;

    const expectedProfitAt1Percent: number = positionValue * 0.01;
    const expectedProfitAt2Percent: number = positionValue * 0.02;
    const maxRiskAt015Percent: number = Math.min(positionValue * 0.015, AGGRESSIVE_CONSTANTS.MAX_LOSS_PER_TRADE);

    console.log(`🎯 AGGRESSIVE POSITION CALC (30% per trade):`);
    console.log(`   Total Account: $${totalAccountBalance.toFixed(0)}`);
    console.log(`   Capital This Trade: $${capitalPerTrade.toFixed(0)} (30% of total)`);
    console.log(`   Dynamic Leverage: ${dynamicLeverage}x (Confidence: ${confidence}%)`);
    console.log(`   Position Value: $${positionValue.toFixed(0)}`);
    console.log(`   Position Size: ${positionSize.toFixed(5)} BTC`);
    console.log(`   Expected Profit @ 1%: $${expectedProfitAt1Percent.toFixed(2)}`);
    console.log(`   Expected Profit @ 2%: $${expectedProfitAt2Percent.toFixed(2)}`);
    console.log(`   Max Risk: $${maxRiskAt015Percent.toFixed(2)}`);
    console.log(`   Risk/Reward @ 1%: 1:${(expectedProfitAt1Percent / maxRiskAt015Percent).toFixed(1)}`);

    return {
        size: roundLot(positionSize),
        leverage: dynamicLeverage,
        capitalUsed: capitalPerTrade,
        positionValue: positionValue,
        maxRisk: maxRiskAt015Percent,
        expectedProfit1Percent: expectedProfitAt1Percent,
        expectedProfit2Percent: expectedProfitAt2Percent,
        accountUsagePercent: 30,
        riskRewardRatio: expectedProfitAt1Percent / maxRiskAt015Percent
    };
}

function calculateDynamicLeverage(confidence: number, totalAccountBalance: number): number {
    const dayState = getDayState();
    const currentProfit: number = Math.max(0, dayState.realizedPnl);
    const currentLoss: number = Math.abs(dayState.realizedLoss);

    let baseLeverage: number = AGGRESSIVE_CONSTANTS.MIN_LEVERAGE;

    // Confidence-based leverage
    if (confidence >= 95) {
        baseLeverage = AGGRESSIVE_CONSTANTS.MAX_LEVERAGE;
    } else if (confidence >= 90) {
        baseLeverage = Math.round(AGGRESSIVE_CONSTANTS.MAX_LEVERAGE * 0.85);
    } else if (confidence >= 85) {
        baseLeverage = Math.round(AGGRESSIVE_CONSTANTS.MAX_LEVERAGE * 0.7);
    } else if (confidence >= 80) {
        baseLeverage = Math.round(AGGRESSIVE_CONSTANTS.MAX_LEVERAGE * 0.55);
    } else if (confidence >= 75) {
        baseLeverage = Math.round(AGGRESSIVE_CONSTANTS.MAX_LEVERAGE * 0.4);
    } else {
        baseLeverage = AGGRESSIVE_CONSTANTS.MIN_LEVERAGE;
    }

    // Performance-based adjustments
    if (currentLoss > 60) {
        baseLeverage = Math.max(AGGRESSIVE_CONSTANTS.MIN_LEVERAGE, Math.round(baseLeverage * 0.5));
    } else if (currentLoss > 40) {
        baseLeverage = Math.max(AGGRESSIVE_CONSTANTS.MIN_LEVERAGE, Math.round(baseLeverage * 0.7));
    } else if (currentLoss > 20) {
        baseLeverage = Math.max(AGGRESSIVE_CONSTANTS.MIN_LEVERAGE, Math.round(baseLeverage * 0.85));
    }

    // Winning streak adjustments
    if (currentProfit > 300 && currentLoss < 20) {
        baseLeverage = Math.min(AGGRESSIVE_CONSTANTS.MAX_LEVERAGE, Math.round(baseLeverage * 1.25));
    } else if (currentProfit > 150 && currentLoss < 30) {
        baseLeverage = Math.min(AGGRESSIVE_CONSTANTS.MAX_LEVERAGE, Math.round(baseLeverage * 1.15));
    } else if (currentProfit > 75 && currentLoss < 40) {
        baseLeverage = Math.min(AGGRESSIVE_CONSTANTS.MAX_LEVERAGE, Math.round(baseLeverage * 1.1));
    }

    // Account size adjustments
    if (totalAccountBalance < 1000) {
        baseLeverage = Math.min(AGGRESSIVE_CONSTANTS.MAX_LEVERAGE, Math.round(baseLeverage * 1.2));
    } else if (totalAccountBalance > 10000) {
        baseLeverage = Math.max(AGGRESSIVE_CONSTANTS.MIN_LEVERAGE, Math.round(baseLeverage * 0.9));
    }

    const finalLeverage: number = Math.max(AGGRESSIVE_CONSTANTS.MIN_LEVERAGE, Math.min(AGGRESSIVE_CONSTANTS.MAX_LEVERAGE, baseLeverage));

    console.log(`⚡ DYNAMIC LEVERAGE CALC:`);
    console.log(`   Confidence: ${confidence}% → Base: ${baseLeverage}x`);
    console.log(`   Performance: P:$${currentProfit} L:$${currentLoss}`);
    console.log(`   Account Size: $${totalAccountBalance.toFixed(0)}`);
    console.log(`   Final Leverage: ${finalLeverage}x`);

    return finalLeverage;
}

async function placeOptimizedOrder(coin: string, side: 'BUY' | 'SELL', size: number, confidence: number = 85): Promise<OrderResult> {
    try {
        const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'allMids' })
        });
        const allMids: Record<string, number> = await midResponse.json();
        const marketPrice: number = allMids[coin.replace('-PERP', '')];

        const slippage: number = confidence >= 90 ? 1.008 : 1.005;
        const orderPrice: number = Math.round(marketPrice * (side === 'BUY' ? slippage : (2 - slippage)));

        const orderParams: HyperliquidOrderParams = {
            coin: coin,
            is_buy: side === 'BUY',
            sz: size,
            limit_px: orderPrice,
            order_type: { limit: { tif: 'Ioc' as Tif } },
            reduce_only: false
        };

        console.log(`📤 Aggressive Order: ${side} ${size} ${coin} @ $${orderPrice} (${confidence}% confidence)`);

        const result: HyperliquidOrderResponse = await sdk.exchange.placeOrder(orderParams);

        return {
            success: result.status === 'ok',
            result: result,
            pricing: { marketPrice, orderPrice }
        };

    } catch (error) {
        console.error('❌ Order placement error:', error);
        return { success: false, error: error };
    }
}

async function guaranteedInstantClose(coin: string, size: number, isBuy: boolean, reason: string = 'AUTO'): Promise<CloseResult> {
    try {
        console.log(`🎯 INSTANT CLOSE: ${coin} ${size} ${isBuy ? 'BUY' : 'SELL'} - ${reason}`);

        const midResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'allMids' })
        });

        const allMids: Record<string, number> = await midResponse.json();
        const marketPrice: number = allMids[coin];

        const aggressivePrice: number = Math.round(marketPrice * (isBuy ? 1.025 : 0.975));

        const closeParams: HyperliquidOrderParams = {
            coin: `${coin}-PERP`,
            is_buy: isBuy,
            sz: Math.abs(size),
            limit_px: aggressivePrice,
            order_type: { limit: { tif: 'Ioc' as Tif } },
            reduce_only: true
        };

        const result: HyperliquidOrderResponse = await sdk.exchange.placeOrder(closeParams);

        return {
            success: result.status === 'ok',
            result: result,
            method: 'AGGRESSIVE_INSTANT_CLOSE'
        };

    } catch (error) {
        console.error('❌ Close error:', error);
        return { success: false, error: error, method: 'FAILED' };
    }
}

// ——— TYPED MAIN ENDPOINT ————————————————————————————————————————
export async function GET(): Promise<NextResponse<APISuccessResponse | APIErrorResponse>> {
    try {
        console.log('🚀 AGGRESSIVE TRADING BOT - 30% per trade, 5-20x leverage');

        // Step 1: Manage existing trades
        if (aggressiveManager.activeTradesCount > 0) {
            console.log(`📊 Managing ${aggressiveManager.activeTradesCount} active trades...`);

            const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'allMids' })
            });
            const allMids: Record<string, number> = await priceResponse.json();
            const currentBTCPrice: number = allMids['BTC'];

            if (currentBTCPrice) {
                const managementActions: Array<{ tradeId: string, action: string, pnl: number, zone: number }> = [];

                for (const [tradeId, trade] of aggressiveManager.getActiveTrades()) {
                    const action: TradeAction | null = aggressiveManager.updateTrade(tradeId, currentBTCPrice);

                    if (action && action.action !== 'HOLD' && action.action !== 'HOLD_RECOVERY') {
                        const executionResult: ExecutionResult = await aggressiveManager.executeAction(tradeId, action);
                        if (executionResult.success && executionResult.pnl !== undefined) {
                            managementActions.push({
                                tradeId,
                                action: action.action,
                                pnl: executionResult.pnl,
                                zone: trade.currentZone
                            });
                        }

                        await new Promise(resolve => setTimeout(resolve, 1200));
                    }
                }

                if (managementActions.length > 0) {
                    console.log(`✅ Performed ${managementActions.length} management actions`);
                }
            }
        }

        // Step 2: Check daily limits
        const dayState = getDayState();
        const currentDailyLoss: number = Math.abs(dayState.realizedLoss);

        if (currentDailyLoss >= AGGRESSIVE_CONSTANTS.DAILY_LOSS_LIMIT) {
            console.log(`🛑 Daily loss limit reached: $${currentDailyLoss}`);
            return NextResponse.json({
                error: `Daily loss limit reached: $${currentDailyLoss}`,
                dailyStats: aggressiveManager.getDailyStats()
            });
        }

        // Step 3: Get trading signal
        const apiKey: string = env.NEXT_PUBLIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key missing' });
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
            return NextResponse.json({ error: 'Forecast API error' });
        }

        const forecastData: ForecastAPIResponse = await forecastRes.json();
        const signal: TradingSignal | null = Array.isArray(forecastData.forecast_today_hourly) && forecastData.forecast_today_hourly.length > 0
            ? forecastData.forecast_today_hourly[forecastData.forecast_today_hourly.length - 1]
            : null;

        if (!signal || signal.signal === 'HOLD' || !signal.forecast_price) {
            return NextResponse.json({
                error: 'No trading signal',
                dailyStats: aggressiveManager.getDailyStats()
            });
        }

        // Step 4: Check concurrent limits
        if (aggressiveManager.activeTradesCount >= AGGRESSIVE_CONSTANTS.MAX_CONCURRENT_TRADES) {
            return NextResponse.json({
                error: `Maximum concurrent trades reached (${AGGRESSIVE_CONSTANTS.MAX_CONCURRENT_TRADES})`,
                dailyStats: aggressiveManager.getDailyStats()
            });
        }

        // Step 5: Calculate position
        const balanceInfo: BalanceInfo = await getAvailableUSDC();
        if (balanceInfo.totalUSDC < 300) {
            return NextResponse.json({
                error: 'Insufficient balance for aggressive trading',
                dailyStats: aggressiveManager.getDailyStats()
            });
        }

        const confidence: number = signal.confidence_90?.[1] || 85;
        const positionCalc: PositionCalculation = calculateAggressivePosition(
            signal.forecast_price,
            balanceInfo.totalUSDC,
            confidence
        );

        // Step 6: Place trade
        const orderResult: OrderResult = await placeOptimizedOrder(
            'BTC-PERP',
            signal.signal === 'LONG' ? 'BUY' : 'SELL',
            positionCalc.size,
            confidence
        );

        // Step 7: Track new trade
        let newTradeId: string | null = null;
        if (orderResult.success && orderResult.result?.response?.data?.statuses) {
            const statuses: HyperliquidFillStatus[] = orderResult.result.response.data.statuses;

            for (const status of statuses) {
                if (status.filled) {
                    const { avgPx, totalSz } = status.filled;

                    newTradeId = aggressiveManager.startTrade(
                        signal,
                        avgPx,
                        signal.signal === 'LONG' ? totalSz : -totalSz,
                        positionCalc.leverage
                    );
                    break;
                }
            }
        }

        // Step 8: Return typed response
        const response: APISuccessResponse = {
            success: orderResult.success,
            timestamp: new Date().toISOString(),

            newTrade: {
                tradeId: newTradeId,
                signal: signal.signal,
                confidence: confidence,
                entryPrice: orderResult.pricing?.orderPrice,
                size: positionCalc.size,
                leverage: positionCalc.leverage,
                capitalUsed: positionCalc.capitalUsed,
                positionValue: positionCalc.positionValue,
                expectedProfit1Percent: positionCalc.expectedProfit1Percent,
                expectedProfit2Percent: positionCalc.expectedProfit2Percent,
                maxRisk: positionCalc.maxRisk,
                riskRewardRatio: positionCalc.riskRewardRatio,
                aiTakeProfit: signal.take_profit,
                aiStopLoss: signal.stop_loss
            },

            systemStatus: {
                activeTrades: aggressiveManager.activeTradesCount,
                maxConcurrentTrades: AGGRESSIVE_CONSTANTS.MAX_CONCURRENT_TRADES,
                totalAccountUsed: `${aggressiveManager.activeTradesCount * 30}% (${aggressiveManager.activeTradesCount} × 30%)`,
                availableForNextTrade: aggressiveManager.activeTradesCount < AGGRESSIVE_CONSTANTS.MAX_CONCURRENT_TRADES,
                dailyLossUsed: currentDailyLoss,
                dailyLossLimit: AGGRESSIVE_CONSTANTS.DAILY_LOSS_LIMIT,
                remainingCapacity: AGGRESSIVE_CONSTANTS.DAILY_LOSS_LIMIT - currentDailyLoss
            },

            dailyStats: aggressiveManager.getDailyStats(),

            orderExecution: {
                success: orderResult.success,
                marketPrice: orderResult.pricing?.marketPrice,
                orderPrice: orderResult.pricing?.orderPrice,
                microManagementActive: newTradeId !== null,
                recoverySystemActive: true
            }
        };

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('❌ Aggressive trading bot error:', error);
        const errorResponse: APIErrorResponse = {
            error: String(error.message || error),
            timestamp: new Date().toISOString(),
            dailyStats: aggressiveManager.getDailyStats()
        };
        return NextResponse.json(errorResponse);
    }
}

// ——— TYPED POST ENDPOINT ————————————————————————————————————————
export async function POST(): Promise<NextResponse> {
    try {
        if (aggressiveManager.activeTradesCount === 0) {
            return NextResponse.json({
                message: 'No active trades to manage',
                dailyStats: aggressiveManager.getDailyStats()
            });
        }

        const priceResponse = await fetch('https://api.hyperliquid.xyz/info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'allMids' })
        });
        const allMids: Record<string, number> = await priceResponse.json();
        const currentBTCPrice: number = allMids['BTC'];

        if (!currentBTCPrice) {
            return NextResponse.json({ error: 'Could not get current price' });
        }

        const actions: Array<{
            tradeId: string;
            action: string;
            reason: string;
            pnl: number;
            zone: number;
            recoveryMode: boolean;
            rapidRecovery: boolean;
        }> = [];

        for (const [tradeId, trade] of aggressiveManager.getActiveTrades()) {
            const action: TradeAction | null = aggressiveManager.updateTrade(tradeId, currentBTCPrice);

            if (action && action.action !== 'HOLD' && action.action !== 'HOLD_RECOVERY') {
                const executionResult: ExecutionResult = await aggressiveManager.executeAction(tradeId, action);
                if (executionResult.success && executionResult.pnl !== undefined) {
                    actions.push({
                        tradeId,
                        action: action.action,
                        reason: action.reason,
                        pnl: executionResult.pnl,
                        zone: trade.currentZone,
                        recoveryMode: trade.recoveryMode,
                        rapidRecovery: trade.rapidRecoveryDetected
                    });
                }

                await new Promise(resolve => setTimeout(resolve, 1200));
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            activeTrades: aggressiveManager.activeTradesCount,
            actionsPerformed: actions.length,
            actions,
            dailyStats: aggressiveManager.getDailyStats(),
            currentPrice: currentBTCPrice,
            systemStatus: {
                totalAccountUsage: `${aggressiveManager.activeTradesCount * 30}%`,
                recoverySystemActive: true,
                aggressiveModeActive: true
            }
        });

    } catch (error: any) {
        console.error('❌ Aggressive micro-management error:', error);
        return NextResponse.json({ error: String(error.message || error) });
    }
}