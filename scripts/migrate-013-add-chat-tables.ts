import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from '../lib/db'

async function migrate() {
  try {
    console.log('Starting migration: Add Chat Tables (013)')

    // Read the SQL file
    const sqlPath = join(process.cwd(), 'database', 'migrations', '013_add_chat_tables.sql')
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

    // Update database version
    try {
      await db.execute({
        sql: "UPDATE site_settings SET value = '2.9.0' WHERE key = 'db_version'",
      })
      console.log('✓ Updated database version to 2.9.0')
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

