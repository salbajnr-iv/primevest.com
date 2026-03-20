import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPPORTED_DOC_TYPES = new Set(["id_card", "proof_of_address", "selfie"]);
const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const PRIVATE_KYC_BUCKET = "kyc-documents";

type KycMetadata = {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
};

type SubmittedDocument = {
  bucket?: string;
  storage_path: string;
  file_name: string;
  mime_type?: string | null;
  size?: number | null;
  doc_type: string;
  meta?: Record<string, unknown>;
};

const parseString = (value: unknown, field: string, maxLength: number) => {
  if (typeof value !== "string") throw new Error(`${field} must be a string`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${field} is required`);
  if (trimmed.length > maxLength) throw new Error(`${field} is too long`);
  return trimmed;
};

const validateMetadata = (input: unknown): KycMetadata => {
  if (input == null) return {};
  if (typeof input !== "object" || Array.isArray(input))
    throw new Error("metadata must be an object");

  const raw = input as Record<string, unknown>;
  const allowedKeys = new Set([
    "firstName",
    "lastName",
    "dateOfBirth",
    "nationality",
    "address",
    "city",
    "postalCode",
    "country",
  ]);

  for (const key of Object.keys(raw)) {
    if (!allowedKeys.has(key))
      throw new Error(`metadata.${key} is not allowed`);
  }

  const metadata: KycMetadata = {};

  if (raw.firstName != null)
    metadata.firstName = parseString(raw.firstName, "metadata.firstName", 120);
  if (raw.lastName != null)
    metadata.lastName = parseString(raw.lastName, "metadata.lastName", 120);
  if (raw.nationality != null)
    metadata.nationality = parseString(
      raw.nationality,
      "metadata.nationality",
      120,
    );
  if (raw.address != null)
    metadata.address = parseString(raw.address, "metadata.address", 240);
  if (raw.city != null)
    metadata.city = parseString(raw.city, "metadata.city", 120);
  if (raw.postalCode != null)
    metadata.postalCode = parseString(
      raw.postalCode,
      "metadata.postalCode",
      40,
    );
  if (raw.country != null)
    metadata.country = parseString(raw.country, "metadata.country", 120);

  if (raw.dateOfBirth != null) {
    const dateOfBirth = parseString(
      raw.dateOfBirth,
      "metadata.dateOfBirth",
      40,
    );
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
      Number.isNaN(Date.parse(`${dateOfBirth}T00:00:00Z`))
    ) {
      throw new Error("metadata.dateOfBirth must use YYYY-MM-DD format");
    }
    metadata.dateOfBirth = dateOfBirth;
  }

  return metadata;
};

const validateDocuments = (
  input: unknown,
  userId: string,
): SubmittedDocument[] => {
  if (!Array.isArray(input) || input.length === 0)
    throw new Error("No documents provided");

  return input.map((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`documents[${index}] must be an object`);
    }

    const document = entry as Record<string, unknown>;
    const storagePath = parseString(
      document.storage_path,
      `documents[${index}].storage_path`,
      512,
    );
    const fileName = parseString(
      document.file_name,
      `documents[${index}].file_name`,
      255,
    );
    const docType = parseString(
      document.doc_type,
      `documents[${index}].doc_type`,
      64,
    );
    const bucket =
      document.bucket == null
        ? PRIVATE_KYC_BUCKET
        : parseString(document.bucket, `documents[${index}].bucket`, 64);

    if (bucket !== PRIVATE_KYC_BUCKET)
      throw new Error(
        `documents[${index}] must reference the private ${PRIVATE_KYC_BUCKET} bucket`,
      );
    if (!SUPPORTED_DOC_TYPES.has(docType))
      throw new Error(`documents[${index}].doc_type is invalid`);

    const pathParts = storagePath.split("/");
    if (
      pathParts.length < 3 ||
      pathParts[0] !== userId ||
      pathParts[1] !== docType
    ) {
      throw new Error(
        `documents[${index}] path must match ${userId}/${docType}/...`,
      );
    }

    let mimeType: string | null | undefined = undefined;
    if (document.mime_type != null) {
      mimeType = parseString(
        document.mime_type,
        `documents[${index}].mime_type`,
        120,
      );
      if (!SUPPORTED_MIME_TYPES.has(mimeType))
        throw new Error(`documents[${index}].mime_type is invalid`);
    }

    let size: number | null | undefined = undefined;
    if (document.size != null) {
      if (
        typeof document.size !== "number" ||
        !Number.isFinite(document.size) ||
        document.size <= 0
      ) {
        throw new Error(`documents[${index}].size must be a positive number`);
      }
      if (document.size > MAX_FILE_SIZE)
        throw new Error(`documents[${index}].size exceeds the 15MB limit`);
      size = document.size;
    }

    let meta: Record<string, unknown> | undefined;
    if (document.meta != null) {
      if (typeof document.meta !== "object" || Array.isArray(document.meta)) {
        throw new Error(`documents[${index}].meta must be an object`);
      }
      meta = document.meta as Record<string, unknown>;
    }

    return {
      storage_path: storagePath,
      file_name: fileName,
      doc_type: docType,
      bucket,
      mime_type: mimeType ?? null,
      size: size ?? null,
      meta,
    };
  });
};

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment configuration" },
        { status: 500 },
      );
    }

    const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userData, error: userErr } =
      await serviceSupabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json(
        { error: "Invalid auth token" },
        { status: 401 },
      );
    }

    const userId = userData.user.id;
    const body = await req.json();
    const metadata = validateMetadata(body?.metadata);
    const documents = validateDocuments(body?.documents, userId);

    const { data: bucket, error: bucketError } = await serviceSupabase
      .schema("storage")
      .from("buckets")
      .select("id, public")
      .eq("id", PRIVATE_KYC_BUCKET)
      .maybeSingle();

    if (bucketError || !bucket || bucket.public) {
      return NextResponse.json(
        {
          error: `The ${PRIVATE_KYC_BUCKET} bucket must exist and remain private`,
        },
        { status: 500 },
      );
    }

    const { data: objects, error: objectsError } = await serviceSupabase
      .schema("storage")
      .from("objects")
      .select("name, bucket_id, owner_id")
      .eq("bucket_id", PRIVATE_KYC_BUCKET)
      .in(
        "name",
        documents.map((document) => document.storage_path),
      );

    if (objectsError) {
      return NextResponse.json(
        { error: "Failed to verify uploaded documents" },
        { status: 500 },
      );
    }

    const verifiedPaths = new Set(
      (objects ?? [])
        .filter(
          (object) =>
            object.bucket_id === PRIVATE_KYC_BUCKET &&
            object.name.split("/")[0] === userId &&
            object.owner_id === userId,
        )
        .map((object) => object.name),
    );

    const missingPath = documents.find(
      (document) => !verifiedPaths.has(document.storage_path),
    );
    if (missingPath) {
      return NextResponse.json(
        {
          error: `Document not found in the private bucket for this user: ${missingPath.storage_path}`,
        },
        { status: 400 },
      );
    }

    const userSupabase = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: requestData, error: submitError } = await userSupabase.rpc(
      "submit_kyc_request",
      {
        p_metadata: metadata,
        p_documents: documents,
      },
    );

    if (submitError || !requestData) {
      return NextResponse.json(
        { error: submitError?.message || "Failed to create KYC request" },
        { status: 400 },
      );
    }

    const requestRecord = Array.isArray(requestData)
      ? requestData[0]
      : requestData;
    return NextResponse.json({ ok: true, request: requestRecord });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: message || "Unexpected error" },
      { status: 400 },
    );
  }
}
