'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  MessageSquare,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Send,
  User,
  Clock,
  Trash2,
  Edit,
  Shield,
  Filter,
  MoreVertical,
  Tag,
  UserCheck,
  Mail,
  TrendingUp,
  Bell,
} from 'lucide-react'
import { getUserDisplayName, getUserDisplayEmail } from '@/lib/user-display'

interface Ticket {
  id: string
  subject: string
  message: string
  priority: string
  status: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  user: {
    id: string
    username: string
    email: string
    first_name: string | null
    last_name: string | null
    hide_email?: number
    hide_phone?: number
    hide_full_name?: number
  }
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

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [ticketDetails, setTicketDetails] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assignedFilter, setAssignedFilter] = useState('all')
  const [newMessage, setNewMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [updateStatus, setUpdateStatus] = useState('')
  const [updatePriority, setUpdatePriority] = useState('')
  const [updateAssigned, setUpdateAssigned] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)
      if (assignedFilter !== 'all') {
        if (assignedFilter === 'unassigned') {
          params.append('assigned_to', 'unassigned')
        } else {
          params.append('assigned_to', assignedFilter)
        }
      }
      if (searchQuery) params.append('search', searchQuery)

      const response = await fetch(`/api/admin/tickets?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTickets(data.tickets || [])
        setLastUpdate(new Date())
      } else {
        setError('Failed to fetch tickets')
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
      setError('Error loading tickets')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, priorityFilter, assignedFilter, searchQuery])

  const fetchTicketDetails = useCallback(async (ticketId: string) => {
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}`)
      if (response.ok) {
        const data = await response.json()
        setTicketDetails(data)
        setUpdateStatus(data.ticket.status)
        setUpdatePriority(data.ticket.priority)
        setUpdateAssigned(data.ticket.assigned_to || '')
      }
    } catch (error) {
      console.error('Error fetching ticket details:', error)
      setError('Error loading ticket details')
    }
  }, [])

  useEffect(() => {
    fetchTickets()
    const interval = setInterval(() => {
      fetchTickets()
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchTickets])

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketDetails(selectedTicket.id)
      const interval = setInterval(() => {
        fetchTicketDetails(selectedTicket.id)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [selectedTicket, fetchTicketDetails])

  const handleSelectTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setShowUpdateForm(false)
    fetchTicketDetails(ticket.id)
  }

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return

    setIsSubmitting(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      })

      if (response.ok) {
        setNewMessage('')
        fetchTicketDetails(selectedTicket.id)
        fetchTickets()
        setSuccess('Message sent successfully!')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError('Error sending message')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return

    setIsUpdating(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updateStatus,
          priority: updatePriority,
          assigned_to: updateAssigned || null,
        }),
      })

      if (response.ok) {
        fetchTicketDetails(selectedTicket.id)
        fetchTickets()
        setShowUpdateForm(false)
        setSuccess('Ticket updated successfully!')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError('Failed to update ticket')
      }
    } catch (error) {
      console.error('Error updating ticket:', error)
      setError('Error updating ticket')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return

    if (!confirm(`Are you sure you want to delete ticket "${selectedTicket.subject}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    setError('')
    try {
      const response = await fetch(`/api/admin/tickets/${selectedTicket.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSelectedTicket(null)
        setTicketDetails(null)
        fetchTickets()
        setSuccess('Ticket deleted successfully!')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to delete ticket')
      }
    } catch (error) {
      console.error('Error deleting ticket:', error)
      setError('An error occurred while deleting the ticket')
    } finally {
      setIsDeleting(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-600/20 text-red-400 border-red-600/30'
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle size={14} className="text-red-400" />
      case 'medium':
        return <Clock size={14} className="text-yellow-400" />
      case 'low':
        return <Tag size={14} className="text-blue-400" />
      default:
        return <Tag size={14} className="text-gray-400" />
    }
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    closed: tickets.filter(t => t.status === 'closed').length,
    highPriority: tickets.filter(t => t.priority === 'high').length,
    unassigned: tickets.filter(t => !t.assigned_to).length,
  }

  const filteredTickets = tickets

  if (isLoading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <section className="mb-8 lg:mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Ticket <span className="text-primary-500">Management</span>
              </h1>
              <p className="text-gray-400 text-base lg:text-lg">
                Manage customer support tickets
                <span className="text-gray-500 text-sm ml-2">
                  • Last updated: {lastUpdate.toLocaleTimeString()}
                </span>
              </p>
            </div>
            <div className="text-right p-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50">
              <p className="text-gray-400 text-sm mb-1 font-medium">Total Tickets</p>
              <p className="text-3xl lg:text-4xl font-bold text-primary-500">{stats.total}</p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 flex items-center gap-3 backdrop-blur-sm">
              <AlertCircle size={20} className="flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')} className="hover:text-red-300 transition-colors">
                <X size={18} />
              </button>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/20 border border-green-800/50 rounded-xl text-green-400 flex items-center gap-3 backdrop-blur-sm">
              <CheckCircle size={20} className="flex-shrink-0" />
              <span className="flex-1">{success}</span>
              <button onClick={() => setSuccess('')} className="hover:text-green-300 transition-colors">
                <X size={18} />
              </button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-800/50 rounded-xl backdrop-blur-sm hover:border-green-700/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-green-400 text-sm font-medium">Open</p>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.open}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border border-yellow-800/50 rounded-xl backdrop-blur-sm hover:border-yellow-700/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-yellow-400 text-sm font-medium">Pending</p>
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.pending}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-gray-800/30 to-gray-900/20 border border-gray-700/50 rounded-xl backdrop-blur-sm hover:border-gray-600/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Closed</p>
                <X className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.closed}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-800/50 rounded-xl backdrop-blur-sm hover:border-red-700/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-red-400 text-sm font-medium">High Priority</p>
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.highPriority}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-800/50 rounded-xl backdrop-blur-sm hover:border-blue-700/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-400 text-sm font-medium">Unassigned</p>
                <UserCheck className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.unassigned}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-800/50 rounded-xl backdrop-blur-sm hover:border-purple-700/50 transition-all">
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-400 text-sm font-medium">Total</p>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-6 lg:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={assignedFilter}
                onChange={(e) => setAssignedFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="all">All Assignments</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>
          </div>
        </section>

        {/* Split View: Tickets List (Left) + Chat (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-500px)] min-h-[600px]">
          {/* Left Side: Tickets List */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden flex flex-col backdrop-blur-sm shadow-xl">
            <div className="p-5 border-b border-gray-700/50 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">All Tickets</h2>
                <span className="text-sm text-gray-400">{filteredTickets.length} tickets</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No tickets found</h3>
                  <p className="text-gray-400 text-sm">No tickets match your filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700/50">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleSelectTicket(ticket)}
                      className={`p-5 cursor-pointer transition-all ${
                        selectedTicket?.id === ticket.id
                          ? 'bg-primary-600/20 border-l-4 border-primary-500'
                          : 'hover:bg-gray-800/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-white text-base line-clamp-2 flex-1 pr-2">
                          {ticket.subject}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border inline-flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                            {getPriorityIcon(ticket.priority)}
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <User size={12} />
                            {getUserDisplayName(ticket.user) || 'User'}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <MessageSquare size={12} />
                            {ticket.message_count}
                          </span>
                        </div>
                        {ticket.assigned_to && (
                          <span className="text-xs text-primary-400 flex items-center gap-1">
                            <UserCheck size={12} />
                            Assigned
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Clock size={12} />
                        {new Date(ticket.created_at).toLocaleDateString()} • {new Date(ticket.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Chat View */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden flex flex-col backdrop-blur-sm shadow-xl">
            {selectedTicket && ticketDetails ? (
              <>
                {/* Chat Header */}
                <div className="p-5 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/60 to-gray-900/60 backdrop-blur-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-white line-clamp-2 mb-2">
                        {ticketDetails.ticket.subject}
                      </h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border inline-flex items-center gap-1 ${getPriorityColor(ticketDetails.ticket.priority)}`}>
                          {getPriorityIcon(ticketDetails.ticket.priority)}
                          {ticketDetails.ticket.priority}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(ticketDetails.ticket.status)}`}>
                          {ticketDetails.ticket.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          #{ticketDetails.ticket.id.slice(0, 8)}
                        </span>
                        {ticketDetails.ticket.assigned_to && (
                          <span className="text-xs text-primary-400 flex items-center gap-1">
                            <UserCheck size={12} />
                            {ticketDetails.ticket.assigned_to}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setShowUpdateForm(!showUpdateForm)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
                        title="Update Ticket"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={handleDeleteTicket}
                        disabled={isDeleting}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50"
                        title="Delete Ticket"
                      >
                        {isDeleting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Update Form */}
                {showUpdateForm && (
                  <div className="p-5 border-b border-gray-700/50 bg-gray-800/20">
                    <h3 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
                      <Edit size={16} />
                      Update Ticket
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Status</label>
                        <select
                          value={updateStatus}
                          onChange={(e) => setUpdateStatus(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                        >
                          <option value="open">Open</option>
                          <option value="pending">Pending</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Priority</label>
                        <select
                          value={updatePriority}
                          onChange={(e) => setUpdatePriority(e.target.value)}
                          className="w-full px-3 py-2.5 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2">Assigned To</label>
                        <input
                          type="text"
                          value={updateAssigned}
                          onChange={(e) => setUpdateAssigned(e.target.value)}
                          placeholder="Admin username"
                          className="w-full px-3 py-2.5 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateTicket}
                        disabled={isUpdating}
                        className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-all disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} />
                            Update Ticket
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowUpdateForm(false)}
                        className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* User Info */}
                <div className="p-5 border-b border-gray-700/50 bg-gray-800/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-600/20 to-primary-700/20 rounded-full flex items-center justify-center border border-primary-600/30">
                      <User size={20} className="text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {getUserDisplayName(ticketDetails.ticket.user) || 'Unknown User'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail size={12} />
                          {getUserDisplayEmail(ticketDetails.ticket.user) || 'Hidden'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-gray-900/50 to-transparent">
                  {/* Initial Message */}
                  <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <User size={14} className="text-gray-400" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-white">
                            {ticketDetails.ticket.user.username || 'User'}
                          </span>
                          <span className="text-xs text-gray-400 ml-2">(Initial Request)</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(ticketDetails.ticket.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {ticketDetails.ticket.message}
                    </p>
                  </div>

                  {/* Conversation Messages */}
                  {ticketDetails.messages && ticketDetails.messages.length > 0 && (
                    <>
                      {ticketDetails.messages
                        .filter((msg: TicketMessage) => {
                          return msg.message !== ticketDetails.ticket.message
                        })
                        .map((msg: TicketMessage) => (
                          <div
                            key={msg.id}
                            className={`rounded-xl p-4 ${
                              msg.is_admin
                                ? 'bg-primary-900/20 border border-primary-800/30 ml-8'
                                : 'bg-gray-800/50 border border-gray-700/50 mr-8'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {msg.is_admin ? (
                                  <div className="w-8 h-8 bg-primary-600/20 rounded-full flex items-center justify-center border border-primary-600/30">
                                    <Shield size={14} className="text-primary-400" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                    <User size={14} className="text-gray-400" />
                                  </div>
                                )}
                                <div>
                                  <span className="text-sm font-medium text-white">
                                    {msg.user.first_name && msg.user.last_name
                                      ? `${msg.user.first_name} ${msg.user.last_name}`
                                      : msg.user.username}
                                  </span>
                                  {msg.is_admin && (
                                    <span className="ml-2 px-2 py-0.5 bg-primary-600/20 text-primary-400 rounded-lg text-xs font-medium">
                                      Admin
                                    </span>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(msg.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                              {msg.message}
                            </p>
                          </div>
                        ))}
                    </>
                  )}
                </div>

                {/* Message Input */}
                {ticketDetails.ticket.status !== 'closed' && (
                  <div className="p-5 border-t border-gray-700/50 bg-gray-800/30">
                    <div className="flex gap-3">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your response..."
                        rows={3}
                        className="flex-1 px-4 py-3 bg-gray-900/60 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500/50 resize-none transition-all"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleSendMessage()
                          }
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isSubmitting}
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 self-end shadow-lg shadow-primary-600/20"
                      >
                        {isSubmitting ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <Send size={18} />
                            Send
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Bell size={12} />
                      Press Ctrl+Enter to send
                    </p>
                  </div>
                )}

                {ticketDetails.ticket.status === 'closed' && (
                  <div className="p-5 border-t border-gray-700/50 bg-gray-800/30 text-center">
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                      <X size={16} />
                      This ticket is closed. You can still view the conversation but cannot send new messages.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Select a ticket</h3>
                <p className="text-gray-400 text-sm">Choose a ticket from the list to view the conversation and manage it</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
