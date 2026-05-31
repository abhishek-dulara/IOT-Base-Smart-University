import { NextResponse } from "next/server";
import { getRooms, createRoom } from "@/lib/services/rooms";
import { requireAuth } from "@/lib/authGuard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const building_id = searchParams.get("building_id") || undefined;
    const rooms = await getRooms(building_id);
    return NextResponse.json(rooms);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const room = await createRoom(body);
    return NextResponse.json(room, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
