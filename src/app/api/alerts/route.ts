import { NextResponse } from "next/server";
import {
  getActiveAnomalies,
  createAnomaly,
} from "@/lib/services/alerts";

export async function GET() {
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
