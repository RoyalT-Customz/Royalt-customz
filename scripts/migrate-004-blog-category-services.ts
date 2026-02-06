import { db } from '../lib/db'

async function migrateDatabase() {
  try {
    console.log('Starting migration 004: Add blog category and services table...\n')

    // Check if column exists by trying to select it
    const checkColumn = async (table: string, columnName: string): Promise<boolean> => {
      try {
        await db.execute({
          sql: `SELECT ${columnName} FROM ${table} LIMIT 1`,
        })
        return true
      } catch (error: any) {
        if (error.message?.includes('no such column')) {
          return false
        }
        throw error
      }
    }

    // Check if table exists
    const checkTable = async (tableName: string): Promise<boolean> => {
      try {
        await db.execute({
          sql: `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
          args: [tableName],
        })
        const result = await db.execute({
          sql: `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
          args: [tableName],
        })
        return result.rows.length > 0
      } catch (error) {
        return false
      }
    }

    // Step 1: Add category column to blog_posts if it doesn't exist
    const categoryExists = await checkColumn('blog_posts', 'category')
    if (!categoryExists) {
      try {
        await db.execute({
          sql: 'ALTER TABLE blog_posts ADD COLUMN category TEXT',
        })
        console.log('✅ Added category column to blog_posts')
      } catch (error: any) {
        if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
          console.log('⊘ Category column already exists in blog_posts')
        } else {
          console.error('✗ Error adding category column:', error.message)
          throw error
        }
      }
    } else {
      console.log('⊘ Category column already exists in blog_posts')
    }

    // Step 2: Create index for blog_posts category
    try {
      await db.execute({
        sql: 'CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category)',
      })
      console.log('✅ Created index: idx_blog_posts_category')
    } catch (error: any) {
      console.error('✗ Error creating index:', error.message)
    }

    // Step 3: Create services table if it doesn't exist
    const servicesTableExists = await checkTable('services')
    if (!servicesTableExists) {
      try {
        await db.execute({
          sql: `CREATE TABLE IF NOT EXISTS services (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            icon TEXT,
            duration_minutes INTEGER DEFAULT 60,
            price REAL,
            active INTEGER DEFAULT 1,
            display_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`,
        })
        console.log('✅ Created services table')
      } catch (error: any) {
        console.error('✗ Error creating services table:', error.message)
        throw error
      }
    } else {
      console.log('⊘ Services table already exists')
    }

    // Step 4: Create indexes for services table
    const serviceIndexes = [
      { name: 'idx_services_category', sql: 'CREATE INDEX IF NOT EXISTS idx_services_category ON services(category)' },
      { name: 'idx_services_active', sql: 'CREATE INDEX IF NOT EXISTS idx_services_active ON services(active)' },
      { name: 'idx_services_display_order', sql: 'CREATE INDEX IF NOT EXISTS idx_services_display_order ON services(display_order)' },
    ]

    for (const index of serviceIndexes) {
      try {
        await db.execute({ sql: index.sql })
        console.log(`✅ Created index: ${index.name}`)
      } catch (error: any) {
        console.error(`✗ Error creating index ${index.name}:`, error.message)
      }
    }

    // Step 5: Update database version
    try {
      // Ensure site_settings table exists
      await db.execute({
        sql: `CREATE TABLE IF NOT EXISTS site_settings (
          id TEXT PRIMARY KEY,
          key TEXT UNIQUE NOT NULL,
          value TEXT,
          type TEXT DEFAULT 'text',
          description TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
      })

      await db.execute({
        sql: `INSERT OR REPLACE INTO site_settings (id, key, value, type, description) 
              VALUES ('db-version', 'db_version', '2.1.0', 'text', 'Database schema version')`,
      })
      console.log('✅ Updated database version to 2.1.0')
    } catch (error: any) {
      console.log('⊘ Could not update version:', error.message)
    }

    console.log('\n✅ Migration 004 completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateDatabase()


