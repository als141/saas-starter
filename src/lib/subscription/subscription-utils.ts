import { fetchWithAuth } from '@/lib/auth/auth-utils';
import { SubscriptionPlan } from '@/context/SubscriptionContext';

// Create a checkout session for a subscription
export const createCheckoutSession = async (priceId: string, returnUrl?: string) => {
  try {
    const response = await fetchWithAuth('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId, returnUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create a customer portal session
export const createPortalSession = async (returnUrl?: string) => {
  try {
    const response = await fetchWithAuth('/api/stripe/portal', {
      method: 'POST',
      body: JSON.stringify({ returnUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create portal session');
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error('Error creating portal session:', error);
    throw error;
  }
};

// Define pricing info
export const pricing: Record<SubscriptionPlan, { 
  name: string; 
  description: string; 
  price: string; 
  priceId: string; 
  features: string[]; 
}> = {
  free: {
    name: 'Free',
    description: 'Basic features for personal use',
    price: '$0',
    priceId: '', // No price ID needed for free plan
    features: [
      'Limited access to features',
      'Basic support',
      '1 user only',
    ],
  },
  basic: {
    name: 'Basic',
    description: 'Everything you need to get started',
    price: '$9.99/mo',
    priceId: 'price_1234567890', // Replace with your actual Stripe price ID
    features: [
      'All Free features',
      'Priority support',
      'Advanced features',
      'Up to 3 users',
    ],
  },
  pro: {
    name: 'Pro',
    description: 'For teams and professionals',
    price: '$29.99/mo',
    priceId: 'price_0987654321', // Replace with your actual Stripe price ID
    features: [
      'All Basic features',
      'Premium support',
      'All advanced features',
      'Unlimited users',
      'Custom integrations',
    ],
  },
};