'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, CheckCheck, Loader2 } from 'lucide-react'
import { getUserDisplayName } from '@/lib/user-display'

interface ReadReceiptsProps {
  messageId: string
  userId: string
  currentUserId: string
}

interface ReadReceipt {
  userId: string
  username: string
  avatarUrl: string
  displayName: string
  readAt: string
}

export default function ReadReceipts({ messageId, userId, currentUserId }: ReadReceiptsProps) {
  const [receipts, setReceipts] = useState<ReadReceipt[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchReceipts()
    }
  }, [isOpen, messageId])

  const fetchReceipts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chat/read-receipts?messageId=${messageId}`)
      if (response.ok) {
        const data = await response.json()
        setReceipts(data.receipts || [])
      }
    } catch (error) {
      console.error('Error fetching read receipts:', error)
    } finally {
      setIsLoading(false)
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

  // Only show for messages sent by current user
  if (userId !== currentUserId) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-400 transition-colors"
        title="Read receipts"
      >
        {receipts.length > 0 ? (
          <>
            <CheckCheck className="w-3.5 h-3.5 text-primary-400" />
            <span>{receipts.length}</span>
          </>
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-gray-800/50 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-800/50">
              <h4 className="text-sm font-bold text-white">Read by</h4>
            </div>
            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                </div>
              ) : receipts.length === 0 ? (
                <div className="text-center py-4 text-xs text-gray-500">
                  No reads yet
                </div>
              ) : (
                <div className="space-y-1.5">
                  {receipts.map((receipt) => (
                    <div
                      key={receipt.userId}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-900/50 transition-colors"
                    >
                      <div className="relative w-6 h-6 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700">
                        <Image
                          src={receipt.avatarUrl}
                          alt={receipt.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          {getUserDisplayName({
                            username: receipt.username,
                            full_name: receipt.displayName,
                          } as any)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(receipt.readAt)}
                        </div>
                      </div>
                      <CheckCheck className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

