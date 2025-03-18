import { adminAuth, adminDb } from '@/lib/firebase/firebase-admin';
import { stripe } from '@/lib/stripe/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { getDoc, doc } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const { returnUrl } = await req.json();
    
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
    const customerId = userData.stripeCustomerId;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer has no subscription' },
        { status: 400 }
      );
    }

    // Create customer portal session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${baseUrl}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}