import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { SessionData } from "@/types/session";
import { NextResponse } from "next/server";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "slotter-session",
  cookieOptions: {
    httpOnly: true,
    secure: (process.env.NEXT_PUBLIC_APP_URL ?? "").startsWith("https://"),
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireOrganizer() {
  const session = await getSession();
  if (!session.organizerId) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}
