import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Your SaaS Solution for Modern Businesses
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Streamline your workflow, boost productivity, and scale your business with our comprehensive tools and services.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth/register">
                  <Button className="px-8">Get Started</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline" className="px-8">
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform offers everything you need to grow your business and manage your operations efficiently.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {[
                {
                  title: "Powerful Analytics",
                  description: "Gain valuable insights with real-time data analysis and visualization tools.",
                },
                {
                  title: "Team Collaboration",
                  description: "Collaborate seamlessly with your team from anywhere in the world.",
                },
                {
                  title: "Advanced Security",
                  description: "Rest easy knowing your data is protected with enterprise-grade security.",
                },
              ].map((feature, index) => (
                <div key={index} className="grid gap-1">
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  What Our Customers Say
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Don't just take our word for it. See what our customers have to say about our platform.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              {[
                {
                  quote: "This platform has revolutionized the way we work. We've seen a 30% increase in productivity since adopting it.",
                  author: "Jane Doe",
                  company: "Tech Innovations Inc.",
                },
                {
                  quote: "The customer support is exceptional. Any issues we had were resolved quickly and efficiently.",
                  author: "John Smith",
                  company: "Global Solutions Ltd.",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-6 shadow-sm"
                >
                  <p className="mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Get Started?
                </h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                  Join thousands of businesses that trust our platform to power their operations.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/auth/register">
                  <Button variant="secondary" className="px-8">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    className="border-primary-foreground px-8 text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}