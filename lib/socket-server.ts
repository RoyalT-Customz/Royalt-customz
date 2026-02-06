import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { db } from './db'

let io: SocketIOServer | null = null

export function initializeSocket(server: HTTPServer) {
  if (io) {
    return io
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/api/socket',
  })

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Join a room
    socket.on('join-room', async (roomId: string) => {
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room: ${roomId}`)
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', { socketId: socket.id })
    })

    // Leave a room
    socket.on('leave-room', (roomId: string) => {
      socket.leave(roomId)
      console.log(`Socket ${socket.id} left room: ${roomId}`)
    })

    // Handle new message
    socket.on('new-message', async (data: { roomId: string; userId: string; message: string }) => {
      try {
        // Save message to database
        const { randomUUID } = await import('crypto')
        const messageId = randomUUID()

        await db.execute({
          sql: `
            INSERT INTO chat_messages (id, room_id, user_id, message)
            VALUES (?, ?, ?, ?)
          `,
          args: [messageId, data.roomId, data.userId, data.message],
        })

        // Get user info
        const userResult = await db.execute({
          sql: 'SELECT username, avatar_url, first_name, last_name, full_name FROM users WHERE id = ?',
          args: [data.userId],
        })

        if (userResult.rows.length === 0) {
          return
        }

        const userData = userResult.rows[0] as any

        const messageData = {
          id: messageId,
          roomId: data.roomId,
          userId: data.userId,
          username: userData.username,
          avatarUrl: userData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.username)}&background=DC2626&color=fff&bold=true`,
          displayName: userData.full_name || userData.first_name || userData.username,
          message: data.message,
          edited: false,
          editedAt: null,
          deleted: false,
          createdAt: new Date().toISOString(),
        }

        // Broadcast to all users in the room
        io?.to(data.roomId).emit('message-received', messageData)
      } catch (error) {
        console.error('Error handling new message:', error)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // Handle typing indicator
    socket.on('typing', (data: { roomId: string; userId: string; isTyping: boolean }) => {
      socket.to(data.roomId).emit('user-typing', {
        userId: data.userId,
        isTyping: data.isTyping,
      })
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id)
    })
  })

  return io
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.')
  }
  return io
}

