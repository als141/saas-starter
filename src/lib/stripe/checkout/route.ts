import { adminAuth, adminDb } from '@/lib/firebase/firebase-admin';
import { stripe } from '@/lib/stripe/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getDoc, doc, setDoc } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { priceId, returnUrl } = await req.json();
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { uid } = decodedToken;

    // Get the user from Firestore
    const userDoc = await getDoc(doc(adminDb, 'users', uid));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    let customerId = userData.stripeCustomerId;

    // If the user doesn't have a Stripe customer ID, create one
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          firebaseUID: uid
        }
      });
      
      customerId = customer.id;
      
      // Update the user record with the new Stripe customer ID
      await setDoc(
        doc(adminDb, 'users', uid),
        { stripeCustomerId: customerId },
        { merge: true }
      );
    }

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: returnUrl || `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
      metadata: {
        firebaseUID: uid,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}