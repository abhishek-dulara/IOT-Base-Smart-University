import { supabase } from "@/lib/supabase";

export async function getBuildings() {
  const { data, error } = await supabase
    .from("buildings")
    .select("*, floors(count), rooms(count)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getBuildingById(building_id: string) {
  const { data, error } = await supabase
    .from("buildings")
    .select("*, floors(*), rooms(*)")
    .eq("building_id", building_id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBuilding(input: {
  name: string;
  address?: string;
  created_by?: string;
}) {
  const { data, error } = await supabase
    .from("buildings")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBuilding(
  building_id: string,
  updates: { name?: string; address?: string }
) {
  const { data, error } = await supabase
    .from("buildings")
    .update(updates)
    .eq("building_id", building_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBuilding(building_id: string) {
  const { error } = await supabase
    .from("buildings")
    .delete()
    .eq("building_id", building_id);

  if (error) throw error;
}
