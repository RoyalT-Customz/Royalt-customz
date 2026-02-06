'use client'

import React, { useState } from 'react'
import { X, Hash, Lock, Loader2 } from 'lucide-react'

interface CreateChannelModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateChannelModal({ isOpen, onClose, onSuccess }: CreateChannelModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Channel name is required')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      const response = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          isPrivate,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setName('')
        setDescription('')
        setIsPrivate(false)
        onSuccess()
        onClose()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to create channel')
      }
    } catch (error) {
      console.error('Error creating channel:', error)
      setError('Failed to create channel')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800/50 shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-primary-900/20 via-primary-800/10 to-transparent">
          <h3 className="text-lg font-bold text-white">Create Channel</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Channel Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Channel Name
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="e.g. general"
                maxLength={50}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800/50 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:bg-gray-900 transition-all"
                required
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Channel names must be lowercase and contain no spaces
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description <span className="text-gray-600 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              maxLength={200}
              rows={3}
              className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-800/50 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:bg-gray-900 transition-all resize-none"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              {description.length}/200
            </p>
          </div>

          {/* Privacy Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg border border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-600/20 flex items-center justify-center border border-primary-500/30">
                <Lock className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Private Channel</div>
                <div className="text-xs text-gray-500">Only selected members can view this channel</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                isPrivate ? 'bg-primary-600' : 'bg-gray-700'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  isPrivate ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-900/50 hover:bg-gray-900/70 text-gray-300 rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Channel'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

