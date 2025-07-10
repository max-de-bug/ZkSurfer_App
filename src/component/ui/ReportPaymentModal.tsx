// import { useState, useEffect } from 'react';
// import { X } from 'lucide-react';
// import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
// import { createFundKitConfig } from '@/lib/aarcConfig';
// import { useSubscriptionStore } from '@/stores/subscription-store';
// import { recordSubscription, getSubscriptionType, RecordSubscriptionPayload } from '@/lib/subscriptionApi';
// import { buildSolanaPayURL, waitForSolanaPay } from '@/lib/solanaPay';
// import { PublicKey } from '@solana/web3.js';
// import { QRCodeCanvas as QRCode } from 'qrcode.react';
// import { SolanaPayModal } from './SolanaPayModal';
// import { useModelStore } from '@/stores/useModel-store';


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
//     usdPrice: 0.05,
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
//   connectedWallet?: string; // Add connected wallet prop
// }

// export default function ReportPaymentModal({
//   isOpen,
//   onClose,
//   onPaymentSuccess,
//   receivingWallet = '0x01e919a01a7beff155bcEa5F42eF140881EF5E3a',
//   connectedWallet, // Connected user wallet
// }: ReportPaymentModalProps) {
//   const [selectedPlan, setSelectedPlan] = useState<string>('');
//   const [isProcessing, setIsProcessing] = useState(false);
//   const apiKey = process.env.NEXT_PUBLIC_AARC_API_KEY || '';
//   const [selectedMethod, setSelectedMethod] = useState<'aarc' | 'solana'>('aarc');
//   const [solanaPayURL, setSolanaPayURL] = useState<string>('');
//   const [referencePubKey, setReferencePubKey] = useState<PublicKey | null>(null);
//   const [isChecking, setIsChecking] = useState(false);
//   const { userEmail } = useModelStore();


//   const { checkSubscription, setPaymentSession, clearPaymentSession, getPaymentSession } = useSubscriptionStore();

//   const handleSolanaPay = async (planId: string) => {
//     const plan = PAYMENT_PLANS.find(p => p.id === planId);
//     if (!plan || !connectedWallet) return;

//     // 1) generate reference
//     const { reference: referenceString } = await fetch('/api/solana/createReference', {
//       method: 'POST',
//       body: JSON.stringify({ plan: planId }),
//     }).then(r => r.json());

//     const reference = new PublicKey(referenceString);

//     // 2) persist in state
//     setSelectedPlan(planId);
//     setReferencePubKey(reference);

//     // 3) build & show QR
//     const url = buildSolanaPayURL(plan.usdPrice, reference);
//     setSolanaPayURL(url.toString());

//     setIsProcessing(true);
//   };

//   // Add this function to your component
//   const recordSolanaPaySubscription = async (paymentResult: any, planId: string) => {
//     try {
//       console.log('📝 Recording Solana Pay subscription...');

//       if (!connectedWallet) {
//         throw new Error('No connected wallet found');
//       }
//       // Prepare subscription data for API
//       const subscriptionData: RecordSubscriptionPayload = {
//         walletAddress: connectedWallet, // The wallet that made payment
//         subscription_type: getSubscriptionType(planId),
//         createdAt: paymentResult.timestamp || new Date().toISOString(),
//         relayerTransactionId: '', // Empty for Solana Pay
//         requestId: '', // Empty for Solana Pay  
//         depositAddress: paymentResult.payerWallet, // Empty for Solana Pay
//         transactionHash: paymentResult.signature, // Use the Solana signature
//         transactionStatus: 'completed'
//       };

//       console.log('📤 Sending subscription data:', subscriptionData);

//       // Record subscription in your backend
//       const recordResult = await recordSubscription(subscriptionData);

//       if (recordResult.success) {
//         console.log('✅ Solana Pay subscription recorded successfully!');
//         await checkSubscription(paymentResult.payerWallet);
//         alert(`🎉 Payment successful! Subscription activated for wallet: ${paymentResult.payerWallet}`);

//         // Close modal and clean up
//         setSolanaPayURL('');
//         setReferencePubKey(null);
//         setIsProcessing(false);
//         onClose();

//       } else {
//         console.error('❌ Failed to record subscription:', recordResult.message);
//         alert(`⚠️ Payment successful but failed to activate subscription. Signature: ${paymentResult.signature}`);
//       }

