import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ForgotPasswordForm } from "@/components/auth-forms";

export const metadata = {
  title: "Forgot Password - SaaS Starter",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <ForgotPasswordForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}