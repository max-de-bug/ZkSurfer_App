import { NextApiRequest, NextApiResponse } from 'next';

// Type definitions (same as before)
interface HourlyForecast {
  time: string;
  signal: 'LONG' | 'SHORT' | 'HOLD';
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  forecast_price: number;
  current_price: number;
  deviation_percent: number | string;
  accuracy_percent: number | string;
  risk_reward_ratio: number;
  sentiment_score: number;
  confidence_50: [number, number];
  confidence_80: [number, number];
  confidence_90: [number, number];
}

interface DayData {
  fetched_date: string;
  forecast_hourly_last_30_days: {
    BTC: HourlyForecast[];
    ETH: HourlyForecast[];
    SOL: HourlyForecast[];
  };
}

interface PastPredictionsResponse {
  past_news_last_30_days: DayData[];
}

interface BalanceSet {
  btc: number;
  eth: number;
  sol: number;
}

interface TradePnLResult {
  entryPrice?: number;
  exitPrice?: number;
  pnl?: number;
  pnlPercentage?: number;
  exitReason?: string;
  status: 'calculated' | 'pending';
}

interface CumulativeResult {
  btc_ending_balance: number;
  eth_ending_balance: number;
  sol_ending_balance: number;
  btc_cumulative: number;
  eth_cumulative: number;
  sol_cumulative: number;
  portfolio_cumulative_pnl: number;
  total_trades: number;
  total_winning_trades: number;
  win_rate: number;
}

interface DatabasePayload {
  date: string;
  timestamp: string;
  btc_cumulative: number;
  eth_cumulative: number;
  sol_cumulative: number;
  portfolio_cumulative_pnl: number;
  btc_ending_balance: number;
  eth_ending_balance: number;
  sol_ending_balance: number;
  total_trades: number;
  total_winning_trades: number;
  win_rate: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Security check
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Starting one-time historical backfill...');

    // Step 1: Fetch past 30 days prediction data
    const pastPredictions = await fetchPastPredictions();
    
    if (!pastPredictions || pastPredictions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No historical data found to process',
        processedCount: 0
      });
    }

    // Step 2: Sort by date (oldest first) for proper balance continuation
    pastPredictions.sort((a, b) => new Date(a.fetched_date).getTime() - new Date(b.fetched_date).getTime());

    // Step 3: Process each day's data
    let processedCount = 0;
    let skippedCount = 0;
    const errors: Array<{ date: string; error: string }> = [];

    // Starting balances for the very first day
    let currentBalances: BalanceSet = {
      btc: 100,
      eth: 100,
      sol: 100
    };

    for (const dayData of pastPredictions) {
      const targetDate = dayData.fetched_date;
      
      try {
        console.log(`Processing ${targetDate}...`);

        // Step 4: Calculate cumulative for this specific date
        const cumulativeResult = await calculateDailyCumulativeForDate(
          dayData.forecast_hourly_last_30_days,
          targetDate,
          currentBalances
        );

        // Step 5: Prepare payload for backend API (matches their expected format)
        const dbPayload: DatabasePayload = {
          date: targetDate,
          timestamp: new Date(targetDate + 'T12:30:00.000Z').toISOString(),
          
          // Your 4 main values
          btc_cumulative: cumulativeResult.btc_cumulative,
          eth_cumulative: cumulativeResult.eth_cumulative,
          sol_cumulative: cumulativeResult.sol_cumulative,
          portfolio_cumulative_pnl: cumulativeResult.portfolio_cumulative_pnl,
          
          // Additional data for balance continuation
          btc_ending_balance: cumulativeResult.btc_ending_balance,
          eth_ending_balance: cumulativeResult.eth_ending_balance,
          sol_ending_balance: cumulativeResult.sol_ending_balance,
          
          // Trading stats
          total_trades: cumulativeResult.total_trades,
          total_winning_trades: cumulativeResult.total_winning_trades,
          win_rate: cumulativeResult.win_rate
        };

        // Step 6: Send to backend API using their exact format
        const dbResponse = await fetch(process.env.DATABASE_API_URL!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': process.env.DATABASE_API_KEY! // Using their api-key header format
          },
          body: JSON.stringify(dbPayload)
        });

        if (!dbResponse.ok) {
          const errorText = await dbResponse.text();
          throw new Error(`Backend API error ${dbResponse.status}: ${errorText}`);
        }

        console.log(`Successfully processed ${targetDate}`);
        processedCount++;

        // Step 7: Update balances for next day
        currentBalances = {
          btc: cumulativeResult.btc_ending_balance,
          eth: cumulativeResult.eth_ending_balance,
          sol: cumulativeResult.sol_ending_balance
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error processing ${targetDate}:`, errorMessage);
        errors.push({ date: targetDate, error: errorMessage });
        skippedCount++;
      }
    }

    console.log(`Historical backfill completed. Processed: ${processedCount}, Skipped: ${skippedCount}`);

    res.status(200).json({
      success: true,
      message: 'Historical backfill completed',
      processedCount,
      skippedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Historical backfill failed:', error);
    res.status(500).json({
      success: false,
      message: 'Historical backfill failed',
      error: errorMessage
    });
  }
}

// Fetch past predictions from your API
async function fetchPastPredictions(): Promise<DayData[]> {
  const response = await fetch(`${process.env.INTERNAL_API_URL}/api/past-prediction`, {
    headers: {
      'api-key': process.env.NEXT_PUBLIC_API_KEY!,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch past predictions: ${response.status}`);
  }

  const data: PastPredictionsResponse = await response.json();
  return data.past_news_last_30_days || [];
}

