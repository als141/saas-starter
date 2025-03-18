'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from './AuthContext';

export type SubscriptionPlan = 'free' | 'basic' | 'pro';

interface SubscriptionData {
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'trialing' | 'past_due' | 'incomplete' | null;
  currentPeriodEnd: number | null;
  customerId: string | null;
}

interface SubscriptionContextType {
  subscription: SubscriptionData;
  isLoading: boolean;
  hasAccess: (minimumPlan: SubscriptionPlan) => boolean;
}

const defaultSubscription: SubscriptionData = {
  plan: 'free',
  status: null,
  currentPeriodEnd: null,
  customerId: null,
};

const planHierarchy: Record<SubscriptionPlan, number> = {
  'free': 0,
  'basic': 1,
  'pro': 2,
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>(defaultSubscription);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(defaultSubscription);
      setIsLoading(false);
      return;
    }

    // First, get the user document to check subscription status
    const getUserData = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data()?.subscription) {
          setSubscription({
            plan: userDoc.data().subscription,
            status: 'active', // Default to active if we find something
            currentPeriodEnd: null,
            customerId: userDoc.data().stripeCustomerId || null,
          });
        }
      } catch (error) {
        console.error("Error fetching user subscription data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Then set up real-time listener for subscription updates
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setSubscription({
          plan: userData.subscription || 'free',
          status: userData.subscriptionStatus || null,
          currentPeriodEnd: userData.subscriptionPeriodEnd || null,
          customerId: userData.stripeCustomerId || null,
        });
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Subscription snapshot error:", error);
      setIsLoading(false);
    });

    // Initial fetch
    getUserData();
    
    return () => unsubscribe();
  }, [user]);

  // Function to check if user has access to a specific plan level
  const hasAccess = (minimumPlan: SubscriptionPlan): boolean => {
    if (!user) return false;
    if (isLoading) return false;
    
    const userPlanLevel = planHierarchy[subscription.plan];
    const requiredPlanLevel = planHierarchy[minimumPlan];
    
    return userPlanLevel >= requiredPlanLevel && subscription.status === 'active';
  };

  return (
    <SubscriptionContext.Provider value={{ 
      subscription,
      isLoading,
      hasAccess
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};