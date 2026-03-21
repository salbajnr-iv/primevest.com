import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminRequestVerificationResult {
  error?: string;
  status?: number;
  adminId?: string;
}

export async function verifyAdminBearerToken(token: string): Promise<AdminRequestVerificationResult> {
  if (!token) {
    return { error: "Missing authorization token", status: 401 };
  }

  const supabase = createAdminClient();
  const { data: userData, error: userErr } = await supabase.auth.getUser(token);

  if (userErr || !userData?.user) {
    return { error: "Invalid auth token", status: 401 };
  }

  const adminId = userData.user.id;
  const { data: adminProfile, error: adminErr } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", adminId)
    .maybeSingle();

  if (adminErr || !adminProfile || (adminProfile as { is_admin: boolean }).is_admin !== true) {
    return { error: "Forbidden", status: 403 };
  }

  return { adminId };
}