//     } catch (error) {
//       console.error('❌ Error recording Solana subscription:', error);
//       alert(`⚠️ Payment found but API call failed. Signature: ${paymentResult.signature}`);
//     }
//   };

//   // 3.3 After user scans/pays, poll and then record subscription:
//   // useEffect(() => {
//   //   if (!solanaPayURL || !referencePubKey || !selectedPlan) return;

//   //   (async () => {
//   //     try {




//   //       // 1) find your plan object
//   //       const plan = PAYMENT_PLANS.find(p => p.id === selectedPlan)!;

//   //       // 2) wait for payment
//   //       const { signature, info } = await waitForSolanaPay(referencePubKey, plan.usdPrice);

//   //       // 3) send details to backend
//   //       const resp = await fetch('/api/solana/confirmPayment', {
//   //         method: 'POST',
//   //         headers: { 'Content-Type': 'application/json' },
//   //         body: JSON.stringify({
//   //           reference: referencePubKey.toBase58(),
//   //           signature,
//   //           amount: plan.usdPrice,
//   //           planId: selectedPlan,
//   //           userWallet: connectedWallet,
//   //         }),
//   //       }).then(r => r.json());

//   //       if (!resp.success) throw new Error(resp.error || 'confirmation failed');

//   //       // 4) notify parent
//   //       onPaymentSuccess?.(selectedPlan, { signature, info }, plan.usdPrice);
//   //       onClose();
//   //       alert('🎉 Solana Pay payment succeeded!');
//   //     } catch (err) {
//   //       console.error(err);
//   //       alert('❌ Solana Pay failed or timed out.');
//   //     } finally {
//   //       setIsProcessing(false);
//   //       setSolanaPayURL('');
//   //       setReferencePubKey(null);
//   //     }
//   //   })();
//   // }, [solanaPayURL, referencePubKey, selectedPlan, connectedWallet]);

//   useEffect(() => {
//     if (!referencePubKey || !selectedPlan) return;

//     // === CONFIG ===
//     const maxAttempts = 3;
//     const totalWindowMs = 5 * 60 * 1000;
//     const intervalMs = totalWindowMs / maxAttempts;

//     // === STATE ===
//     let attempts = 0;
//     let intervalId: NodeJS.Timeout;

//     const cleanup = () => {
//       clearInterval(intervalId);
//       setIsProcessing(false);
//       setSolanaPayURL('');
//       setReferencePubKey(null);
//     };

//     // === POLL FUNCTION ===
//     const poll = async () => {
//       attempts++;
//       console.log(`Solana-Pay poll #${attempts}`);

//       try {
//         const plan = PAYMENT_PLANS.find(p => p.id === selectedPlan)!;

//         // 1) check on-chain and get payer wallet
//         const paymentResult = await waitForSolanaPay(referencePubKey, plan.usdPrice);

//         // 2) Record subscription with extracted wallet address
//         if (paymentResult.payerWallet) {
//           await recordSolanaPaySubscription(paymentResult, selectedPlan);

//           // 3) Notify parent and cleanup
//           onPaymentSuccess?.(selectedPlan, paymentResult, plan.usdPrice);
//           cleanup();
//           onClose();

//         } else {
//           throw new Error('Could not extract payer wallet address');
//         }

//       } catch (err) {
//         console.warn('Solana-Pay attempt failed:', err);
//         if (attempts >= maxAttempts) {
//           alert('❌ Solana Pay not detected after multiple tries. Please try again.');
//           cleanup();
//         }
//       }
//     };

//     // === START POLLING ===
//     const initialDelay = 10 * 1000;
//     const timeoutId = setTimeout(() => {
//       poll();
//       intervalId = setInterval(poll, intervalMs);
//     }, initialDelay);

//     // === CLEANUP ON UNMOUNT OR CHANGE ===
//     return () => {
//       clearTimeout(timeoutId);
//       clearInterval(intervalId);
//     };
//   }, [referencePubKey, selectedPlan, connectedWallet, onPaymentSuccess, onClose]);


