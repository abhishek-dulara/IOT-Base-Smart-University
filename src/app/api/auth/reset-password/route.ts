import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    if (payload.purpose !== "password_reset") {
       return NextResponse.json(
        { error: "Invalid token purpose" },
        { status: 400 }
      );
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    
    const { error: updateError } = await supabase
      .from("users")
      .update({ password_hash: newHash })
      .eq("uid", payload.userId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
