const { Server: SocketIOServer } = require('socket.io')

let io = null

function initializeSocket(server) {
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
    socket.on('join-room', async (roomId) => {
      socket.join(roomId)
      console.log(`Socket ${socket.id} joined room: ${roomId}`)
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', { socketId: socket.id })
    })

    // Leave a room
    socket.on('leave-room', (roomId) => {
      socket.leave(roomId)
      console.log(`Socket ${socket.id} left room: ${roomId}`)
    })

    // Handle new message - just broadcast it (saving is done via API)
    socket.on('new-message', (messageData) => {
      // Broadcast to all users in the room
      io.to(messageData.roomId).emit('message-received', messageData)
    })

    // Handle typing indicator
    socket.on('typing', (data) => {
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

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.')
  }
  return io
}

module.exports = { initializeSocket, getIO }

