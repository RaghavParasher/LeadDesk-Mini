"use server";

import { prisma } from "@/lib/db";
import { LoginSchema, LoginInput } from "@/lib/validation";
import { createSession, destroySession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function login(input: LoginInput) {
  // 1. Validate on Server-Side
  const validation = LoginSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validation.data;

  try {
    // 2. Find User in DB
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // 3. Verify Password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    // 4. Create Session (sets httpOnly cookie)
    await createSession(user.id);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      message: "An internal server error occurred. Please try again.",
    };
  }
}

export async function logout() {
  try {
    await destroySession();
    return { success: true };
  } catch (error) {
    console.error("Logout action error:", error);
    return { success: false, error: "Failed to log out" };
  }
}
