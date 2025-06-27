// 'use client';
// import { useState } from 'react';
// import { useWallet, useConnection } from '@solana/wallet-adapter-react';
// import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
// import { toast } from 'sonner';
// import { X } from 'lucide-react';
// import { useCoinGecko } from '@/hooks/useCoinGecko';

// // Create a type-safe wrapper for exchange rates
// class SafeExchangeRates {
//   private rates: Record<string, number>;

//   constructor(rates: any) {
//     this.rates = rates || {};
//   }

//   get(currency: string): number {
//     const value = this.rates[currency];
//     return typeof value === 'number' && !isNaN(value) ? value : 100;
//   }

//   convertFromUSD(usdAmount: number, targetCurrency: string): number {
//     if (targetCurrency === 'USD') return usdAmount;

//     // Try different conversion key formats
//     const directRate = this.get(targetCurrency);
//     const conversionRate = this.get(`USD_TO_${targetCurrency}`);
//     const inverseRate = this.get(`${targetCurrency}_TO_USD`);

//     // Use the most appropriate rate
//     let rate = 1;
//     if (conversionRate !== 100) {
//       rate = conversionRate;
//     } else if (directRate !== 100) {
//       rate = directRate;
//     } else if (inverseRate !== 100) {
//       rate = 1 / inverseRate;
//     }

//     return usdAmount * rate;
//   }

//   has(currency: string): boolean {
//     return typeof this.rates[currency] === 'number';
//   }
// }

// // Enhanced Transak SDK Loader with multiple fallbacks
// async function loadTransakSDK(): Promise<void> {
//   // Check if already loaded
//   if (window.TransakSDK) {
//     console.log('Transak SDK already loaded');
//     return;
//   }

//   // Remove any existing failed script tags
//   const existingScripts = document.querySelectorAll('script[src*="transak"]');
//   existingScripts.forEach(script => script.remove());

//   const sdkUrls = [
//     'https://global.transak.com/sdk/v1.2/widget.js',
//     'https://cdn.transak.com/sdk/v1.2/widget.js',
//     'https://global.transak.com/sdk/widget.js',
//     'https://cdn.transak.com/widget.js'
//   ];

//   for (const url of sdkUrls) {
//     try {
//       console.log(`Attempting to load Transak SDK from: ${url}`);
      
//       const script = document.createElement('script');
//       script.src = url;
//       script.async = true;
//       script.crossOrigin = 'anonymous';
      
//       // Add integrity check bypass for CDN issues
//       script.setAttribute('data-transak-sdk', 'true');

//       await new Promise<void>((resolve, reject) => {
//         const timeout = setTimeout(() => {
//           reject(new Error(`Timeout loading from ${url}`));
//         }, 10000); // 10 second timeout

//         script.onload = () => {
//           clearTimeout(timeout);
//           console.log(`Successfully loaded Transak SDK from: ${url}`);
//           resolve();
//         };
        
//         script.onerror = (error) => {
//           clearTimeout(timeout);
//           console.error(`Failed to load from ${url}:`, error);
//           reject(new Error(`Failed to load from ${url}`));
//         };
        
//         document.head.appendChild(script);
//       });

//       // Additional check to ensure SDK is actually available
//       if (window.TransakSDK) {
//         console.log('Transak SDK confirmed available');
//         return;
//       } else {
//         throw new Error('SDK loaded but TransakSDK not available on window');
//       }

//     } catch (error) {
//       console.warn(`Failed to load Transak SDK from ${url}:`, error);
//       // Continue to next URL
//     }
//   }

//   throw new Error('Failed to load Transak SDK from all available sources');
// }

// // Alternative payment method using direct API
// async function initDirectTransakPayment(paymentConfig: any): Promise<void> {
//   try {
//     // Create a form-based redirect to Transak
//     const form = document.createElement('form');
//     form.method = 'POST';
//     form.action = 'https://global.transak.com/buy';
//     form.target = '_blank';
//     form.style.display = 'none';

//     // Add all necessary parameters
//     const params = {
//       apiKey: paymentConfig.apiKey,
//       environment: paymentConfig.environment,
//       isBuyOrSell: paymentConfig.isBuyOrSell,
//       fiatCurrency: paymentConfig.fiatCurrency,
//       fiatAmount: paymentConfig.fiatAmount,
//       partnerOrderId: paymentConfig.partnerOrderId,
//       themeColor: paymentConfig.themeColor,
//       // Add other necessary parameters
//     };

//     Object.entries(params).forEach(([key, value]) => {
//       if (value !== undefined) {
//         const input = document.createElement('input');
//         input.type = 'hidden';
//         input.name = key;
//         input.value = String(value);
//         form.appendChild(input);
//       }
//     });

//     document.body.appendChild(form);
//     form.submit();
//     document.body.removeChild(form);

//     toast.info('Redirecting to Transak payment page...');
//   } catch (error) {
//     console.error('Direct Transak payment failed:', error);
//     throw error;
//   }
// }

// interface SubscriptionModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   treasuryWallet: string;
//   onSubscriptionSuccess?: (planId: string, orderData: any, usdAmount: number) => void;
//   onSingleReportSuccess?: (orderData: any, usdAmount: number) => void;
// }

// const SUBSCRIPTION_PLANS = [
//   {
//     id: 'single-report',
//     name: 'Single Report',
//     usdPrice: 5,
//     duration: '24 hours access',
//     features: [
//       '📊 One premium prediction report',
//       '📈 Current market analysis',
//       '⏰ 24-hour access',
//       '🎯 No commitment required'
//     ],
//     popular: false,
//     badge: 'TRY NOW',
//     type: 'single' as const,
//   },
//   {
//     id: 'quarterly',
//     name: 'Quarterly Plan',
//     usdPrice: 100,
//     duration: '3 months',
//     features: [
//       '📊 Premium prediction reports',
//       '📈 Advanced market analysis',
//       '🎯 Trading signals',
//       '📱 Unlimited access'
//     ],
//     popular: false,
//     type: 'subscription' as const,
//   },
//   {
//     id: 'yearly',
//     name: 'Yearly Plan',
//     usdPrice: 300,
//     duration: '12 months',
//     features: [
//       '📊 Premium prediction reports',
//       '📈 Advanced market analysis',
//       '🎯 Trading signals',
//       '⭐ Priority support',
//       '💎 VIP community access'
//     ],
//     popular: true,
//     type: 'subscription' as const,
//   },
// ];

// const FIAT_CURRENCIES = [
//   { code: 'USD', symbol: '$', name: 'US Dollar' },
//   { code: 'EUR', symbol: '€', name: 'Euro' },
//   { code: 'GBP', symbol: '£', name: 'British Pound' },
//   { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
//   { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
//   { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
//   { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
//   { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
//   { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
// ];

