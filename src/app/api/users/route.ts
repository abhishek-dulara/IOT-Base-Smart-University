import { NextResponse } from "next/server";
import { getUsers } from "@/lib/services/users";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

function checkSuperAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "SUPER_ADMIN") {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const admin = checkSuperAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const admin = checkSuperAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("users")
      .select("uid")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from("users")
      .insert({
        name: name || email.split("@")[0],
        email,
        password_hash,
        role: role || "ADMIN",
        is_active: true,
      })
      .select("uid, name, email, role, is_active, created_at, last_login_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
