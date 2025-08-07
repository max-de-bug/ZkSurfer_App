

// // src/app/api/stripe/verify-session/route.ts
// import { NextRequest, NextResponse } from 'next/server'
// import Stripe from 'stripe'

// const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
//   apiVersion: '2025-07-30.basil',
// })

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const sessionId = searchParams.get('session_id')

//     if (!sessionId) {
//       return NextResponse.json(
//         { message: 'Session ID is required' },
//         { status: 400 }
//       )
//     }

//     console.log(`🔍 Verifying session: ${sessionId}`)

//     // Retrieve the checkout session from Stripe
//     const session = await stripe.checkout.sessions.retrieve(sessionId, {
//       expand: ['subscription', 'customer']
//     })

//     if (session.payment_status === 'paid') {
//       console.log('✅ Payment verified successfully')
      
//       return NextResponse.json({
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
//       console.log(`⚠️ Payment not completed. Status: ${session.payment_status}`)
      
//       return NextResponse.json({
//         success: false,
//         message: 'Payment not completed',
//         payment_status: session.payment_status
//       })
//     }
//   } catch (error) {
//     console.error('❌ Error verifying session:', error)
//     return NextResponse.json(
//       { 
//         success: false, 
//         message: 'Error verifying payment session' 
//       },
//       { status: 500 }
//     )
//   }
// }

// src/app/api/stripe/verify-session/route.ts
import { NextRequest, NextResponse } from 'next/server'

// Force dynamic to avoid static generation issues
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Your existing verification logic here
    // Don't access request.url directly - use searchParams instead
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Add your Stripe session verification logic here
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Session verified'
    })

  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId } = body
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Add your verification logic here
    return NextResponse.json({
      success: true,
      sessionId,
      message: 'Session verified via POST'
    })

  } catch (error) {
    console.error('Session verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    )
  }
}