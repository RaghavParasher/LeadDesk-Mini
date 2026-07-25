import React from "react";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import AdminDashboard from "./AdminDashboard";
import { Lead } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // 1. Authenticate user at Server Component layer
  const admin = await getSessionUser();

  if (!admin || admin.role !== "ADMIN") {
    // Session token is missing, invalid or expired
    redirect("/login");
  }

  // 2. Fetch initial list of leads directly from PostgreSQL
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 3. Render the client dashboard
  return (
    <AdminDashboard
      initialLeads={leads.map((lead: Lead) => ({
        ...lead,
        createdAt: lead.createdAt, // safe casting for dates
        updatedAt: lead.updatedAt,
      }))}
      adminEmail={admin.email}
    />
  );
}
