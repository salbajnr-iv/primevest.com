import { NextResponse } from "next/server";

import { verifyAdminBearerToken } from "@/lib/admin/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
          ? "Forbidden: Only admins can impersonate users"
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
        { error: "Cannot impersonate yourself" },
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

    await supabase.from("admin_actions").insert([
      {
        admin_id: adminId,
        action_type: "user_impersonation",
        target_user_id: user_id,
        target_table: "profiles",
        new_value: JSON.stringify({
          impersonated_user: targetUser.email,
          timestamp: new Date().toISOString(),
        }),
      },
    ]);

    return NextResponse.json({
      ok: true,
      message: `Impersonation session initiated for ${targetUser.email}`,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        full_name: targetUser.full_name,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(err) },
      { status: 500 },
    );
  }
}
