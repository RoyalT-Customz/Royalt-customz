'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { io, Socket } from 'socket.io-client'
import {
  Send,
  Loader2,
  Users,
  MessageSquare,
  AlertCircle,
  X,
  Hash,
  Settings,
  LogOut,
  User,
  Mic,
  Headphones,
  MoreVertical,
  ChevronDown,
  Home,
  Shield,
  Bell,
  Search,
  Plus,
  Smile,
  Paperclip,
  AtSign,
  Pin,
} from 'lucide-react'
import { getUserDisplayName } from '@/lib/user-display'
import EmojiPicker from '@/components/chat/EmojiPicker'
import MessageActions from '@/components/chat/MessageActions'
import FileUpload from '@/components/chat/FileUpload'
import UserProfileModal from '@/components/chat/UserProfileModal'
import MessageThread from '@/components/chat/MessageThread'
import CreateChannelModal from '@/components/chat/CreateChannelModal'
import { processMessageText, extractMentions } from '@/lib/chat-utils'

interface ChatMessage {
  id: string
  roomId: string
  userId: string
  username: string
  avatarUrl: string
  displayName: string
  message: string
  edited: boolean
  editedAt: string | null
  deleted: boolean
  createdAt: string
  attachments?: Array<{ id: string; name: string; url: string; type: string; size: number }>
  reactions?: Array<{ emoji: string; count: number; users: string[] }>
}

interface ChatRoom {
  id: string
  name: string
  description: string | null
  isPrivate: boolean
  messageCount: number
}

interface User {
  id: string
  username: string
  avatar_url?: string
  first_name?: string
  last_name?: string
  full_name?: string
  role?: string
}

interface GroupedMessage extends ChatMessage {
  isGrouped: boolean
  showAvatar: boolean
  showTimestamp: boolean
}

