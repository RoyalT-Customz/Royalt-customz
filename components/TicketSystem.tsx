'use client'

import { useState } from 'react'
import { MessageSquare, Send, Clock, CheckCircle } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  status: 'open' | 'pending' | 'resolved'
  createdAt: string
  messages: Message[]
}

interface Message {
  id: string
  sender: 'user' | 'support'
  text: string
  timestamp: string
}

export default function TicketSystem() {
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: '1',
      subject: 'Question about custom order',
      status: 'open',
      createdAt: '2024-01-15',
      messages: [
        {
          id: '1',
          sender: 'user',
          text: 'Hello, I have a question about my custom order.',
          timestamp: '2024-01-15 10:30',
        },
        {
          id: '2',
          sender: 'support',
          text: 'Hi! I\'d be happy to help. What would you like to know?',
          timestamp: '2024-01-15 10:35',
        },
      ],
    },
  ])

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(tickets[0])
  const [newMessage, setNewMessage] = useState('')
  const [newTicketSubject, setNewTicketSubject] = useState('')

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return

    const message: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date().toLocaleString(),
    }

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedTicket.id
          ? { ...ticket, messages: [...ticket.messages, message] }
          : ticket
      )
    )

    setSelectedTicket((prev) =>
      prev ? { ...prev, messages: [...prev.messages, message] } : null
    )

    setNewMessage('')
  }

  const handleCreateTicket = () => {
    if (!newTicketSubject.trim()) return

    const ticket: Ticket = {
      id: Date.now().toString(),
      subject: newTicketSubject,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      messages: [],
    }

    setTickets((prev) => [...prev, ticket])
    setSelectedTicket(ticket)
    setNewTicketSubject('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'resolved':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tickets List */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Your Tickets</h2>
            <button
              onClick={handleCreateTicket}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              New Ticket
            </button>
          </div>

          {/* New Ticket Form */}
          {newTicketSubject === '' && (
            <div className="mb-4">
              <input
                type="text"
                placeholder="Enter ticket subject..."
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTicket()}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`
                  w-full text-left p-4 rounded-lg border transition-all
                  ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-primary-600/20 border-primary-500'
                      : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50'
                  }
                `}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-medium text-sm">{ticket.subject}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {ticket.createdAt}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <MessageSquare className="w-3 h-3" />
                  {ticket.messages.length} messages
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket Messages */}
      <div className="lg:col-span-2 bg-gray-800/50 rounded-lg border border-gray-700 flex flex-col">
        {selectedTicket ? (
          <>
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">
                {selectedTicket.subject}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Created: {selectedTicket.createdAt}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs border ${getStatusColor(
                    selectedTicket.status
                  )}`}
                >
                  {selectedTicket.status}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.sender === 'user'
                        ? 'bg-primary-600/30 text-white'
                        : 'bg-gray-700/50 text-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs text-gray-400 mt-2">{message.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a ticket to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

