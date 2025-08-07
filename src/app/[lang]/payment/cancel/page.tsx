'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-lg mx-auto text-center">
        {/* Cancel Icon */}
        <div className="mb-8">
          <XCircle className="w-24 h-24 text-orange-500 mx-auto" />
        </div>

        {/* Cancel Message */}
        <h1 className="text-3xl font-bold text-white mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-lg text-gray-300 mb-8">
          No worries! Your payment was cancelled and no charges were made to your account.
        </p>

        {/* What Happened */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-white mb-4">What happened?</h3>
          <div className="space-y-3 text-gray-300">
            <div className="flex items-start">
              <span className="text-orange-400 mr-2">•</span>
              <span>You cancelled the payment process</span>
            </div>
            <div className="flex items-start">
              <span className="text-green-400 mr-2">•</span>
              <span>No charges were made to your payment method</span>
            </div>
            <div className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Your subscription remains inactive</span>
            </div>
          </div>
        </div>

        {/* Still Want Premium? */}
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-2">Still interested in Premium?</h3>
          <p className="text-gray-300 text-sm mb-4">
            Get access to advanced predictions, trading signals, and our VIP community
          </p>
          <div className="flex items-center justify-center text-green-400 text-sm">
            <span>💎 Premium features • 📊 Market analysis • ⭐ Priority support</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg inline-flex items-center justify-center font-semibold"
          >
            <RefreshCw className="mr-2 w-4 h-4" />
            Try Payment Again
          </Link>
          
          <Link 
            href="/predictions"
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg inline-flex items-center justify-center font-semibold"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Continue Browsing
          </Link>
        </div>

        {/* Support */}
        <div className="mt-12 text-gray-500 text-sm">
          <p>Need help with payment? Contact us at support@zkagi.ai</p>
          <p className="mt-2">We're here to help you get started with ZkTerminal Premium!</p>
        </div>
      </div>
    </div>
  )
}