'use client'

import { useEffect, useState, useCallback } from 'react'
import { MessageSquare, Plus, X, AlertCircle, CheckCircle, Loader2, Send, Settings, Clock, User, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Ticket {
  id: string
  subject: string
  message: string
  priority: string
  status: string
  date: string
  updated_at: string
  message_count: number
}

interface TicketMessage {
  id: string
  message: string
  is_admin: boolean
  created_at: string
  user: {
    username: string
    first_name: string | null
    last_name: string | null
    role: string
  }
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [ticketDetails, setTicketDetails] = useState<any>(null)
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
  })
  const [newMessage, setNewMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/account/tickets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchTicketDetails = useCallback(async (ticketId: string) => {
    try {
      const response = await fetch(`/api/account/tickets/${ticketId}`)
      if (response.ok) {
        const data = await response.json()
        setTicketDetails(data)
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error)
    }
  }, [])

  useEffect(() => {
    fetchUser()
    fetchTickets()
    // Real-time updates: poll every 5 seconds
    const interval = setInterval(() => {
      fetchTickets()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchTickets])

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketDetails(selectedTicket.id)
      // Poll for new messages every 3 seconds when viewing a ticket
      const interval = setInterval(() => {
        fetchTicketDetails(selectedTicket.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedTicket, fetchTicketDetails])

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/account/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create ticket')
        if (false) {
          // placeholder
        }
        return
      }

      setSuccess('Ticket created successfully!')
      setTimeout(() => {
        fetchTickets()
        setShowCreateModal(false)
        setFormData({
          subject: '',
          message: '',
          priority: 'medium',
        })
        setSuccess('')
        // Auto-select the new ticket
        if (data.ticket) {
          const newTicket: Ticket = {
            id: data.ticket.id,
            subject: data.ticket.subject,
            message: data.ticket.message,
            priority: data.ticket.priority,
            status: data.ticket.status,
            date: data.ticket.date,
            updated_at: data.ticket.date,
            message_count: 1,
          }
          setSelectedTicket(newTicket)
          fetchTicketDetails(newTicket.id)
        }
      }, 1500)
    } catch (error) {
      console.error('Error creating ticket:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    setIsSubmitting(true)
    setError('')
    try {
      const response = await fetch(`/api/account/tickets/${selectedTicket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      })

      if (response.ok) {
        setNewMessage('')
        fetchTicketDetails(selectedTicket.id)
        fetchTickets() // Refresh list
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    fetchTicketDetails(ticket.id)
  }

  const canCreateTickets = true

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-bulls-600/20 text-bulls-400 border-bulls-600/30'
      case 'medium':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      case 'low':
        return 'bg-blue-600/20 text-blue-400 border-blue-600/30'
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-600/20 text-green-400 border-green-600/30'
      case 'pending':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      case 'closed':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30'
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30'
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Support Tickets</h1>
            <p className="text-gray-400 text-sm">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => {
              if (false) {
                // tickets are available to all authenticated users
                return
              }
              setShowCreateModal(true)
            }}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canCreateTickets}
          >
            <Plus size={20} />
            New Ticket
          </button>
        </div>

        {!canCreateTickets && (
          <div className="hidden">
            {/* Ticket creation is available to all authenticated users */}
          </div>
        )}

        {/* Split View: Tickets List (Left) + Chat (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)]">
          {/* Left Side: Tickets List */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700/50">
              <h2 className="text-lg font-semibold text-white">Your Tickets</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No tickets yet</h3>
                  <p className="text-gray-400 text-sm mb-4">Create your first support ticket to get started.</p>
                  {canCreateTickets ? (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Create Ticket
                    </button>
                  ) : (
                    <Link
                      href="/account/settings"
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all inline-flex items-center gap-2"
                    >
                      <Settings size={18} />
                      Go to Settings
                    </Link>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-700/50">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-primary-600/20 border-l-4 border-primary-500'
                          : 'hover:bg-gray-800/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white text-sm line-clamp-1">{ticket.subject}</h3>
                        <div className="flex items-center gap-1 ml-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            {ticket.message_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(ticket.date).toLocaleDateString()}
                          </span>
                        </div>
                        {ticket.updated_at && new Date(ticket.updated_at) > new Date(ticket.date) && (
                          <span className="text-xs text-primary-400">Updated</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Chat View */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden flex flex-col">
            {selectedTicket && ticketDetails ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-700/50 bg-gray-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-white line-clamp-1">{ticketDetails.ticket.subject}</h2>
                    <button
                      onClick={() => {
                        setSelectedTicket(null)
                        setTicketDetails(null)
                      }}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(ticketDetails.ticket.priority)}`}>
                      {ticketDetails.ticket.priority}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(ticketDetails.ticket.status)}`}>
                      {ticketDetails.ticket.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      #{ticketDetails.ticket.id.slice(0, 8)}
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Initial Message */}
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-white">You</span>
                        <span className="text-xs text-gray-400">(Initial Request)</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(ticketDetails.ticket.created_at || selectedTicket.date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{ticketDetails.ticket.message}</p>
                  </div>

                  {/* Conversation Messages */}
                  {ticketDetails.messages && ticketDetails.messages.length > 0 && (
                    <>
                      {ticketDetails.messages
                        .filter((msg: TicketMessage) => {
                          // Filter out the initial message if it matches the ticket's initial message
                          // This prevents showing the same message twice (once as "Initial Request" and once in the chat)
                          return msg.message.trim() !== ticketDetails.ticket.message.trim()
                        })
                        .map((msg: TicketMessage) => (
                          <div
                            key={msg.id}
                            className={`rounded-lg p-4 ${
                              msg.is_admin
                                ? 'bg-primary-900/20 border border-primary-800/30 ml-8'
                                : 'bg-gray-800/50 border border-gray-700 mr-8'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {msg.is_admin ? (
                                  <CheckCircle size={16} className="text-primary-400" />
                                ) : (
                                  <User size={16} className="text-gray-400" />
                                )}
                                <span className="text-sm font-medium text-white">
                                  {msg.user.first_name && msg.user.last_name
                                    ? `${msg.user.first_name} ${msg.user.last_name}`
                                    : msg.user.username}
                                </span>
                                {msg.is_admin && (
                                  <span className="px-2 py-0.5 bg-primary-600/20 text-primary-400 rounded text-xs font-medium">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{msg.message}</p>
                          </div>
                        ))}
                    </>
                  )}
                </div>

                {/* Message Input */}
                {ticketDetails.ticket.status !== 'closed' && (
                  <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
                    {error && (
                      <div className="mb-3 p-2 bg-bulls-900/20 border border-bulls-800 rounded text-bulls-400 text-xs">
                        {error}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        rows={3}
                        className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleSendMessage()
                          }
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSubmitting}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 self-end"
                      >
                        {isSubmitting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Send size={18} />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Press Ctrl+Enter to send</p>
                  </div>
                )}

                {ticketDetails.ticket.status === 'closed' && (
                  <div className="p-4 border-t border-gray-700/50 bg-gray-800/30 text-center">
                    <p className="text-gray-400 text-sm">This ticket is closed. You cannot send more messages.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a ticket</h3>
                <p className="text-gray-400 text-sm">Choose a ticket from the list to view the conversation</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Create New Ticket</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setError('')
                  setSuccess('')
                  setFormData({ subject: '', message: '', priority: 'medium' })
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  placeholder="Brief description of your issue"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority *</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  placeholder="Describe your issue in detail..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {error && (
                <div className="p-4 bg-bulls-900/20 border border-bulls-800 rounded-lg text-bulls-400 text-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle size={18} />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setError('')
                    setSuccess('')
                    setFormData({ subject: '', message: '', priority: 'medium' })
                  }}
                  className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                  <Plus size={20} />
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
