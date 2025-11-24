"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Users } from "lucide-react";
import { auth } from "@/lib/firebase-client";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { registerAdminInDatabase } from "@/app/actions/admin-register";
import Link from "next/link";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "admin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.role) {
      setError("Role is required");
      return false;
    }
    return true;
  };

  const getDefaultPermissions = (role: string): Record<string, boolean> => {
    const basePermissions = {
      view_dashboard: true,
      view_users: true,
      view_jobs: true,
      view_applications: true,
    };

    if (role === "super_admin") {
      return {
        ...basePermissions,
        manage_users: true,
        manage_jobs: true,
        manage_applications: true,
        manage_settings: true,
        manage_admins: true,
        view_analytics: true,
        manage_finance: true,
      };
    }

    return basePermissions;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (!auth) {
        throw new Error("Firebase authentication is not configured. Please check your environment variables.");
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.fullName,
      });

      const result = await registerAdminInDatabase({
        uid: user.uid,
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        permissions: getDefaultPermissions(formData.role),
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to register admin in database");
      }

      setSuccess(true);
      
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      let errorMessage = "Failed to register admin user";
      
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Green Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-500 to-green-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Blurred silhouettes effect */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wider opacity-90 mb-2">ADMIN PORTAL</p>
            <h1 className="text-5xl font-bold mb-4">Create Account</h1>
            <p className="text-xl opacity-90">Join the admin team and manage the platform</p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold mb-1">Full platform access</p>
                <p className="text-sm opacity-80">Manage users, jobs, analytics, and settings</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold mb-1">AI-powered tools</p>
                <p className="text-sm opacity-80">Leverage AI for better decision making</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold mb-1">Secure & reliable</p>
                <p className="text-sm opacity-80">Enterprise-grade security and monitoring</p>
      </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm opacity-80">Join leading administrators using Ajira AI to manage the platform</p>
          </div>
        </div>
      </div>

      {/* Right Section - Dark Background */}
      <div className="w-full lg:w-1/2 bg-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="text-sm font-medium text-green-500 uppercase tracking-wider">ADMIN PORTAL</p>
          </div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Sign up to start managing the platform</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
        )}

        {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm text-green-400">Account created successfully! Redirecting to login...</p>
            </div>
        )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
              Full Name
            </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={handleChange}
              required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
              </div>
          </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
            </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
              id="email"
              name="email"
              type="email"
                  placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
              </div>
          </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-white mb-2">
              Role
            </label>
              <select
                id="role"
                name="role"
              value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
          </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
              Password
            </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
              </div>
          </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
              Confirm Password
            </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {loading ? "Creating Account..." : success ? "Account Created!" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link href="/admin/login" className="text-green-500 hover:text-green-400 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          {/* Job Seekers Section */}
          <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Looking for a job?</p>
                  <p className="text-sm text-gray-400">Sign in as a job seeker</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
