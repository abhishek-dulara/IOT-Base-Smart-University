import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    // 1. Fetch data for the report
    const [buildingsRes, roomsRes, anomaliesRes] = await Promise.all([
      supabase.from("buildings").select("*, floors(count), rooms(count)"),
      supabase.from("rooms").select("*, room_status(*)"),
      supabase.from("anomalies").select("*").eq("is_active", true),
    ]);

    if (buildingsRes.error) throw buildingsRes.error;
    if (roomsRes.error) throw roomsRes.error;
    if (anomaliesRes.error) throw anomaliesRes.error;

    const reportData = {
      generatedAt: new Date().toISOString(),
      buildings: buildingsRes.data,
      rooms: roomsRes.data,
      activeAnomalies: anomaliesRes.data,
    };

    if (format === "csv") {
      // Basic CSV generation for rooms
      let csv = "Room Name,Room Code,Building ID,Type,Occupied,Temperature,Ghost Cooling Active\n";
      roomsRes.data.forEach((r) => {
        const status = r.room_status?.[0] || {};
        const line = [
          `"${r.name || ""}"`,
          `"${r.code || ""}"`,
          r.building_id,
          r.type,
          status.occupancy === "OCCUPIED" ? "Yes" : "No",
          status.temperature_c ?? "",
          status.ghost_cooling_active ? "Yes" : "No"
        ].join(",");
        csv += line + "\n";
      });

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="navsense-rooms-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default JSON
    return NextResponse.json(reportData);

  } catch {
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
