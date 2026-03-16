export const SUPPORT_TICKET_STATES = ['open', 'pending', 'resolved', 'closed'] as const;

export type SupportTicketState = (typeof SUPPORT_TICKET_STATES)[number];

export function isSupportTicketState(value: string): value is SupportTicketState {
  return SUPPORT_TICKET_STATES.includes(value as SupportTicketState);
}

export interface SupportReply {
  id: number;
  ticket_id: number;
  user_id: string;
  message: string;
  is_staff: boolean;
  created_at: string;
  seen_at: string | null;
}

export type RealtimeReply = SupportReply;

export function getBearerToken(request: Request): string {
  return (request.headers.get('authorization') || '').replace('Bearer ', '').trim();
}
