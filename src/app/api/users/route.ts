import { NextResponse } from "next/server";
import { getUsers } from "@/lib/services/users";

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
