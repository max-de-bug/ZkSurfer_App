// services/coinGeckoService.ts

export interface ExchangeRates {
  USD: number;
  EUR: number;
  GBP: number;
  INR: number;
  CAD: number;
  AUD: number;
  JPY: number;
  SOL: number;
  ETH: number;
  BTC: number;
  USDC: number;
  USDT: number;
}

class CoinGeckoService {
  private cache: Map<string, { data: ExchangeRates; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 30000; // 30 seconds cache
  private readonly BASE_URL = 'https://api.coingecko.com/api/v3';

  /**
   * Fetch all exchange rates from CoinGecko
   */
  async getExchangeRates(): Promise<ExchangeRates> {
    const cacheKey = 'exchange_rates';
    const cached = this.cache.get(cacheKey);

    // Return cached data if still fresh
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('✅ Using cached exchange rates');
      return cached.data;
    }

    try {
      console.log('🔄 Fetching fresh exchange rates from CoinGecko...');

      // Fetch crypto prices with multiple fiat currencies
      const cryptoResponse = await fetch(
        `${this.BASE_URL}/simple/price?ids=solana,ethereum,bitcoin,usd-coin,tether&vs_currencies=usd,eur,gbp,inr,cad,aud,jpy`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!cryptoResponse.ok) {
        throw new Error(`CoinGecko API error: ${cryptoResponse.status} ${cryptoResponse.statusText}`);
      }

      const cryptoData = await cryptoResponse.json();

      // Extract exchange rates
      const rates: ExchangeRates = {
        USD: 1.00,
        EUR: cryptoData.solana?.eur / cryptoData.solana?.usd || 0.85,
        GBP: cryptoData.solana?.gbp / cryptoData.solana?.usd || 0.73,
        INR: cryptoData.solana?.inr / cryptoData.solana?.usd || 83.12,
        CAD: cryptoData.solana?.cad / cryptoData.solana?.usd || 1.35,
        AUD: cryptoData.solana?.aud / cryptoData.solana?.usd || 1.52,
        JPY: cryptoData.solana?.jpy / cryptoData.solana?.usd || 149.50,
        SOL: cryptoData.solana?.usd || 100,
        ETH: cryptoData.ethereum?.usd || 2600,
        BTC: cryptoData.bitcoin?.usd || 43000,
        USDC: cryptoData['usd-coin']?.usd || 1.00,
        USDT: cryptoData.tether?.usd || 1.00,
      };

      // Validate data quality
      if (rates.SOL < 10 || rates.SOL > 1000) {
        throw new Error(`Invalid SOL price: ${rates.SOL}`);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: rates,
        timestamp: Date.now(),
      });

      console.log('✅ CoinGecko exchange rates fetched successfully:', {
        SOL: rates.SOL,
        ETH: rates.ETH,
        BTC: rates.BTC,
        EUR: rates.EUR,
        GBP: rates.GBP,
      });

      return rates;

    } catch (error) {
      console.error('❌ CoinGecko API failed:', error);

      // Try to return cached data even if expired
      if (cached) {
        console.log('⚠️ Using expired cache due to API failure');
        return cached.data;
      }

      // Final fallback with reasonable estimates
      console.log('⚠️ Using hardcoded fallback rates');
      return {
        USD: 1.00,
        EUR: 0.85,
        GBP: 0.73,
        INR: 83.12,
        CAD: 1.35,
        AUD: 1.52,
        JPY: 149.50,
        SOL: 100,
        ETH: 2600,
        BTC: 43000,
        USDC: 1.00,
        USDT: 1.00,
      };
    }
  }

  /**
   * Get just SOL price quickly
   */
  async getSolPrice(): Promise<number> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/simple/price?ids=solana&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const solPrice = data.solana?.usd;

      if (!solPrice || solPrice < 10 || solPrice > 1000) {
        throw new Error(`Invalid SOL price: ${solPrice}`);
      }

      console.log('✅ SOL price fetched:', solPrice);
      return solPrice;

    } catch (error) {
      console.error('❌ Failed to fetch SOL price:', error);
      return 100; // Fallback
    }
  }

  /**
   * Get multiple crypto prices at once
   */
  async getCryptoPrices(symbols: string[] = ['solana', 'ethereum', 'bitcoin']): Promise<Record<string, number>> {
    try {
      const ids = symbols.join(',');
      const response = await fetch(
        `${this.BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();

      const prices: Record<string, number> = {};
      for (const [id, priceData] of Object.entries(data)) {
        prices[id] = (priceData as any)?.usd || 0;
      }

      console.log('✅ Crypto prices fetched:', prices);
      return prices;

    } catch (error) {
      console.error('❌ Failed to fetch crypto prices:', error);
      return {
        solana: 100,
        ethereum: 2600,
        bitcoin: 43000,
      };
    }
  }

  /**
   * Clear cache manually
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ CoinGecko cache cleared');
  }
}

// Export singleton instance
export const coinGeckoService = new CoinGeckoService();

// Export types
// export type { ExchangeRates };