// const CRYPTOCURRENCIES = [
//   { code: 'SOL', name: 'Solana', symbol: '◎' },
//   { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
//   { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
//   { code: 'USDC', name: 'USD Coin', symbol: '$' },
//   { code: 'USDT', name: 'Tether', symbol: '$' },
//   { code: 'BNB', name: 'Binance Coin', symbol: 'BNB' },
//   { code: 'ADA', name: 'Cardano', symbol: 'ADA' },
//   { code: 'AVAX', name: 'Avalanche', symbol: 'AVAX' },
//   { code: 'MATIC', name: 'Polygon', symbol: 'MATIC' },
//   { code: 'DOT', name: 'Polkadot', symbol: 'DOT' },
// ];

// export default function SubscriptionModal({
//   isOpen,
//   onClose,
//   treasuryWallet,
//   onSubscriptionSuccess,
//   onSingleReportSuccess,
// }: SubscriptionModalProps) {
//   const { publicKey, sendTransaction } = useWallet();
//   const { connection } = useConnection();

//   const [selectedPlan, setSelectedPlan] = useState('single-report');
//   const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');
//   const [selectedFiatCurrency, setSelectedFiatCurrency] = useState('USD');
//   const [selectedCrypto, setSelectedCrypto] = useState('SOL');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [sdkLoadAttempts, setSdkLoadAttempts] = useState(0);

//   const { exchangeRates, solPrice, isLoading: isPriceLoading, error: priceError } = useCoinGecko(true, 30000);

//   const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)!;
//   const safeRates = new SafeExchangeRates(exchangeRates);

//   const getCryptoPrice = (cryptoCode: string): number => {
//     return safeRates.get(cryptoCode);
//   };

//   const convertToFiatCurrency = (usdAmount: number, targetCurrency: string): number => {
//     return safeRates.convertFromUSD(usdAmount, targetCurrency);
//   };

//   const calculatePaymentAmounts = () => {
//     const fixedUsdPrice = currentPlan.usdPrice;

//     if (paymentMethod === 'fiat') {
//       const userPayAmount = convertToFiatCurrency(fixedUsdPrice, selectedFiatCurrency);
//       return {
//         userPays: userPayAmount,
//         userPaysCurrency: selectedFiatCurrency,
//         businessReceives: fixedUsdPrice,
//         businessReceivesCurrency: 'USD',
//       };
//     } else {
//       const cryptoPriceUSD = getCryptoPrice(selectedCrypto);
//       const cryptoAmount = fixedUsdPrice / cryptoPriceUSD;

//       return {
//         userPays: cryptoAmount,
//         userPaysCurrency: selectedCrypto,
//         businessReceives: fixedUsdPrice,
//         businessReceivesCurrency: 'USD',
//       };
//     }
//   };

//   const amounts = calculatePaymentAmounts();
//   const selectedFiatCurrencyData = FIAT_CURRENCIES.find(c => c.code === selectedFiatCurrency);
//   const selectedCryptoData = CRYPTOCURRENCIES.find(c => c.code === selectedCrypto);

//   const handleFiatPayment = async () => {
//     setIsProcessing(true);
//     setSdkLoadAttempts(prev => prev + 1);

//     try {
//       const isSingleReport = currentPlan.id === 'single-report';
//       const orderPrefix = isSingleReport ? 'single-report' : 'fiat-subscription';
//       const webhookUrl = isSingleReport 
//         ? `${window.location.origin}/api/transak-webhook-single-report`
//         : `${window.location.origin}/api/transak-webhook-fiat`;

//       const paymentConfig = {
//         apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || 'your-transak-api-key',
//         environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING',
//         isBuyOrSell: 'SELL',
//         fiatCurrency: selectedFiatCurrency,
//         fiatAmount: amounts.userPays,
//         receivingMethod: 'bank_transfer',
//         partnerOrderId: `${orderPrefix}_${selectedPlan}_${Date.now()}`,
//         partnerCustomerId: `customer_${Date.now()}`,
//         themeColor: '6366f1',
//         hideMenu: true,
//         disableWalletAddressForm: true,
//         product: {
//           name: currentPlan.name,
//           description: `${currentPlan.duration} ${isSingleReport ? 'report access' : 'subscription'} - Fiat payment`,
//           amount: amounts.businessReceives,
//           currency: 'USD'
//         },
//         webhookUrl: webhookUrl,
//         metadata: {
//           subscriptionType: selectedPlan,
//           paymentType: 'fiat_to_bank',
//           businessReceivingAmount: amounts.businessReceives,
//           businessReceivingCurrency: 'USD',
//           isSingleReport: isSingleReport
//         }
//       };

//       try {
//         // First attempt: Try to load SDK
//         await loadTransakSDK();

//         const transak = new window.TransakSDK(paymentConfig);

//         transak.on('TRANSAK_ORDER_SUCCESSFUL', (orderData: any) => {
//           const processedOrderData = {
//             orderId: orderData.status?.id || `order_${Date.now()}`,
//             planId: selectedPlan,
//             userPaid: amounts.userPays,
//             userCurrency: selectedFiatCurrency,
//             businessReceived: amounts.businessReceives,
//             businessCurrency: 'USD',
//             provider: 'Transak-FiatToBank',
//             paymentMethod: 'bank_transfer',
//             transakOrderData: orderData,
//             timestamp: new Date().toISOString(),
//             isSingleReport: isSingleReport,
//           };

//           const successMessage = isSingleReport 
//             ? `${selectedFiatCurrencyData?.symbol}${amounts.userPays.toFixed(2)} payment successful! You now have 24-hour access to premium reports.`
//             : `${selectedFiatCurrencyData?.symbol}${amounts.userPays.toFixed(2)} payment successful! $${amounts.businessReceives} USD will be deposited to your business bank account.`;

//           toast.success(successMessage);
          
//           if (isSingleReport) {
//             onSingleReportSuccess?.(processedOrderData, amounts.businessReceives);
//           } else {
//             onSubscriptionSuccess?.(selectedPlan, processedOrderData, amounts.businessReceives);
//           }
          
//           setIsProcessing(false);
//           onClose();
//         });

//         transak.on('TRANSAK_ORDER_FAILED', (orderData: any) => {
//           console.error('Transak fiat order failed:', orderData);
//           toast.error('Bank transfer payment failed. Please try again.');
//           setIsProcessing(false);
//         });

//         transak.on('TRANSAK_WIDGET_CLOSE', () => {
//           setIsProcessing(false);
//         });

//         transak.on('TRANSAK_ORDER_CREATED', (orderData: any) => {
//           toast.info('Processing bank transfer...');
//         });

//         transak.init();

//       } catch (sdkError) {
//         console.error('SDK loading failed, trying direct payment method:', sdkError);
        
//         // Fallback: Use direct payment method
//         if (sdkLoadAttempts <= 2) {
//           toast.info('Using alternative payment method...');
//           await initDirectTransakPayment(paymentConfig);
//           setIsProcessing(false);
//         } else {
//           throw new Error('Multiple SDK loading attempts failed');
//         }
//       }

//     } catch (error) {
//       console.error('All payment methods failed:', error);
      
//       // Provide user-friendly error messages
//       if (error.message.includes('Timeout')) {
//         toast.error('Payment service is taking too long to load. Please check your internet connection and try again.');
//       } else if (error.message.includes('Failed to load')) {
//         toast.error('Payment service temporarily unavailable. Please try again in a few minutes.');
//       } else {
//         toast.error('Payment system error. Please try again or contact support.');
//       }
      
