import { NextResponse } from "next/server";
import { getBuildings, createBuilding } from "@/lib/services/buildings";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const buildings = await getBuildings();
    return NextResponse.json(buildings);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch buildings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const building = await createBuilding(body);
    return NextResponse.json(building, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create building" },
      { status: 500 }
    );
  }
}
