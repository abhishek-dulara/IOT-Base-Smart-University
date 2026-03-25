import { supabase } from "@/lib/supabase";

export async function getRooms(building_id?: string) {
  let query = supabase
    .from("rooms")
    .select("*, room_status(*)")
    .order("created_at", { ascending: false });

  if (building_id) {
    query = query.eq("building_id", building_id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
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

  // Return defaults when no status row exists yet (e.g. newly created room)
  return data ?? {
    room_id,
    occupancy: null,
    temperature_c: null,
    light_lux: null,
    noise_db: null,
    ghost_cooling_active: null,
    ghost_cooling_level: null,
    ghost_cooling_reason: null,
    updated_at: null,
    last_reading_id: null,
  };
}