//       setIsProcessing(false);
//     }
//   };

//   const handleCryptoPayment = async () => {
//     setIsProcessing(true);
//     setSdkLoadAttempts(prev => prev + 1);

//     try {
//       const isSingleReport = currentPlan.id === 'single-report';
//       const orderPrefix = isSingleReport ? 'single-report-crypto' : 'crypto-subscription';
//       const webhookUrl = isSingleReport 
//         ? `${window.location.origin}/api/transak-webhook-single-report-crypto`
//         : `${window.location.origin}/api/transak-webhook-crypto`;

//       const paymentConfig = {
//         apiKey: process.env.NEXT_PUBLIC_TRANSAK_API_KEY || 'your-transak-api-key',
//         environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING',
//         isBuyOrSell: 'SELL',
//         cryptoCurrency: selectedCrypto,
//         cryptoAmount: amounts.userPays,
//         receivingMethod: 'bank_transfer',
//         partnerOrderId: `${orderPrefix}_${selectedPlan}_${Date.now()}`,
//         partnerCustomerId: `crypto-customer_${Date.now()}`,
//         themeColor: '6366f1',
//         hideMenu: true,
//         product: {
//           name: currentPlan.name,
//           description: `${currentPlan.duration} ${isSingleReport ? 'report access' : 'subscription'} - Crypto payment`,
//           expectedUsdAmount: amounts.businessReceives,
//         },
//         webhookUrl: webhookUrl,
//         metadata: {
//           subscriptionType: selectedPlan,
//           paymentType: 'crypto_to_bank',
//           businessReceivingAmount: amounts.businessReceives,
//           businessReceivingCurrency: 'USD',
//           originalCrypto: selectedCrypto,
//           originalCryptoAmount: amounts.userPays,
//           isSingleReport: isSingleReport
//         }
//       };

//       try {
//         await loadTransakSDK();

//         const transak = new window.TransakSDK(paymentConfig);

//         transak.on('TRANSAK_ORDER_SUCCESSFUL', (orderData: any) => {
//           const processedOrderData = {
//             orderId: orderData.status?.id || `order_${Date.now()}`,
//             planId: selectedPlan,
//             userPaid: amounts.userPays,
//             userCurrency: selectedCrypto,
//             businessReceived: amounts.businessReceives,
//             businessCurrency: 'USD',
//             provider: 'Transak-CryptoToBank',
//             paymentMethod: 'crypto_to_bank_transfer',
//             transakOrderData: orderData,
//             timestamp: new Date().toISOString(),
//             isSingleReport: isSingleReport,
//           };

//           const successMessage = isSingleReport 
//             ? `${amounts.userPays.toFixed(6)} ${selectedCrypto} payment successful! You now have 24-hour access to premium reports.`
//             : `${amounts.userPays.toFixed(6)} ${selectedCrypto} payment successful! $${amounts.businessReceives} USD will be deposited to your business bank account.`;

//           toast.success(successMessage);
          
//           if (isSingleReport) {
//             onSingleReportSuccess?.(processedOrderData, amounts.businessReceives);
//           } else {
//             onSubscriptionSuccess?.(selectedPlan, processedOrderData, amounts.businessReceives);
//           }
          
//           setIsProcessing(false);
//           onClose();
//         });

//         transak.on('TRANSAK_ORDER_FAILED', (orderData: any) => {
//           console.error('Transak crypto-to-bank order failed:', orderData);
//           toast.error('Crypto to bank transfer failed. Please try again.');
//           setIsProcessing(false);
//         });

//         transak.on('TRANSAK_WIDGET_CLOSE', () => {
//           setIsProcessing(false);
//         });

//         transak.on('TRANSAK_ORDER_CREATED', (orderData: any) => {
//           toast.info('Processing crypto to bank transfer...');
//         });

//         transak.on('TRANSAK_ORDER_PROCESSING', (orderData: any) => {
//           toast.info('Converting crypto to USD and transferring to your bank...');
//         });

//         transak.init();

//       } catch (sdkError) {
//         console.error('SDK loading failed for crypto payment:', sdkError);
        
//         if (sdkLoadAttempts <= 2) {
//           toast.info('Using alternative crypto payment method...');
//           await initDirectTransakPayment(paymentConfig);
//           setIsProcessing(false);
//         } else {
//           throw new Error('Multiple crypto SDK loading attempts failed');
//         }
//       }

//     } catch (error) {
//       console.error('Crypto payment failed:', error);
//       toast.error('Crypto payment service temporarily unavailable. Please try again.');
//       setIsProcessing(false);
//     }
//   };

//   if (!isOpen) return null;

//   const isSingleReport = currentPlan.id === 'single-report';

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
//       <div className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-y-auto border border-gray-700">
//         {/* Header */}
//         <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 rounded-t-2xl">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-3xl font-bold text-white mb-2">
//                 💰 {isSingleReport ? 'Single Report Access' : 'Fixed USD Pricing Subscription'}
//               </h2>
//               <p className="text-gray-400">
//                 {isSingleReport 
//                   ? 'Try our premium reports for just $5 • 24-hour access'
//                   : 'Pay with any currency/crypto worldwide • Unlimited access'
//                 }
//               </p>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
//             >
//               <X className="w-6 h-6 text-gray-400" />
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Plan Selection */}
//           <div className="mb-8">
//             <h3 className="text-xl font-semibold text-white mb-6">Choose Your Plan</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {SUBSCRIPTION_PLANS.map((plan) => (
//                 <div
//                   key={plan.id}
//                   onClick={() => setSelectedPlan(plan.id)}
//                   className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${selectedPlan === plan.id
//                     ? 'border-indigo-500 bg-indigo-900/30 shadow-lg shadow-indigo-500/20'
//                     : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
//                     }`}
//                 >
//                   {plan.popular && (
//                     <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
//                       <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
//                         MOST POPULAR
//                       </span>
//                     </div>
//                   )}

//                   {plan.badge && (
//                     <div className="absolute -top-3 right-4">
//                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                         plan.id === 'single-report' 
//                           ? 'bg-orange-600 text-white' 
//                           : 'bg-green-600 text-white'
//                       }`}>
//                         {plan.badge}
//                       </span>
//                     </div>
//                   )}

//                   <div className="text-center mb-6">
//                     <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
//                     <div className={`text-3xl font-bold mb-1 ${
//                       plan.id === 'single-report' ? 'text-orange-400' : 'text-green-400'
//                     }`}>
//                       ${plan.usdPrice} USD
//                     </div>
//                     <div className="text-sm text-gray-400 mb-2">{plan.duration}</div>
//                     {plan.id === 'single-report' && (
//                       <div className="text-xs text-orange-300 bg-orange-900/20 px-3 py-1 rounded-full">
//                         Perfect for trying our service
//                       </div>
//                     )}
//                   </div>

