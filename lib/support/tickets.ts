export const SUPPORT_TICKET_STATES = ["open", "pending", "resolved", "closed"] as const;

export type SupportTicketState = (typeof SUPPORT_TICKET_STATES)[number];

export function isSupportTicketState(value: string): value is SupportTicketState {
  return SUPPORT_TICKET_STATES.includes(value as SupportTicketState);
}

export function getBearerToken(request: Request): string {
  return (request.headers.get("authorization") || "").replace("Bearer ", "").trim();
}
