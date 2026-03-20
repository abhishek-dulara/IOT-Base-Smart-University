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
  number_of_floors?: number;
  number_of_rooms?: number;
  created_by?: string;
}) {
  const { data, error } = await supabase
    .from("buildings")
    .insert(input)
    .select()
    .single();

  if (error) throw error;

  if (data && input.number_of_floors && input.number_of_floors > 0) {
    const floorsToInsert = Array.from({ length: input.number_of_floors }, (_, i) => ({
      building_id: data.building_id,
      level: i + 1,
      name: `Floor ${i + 1}`
    }));
    await supabase.from("floors").insert(floorsToInsert);
  }

  return data;
}

export async function updateBuilding(
  building_id: string,
  updates: { name?: string; address?: string; number_of_floors?: number; number_of_rooms?: number; }
) {
  const { data, error } = await supabase
    .from("buildings")
    .update(updates)
    .eq("building_id", building_id)
    .select()
    .single();

  if (error) throw error;

  // Auto-generate missing floors if number_of_floors was increased
  if (updates.number_of_floors) {
    const { data: existingFloors } = await supabase
      .from("floors")
      .select("level")
      .eq("building_id", building_id);
    
    const currentCount = existingFloors?.length || 0;
    if (updates.number_of_floors > currentCount) {
      const floorsToInsert = Array.from(
        { length: updates.number_of_floors - currentCount }, 
        (_, i) => ({
          building_id: building_id,
          level: currentCount + i + 1,
          name: `Floor ${currentCount + i + 1}`
        })
      );
      await supabase.from("floors").insert(floorsToInsert);
    }
  }

  return data;
}

export async function deleteBuilding(building_id: string) {
  const { error } = await supabase
    .from("buildings")
    .delete()
    .eq("building_id", building_id);

  if (error) throw error;
}
