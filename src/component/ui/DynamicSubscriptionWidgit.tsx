'use client';
import { useState, useEffect } from 'react';
import { useTransak, TransakUser } from '@/hooks/useTransak';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';

// Base subscription plans in USD
const SUBSCRIPTION_PLANS = [
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    basePrice: 100, // $100 USD
    duration: '3 months',
    features: ['Premium prediction reports', 'Market analysis', 'Trading signals', 'Email alerts'],
    popular: false,
    solTarget: 1.0, // Target SOL amount to receive
  },
  {
    id: 'yearly',
    name: 'Yearly Plan', 
    basePrice: 300, // $300 USD
    duration: '12 months',
    features: ['Premium prediction reports', 'Market analysis', 'Trading signals', 'Email alerts', 'Priority support', 'Exclusive insights'],
    popular: true,
    savings: 'Save $100',
    solTarget: 3.0, // Target SOL amount to receive
  },
];

const SUPPORTED_FIAT = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
];

const SUPPORTED_CRYPTO = [
  { code: 'SOL', name: 'Solana', icon: '◎', network: 'solana' },
  { code: 'ETH', name: 'Ethereum', icon: 'Ξ', network: 'ethereum' },
  { code: 'BTC', name: 'Bitcoin', icon: '₿', network: 'bitcoin' },
  { code: 'USDC', name: 'USD Coin', icon: '$', network: 'ethereum' },
  { code: 'USDT', name: 'Tether', icon: '₮', network: 'ethereum' },
];

interface DynamicSubscriptionWidgetProps {
  subscriptionDestinationWallet: string;
  userData?: TransakUser;
  className?: string;
  onFiatSubscription?: (planId: string, orderData: any, solAmount: number) => void;
  onCryptoSubscription?: (planId: string, txHash: string, solAmount: number) => void;
}

