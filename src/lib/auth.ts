import { cookies } from "next/headers";
import { prisma } from "./db";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "leaddesk_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createSession(userId: string): Promise<string> {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      sessionToken,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionToken;
}

export async function verifySession(sessionToken: string) {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!session) return null;

  // Check if session has expired
  if (Date.now() > session.expiresAt.getTime()) {
    await prisma.session.delete({
      where: { sessionToken },
    });
    return null;
  }

  // Session rotation: extend expiration time on verification if it's half expired
  const timeRemaining = session.expiresAt.getTime() - Date.now();
  if (timeRemaining < SESSION_DURATION_MS / 2) {
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await prisma.session.update({
      where: { sessionToken },
      data: { expiresAt: newExpiresAt },
    });
    
    // Update the cookie as well
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: newExpiresAt,
      path: "/",
    });
  }

  return session.user;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  return verifySession(sessionToken);
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionToken) {
    await prisma.session.deleteMany({
      where: { sessionToken },
    });
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });
}