//                   <ul className="space-y-3 text-sm">
//                     {plan.features.map((feature, idx) => (
//                       <li key={idx} className="flex items-center text-gray-300">
//                         <span className={`mr-2 ${
//                           plan.id === 'single-report' ? 'text-orange-400' : 'text-green-400'
//                         }`}>✓</span>
//                         {feature}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Payment Method Selection */}
//           <div className="mb-8">
//             <h3 className="text-xl font-semibold text-white mb-4">Payment Method</h3>
//             <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-600">
//               <button
//                 onClick={() => setPaymentMethod('fiat')}
//                 className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${paymentMethod === 'fiat'
//                   ? 'bg-indigo-600 text-white shadow-lg'
//                   : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
//                   }`}
//               >
//                 🌍 Fiat Currency 
//               </button>
//               <button
//                 onClick={() => setPaymentMethod('crypto')}
//                 className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${paymentMethod === 'crypto'
//                   ? 'bg-indigo-600 text-white shadow-lg'
//                   : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
//                   }`}
//               >
//                 🪙 Cryptocurrency 
//               </button>
//             </div>
//           </div>

//           {/* Currency Selection */}
//           <div className="mb-8">
//             <h3 className="text-lg font-semibold text-white mb-4">
//               {paymentMethod === 'fiat' ? 'Select Your Payment Currency' : 'Select Cryptocurrency'}
//             </h3>

//             {paymentMethod === 'fiat' ? (
//               <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
//                 {FIAT_CURRENCIES.map((currency) => (
//                   <button
//                     key={currency.code}
//                     onClick={() => setSelectedFiatCurrency(currency.code)}
//                     className={`p-3 rounded-lg border-2 transition-all ${selectedFiatCurrency === currency.code
//                       ? 'border-indigo-500 bg-indigo-900/30 text-white'
//                       : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
//                       }`}
//                   >
//                     <div className="text-lg font-bold">{currency.symbol}</div>
//                     <div className="text-xs">{currency.code}</div>
//                   </button>
//                 ))}
//               </div>
//             ) : (
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//                 {CRYPTOCURRENCIES.map((crypto) => (
//                   <button
//                     key={crypto.code}
//                     onClick={() => setSelectedCrypto(crypto.code)}
//                     className={`p-4 rounded-lg border-2 transition-all ${selectedCrypto === crypto.code
//                       ? 'border-indigo-500 bg-indigo-900/30 text-white'
//                       : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
//                       }`}
//                   >
//                     <div className="text-xl font-bold mb-1">{crypto.symbol}</div>
//                     <div className="text-sm font-medium">{crypto.code}</div>
//                     <div className="text-xs text-gray-400">{crypto.name}</div>
//                     {!isPriceLoading && safeRates.has(crypto.code) && (
//                       <div className="text-xs text-green-400 mt-1">
//                         ${getCryptoPrice(crypto.code).toFixed(2)}
//                       </div>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Payment Summary */}
//           <div className="mb-8 p-6 bg-gray-800/30 rounded-xl border border-gray-600">
//             <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>

//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-gray-400">Selected Plan:</span>
//                 <span className="text-white font-medium">{currentPlan.name}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-gray-400">
//                   {isSingleReport ? 'Access Duration:' : 'Duration:'}
//                 </span>
//                 <span className="text-white">{currentPlan.duration}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="text-gray-400">Payment Method:</span>
//                 <span className="text-white">
//                   {paymentMethod === 'fiat'
//                     ? `${selectedFiatCurrencyData?.name} (${selectedFiatCurrency})`
//                     : `${selectedCryptoData?.name} (${selectedCrypto})`
//                   }
//                 </span>
//               </div>

//               <div className="border-t border-gray-600 pt-3">
//                 <div className="flex justify-between text-lg">
//                   <span className="text-gray-400">You Pay:</span>
//                   <div className="text-right">
//                     <div className="text-white font-bold">
//                       {paymentMethod === 'fiat'
//                         ? `${selectedFiatCurrencyData?.symbol}${amounts.userPays.toFixed(2)}`
//                         : `${amounts.userPays.toFixed(selectedCrypto === 'SOL' || selectedCrypto === 'BTC' ? 6 : 2)} ${selectedCrypto}`
//                       }
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="border-t border-gray-600 pt-3">
//                 <div className="flex justify-between">
//                   <span className="text-gray-400">Business Receives:</span>
//                   <div className="text-right">
//                     <div className={`font-bold text-lg ${
//                       isSingleReport ? 'text-orange-400' : 'text-green-400'
//                     }`}>
//                       ${amounts.businessReceives} USD
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {isSingleReport && (
//                 <div className="mt-4 p-3 bg-orange-900/20 border border-orange-600/30 rounded-lg">
//                   <div className="flex items-center text-orange-300 text-sm">
//                     <span className="mr-2">💡</span>
//                     <span>
//                       After payment, you'll get immediate access to view one premium report. 
//                       Access expires after 24 hours.
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {/* Connection Status Indicator */}
//               {sdkLoadAttempts > 0 && (
//                 <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
//                   <div className="flex items-center text-blue-300 text-sm">
//                     <span className="mr-2">🔄</span>
//                     <span>
//                       SDK Load Attempts: {sdkLoadAttempts} - Using enhanced connection methods
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Payment Button */}
//           <div className="space-y-4">
//             <button
//               onClick={paymentMethod === 'fiat' ? handleFiatPayment : handleCryptoPayment}
//               disabled={isProcessing || isPriceLoading}
//               className={`
//                 w-full py-4 px-6 rounded-xl font-bold text-lg
//                 transition-all duration-200 shadow-lg
//                 ${!isProcessing && !isPriceLoading
//                   ? `bg-gradient-to-r ${
//                       isSingleReport 
//                         ? 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
//                         : 'from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
//                     } text-white hover:shadow-xl transform hover:scale-105`
//                   : 'bg-gray-600 text-gray-400 cursor-not-allowed'
//                 }
//               `}
//             >
//               {isProcessing ? (
//                 <div className="flex items-center justify-center">
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
//                   {sdkLoadAttempts <= 1 ? 'Loading Payment System...' : 'Trying Alternative Method...'}
//                 </div>
//               ) : isPriceLoading ? (
//                 'Loading current prices...'
//               ) : isSingleReport ? (
//                 'Get 24-Hour Access Now'
//               ) : (
//                 'Pay Now'
//               )}
//             </button>

//             {/* Troubleshooting Notice */}
//             {sdkLoadAttempts > 1 && !isProcessing && (
//               <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
//                 <div className="text-yellow-300 text-sm">
//                   <div className="font-semibold mb-2">🔧 Connection Issues Detected</div>
//                   <div className="space-y-1 text-xs">
//                     <div>• Multiple fallback methods are being used</div>
//                     <div>• If payment window doesn't open, try disabling ad blockers</div>
//                     <div>• Ensure JavaScript is enabled in your browser</div>
//                     <div>• Try refreshing the page if issues persist</div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {isSingleReport && (
//               <div className="text-center">
//                 <p className="text-sm text-gray-400 mb-2">
//                   Want unlimited access? Consider our subscription plans above.
//                 </p>
//                 <p className="text-xs text-orange-400">
//                   Single report payments are perfect for trying our service risk-free!
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Security & Features Notice */}
//           <div className="mt-6 pt-4 border-t border-gray-700">
//             <div className="text-center space-y-2">
//               <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
//                 <span>🔒 Secure Payment Processing</span>
//                 <span>•</span>
//                 <span>🌍 Global Currency Support</span>
//                 <span>•</span>
//                 <span>⚡ Instant Confirmation</span>
//               </div>
//               <p className="text-xs text-gray-500">
//                 Powered by Transak • Enhanced SDK Loading • ZkAGI2025
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';
import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useCoinGecko } from '@/hooks/useCoinGecko';

