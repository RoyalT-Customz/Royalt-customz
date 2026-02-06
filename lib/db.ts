import { createClient, type Client } from '@libsql/client'

let _db: Client | null = null

function getDb(): Client {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL || ''
    const authToken = process.env.TURSO_AUTH_TOKEN || ''

    if (!url || !authToken) {
      throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN environment variables')
    }

    _db = createClient({ url, authToken })
  }
  return _db
}

export const db = new Proxy({} as Client, {
  get(_target, prop) {
    return (getDb() as any)[prop]
  },
})

// Initialize database schema
export async function initDatabase() {
  try {
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        full_name TEXT,
        phone TEXT,
        avatar_url TEXT,
        bio TEXT,
        role TEXT DEFAULT 'user',
        is_active INTEGER DEFAULT 1,
        is_verified INTEGER DEFAULT 0,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Products table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        video_url TEXT,
        stock INTEGER DEFAULT 0,
        is_escrow INTEGER DEFAULT 0,
        tebex_link TEXT,
        key_features TEXT,
        framework_support TEXT,
        technical_details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Add missing columns if they don't exist (for existing databases)
    try {
      await db.execute(`ALTER TABLE products ADD COLUMN key_features TEXT`)
    } catch (e: any) {
      // Column already exists, ignore error
      if (!e?.message?.includes('duplicate column')) {
        console.warn('Could not add key_features column:', e)
      }
    }

    try {
      await db.execute(`ALTER TABLE products ADD COLUMN framework_support TEXT`)
    } catch (e: any) {
      // Column already exists, ignore error
      if (!e?.message?.includes('duplicate column')) {
        console.warn('Could not add framework_support column:', e)
      }
    }

    try {
      await db.execute(`ALTER TABLE products ADD COLUMN technical_details TEXT`)
    } catch (e: any) {
      // Column already exists, ignore error
      if (!e?.message?.includes('duplicate column')) {
        console.warn('Could not add technical_details column:', e)
      }
    }

    try {
      await db.execute(`ALTER TABLE products ADD COLUMN video_url TEXT`)
    } catch (e: any) {
      // Column already exists, ignore error
      if (!e?.message?.includes('duplicate column')) {
        console.warn('Could not add video_url column:', e)
      }
    }

    // Orders table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Order items table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)

    // Appointments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        service_type TEXT NOT NULL,
        appointment_date DATETIME NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Tickets table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Ticket messages table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id TEXT PRIMARY KEY,
        ticket_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ticket_id) REFERENCES tickets(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)

    // Reviews table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        product_id TEXT,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title TEXT,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `)

    // Blog posts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id TEXT,
        image_url TEXT,
        published INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `)

    // Portfolio items table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS portfolio_items (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        client_name TEXT,
        tags TEXT,
        featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    throw error
  }
}

