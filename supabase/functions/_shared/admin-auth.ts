import { supabaseAdmin } from "./supabase";

export type AdminContext = {
  adminId: string;
};

export const requireAdmin = async (request: Request): Promise<AdminContext> => {
  const authorization = request.headers.get("Authorization") ?? "";

  if (!authorization.startsWith("Bearer ")) {
    throw new Error("Missing bearer token");
  }

  const token = authorization.replace("Bearer ", "").trim();
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    throw new Error("Invalid auth token");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, is_admin")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile?.is_admin) {
    throw new Error("Admin access required");
  }

  return { adminId: profile.id };
};
