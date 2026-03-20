import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: "Account is deactivated" },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from("users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("uid", user.uid);

    const token = signToken({
      userId: user.uid,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
