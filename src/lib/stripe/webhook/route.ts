import { stripe } from '@/lib/stripe/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/firebase-admin';
import { doc, getDoc, setDoc } from 'firebase-admin/firestore';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing Stripe signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { firebaseUID } = session.metadata || {};
        
        if (firebaseUID) {
          // Retrieve subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const product = await stripe.products.retrieve(subscription.items.data[0].price.product as string);
          
          // Determine the plan based on the product metadata
          const planName = product.metadata.plan || 'basic';
          
          // Update user in Firestore
          await setDoc(
            doc(adminDb, 'users', firebaseUID),
            {
              stripeCustomerId: session.customer as string,
              subscription: planName,
              subscriptionId: subscription.id,
              subscriptionStatus: subscription.status,
              subscriptionPriceId: subscription.items.data[0].price.id,
              subscriptionPeriodEnd: subscription.current_period_end,
            },
            { merge: true }
          );
          
          // Also store subscription reference for easier lookup
          await setDoc(
            doc(adminDb, 'subscriptions', subscription.id),
            {
              userId: firebaseUID,
              customerId: session.customer as string,
              status: subscription.status,
              priceId: subscription.items.data[0].price.id,
              productId: product.id,
              plan: planName,
              currentPeriodEnd: subscription.current_period_end,
              createdAt: subscription.created,
            }
          );
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Find the user with this subscription
        const subscriptionDoc = await getDoc(doc(adminDb, 'subscriptions', subscription.id));
        if (!subscriptionDoc.exists()) {
          break;
        }
        
        const { userId } = subscriptionDoc.data();
        const status = subscription.status;
        
        // Update subscription status in Firestore
        await setDoc(
          doc(adminDb, 'users', userId),
          {
            subscriptionStatus: status,
            subscriptionPeriodEnd: subscription.current_period_end,
          },
          { merge: true }
        );
        
        // Update subscription document
        await setDoc(
          doc(adminDb, 'subscriptions', subscription.id),
          {
            status,
            currentPeriodEnd: subscription.current_period_end,
          },
          { merge: true }
        );
        
        // If canceled or unpaid, downgrade to free plan
        if (status === 'canceled' || status === 'unpaid') {
          await setDoc(
            doc(adminDb, 'users', userId),
            { subscription: 'free' },
            { merge: true }
          );
          
          await setDoc(
            doc(adminDb, 'subscriptions', subscription.id),
            { plan: 'free' },
            { merge: true }
          );
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return NextResponse.json(
      { error: 'Error handling webhook event' },
      { status: 500 }
    );
  }
}

// Stripe webhooks need raw body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};