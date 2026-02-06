'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Reply, Loader2 } from 'lucide-react'
import { getUserDisplayName } from '@/lib/user-display'
import { processMessageText } from '@/lib/chat-utils'

interface MessageThreadProps {
  messageId: string
  roomId: string
  isOpen: boolean
  onClose: () => void
  currentUserId: string
}

interface ThreadMessage {
  id: string
  userId: string
  username: string
  avatarUrl: string
  displayName: string
  message: string
  replyToMessageId: string | null
  createdAt: string
}

export default function MessageThread({
  messageId,
  roomId,
  isOpen,
  onClose,
  currentUserId,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (isOpen && messageId) {
      fetchThreadMessages()
    }
  }, [isOpen, messageId])

  const fetchThreadMessages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chat/threads?messageId=${messageId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Error fetching thread messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || isSending) return

    setIsSending(true)
    try {
      const response = await fetch('/api/chat/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          message: replyText.trim(),
          roomId,
          isThreadStart: messages.length === 0,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [...prev, data.message])
        setReplyText('')
        fetchThreadMessages() // Refresh to get all messages
      }
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800/50 shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-primary-900/20 via-primary-800/10 to-transparent">
          <div className="flex items-center gap-3">
            <Reply className="w-5 h-5 text-primary-400" />
            <h3 className="text-lg font-bold text-white">Thread</h3>
            <span className="text-xs text-gray-500 bg-gray-900/50 px-2 py-1 rounded-full">
              {messages.length} {messages.length === 1 ? 'reply' : 'replies'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Reply className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-sm font-semibold text-white mb-1">No replies yet</p>
              <p className="text-xs">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-3 group">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700">
                  <Image
                    src={msg.avatarUrl}
                    alt={msg.username}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-semibold text-white hover:text-primary-400 cursor-pointer transition-colors">
                      {getUserDisplayName({
                        username: msg.username,
                        full_name: msg.displayName,
                      } as any)}
                    </span>
                    <span className="text-xs text-gray-600">{formatTime(msg.createdAt)}</span>
                  </div>
                  <div
                    className="text-sm text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: processMessageText(msg.message, []),
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Input */}
        <div className="px-4 py-3 border-t border-gray-800/50 bg-[#0d0d0d]">
          <form onSubmit={handleSendReply} className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Reply to thread..."
                rows={2}
                maxLength={2000}
                className="w-full px-3 py-2 bg-gray-900/50 border border-gray-800/50 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary-500/50 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={!replyText.trim() || isSending}
              className="p-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Reply className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

