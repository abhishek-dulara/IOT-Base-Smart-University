import { NextResponse } from "next/server";
import { resolveAnomaly } from "@/lib/services/alerts";

export async function PUT(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const anomaly = await resolveAnomaly(id);
    return NextResponse.json(anomaly);
  } catch {
    return NextResponse.json(
      { error: "Failed to resolve alert" },
      { status: 500 }
    );
  }
}
