"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription, SubscriptionPlan } from "@/context/SubscriptionContext";
import { pricing, createPortalSession, createCheckoutSession } from "@/lib/subscription/subscription-utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function BillingPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const plans: SubscriptionPlan[] = ["free", "basic", "pro"];

  // Format date for display
  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return "N/A";
    return format(new Date(timestamp * 1000), "MMM d, yyyy");
  };

  // Handle subscription management
  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      
      if (!subscription.customerId) {
        toast.error("No active subscription to manage");
        return;
      }
      
      const portalUrl = await createPortalSession();
      window.location.href = portalUrl;
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open subscription management portal");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription creation or plan change
  const handleSubscription = async (plan: SubscriptionPlan) => {
    try {
      setIsLoading(true);
      
      if (plan === subscription.plan) {
        toast.info("You are already on this plan");
        return;
      }
      
      if (plan === "free") {
        toast.info("Please cancel your current subscription in the customer portal to downgrade to the free plan");
        return;
      }
      
      const priceId = pricing[plan].priceId;
      const checkoutUrl = await createCheckoutSession(priceId, "/dashboard/billing");
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start subscription process");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Subscription Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Overview</CardTitle>
          <CardDescription>
            Your current subscription plan and status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
              <p className="text-lg font-medium capitalize">{subscription.plan}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="text-lg font-medium capitalize">{subscription.status || "inactive"}</p>
            </div>
            {subscription.currentPeriodEnd && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Period Ends</h3>
                <p className="text-lg font-medium">{formatDate(subscription.currentPeriodEnd)}</p>
              </div>
            )}
            {subscription.customerId && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Customer ID</h3>
                <p className="text-lg font-medium">{subscription.customerId}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleManageSubscription} 
            disabled={isLoading || !subscription.customerId}
            className="w-full md:w-auto"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
        </CardFooter>
      </Card>

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Available Plans</h2>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const planInfo = pricing[plan];
            const isCurrentPlan = subscription.plan === plan;
            
            return (
              <Card key={plan} className={`${isCurrentPlan ? "border-primary" : ""}`}>
                <CardHeader>
                  <CardTitle>{planInfo.name}</CardTitle>
                  <CardDescription>{planInfo.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{planInfo.price}</span>
                    {plan !== "free" && <span className="text-muted-foreground">/month</span>}
                  </div>
                  <ul className="grid gap-2">
                    {planInfo.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleSubscription(plan)}
                    className="w-full"
                    variant={isCurrentPlan ? "outline" : "default"}
                    disabled={isLoading || isCurrentPlan || (plan === "free" && subscription.status === "active")}
                  >
                    {isLoading
                      ? "Loading..."
                      : isCurrentPlan
                      ? "Current Plan"
                      : plan === "free"
                      ? "Downgrade"
                      : "Subscribe"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}