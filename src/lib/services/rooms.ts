import { supabase } from "@/lib/supabase";

export async function getRooms(building_id?: string) {
  let query = supabase
    .from("rooms")
    .select("*, room_status(*), sensor_nodes(node_id, is_active)")
    .order("created_at", { ascending: false });

  if (building_id) {
    query = query.eq("building_id", building_id);
  }

  const { data, error } = await query;
  if (error) throw error;

  if (!data || data.length === 0) return data;

  // For each room, fetch the latest reading from the sensor node
  const roomIds = data.map((r: any) => r.room_id);
  const { data: latestReadings } = await supabase
    .from("readings")
    .select("room_id, temperature_c, occupancy_detected, noise_db, light_lux, ghost_cooling_suspected, created_at")
    .in("room_id", roomIds)
    .order("created_at", { ascending: false });

  // Build a map: room_id -> latest reading
  const latestByRoom: Record<string, any> = {};
  if (latestReadings) {
    for (const r of latestReadings) {
      if (!latestByRoom[r.room_id]) {
        latestByRoom[r.room_id] = r;
      }
    }
  }

  // Merge the latest reading values into room_status, keeping updated_at from room_status
  return data.map((room: any) => {
    const latest = latestByRoom[room.room_id];
    const status = Array.isArray(room.room_status) ? room.room_status[0] : room.room_status;
    if (!latest || !status) return room;

    const merged = {
      ...status,
      temperature_c: latest.temperature_c ?? status.temperature_c,
      occupancy: latest.occupancy_detected ? "OCCUPIED" : "VACANT",
      noise_db: latest.noise_db ?? status.noise_db,
      light_lux: latest.light_lux ?? status.light_lux,
      ghost_cooling_active: latest.ghost_cooling_suspected ?? status.ghost_cooling_active,
      // updated_at intentionally kept from room_status (not overwritten)
    };

    return {
      ...room,
      room_status: Array.isArray(room.room_status) ? [merged] : merged,
    };
  });
}

export async function getRoomById(room_id: string) {
  const { data, error } = await supabase
    .from("rooms")
    .select("*, room_status(*), sensor_nodes(*)")
    .eq("room_id", room_id)
    .single();

  if (error) throw error;
  return data;
}

export async function createRoom(input: {
  name: string;
  code?: string;
  type: string;
  building_id: string;
  floor_id?: string;
  is_public_destination?: boolean;
}) {
  const { data, error } = await supabase
    .from("rooms")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRoom(
  room_id: string,
  updates: {
    name?: string;
    code?: string;
    type?: string;
    building_id?: string;
    floor_id?: string | null;
    is_public_destination?: boolean;
  }
) {
  const { data, error } = await supabase
    .from("rooms")
    .update(updates)
    .eq("room_id", room_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRoom(room_id: string) {
  const { error } = await supabase
    .from("rooms")
    .delete()
    .eq("room_id", room_id);

  if (error) throw error;
}

export async function getRoomStatus(room_id: string) {
  const { data, error } = await supabase
    .from("room_status")
    .select("*")
    .eq("room_id", room_id)
    .maybeSingle();

  if (error) throw error;

  // Fetch the latest reading from the sensor node
  const { data: latestReading } = await supabase
    .from("readings")
    .select("temperature_c, occupancy_detected, noise_db, light_lux, ghost_cooling_suspected, created_at")
    .eq("room_id", room_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Base defaults when no status row exists yet
  const base = data ?? {
    room_id,
    occupancy: null,
    temperature_c: null,
    light_lux: null,
    noise_db: null,
    ghost_cooling_active: null,
    ghost_cooling_level: null,
    ghost_cooling_reason: null,
    updated_at: null,      // kept from room_status — not from reading
    last_reading_id: null,
  };

  // Overlay sensor values from the latest reading.
  // updated_at is intentionally NOT overwritten — it stays as the room_status value.
  if (latestReading) {
    return {
      ...base,
      temperature_c: latestReading.temperature_c ?? base.temperature_c,
      occupancy: latestReading.occupancy_detected != null
        ? (latestReading.occupancy_detected ? "OCCUPIED" : "VACANT")
        : base.occupancy,
      noise_db: latestReading.noise_db ?? base.noise_db,
      light_lux: latestReading.light_lux ?? base.light_lux,
      ghost_cooling_active: latestReading.ghost_cooling_suspected ?? base.ghost_cooling_active,
      last_sensor_reading_at: latestReading.created_at, // extra field for UI info
    };
  }

  return base;
}
