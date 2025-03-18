"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSubscription, SubscriptionPlan } from "@/context/SubscriptionContext";
import { pricing, createCheckoutSession } from "@/lib/subscription/subscription-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { toast } from "sonner";

export function PricingCard({
  plan,
  isCurrentPlan,
}: {
  plan: SubscriptionPlan;
  isCurrentPlan: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const planInfo = pricing[plan];
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/auth/login?redirect=/pricing");
      return;
    }

    if (isCurrentPlan) {
      return;
    }

    if (plan === "free") {
      toast.info("You are already on the free plan or can't downgrade yet. Please cancel your subscription first.");
      return;
    }

    try {
      setIsLoading(true);
      const checkoutUrl = await createCheckoutSession(planInfo.priceId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start subscription process. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`flex flex-col ${isCurrentPlan ? "border-primary" : ""}`}>
      <CardHeader>
        <CardTitle>{planInfo.name}</CardTitle>
        <CardDescription>{planInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid flex-1 gap-4">
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
          onClick={handleSubscribe}
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          disabled={isLoading || isCurrentPlan}
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
}

export function Pricing() {
  const { subscription } = useSubscription();
  const plans: SubscriptionPlan[] = ["free", "basic", "pro"];

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <PricingCard
          key={plan}
          plan={plan}
          isCurrentPlan={subscription.plan === plan}
        />
      ))}
    </div>
  );
}