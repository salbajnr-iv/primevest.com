import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

type KycDocumentPayload = {
  doc_type?: string;
  storage_path: string;
  file_name?: string;
  mime_type?: string | null;
  size?: number | null;
  meta?: Record<string, unknown>;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { documents = [], metadata = {} } = body || {};

    const sessionClient = await createServerClient();
    const {
      data: { user },
      error: userErr,
    } = await sessionClient.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const userId = user.id;

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: "No documents provided" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const { data: requestData, error: requestErr } = await supabase
      .from("kyc_requests")
      .insert([{ user_id: userId, status: "submitted", metadata }])
      .select("*")
      .single();

    if (requestErr || !requestData) {
      return NextResponse.json(
        { error: "Failed to create KYC request" },
        { status: 500 },
      );
    }

    const requestId = requestData.id;
    const docsToInsert = (documents as KycDocumentPayload[]).map((d) => ({
      request_id: requestId,
      user_id: userId,
      doc_type: d.doc_type || "unknown",
      storage_path: d.storage_path,
      file_name: d.file_name || "",
      mime_type: d.mime_type || null,
      size: d.size || null,
      meta: d.meta || {},
    }));

    const { error: docsErr } = await supabase
      .from("kyc_documents")
      .insert(docsToInsert);

    if (docsErr) {
      await supabase.from("kyc_requests").delete().eq("id", requestId);
      return NextResponse.json(
        { error: "Failed to attach documents" },
        { status: 500 },
      );
    }

    await supabase
      .from("profiles")
      .update({
        kyc_status: "submitted",
        kyc_requested_at: new Date().toISOString(),
      })
      .eq("id", userId);

    return NextResponse.json({ ok: true, request: requestData });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(err) },
      { status: 500 },
    );
  }
}
