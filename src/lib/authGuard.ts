import { verifyToken, TokenPayload } from "./auth";
import { NextResponse } from "next/server";

export type AuthResult =
  | { ok: true; user: TokenPayload }
  | { ok: false; response: NextResponse };

/**
 * Extract and verify the JWT from the Authorization header.
 * Returns the decoded payload on success, or a 401 response on failure.
 */
export function requireAuth(req: Request): AuthResult {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized — no token provided" },
        { status: 401 }
      ),
    };
  }

  const token = authHeader.split(" ")[1];

  try {
    const user = verifyToken(token);
    return { ok: true, user };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unauthorized — invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}

/**
 * Require the caller to have a specific role (e.g. "SUPER_ADMIN").
 * Returns 401 if no token, or 403 if wrong role.
 */
export function requireRole(req: Request, role: string): AuthResult {
  const result = requireAuth(req);
  if (!result.ok) return result;

  if (result.user.role !== role) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden — insufficient permissions" },
        { status: 403 }
      ),
    };
  }

  return result;
}
