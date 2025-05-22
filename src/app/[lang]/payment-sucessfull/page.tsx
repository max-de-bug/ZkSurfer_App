// app/payment-success/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FiX, FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import { RiWalletFill } from "react-icons/ri";

export default function PaymentSuccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-lg max-w-sm w-full p-6">
                {/* Close & Refresh */}
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
                    {/* Hand doodle – replace with your SVG or component */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-16 h-16 stroke-current text-gray-800"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 11l3-3 3 3m-3-3v8"
                        />
                    </svg>

                    <h1 className="text-2xl font-bold text-gray-900">ALL DONE!</h1>

                    {/* Divider */}
                    <div className="w-full border-t border-gray-200 my-6" />

                    {/* Payment success */}
                    <div className="flex flex-col items-center space-y-3">
                        <div className="bg-green-100 rounded-full p-4">
                            <RiWalletFill className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <FiCheckCircle className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-semibold text-gray-900">Successfully!</h2>
                        </div>
                        <p className="text-center text-gray-600">
                            Thanks a lot, you're credits will reflect shortly!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
