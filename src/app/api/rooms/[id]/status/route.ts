import { NextResponse } from "next/server";
import { getRoomStatus } from "@/lib/services/rooms";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
