import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get("range") || "24h"; // e.g., 24h, 7d, 30d
    
    // In a real production app you'd calculate these using SQL functions or views
    // For this prototype, we'll fetch recent readings and aggregate them here
    const { data: readings, error: readingsError } = await supabase
      .from("readings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1000); // Fetch up to 1000 recent readings

    if (readingsError) throw readingsError;

    const { data: rooms, error: roomsError } = await supabase
      .from("rooms")
      .select("room_id");

    if (roomsError) throw roomsError;

    if (!readings || readings.length === 0) {
      return NextResponse.json({
         avgTemperature: 0,
         occupancyRate: 0,
         totalReadings: 0,
      });
    }

    let totalTemp = 0;
    let tempCount = 0;
    let occupiedCount = 0;
    let validOccupancyCount = 0;

    readings.forEach((r) => {
      if (typeof r.temperature_c === "number") {
         totalTemp += r.temperature_c;
         tempCount++;
      }
      if (r.occupancy_detected !== null) {
         if (r.occupancy_detected) occupiedCount++;
         validOccupancyCount++;
      }
    });

    const avgTemperature = tempCount > 0 ? +(totalTemp / tempCount).toFixed(1) : 0;
    const occupancyRate = validOccupancyCount > 0 ? +((occupiedCount / validOccupancyCount) * 100).toFixed(1) : 0;

    return NextResponse.json({
       avgTemperature,
       occupancyRate,
       totalReadings: readings.length,
       totalRoomsMonitored: rooms?.length || 0
    });

  } catch {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