//   const handleCheckPayment = async () => {
//     if (!referencePubKey || !selectedPlan) return;
//     setIsChecking(true);
//     try {
//       const plan = PAYMENT_PLANS.find(p => p.id === selectedPlan)!;
//       console.log('🔎 Checking Solana Pay...');
//       // const { signature, info } = await waitForSolanaPay(referencePubKey, plan.usdPrice);
//       const result = await waitForSolanaPay(referencePubKey, plan.usdPrice);
//       console.log('✅ Payment found!', result);
//       if (result.signature && result.payerWallet) {
//         await recordSolanaPaySubscription(result, selectedPlan);
//       }
//     } catch (err) {
//       console.error('❌ No payment yet or error:', err);
//     } finally {
//       setIsChecking(false);
//     }
//   };


//   const handleFundKitPayment = (planId: string) => {
//     if (!apiKey) {
//       alert('❌ Missing AARC API key');
//       return;
//     }

//     if (!connectedWallet) {
//       alert('❌ Please connect your wallet first');
//       return;
//     }

//     const plan = PAYMENT_PLANS.find((p) => p.id === planId);
//     if (!plan) return;

//     setIsProcessing(true);
//     setSelectedPlan(planId);

//     // Store payment session data in Zustand
//     setPaymentSession(planId, connectedWallet);
//     console.log('💳 Payment session set:', { planId, connectedWallet });

//     const baseConfig = createFundKitConfig(apiKey, 0, receivingWallet);

//     const modal = new AarcFundKitModal({
//       ...baseConfig,
//       events: {
//         ...baseConfig.events,
//         // Single onTransactionSuccess handler with API integration
//         onTransactionSuccess: async (data: any) => {
//           console.log('✅ Transaction success data:', data);

//           try {
//             // Get payment session data from store
//             const paymentSession = getPaymentSession();
//             const actualPlanId = paymentSession.planId || planId;
//             const actualUserWallet = paymentSession.userWallet || connectedWallet;

//             console.log('💳 Using payment session:', paymentSession);

//             if (!actualUserWallet) {
//               throw new Error('No user wallet address available');
//             }

//             // Extract and safely convert all values to strings
//             const aarcData = data.data || {};

//             // Prepare subscription data for API call with the ACTUAL user wallet
//             const subscriptionData: RecordSubscriptionPayload = {
//               walletAddress: actualUserWallet, // Use the connected wallet, not receiving wallet
//               subscription_type: getSubscriptionType(actualPlanId),
//               createdAt: aarcData.createdAt ? String(aarcData.createdAt) : new Date().toISOString(),
//               relayerTransactionId: aarcData.relayerTransactionId ? String(aarcData.relayerTransactionId) : '',
//               requestId: aarcData.requestId ? String(aarcData.requestId) : '',
//               depositAddress: aarcData.depositAddress ? String(aarcData.depositAddress) : '',
//               transactionHash: aarcData.transactionHash ? String(aarcData.transactionHash) : (aarcData.txHash ? String(aarcData.txHash) : ''),
//               transactionStatus: aarcData.transactionStatus ? String(aarcData.transactionStatus) : 'completed',
//             };

//             console.log('📝 Recording subscription for user wallet:', actualUserWallet);
//             console.log('📝 Subscription data:', subscriptionData);

//             // Record subscription in your backend
//             const recordResult = await recordSubscription(subscriptionData);

//             if (recordResult.success) {
//               console.log('✅ Subscription recorded successfully');

//               // Update local subscription state for the user's wallet
//               await checkSubscription(actualUserWallet);

//               // Call the original success callback
//               onPaymentSuccess?.(actualPlanId, data, plan.usdPrice);

//               // Clear payment session
//               clearPaymentSession();

//               // Close modal and show success
//               onClose();
//               alert(`🎉 Payment successful! You now have ${plan.name}. Your subscription is active!`);
//             } else {
//               console.error('❌ Failed to record subscription:', recordResult.message);
//               // Still call success callback since payment went through
//               onPaymentSuccess?.(actualPlanId, data, plan.usdPrice);
//               clearPaymentSession();
//               onClose();
//               alert(`⚠️ Payment successful but failed to activate subscription. Please contact support. Transaction: ${aarcData.transactionHash || aarcData.txHash}`);
//             }

