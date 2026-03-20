import { NextResponse } from "next/server";
import { getReadings, createReading } from "@/lib/services/sensors";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const room_id = searchParams.get("room_id") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const readings = await getReadings(room_id, limit);
    return NextResponse.json(readings);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch readings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const reading = await createReading(body);
    return NextResponse.json(reading, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create reading" },
      { status: 500 }
    );
  }
}
