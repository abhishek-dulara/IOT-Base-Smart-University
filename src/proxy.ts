import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow auth routes and sensor readings without token
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/sensor_readings")) {
    return NextResponse.next();
  }

  // Check for bearer token on all other API routes
  if (pathname.startsWith("/api/")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
