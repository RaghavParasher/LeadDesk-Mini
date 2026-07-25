"use client";

import React, { useState } from "react";
import { submitLead } from "@/app/actions/leads";
import { LeadSchema, budgetRanges } from "@/lib/validation";
import { CheckCircle2, Loader2, Send, ShieldAlert, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    budget: "",
    message: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear validation error when user types
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

    // 1. Client-Side Validation using Zod
    const validation = LeadSchema.safeParse(formData);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        errors[path] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    // 2. Submit to Server
    setIsSubmitting(true);
    try {
      const result = await submitLead(validation.data);
      if (result.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", budget: "", message: "" });
      } else {
        if (result.errors) {
          // Flatten field errors from server
          const sErrors: Record<string, string> = {};
          Object.entries(result.errors).forEach(([key, val]) => {
            if (Array.isArray(val) && val.length > 0) {
              sErrors[key] = val[0];
            }
          });
          setFieldErrors(sErrors);
        } else {
          setErrorMsg(result.message || "Something went wrong. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the server. Please check your internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-6xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left Column: Product pitch */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-950/50 border border-indigo-800/40 px-3 py-1 rounded-full text-indigo-400 text-sm font-medium">
              <span>Next-Gen Pipeline Systems</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-neutral-50 via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Capture Qualified Leads Effortlessly.
            </h1>
            <p className="text-neutral-400 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
              Integrate our optimized capture interface into your operations. Automate validation, secure user access, and accelerate response cycles from one unified dashboard.
            </p>
            <div className="hidden lg:flex items-center gap-6 pt-4 text-neutral-400 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Secure Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Optimized UX</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span>Real-Time Sync</span>
              </div>
            </div>
          </div>

          {/* Right Column: Lead Form Card */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <div className="w-full max-w-xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative">
              
              {success ? (
                <div className="text-center py-12 space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-950/60 border border-indigo-800/50 text-indigo-400 rounded-full animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Proposal Request Received</h2>
                    <p className="text-neutral-400 text-sm max-w-sm mx-auto">
                      Thank you for submitting your details. Our systems have logged your inquiry and our representative will review it shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition rounded-lg text-sm font-semibold"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">Request a Proposal</h2>
                    <p className="text-neutral-400 text-sm">Fill in the fields below to connect with our implementation team.</p>
                  </div>

                  {errorMsg && (
                    <div className="flex items-start gap-2.5 bg-red-950/40 border border-red-900/50 text-red-400 p-3 rounded-lg text-sm">
                      <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full bg-neutral-950/80 border ${
                        fieldErrors.name ? "border-red-900 focus:border-red-500 focus:ring-red-950" : "border-neutral-800 focus:border-indigo-600 focus:ring-indigo-950"
                      } rounded-lg px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2`}
                      placeholder="e.g. John Doe"
                    />
                    {fieldErrors.name && <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>}
                  </div>

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
                      placeholder="e.g. john@company.com"
                    />
                    {fieldErrors.email && <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>}
                  </div>

                  {/* Budget Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="budget" className="block text-sm font-medium text-neutral-300">
                      Estimated Project Budget
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full bg-neutral-950/80 border ${
                        fieldErrors.budget ? "border-red-900 focus:border-red-500 focus:ring-red-950" : "border-neutral-800 focus:border-indigo-600 focus:ring-indigo-950"
                      } rounded-lg px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 text-neutral-300`}
                    >
                      <option value="" disabled>Select a range...</option>
                      {budgetRanges.map((range) => (
                        <option key={range} value={range}>
                          {range}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.budget && <p className="text-red-400 text-xs mt-1">{fieldErrors.budget}</p>}
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="block text-sm font-medium text-neutral-300">
                      Project Details / Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className={`w-full bg-neutral-950/80 border ${
                        fieldErrors.message ? "border-red-900 focus:border-red-500 focus:ring-red-950" : "border-neutral-800 focus:border-indigo-600 focus:ring-indigo-950"
                      } rounded-lg px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 resize-none`}
                      placeholder="Tell us about your project requirements..."
                    />
                    {fieldErrors.message && <p className="text-red-400 text-xs mt-1">{fieldErrors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] disabled:bg-indigo-800/50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-lg shadow-indigo-950/50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Proposal Request</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-600 z-10">
        <p>© 2026 LeadDesk Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}
