export const jsonResponse = (
  body: Record<string, unknown>,
  status = 200,
): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const requestIdFromHeaders = (request: Request): string | null => {
  return request.headers.get("x-idempotency-key") ?? request.headers.get("x-request-id");
};
