import { NextResponse } from "next/server";
import {
  getActiveAnomalies,
  createAnomaly,
} from "@/lib/services/alerts";
import { requireAuth } from "@/lib/authGuard";

export async function GET(req: Request) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const anomalies = await getActiveAnomalies();
    return NextResponse.json(anomalies);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = requireAuth(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const anomaly = await createAnomaly(body);
    return NextResponse.json(anomaly, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
