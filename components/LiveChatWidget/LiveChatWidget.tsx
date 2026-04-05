'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChatInput } from '@/components/ui/chat/ChatInput'
import { MessageBubble } from '@/components/ui/chat/MessageBubble'

import { ChatMessage } from './types'

const SUPPORT_QUESTIONS_DATA = [
  { id: '1', question: 'Need help choosing the right product for your goals?' },
  { id: '2', question: 'Have questions about deposits, withdrawals, or fees?' },
  { id: '3', question: 'Need guidance with your PrimeVest account setup?' },
]

const floatingStyle = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0px) scale(1); }
    50% { transform: translateY(-10px) scale(1.03); }
  }
  @keyframes pulse-ring {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    50% { box-shadow: 0 0 0 16px rgba(59, 130, 246, 0); }
  }
  @keyframes slideIn {
    from { transform: translateX(100px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100px); opacity: 0; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  .animate-float {
    animation: bounce 3s ease-in-out infinite;
  }
  .animate-pulse-ring {
    animation: pulse-ring 2s infinite;
  }
  .animate-slide-in {
    animation: slideIn 0.5s ease-out;
  }
  .animate-slide-out {
    animation: slideOut 0.5s ease-in;
  }
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }
`

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
  const [showPopup, setShowPopup] = useState(false)
  const [hidePopup, setHidePopup] = useState(false)
  const [supportQuestions, setSupportQuestions] = useState<{ id: string; question: string; visible: boolean }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sentMessageIdsRef = useRef<Set<string>>(new Set())

  const supabase = supabaseRef.current

  // Test Supabase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('[LiveChat] Testing Supabase connection...')
        const { data, error } = await supabase
          .from('chat_conversations')
          .select('id')
          .limit(1)
        
        if (error) {
          console.error('[LiveChat] Connection test failed:', error)
          return
        }
        console.log('[LiveChat] Connection test passed. Data:', data)
      } catch (err) {
        console.error('[LiveChat] Connection test error:', err)
      }
    }

    testConnection()
  }, [supabase])

  // Show popup messages on mount with staggered timing
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    // Show welcome popup after 2 seconds
    timers.push(
      setTimeout(() => {
        setShowPopup(true)
      }, 2000)
    )

    // Hide welcome popup after 8 seconds
    timers.push(
      setTimeout(() => {
        setHidePopup(true)
      }, 8000)
    )

    // Show support questions with staggered timing
    SUPPORT_QUESTIONS_DATA.forEach((q, index) => {
      timers.push(
        setTimeout(() => {
          setSupportQuestions((prev) => [
            ...prev,
            { ...q, visible: true },
          ])
        }, 9500 + index * 3000) // Start after welcome popup, then 3s apart
      )
    })

    // Hide each support question after 4 seconds
    SUPPORT_QUESTIONS_DATA.forEach((q, index) => {
      timers.push(
        setTimeout(() => {
          setSupportQuestions((prev) =>
            prev.map((qq) =>
              qq.id === q.id ? { ...qq, visible: false } : qq
            )
          )
        }, 13000 + index * 3000)
      )
    })

    return () => {
      timers.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  // Get the authenticated user's ID from Supabase — required for RLS on chat tables
  const getVisitorId = useCallback(async (): Promise<string | null> => {
    if (visitorIdRef.current) return visitorIdRef.current

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.id) {
        visitorIdRef.current = user.id
        return user.id
      }
      console.warn('[LiveChat] User not authenticated — chat requires sign-in')
      return null
    } catch (e) {
      console.error('[LiveChat] Failed to get authenticated user:', e)
      return null
    }
  }, [supabase])

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
      if (conversationId) {
        console.log('[LiveChat] Using existing conversation ID:', conversationId)
        return conversationId
      }

      try {
        const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
        const referrerUrl = typeof document !== 'undefined' ? document.referrer : ''

        console.log('[LiveChat] Checking for existing conversation for user:', userId)

        // Check if conversation already exists for this user
        const { data: existingConv, error: fetchError } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('visitor_user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)

        console.log('[LiveChat] Fetch result:', { existingConv, fetchError })

        // .single() error is expected if no row exists, so we handle it gracefully
        if (existingConv && existingConv.length > 0) {
          console.log('[LiveChat] Found existing conversation:', existingConv[0].id)
          setConversationId(existingConv[0].id)
          return existingConv[0].id
        }

        console.log('[LiveChat] No existing conversation found, creating new one')

        // Create new conversation
        const { data: newConv, error: createError, status, statusText } = await supabase
          .from('chat_conversations')
          .insert({
            visitor_user_id: userId,
            page_url: pageUrl,
            referrer_url: referrerUrl,
          })
          .select('id')

        console.log('[LiveChat] Insert result:', { newConv, createError, status, statusText })

        if (createError) {
          console.error('[LiveChat] Supabase insert error details:', {
            message: createError.message || 'Unknown error',
            details: createError.details || 'No details provided',
            hint: createError.hint || 'No hint',
            code: createError.code || 'No code',
            status: status || 'No status',
            statusText: statusText || 'No status text',
            errorObject: JSON.stringify(createError),
          })
          setError('Failed to create chat session. Check browser console for details.')
          throw createError
        }

        if (!newConv || newConv.length === 0) {
          console.error('[LiveChat] Insert succeeded but no data returned', {
            newConv,
            dataLength: newConv?.length,
          })
          throw new Error('No conversation data returned from insert')
        }

        console.log('[LiveChat] Created new conversation:', newConv[0].id)
        setConversationId(newConv[0].id)
        return newConv[0].id
      } catch (err: any) {
        console.error('[LiveChat] Failed to ensure conversation - Full error details:', {
          message: err?.message || 'No message',
          details: err?.details || 'No details',
          hint: err?.hint || 'No hint',
          code: err?.code || 'No code',
          status: err?.status || 'No status',
          statusText: err?.statusText || 'No status text',
          stack: err?.stack || 'No stack trace',
          toString: err?.toString?.() || 'No toString',
          keys: Object.keys(err || {}),
          fullError: JSON.stringify(err),
        })
        setError('Unable to connect to chat service. Check browser console and check RLS policies on chat_conversations table.')
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

  // Handle realtime postgres_changes events
  const handleRealtimeMessage = useCallback(
    (event: string, payload: any) => {
      console.log(`[LiveChat] Realtime ${event} event received`, payload)

      switch (event) {
        case 'INSERT': {
          const newMessage = payload.new as ChatMessage
          if (!newMessage?.id) {
            console.warn('[LiveChat] INSERT event missing new data', payload)
            return
          }

          // Skip if this is our own message (already added optimistically)
          if (newMessage.client_message_id && sentMessageIdsRef.current.has(newMessage.client_message_id)) {
            // Replace optimistic message with the real DB record (gets a real UUID id)
            setMessages((prev) =>
              prev.map((m) =>
                m.client_message_id === newMessage.client_message_id ? newMessage : m
              )
            )
            return
          }

          console.log('[LiveChat] Adding new message from DB:', newMessage.id)
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMessage.id)
            if (exists) return prev
            return [...prev, newMessage]
          })
          break
        }

        case 'UPDATE': {
          const updatedMessage = payload.new as ChatMessage
          if (!updatedMessage?.id) {
            console.warn('[LiveChat] UPDATE event missing new data', payload)
            return
          }

          console.log('[LiveChat] Updating message:', updatedMessage.id)
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m))
          )
          break
        }

        case 'DELETE': {
          const deletedMessage = payload.old as Partial<ChatMessage>
          if (!deletedMessage?.id) {
            console.warn('[LiveChat] DELETE event missing old data', payload)
            return
          }

          console.log('[LiveChat] Deleting message:', deletedMessage.id)
          setMessages((prev) => prev.filter((m) => m.id !== deletedMessage.id))
          break
        }

        default:
          console.warn('[LiveChat] Unknown event type:', event)
      }
    },
    []
  )

  // Subscribe to realtime messages using postgres_changes on chat_messages table
  const subscribeToRealtime = useCallback(
    (convId: string) => {
      // Unsubscribe from previous channel if exists
      if (channelRef.current) {
        console.log('[LiveChat] Unsubscribing from previous channel')
        channelRef.current.unsubscribe()
      }

      console.log('[LiveChat] Subscribing to postgres_changes for conversation:', convId)

      const channel = supabase
        .channel(`chat-messages:${convId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'chat_messages',
            filter: `conversation_id=eq.${convId}`,
          },
          (payload: any) => {
            console.log('[LiveChat] postgres_changes event:', payload.eventType, payload)
            handleRealtimeMessage(payload.eventType, payload)
          }
        )
        .subscribe((status: string) => {
          console.log('[LiveChat] Subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('[LiveChat] ✓ Subscribed to chat_messages postgres_changes for:', convId)
          } else if (status === 'CHANNEL_ERROR') {
            console.error('[LiveChat] ✗ Channel subscription error')
            setError('Real-time connection failed. Please refresh and try again.')
          } else if (status === 'TIMED_OUT') {
            console.error('[LiveChat] ✗ Channel subscription timed out')
            setError('Real-time connection timed out. Please refresh.')
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
      console.log('[LiveChat] Opening chat widget...')
      setError(null)
      setLoading(true)
      setIsOpen(true) // Open UI immediately so user sees something

      const userId = await getVisitorId()
      console.log('[LiveChat] Visitor ID:', userId)

      if (!userId) {
        setError('Please sign in to use the chat.')
        setLoading(false)
        return
      }

      const convId = await ensureConversationExists(userId)
      console.log('[LiveChat] Conversation ID:', convId)

      if (!convId) {
        console.warn('[LiveChat] Failed to get conversation ID')
        setError('Unable to start conversation. Please try refreshing.')
        return
      }

      setConversationId(convId)
      console.log('[LiveChat] Fetching messages...')

      // Fetch initial messages
      await fetchMessages(convId)

      // Subscribe to realtime
      console.log('[LiveChat] Subscribing to realtime...')
      subscribeToRealtime(convId)

      console.log('[LiveChat] Chat widget open and ready')
    } catch (err) {
      console.error('[LiveChat] Error in handleOpen:', err)
      setError(`Error: ${err instanceof Error ? err.message : 'Failed to open chat'}`)
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

        const userId = await getVisitorId()
        if (!userId) {
          setError('Please sign in to send messages.')
          return
        }

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
          console.error('Message insert error:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code,
          })
          setError('Failed to send message. Check permissions.')
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
      <style>{floatingStyle}</style>

      {/* Welcome Popup Message */}
      {showPopup && !hidePopup && (
        <div className={`fixed bottom-24 right-4 sm:bottom-32 sm:right-6 z-40 ${hidePopup ? 'animate-slide-out' : 'animate-slide-in'}`}>
          <div className='bg-white text-slate-900 rounded-2xl shadow-2xl p-4 max-w-xs border border-slate-200'>
            <div className='flex items-center gap-2 mb-1'>
              <span className='inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500' />
              <p className='text-sm font-semibold'>PrimeVest Support is online</p>
            </div>
            <p className='text-xs text-slate-600'>Need help? Click chat to get quick support from our team.</p>
          </div>
        </div>
      )}

      {/* Support Questions Stack */}
      <div className='fixed bottom-24 right-4 sm:bottom-32 sm:right-6 z-30 space-y-3 max-w-xs'>
        {supportQuestions.map((item) => (
          <div
            key={item.id}
            className={`transform transition-all duration-500 ${
              item.visible ? 'animate-fade-in opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
            }`}
          >
            <button
              onClick={handleOpen}
              className='w-full text-left bg-white text-slate-700 rounded-xl shadow-md p-3 hover:shadow-lg hover:bg-slate-50 transition-all text-sm font-medium border border-slate-200'
            >
              {item.question}
            </button>
          </div>
        ))}
      </div>

      {/* Floating Button - Only show when chat is closed */}
      {!isOpen && (
        <Button
          onClick={handleOpen}
          className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 animate-float animate-pulse-ring z-40 pointer-events-auto bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/60'
          size='icon'
          aria-label='Open live chat'
        >
          <img
            src='/vectors/icons/livechat.png'
            alt='Live chat'
            className='h-6 w-6'
          />
        </Button>
      )}

      {/* Chat Modal */}
      {isOpen && (
        <div className='fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-sm w-[calc(100vw-1rem)] sm:w-[25rem] animate-slide-in'>
          <Card className='flex flex-col h-[560px] sm:h-[640px] rounded-2xl border border-slate-200 shadow-2xl bg-white overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 text-white'>
              <div>
                <h2 className='text-base font-semibold'>Live Chat Support</h2>
                <p className='text-xs text-slate-200'>Average response time: under 2 minutes</p>
              </div>
              <button
                onClick={handleClose}
                className='text-slate-300 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10'
                aria-label='Close chat'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            {/* Error Message - Prominent Display */}
            {error && (
              <div className='px-4 py-3 bg-red-50 border-b border-red-200'>
                <p className='text-sm font-medium text-red-800 mb-2'>{error}</p>
                <button
                  onClick={handleOpen}
                  className='text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors'
                >
                  Retry
                </button>
              </div>
            )}

            {/* Messages Container */}
            <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white'>
              {error && !conversationId ? (
                <div className='flex items-center justify-center h-full text-center'>
                  <div>
                    <p className='text-muted-foreground mb-2'>Unable to connect to chat service</p>
                    <p className='text-xs text-muted-foreground mb-4'>Check your internet connection and try again</p>
                    <button
                      onClick={handleOpen}
                      className='text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : loading ? (
                <div className='flex items-center justify-center h-full text-muted-foreground'>
                  <p>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className='flex items-center justify-center h-full text-center'>
                  <div className='max-w-[18rem]'>
                    <div className='mx-auto mb-3 h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold'>
                      PV
                    </div>
                    <p className='text-slate-900 text-sm font-semibold mb-1'>Welcome to PrimeVest support</p>
                    <p className='text-slate-500 text-xs'>Tell us what you need and we&apos;ll connect you with the right specialist.</p>
                  </div>
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

            {/* Input */}
            <ChatInput
              onSend={handleSendMessage}
              disabled={isSending || !conversationId || !!error}
              placeholder={error ? 'Fix the error above to chat' : 'Type your message...'}
            />
          </Card>
        </div>
      )}
    </>
  )
}