// CORRECT CDN URL for Transak SDK
const TRANSAK_CDN_URL = 'https://cdn.transak.com/js/sdk/1.4.1/transak.js';

// CORRECT API endpoints for Transak
const TRANSAK_ENDPOINTS = {
  staging: {
    api: 'https://api-stg.transak.com',
    widget: 'https://staging-global.transak.com'
  },
  production: {
    api: 'https://api.transak.com', 
    widget: 'https://global.transak.com'
  }
};

// Create a type-safe wrapper for exchange rates
class SafeExchangeRates {
  private rates: Record<string, number>;

  constructor(rates: any) {
    this.rates = rates || {};
  }

  get(currency: string): number {
    const value = this.rates[currency];
    return typeof value === 'number' && !isNaN(value) ? value : 100;
  }

  convertFromUSD(usdAmount: number, targetCurrency: string): number {
    if (targetCurrency === 'USD') return usdAmount;

    const directRate = this.get(targetCurrency);
    const conversionRate = this.get(`USD_TO_${targetCurrency}`);
    const inverseRate = this.get(`${targetCurrency}_TO_USD`);

    let rate = 1;
    if (conversionRate !== 100) {
      rate = conversionRate;
    } else if (directRate !== 100) {
      rate = directRate;
    } else if (inverseRate !== 100) {
      rate = 1 / inverseRate;
    }

    return usdAmount * rate;
  }

  has(currency: string): boolean {
    return typeof this.rates[currency] === 'number';
  }
}

// API Key configuration functions
const getTransakApiKey = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isStaging = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment || isStaging) {
    // Use staging key for development/staging
    return process.env.NEXT_PUBLIC_TRANSAK_API_KEY_STAGING || 
           process.env.NEXT_PUBLIC_TRANSAK_API_KEY || 
           '59cddac6-357e-4c47-b3a6-9b7669ad210d';
  } else {
    // Use production key for production
    return process.env.NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION || 
           '9c373071-2ac2-4983-91dd-fcb53699509d';
  }
};

const getTransakEnvironment = () => {
  return process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'STAGING';
};

// Environment validation function
const validateTransakConfig = () => {
  const apiKey = getTransakApiKey();
  const environment = getTransakEnvironment();
  
  if (!apiKey || apiKey === 'your-transak-api-key') {
    throw new Error('Transak API key not configured properly');
  }
  
  return { apiKey, environment };
};

