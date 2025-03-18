"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { RestrictedContent } from "@/components/restricted-content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [greeting, setGreeting] = useState("Hello");

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {greeting}, {user?.displayName || user?.email?.split("@")[0] || "User"}!
          </p>
        </div>
        <div>
          <Link href="/dashboard/billing">
            <Button variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24,432</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">
                  +7% from last hour
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Subscription</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {subscription.plan}
                </div>
                <p className="text-xs text-muted-foreground">
                  {subscription.status === "active"
                    ? "Active"
                    : "Inactive"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Free Content */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Welcome to your dashboard! Here you'll find everything you need to manage your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                This content is available to all users, regardless of their subscription plan.
                Check out our documentation to learn more about how to use our platform.
              </p>
            </CardContent>
          </Card>

          {/* Basic Plan Content */}
          <RestrictedContent minimumPlan="basic">
            <Card>
              <CardHeader>
                <CardTitle>Basic Features</CardTitle>
                <CardDescription>
                  Features available with the Basic subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  As a Basic subscriber, you have access to enhanced features like advanced
                  analytics, priority support, and more. Make the most of your subscription
                  by exploring all these features.
                </p>
              </CardContent>
            </Card>
          </RestrictedContent>

          {/* Pro Plan Content */}
          <RestrictedContent minimumPlan="pro">
            <Card>
              <CardHeader>
                <CardTitle>Pro Features</CardTitle>
                <CardDescription>
                  Premium features available only to Pro subscribers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  As our premium subscriber, you have unlimited access to all features,
                  including advanced reporting, team collaboration tools, and dedicated
                  support. Take advantage of these powerful capabilities to grow your business.
                </p>
              </CardContent>
            </Card>
          </RestrictedContent>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                View detailed analytics of your account and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Analytics data will be displayed here. This is a placeholder for the actual
                analytics dashboard that would include charts, graphs, and other data visualizations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}