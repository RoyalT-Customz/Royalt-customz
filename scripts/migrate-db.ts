import { db } from '../lib/db'

async function migrateDatabase() {
  try {
    console.log('Starting database migration...\n')

    // Check if columns exist by trying to select them
    const checkColumns = async (columnName: string): Promise<boolean> => {
      try {
        await db.execute({
          sql: `SELECT ${columnName} FROM users LIMIT 1`,
        })
        return true
      } catch (error: any) {
        if (error.message?.includes('no such column')) {
          return false
        }
        throw error
      }
    }

    // List of columns to add
    const columnsToAdd = [
      { name: 'first_name', type: 'TEXT' },
      { name: 'last_name', type: 'TEXT' },
      { name: 'avatar_url', type: 'TEXT' },
      { name: 'bio', type: 'TEXT' },
      { name: 'role', type: 'TEXT DEFAULT "user"' },
      { name: 'is_active', type: 'INTEGER DEFAULT 1' },
      { name: 'is_verified', type: 'INTEGER DEFAULT 0' },
      { name: 'last_login', type: 'DATETIME' },
    ]

    // Add missing columns
    for (const column of columnsToAdd) {
      const exists = await checkColumns(column.name)
      if (!exists) {
        try {
          await db.execute({
            sql: `ALTER TABLE users ADD COLUMN ${column.name} ${column.type}`,
          })
          console.log(`✅ Added column: ${column.name}`)
        } catch (error: any) {
          if (error.message?.includes('duplicate column')) {
            console.log(`⊘ Column already exists: ${column.name}`)
          } else {
            console.error(`✗ Error adding column ${column.name}:`, error.message)
          }
        }
      } else {
        console.log(`⊘ Column already exists: ${column.name}`)
      }
    }

    // Create indexes
    const indexes = [
      { name: 'idx_users_last_login', sql: 'CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login)' },
      { name: 'idx_users_is_active', sql: 'CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active)' },
      { name: 'idx_users_role', sql: 'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)' },
    ]

    for (const index of indexes) {
      try {
        await db.execute({ sql: index.sql })
        console.log(`✅ Created index: ${index.name}`)
      } catch (error: any) {
        console.error(`✗ Error creating index ${index.name}:`, error.message)
      }
    }

    // Update existing users with defaults
    try {
      await db.execute({
        sql: "UPDATE users SET role = 'user' WHERE role IS NULL",
      })
      await db.execute({
        sql: 'UPDATE users SET is_active = 1 WHERE is_active IS NULL',
      })
      await db.execute({
        sql: 'UPDATE users SET is_verified = 0 WHERE is_verified IS NULL',
      })
      console.log('✅ Updated existing users with defaults')
    } catch (error: any) {
      console.error('✗ Error updating users:', error.message)
    }

    // Update site_settings with version
    try {
      await db.execute({
        sql: `INSERT OR REPLACE INTO site_settings (id, key, value, type, description) 
              VALUES ('db-version', 'db_version', '2.0.0', 'text', 'Database schema version')`,
      })
      console.log('✅ Updated database version to 2.0.0')
    } catch (error: any) {
      console.log('⊘ Could not update version (site_settings table may not exist yet)')
    }

    console.log('\n✅ Database migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateDatabase()


