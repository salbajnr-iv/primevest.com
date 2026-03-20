import { NextResponse } from "next/server";

import { verifyAdminBearerToken } from "@/lib/admin/server";
import { createAdminClient } from "@/lib/supabase/admin";

export class AdminRouteError extends Error {
  status: number;
  details?: string;

  constructor(message: string, status = 500, details?: string) {
    super(message);
    this.name = "AdminRouteError";
    this.status = status;
    this.details = details;
  }
}

export function adminErrorResponse(error: string, status: number, details?: string) {
  return NextResponse.json(details ? { error, details } : { error }, { status });
}

export async function requireAdminRequest(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return {
      response: adminErrorResponse("Missing authorization token", 401),
    };
  }

  const verification = await verifyAdminBearerToken(token);
  if (verification.error || !verification.adminId) {
    return {
      response: adminErrorResponse(
        verification.error || "Forbidden",
        verification.status || 401,
      ),
    };
  }

  return {
    adminId: verification.adminId,
    token,
  };
}

export function getAdminClient() {
  try {
    return createAdminClient();
  } catch (error) {
    throw new AdminRouteError(
      "Admin tools are unavailable right now.",
      503,
      error instanceof Error ? error.message : String(error),
    );
  }
}


export function handleAdminRouteError(error: unknown, fallback = "Unexpected error") {
  if (error instanceof AdminRouteError) {
    return adminErrorResponse(error.message, error.status, error.details);
  }

  return adminErrorResponse(
    fallback,
    500,
    error instanceof Error ? error.message : String(error),
  );
}

export function requestIpFromHeaders(req: Request) {
  return req.headers.get("x-forwarded-for") || null;
}
