"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";
import { LoginSchema } from "@/lib/validation";
import { ShieldAlert, Loader2, LogIn, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setErrorMsg("");

    // 1. Validate inputs client-side
    const validation = LoginSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    // 2. Perform Login action
    setIsSubmitting(true);
    try {
      const result = await login(validation.data);
      if (result.success) {
        // Redirect to admin dashboard
        router.push("/admin");
        router.refresh();
      } else {
        setErrorMsg(result.message || "Failed to log in.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected connection error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 max-w-6xl mx-auto w-full z-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing</span>
        </Link>
        <span className="font-bold text-neutral-200 tracking-wide">LEADDESK</span>
      </header>

      {/* Main Form */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-bold">Admin Console</h1>
            <p className="text-neutral-400 text-sm">Log in to manage your incoming lead pipeline.</p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full bg-neutral-950/80 border ${
                  fieldErrors.email ? "border-red-900 focus:border-red-500 focus:ring-red-950" : "border-neutral-800 focus:border-indigo-600 focus:ring-indigo-950"
                } rounded-lg px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2`}
                placeholder="admin@leaddesk.com"
                required
              />
              {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`w-full bg-neutral-950/80 border ${
                  fieldErrors.password ? "border-red-900 focus:border-red-500 focus:ring-red-950" : "border-neutral-800 focus:border-indigo-600 focus:ring-indigo-950"
                } rounded-lg px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2`}
                placeholder="••••••••"
                required
              />
              {fieldErrors.password && <p className="text-red-400 text-xs mt-1">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-lg shadow-indigo-950/50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-600 z-10">
        <p>© 2026 LeadDesk Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}
