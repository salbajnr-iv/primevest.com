import { NextResponse } from "next/server";
import { validateContactSubmission } from "@/lib/support/contact-validation";
import { createAdminClient } from "@/lib/supabase/admin";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

const rateLimitBuckets = new Map<string, number[]>();

function getRateLimitKey(request: Request): string {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "anonymous";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const attempts =
    rateLimitBuckets
      .get(key)
      ?.filter((time) => now - time < RATE_LIMIT_WINDOW_MS) ?? [];

  if (attempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    rateLimitBuckets.set(key, attempts);
    return true;
  }

  attempts.push(now);
  rateLimitBuckets.set(key, attempts);
  return false;
}

function generateTicketReference(): string {
  const seed = `${Date.now()}${Math.floor(Math.random() * 10000)}`;
  return `TKT-${seed.slice(-8)}`;
}

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request);
  if (isRateLimited(rateLimitKey)) {
    return NextResponse.json(
      {
        error:
          "Too many submissions. Please wait a few minutes before sending another message.",
        code: "RATE_LIMITED",
      },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid request format. Please submit valid JSON.",
        code: "INVALID_PAYLOAD",
      },
      { status: 400 },
    );
  }

  const validation = validateContactSubmission(payload);
  if (!validation.isValid || !validation.values) {
    return NextResponse.json(
      {
        error: "Please correct the highlighted fields and try again.",
        code: "INVALID_PAYLOAD",
        fieldErrors: validation.errors,
      },
      { status: 400 },
    );
  }

  const referenceId = generateTicketReference();

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        reference_id: referenceId,
        name: validation.values.name,
        email: validation.values.email,
        category: validation.values.category,
        subject: validation.values.subject ?? null,
        message: validation.values.message,
        status: "open",
      })
      .select("id, reference_id")
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          error:
            "Support service is currently unavailable. Please try again shortly.",
          code: "SERVICE_UNAVAILABLE",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        ticketId: data.id,
        referenceId: data.reference_id,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Support service is temporarily unavailable. Please try again later.",
        code: "SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }
}
