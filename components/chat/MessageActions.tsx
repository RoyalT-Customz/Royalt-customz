'use client'

import React, { useState } from 'react'
import { MoreVertical, Edit, Trash2, Copy, Flag, Pin, Reply } from 'lucide-react'

interface MessageActionsProps {
  messageId: string
  userId: string
  currentUserId: string
  currentUserRole?: string
  onEdit: () => void
  onDelete: () => void
  onCopy: () => void
  onReact?: () => void
  onPin?: () => void
  onReply?: () => void
  position?: 'left' | 'right'
}

export default function MessageActions({
  messageId,
  userId,
  currentUserId,
  currentUserRole,
  onEdit,
  onDelete,
  onCopy,
  onReact,
  onPin,
  onReply,
  position = 'right',
}: MessageActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const isOwner = userId === currentUserId
  const isAdmin = currentUserRole === 'admin'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute ${position === 'right' ? 'right-0' : 'left-0'} top-full mt-1 w-56 bg-[#1a1a1a] border border-gray-800/50 rounded-lg shadow-2xl z-50 py-1`}
          >
            {onReact && (
              <button
                onClick={() => {
                  onReact()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-900/50 flex items-center gap-2.5 transition-colors"
              >
                <span className="text-base">😀</span>
                Add Reaction
              </button>
            )}
            {onReply && (
              <button
                onClick={() => {
                  onReply()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-900/50 flex items-center gap-2.5 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Reply in Thread
              </button>
            )}
            {onCopy && (
              <button
                onClick={() => {
                  onCopy()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-900/50 flex items-center gap-2.5 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Text
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => {
                  onEdit()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-900/50 flex items-center gap-2.5 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Message
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => {
                  onDelete()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete Message
              </button>
            )}
            {isAdmin && !isOwner && (
              <button
                onClick={() => {
                  onDelete()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete (Admin)
              </button>
            )}
            {onPin && (isAdmin || isOwner) && (
              <button
                onClick={() => {
                  onPin()
                  setIsOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-900/50 flex items-center gap-2.5 transition-colors"
              >
                <Pin className="w-4 h-4" />
                Pin Message
              </button>
            )}
            {!isOwner && (
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-900/50 flex items-center gap-2.5 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Report
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