// Calculate cumulative for a specific date
async function calculateDailyCumulativeForDate(
  forecastData: { BTC: HourlyForecast[]; ETH: HourlyForecast[]; SOL: HourlyForecast[] },
  targetDate: string,
  startingBalances: BalanceSet
): Promise<CumulativeResult> {
  const symbols: Array<'BTC' | 'ETH' | 'SOL'> = ['BTC', 'ETH', 'SOL'];
  let totalPnL = 0;
  let totalTrades = 0;
  let totalWinningTrades = 0;
  
  const results: CumulativeResult = {
    btc_ending_balance: startingBalances.btc,
    eth_ending_balance: startingBalances.eth,
    sol_ending_balance: startingBalances.sol,
    btc_cumulative: 0,
    eth_cumulative: 0,
    sol_cumulative: 0,
    portfolio_cumulative_pnl: 0,
    total_trades: 0,
    total_winning_trades: 0,
    win_rate: 0
  };

  for (const symbol of symbols) {
    const hourlyForecast = forecastData[symbol] || [];
    const startingBalance = startingBalances[symbol.toLowerCase() as keyof BalanceSet];
    let currentBalance = startingBalance;
    let symbolPnL = 0;
    let symbolTrades = 0;
    let symbolWins = 0;

    // Process each hour's trading
    for (let i = 0; i < hourlyForecast.length; i++) {
      const forecast = hourlyForecast[i];
      
      if (forecast.signal === 'HOLD' || !forecast.entry_price) {
        continue;
      }

      const tradePnL = await calculateTradePnL(hourlyForecast, i, targetDate);
      
      if (tradePnL.status === 'calculated' && tradePnL.pnlPercentage !== undefined && tradePnL.pnl !== undefined) {
        symbolTrades++;
        totalTrades++;
        
        // Apply percentage change to current balance
        const balanceChange = currentBalance * (tradePnL.pnlPercentage / 100);
        currentBalance += balanceChange;
        symbolPnL += tradePnL.pnl;
        
        if (tradePnL.pnl > 0) {
          symbolWins++;
          totalWinningTrades++;
        }
      }
    }

    // Store results for this symbol
    const symbolKey = `${symbol.toLowerCase()}_ending_balance` as keyof CumulativeResult;
    const pnlKey = `${symbol.toLowerCase()}_cumulative` as keyof CumulativeResult;
    
    (results as any)[symbolKey] = currentBalance;
    (results as any)[pnlKey] = symbolPnL;
    totalPnL += symbolPnL;
  }

  results.portfolio_cumulative_pnl = totalPnL;
  results.total_trades = totalTrades;
  results.total_winning_trades = totalWinningTrades;
  results.win_rate = totalTrades > 0 ? (totalWinningTrades / totalTrades) * 100 : 0;

  return results;
}

// Calculate individual trade PnL (simplified version)
async function calculateTradePnL(
  hourlyForecast: HourlyForecast[],
  currentIndex: number,
  targetDate: string
): Promise<TradePnLResult> {
  const currentForecast = hourlyForecast[currentIndex];
  const nextForecast = hourlyForecast[currentIndex + 1];

  if (!currentForecast || !currentForecast.entry_price) {
    return { status: 'pending' };
  }

  let exitPrice: number;
  let exitReason = 'next_hour';

  // If last hour or no next forecast, use current price
  if (!nextForecast) {
    exitPrice = currentForecast.current_price;
  } else {
    exitPrice = nextForecast.current_price;
    
    // Check for TP/SL hits
    if (currentForecast.signal === 'LONG') {
      if (currentForecast.stop_loss && currentForecast.stop_loss > 0 && nextForecast.current_price <= currentForecast.stop_loss) {
        exitPrice = currentForecast.stop_loss;
        exitReason = 'stop_loss';
      } else if (currentForecast.take_profit && currentForecast.take_profit > 0 && nextForecast.current_price >= currentForecast.take_profit) {
        exitPrice = currentForecast.take_profit;
        exitReason = 'take_profit';
      }
    } else if (currentForecast.signal === 'SHORT') {
      if (currentForecast.stop_loss && currentForecast.stop_loss > 0 && nextForecast.current_price >= currentForecast.stop_loss) {
        exitPrice = currentForecast.stop_loss;
        exitReason = 'stop_loss';
      } else if (currentForecast.take_profit && currentForecast.take_profit > 0 && nextForecast.current_price <= currentForecast.take_profit) {
        exitPrice = currentForecast.take_profit;
        exitReason = 'take_profit';
      }
    }
  }

  // Calculate PnL
  const entryPrice = currentForecast.entry_price;
  const pnl = currentForecast.signal === 'LONG' 
    ? exitPrice - entryPrice 
    : entryPrice - exitPrice;
  const pnlPercentage = (pnl / entryPrice) * 100;

  return {
    entryPrice,
    exitPrice,
    pnl,
    pnlPercentage,
    exitReason,
    status: 'calculated'
  };
}