// Enhanced SDK Loading Function
async function loadTransakSDK(): Promise<void> {
  if (window.TransakSDK || window.Transak) {
    console.log('Transak SDK already loaded');
    return;
  }

  // Remove any existing failed script tags
  const existingScripts = document.querySelectorAll('script[src*="transak"]');
  existingScripts.forEach(script => script.remove());

  const script = document.createElement('script');
  script.src = TRANSAK_CDN_URL;
  script.async = true;
  script.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout loading Transak SDK from ${TRANSAK_CDN_URL}`));
    }, 15000); // 15 second timeout

    script.onload = () => {
      clearTimeout(timeout);
      console.log(`Successfully loaded Transak SDK from: ${TRANSAK_CDN_URL}`);
      
      // Check if SDK is actually available
      if (window.TransakSDK || window.Transak) {
        resolve();
      } else {
        reject(new Error('SDK loaded but Transak not available on window'));
      }
    };
    
    script.onerror = (error) => {
      clearTimeout(timeout);
      console.error(`Failed to load from ${TRANSAK_CDN_URL}:`, error);
      reject(new Error(`Failed to load from ${TRANSAK_CDN_URL}`));
    };
    
    document.head.appendChild(script);
  });
}

// Direct Payment Method using proper URLs
async function createTransakDirectURL(config: any): Promise<string> {
  const { apiKey, environment } = validateTransakConfig();
  
  const baseURL = environment === 'PRODUCTION' 
    ? TRANSAK_ENDPOINTS.production.widget 
    : TRANSAK_ENDPOINTS.staging.widget;

  const params = new URLSearchParams({
    apiKey: apiKey,
    environment: environment,
    fiatCurrency: config.fiatCurrency || 'USD',
    fiatAmount: config.fiatAmount?.toString() || '0',
    partnerOrderId: config.partnerOrderId || '',
    partnerCustomerId: config.partnerCustomerId || '',
    hideMenu: 'true',
    themeColor: config.themeColor || '6366f1',
    productsAvailed: 'SELL',
    isBuyOrSell: 'SELL',
    receivingMethod: config.receivingMethod || 'bank_transfer',
  });

  // For crypto payments, add crypto-specific parameters
  if (config.cryptoCurrency && config.cryptoAmount) {
    params.set('cryptoCurrency', config.cryptoCurrency);
    params.set('cryptoAmount', config.cryptoAmount.toString());
  }

  return `${baseURL}/?${params.toString()}`;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  treasuryWallet: string;
  onSubscriptionSuccess?: (planId: string, orderData: any, usdAmount: number) => void;
  onSingleReportSuccess?: (orderData: any, usdAmount: number) => void;
}

const SUBSCRIPTION_PLANS = [
  {
    id: 'single-report',
    name: 'Single Report',
    usdPrice: 5,
    duration: '24 hours access',
    features: [
      '📊 One premium prediction report',
      '📈 Current market analysis',
      '⏰ 24-hour access',
      '🎯 No commitment required'
    ],
    popular: false,
    badge: 'TRY NOW',
    type: 'single' as const,
  },
  {
    id: 'quarterly',
    name: 'Quarterly Plan',
    usdPrice: 100,
    duration: '3 months',
    features: [
      '📊 Premium prediction reports',
      '📈 Advanced market analysis',
      '🎯 Trading signals',
      '📱 Unlimited access'
    ],
    popular: false,
    type: 'subscription' as const,
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    usdPrice: 300,
    duration: '12 months',
    features: [
      '📊 Premium prediction reports',
      '📈 Advanced market analysis',
      '🎯 Trading signals',
      '⭐ Priority support',
      '💎 VIP community access'
    ],
    popular: true,
    type: 'subscription' as const,
  },
];

const FIAT_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const CRYPTOCURRENCIES = [
  { code: 'SOL', name: 'Solana', symbol: '◎' },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿' },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ' },
  { code: 'USDC', name: 'USD Coin', symbol: '$' },
  { code: 'USDT', name: 'Tether', symbol: '$' },
  { code: 'BNB', name: 'Binance Coin', symbol: 'BNB' },
  { code: 'ADA', name: 'Cardano', symbol: 'ADA' },
  { code: 'AVAX', name: 'Avalanche', symbol: 'AVAX' },
  { code: 'MATIC', name: 'Polygon', symbol: 'MATIC' },
  { code: 'DOT', name: 'Polkadot', symbol: 'DOT' },
];

export default function SubscriptionModal({
  isOpen,
  onClose,
  treasuryWallet,
  onSubscriptionSuccess,
  onSingleReportSuccess,
}: SubscriptionModalProps) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [selectedPlan, setSelectedPlan] = useState('single-report');
  const [paymentMethod, setPaymentMethod] = useState<'fiat' | 'crypto'>('fiat');
  const [selectedFiatCurrency, setSelectedFiatCurrency] = useState('USD');
  const [selectedCrypto, setSelectedCrypto] = useState('SOL');
  const [isProcessing, setIsProcessing] = useState(false);
  const [integrationMethod, setIntegrationMethod] = useState<'sdk' | 'redirect'>('sdk');
  const [sdkLoadAttempts, setSdkLoadAttempts] = useState(0);

  const { exchangeRates, solPrice, isLoading: isPriceLoading, error: priceError } = useCoinGecko(true, 30000);

  const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)!;
  const safeRates = new SafeExchangeRates(exchangeRates);

  const getCryptoPrice = (cryptoCode: string): number => {
    return safeRates.get(cryptoCode);
  };

  const convertToFiatCurrency = (usdAmount: number, targetCurrency: string): number => {
    return safeRates.convertFromUSD(usdAmount, targetCurrency);
  };

  const calculatePaymentAmounts = () => {
    const fixedUsdPrice = currentPlan.usdPrice;

    if (paymentMethod === 'fiat') {
      const userPayAmount = convertToFiatCurrency(fixedUsdPrice, selectedFiatCurrency);
      return {
        userPays: userPayAmount,
        userPaysCurrency: selectedFiatCurrency,
        businessReceives: fixedUsdPrice,
        businessReceivesCurrency: 'USD',
      };
    } else {
      const cryptoPriceUSD = getCryptoPrice(selectedCrypto);
      const cryptoAmount = fixedUsdPrice / cryptoPriceUSD;

      return {
        userPays: cryptoAmount,
        userPaysCurrency: selectedCrypto,
        businessReceives: fixedUsdPrice,
        businessReceivesCurrency: 'USD',
      };
    }
  };

  const amounts = calculatePaymentAmounts();
  const selectedFiatCurrencyData = FIAT_CURRENCIES.find(c => c.code === selectedFiatCurrency);
  const selectedCryptoData = CRYPTOCURRENCIES.find(c => c.code === selectedCrypto);

  // Enhanced fiat payment handler
  const handleFiatPayment = async () => {
    setIsProcessing(true);
    setSdkLoadAttempts(prev => prev + 1);

    try {
      const isSingleReport = currentPlan.id === 'single-report';
      const orderPrefix = isSingleReport ? 'single-report' : 'fiat-subscription';

      console.log('Using API Key:', getTransakApiKey());
      console.log('Using Environment:', getTransakEnvironment());

      const transakConfig = {
        apiKey: getTransakApiKey(),
        environment: getTransakEnvironment(),
        isBuyOrSell: 'SELL',
        fiatCurrency: selectedFiatCurrency,
        fiatAmount: amounts.userPays,
        partnerOrderId: `${orderPrefix}_${selectedPlan}_${Date.now()}`,
        partnerCustomerId: `customer_${Date.now()}`,
        themeColor: '6366f1',
        hideMenu: true,
        productsAvailed: 'SELL',
        receivingMethod: 'bank_transfer',
        webhookUrl: isSingleReport 
          ? `${window.location.origin}/api/transak-webhook-single-report`
          : `${window.location.origin}/api/transak-webhook-fiat`,
      };

      console.log('Transak Config:', transakConfig);

      // Try SDK method first
      if (integrationMethod === 'sdk') {
        try {
          await loadTransakSDK();
          
          const transak = new window.TransakSDK.default(transakConfig);

          transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
            const processedOrderData = {
              orderId: orderData.id || `order_${Date.now()}`,
              planId: selectedPlan,
              userPaid: amounts.userPays,
              userCurrency: selectedFiatCurrency,
              businessReceived: amounts.businessReceives,
              businessCurrency: 'USD',
              provider: 'Transak-SDK',
              paymentMethod: 'bank_transfer',
              transakOrderData: orderData,
              timestamp: new Date().toISOString(),
              isSingleReport: isSingleReport,
            };

            const successMessage = isSingleReport 
              ? `${selectedFiatCurrencyData?.symbol}${amounts.userPays.toFixed(2)} payment successful! You now have 24-hour access to premium reports.`
              : `${selectedFiatCurrencyData?.symbol}${amounts.userPays.toFixed(2)} payment successful! $${amounts.businessReceives} USD will be transferred to your account.`;

            toast.success(successMessage);
            
            if (isSingleReport) {
              onSingleReportSuccess?.(processedOrderData, amounts.businessReceives);
            } else {
              onSubscriptionSuccess?.(selectedPlan, processedOrderData, amounts.businessReceives);
            }
            
            setIsProcessing(false);
            onClose();
          });

          transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, (orderData: any) => {
            console.error('Transak order failed:', orderData);
            toast.error('Bank transfer payment failed. Please try again.');
            setIsProcessing(false);
          });

          transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
            setIsProcessing(false);
          });

          transak.on(transak.EVENTS.TRANSAK_ORDER_CREATED, (orderData: any) => {
            console.log('Order created:', orderData);
            toast.info('Processing bank transfer...');
          });

          console.log('Initializing Transak SDK...');
          transak.init();

        } catch (sdkError) {
          console.error('SDK method failed, trying direct payment method:', sdkError);
          
          if (sdkLoadAttempts <= 2) {
            toast.info('Using alternative payment method...');
            await initDirectTransakPayment(transakConfig);
            setIsProcessing(false);
          } else {
            throw new Error('Multiple SDK loading attempts failed');
          }
        }
      }

      // Fallback: Direct redirect method
      if (integrationMethod === 'redirect') {
        const redirectURL = await createTransakDirectURL(transakConfig);
        
        const popup = window.open(
          redirectURL,
          'TransakPayment',
          'width=500,height=700,scrollbars=yes,resizable=yes'
        );

        if (!popup) {
          toast.error('Please allow popups for this site to complete payment');
          setIsProcessing(false);
          return;
        }

        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setIsProcessing(false);
            toast.info('Payment window closed. Please check your email for confirmation.');
          }
        }, 1000);

        setTimeout(() => {
          if (!popup.closed) {
            popup.close();
            clearInterval(checkClosed);
            setIsProcessing(false);
          }
        }, 600000);
      }

    } catch (error) {
      console.error('All payment methods failed:', error);
      
      if (error.message.includes('Invalid API key')) {
        toast.error('Invalid API key configuration. Please check your environment settings.');
      } else if (error.message.includes('Timeout')) {
        toast.error('Payment service is taking too long to load. Please check your internet connection and try again.');
      } else if (error.message.includes('Failed to load')) {
        toast.error('Payment service temporarily unavailable. Please try again in a few minutes.');
      } else {
        toast.error('Payment system error. Please try again or contact support.');
      }
      
      setIsProcessing(false);
    }
  };

  // Alternative payment method using direct API
  async function initDirectTransakPayment(paymentConfig: any): Promise<void> {
    try {
      const redirectURL = await createTransakDirectURL(paymentConfig);
      
      const popup = window.open(
        redirectURL,
        'TransakDirectPayment',
        'width=500,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        toast.error('Please allow popups for this site to complete payment');
        return;
      }

      toast.info('Redirecting to Transak payment page...');

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          toast.info('Payment window closed. Please check your email for confirmation.');
        }
      }, 1000);

      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
          clearInterval(checkClosed);
        }
      }, 600000);

    } catch (error) {
      console.error('Direct Transak payment failed:', error);
      throw error;
    }
  }

  // Enhanced crypto payment handler
  const handleCryptoPayment = async () => {
    setIsProcessing(true);
    setSdkLoadAttempts(prev => prev + 1);

    try {
      const isSingleReport = currentPlan.id === 'single-report';
      const orderPrefix = isSingleReport ? 'single-report-crypto' : 'crypto-subscription';

      const transakConfig = {
        apiKey: getTransakApiKey(),
        environment: getTransakEnvironment(),
        isBuyOrSell: 'SELL',
        cryptoCurrency: selectedCrypto,
        cryptoAmount: amounts.userPays,
        fiatCurrency: selectedFiatCurrency,
        partnerOrderId: `${orderPrefix}_${selectedPlan}_${Date.now()}`,
        partnerCustomerId: `crypto-customer_${Date.now()}`,
        themeColor: '6366f1',
        hideMenu: true,
        productsAvailed: 'SELL',
        receivingMethod: 'bank_transfer',
        webhookUrl: isSingleReport 
          ? `${window.location.origin}/api/transak-webhook-single-report-crypto`
          : `${window.location.origin}/api/transak-webhook-crypto`,
      };

      try {
        await loadTransakSDK();

        const transak = new window.TransakSDK.default(transakConfig);

        transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData: any) => {
          const processedOrderData = {
            orderId: orderData.id || `order_${Date.now()}`,
            planId: selectedPlan,
            userPaid: amounts.userPays,
            userCurrency: selectedCrypto,
            businessReceived: amounts.businessReceives,
            businessCurrency: 'USD',
            provider: 'Transak-CryptoToBank',
            paymentMethod: 'crypto_to_bank_transfer',
            transakOrderData: orderData,
            timestamp: new Date().toISOString(),
            isSingleReport: isSingleReport,
          };

          const successMessage = isSingleReport 
            ? `${amounts.userPays.toFixed(6)} ${selectedCrypto} payment successful! You now have 24-hour access to premium reports.`
            : `${amounts.userPays.toFixed(6)} ${selectedCrypto} payment successful! $${amounts.businessReceives} USD will be deposited to your business bank account.`;

          toast.success(successMessage);
          
          if (isSingleReport) {
            onSingleReportSuccess?.(processedOrderData, amounts.businessReceives);
          } else {
            onSubscriptionSuccess?.(selectedPlan, processedOrderData, amounts.businessReceives);
          }
          
          setIsProcessing(false);
          onClose();
        });

        transak.on(transak.EVENTS.TRANSAK_ORDER_FAILED, (orderData: any) => {
          console.error('Transak crypto-to-bank order failed:', orderData);
          toast.error('Crypto to bank transfer failed. Please try again.');
          setIsProcessing(false);
        });

        transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
          setIsProcessing(false);
        });

        transak.on(transak.EVENTS.TRANSAK_ORDER_CREATED, (orderData: any) => {
          toast.info('Processing crypto to bank transfer...');
        });

        transak.on(transak.EVENTS.TRANSAK_ORDER_PROCESSING, (orderData: any) => {
          toast.info('Converting crypto to USD and transferring to your bank...');
        });

        transak.init();

      } catch (sdkError) {
        console.error('SDK loading failed for crypto payment:', sdkError);
        
        if (sdkLoadAttempts <= 2) {
          toast.info('Using alternative crypto payment method...');
          await initDirectTransakPayment(transakConfig);
          setIsProcessing(false);
        } else {
          throw new Error('Multiple crypto SDK loading attempts failed');
        }
      }

    } catch (error) {
      console.error('Crypto payment failed:', error);
      toast.error('Crypto payment service temporarily unavailable. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const isSingleReport = currentPlan.id === 'single-report';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="relative bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[95vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                💰 {isSingleReport ? 'Single Report Access' : 'Fixed USD Pricing Subscription'}
              </h2>
              <p className="text-gray-400">
                {isSingleReport 
                  ? 'Try our premium reports for just $5 • 24-hour access'
                  : 'Pay with any currency/crypto worldwide • Unlimited access'
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plan Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-6">Choose Your Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all transform hover:scale-105 ${selectedPlan === plan.id
                    ? 'border-indigo-500 bg-indigo-900/30 shadow-lg shadow-indigo-500/20'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}

                  {plan.badge && (
                    <div className="absolute -top-3 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        plan.id === 'single-report' 
                          ? 'bg-orange-600 text-white' 
                          : 'bg-green-600 text-white'
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-white mb-2">{plan.name}</h4>
                    <div className={`text-3xl font-bold mb-1 ${
                      plan.id === 'single-report' ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      ${plan.usdPrice} USD
                    </div>
                    <div className="text-sm text-gray-400 mb-2">{plan.duration}</div>
                    {plan.id === 'single-report' && (
                      <div className="text-xs text-orange-300 bg-orange-900/20 px-3 py-1 rounded-full">
                        Perfect for trying our service
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <span className={`mr-2 ${
                          plan.id === 'single-report' ? 'text-orange-400' : 'text-green-400'
                        }`}>✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Method Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Integration Method</h3>
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-600">
              <button
                onClick={() => setIntegrationMethod('sdk')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${integrationMethod === 'sdk'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
              >
                🚀 SDK (Recommended)
              </button>
              <button
                onClick={() => setIntegrationMethod('redirect')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${integrationMethod === 'redirect'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
              >
                🔗 Redirect (Backup)
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              SDK provides better UX, redirect opens in new window
            </p>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Payment Method</h3>
            <div className="flex bg-gray-800/50 rounded-xl p-1 border border-gray-600">
              <button
                onClick={() => setPaymentMethod('fiat')}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${paymentMethod === 'fiat'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
              >
                🌍 Fiat Currency 
              </button>
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold transition-all ${paymentMethod === 'crypto'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
              >
                🪙 Cryptocurrency 
              </button>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              {paymentMethod === 'fiat' ? 'Select Your Payment Currency' : 'Select Cryptocurrency'}
            </h3>

            {paymentMethod === 'fiat' ? (
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {FIAT_CURRENCIES.map((currency) => (
                  <button
                    key={currency.code}
                    onClick={() => setSelectedFiatCurrency(currency.code)}
                    className={`p-3 rounded-lg border-2 transition-all ${selectedFiatCurrency === currency.code
                      ? 'border-indigo-500 bg-indigo-900/30 text-white'
                      : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                      }`}
                  >
                    <div className="text-lg font-bold">{currency.symbol}</div>
                    <div className="text-xs">{currency.code}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {CRYPTOCURRENCIES.map((crypto) => (
                  <button
                    key={crypto.code}
                    onClick={() => setSelectedCrypto(crypto.code)}
                    className={`p-4 rounded-lg border-2 transition-all ${selectedCrypto === crypto.code
                      ? 'border-indigo-500 bg-indigo-900/30 text-white'
                      : 'border-gray-600 bg-gray-800/30 text-gray-300 hover:border-gray-500'
                      }`}
                  >
                    <div className="text-xl font-bold mb-1">{crypto.symbol}</div>
                    <div className="text-sm font-medium">{crypto.code}</div>
                    <div className="text-xs text-gray-400">{crypto.name}</div>
                    {!isPriceLoading && safeRates.has(crypto.code) && (
                      <div className="text-xs text-green-400 mt-1">
                        ${getCryptoPrice(crypto.code).toFixed(2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Payment Summary - Your Preferred Style */}
          <div className="mb-8 p-6 bg-gray-800/30 rounded-xl border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-4">Payment Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Selected Plan:</span>
                <span className="text-white font-medium">{currentPlan.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">
                  {isSingleReport ? 'Access Duration:' : 'Duration:'}
                </span>
                <span className="text-white">{currentPlan.duration}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Payment Method:</span>
                <span className="text-white">
                  {paymentMethod === 'fiat'
                    ? `${selectedFiatCurrencyData?.name} (${selectedFiatCurrency})`
                    : `${selectedCryptoData?.name} (${selectedCrypto})`
                  }
                </span>
              </div>

              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-400">You Pay:</span>
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {paymentMethod === 'fiat'
                        ? `${selectedFiatCurrencyData?.symbol}${amounts.userPays.toFixed(2)}`
                        : `${amounts.userPays.toFixed(selectedCrypto === 'SOL' || selectedCrypto === 'BTC' ? 6 : 2)} ${selectedCrypto}`
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-600 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Business Receives:</span>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${
                      isSingleReport ? 'text-orange-400' : 'text-green-400'
                    }`}>
                      ${amounts.businessReceives} USD
                    </div>
                  </div>
                </div>
              </div>

              {isSingleReport && (
                <div className="mt-4 p-3 bg-orange-900/20 border border-orange-600/30 rounded-lg">
                  <div className="flex items-center text-orange-300 text-sm">
                    <span className="mr-2">💡</span>
                    <span>
                      After payment, you'll get immediate access to view one premium report. 
                      Access expires after 24 hours.
                    </span>
                  </div>
                </div>
              )}

              {/* Connection Status Indicator */}
              {sdkLoadAttempts > 0 && (
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <div className="flex items-center text-blue-300 text-sm">
                    <span className="mr-2">🔄</span>
                    <span>
                      SDK Load Attempts: {sdkLoadAttempts} - Using enhanced connection methods
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Button */}
          <div className="space-y-4">
            <button
              onClick={paymentMethod === 'fiat' ? handleFiatPayment : handleCryptoPayment}
              disabled={isProcessing || isPriceLoading}
              className={`
                w-full py-4 px-6 rounded-xl font-bold text-lg
                transition-all duration-200 shadow-lg
                ${!isProcessing && !isPriceLoading
                  ? `bg-gradient-to-r ${
                      isSingleReport 
                        ? 'from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
                        : 'from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
                    } text-white hover:shadow-xl transform hover:scale-105`
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  {sdkLoadAttempts <= 1 ? 'Loading Payment System...' : 'Trying Alternative Method...'}
                </div>
              ) : isPriceLoading ? (
                'Loading current prices...'
              ) : isSingleReport ? (
                'Get 24-Hour Access Now'
              ) : (
                'Pay Now'
              )}
            </button>

            {/* Troubleshooting Notice */}
            {sdkLoadAttempts > 1 && !isProcessing && (
              <div className="p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                <div className="text-yellow-300 text-sm">
                  <div className="font-semibold mb-2">🔧 Connection Issues Detected</div>
                  <div className="space-y-1 text-xs">
                    <div>• Multiple fallback methods are being used</div>
                    <div>• If payment window doesn't open, try disabling ad blockers</div>
                    <div>• Ensure JavaScript is enabled in your browser</div>
                    <div>• Try refreshing the page if issues persist</div>
                  </div>
                </div>
              </div>
            )}

            {isSingleReport && (
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">
                  Want unlimited access? Consider our subscription plans above.
                </p>
                <p className="text-xs text-orange-400">
                  Single report payments are perfect for trying our service risk-free!
                </p>
              </div>
            )}
          </div>

          {/* Debug Information (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
              <div className="text-purple-300 text-sm">
                <div className="font-semibold mb-2">🔧 Debug Information:</div>
                <div className="space-y-1 text-xs">
                  <div>• Environment: {getTransakEnvironment()}</div>
                  <div>• API Key: {getTransakApiKey() ? `${getTransakApiKey().substring(0, 8)}...` : 'Not Set'}</div>
                  <div>• Integration Method: {integrationMethod}</div>
                  <div>• Payment Method: {paymentMethod}</div>
                  <div>• Selected Plan: {selectedPlan}</div>
                  <div>• SDK Load Attempts: {sdkLoadAttempts}</div>
                  <div>• Available Keys:</div>
                  <ul className="ml-4 text-xs">
                    <li>Staging: {process.env.NEXT_PUBLIC_TRANSAK_API_KEY_STAGING ? '✅ Set' : '❌ Missing'}</li>
                    <li>Production: {process.env.NEXT_PUBLIC_TRANSAK_API_KEY_PRODUCTION ? '✅ Set' : '❌ Missing'}</li>
                    <li>Generic: {process.env.NEXT_PUBLIC_TRANSAK_API_KEY ? '✅ Set' : '❌ Missing'}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Integration Status */}
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
            <div className="text-blue-300 text-sm">
              <div className="font-semibold mb-2">🔧 Current Configuration:</div>
              <div className="space-y-1 text-xs">
                <div>• Integration Method: {integrationMethod === 'sdk' ? 'Transak SDK' : 'Direct Redirect'}</div>
                <div>• Environment: {getTransakEnvironment()}</div>
                <div>• API Endpoint: {getTransakEnvironment() === 'PRODUCTION' ? 'api.transak.com' : 'api-stg.transak.com'}</div>
                <div>• Widget URL: {getTransakEnvironment() === 'PRODUCTION' ? 'global.transak.com' : 'staging-global.transak.com'}</div>
                <div>• SDK Version: 1.4.1 (Latest)</div>
              </div>
            </div>
          </div>

          {/* Security & Features Notice */}
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <span>🔒 Secure Payment Processing</span>
                <span>•</span>
                <span>🌍 Global Currency Support</span>
                <span>•</span>
                <span>⚡ Instant Confirmation</span>
              </div>
              <p className="text-xs text-gray-500">
                Powered by Transak • Enhanced SDK Loading • Fixed API Keys • ZkAGI2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}