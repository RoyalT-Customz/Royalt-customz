import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from '../lib/db'

async function migrate() {
  try {
    console.log('Starting migration: Add Advanced Chat Features (014)')

    // Read the SQL file
    const sqlPath = join(process.cwd(), 'database', 'migrations', '014_add_chat_advanced_features.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.execute(statement)
          console.log('✓ Executed statement')
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log('⚠ Statement already applied (skipping)')
          } else {
            throw error
          }
        }
      }
    }

    // Try to add thread_id column to chat_messages if it doesn't exist
    try {
      await db.execute({
        sql: 'ALTER TABLE chat_messages ADD COLUMN thread_id TEXT',
      })
      console.log('✓ Added thread_id column to chat_messages')
    } catch (error: any) {
      if (!error.message?.includes('duplicate column') && !error.message?.includes('no such column')) {
        console.log('⚠ Could not add thread_id column (may already exist)')
      }
    }

    // Update database version
    try {
      await db.execute({
        sql: "UPDATE site_settings SET value = '2.10.0' WHERE key = 'db_version'",
      })
      console.log('✓ Updated database version to 2.10.0')
    } catch (error: any) {
      if (!error.message?.includes('no such table')) {
        throw error
      }
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

migrate()

