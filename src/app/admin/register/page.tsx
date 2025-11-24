"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, TextInput, Button, Title, Text, Callout, Select, SelectItem } from "@tremor/react";
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { auth } from "@/lib/firebase-client";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { registerAdminInDatabase } from "@/app/actions/admin-register";
import { isAdminRegistrationEnabled } from "@/app/actions/check-admin-registration";
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
  const [registrationEnabled, setRegistrationEnabled] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if admin registration is enabled
    const checkRegistrationStatus = async () => {
      const enabled = await isAdminRegistrationEnabled();
      setRegistrationEnabled(enabled);
      if (!enabled) {
        setError("Admin registration is currently disabled. Please contact an administrator.");
      }
    };
    checkRegistrationStatus();
  }, []);

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Check if Firebase auth is initialized
      if (!auth) {
        throw new Error("Firebase authentication is not configured. Please check your environment variables.");
      }

      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // 2. Update Firebase user profile with display name
      await updateProfile(user, {
        displayName: formData.fullName,
      });

      // 3. Register admin in Supabase database
      const result = await registerAdminInDatabase({
        uid: user.uid,
        email: formData.email,
        fullName: formData.fullName,
        role: formData.role,
        permissions: getDefaultPermissions(formData.role),
      });

      if (!result.success) {
        // If database registration fails, we should delete the Firebase user
        // But for now, just show the error
        throw new Error(result.error || "Failed to register admin in database");
      }

      setSuccess(true);
      
      // Redirect to login after 2 seconds
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

  const getDefaultPermissions = (role: string): Record<string, boolean> => {
    const basePermissions: Record<string, boolean> = {
      view_dashboard: true,
      view_users: true,
      view_jobs: true,
      view_applications: true,
    };

    if (role === "super_admin") {
      return {
        ...basePermissions,
        manage_admins: true,
        manage_settings: true,
        manage_users: true,
        manage_jobs: true,
        manage_applications: true,
        view_analytics: true,
        manage_finance: true,
        send_notifications: true,
      };
    }

    if (role === "admin") {
      return {
        ...basePermissions,
        manage_users: true,
        manage_jobs: true,
        manage_applications: true,
        view_analytics: true,
      };
    }

    return basePermissions;
  };

  // Show loading state while checking registration status
  if (registrationEnabled === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
        <Card className="max-w-md w-full mx-auto">
          <div className="flex flex-col items-center">
            <Text>Loading...</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Show disabled message if registration is not enabled
  if (registrationEnabled === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
        <Card className="max-w-md w-full mx-auto">
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <XCircle className="w-6 h-6" />
            </div>
            <Title className="text-center">Registration Disabled</Title>
            <Text className="text-center">Admin registration is currently disabled</Text>
          </div>

          <Callout
            className="mb-6"
            title="Registration Unavailable"
            icon={XCircle}
            color="rose"
          >
            Admin registration has been disabled by an administrator. Please contact an existing admin to create an account for you.
          </Callout>

          <div className="text-center">
            <Link href="/admin/login">
              <Button variant="light" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
      <Card className="max-w-md w-full mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center mb-4 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <Title className="text-center">Admin Registration</Title>
          <Text className="text-center">Create a new admin account</Text>
        </div>

        {error && (
          <Callout
            className="mb-6"
            title="Registration Failed"
            icon={AlertCircle}
            color="rose"
          >
            {error}
          </Callout>
        )}

        {success && (
          <Callout
            className="mb-6"
            title="Registration Successful"
            icon={CheckCircle}
            color="emerald"
          >
            Admin account created successfully! Redirecting to login...
          </Callout>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="fullName">
              Full Name
            </label>
            <TextInput
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              icon={User}
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">
              Email Address
            </label>
            <TextInput
              id="email"
              name="email"
              type="email"
              placeholder="admin@ajira.ai"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading || success}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="role">
              Role
            </label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
              disabled={loading || success}
            >
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">
              Password
            </label>
            <TextInput
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading || success}
            />
            <Text className="text-xs text-slate-500 dark:text-slate-400">
              Must be at least 6 characters long
            </Text>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <TextInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading || success}
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full mt-2"
            size="lg"
            disabled={success}
          >
            {loading ? "Creating Account..." : "Register Admin"}
          </Button>

          <div className="text-center mt-4">
            <Text className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link
                href="/admin/login"
                className="text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300 font-medium"
              >
                Sign in
              </Link>
            </Text>
          </div>
        </form>
      </Card>
    </div>
  );
}