export default function DynamicSubscriptionWidget({
  subscriptionDestinationWallet,
  userData,
  className = '',
  onFiatSubscription,
  onCryptoSubscription,
}: DynamicSubscriptionWidgetProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [paymentMode, setPaymentMode] = useState<'fiat' | 'crypto'>('fiat');
  const [fiatCurrency, setFiatCurrency] = useState('USD');
  const [cryptoCurrency, setCryptoCurrency] = useState('SOL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [exchangeRates, setExchangeRates] = useState<any>({});
  const [isLoadingRates, setIsLoadingRates] = useState(true);

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)!;
  const selectedFiat = SUPPORTED_FIAT.find(f => f.code === fiatCurrency)!;
  const selectedCrypto = SUPPORTED_CRYPTO.find(c => c.code === cryptoCurrency)!;

  // Mock exchange rates (replace with real API)
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setIsLoadingRates(true);
        
        // Mock rates - replace with real API like CoinGecko
        const mockRates = {
          USD: 1.00,
          EUR: 0.85,
          GBP: 0.73,
          INR: 83.12,
          CAD: 1.35,
          AUD: 1.52,
          JPY: 149.50,
          SOL: 100.00,
          ETH: 2600.00,
          BTC: 43000.00,
          USDC: 1.00,
          USDT: 1.00,
        };

        setExchangeRates(mockRates);
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        toast.error('Failed to load current prices. Using fallback rates.');
      } finally {
        setIsLoadingRates(false);
      }
    };

    fetchExchangeRates();
    const interval = setInterval(fetchExchangeRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate prices based on exchange rates
  const calculatePrices = () => {
    if (!exchangeRates.SOL) return { fiatPrice: 0, cryptoAmount: 0, solAmount: 0 };

    const targetSOL = currentPlan.solTarget;
    
    if (paymentMode === 'fiat') {
      const solPriceInUSD = exchangeRates.SOL;
      const requiredUSD = targetSOL * solPriceInUSD;
      const fiatRate = exchangeRates[fiatCurrency] || 1;
      const fiatPrice = fiatCurrency === 'USD' ? requiredUSD : requiredUSD * fiatRate;
      
      return {
        fiatPrice: Math.round(fiatPrice * 100) / 100,
        cryptoAmount: 0,
        solAmount: targetSOL,
      };
    } else {
      if (cryptoCurrency === 'SOL') {
        return {
          fiatPrice: 0,
          cryptoAmount: targetSOL,
          solAmount: targetSOL,
        };
      } else {
        const solPriceInUSD = exchangeRates.SOL;
        const cryptoPriceInUSD = exchangeRates[cryptoCurrency];
        const requiredUSD = targetSOL * solPriceInUSD;
        const cryptoAmount = requiredUSD / cryptoPriceInUSD;
        
        return {
          fiatPrice: 0,
          cryptoAmount: Math.round(cryptoAmount * 1000000) / 1000000,
          solAmount: targetSOL,
        };
      }
    }
  };

  const { fiatPrice, cryptoAmount, solAmount } = calculatePrices();

  // Transak configuration
  const isProduction = process.env.NODE_ENV === 'production';
  const apiKey = isProduction 
    ? process.env.NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION
    : process.env.NEXT_PUBLIC_TRANSAK_API_KEY_STAGING;

  const { isLoaded, isLoading, openTransak } = useTransak({
    apiKey: apiKey!,
    environment: isProduction ? 'PRODUCTION' : 'STAGING',
    walletAddress: subscriptionDestinationWallet,
    userData,
    defaultCryptoCurrency: 'SOL',
    defaultFiatCurrency: fiatCurrency,
    defaultFiatAmount: fiatPrice,
    onOrderCreated: (orderData) => {
      toast.success('Subscription payment started!', {
        description: `Processing ${currentPlan.name} - targeting ${solAmount} SOL.`,
      });
      onFiatSubscription?.(selectedPlan, orderData, solAmount);
    },
    onOrderSuccessful: (orderData) => {
      toast.success('Subscription activated!', {
        description: `Your ${currentPlan.name} is now active. Expected: ${solAmount} SOL received.`,
      });
      onFiatSubscription?.(selectedPlan, orderData, solAmount);
    },
  });

  const handleFiatSubscription = () => {
    if (!apiKey) {
      toast.error('Payment system not configured');
      return;
    }
    openTransak();
  };

  const handleCryptoSubscription = async () => {
    if (cryptoCurrency !== 'SOL') {
      toast.error('Currently only SOL payments are supported for direct crypto payments');
      return;
    }

    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsProcessing(true);
      
      const destinationPublicKey = new PublicKey(subscriptionDestinationWallet);
      const lamports = solAmount * LAMPORTS_PER_SOL;
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: destinationPublicKey,
          lamports: Math.floor(lamports),
        })
      );

      const signature = await sendTransaction(transaction, connection);
      
      toast.success('Subscription payment sent!', {
        description: `${solAmount} SOL sent for ${currentPlan.name}`,
      });

      onCryptoSubscription?.(selectedPlan, signature, solAmount);
      
    } catch (error) {
      console.error('Direct SOL payment failed:', error);
      toast.error('Payment failed', {
        description: 'Please try again or use fiat payment.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto border border-gray-700 ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">📰 Premium News Subscription</h3>
        <p className="text-gray-400">Dynamic pricing based on real-time exchange rates</p>
        {isLoadingRates && (
          <div className="mt-2 text-sm text-yellow-400">
            🔄 Loading current exchange rates...
          </div>
        )}
      </div>

      {/* Plan Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Select Plan</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? 'border-indigo-500 bg-indigo-900/30'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h5 className="text-white font-medium">{plan.name}</h5>
                <div className="text-lg font-bold text-indigo-400 my-2">
                  ${plan.basePrice} USD Base
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  Target: {plan.solTarget} SOL
                </div>
                <p className="text-gray-400 text-sm mb-3">{plan.duration}</p>
                
                {plan.savings && (
                  <div className="bg-green-600 text-white px-2 py-1 rounded text-xs mb-3">
                    {plan.savings}
                  </div>
                )}
                
                <ul className="text-xs text-gray-300 space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>✓ {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Mode Selection */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-white mb-4">Payment Method</h4>
        <div className="flex bg-gray-700/50 rounded-lg p-1">
          <button
            onClick={() => setPaymentMode('fiat')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              paymentMode === 'fiat'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            💳 Fiat Currency
          </button>
          <button
            onClick={() => setPaymentMode('crypto')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
              paymentMode === 'crypto'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            🪙 Cryptocurrency
          </button>
        </div>
      </div>

      {/* Currency Selection */}
      {paymentMode === 'fiat' ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Fiat Currency
          </label>
          <select
            value={fiatCurrency}
            onChange={(e) => setFiatCurrency(e.target.value)}
            className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-600"
            disabled={isLoadingRates}
          >
            {SUPPORTED_FIAT.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.flag} {currency.symbol} {currency.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cryptocurrency
          </label>
          <select
            value={cryptoCurrency}
            onChange={(e) => setCryptoCurrency(e.target.value)}
            className="w-full bg-gray-700/50 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none border border-gray-600"
            disabled={isLoadingRates}
          >
            {SUPPORTED_CRYPTO.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.icon} {currency.name}
                {currency.network !== 'solana' ? ' (via Transak)' : ' (Direct)'}
              </option>
            ))}
          </select>
          
          {cryptoCurrency !== 'SOL' && (
            <div className="mt-2 p-3 bg-blue-900/30 border border-blue-500 rounded">
              <p className="text-blue-300 text-sm">
                <strong>Cross-chain:</strong> Your {selectedCrypto.name} will be converted to exactly {solAmount} SOL via Transak.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Dynamic Pricing Display */}
      {!isLoadingRates && (
        <div className="mb-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
          <h4 className="text-sm font-medium text-gray-300 mb-3">Payment Summary</h4>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Plan:</span>
              <span className="text-white font-medium">{currentPlan.name}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Target SOL:</span>
              <span className="text-indigo-400 font-medium">{solAmount} SOL</span>
            </div>

            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-400">You Pay:</span>
                <span className="text-white">
                  {paymentMode === 'fiat' 
                    ? `${selectedFiat.symbol}${fiatPrice.toLocaleString()}`
                    : `${cryptoAmount.toFixed(6)} ${cryptoCurrency}`
                  }
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              {paymentMode === 'fiat' && fiatCurrency !== 'USD' && (
                <div>Rate: 1 USD = {exchangeRates[fiatCurrency]?.toFixed(3)} {fiatCurrency}</div>
              )}
              <div>SOL Price: ${exchangeRates.SOL?.toLocaleString()} USD</div>
              {paymentMode === 'crypto' && cryptoCurrency !== 'SOL' && (
                <div>{cryptoCurrency} Price: ${exchangeRates[cryptoCurrency]?.toLocaleString()} USD</div>
              )}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-600">
            <p className="text-xs text-gray-500">
              {paymentMode === 'fiat' 
                ? `💳 ${fiatCurrency} will be converted to exactly ${solAmount} SOL`
                : cryptoCurrency === 'SOL'
                ? `🪙 ${solAmount} SOL will be sent directly`
                : `🔄 ${cryptoCurrency} will be converted to exactly ${solAmount} SOL`
              }
            </p>
          </div>
        </div>
      )}

      {/* Subscribe Button */}
      <button
        onClick={paymentMode === 'fiat' ? handleFiatSubscription : handleCryptoSubscription}
        disabled={
          isLoadingRates ||
          (paymentMode === 'fiat' 
            ? (!isLoaded || isLoading || !apiKey)
            : cryptoCurrency === 'SOL' 
            ? (!publicKey || isProcessing)
            : true // Disable non-SOL crypto for now
          )
        }
        className={`
          w-full py-4 px-6 rounded-lg font-semibold text-white text-lg
          transition-all duration-200 shadow-lg
          ${!isLoadingRates && 
            (paymentMode === 'fiat' ? (isLoaded && !isLoading && apiKey) : 
            (publicKey && !isProcessing && cryptoCurrency === 'SOL'))
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-105' 
            : 'bg-gray-600 cursor-not-allowed'
          }
        `}
      >
        {isLoadingRates ? (
          'Loading Exchange Rates...'
        ) : paymentMode === 'fiat' ? (
          !apiKey ? 'Payment System Not Configured' :
          isLoading ? 'Loading Payment System...' :
          !isLoaded ? 'Initializing...' :
          `Subscribe for ${selectedFiat.symbol}${fiatPrice.toLocaleString()}`
        ) : cryptoCurrency === 'SOL' ? (
          !publicKey ? 'Connect Wallet to Subscribe' :
          isProcessing ? 'Processing Payment...' :
          `Subscribe for ${cryptoAmount} SOL`
        ) : (
          'Only SOL supported for direct crypto payments'
        )}
      </button>

      {/* Status & Info */}
      <div className="mt-4 text-center text-sm text-gray-400">
        {!isLoadingRates && (
          <div className="space-y-1">
            <p>🎯 <strong>You will receive exactly {solAmount} SOL regardless of payment method</strong></p>
            <p>🔄 Prices update every 60 seconds based on live exchange rates</p>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          🔒 Secure payments • Real-time pricing • Guaranteed SOL amount
        </p>
      </div>
    </div>
  );
}