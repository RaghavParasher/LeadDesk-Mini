"use server";

import { prisma } from "@/lib/db";
import { LeadSchema, LeadInput } from "@/lib/validation";
import { getSessionUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function submitLead(input: LeadInput) {
  // 1. Validate on Server-Side
  const validation = LeadSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { name, email, budget, message } = validation.data;

  try {
    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        budget,
        message,
        status: "New",
      },
    });

    return {
      success: true,
      leadId: lead.id,
    };
  } catch (error) {
    console.error("Failed to submit lead:", error);
    return {
      success: false,
      message: "An internal server error occurred. Please try again later.",
    };
  }
}

export async function updateLeadStatus(leadId: string, status: string) {
  // 1. Authenticate user
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // 2. Validate status value
  if (!["New", "Contacted", "Closed"].includes(status)) {
    throw new Error("Invalid status");
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { status },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Failed to update status:", error);
    return { success: false, error: "Failed to update lead status" };
  }
}

export async function getLeads(searchQuery = "", statusFilter = "") {
  // 1. Authenticate user
  const admin = await getSessionUser();
  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  try {
    const where: any = {};

    if (statusFilter && ["New", "Contacted", "Closed"].includes(statusFilter)) {
      where.status = statusFilter;
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } },
        { message: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, leads };
  } catch (error) {
    console.error("Failed to retrieve leads:", error);
    return { success: false, error: "Failed to retrieve leads" };
  }
}
