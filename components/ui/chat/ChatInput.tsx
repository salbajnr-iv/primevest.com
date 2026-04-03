"use client"

import * as React from 'react';
import { Button } from "../button";
import { Input } from "../input";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ChatInput({ onSend, disabled, placeholder = "Type a message...", className }: ChatInputProps) {
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex gap-2 p-4 border-t bg-background", className)}>
      <Input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 min-h-[44px] flex items-center"
      />
      <Button type="submit" size="icon" variant="outline" disabled={!input.trim() || disabled}>
<ArrowRight className="h-4 w-4 rotate-45" />
      </Button>
    </form>
  );
}
