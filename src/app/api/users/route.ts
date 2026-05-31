import { NextResponse } from "next/server";
import { getUsers } from "@/lib/services/users";
import { requireRole } from "@/lib/authGuard";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = requireRole(req, "SUPER_ADMIN");
  if (!auth.ok) return auth.response;

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
  const auth = requireRole(req, "SUPER_ADMIN");
  if (!auth.ok) return auth.response;

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
