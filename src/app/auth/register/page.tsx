import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { RegisterForm } from "@/components/auth-forms";

export const metadata = {
  title: "Sign Up - SaaS Starter",
  description: "Create a new account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}