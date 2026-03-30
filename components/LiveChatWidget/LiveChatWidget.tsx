'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChatInput } from '@/components/ui/chat/ChatInput'
import { MessageBubble } from '@/components/ui/chat/MessageBubble'

import { ChatMessage, RealtimeBroadcastPayload } from './types'

export function LiveChatWidget() {
  const supabaseRef = useRef(createClient())
  const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null)
  const visitorIdRef = useRef<string | null>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sentMessageIdsRef = useRef<Set<string>>(new Set())

  const supabase = supabaseRef.current

  // Get or create visitor ID from localStorage
  const getVisitorId = useCallback((): string => {
    if (visitorIdRef.current) return visitorIdRef.current

    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('chat_visitor_id') : null
      if (stored) {
        visitorIdRef.current = stored
        return stored
      }
    } catch (e) {
      console.warn('localStorage not available:', e)
    }

    const newId = crypto.randomUUID()
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_visitor_id', newId)
      }
    } catch (e) {
      console.warn('Failed to save visitor ID:', e)
    }

    visitorIdRef.current = newId
    return newId
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Get or create conversation
  const ensureConversationExists = useCallback(
    async (userId: string) => {
      if (conversationId) return conversationId

      try {
        const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
        const referrerUrl = typeof document !== 'undefined' ? document.referrer : ''

        // Check if conversation already exists for this user
        const { data: existingConv, error: fetchError } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('visitor_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (existingConv && !fetchError) {
          setConversationId(existingConv.id)
          return existingConv.id
        }

        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('chat_conversations')
          .insert({
            visitor_user_id: userId,
            page_url: pageUrl,
            referrer_url: referrerUrl,
          })
          .select('id')
          .single()

        if (createError) {
          setError('Failed to create chat session')
          throw createError
        }

        setConversationId(newConv.id)
        return newConv.id
      } catch (err) {
        console.error('Failed to ensure conversation:', err)
        setError('Unable to connect to chat service')
        return null
      }
    },
    [conversationId, supabase]
  )

  // Fetch initial messages
  const fetchMessages = useCallback(
    async (convId: string) => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('conversation_id', convId)
          .order('created_at', { ascending: true })

        if (fetchError) throw fetchError

        setMessages(data || [])
        // Track sent messages to avoid duplicates on realtime
        ;(data || []).forEach((msg: ChatMessage) => {
          if (msg.client_message_id) {
            sentMessageIdsRef.current.add(msg.client_message_id)
          }
        })
      } catch (err) {
        console.error('Failed to fetch messages:', err)
        setError('Failed to load messages')
      } finally {
        setLoading(false)
      }
    },
    [supabase]
  )

  // Handle realtime message broadcast
  const handleRealtimeMessage = useCallback(
    (payload: RealtimeBroadcastPayload) => {
      const newMessage = payload.new

      // Skip if this is our own message (already added optimistically)
      if (newMessage.client_message_id && sentMessageIdsRef.current.has(newMessage.client_message_id)) {
        return
      }

      // Add message from broadcast (admin or other user)
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === newMessage.id)
        if (exists) return prev
        return [...prev, newMessage]
      })
    },
    []
  )

  // Subscribe to realtime messages
  const subscribeToRealtime = useCallback(
    (convId: string) => {
      // Unsubscribe from previous channel if exists
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }

      // Note: The Supabase SSR client automatically handles Realtime auth using the session token.
      // No manual setAuth() call needed—the session is automatically synced to Realtime.
      const channel = supabase
        .channel(`chat:${convId}`)
        .on(
          'broadcast',
          { event: 'INSERT' },
          (payload: { payload: RealtimeBroadcastPayload }) => {
            handleRealtimeMessage(payload.payload)
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to chat channel:', convId)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('Channel subscription error')
            setError('Real-time connection failed')
          }
        })

      channelRef.current = channel
    },
    [supabase, handleRealtimeMessage]
  )

  // Open widget and initialize
  const handleOpen = useCallback(async () => {
    if (isOpen) return

    try {
      setError(null)
      setLoading(true)

      const userId = getVisitorId()
      const convId = await ensureConversationExists(userId)

      if (!convId) {
        setLoading(false)
        return
      }

      // Fetch initial messages
      await fetchMessages(convId)

      // Subscribe to realtime
      subscribeToRealtime(convId)

      setIsOpen(true)
    } catch (err) {
      console.error('Failed to open chat:', err)
      setError('Failed to open chat')
    } finally {
      setLoading(false)
    }
  }, [isOpen, ensureConversationExists, fetchMessages, subscribeToRealtime, getVisitorId])

  // Send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !content.trim() || isSending) return

      try {
        setIsSending(true)
        setError(null)

        const userId = getVisitorId()
        const clientMessageId = crypto.randomUUID()
        const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

        // Optimistic update
        const optimisticMessage: ChatMessage = {
          id: clientMessageId, // Temporary ID
          conversation_id: conversationId,
          user_id: userId,
          user_role: 'user',
          content,
          message_type: 'text',
          page_url: pageUrl,
          client_message_id: clientMessageId,
          created_at: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, optimisticMessage])
        sentMessageIdsRef.current.add(clientMessageId)
        scrollToBottom()

        // Insert message to database
        const { error: insertError } = await supabase.from('chat_messages').insert({
          conversation_id: conversationId,
          content: content.trim(),
          message_type: 'text',
          user_id: userId,
          user_role: 'user',
          page_url: pageUrl,
          client_message_id: clientMessageId,
        })

        if (insertError) {
          // Remove optimistic message on error
          setMessages((prev) => prev.filter((m) => m.client_message_id !== clientMessageId))
          sentMessageIdsRef.current.delete(clientMessageId)
          setError('Failed to send message. Please try again.')
          console.error('Insert error:', insertError)
        }
      } catch (err) {
        console.error('Failed to send message:', err)
        setError('Failed to send message')
      } finally {
        setIsSending(false)
      }
    },
    [conversationId, isSending, supabase, scrollToBottom, getVisitorId]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
      }
    }
  }, [])

  // Close handler
  const handleClose = useCallback(() => {
    setIsOpen(false)
    setError(null)
  }, [])

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={handleOpen}
        className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow'
        size='icon'
        aria-label='Open live chat'
      >
        <img
          src='/vectors/icons/livechat.png'
          alt='Live chat'
          className='h-6 w-6'
        />
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <div className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100vw-1rem)] sm:w-96'>
          <Card className='flex flex-col h-[500px] sm:h-[600px] rounded-lg border shadow-2xl'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b bg-background'>
              <h2 className='text-lg font-semibold'>Live Chat Support</h2>
              <button
                onClick={handleClose}
                className='text-gray-400 hover:text-white transition-colors p-1'
                aria-label='Close chat'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            {/* Messages Container */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30'>
              {loading ? (
                <div className='flex items-center justify-center h-full text-muted-foreground'>
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className='flex items-center justify-center h-full text-muted-foreground text-sm'>
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg: ChatMessage) => (
                  <MessageBubble
                    key={msg.id}
                    message={{
                      message: msg.content,
                      is_staff: msg.user_role === 'admin',
                      created_at: msg.created_at,
                      user_id: msg.user_id,
                    }}
                    className='text-sm'
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Error Message */}
            {error && (
              <div className='px-4 py-2 bg-destructive/10 text-destructive text-xs rounded-sm'>
                {error}
              </div>
            )}

            {/* Input */}
            <ChatInput
              onSend={handleSendMessage}
              disabled={isSending || !conversationId || !!error}
              placeholder='Type your message...'
            />
          </Card>
        </div>
      )}
    </>
  )
}
