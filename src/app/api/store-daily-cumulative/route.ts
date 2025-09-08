import { NextRequest, NextResponse } from 'next/server';

// Type definitions
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

interface TodayForecastResponse {
  forecast_today_hourly: {
    BTC: HourlyForecast[];
    ETH: HourlyForecast[];
    SOL: HourlyForecast[];
  };
}

interface PreviousBalanceResponse {
  btc_ending_balance?: number;
  eth_ending_balance?: number;
  sol_ending_balance?: number;
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

export async function GET(request: NextRequest) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting daily cumulative calculation...');

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Step 1: Get yesterday's ending balances from backend API
    const previousBalances = await getPreviousDayBalances(today);
    console.log('Previous day balances:', previousBalances);

    // Step 2: Fetch today's prediction data
    const todayForecast = await fetchTodayPrediction();

    // Step 3: Calculate today's cumulative starting from yesterday's balances
    const cumulativeResult = await calculateTodayCumulative(
      todayForecast,
      today,
      previousBalances
    );

    // Step 4: Prepare payload for backend API
    const dbPayload: DatabasePayload = {
      date: today,
      timestamp: new Date().toISOString(),
      
      // Your 4 main values
      btc_cumulative: cumulativeResult.btc_cumulative,
      eth_cumulative: cumulativeResult.eth_cumulative,
      sol_cumulative: cumulativeResult.sol_cumulative,
      portfolio_cumulative_pnl: cumulativeResult.portfolio_cumulative_pnl,
      
      // Additional data for tomorrow's continuation
      btc_ending_balance: cumulativeResult.btc_ending_balance,
      eth_ending_balance: cumulativeResult.eth_ending_balance,
      sol_ending_balance: cumulativeResult.sol_ending_balance,
      
      // Trading stats
      total_trades: cumulativeResult.total_trades,
      total_winning_trades: cumulativeResult.total_winning_trades,
      win_rate: cumulativeResult.win_rate
    };

    console.log('Calculated data:', {
      date: today,
      btc_cumulative: cumulativeResult.btc_cumulative,
      eth_cumulative: cumulativeResult.eth_cumulative,
      sol_cumulative: cumulativeResult.sol_cumulative,
      portfolio_total: cumulativeResult.portfolio_cumulative_pnl,
      total_trades: cumulativeResult.total_trades
    });

    // Step 5: Send to backend API
    const dbResponse = await fetch(process.env.DATABASE_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.DATABASE_API_KEY!
      },
      body: JSON.stringify(dbPayload)
    });

    if (!dbResponse.ok) {
      const errorText = await dbResponse.text();
      throw new Error(`Backend API error ${dbResponse.status}: ${errorText}`);
    }

    const dbResult = await dbResponse.json();
    console.log('Successfully stored daily cumulative data to backend');

    return NextResponse.json({
      success: true,
      message: 'Daily cumulative data calculated and stored successfully',
      date: today,
      data: {
        btc_cumulative: cumulativeResult.btc_cumulative,
        eth_cumulative: cumulativeResult.eth_cumulative,
        sol_cumulative: cumulativeResult.sol_cumulative,
        portfolio_cumulative_pnl: cumulativeResult.portfolio_cumulative_pnl,
        total_trades: cumulativeResult.total_trades,
        win_rate: cumulativeResult.win_rate
      },
      dbResponse: dbResult
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in daily cumulative calculation:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to calculate and store daily cumulative data',
      error: errorMessage
    }, { status: 500 });
  }
}

// Get previous day's ending balances from backend API
async function getPreviousDayBalances(currentDate: string): Promise<BalanceSet> {
  try {
    // Calculate yesterday's date
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Fetch from backend API
    const response = await fetch(`${process.env.DATABASE_GET_API_URL}?date=${yesterdayStr}`, {
      headers: {
        'api-key': process.env.DATABASE_API_KEY!
      }
    });

    if (!response.ok) {
      console.log(`No data found for ${yesterdayStr}, using initial balances`);
      // If no previous data, start with initial $100 each
      return {
        btc: 100,
        eth: 100,
        sol: 100
      };
    }

    const data: PreviousBalanceResponse = await response.json();
    
    return {
      btc: data.btc_ending_balance || 100,
      eth: data.eth_ending_balance || 100,
      sol: data.sol_ending_balance || 100
    };

  } catch (error) {
    console.error('Error fetching previous day balances:', error);
    // Fallback to initial balances
    return {
      btc: 100,
      eth: 100,
      sol: 100
    };
  }
}

// Fetch today's prediction data
async function fetchTodayPrediction(): Promise<{ BTC: HourlyForecast[]; ETH: HourlyForecast[]; SOL: HourlyForecast[] }> {
  const response = await fetch(`${process.env.INTERNAL_API_URL}/api/today-prediction`, {
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch today's prediction: ${response.status}`);
  }

  const data: TodayForecastResponse = await response.json();
  return data.forecast_today_hourly;
}

// Calculate today's cumulative
async function calculateTodayCumulative(
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

// Calculate individual trade PnL
async function calculateTradePnL(
  hourlyForecast: HourlyForecast[],
  currentIndex: number,
  targetDate: string
): Promise<TradePnLResult> {
  const currentForecast = hourlyForecast[currentIndex];
  
  if (!currentForecast || !currentForecast.entry_price) {
    return { status: 'pending' };
  }

  // For today's calculation, check if the hour has passed
  const now = new Date();
  const forecastTime = new Date(currentForecast.time);
  const nextHourTime = new Date(forecastTime.getTime() + 60 * 60 * 1000);

  // If the next hour hasn't arrived yet, mark as pending
  if (now < nextHourTime && currentIndex === hourlyForecast.length - 1) {
    return { status: 'pending' };
  }

  const nextForecast = hourlyForecast[currentIndex + 1];
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