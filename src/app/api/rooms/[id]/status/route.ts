import { NextResponse } from "next/server";
import { getRoomStatus } from "@/lib/services/rooms";
import { requireAuth } from "@/lib/authGuard";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const status = await getRoomStatus(id);
    return NextResponse.json(status);
  } catch {
    return NextResponse.json(
      { error: "Room status not found" },
      { status: 404 }
    );
  }
}