//           } catch (error) {
//             console.error('❌ Error processing subscription:', error);
//             const aarcData = data.data || {};
//             // Still call success callback since payment went through
//             onPaymentSuccess?.(planId, data, plan.usdPrice);
//             clearPaymentSession();
//             onClose();
//             alert(`⚠️ Payment successful but there was an issue activating your subscription. Please contact support. Transaction: ${aarcData.transactionHash || aarcData.txHash}`);
//           } finally {
//             setIsProcessing(false);
//             setSelectedPlan('');
//           }
//         },
//         onTransactionError: (error) => {
//           console.error('❌ Transaction Error:', error);
//           clearPaymentSession(); // Clear session on error
//           setIsProcessing(false);
//           setSelectedPlan('');
//           alert('❌ Payment failed. Please try again.');
//         },
//         onWidgetClose: () => {
//           console.log('🔒 Widget closed');
//           clearPaymentSession(); // Clear session if user closes widget
//           setIsProcessing(false);
//           setSelectedPlan('');
//         },
//         onWidgetOpen: () => {
//           console.log('🚀 Widget opened for:', plan.name, 'Amount:', plan.usdPrice);
//         },
//       },
//     });

//     // Set the USD amount
//     modal.updateRequestedAmountInUSD(plan.usdPrice);

//     // Set USDC on Base chain
//     const usdcAmount = plan.usdPrice; // 1 USDC ≈ 1 USD
//     modal.updateDestinationToken(
//       "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
//       8453, // Base chain ID
//       usdcAmount
//     );

//     console.log(`🎯 Configured: $${plan.usdPrice} → ${usdcAmount} USDC on Base`);

//     // Open the modal
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
//         {solanaPayURL && selectedMethod === 'solana' ? (
//           // <div className="flex flex-col items-center justify-center p-6 space-y-6">
//           //    <h3 className="text-white text-lg font-medium">Scan with your Solana wallet</h3>
//           //    <div className="bg-white p-4 rounded-lg">
//           //      <QRCode value={solanaPayURL} size={200} />
//           //    </div>
//           //    <button
//           //      onClick={() => {
//           //        setSolanaPayURL('');
//           //        setReferencePubKey(null);
//           //        setIsProcessing(false);
//           //      }}
//           //      className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
//           //    >
//           //      Cancel
//           //    </button>
//           //  </div>
//           <div className="flex flex-col items-center justify-center p-6 space-y-6">
//             <h3 className="text-white text-lg font-medium">Scan with your Solana wallet</h3>
//             <div className="bg-white p-4 rounded-lg">
//               <QRCode value={solanaPayURL} size={200} />
//             </div>
//             <div className="flex space-x-4">
//               <button
//                 onClick={() => {
//                   setSolanaPayURL('');
//                   setReferencePubKey(null);
//                   setIsProcessing(false);
//                 }}
//                 className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleCheckPayment}
//                 disabled={isChecking}
//                 className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full disabled:opacity-50"
//               >
//                 {isChecking ? 'Checking…' : 'Done'}
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
//             {PAYMENT_PLANS.map((plan) => (
//               <div
//                 key={plan.id}
//                 className={`relative p-6 rounded-xl border-2 transform hover:scale-105 transition ${plan.color === 'orange'
//                   ? 'border-orange-500'
//                   : plan.color === 'green'
//                     ? 'border-green-500'
//                     : 'border-blue-500'
//                   }`}
//               >
//                 {plan.popular && (
//                   <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
//                     🔥 MOST POPULAR
//                   </span>
//                 )}
//                 {plan.badge && (
//                   <span className="absolute -top-3 right-3 bg-orange-600 text-white px-2 py-1 rounded-full text-xs">
//                     {plan.badge}
//                   </span>
//                 )}

//                 <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
//                 <div className="text-4xl font-extrabold mb-1 text-white">${plan.usdPrice}</div>
//                 <p className="text-sm text-gray-400 mb-4">{plan.duration}</p>

//                 <ul className="text-gray-300 mb-4 space-y-1">
//                   {plan.features.map((f, i) => (
//                     <li key={i} className="flex items-start">
//                       <span className="mr-2">✓</span>
//                       <span className="text-sm">{f}</span>
//                     </li>
//                   ))}
//                 </ul>

//                 <div className="mt-4 flex items-center space-x-4">
//                   <label>
//                     <input
//                       type="radio"
//                       name={`method-${plan.id}`}
//                       value="aarc"
//                       checked={selectedMethod === 'aarc'}
//                       onChange={() => setSelectedMethod('aarc')}
//                       className="mr-1"
//                     />
//                     AARC(Ethereum)
//                   </label>
//                   <label>
//                     <input
//                       type="radio"
//                       name={`method-${plan.id}`}
//                       value="solana"
//                       checked={selectedMethod === 'solana'}
//                       onChange={() => setSelectedMethod('solana')}
//                       className="mr-1"
//                     />
//                     Solana Pay
//                   </label>
//                 </div>

