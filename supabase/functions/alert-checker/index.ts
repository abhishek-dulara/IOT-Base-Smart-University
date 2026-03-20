import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (_req) => {
  try {
    // Query recently inserted readings grouped by room_id (simplification for deno edge fn)
    // We'll look for anomalies based on thresholds:
    // - Temp > 30C = HIGH_TEMP
    // - 0 active readings for 1 hour = SENSOR_OFFLINE
    // - High cooling but no occupancy = GHOST_COOLING

    // Get current anomalies to avoid duplicating them
    const { data: activeAnomalies } = await supabase
      .from("anomalies")
      .select("*")
      .eq("is_active", true);

    const activeAnomalyRoomIds = new Set(activeAnomalies?.map(a => a.room_id) || []);

    // Fetch the latest reading for each active room
    const { data: rooms } = await supabase.from("rooms").select("room_id, name");
    
    if (!rooms) return new Response(JSON.stringify({ message: "No rooms" }));

    let anomaliesGenerated = 0;

    for (const room of rooms) {
      if (activeAnomalyRoomIds.has(room.room_id)) continue; // Skip if already has an anomaly

      const { data: latestReadings } = await supabase
        .from("readings")
        .select("*")
        .eq("room_id", room.room_id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!latestReadings || latestReadings.length === 0) continue;

      const reading = latestReadings[0];
      const now = new Date();
      const readingTime = new Date(reading.created_at);
      
      const hoursSinceLastReading = (now.getTime() - readingTime.getTime()) / (1000 * 60 * 60);

      // Rule 1: SENSOR OFFLINE
      if (hoursSinceLastReading > 1) {
        await createAnomaly("SENSOR_OFFLINE", "HIGH", `Sensor offline for ${hoursSinceLastReading.toFixed(1)} hours in ${room.name}`, room.room_id, reading.node_id);
        anomaliesGenerated++;
        continue;
      }

      // Rule 2: HIGH TEMPERATURE
      if (reading.temperature_c && reading.temperature_c > 30) {
        await createAnomaly("HIGH_TEMP", "HIGH", `Critical temperature detected: ${reading.temperature_c}°C in ${room.name}`, room.room_id, reading.node_id);
        anomaliesGenerated++;
        continue;
      }

      // Rule 3: GHOST COOLING (Temperature < 20C + No Occupancy)
      if (reading.temperature_c != null && reading.temperature_c < 20 && !reading.occupancy_detected) {
         await createAnomaly("GHOST_COOLING", "MEDIUM", `Cooling is active while room ${room.name} is empty. Temp: ${reading.temperature_c}°C`, room.room_id, reading.node_id);
         anomaliesGenerated++;
         continue;
      }
    }

    return new Response(JSON.stringify({ message: `Anomaly check complete. ${anomaliesGenerated} generated.` }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function createAnomaly(type: string, severity: string, message: string, roomId: string, nodeId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  await supabase.from("anomalies").insert({
    type,
    severity,
    message,
    room_id: roomId,
    node_id: nodeId,
    is_active: true,
    start_at: new Date().toISOString()
  });
}
