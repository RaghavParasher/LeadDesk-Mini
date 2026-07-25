"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateLeadStatus, getLeads } from "@/app/actions/leads";
import { logout } from "@/app/actions/auth";
import { budgetRanges } from "@/lib/validation";
import {
  Search,
  User,
  Mail,
  DollarSign,
  MessageSquare,
  Calendar,
  LogOut,
  Filter,
  Loader2,
  CheckCircle,
  Inbox,
  AlertCircle
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  budget: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AdminDashboardProps {
  initialLeads: Lead[];
  adminEmail: string;
}

export default function AdminDashboard({ initialLeads, adminEmail }: AdminDashboardProps) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Debounce search input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  // Fetch filtered/searched leads from server
  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setErrorMsg("");
      try {
        const filter = statusFilter === "All" ? "" : statusFilter;
        const result = await getLeads(debouncedSearch, filter);
        if (result.success && result.leads) {
          // Cast Date objects safely
          setLeads(result.leads as unknown as Lead[]);
        } else {
          setErrorMsg(result.error || "Failed to search leads.");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to query database.");
      } finally {
        setLoading(false);
      }
    };

    // Avoid double fetching initial leads on first load unless filters changed
    if (debouncedSearch !== "" || statusFilter !== "All") {
      fetchLeads();
    } else {
      setLeads(initialLeads);
    }
  }, [debouncedSearch, statusFilter, initialLeads]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId);
    setErrorMsg("");

    // Optimistic UI update
    const previousLeads = [...leads];
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead))
    );

    try {
      const result = await updateLeadStatus(leadId, newStatus);
      if (!result.success) {
        // Rollback optimistic update
        setLeads(previousLeads);
        setErrorMsg(result.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      setLeads(previousLeads);
      setErrorMsg("Failed to connect to the server.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to log out.");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-950/40 text-blue-400 border-blue-900/50";
      case "Contacted":
        return "bg-amber-950/40 text-amber-400 border-amber-900/50";
      case "Closed":
        return "bg-neutral-800/40 text-neutral-400 border-neutral-700/50";
      default:
        return "bg-neutral-800 text-neutral-400";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-neutral-900 bg-neutral-900/20 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-lg tracking-wider text-indigo-400">LEADDESK</span>
            <span className="bg-neutral-800 text-neutral-400 text-xs px-2 py-0.5 rounded font-mono">Console v1.0</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-neutral-400 font-medium">
              Admin: <span className="text-neutral-200">{adminEmail}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white px-3.5 py-1.5 rounded-lg text-sm transition active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        
        {/* Alerts & Errors */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 bg-red-950/40 border border-red-900/50 text-red-400 p-3.5 rounded-lg text-sm max-w-2xl">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-neutral-900/20 border border-neutral-900 p-4 rounded-xl">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by name, email, message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-neutral-950/80 border border-neutral-800 focus:border-indigo-600 focus:ring-indigo-950 rounded-lg pl-10 pr-4 py-2.5 text-sm transition focus:outline-none focus:ring-2"
            />
            {loading && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" />
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <div className="flex items-center gap-1.5 text-neutral-400 text-sm mr-2 shrink-0">
              <Filter className="w-4 h-4" />
              <span>Status:</span>
            </div>
            {["All", "New", "Contacted", "Closed"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition shrink-0 ${
                  statusFilter === status
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Leads Content Section */}
        {leads.length === 0 ? (
          <div className="border border-neutral-900 bg-neutral-900/10 rounded-2xl p-16 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-900 text-neutral-500 rounded-full">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-neutral-300">No leads found</h3>
              <p className="text-sm text-neutral-500 max-w-sm mx-auto">
                {search || statusFilter !== "All"
                  ? "Try resetting your search query or status filter constraints."
                  : "Leads submitted via the public landing page will display here."}
              </p>
            </div>
            {(search || statusFilter !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                }}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition rounded-lg text-xs font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block border border-neutral-900 bg-neutral-900/10 rounded-xl overflow-hidden shadow-lg">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-900 bg-neutral-900/30 text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4">Lead Info</th>
                    <th className="px-6 py-4">Budget Range</th>
                    <th className="px-6 py-4">Message / Requirements</th>
                    <th className="px-6 py-4">Status Action</th>
                    <th className="px-6 py-4 text-right">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-neutral-900/20 transition">
                      <td className="px-6 py-4 space-y-1">
                        <div className="font-semibold text-neutral-200">{lead.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                          <Mail className="w-3 h-3" />
                          <span>{lead.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-md">
                          <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{lead.budget}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs lg:max-w-md">
                        <p className="text-neutral-300 text-xs line-clamp-3 leading-relaxed">
                          {lead.message}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block w-40">
                          <select
                            value={lead.status}
                            disabled={updatingId === lead.id}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                            className={`w-full appearance-none bg-neutral-950 border ${getStatusStyle(
                              lead.status
                            )} rounded-md px-3 py-1.5 text-xs font-semibold focus:outline-none transition cursor-pointer pr-8 disabled:opacity-50`}
                          >
                            <option value="New">🔵 New</option>
                            <option value="Contacted">🟡 Contacted</option>
                            <option value="Closed">⚫ Closed</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-neutral-500 text-xs">
                            {updatingId === lead.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <span>▼</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-xs text-neutral-500 space-y-1">
                        <div className="flex items-center justify-end gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(lead.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                        <div className="text-[10px]">
                          {new Date(lead.createdAt).toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card-based View (collapses into cards below md) */}
            <div className="md:hidden space-y-4">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-neutral-900/20 border border-neutral-900 p-5 rounded-2xl space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-neutral-200 text-base">{lead.name}</h4>
                      <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                        <Mail className="w-3 h-3" />
                        <span>{lead.email}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {new Date(lead.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>

                  {/* Budget & Message */}
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1 text-xs text-neutral-300 bg-neutral-950 border border-neutral-800 px-2.5 py-1 rounded-md">
                      <DollarSign className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{lead.budget}</span>
                    </div>
                    <div className="bg-neutral-950/40 border border-neutral-900/50 rounded-lg p-3 text-xs text-neutral-300 leading-relaxed">
                      <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>Inquiry message</span>
                      </div>
                      <p className="whitespace-pre-wrap">{lead.message}</p>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center justify-between gap-4 pt-2 border-t border-neutral-900/60">
                    <span className="text-xs text-neutral-400 font-semibold">Change Status:</span>
                    <div className="relative w-40">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`w-full appearance-none bg-neutral-950 border ${getStatusStyle(
                          lead.status
                        )} rounded-md px-3 py-1.5 text-xs font-semibold focus:outline-none transition cursor-pointer pr-8`}
                      >
                        <option value="New">🔵 New</option>
                        <option value="Contacted">🟡 Contacted</option>
                        <option value="Closed">⚫ Closed</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-neutral-500">
                        {updatingId === lead.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>▼</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-6 text-center text-xs text-neutral-600">
        <p>© 2026 LeadDesk Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}
