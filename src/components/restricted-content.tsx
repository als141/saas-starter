"use client";

import { useSubscription, SubscriptionPlan } from "@/context/SubscriptionContext";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LockIcon } from "lucide-react";

interface RestrictedContentProps {
  children: React.ReactNode;
  minimumPlan: SubscriptionPlan;
  fallback?: React.ReactNode;
}

export function RestrictedContent({
  children,
  minimumPlan,
  fallback,
}: RestrictedContentProps) {
  const { hasAccess, subscription } = useSubscription();
  const hasRequiredAccess = hasAccess(minimumPlan);

  if (hasRequiredAccess) {
    return <>{children}</>;
  }

  return fallback || <AccessDenied requiredPlan={minimumPlan} />;
}

export function AccessDenied({ requiredPlan }: { requiredPlan: SubscriptionPlan }) {
  const router = useRouter();
  const { user } = useAuth();
  const planName = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-center mb-4">
          <div className="rounded-full bg-muted p-3">
            <LockIcon className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-center">
          {user ? "Upgrade Required" : "Sign In Required"}
        </CardTitle>
        <CardDescription className="text-center">
          {user
            ? `This content requires a ${planName} plan or higher.`
            : "Please sign in to access this content."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button
          onClick={() => router.push(user ? "/pricing" : "/auth/login")}
          className="w-full max-w-xs"
        >
          {user ? "View Pricing Plans" : "Sign In"}
        </Button>
      </CardContent>
    </Card>
  );
}