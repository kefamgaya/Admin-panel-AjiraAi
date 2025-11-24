"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, TextInput, Button, Title, Text, Callout } from "@tremor/react";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { isAdminRegistrationEnabled } from "@/app/actions/check-admin-registration";
import Link from "next/link";

// Force dynamic rendering to avoid build-time errors
// Note: For client components, we also need to handle client creation lazily
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationEnabled, setRegistrationEnabled] = useState<boolean>(false);
  const router = useRouter();
  
  // Lazy initialization of Supabase client to avoid build-time errors
  // Only create client in browser environment
  const getSupabaseClient = () => {
    if (typeof window === 'undefined') {
      return null; // Don't create client during SSR/build
    }
    try {
      return createClient();
    } catch (err) {
      // During build, env vars might not be available
      console.error('Failed to create Supabase client:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check if admin registration is enabled
    const checkRegistrationStatus = async () => {
      const enabled = await isAdminRegistrationEnabled();
      setRegistrationEnabled(enabled);
    };
    checkRegistrationStatus();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error("Supabase client not available. Please check your environment configuration.");
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <Card className="max-w-md w-full mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mb-4 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
            <Lock className="w-6 h-6" />
          </div>
          <Title className="text-center">Admin Login</Title>
          <Text className="text-center">Sign in to access the dashboard</Text>
        </div>

        {error && (
          <Callout
            className="mb-6"
            title="Authentication Failed"
            icon={AlertCircle}
            color="rose"
          >
            {error}
          </Callout>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
              Email Address
            </label>
            <TextInput
              id="email"
              type="email"
              placeholder="admin@ajira.ai"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
              Password
            </label>
            <TextInput
              id="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full mt-2"
            size="lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {registrationEnabled && (
          <div className="text-center mt-4">
            <Text className="text-sm text-slate-600 dark:text-slate-400">
              Need an admin account?{" "}
              <Link
                href="/admin/register"
                className="text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 font-medium"
              >
                Register here
              </Link>
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
}
