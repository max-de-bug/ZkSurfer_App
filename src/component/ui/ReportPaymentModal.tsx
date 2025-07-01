// import { useState } from 'react';
// import { X } from 'lucide-react';
// import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
// import { createFundKitConfig } from '@/lib/aarcConfig';
// import { useSubscriptionStore } from '@/stores/subscription-store';

// interface PaymentPlan {
//   id: string;
//   name: string;
//   usdPrice: number;
//   duration: string;
//   features: string[];
//   popular?: boolean;
//   badge?: string;
//   color: 'orange' | 'blue' | 'green';
// }

// // Updated to include Monthly ($50) and Yearly ($500) subscription plans
// const PAYMENT_PLANS: PaymentPlan[] = [
//   {
//     id: 'monthly',
//     name: 'Monthly Subscription',
//     usdPrice: 50,
//     duration: '1 month',
//     features: [
//       '📊 All premium prediction reports',
//       '📈 Advanced market analysis',
//       '🎯 Trading signals',
//       '📱 Unlimited access',
//     ],
//     color: 'blue',
//   },
//   {
//     id: 'yearly',
//     name: 'Yearly Subscription',
//     usdPrice: 500,
//     duration: '12 months',
//     features: [
//       '📊 All premium prediction reports',
//       '📈 Advanced market analysis',
//       '🎯 Trading signals',
//       '⭐ Priority support',
//       '💎 VIP community access',
//     ],
//     popular: true,
//     badge: 'BEST VALUE',
//     color: 'green',
//   },
// ];

// export interface ReportPaymentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onPaymentSuccess?: (planId: string, orderData: any, usdAmount: number) => void;
//   receivingWallet?: string;
// }

// export default function ReportPaymentModal({
//   isOpen,
//   onClose,
//   onPaymentSuccess,
//   receivingWallet = '0x5Bd41Fa2AD9238BE534F1AFe1cAb0EE337D5A73E',
// }: ReportPaymentModalProps) {
//   const [selectedPlan, setSelectedPlan] = useState<string>('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const apiKey = process.env.NEXT_PUBLIC_AARC_API_KEY || '';

//   const { checkSubscription } = useSubscriptionStore();

//   const handleFundKitPayment = (planId: string) => {
//     if (!apiKey) {
//       alert('❌ Missing AARC API key');
//       return;
//     }
//     const plan = PAYMENT_PLANS.find((p) => p.id === planId);
//     if (!plan) return;

//     setIsProcessing(true);
//     setSelectedPlan(planId);

//     const baseConfig = createFundKitConfig(apiKey, 0, receivingWallet);

//     const modal = new AarcFundKitModal({
//       ...baseConfig,
//       events: {
//         ...baseConfig.events,

//          onTransactionSuccess: async (data) => {
//           console.log('✅ Transaction success data:', data);

//           try {
//             // Prepare subscription data for API call
//             const subscriptionData = {
//               walletAddress: receivingWallet,
//               subscription_type: getSubscriptionType(planId),
//               createdAt: data.data.createdAt || new Date().toISOString(),
//               relayerTransactionId: data.data.relayerTransactionId || '',
//               requestId: data.data.requestId || '',
//               depositAddress: data.data.depositAddress || '',
//               transactionHash: data.data.transactionHash || data.data.txHash || '',
//               transactionStatus: data.data.transactionStatus || 'completed',
//             };

//             console.log('📝 Recording subscription:', subscriptionData);

//             // Record subscription in your backend
//             const recordResult = await recordSubscription(subscriptionData);

//             if (recordResult.success) {
//               console.log('✅ Subscription recorded successfully');

//               // Update local subscription state
//               await checkSubscription(receivingWallet);

//               // Call the original success callback
//               onPaymentSuccess?.(planId, data, plan.usdPrice);

//               // Close modal and show success
//               onClose();
//               alert(`🎉 Payment successful! You now have ${plan.name}. Your subscription is active!`);
//             } else {
//               console.error('❌ Failed to record subscription:', recordResult.message);
//               alert(`⚠️ Payment successful but failed to activate subscription. Please contact support.`);
//             }

//           } catch (error) {
//             console.error('❌ Error processing subscription:', error);
//             alert(`⚠️ Payment successful but there was an issue activating your subscription. Please contact support.`);
//           } finally {
//             setIsProcessing(false);
//             setSelectedPlan('');
//           }
//         },

//         onTransactionSuccess: (data) => {
//           onPaymentSuccess?.(planId, data, plan.usdPrice);
//           setIsProcessing(false);
//           setSelectedPlan('');
//           onClose();
//           alert(`🎉 Payment successful! You now have ${plan.name}.`);
//         },
//         onTransactionError: (error) => {
//           console.error('❌ Error', error);
//           setIsProcessing(false);
//           setSelectedPlan('');
//           alert('❌ Payment failed. Please try again.');
//         },
//       },
//     });

//     modal.updateRequestedAmountInUSD(plan.usdPrice);

//     const usdcAmount = plan.usdPrice; // 1 USDC ≈ 1 USD

