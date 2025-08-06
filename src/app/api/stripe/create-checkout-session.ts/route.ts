// // pages/api/stripe/create-checkout-session.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// import Stripe from 'stripe'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// })

// const PRICE_IDS = {
//   monthly: 'prod_SobQGIlHOPC4Dc', 
//   yearly: 'prod_SobS7QsWoAZrOw',  
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' })
//   }

//   try {
//     const { planId, walletAddress, email } = req.body

//     if (!planId || !walletAddress || !email) {
//       return res.status(400).json({ message: 'Missing required fields' })
//     }

//     const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS]
//     if (!priceId) {
//       return res.status(400).json({ message: 'Invalid plan ID' })
//     }

//     // Create Stripe Checkout Session
//     const session = await stripe.checkout.sessions.create({
//       mode: 'subscription',
//       payment_method_types: ['card'],
//       line_items: [
//         {
//           price: priceId,
//           quantity: 1,
//         },
//       ],
//       customer_email: email,
//       metadata: {
//         walletAddress,
//         planId,
//       },
//       success_url: `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${req.headers.origin}/payment/cancel`,
//       allow_promotion_codes: true,
//     })

//     res.status(200).json({ sessionId: session.id, url: session.url })
//   } catch (error) {
//     console.error('Error creating checkout session:', error)
//     res.status(500).json({ message: 'Internal server error' })
//   }
// }

// src/app/api/stripe/create-checkout-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

// 🎯 UPDATE THESE WITH YOUR ACTUAL PRICE IDs FROM STRIPE
const PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || 'price_1ABCdefGHijklMNO',
  yearly: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || 'price_1XYZabcDEfghiJKL',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, walletAddress, email } = body

    if (!planId || !walletAddress || !email) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS]
    if (!priceId) {
      return NextResponse.json(
        { 
          message: 'Invalid plan ID',
          availablePlans: Object.keys(PRICE_IDS)
        },
        { status: 400 }
      )
    }

    console.log(`🚀 Creating checkout session for plan: ${planId} (${priceId})`)

    // Get the origin from the request headers
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      metadata: {
        walletAddress,
        planId,
        source: 'zkagi_subscription',
      },
      success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      
      subscription_data: {
        metadata: {
          walletAddress,
          planId,
        },
      },
    })

    console.log(`✅ Checkout session created: ${session.id}`)

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      priceId: priceId,
    })

  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { message: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}