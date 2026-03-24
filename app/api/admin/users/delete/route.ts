import { NextResponse } from "next/server";
import type { Profile } from "@/lib/types/database";

import { verifyAdminBearerToken } from "@/lib/admin/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface AdminActionInsert {
  admin_id: string;
  action_type: string;
  target_user_id: string;
  target_table: string;
  old_value: string;
  new_value: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 },
      );
    }

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 },
      );
    }

    const verification = await verifyAdminBearerToken(token);
    if (verification.error || !verification.adminId) {
      const errorMessage =
        verification.status === 403
          ? "Forbidden: Only admins can delete users"
          : verification.error || "Invalid auth token";

      return NextResponse.json(
        { error: errorMessage },
        { status: verification.status || 401 },
      );
    }

    const adminId = verification.adminId;
    const supabase = createAdminClient();

    if (adminId === user_id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 },
      );
    }

    const { data: targetUser, error: targetErr } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user_id)
      .maybeSingle();

    if (targetErr || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userProfile = targetUser as Partial<Profile>;

    await supabase.from("admin_actions").insert([{
      admin_id: adminId,
      action_type: "user_deleted",
      target_user_id: user_id,
      target_table: "profiles",
      old_value: JSON.stringify({
        email: userProfile.email,
        full_name: userProfile.full_name,
        is_active: userProfile.is_active,
      }),
      new_value: JSON.stringify({ deleted: true }),
    }] as AdminActionInsert[]);

    const { error: deleteAuthErr } =
      await supabase.auth.admin.deleteUser(user_id);

    if (deleteAuthErr) {
      return NextResponse.json(
        { error: "Failed to delete user", details: String(deleteAuthErr) },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: `User ${userProfile.email} has been deleted`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(err) },
      { status: 500 },
    );
  }
}
