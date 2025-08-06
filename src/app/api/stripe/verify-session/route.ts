// // pages/api/stripe/verify-session.ts
// import { NextApiRequest, NextApiResponse } from 'next'
// import Stripe from 'stripe'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: '2023-10-16',
// })

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ message: 'Method not allowed' })
//   }

//   const { session_id } = req.query

//   if (!session_id || typeof session_id !== 'string') {
//     return res.status(400).json({ message: 'Session ID is required' })
//   }

//   try {
//     // Retrieve the checkout session from Stripe
//     const session = await stripe.checkout.sessions.retrieve(session_id, {
//       expand: ['subscription', 'customer']
//     })

//     if (session.payment_status === 'paid') {
//       // Payment was successful
//       res.status(200).json({
//         success: true,
//         session: {
//           id: session.id,
//           customer_email: session.customer_email,
//           payment_status: session.payment_status,
//           subscription_id: session.subscription,
//           metadata: session.metadata,
//         }
//       })
//     } else {
//       // Payment was not successful
//       res.status(200).json({
//         success: false,
//         message: 'Payment not completed',
//         payment_status: session.payment_status
//       })
//     }
//   } catch (error) {
//     console.error('Error verifying session:', error)
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error verifying payment session' 
//     })
//   }
// }

// src/app/api/stripe/verify-session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Verifying session: ${sessionId}`)

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    if (session.payment_status === 'paid') {
      console.log('✅ Payment verified successfully')
      
      return NextResponse.json({
        success: true,
        session: {
          id: session.id,
          customer_email: session.customer_email,
          payment_status: session.payment_status,
          subscription_id: session.subscription,
          metadata: session.metadata,
        }
      })
    } else {
      console.log(`⚠️ Payment not completed. Status: ${session.payment_status}`)
      
      return NextResponse.json({
        success: false,
        message: 'Payment not completed',
        payment_status: session.payment_status
      })
    }
  } catch (error) {
    console.error('❌ Error verifying session:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error verifying payment session' 
      },
      { status: 500 }
    )
  }
}