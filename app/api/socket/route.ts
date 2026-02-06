// This is a placeholder for Socket.io in Next.js App Router
// Socket.io requires a custom server setup
// See server.js for the actual Socket.io implementation

export const dynamic = 'force-dynamic'

export async function GET() {
  return new Response('Socket.io endpoint - use WebSocket connection', { status: 200 })
}

