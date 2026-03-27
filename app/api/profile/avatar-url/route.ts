import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("avatar_storage_path")
      .eq("id", user.id)
      .maybeSingle();

    if (profileErr) {
      return NextResponse.json(
        { error: "Could not load profile" },
        { status: 500 },
      );
    }

    if (!profile?.avatar_storage_path) {
      return NextResponse.json({ ok: true, url: null });
    }

    const adminSupabase = createAdminClient();
    const { data: urlData, error: urlErr } = await adminSupabase.storage
      .from("avatars")
      .createSignedUrl(profile.avatar_storage_path, 120);

    if (urlErr || !urlData) {
      return NextResponse.json(
        { error: "Could not create signed url" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, url: urlData.signedUrl });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(err) },
      { status: 500 },
    );
  }
}
