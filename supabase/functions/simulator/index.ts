import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (_req: ) => {
  try {
    // 1. Fetch all active sensor nodes
    const { data: nodes, error: nodesError } = await supabase
      .from("sensor_nodes")
      .select("node_id, room_id")
      .eq("is_active", true);

    if (nodesError) throw nodesError;

    if (!nodes || nodes.length === 0) {
      return new Response(JSON.stringify({ message: "No active nodes to simulate" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const readings = nodes.map((node) => {
      // Simulate slightly varied temperature (22-26C)
      const baseTemp = 24;
      const tempVariation = (Math.random() - 0.5) * 4;
      
      // Simulate noise (30-80dB)
      const baseNoise = 45;
      const noiseVariation = Math.random() * 35;
      
      // Simulate light (0-500 lux)
      const isDaytime = new Date().getHours() > 6 && new Date().getHours() < 18;
      const lightLux = isDaytime ? 300 + Math.random() * 200 : Math.random() * 20;

      // Simulate occupancy (15% chance to be occupied)
      const isOccupied = Math.random() > 0.85;

      return {
        node_id: node.node_id,
        room_id: node.room_id,
        temperature_c: +(baseTemp + tempVariation).toFixed(1),
        noise_db: +(baseNoise + noiseVariation).toFixed(1),
        light_lux: +(lightLux).toFixed(1),
        occupancy_detected: isOccupied,
        pir_motion: isOccupied,
        ghost_cooling_suspected: false,
      };
    });

    const { error: insertError } = await supabase.from("readings").insert(readings);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ message: "Simulated readings inserted", count: readings.length }), {
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
