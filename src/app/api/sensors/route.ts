import { NextResponse } from "next/server";
import { getSensorNodes, createSensorNode } from "@/lib/services/sensors";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const room_id = searchParams.get("room_id") || undefined;
    const sensors = await getSensorNodes(room_id);
    return NextResponse.json(sensors);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch sensors" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sensor = await createSensorNode(body);
    return NextResponse.json(sensor, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create sensor" },
      { status: 500 }
    );
  }
}