//                 <button
//                   // onClick={() => handleFundKitPayment(plan.id)}
//                   onClick={() =>
//                     selectedMethod === 'aarc'
//                       ? handleFundKitPayment(plan.id)
//                       : handleSolanaPay(plan.id)
//                   }
//                   disabled={isProcessing && selectedPlan === plan.id}
//                   className={`w-full py-2 rounded-lg font-semibold ${isProcessing && selectedPlan === plan.id
//                     ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
//                     : plan.color === 'orange'
//                       ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
//                       : plan.color === 'green'
//                         ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
//                         : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
//                     } transition-all duration-200`}
//                 >
//                   {isProcessing && selectedPlan === plan.id ? (
//                     <span className="flex items-center justify-center">
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                       Opening...
//                     </span>
//                   ) : (
//                     `Pay $${plan.usdPrice}`
//                   )}
//                 </button>
//               </div>
//             ))}

//           </div>
//         )}

//       </div>
//     </div >
//   );
// }

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
import { createFundKitConfig } from '@/lib/aarcConfig';
import { useSubscriptionStore } from '@/stores/subscription-store';
import { recordSubscription, getSubscriptionType, RecordSubscriptionPayload } from '@/lib/subscriptionApi';
import { buildSolanaPayURL, waitForSolanaPay } from '@/lib/solanaPay';
import { PublicKey } from '@solana/web3.js';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { useModelStore } from '@/stores/useModel-store';

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

const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Subscription',
    usdPrice: 1,
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

// Flow steps enum
enum PaymentStep {
  PLAN_SELECTION = 'plan_selection',
  // TODO: Add email verification steps later
  // EMAIL_INPUT = 'email_input',
  // OTP_VERIFICATION = 'otp_verification', 
  TERMS_ACCEPTANCE = 'terms_acceptance',
  PAYMENT_METHOD_SELECTION = 'payment_method_selection',
  SOLANA_PAY_QR = 'solana_pay_qr',
  AARC_PROCESSING = 'aarc_processing'
}

export interface ReportPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: (planId: string, orderData: any, usdAmount: number) => void;
  receivingWallet?: string;
  connectedWallet?: string;
}

