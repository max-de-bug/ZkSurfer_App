// hooks/useCoinGecko.ts

import { useState, useEffect, useCallback } from 'react';
import { coinGeckoService, type ExchangeRates } from '@/services/CoinGeckoService';

export interface UseCoinGeckoReturn {
  exchangeRates: ExchangeRates | null;
  solPrice: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useCoinGecko = (
  autoUpdate: boolean = true,
  updateInterval: number = 60000 // 1 minute default
): UseCoinGeckoReturn => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const rates = await coinGeckoService.getExchangeRates();
      setExchangeRates(rates);
      setLastUpdated(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch exchange rates';
      setError(errorMessage);
      console.error('CoinGecko fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    // Clear cache to force fresh data
    coinGeckoService.clearCache();
    await fetchRates();
  }, [fetchRates]);

  // Initial fetch
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Auto-update interval
  useEffect(() => {
    if (!autoUpdate) return;

    const interval = setInterval(fetchRates, updateInterval);
    return () => clearInterval(interval);
  }, [autoUpdate, updateInterval, fetchRates]);

  return {
    exchangeRates,
    solPrice: exchangeRates?.SOL || 100,
    isLoading,
    error,
    refresh,
    lastUpdated,
  };
};

// Hook for just SOL price (lighter weight)
export const useSolPrice = (updateInterval: number = 30000) => {
  const [solPrice, setSolPrice] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSolPrice = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const price = await coinGeckoService.getSolPrice();
      setSolPrice(price);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch SOL price';
      setError(errorMessage);
      console.error('SOL price fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolPrice();
    const interval = setInterval(fetchSolPrice, updateInterval);
    return () => clearInterval(interval);
  }, [fetchSolPrice, updateInterval]);

  return { solPrice, isLoading, error, refresh: fetchSolPrice };
};