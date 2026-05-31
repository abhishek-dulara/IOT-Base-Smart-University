import { NextResponse } from "next/server";
import { getBuildings, createBuilding } from "@/lib/services/buildings";
import { requireAuth } from "@/lib/authGuard";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

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
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

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
