"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriptionContext";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createPortalSession } from "@/lib/subscription/subscription-utils";
import { LayoutDashboard, Settings, Users, CreditCard, LogOut, Menu } from "lucide-react";
import { toast } from "sonner";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    href: "/dashboard/billing",
    label: "Billing",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    href: "/dashboard/team",
    label: "Team",
    icon: <Users className="h-5 w-5" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const { subscription } = useSubscription();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/dashboard");
    }
  }, [user, loading, router]);

  // Handle logout
  const handleLogout = async () => {
    await logout();
    router.push("/");
    toast.success("Logged out successfully");
  };

  // Handle subscription management
  const handleManageSubscription = async () => {
    try {
      if (!subscription.customerId) {
        router.push("/pricing");
        return;
      }
      
      const portalUrl = await createPortalSession();
      window.location.href = portalUrl;
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open subscription management portal");
    }
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="mb-6">
              <Link href="/" className="flex items-center gap-2 font-semibold">
                SaaS Starter
              </Link>
            </div>
            <div className="grid gap-2">
              {navItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
                    {
                      "bg-muted text-foreground": item.href === router.pathname,
                    }
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2 md:ml-auto md:gap-5">
          <div className="text-sm font-medium">
            {subscription.plan !== "free" && subscription.plan
              ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan`
              : "Free Plan"}
          </div>
          <ThemeSwitch />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.photoURL || undefined}
                    alt={user.displayName || "User"}
                  />
                  <AvatarFallback>
                    {user.displayName
                      ? user.displayName[0]
                      : user.email?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.displayName || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleManageSubscription}>
                Manage Subscription
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Account Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="flex flex-1">
        {/* Sidebar (desktop only) */}
        <div className="hidden w-64 border-r bg-background md:block">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              SaaS Starter
            </Link>
          </div>
          <div className="space-y-1 p-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
                  {
                    "bg-muted text-foreground": router.pathname === item.href,
                  }
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}