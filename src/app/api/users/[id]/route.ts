import { NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/lib/services/users";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserById(id);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const user = await updateUser(id, body);
    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteUser(id);
    return NextResponse.json({ message: "User deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