//     modal.updateDestinationToken(
//       "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
//       8453, // Base chain ID
//       usdcAmount // USDC amount (approximately equal to USD amount)
//     );

//     modal.openModal();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
//       <div className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-gray-700">
//           <h2 className="text-2xl font-bold text-white">🚀 Choose Your Plan</h2>
//           <button onClick={onClose} disabled={isProcessing}>
//             <X className="w-6 h-6 text-gray-400 hover:text-white" />
//           </button>
//         </div>

//         {/* Plans Grid */}
//         <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//           {PAYMENT_PLANS.map((plan) => (
//             <div
//               key={plan.id}
//               className={`relative p-6 rounded-xl border-2 transform hover:scale-105 transition ${plan.color === 'orange'
//                 ? 'border-orange-500'
//                 : plan.color === 'green'
//                   ? 'border-green-500'
//                   : 'border-blue-500'
//                 }`}
//             >
//               {plan.popular && (
//                 <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
//                   🔥 MOST POPULAR
//                 </span>
//               )}
//               {plan.badge && (
//                 <span className="absolute -top-3 right-3 bg-orange-600 text-white px-2 py-1 rounded-full text-xs">
//                   {plan.badge}
//                 </span>
//               )}

//               <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
//               <div className="text-4xl font-extrabold mb-1 text-white">${plan.usdPrice}</div>
//               <p className="text-sm text-gray-400 mb-4">{plan.duration}</p>

//               <ul className="text-gray-300 mb-4 space-y-1">
//                 {plan.features.map((f, i) => (
//                   <li key={i} className="flex items-start">
//                     <span className="mr-2">✓</span>
//                     <span className="text-sm">{f}</span>
//                   </li>
//                 ))}
//               </ul>

//               <button
//                 onClick={() => handleFundKitPayment(plan.id)}
//                 disabled={isProcessing && selectedPlan === plan.id}
//                 className={`w-full py-2 rounded-lg font-semibold ${isProcessing && selectedPlan === plan.id
//                   ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
//                   : plan.color === 'orange'
//                     ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
//                     : plan.color === 'green'
//                       ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
//                       : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
//                   }`}
//               >
//                 {isProcessing && selectedPlan === plan.id ? 'Opening…' : `Pay $${plan.usdPrice}`}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from 'react';
import { X } from 'lucide-react';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
import { createFundKitConfig } from '@/lib/aarcConfig';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { recordSubscription, getSubscriptionType, RecordSubscriptionPayload } from '@/lib/subscriptionApi';

interface PaymentPlan {
  id: string;
  name: string;
  usdPrice: number;
  duration: string;
  features: string[];
  popular?: boolean;
  badge?: string;
  color: 'orange' | 'blue' | 'green';
}

// Updated to include Monthly ($50) and Yearly ($500) subscription plans
const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Subscription',
    usdPrice: 50,
    duration: '1 month',
    features: [
      '📊 All premium prediction reports',
      '📈 Advanced market analysis',
      '🎯 Trading signals',
      '📱 Unlimited access',
    ],
    color: 'blue',
  },
  {
    id: 'yearly',
    name: 'Yearly Subscription',
    usdPrice: 500,
    duration: '12 months',
    features: [
      '📊 All premium prediction reports',
      '📈 Advanced market analysis',
      '🎯 Trading signals',
      '⭐ Priority support',
      '💎 VIP community access',
    ],
    popular: true,
    badge: 'BEST VALUE',
    color: 'green',
  },
];

export interface ReportPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (planId: string, orderData: any, usdAmount: number) => void;
  receivingWallet?: string;
  connectedWallet?: string; // Add connected wallet prop
}

