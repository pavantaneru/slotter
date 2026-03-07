import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // Check for session cookie existence — full validation happens in server components/API routes
  const sessionCookie = req.cookies.get("slotter-session");

  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
