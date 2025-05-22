// app/payment-failure/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FiX, FiRefreshCw, FiAlertCircle } from "react-icons/fi";

export default function PaymentFailurePage() {
    const router = useRouter();
    const params = useSearchParams();
    const recipient = params.get("recipient") ?? "—";
    const amount = params.get("amount") ?? "0";
    const currency = params.get("currency") ?? "USD";

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-lg max-w-sm w-full p-6">
                {/* ← Back  •  ↻ Refresh */}
                {/* <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
                >
                    <FiX size={24} />
                </button>
                <button
                    onClick={() => router.refresh()}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <FiRefreshCw size={24} />
                </button> */}

                <div className="flex flex-col items-center space-y-4">
                    {/* error icon */}
                    <div className="bg-red-100 rounded-full p-4">
                        <FiAlertCircle className="w-8 h-8 text-red-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
                    <p className="text-center text-gray-600">
                        Oops! Something went wrong and your payment didn’t go through.
                    </p>

                    {/* <div className="w-full bg-gray-50 rounded-xl p-4 flex justify-between items-center mt-4">
                        <div>
                            <p className="text-sm text-gray-500">Attempted to send to</p>
                            <p className="font-medium text-gray-800">{recipient}</p>
                        </div>
                        <p className="text-lg font-semibold text-red-600">
                            {Number(amount).toLocaleString()} {currency}
                        </p>
                    </div> */}

                    <div className="w-full border-t border-gray-200 my-6" />

                    <button
                        // onClick={() => router.back()}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}
