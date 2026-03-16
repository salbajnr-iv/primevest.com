"use client"

import { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { MessageBubble } from './MessageBubble';
import { RealtimeReply } from '@/lib/supabase/realtime';

interface MessageListProps {
  messages: RealtimeReply[];
  currentUserId?: string;
  className?: string;
}

export function MessageList({ messages, currentUserId, className }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className={cn(
        "flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300",
        className
      )}
    >
      {messages.map((msg) => (
        <MessageBubble 
          key={msg.id} 
          message={{
            message: msg.message,
            is_staff: msg.is_staff,
            created_at: msg.created_at,
            user_id: msg.user_id,
          }} 
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