export default function RTChatPage() {
  const [user, setUser] = useState<User | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [currentRoom, setCurrentRoom] = useState<string>('general')
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [showMembers, setShowMembers] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<Array<ChatMessage & { roomName?: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ name: string; type: string; size: number; url: string }>>([])
  const [messageReactions, setMessageReactions] = useState<Record<string, Array<{ emoji: string; count: number; users: string[] }>>>({})
  const [dms, setDms] = useState<any[]>([])
  const [currentDM, setCurrentDM] = useState<string | null>(null)
  const [dmMessages, setDmMessages] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([])
  const [showPinned, setShowPinned] = useState(false)
  const [showChannelCreate, setShowChannelCreate] = useState(false)
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([])
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [threadMessageId, setThreadMessageId] = useState<string | null>(null)
  const [showThread, setShowThread] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const editInputRef = useRef<HTMLTextAreaElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Fetch current user and verify authentication
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser(data.user)
            setIsAuthenticated(true)
            setOnlineUsers((prev) => {
              const newSet = new Set(prev)
              newSet.add(data.user.id)
              return newSet
            })
          } else {
            window.location.href = '/login?redirect=/rt-chat'
          }
        } else {
          window.location.href = '/login?redirect=/rt-chat'
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        window.location.href = '/login?redirect=/rt-chat'
      }
    }
    fetchUser()
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Initialize Socket.io connection
  useEffect(() => {
    if (!user) return

    const socketUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    const newSocket = io(socketUrl, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
    })

    newSocket.on('connect', () => {
      console.log('Connected to Socket.io')
      newSocket.emit('join-room', currentRoom)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Socket.io')
    })

    newSocket.on('message-received', (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) {
          return prev
        }
        return [...prev, message]
      })
      // Fetch reactions for new message
      fetchReactions(message.id)
    })

    newSocket.on('user-joined', (data: { socketId: string; userId?: string }) => {
      if (data.userId) {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev)
          newSet.add(data.userId!)
          return newSet
        })
      }
    })

    newSocket.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev)
        if (data.isTyping) {
          newSet.add(data.userId)
        } else {
          newSet.delete(data.userId)
        }
        return newSet
      })
    })

    newSocket.on('error', (error: { message: string }) => {
      setError(error.message)
    })

    setSocket(newSocket)

    return () => {
      newSocket.emit('leave-room', currentRoom)
      newSocket.disconnect()
    }
  }, [user, currentRoom])

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await fetch('/api/chat/rooms')
      if (response.ok) {
        const data = await response.json()
        setRooms(data.rooms || [])
      } else {
        if (response.status === 401) {
          window.location.href = '/login?redirect=/rt-chat'
        }
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(!showSearch)
        if (!showSearch) {
          setTimeout(() => searchInputRef.current?.focus(), 100)
        }
      }

      // Escape - Close modals
      if (e.key === 'Escape') {
        if (showSearch) setShowSearch(false)
        if (showUserProfile) {
          setShowUserProfile(false)
          setSelectedUser(null)
        }
        if (showThread) {
          setShowThread(false)
          setThreadMessageId(null)
        }
        if (showChannelCreate) setShowChannelCreate(false)
        if (showPinned) setShowPinned(false)
        if (showNotifications) setShowNotifications(false)
      }

      // Ctrl/Cmd + / - Show shortcuts help
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        alert(`Keyboard Shortcuts:
Ctrl/Cmd + K - Toggle search
Ctrl/Cmd + / - Show this help
Escape - Close modals
Enter - Send message
Shift + Enter - New line`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSearch, showUserProfile, showThread, showChannelCreate, showPinned, showNotifications])

  // Fetch DMs
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchDMs = async () => {
      try {
        const response = await fetch('/api/chat/dms')
        if (response.ok) {
          const data = await response.json()
          setDms(data.dms || [])
        }
      } catch (error) {
        console.error('Error fetching DMs:', error)
      }
    }
    fetchDMs()
  }, [isAuthenticated])

  // Fetch notifications
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/chat/notifications?unreadOnly=true')
        if (response.ok) {
          const data = await response.json()
          setNotifications(data.notifications || [])
          setUnreadNotifications(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // Fetch pinned messages
  useEffect(() => {
    if (!currentRoom) return

    const fetchPinned = async () => {
      try {
        const response = await fetch(`/api/chat/pinned?roomId=${currentRoom}`)
        if (response.ok) {
          const data = await response.json()
          setPinnedMessages(data.pinned || [])
        }
      } catch (error) {
        console.error('Error fetching pinned messages:', error)
      }
    }
    fetchPinned()
  }, [currentRoom])

  // Fetch messages when room changes
  useEffect(() => {
    if (!user) return

    if (currentRoom && !currentDM) {
      const fetchMessages = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/chat/messages?roomId=${currentRoom}`)
          if (response.ok) {
            const data = await response.json()
            setMessages(data.messages || [])
            // Fetch reactions for all messages
            data.messages.forEach((msg: ChatMessage) => {
              fetchReactions(msg.id)
            })
          } else {
            if (response.status === 401) {
              window.location.href = '/login?redirect=/rt-chat'
              return
            }
            setError('Failed to load messages')
          }
        } catch (error) {
          console.error('Error fetching messages:', error)
          setError('Error loading messages')
        } finally {
          setIsLoading(false)
        }
      }

      fetchMessages()

      if (socket) {
        socket.emit('leave-room', currentRoom)
        socket.emit('join-room', currentRoom)
      }
    } else if (currentDM && !currentRoom) {
      const fetchDMMessages = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/chat/dms/${currentDM}/messages`)
          if (response.ok) {
            const data = await response.json()
            setDmMessages(data.messages || [])
          }
        } catch (error) {
          console.error('Error fetching DM messages:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchDMMessages()
    }
  }, [currentRoom, currentDM, user, socket])

  // Fetch reactions for a message
  const fetchReactions = async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/reactions?messageId=${messageId}`)
      if (response.ok) {
        const data = await response.json()
        setMessageReactions((prev) => ({
          ...prev,
          [messageId]: data.reactions || [],
        }))
      }
    } catch (error) {
      console.error('Error fetching reactions:', error)
    }
  }

  // Group messages for better display
  const groupMessages = (msgs: ChatMessage[]): GroupedMessage[] => {
    if (msgs.length === 0) return []

    const grouped: GroupedMessage[] = []
    let lastUserId: string | null = null
    let lastTime: Date | null = null

    msgs.forEach((msg, index) => {
      const msgTime = new Date(msg.createdAt)
      const timeDiff = lastTime ? (msgTime.getTime() - lastTime.getTime()) / 1000 / 60 : Infinity
      const isSameUser = msg.userId === lastUserId
      const isWithinTime = timeDiff < 5

      const isGrouped = isSameUser && isWithinTime && index > 0

      grouped.push({
        ...msg,
        isGrouped,
        showAvatar: !isGrouped,
        showTimestamp: !isGrouped || timeDiff >= 5,
      })

      lastUserId = msg.userId
      lastTime = msgTime
    })

    return grouped
  }

  const groupedMessages = groupMessages(messages)

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!messageInput.trim() && attachments.length === 0) || !user || isSending) return

    setIsSending(true)
    setError('')

    try {
      if (currentDM) {
        // Send DM message
        const response = await fetch(`/api/chat/dms/${currentDM}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageInput.trim(),
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          if (response.status === 401) {
            window.location.href = '/login?redirect=/rt-chat'
            return
          }
          throw new Error(data.error || 'Failed to send message')
        }

        const data = await response.json()
        setDmMessages((prev) => [...prev, data.message])
        setMessageInput('')
        setAttachments([])
        if (inputRef.current) {
          inputRef.current.style.height = 'auto'
        }
        setIsSending(false)
        return
      }

      // Send channel message
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: currentRoom,
          message: messageInput.trim(),
          attachments: attachments,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 401) {
          window.location.href = '/login?redirect=/rt-chat'
          return
        }
        throw new Error(data.error || 'Failed to send message')
      }

      const data = await response.json()
      
      if (socket) {
        socket.emit('new-message', data.message)
      }

      setMessages((prev) => [...prev, data.message])
      setMessageInput('')
      setAttachments([])
      if (inputRef.current) {
        inputRef.current.style.height = 'auto'
      }
    } catch (error: any) {
      console.error('Error sending message:', error)
      setError(error.message || 'Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleEditMessage = async (messageId: string, newText: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newText }),
      })

      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, message: newText, edited: true, editedAt: new Date().toISOString() }
              : msg
          )
        )
        setEditingMessageId(null)
      }
    } catch (error) {
      console.error('Error editing message:', error)
      setError('Failed to edit message')
    }
  }

  const handleDeleteMessage = async (messageId: string, isAdmin = false) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      let response
      if (isAdmin && user?.role === 'admin') {
        response = await fetch(`/api/chat/moderate?messageId=${messageId}`, {
          method: 'DELETE',
        })
      } else {
        response = await fetch(`/api/chat/messages/${messageId}`, {
          method: 'DELETE',
        })
      }

      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      setError('Failed to delete message')
    }
  }

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text)
    // Could show a toast notification here
  }

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch('/api/chat/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId, emoji }),
      })

      if (response.ok) {
        fetchReactions(messageId)
      }
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/chat/search?q=${encodeURIComponent(query)}&roomId=${currentRoom || ''}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.messages || [])
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search input change with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/chat/search?q=${encodeURIComponent(searchQuery)}&roomId=${currentRoom || ''}`)
        if (response.ok) {
          const data = await response.json()
          setSearchResults(data.messages || [])
        }
      } catch (error) {
        console.error('Error searching:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, currentRoom])

  const handleEmojiSelect = (emoji: string) => {
    setMessageInput((prev) => prev + emoji)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Handle mention typing
  const handleMentionInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setMessageInput(value)

    // Check for @ mention
    const cursorPos = e.target.selectionStart
    const textBeforeCursor = value.substring(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
      fetchMentionSuggestions(mentionMatch[1])
      setShowMentions(true)
    } else {
      setShowMentions(false)
    }

    handleTyping()
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`
    }
  }

  const fetchMentionSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/chat/users?q=${encodeURIComponent(query)}&limit=5`)
      if (response.ok) {
        const data = await response.json()
        setMentionSuggestions(data.users || [])
      }
    } catch (error) {
      console.error('Error fetching mention suggestions:', error)
    }
  }

  const insertMention = (username: string) => {
    const cursorPos = inputRef.current?.selectionStart || 0
    const textBeforeCursor = messageInput.substring(0, cursorPos)
    const textAfterCursor = messageInput.substring(cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      const newText = textBeforeCursor.replace(/@\w*$/, `@${username} `) + textAfterCursor
      setMessageInput(newText)
      setShowMentions(false)
      if (inputRef.current) {
        inputRef.current.focus()
        setTimeout(() => {
          const newPos = cursorPos - mentionMatch[1].length + username.length + 2
          inputRef.current?.setSelectionRange(newPos, newPos)
        }, 0)
      }
    }
  }

  const handlePinMessage = async (messageId: string) => {
    try {
      const response = await fetch('/api/chat/pinned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, roomId: currentRoom }),
      })
      if (response.ok) {
        // Refresh pinned messages
        const pinnedResponse = await fetch(`/api/chat/pinned?roomId=${currentRoom}`)
        if (pinnedResponse.ok) {
          const data = await pinnedResponse.json()
          setPinnedMessages(data.pinned || [])
        }
      }
    } catch (error) {
      console.error('Error pinning message:', error)
    }
  }

  const handleTyping = useCallback(() => {
    if (!socket || !user) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    socket.emit('typing', {
      roomId: currentRoom,
      userId: user.id,
      isTyping: true,
    })

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', {
        roomId: currentRoom,
        userId: user.id,
        isTyping: false,
      })
    }, 3000)
  }, [socket, user, currentRoom])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    const diff = (now.getTime() - date.getTime()) / 1000 / 60

    if (diff < 1) return 'Just now'
    if (diff < 60) return `${Math.floor(diff)}m ago`
    
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    
    if (msgDate.getTime() === today.getTime()) {
      return `Today at ${timeStr}`
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (msgDate.getTime() === yesterday.getTime()) {
      return `Yesterday at ${timeStr}`
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined }) + ` at ${timeStr}`
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      window.location.href = '/login'
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const getUserAvatar = (userData: User) => {
    return userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=CE1141&color=fff&bold=true`
  }


  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex h-screen overflow-hidden">
      {/* Left Sidebar - Channels */}
      <div className="w-64 bg-[#111111] border-r border-gray-800/50 flex flex-col">
        {/* Header */}
        <div className="h-14 px-4 flex items-center border-b border-gray-800/50 bg-gradient-to-r from-primary-900/20 via-primary-800/10 to-transparent">
          <div className="flex items-center gap-3 w-full">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-600/30">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-base">RT Chat</h2>
              <p className="text-xs text-gray-500">Real-time messaging</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-2 border-b border-gray-800/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-900/50 border border-gray-800/50 rounded-lg text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:bg-gray-900 transition-all"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Text Channels
              </span>
              <button
                onClick={() => setShowChannelCreate(true)}
                className="p-1 text-gray-500 hover:text-primary-400 hover:bg-gray-900/50 rounded transition-all"
                title="Create Channel"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-0.5">
              {(searchQuery ? rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())) : rooms).map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    setCurrentRoom(room.id)
                    setCurrentDM(null)
                    setSearchQuery('')
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg group flex items-center gap-2 transition-all ${
                    currentRoom === room.id && !currentDM
                      ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 text-white border border-primary-500/30 shadow-lg shadow-primary-500/20'
                      : 'text-gray-400 hover:bg-gray-900/50 hover:text-white border border-transparent hover:border-gray-800/50'
                  }`}
                >
                  <Hash className={`w-4 h-4 flex-shrink-0 ${currentRoom === room.id && !currentDM ? 'text-primary-400' : 'text-gray-600 group-hover:text-gray-400'}`} />
                  <span className="font-semibold text-xs truncate flex-1">{room.name}</span>
                  {room.messageCount > 0 && currentRoom !== room.id && (
                    <span className="text-xs bg-primary-600/20 text-primary-300 px-2 py-0.5 rounded-full font-medium">
                      {room.messageCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div className="mb-3 mt-4">
            <div className="flex items-center justify-between mb-2 px-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Direct Messages
              </span>
            </div>
            <div className="space-y-0.5">
              {dms.map((dm) => (
                <button
                  key={dm.id}
                  onClick={() => {
                    setCurrentDM(dm.id)
                    setCurrentRoom('')
                    // Fetch DM messages
                    fetch(`/api/chat/dms/${dm.id}/messages`)
                      .then(res => res.json())
                      .then(data => setDmMessages(data.messages || []))
                      .catch(err => console.error('Error fetching DM messages:', err))
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg group flex items-center gap-2 transition-all ${
                    currentDM === dm.id
                      ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 text-white border border-primary-500/30 shadow-lg shadow-primary-500/20'
                      : 'text-gray-400 hover:bg-gray-900/50 hover:text-white border border-transparent hover:border-gray-800/50'
                  }`}
                >
                  <div className="relative w-6 h-6 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700">
                    <Image
                      src={dm.otherUser.avatarUrl}
                      alt={dm.otherUser.username}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-semibold text-xs truncate flex-1">{dm.otherUser.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* User Panel */}
        <div className="h-16 bg-[#0d0d0d] border-t border-gray-800/50 px-3 py-2">
          <div className="flex items-center gap-2.5 h-full">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-primary-500/40 shadow-lg shadow-primary-500/20">
              <Image
                src={getUserAvatar(user)}
                alt={user.username}
                fill
                className="object-cover"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#0d0d0d] rounded-full shadow-lg"></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white truncate">
                {getUserDisplayName(user)}
              </div>
              <div className="text-xs text-gray-500 truncate">
                @{user.username}
              </div>
            </div>
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-gray-500 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showUserMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-[#1a1a1a] rounded-xl shadow-2xl border border-gray-800/50 py-1.5 z-50 backdrop-blur-xl">
                  <div className="px-4 py-3 border-b border-gray-800/50">
                    <div className="text-sm font-bold text-white mb-0.5">
                      {getUserDisplayName(user)}
                    </div>
                    <div className="text-xs text-gray-500">
                      @{user.username}
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        window.location.href = '/account/settings'
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-900/50 flex items-center gap-2.5 transition-colors rounded-lg mx-1.5"
                    >
                      <User className="w-4 h-4" />
                      Account Settings
                    </button>
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false)
                          window.location.href = '/admin'
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-900/50 flex items-center gap-2.5 transition-colors rounded-lg mx-1.5"
                      >
                        <Shield className="w-4 h-4 text-primary-400" />
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        window.location.href = '/'
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-gray-900/50 flex items-center gap-2.5 transition-colors rounded-lg mx-1.5"
                    >
                      <Home className="w-4 h-4" />
                      Home
                    </button>
                  </div>
                  <div className="border-t border-gray-800/50 py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-colors rounded-lg mx-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0a0a]">
        {/* Channel Header */}
        <div className="h-14 bg-[#111111] border-b border-gray-800/50 px-5 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              {currentDM ? (
                <>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-primary-500/20">
                    <Image
                      src={dms.find(d => d.id === currentDM)?.otherUser.avatarUrl || ''}
                      alt="DM"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-base">
                      {dms.find(d => d.id === currentDM)?.otherUser.displayName || 'Direct Message'}
                    </h1>
                    <p className="text-xs text-gray-500">
                      @{dms.find(d => d.id === currentDM)?.otherUser.username}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600/20 to-primary-500/10 flex items-center justify-center border border-primary-500/20">
                    <Hash className="w-4 h-4 text-primary-400" />
                  </div>
                  <div>
                    <h1 className="text-white font-bold text-base">
                      {rooms.find((r) => r.id === currentRoom)?.name || 'general'}
                    </h1>
                    {rooms.find((r) => r.id === currentRoom)?.description && (
                      <p className="text-xs text-gray-500">
                        {rooms.find((r) => r.id === currentRoom)?.description}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setShowSearch(!showSearch)
                if (!showSearch) {
                  setTimeout(() => searchInputRef.current?.focus(), 100)
                }
              }}
              className={`p-2 rounded-lg transition-all ${
                showSearch
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-gray-500 hover:text-white hover:bg-gray-900/50'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all relative"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 rounded-full text-xs flex items-center justify-center text-white">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
              {showNotifications && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-80 bg-[#1a1a1a] border border-gray-800/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-800/50 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <button
                          onClick={async () => {
                            await fetch('/api/chat/notifications', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ markAllAsRead: true }),
                            })
                            setUnreadNotifications(0)
                          }}
                          className="text-xs text-primary-400 hover:text-primary-300"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="py-2">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`px-4 py-3 hover:bg-gray-900/50 transition-colors ${!notif.read ? 'bg-primary-500/5' : ''}`}
                          >
                            <div className="text-xs text-gray-400 mb-1">
                              {notif.type === 'mention' && 'You were mentioned'}
                              {notif.type === 'dm' && 'New direct message'}
                              {notif.type === 'reply' && 'Reply to your message'}
                              {notif.type === 'reaction' && 'Reaction to your message'}
                            </div>
                            {notif.fromUser && (
                              <div className="text-sm text-gray-300">
                                by {notif.fromUser.displayName}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            {pinnedMessages.length > 0 && (
              <button
                onClick={() => setShowPinned(!showPinned)}
                className="p-2 text-gray-500 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all relative"
                title="Pinned Messages"
              >
                <Pin className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowMembers(!showMembers)}
              className={`p-2 rounded-lg transition-all ${
                showMembers
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-gray-500 hover:text-white hover:bg-gray-900/50'
              }`}
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 flex items-center gap-3 shadow-lg">
            <AlertCircle size={20} />
            <span className="flex-1 text-sm">{error}</span>
            <button onClick={() => setError('')} className="hover:text-red-300">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : groupedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600/10 to-primary-500/5 flex items-center justify-center mb-4 border border-primary-500/20">
                <MessageSquare className="w-8 h-8 text-primary-400/50" />
              </div>
              <p className="text-lg font-bold text-white mb-1">No messages yet</p>
              <p className="text-xs">Start the conversation by sending a message!</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {(currentDM ? dmMessages : groupedMessages).map((message: any, index: number) => {
                const groupedMsg = currentDM ? {
                  ...message,
                  isGrouped: false,
                  showAvatar: true,
                  showTimestamp: true,
                } : message as GroupedMessage
                return (
                <div
                  key={message.id}
                  className={`group flex items-start gap-3 ${
                    message.isGrouped ? 'mt-0' : 'mt-6'
                  }`}
                >
                  {message.showAvatar ? (
                    <button
                      onClick={() => {
                        setSelectedUser({
                          id: message.userId,
                          username: message.username,
                          avatar_url: message.avatarUrl,
                          first_name: message.displayName.includes(' ') ? message.displayName.split(' ')[0] : null,
                          full_name: message.displayName,
                        })
                        setShowUserProfile(true)
                      }}
                      className="cursor-pointer flex-shrink-0"
                    >
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-primary-500/30 shadow-lg hover:border-primary-500/50 transition-colors">
                        <Image
                          src={message.avatarUrl}
                          alt={message.username}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </button>
                  ) : (
                    <div className="w-10 flex-shrink-0"></div>
                  )}
                  <div className="flex-1 min-w-0 relative">
                    {message.showAvatar && (
                      <div className="flex items-baseline gap-2 mb-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser({
                              id: message.userId,
                              username: message.username,
                              avatar_url: message.avatarUrl,
                              first_name: message.displayName.includes(' ') ? message.displayName.split(' ')[0] : null,
                              full_name: message.displayName,
                            })
                            setShowUserProfile(true)
                          }}
                          className="font-bold text-white hover:text-primary-400 cursor-pointer transition-colors text-sm"
                        >
                          {getUserDisplayName({
                            username: message.username,
                            first_name: message.displayName.includes(' ') ? message.displayName.split(' ')[0] : null,
                            full_name: message.displayName,
                          } as any)}
                        </button>
                        <span className="text-xs text-gray-600 font-medium">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.edited && (
                          <span className="text-xs text-gray-700 italic">(edited)</span>
                        )}
                      </div>
                    )}
                    <div className="bg-[#151515] rounded-xl px-4 py-3 border border-gray-800/50 shadow-lg hover:border-gray-700/50 transition-colors group/message relative">
                      {editingMessageId === message.id ? (
                        <div className="space-y-2">
                          <textarea
                            ref={editInputRef}
                            defaultValue={message.message}
                            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:border-primary-500/50 resize-none"
                            rows={3}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                e.preventDefault()
                                if (editInputRef.current) {
                                  handleEditMessage(message.id, editInputRef.current.value)
                                }
                              }
                              if (e.key === 'Escape') {
                                setEditingMessageId(null)
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Press Ctrl+Enter to save, Esc to cancel</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div
                            className="text-gray-200 break-words whitespace-pre-wrap leading-relaxed text-sm"
                            dangerouslySetInnerHTML={{
                              __html: processMessageText(message.message, []),
                            }}
                          />
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {message.attachments.map((att: { id: string; name: string; url: string; type?: string; size?: number }) => (
                                <div key={att.id} className="flex items-center gap-2 p-2 bg-gray-900/50 rounded-lg">
                                  {att.type?.startsWith('image/') ? (
                                    <img src={att.url} alt={att.name} className="max-w-xs rounded-lg" />
                                  ) : (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary-400 hover:text-primary-300 text-xs flex items-center gap-2"
                                    >
                                      📎 {att.name}
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                          {messageReactions[message.id] && messageReactions[message.id].length > 0 && (
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                              {messageReactions[message.id].map((reaction, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleReact(message.id, reaction.emoji)}
                                  className="px-2 py-1 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-xs flex items-center gap-1 transition-colors"
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-gray-400">{reaction.count}</span>
                                </button>
                              ))}
                              <button
                                onClick={() => {
                                  const emoji = prompt('Enter emoji:')
                                  if (emoji) handleReact(message.id, emoji)
                                }}
                                className="px-2 py-1 text-gray-500 hover:text-gray-300 text-xs"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </>
                      )}
                      <div className="absolute right-2 top-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
                        <MessageActions
                          messageId={message.id}
                          userId={message.userId}
                          currentUserId={user.id}
                          currentUserRole={user.role}
                          onEdit={() => setEditingMessageId(message.id)}
                          onDelete={() => handleDeleteMessage(message.id, false)}
                          onCopy={() => handleCopyMessage(message.message)}
                          onReact={() => {
                            const emoji = prompt('Enter emoji:')
                            if (emoji) handleReact(message.id, emoji)
                          }}
                          onPin={() => handlePinMessage(message.id)}
                          onReply={() => {
                            setThreadMessageId(message.id)
                            setShowThread(true)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="px-5 py-2 text-xs text-gray-500 italic border-t border-gray-800/50 bg-[#0d0d0d]">
            {typingUsers.size} {typingUsers.size === 1 ? 'person is' : 'people are'} typing...
          </div>
        )}

        {/* Message Input */}
        <div className="px-5 pb-4 pt-3 border-t border-gray-800/50 bg-[#0d0d0d]">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="bg-[#151515] rounded-xl px-4 py-3 border border-gray-800/50 shadow-xl flex items-end gap-2">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <FileUpload
                  onFilesSelected={(files) => setAttachments(files)}
                  maxSize={10 * 1024 * 1024}
                  maxFiles={5}
                />
                <EmojiPicker onSelect={handleEmojiSelect} position="top" />
              </div>
              <div className="flex-1 min-w-0 relative">
                <textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={handleMentionInput}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                    if (e.key === 'ArrowDown' && showMentions && mentionSuggestions.length > 0) {
                      e.preventDefault()
                      // Handle arrow navigation
                    }
                    if (e.key === 'Enter' && showMentions && mentionSuggestions.length > 0) {
                      e.preventDefault()
                      insertMention(mentionSuggestions[0].username)
                    }
                  }}
                  placeholder={currentDM ? `Message ${dms.find(d => d.id === currentDM)?.otherUser.displayName || 'user'}...` : `Message #${rooms.find((r) => r.id === currentRoom)?.name || 'general'}...`}
                  maxLength={2000}
                  rows={1}
                  className="w-full bg-transparent text-gray-100 placeholder-gray-600 focus:outline-none text-sm resize-none max-h-[150px] overflow-y-auto"
                  disabled={isSending}
                />
                {showMentions && mentionSuggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1a] border border-gray-800/50 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
                    {mentionSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => insertMention(suggestion.username)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-900/50 flex items-center gap-2 transition-colors"
                      >
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                          <Image
                            src={suggestion.avatarUrl}
                            alt={suggestion.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{suggestion.displayName}</div>
                          <div className="text-xs text-gray-500">@{suggestion.username}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!messageInput.trim() || isSending}
                className="p-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 flex items-center justify-center flex-shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-xs text-gray-600">
                Press <kbd className="px-1 py-0.5 bg-gray-900/50 rounded text-gray-400 text-xs">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-900/50 rounded text-gray-400 text-xs">Shift+Enter</kbd> for new line
              </p>
              <p className="text-xs text-gray-600">
                {messageInput.length}/2000
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Search Sidebar */}
      {showSearch && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSearch(false)}
          />
          <div className="fixed right-0 top-0 h-full w-96 bg-[#111111] border-l border-gray-800/50 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Search Header */}
            <div className="h-16 px-5 border-b border-gray-800/50 flex items-center justify-between bg-gradient-to-r from-primary-900/20 via-primary-800/10 to-transparent">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800/50 rounded-lg text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:bg-gray-900 transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery('')
                  setSearchResults([])
                }}
                className="ml-2 p-2 text-gray-500 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto">
              {searchQuery.trim() === '' ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600/10 to-primary-500/5 flex items-center justify-center mb-4 border border-primary-500/20">
                    <Search className="w-8 h-8 text-primary-400/50" />
                  </div>
                  <p className="text-base font-bold text-white mb-1">Search Messages</p>
                  <p className="text-xs text-center">Type to search across all channels and messages</p>
                </div>
              ) : searchResults.length === 0 && !isSearching ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-base font-bold text-white mb-1">No results found</p>
                  <p className="text-xs text-center">Try different keywords</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-2">
                    {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                  </div>
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => {
                        setCurrentRoom(result.roomId)
                        setCurrentDM(null)
                        setShowSearch(false)
                        // Scroll to message could be added here
                      }}
                      className="w-full text-left p-3 bg-gray-900/50 rounded-xl hover:bg-gray-900/70 transition-all border border-transparent hover:border-gray-800/50 group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-600/20 to-primary-500/10 flex items-center justify-center border border-primary-500/20">
                          <Hash className="w-3.5 h-3.5 text-primary-400" />
                        </div>
                        <span className="text-xs font-semibold text-primary-400">{result.roomName || 'general'}</span>
                        <span className="text-xs text-gray-600">•</span>
                        <span className="text-xs text-gray-500">{formatTime(result.createdAt)}</span>
                      </div>
                      <div className="flex items-start gap-2.5 mb-2">
                        <div className="relative w-6 h-6 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700">
                          <Image
                            src={result.avatarUrl}
                            alt={result.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-white mb-0.5">{result.displayName}</div>
                          <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">{result.message}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* User Profile Modal */}
      {selectedUser && (
        <UserProfileModal
          user={selectedUser}
          isOpen={showUserProfile}
          onClose={() => {
            setShowUserProfile(false)
            setSelectedUser(null)
          }}
          onMessage={() => {
            // TODO: Implement direct message
            setShowUserProfile(false)
          }}
        />
      )}

      {/* Message Thread Modal */}
      {threadMessageId && (
        <MessageThread
          messageId={threadMessageId}
          roomId={currentRoom}
          isOpen={showThread}
          onClose={() => {
            setShowThread(false)
            setThreadMessageId(null)
          }}
          currentUserId={user.id}
        />
      )}

      {/* Pinned Messages Modal */}
      {showPinned && pinnedMessages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800/50 shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-800/50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Pin className="w-5 h-5 text-primary-400" />
                Pinned Messages
              </h3>
              <button
                onClick={() => setShowPinned(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-900/50 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {pinnedMessages.map((pinned) => (
                <div key={pinned.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden">
                      <Image
                        src={pinned.author.avatarUrl}
                        alt={pinned.author.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{pinned.author.displayName}</div>
                      <div className="text-xs text-gray-500">{formatTime(pinned.messageCreatedAt)}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300">{pinned.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Channel Modal */}
      <CreateChannelModal
        isOpen={showChannelCreate}
        onClose={() => setShowChannelCreate(false)}
        onSuccess={() => {
          // Refresh rooms list
          fetch('/api/chat/rooms')
            .then(res => res.json())
            .then(data => setRooms(data.rooms || []))
            .catch(err => console.error('Error refreshing rooms:', err))
        }}
      />

      {/* Right Sidebar - Members */}
      {showMembers && (
        <div className="w-56 bg-[#111111] border-l border-gray-800/50 flex flex-col">
          <div className="h-14 border-b border-gray-800/50 px-4 flex items-center justify-between">
            <div className="text-xs font-bold text-gray-300">
              Members
            </div>
            <div className="text-xs text-gray-600 bg-gray-900/50 px-2 py-1 rounded-full">
              {onlineUsers.size}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3 px-2">
              Online — {onlineUsers.size}
            </div>
            <div className="space-y-1.5">
              {user && (
                <div className="px-3 py-2 rounded-lg flex items-center gap-2.5 hover:bg-gray-900/50 group transition-colors border border-transparent hover:border-gray-800/50">
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 border-2 border-primary-500/30">
                    <Image
                      src={getUserAvatar(user)}
                      alt={user.username}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#111111] rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {getUserDisplayName(user)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      @{user.username}
                    </div>
                  </div>
                  {user.role === 'admin' && (
                    <Shield className="w-3.5 h-3.5 text-primary-400 flex-shrink-0" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
