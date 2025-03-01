import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const publicRoutes = ["/login", "/signup", "/"];
  const token = req.cookies.get("token")?.value;

  console.log("Middleware triggered for path:", req.nextUrl.pathname);

  if (publicRoutes.includes(req.nextUrl.pathname)) {
    console.log("Public route, allowing access");
    return NextResponse.next();
  }

  if (!token) {
    console.log("No token found, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("Token found, allowing access");
  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/signup", "/login", "/"],
};
