import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isAdminRoute =
    req.nextUrl.pathname.startsWith("/admin") || req.nextUrl.pathname.startsWith("/docs");
  if (isAdminRoute && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const isUserDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (isUserDashboard && !req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/docs/:path*", "/dashboard/:path*"],
};
