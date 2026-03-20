import { supabase } from "@/lib/supabase";

export async function getActiveAnomalies() {
  const { data, error } = await supabase
    .from("anomalies")
    .select("*, rooms(name, code)")
    .eq("is_active", true)
    .order("start_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAllAnomalies(limit = 100) {
  const { data, error } = await supabase
    .from("anomalies")
    .select("*, rooms(name, code)")
    .order("start_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function createAnomaly(input: {
  type: string;
  room_id?: string;
  node_id?: string;
  severity: string;
  message: string;
}) {
  const { data, error } = await supabase
    .from("anomalies")
    .insert({
      ...input,
      start_at: new Date().toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function resolveAnomaly(anomaly_id: string) {
  const { data, error } = await supabase
    .from("anomalies")
    .update({
      is_active: false,
      end_at: new Date().toISOString(),
    })
    .eq("anomaly_id", anomaly_id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
