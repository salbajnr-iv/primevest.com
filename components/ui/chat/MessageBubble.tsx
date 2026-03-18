"use client"

import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: {
    message: string;
    is_staff: boolean;
    created_at: string;
    user_id?: string;
  };
  currentUserId?: string;
  className?: string;
}

export function MessageBubble({ message, currentUserId, className }: MessageBubbleProps) {
  const isOwn = message.user_id === currentUserId;
  const isStaff = message.is_staff;
const time = formatDistanceToNow(new Date(message.created_at));

  return (
    <div className={cn(
      "group flex flex-col",
      isOwn ? "items-end" : "items-start",
      className
    )}>
      <div className={cn(
        "flex items-end gap-2 max-w-[70%] p-3 rounded-2xl",
        isOwn ? "bg-blue-500 text-white rounded-br-sm" : "bg-gray-200 rounded-bl-sm",
        isStaff && !isOwn && "bg-green-500 text-white rounded-bl-sm"
      )}>
        {!isOwn && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${encodeURIComponent(message.user_id || 'Support')}`} />
            <AvatarFallback>
              {message.user_id?.slice(0,2).toUpperCase() || 'S'}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col gap-1">
          <p className="text-sm leading-relaxed">{message.message}</p>
          <small className="opacity-70 text-xs">{time}</small>
        </div>
      </div>
    </div>
  );
}
