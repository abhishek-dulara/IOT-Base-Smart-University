import { NextResponse } from "next/server";
import { getUserById, updateUser, deleteUser } from "@/lib/services/users";
import { requireRole } from "@/lib/authGuard";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, "SUPER_ADMIN");
  if (!auth.ok) return auth.response;

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
  const auth = requireRole(req, "SUPER_ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const updates = await req.json();

    const allowedUpdates: any = {};
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
    if (updates.role !== undefined) allowedUpdates.role = updates.role;
    if (updates.is_active !== undefined) allowedUpdates.is_active = updates.is_active;

    const updatedUser = await updateUser(id, allowedUpdates);
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireRole(req, "SUPER_ADMIN");
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;

    // Find the very first SUPER_ADMIN added to the system
    const { supabase } = await import("@/lib/supabase");
    const { data: firstSuperAdmin } = await supabase
      .from("users")
      .select("uid")
      .eq("role", "SUPER_ADMIN")
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (firstSuperAdmin && firstSuperAdmin.uid === id) {
      return NextResponse.json(
        { error: "The original super admin account cannot be deleted." },
        { status: 403 }
      );
    }

    await deleteUser(id);
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