export default function ReportPaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  receivingWallet = '0x5Bd41Fa2AD9238BE534F1AFe1cAb0EE337D5A73E',
  connectedWallet, // Connected user wallet
}: ReportPaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_AARC_API_KEY || '';

  const { checkSubscription, setPaymentSession, clearPaymentSession, getPaymentSession } = useSubscriptionStore();

  const handleFundKitPayment = (planId: string) => {
    if (!apiKey) {
      alert('❌ Missing AARC API key');
      return;
    }

    if (!connectedWallet) {
      alert('❌ Please connect your wallet first');
      return;
    }

    const plan = PAYMENT_PLANS.find((p) => p.id === planId);
    if (!plan) return;

    setIsProcessing(true);
    setSelectedPlan(planId);

    // Store payment session data in Zustand
    setPaymentSession(planId, connectedWallet);
    console.log('💳 Payment session set:', { planId, connectedWallet });

    const baseConfig = createFundKitConfig(apiKey, 0, receivingWallet);

    const modal = new AarcFundKitModal({
      ...baseConfig,
      events: {
        ...baseConfig.events,
        // Single onTransactionSuccess handler with API integration
        onTransactionSuccess: async (data: any) => {
          console.log('✅ Transaction success data:', data);

          try {
            // Get payment session data from store
            const paymentSession = getPaymentSession();
            const actualPlanId = paymentSession.planId || planId;
            const actualUserWallet = paymentSession.userWallet || connectedWallet;

            console.log('💳 Using payment session:', paymentSession);

            if (!actualUserWallet) {
              throw new Error('No user wallet address available');
            }

            // Extract and safely convert all values to strings
            const aarcData = data.data || {};

            // Prepare subscription data for API call with the ACTUAL user wallet
            const subscriptionData: RecordSubscriptionPayload = {
              walletAddress: actualUserWallet, // Use the connected wallet, not receiving wallet
              subscription_type: getSubscriptionType(actualPlanId),
              createdAt: aarcData.createdAt ? String(aarcData.createdAt) : new Date().toISOString(),
              relayerTransactionId: aarcData.relayerTransactionId ? String(aarcData.relayerTransactionId) : '',
              requestId: aarcData.requestId ? String(aarcData.requestId) : '',
              depositAddress: aarcData.depositAddress ? String(aarcData.depositAddress) : '',
              transactionHash: aarcData.transactionHash ? String(aarcData.transactionHash) : (aarcData.txHash ? String(aarcData.txHash) : ''),
              transactionStatus: aarcData.transactionStatus ? String(aarcData.transactionStatus) : 'completed',
            };

            console.log('📝 Recording subscription for user wallet:', actualUserWallet);
            console.log('📝 Subscription data:', subscriptionData);

            // Record subscription in your backend
            const recordResult = await recordSubscription(subscriptionData);

            if (recordResult.success) {
              console.log('✅ Subscription recorded successfully');

              // Update local subscription state for the user's wallet
              await checkSubscription(actualUserWallet);

              // Call the original success callback
              onPaymentSuccess?.(actualPlanId, data, plan.usdPrice);

              // Clear payment session
              clearPaymentSession();

              // Close modal and show success
              onClose();
              alert(`🎉 Payment successful! You now have ${plan.name}. Your subscription is active!`);
            } else {
              console.error('❌ Failed to record subscription:', recordResult.message);
              // Still call success callback since payment went through
              onPaymentSuccess?.(actualPlanId, data, plan.usdPrice);
              clearPaymentSession();
              onClose();
              alert(`⚠️ Payment successful but failed to activate subscription. Please contact support. Transaction: ${aarcData.transactionHash || aarcData.txHash}`);
            }

          } catch (error) {
            console.error('❌ Error processing subscription:', error);
            const aarcData = data.data || {};
            // Still call success callback since payment went through
            onPaymentSuccess?.(planId, data, plan.usdPrice);
            clearPaymentSession();
            onClose();
            alert(`⚠️ Payment successful but there was an issue activating your subscription. Please contact support. Transaction: ${aarcData.transactionHash || aarcData.txHash}`);
          } finally {
            setIsProcessing(false);
            setSelectedPlan('');
          }
        },
        onTransactionError: (error) => {
          console.error('❌ Transaction Error:', error);
          clearPaymentSession(); // Clear session on error
          setIsProcessing(false);
          setSelectedPlan('');
          alert('❌ Payment failed. Please try again.');
        },
        onWidgetClose: () => {
          console.log('🔒 Widget closed');
          clearPaymentSession(); // Clear session if user closes widget
          setIsProcessing(false);
          setSelectedPlan('');
        },
        onWidgetOpen: () => {
          console.log('🚀 Widget opened for:', plan.name, 'Amount:', plan.usdPrice);
        },
      },
    });

    // Set the USD amount
    modal.updateRequestedAmountInUSD(plan.usdPrice);

    // Set USDC on Base chain
    const usdcAmount = plan.usdPrice; // 1 USDC ≈ 1 USD
    modal.updateDestinationToken(
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
      8453, // Base chain ID
      usdcAmount
    );

    console.log(`🎯 Configured: $${plan.usdPrice} → ${usdcAmount} USDC on Base`);

    // Open the modal
    modal.openModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">🚀 Choose Your Plan</h2>
          <button onClick={onClose} disabled={isProcessing}>
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {PAYMENT_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-6 rounded-xl border-2 transform hover:scale-105 transition ${plan.color === 'orange'
                ? 'border-orange-500'
                : plan.color === 'green'
                  ? 'border-green-500'
                  : 'border-blue-500'
                }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  🔥 MOST POPULAR
                </span>
              )}
              {plan.badge && (
                <span className="absolute -top-3 right-3 bg-orange-600 text-white px-2 py-1 rounded-full text-xs">
                  {plan.badge}
                </span>
              )}

              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-4xl font-extrabold mb-1 text-white">${plan.usdPrice}</div>
              <p className="text-sm text-gray-400 mb-4">{plan.duration}</p>

              <ul className="text-gray-300 mb-4 space-y-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2">✓</span>
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleFundKitPayment(plan.id)}
                disabled={isProcessing && selectedPlan === plan.id}
                className={`w-full py-2 rounded-lg font-semibold ${isProcessing && selectedPlan === plan.id
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : plan.color === 'orange'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                    : plan.color === 'green'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                  } transition-all duration-200`}
              >
                {isProcessing && selectedPlan === plan.id ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Opening...
                  </span>
                ) : (
                  `Pay $${plan.usdPrice}`
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}