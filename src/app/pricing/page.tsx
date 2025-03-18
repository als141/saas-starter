import { Pricing } from "@/components/pricing";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Pricing - SaaS Starter",
  description: "Choose the perfect plan for your needs",
};

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-[800px] space-y-12">
            <div className="space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Simple, Transparent Pricing
              </h1>
              <p className="text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                Choose the plan that fits your needs. All plans include a 14-day free trial.
              </p>
            </div>
            <Pricing />
            <div className="mx-auto max-w-md text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                All plans include core features like user management, analytics, and 24/7
                support. Need a custom plan?{" "}
                <a
                  href="/contact"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  Contact us
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}