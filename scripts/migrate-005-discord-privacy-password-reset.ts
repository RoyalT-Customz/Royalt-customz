import { db } from '../lib/db'

async function migrateDatabase() {
  try {
    console.log('Starting migration 005: Add Discord, privacy, and password reset...\n')

    // Check if column exists
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
        const result = await db.execute({
          sql: `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
          args: [tableName],
        })
        return result.rows.length > 0
      } catch (error) {
        return false
      }
    }

    // Discord fields
    const discordFields = [
      { name: 'discord_user_id', type: 'TEXT' },
      { name: 'discord_username', type: 'TEXT' },
      { name: 'discord_display_name', type: 'TEXT' },
      { name: 'discord_email', type: 'TEXT' },
      { name: 'discord_server_verified', type: 'INTEGER DEFAULT 0' },
      { name: 'discord_connected_at', type: 'DATETIME' },
    ]

    for (const field of discordFields) {
      const exists = await checkColumn('users', field.name)
      if (!exists) {
        try {
          await db.execute({
            sql: `ALTER TABLE users ADD COLUMN ${field.name} ${field.type}`,
          })
          console.log(`✅ Added column: ${field.name}`)
        } catch (error: any) {
          if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
            console.log(`⊘ Column already exists: ${field.name}`)
          } else {
            console.error(`✗ Error adding column ${field.name}:`, error.message)
          }
        }
      } else {
        console.log(`⊘ Column already exists: ${field.name}`)
      }
    }

    // Privacy fields
    const privacyFields = [
      { name: 'hide_email', type: 'INTEGER DEFAULT 0' },
      { name: 'hide_phone', type: 'INTEGER DEFAULT 0' },
      { name: 'hide_full_name', type: 'INTEGER DEFAULT 1' },
      { name: 'privacy_level', type: 'TEXT DEFAULT "public"' },
    ]

    for (const field of privacyFields) {
      const exists = await checkColumn('users', field.name)
      if (!exists) {
        try {
          await db.execute({
            sql: `ALTER TABLE users ADD COLUMN ${field.name} ${field.type}`,
          })
          console.log(`✅ Added column: ${field.name}`)
        } catch (error: any) {
          if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
            console.log(`⊘ Column already exists: ${field.name}`)
          } else {
            console.error(`✗ Error adding column ${field.name}:`, error.message)
          }
        }
      } else {
        console.log(`⊘ Column already exists: ${field.name}`)
      }
    }

    // Create indexes for Discord fields
    const discordIndexes = [
      { name: 'idx_users_discord_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_users_discord_user_id ON users(discord_user_id)' },
      { name: 'idx_users_discord_server_verified', sql: 'CREATE INDEX IF NOT EXISTS idx_users_discord_server_verified ON users(discord_server_verified)' },
    ]

    for (const index of discordIndexes) {
      try {
        await db.execute({ sql: index.sql })
        console.log(`✅ Created index: ${index.name}`)
      } catch (error: any) {
        console.error(`✗ Error creating index ${index.name}:`, error.message)
      }
    }

    // Create password_reset_tokens table
    const passwordResetTableExists = await checkTable('password_reset_tokens')
    if (!passwordResetTableExists) {
      try {
        await db.execute({
          sql: `CREATE TABLE IF NOT EXISTS password_reset_tokens (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at DATETIME NOT NULL,
            used INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )`,
        })
        console.log('✅ Created password_reset_tokens table')
      } catch (error: any) {
        console.error('✗ Error creating password_reset_tokens table:', error.message)
        throw error
      }
    } else {
      console.log('⊘ password_reset_tokens table already exists')
    }

    // Create indexes for password_reset_tokens
    const resetTokenIndexes = [
      { name: 'idx_password_reset_tokens_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)' },
      { name: 'idx_password_reset_tokens_token', sql: 'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)' },
      { name: 'idx_password_reset_tokens_expires_at', sql: 'CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)' },
    ]

    for (const index of resetTokenIndexes) {
      try {
        await db.execute({ sql: index.sql })
        console.log(`✅ Created index: ${index.name}`)
      } catch (error: any) {
        console.error(`✗ Error creating index ${index.name}:`, error.message)
      }
    }

    // Update database version
    try {
      await db.execute({
        sql: `INSERT OR REPLACE INTO site_settings (id, key, value, type, description) 
              VALUES ('db-version', 'db_version', '2.2.0', 'text', 'Database schema version')`,
      })
      console.log('✅ Updated database version to 2.2.0')
    } catch (error: any) {
      console.log('⊘ Could not update version:', error.message)
    }

    console.log('\n✅ Migration 005 completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateDatabase()


