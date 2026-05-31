import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Routes that don't require authentication
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/sensor_readings", // ESP32 IoT endpoint — intentionally open
];

// Check if a path starts with any of the public paths
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

// Check if the path is a static/internal Next.js resource
function isInternalPath(pathname: string): boolean {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js")
  );
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow internal resources and public paths through
  if (isInternalPath(pathname) || isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // For the root path, let the page.tsx redirect handle it
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Get the token from cookie (set at login)
  const token = req.cookies.get("token")?.value;

  if (!token) {
    // No cookie → redirect browser requests to /login, or 401 for API routes
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized — no token provided" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the JWT using jose (Edge-compatible, unlike jsonwebtoken)
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    // Token is invalid or expired — clear the cookie and redirect
    if (pathname.startsWith("/api/")) {
      const res = NextResponse.json(
        { error: "Unauthorized — invalid or expired token" },
        { status: 401 }
      );
      res.cookies.delete("token");
      return res;
    }
    const loginUrl = new URL("/login", req.url);
    const res = NextResponse.redirect(loginUrl);
    res.cookies.delete("token");
    return res;
  }
}

export const config = {
  matcher: [
    // Match all routes except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