export default function ReportPaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess,
  receivingWallet = '0x01e919a01a7beff155bcEa5F42eF140881EF5E3a',
  connectedWallet,
}: ReportPaymentModalProps) {
  // Existing state
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_AARC_API_KEY || '';
  const [solanaPayURL, setSolanaPayURL] = useState<string>('');
  const [referencePubKey, setReferencePubKey] = useState<PublicKey | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // New state for enhanced flow
  const [currentStep, setCurrentStep] = useState<PaymentStep>(PaymentStep.PLAN_SELECTION);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'aarc' | 'solana' | null>(null);

  // TODO: Add these when implementing email verification
  // const [userInputEmail, setUserInputEmail] = useState<string>('');
  // const [otpCode, setOtpCode] = useState<string>('');
  // const [isOtpSending, setIsOtpSending] = useState(false);
  // const [isOtpVerifying, setIsOtpVerifying] = useState(false);

  const { userEmail } = useModelStore();
  const { checkSubscription, setPaymentSession, clearPaymentSession, getPaymentSession } = useSubscriptionStore();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(PaymentStep.PLAN_SELECTION);
      setSelectedPlan('');
      // setUserInputEmail('');
      // setOtpCode('');
      setTermsAccepted(false);
      setSelectedPaymentMethod(null);
    }
  }, [isOpen]);

  // Handle plan selection and determine next step
  const handlePlanSelection = (planId: string) => {
    setSelectedPlan(planId);

    // Check if user has email (Magic Link user)
    if (userEmail) {
      console.log('📧 Magic Link user detected:', userEmail);
      setCurrentStep(PaymentStep.TERMS_ACCEPTANCE);
    } else {
      // TODO: Implement email verification flow for non-Magic Link users
      // For now, skip directly to terms acceptance
      console.log('📧 No email found - TODO: Add email verification');
      alert('TODO: Email verification for non-Magic Link users will be implemented later');
      setCurrentStep(PaymentStep.TERMS_ACCEPTANCE);
    }
  };

  // Send OTP to email
  // const handleSendOTP = async () => {
  //   if (!userInputEmail) {
  //     alert('Please enter a valid email address');
  //     return;
  //   }

  //   setIsOtpSending(true);
  //   try {
  //     // TODO: Replace with your OTP API
  //     const response = await fetch('/api/send-otp', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email: userInputEmail })
  //     });

  //     if (response.ok) {
  //       console.log('📧 OTP sent to:', userInputEmail);
  //       setCurrentStep(PaymentStep.OTP_VERIFICATION);
  //       alert(`OTP sent to ${userInputEmail}`);
  //     } else {
  //       throw new Error('Failed to send OTP');
  //     }
  //   } catch (error) {
  //     console.error('Error sending OTP:', error);
  //     alert('Failed to send OTP. Please try again.');
  //   } finally {
  //     setIsOtpSending(false);
  //   }
  // };

  // Verify OTP
  // const handleVerifyOTP = async () => {
  //   if (!otpCode) {
  //     alert('Please enter the OTP code');
  //     return;
  //   }

  //   setIsOtpVerifying(true);
  //   try {
  //     // TODO: Replace with your OTP verification API
  //     const response = await fetch('/api/verify-otp', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ email: userInputEmail, otp: otpCode })
  //     });

  //     if (response.ok) {
  //       console.log('✅ OTP verified for:', userInputEmail);
  //       setCurrentStep(PaymentStep.TERMS_ACCEPTANCE);
  //     } else {
  //       throw new Error('Invalid OTP');
  //     }
  //   } catch (error) {
  //     console.error('Error verifying OTP:', error);
  //     alert('Invalid OTP. Please try again.');
  //   } finally {
  //     setIsOtpVerifying(false);
  //   }
  // };

  // Handle terms acceptance
  const handleTermsAcceptance = () => {
    if (!termsAccepted) {
      alert('Please accept the terms and conditions to continue');
      return;
    }
    setCurrentStep(PaymentStep.PAYMENT_METHOD_SELECTION);
  };

  // Handle payment method selection
  const handlePaymentMethodSelection = (method: 'aarc' | 'solana') => {
    setSelectedPaymentMethod(method);

    if (method === 'solana') {
      handleSolanaPay(selectedPlan);
      setCurrentStep(PaymentStep.SOLANA_PAY_QR);
    } else {
      handleFundKitPayment(selectedPlan);
      setCurrentStep(PaymentStep.AARC_PROCESSING);
    }
  };

  // Go back to previous step
  const handleGoBack = () => {
    switch (currentStep) {
      case PaymentStep.TERMS_ACCEPTANCE:
        setCurrentStep(PaymentStep.PLAN_SELECTION);
        break;
      case PaymentStep.PAYMENT_METHOD_SELECTION:
        setCurrentStep(PaymentStep.TERMS_ACCEPTANCE);
        break;
      case PaymentStep.SOLANA_PAY_QR:
        setCurrentStep(PaymentStep.PAYMENT_METHOD_SELECTION);
        setSolanaPayURL('');
        setReferencePubKey(null);
        setIsProcessing(false);
        break;
      default:
        setCurrentStep(PaymentStep.PLAN_SELECTION);
    }
  };

  // Existing payment functions (unchanged)
  const handleSolanaPay = async (planId: string) => {
    const plan = PAYMENT_PLANS.find(p => p.id === planId);
    if (!plan || !connectedWallet) return;

    const { reference: referenceString } = await fetch('/api/solana/createReference', {
      method: 'POST',
      body: JSON.stringify({ plan: planId }),
    }).then(r => r.json());

    const reference = new PublicKey(referenceString);
    setReferencePubKey(reference);

    const url = buildSolanaPayURL(plan.usdPrice, reference);
    setSolanaPayURL(url.toString());
    setIsProcessing(true);
  };

  const recordSolanaPaySubscription = async (paymentResult: any, planId: string) => {
    try {
      console.log('📝 Recording Solana Pay subscription...');

      if (!connectedWallet) {
        throw new Error('No connected wallet found');
      }

      const subscriptionData: RecordSubscriptionPayload = {
        walletAddress: connectedWallet,
        email: userEmail,
        subscription_type: getSubscriptionType(planId),
        createdAt: paymentResult.timestamp || new Date().toISOString(),
        relayerTransactionId: '',
        requestId: '',
        depositAddress: paymentResult.payerWallet,
        transactionHash: paymentResult.signature,
        transactionStatus: 'COMPLETED'
      };

      console.log('📤 Sending subscription data:', subscriptionData);

      const recordResult = await recordSubscription(subscriptionData);

      if (recordResult.success) {
         await checkSubscription(connectedWallet);
        console.log('✅ Solana Pay subscription recorded successfully!');
        // await checkSubscription(connectedWallet);
        alert(`🎉 Payment successful! Subscription activated for wallet: ${connectedWallet}`);
        onClose();
      } else {
        console.error('❌ Failed to record subscription:', recordResult.message);
        alert(`⚠️ Payment successful but failed to activate subscription. Signature: ${paymentResult.signature}`);
      }
    } catch (error) {
      console.error('❌ Error recording Solana subscription:', error);
      alert(`⚠️ Payment found but API call failed. Signature: ${paymentResult.signature}`);
    }
  };

  const handleCheckPayment = async () => {
    if (!referencePubKey || !selectedPlan) return;
    setIsChecking(true);
    try {
      const plan = PAYMENT_PLANS.find(p => p.id === selectedPlan)!;
      console.log('🔎 Checking Solana Pay...');
      const result = await waitForSolanaPay(referencePubKey, plan.usdPrice);
      console.log('✅ Payment found!', result);
      if (result.signature && result.payerWallet) {
        await recordSolanaPaySubscription(result, selectedPlan);
      }
    } catch (err) {
      console.error('❌ No payment yet or error:', err);
    } finally {
      setIsChecking(false);
    }
  };

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
    setPaymentSession(planId, connectedWallet);

    const baseConfig = createFundKitConfig(apiKey, 0, receivingWallet);

    const modal = new AarcFundKitModal({
      ...baseConfig,
      events: {
        ...baseConfig.events,
        onTransactionSuccess: async (data: any) => {
          console.log('✅ Transaction success data:', data);

          try {
            const paymentSession = getPaymentSession();
            const actualPlanId = paymentSession.planId || planId;
            const actualUserWallet = paymentSession.userWallet || connectedWallet;

            if (!actualUserWallet) {
              throw new Error('No user wallet address available');
            }

            const aarcData = data.data || {};

            const subscriptionData: RecordSubscriptionPayload = {
              walletAddress: actualUserWallet,
              email: userEmail,
              subscription_type: getSubscriptionType(actualPlanId),
              createdAt: aarcData.createdAt ? String(aarcData.createdAt) : new Date().toISOString(),
              relayerTransactionId: aarcData.relayerTransactionId ? String(aarcData.relayerTransactionId) : '',
              requestId: aarcData.requestId ? String(aarcData.requestId) : '',
              depositAddress: aarcData.depositAddress ? String(aarcData.depositAddress) : '',
              transactionHash: aarcData.transactionHash ? String(aarcData.transactionHash) : (aarcData.txHash ? String(aarcData.txHash) : ''),
              transactionStatus: aarcData.transactionStatus ? String(aarcData.transactionStatus) : 'COMPLETED',
            };

            const recordResult = await recordSubscription(subscriptionData);

            if (recordResult.success) {
              await checkSubscription(actualUserWallet);
              onPaymentSuccess?.(actualPlanId, data, plan.usdPrice);
              clearPaymentSession();
              onClose();
              alert(`🎉 Payment successful! You now have ${plan.name}. Your subscription is active!`);
            } else {
              console.error('❌ Failed to record subscription:', recordResult.message);
              onPaymentSuccess?.(actualPlanId, data, plan.usdPrice);
              clearPaymentSession();
              onClose();
              alert(`⚠️ Payment successful but failed to activate subscription. Please contact support.`);
            }
          } catch (error) {
            console.error('❌ Error processing subscription:', error);
            onPaymentSuccess?.(planId, data, plan.usdPrice);
            clearPaymentSession();
            onClose();
            alert(`⚠️ Payment successful but there was an issue activating your subscription. Please contact support.`);
          } finally {
            setIsProcessing(false);
          }
        },
        onTransactionError: (error) => {
          console.error('❌ Transaction Error:', error);
          clearPaymentSession();
          setIsProcessing(false);
          alert('❌ Payment failed. Please try again.');
        },
        onWidgetClose: () => {
          console.log('🔒 Widget closed');
          clearPaymentSession();
          setIsProcessing(false);
          setCurrentStep(PaymentStep.PAYMENT_METHOD_SELECTION);
        },
      },
    });

    modal.updateRequestedAmountInUSD(plan.usdPrice);
    const usdcAmount = plan.usdPrice;
    modal.updateDestinationToken("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 8453, usdcAmount);
    modal.openModal();
  };

  if (!isOpen) return null;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case PaymentStep.PLAN_SELECTION:
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {PAYMENT_PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-xl border-2 transform hover:scale-105 transition cursor-pointer ${plan.color === 'orange' ? 'border-orange-500' :
                  plan.color === 'green' ? 'border-green-500' : 'border-blue-500'
                  }`}
                onClick={() => handlePlanSelection(plan.id)}
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

                <div className={`w-full py-2 rounded-lg font-semibold text-center ${plan.color === 'orange' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                  plan.color === 'green' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                    'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  }`}>
                  Select Plan
                </div>
              </div>
            ))}
          </div>
        );

      case PaymentStep.TERMS_ACCEPTANCE:
        const selectedPlanData = PAYMENT_PLANS.find(p => p.id === selectedPlan);
        return (
          <div className="p-6 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Terms & Conditions</h3>
              <p className="text-gray-400">
                {userEmail ? `Welcome back, ${userEmail}!` : 'Please accept our terms to continue'}
              </p>
              {selectedPlanData && (
                <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                  <p className="text-white font-semibold">{selectedPlanData.name}</p>
                  <p className="text-2xl font-bold text-green-400">${selectedPlanData.usdPrice}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-gray-300 text-sm">
                  By proceeding with this purchase, you agree to our Terms of Service and Privacy Policy.
                  Your subscription will auto-renew unless cancelled. You can cancel anytime from your account settings.
                  All payments are processed securely through our payment partners.
                </p>
              </div>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-300 text-sm">
                  I agree to the Terms & Conditions and Privacy Policy
                </span>
              </label>

              <div className="flex space-x-3">
                <button
                  onClick={handleGoBack}
                  className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleTermsAcceptance}
                  disabled={!termsAccepted}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        );

      case PaymentStep.PAYMENT_METHOD_SELECTION:
        return (
          <div className="p-6 max-w-lg mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-2">Choose Payment Method</h3>
              <p className="text-gray-400">Select how you'd like to pay</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handlePaymentMethodSelection('aarc')}
                className="w-full p-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg border-2 border-transparent hover:border-purple-400 transition-all"
              >
                <div className="text-lg font-bold mb-2">💳 AARC (Ethereum)</div>
                <div className="text-sm opacity-90">Pay with any Ethereum wallet or card</div>
              </button>

              <button
                onClick={() => handlePaymentMethodSelection('solana')}
                className="w-full p-6 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-lg border-2 border-transparent hover:border-green-400 transition-all"
              >
                <div className="text-lg font-bold mb-2">⚡ Solana Pay</div>
                <div className="text-sm opacity-90">Pay with USDC on Solana</div>
              </button>

              <button
                onClick={handleGoBack}
                className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
              >
                Back
              </button>
            </div>
          </div>
        );

      case PaymentStep.SOLANA_PAY_QR:
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-6">
            <h3 className="text-white text-lg font-medium">Scan with your Solana wallet</h3>
            <div className="bg-white p-4 rounded-lg">
              <QRCode value={solanaPayURL} size={200} />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleGoBack}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full"
              >
                Back
              </button>
              <button
                onClick={handleCheckPayment}
                disabled={isChecking}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full disabled:opacity-50"
              >
                {isChecking ? 'Checking...' : 'Done'}
              </button>
            </div>
          </div>
        );

      default:
        return <div className="p-6 text-white text-center">Loading...</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 rounded-2xl shadow-xl w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">
            {currentStep === PaymentStep.PLAN_SELECTION ? '🚀 Choose Your Plan' :
              currentStep === PaymentStep.TERMS_ACCEPTANCE ? '📋 Terms & Conditions' :
                currentStep === PaymentStep.PAYMENT_METHOD_SELECTION ? '💳 Payment Method' :
                  currentStep === PaymentStep.SOLANA_PAY_QR ? '⚡ Solana Pay' :
                    '💳 Processing Payment'}
          </h2>
          <button onClick={onClose} disabled={isProcessing}>
            <X className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Dynamic Content */}
        {renderCurrentStep()}
      </div>
    </div>
  );
}