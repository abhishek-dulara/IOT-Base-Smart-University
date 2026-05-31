import { supabase } from "@/lib/supabase";

export async function getFirstSuperAdminUid(): Promise<string | null> {
  const { data } = await supabase
    .from("users")
    .select("uid")
    .eq("role", "SUPER_ADMIN")
    .order("created_at", { ascending: true })
    .limit(1)
    .single();
  return data?.uid ?? null;
}

export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("uid, name, email, role, is_active, created_at, last_login_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Tag the first super admin so the UI can lock their delete button
  const firstSuperAdminUid = await getFirstSuperAdminUid();
  return (data ?? []).map((u) => ({
    ...u,
    isProtected: u.uid === firstSuperAdminUid,
  }));
}

export async function getUserById(uid: string) {
  const { data, error } = await supabase
    .from("users")
    .select("uid, name, email, role, is_active, created_at, last_login_at")
    .eq("uid", uid)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(
  uid: string,
  updates: { name?: string; role?: string; is_active?: boolean }
) {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("uid", uid)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUser(uid: string) {
  const { error } = await supabase.from("users").delete().eq("uid", uid);
  if (error) throw error;
}
