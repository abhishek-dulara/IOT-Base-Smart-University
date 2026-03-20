import { NextResponse } from "next/server";
import { getRooms, createRoom } from "@/lib/services/rooms";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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
