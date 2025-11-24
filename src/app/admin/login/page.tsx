"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase-client";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Users } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!auth) {
        throw new Error("Firebase authentication is not configured. Please check your environment variables.");
      }

      if (!auth) {
        throw new Error("Firebase authentication is not configured. Please check your environment variables.");
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Wait for auth state to be updated
      const authInstance = auth; // Type narrowing
      await new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(authInstance, (user) => {
          if (user) {
            unsubscribe();
            resolve();
          }
        });
      });

      // Create a session token and store it
      const token = await userCredential.user.getIdToken();
      
      // Store token in a cookie for middleware to check
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!sessionResponse.ok) {
        throw new Error("Failed to create session");
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      let errorMessage = "Failed to sign in";
      
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (err.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled";
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
            <h1 className="text-5xl font-bold mb-4">Welcome Back</h1>
            <p className="text-xl opacity-90">Sign in to manage your platform</p>
          </div>

          <div className="space-y-6 mt-8">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold mb-1">AI-powered analytics</p>
                <p className="text-sm opacity-80">Real-time insights and data-driven decisions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-semibold mb-1">Complete control</p>
                <p className="text-sm opacity-80">Manage users, jobs, and platform settings</p>
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
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to manage your hiring pipeline</p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
        )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email
            </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
              id="email"
              type="email"
                  placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
              </div>
          </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-white">
              Password
            </label>
                <a href="#" className="text-sm text-green-500 hover:text-green-400">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
              </div>
          </div>

            <button
            type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
            </button>
        </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-750 text-white font-medium py-3 rounded-lg border border-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              New here?{" "}
              <Link href="/admin/register" className="text-green-500 hover:text-green-400 font-medium">
                Create account
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
