import { supabase } from "@/lib/supabase";

export async function getSensorNodes(room_id?: string) {
  let query = supabase
    .from("sensor_nodes")
    .select("*")
    .order("created_at", { ascending: false });

  if (room_id) {
    query = query.eq("room_id", room_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createSensorNode(input: {
  node_id: string;
  room_id: string;
  device_name?: string;
  firmware_version?: string;
  wifi_mac?: string;
}) {
  const { data, error } = await supabase
    .from("sensor_nodes")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createReading(input: {
  node_id: string;
  room_id: string;
  noise_db?: number;
  pir_motion?: boolean;
  temperature_c?: number;
  light_lux?: number;
  occupancy_detected?: boolean;
  ghost_cooling_suspected?: boolean;
}) {
  const { data, error } = await supabase
    .from("readings")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getReadings(room_id?: string, limit = 50) {
  let query = supabase
    .from("readings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (room_id) {
    query = query.eq("room_id", room_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getLatestReading(room_id: string) {
  const { data, error } = await supabase
    .from("readings")
    .select("*")
    .eq("room_id", room_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) throw error;
  return data;
}
