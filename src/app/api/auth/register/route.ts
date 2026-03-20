import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
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
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const token = signToken({
      userId: user.uid,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json(
      {
        token,
        user: {
          uid: user.uid,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
