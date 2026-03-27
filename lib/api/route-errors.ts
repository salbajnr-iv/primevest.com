import { NextResponse } from 'next/server';

interface ApiRouteError {
  ok: false;
  code: string;
  message: string;
}

interface RouteLogContext {
  route: string;
  pair: string;
  code: string;
  error: unknown;
  timestamp?: string;
}

export function apiRouteError(status: number, code: string, message: string) {
  return NextResponse.json<ApiRouteError>({ ok: false, code, message }, { status });
}

export function logRouteError(context: RouteLogContext) {
  const safeError = context.error instanceof Error ? context.error.message : 'Unknown error';

  console.error(`[api:${context.route}] request failed`, {
    pair: context.pair,
    timestamp: context.timestamp ?? new Date().toISOString(),
    code: context.code,
    error: safeError,
  });
}
