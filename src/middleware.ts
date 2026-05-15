import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfigBase } from "@/auth.config";

const { auth } = NextAuth({
  ...authConfigBase,
  providers: [],
});

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const loggedIn = !!req.auth;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/clients") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/settings");

  if (!loggedIn && isProtected) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (loggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/invoices/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
