import { NextResponse } from "next/server";
import { resolveAnomaly } from "@/lib/services/alerts";
import { requireAuth } from "@/lib/authGuard";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

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
