import { NextResponse } from "next/server";
import {
  getBuildingById,
  updateBuilding,
  deleteBuilding,
} from "@/lib/services/buildings";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const building = await getBuildingById(id);
    return NextResponse.json(building);
  } catch {
    return NextResponse.json(
      { error: "Building not found" },
      { status: 404 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const building = await updateBuilding(id, body);
    return NextResponse.json(building);
  } catch {
    return NextResponse.json(
      { error: "Failed to update building" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteBuilding(id);
    return NextResponse.json({ message: "Building deleted" });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete building" },
      { status: 500 }
    );
  }
}
