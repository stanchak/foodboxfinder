import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: "noindex, nofollow",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-card p-8">
          <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
            FoodBoxFinder Admin
          </h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            Enter the admin secret to continue
          </p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
