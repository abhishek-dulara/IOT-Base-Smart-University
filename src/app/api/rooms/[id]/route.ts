import { NextResponse } from "next/server";
import { getRoomById, updateRoom, deleteRoom } from "@/lib/services/rooms";
import { requireAuth } from "@/lib/authGuard";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const room = await getRoomById(id);
    return NextResponse.json(room);
  } catch {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const room = await updateRoom(id, body);
    return NextResponse.json(room);
  } catch {
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    await deleteRoom(id);
    return NextResponse.json({ message: "Room deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
