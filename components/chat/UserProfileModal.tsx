'use client'

import React from 'react'
import Image from 'next/image'
import { X, Mail, Calendar, Shield, User as UserIcon } from 'lucide-react'
import { getUserDisplayName } from '@/lib/user-display'

interface UserProfileModalProps {
  user: {
    id: string
    username: string
    avatar_url?: string
    first_name?: string
    last_name?: string
    full_name?: string
    email?: string
    role?: string
    created_at?: string
    bio?: string
  }
  isOpen: boolean
  onClose: () => void
  onMessage?: () => void
}

export default function UserProfileModal({ user, isOpen, onClose, onMessage }: UserProfileModalProps) {
  if (!isOpen) return null

  const avatarUrl = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=CE1141&color=fff&bold=true`
  const displayName = getUserDisplayName(user)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800/50 shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-primary-600/20 to-primary-500/10 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar */}
        <div className="relative -mt-16 px-6 pb-6">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#1a1a1a] shadow-xl">
            <Image
              src={avatarUrl}
              alt={user.username}
              fill
              className="object-cover"
            />
          </div>

          {/* User Info */}
          <div className="mt-4">
            <h2 className="text-xl font-bold text-white mb-1">{displayName}</h2>
            <p className="text-sm text-gray-400 mb-4">@{user.username}</p>

            {user.bio && (
              <p className="text-sm text-gray-300 mb-4">{user.bio}</p>
            )}

            <div className="space-y-2">
              {user.email && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}

              {user.created_at && (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              )}

              {user.role === 'admin' && (
                <div className="flex items-center gap-2 text-sm text-primary-400">
                  <Shield className="w-4 h-4" />
                  <span>Administrator</span>
                </div>
              )}
            </div>

            {onMessage && (
              <button
                onClick={onMessage}
                className="mt-6 w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary-600/20"
              >
                Send Message
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

