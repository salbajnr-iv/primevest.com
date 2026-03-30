// Types for Live Chat Widget

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  user_role: 'user' | 'admin';
  content: string;
  message_type: 'text';
  page_url?: string;
  client_message_id?: string; // For deduplication on retry
  created_at: string;
}

export interface Conversation {
  id: string;
  visitor_user_id: string;
  page_url?: string;
  referrer_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface LiveChatWidgetState {
  isOpen: boolean;
  conversationId: string | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  isSending: boolean;
}

export interface RealtimeBroadcastPayload {
  new: ChatMessage;
  old?: Partial<ChatMessage>;
}
