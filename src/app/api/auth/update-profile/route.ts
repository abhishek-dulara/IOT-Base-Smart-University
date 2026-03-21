import { supabase } from "@/lib/supabase";
import { verifyToken, signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);

    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Update user in DB
    const { data: updatedUser, error } = await supabase
      .from("users")
      .update({ name, email })
      .eq("uid", payload.userId)
      .select("uid, name, email, role")
      .single();

    if (error || !updatedUser) {
      // Handle unique constraint violation for email
      if (error?.code === "23505") {
         return NextResponse.json({ error: "Email already in use" }, { status: 400 });
      }
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    // Sign a new token since the email might have changed, and it's in the payload
    const newToken = signToken({
      userId: updatedUser.uid,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      token: newToken,
      user: {
        uid: updatedUser.uid,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
