import { supabase } from "@/lib/supabase";
import { signToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("uid, name")
      .eq("email", email)
      .single();

    if (error || !user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json({ message: "If this email exists, a reset link has been sent." });
    }

    // Create a token valid for 15 minutes
    const token = signToken({ userId: user.uid, email, purpose: "password_reset" }, "15m");

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"NavSense Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request - NavSense",
      html: `
        <div style="background-color: #181B20; width: 100%; padding: 60px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-sizing: border-box;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #1E2025; padding: 40px; border-radius: 16px; border: 1px solid #48505B; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #00ADB5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">NavSense</h1>
              <p style="color: #8a8f98; margin-top: 5px; font-size: 14px;">Smart Campus Monitoring System</p>
            </div>
            
            <h2 style="color: #EEEEEE; font-size: 20px; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #c5c5c5; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi ${user.name},</p>
            
            <p style="color: #c5c5c5; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
              We received a request to reset the password for your NavSense account. If you made this request, please click the button below to set up a new password:
            </p>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${resetLink}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #00ADB5, #008c93); color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 12px; box-shadow: 0 0 20px rgba(0, 173, 181, 0.2);">
                Reset Password
              </a>
            </div>
            
            <p style="color: #8a8f98; font-size: 14px; margin-bottom: 10px;">
              <strong>Note:</strong> This link will expire securely in 15 minutes.
            </p>
            
            <p style="color: #8a8f98; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
              If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
          
          <div style="max-width: 600px; margin: 25px auto 0; text-align: center; color: #8a8f98; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} NavSense Smart Campus. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `,
    };

    // Attempt to send email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail(mailOptions);
    } else {
      console.warn("EMAIL_USER or EMAIL_PASS not set. Falling back to console log for development.");
      console.log("Reset Link: ", resetLink);
    }

    return NextResponse.json({ message: "If this email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
