import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'

const dbUrl = process.env.TURSO_DATABASE_URL
const dbToken = process.env.TURSO_AUTH_TOKEN

if (!dbUrl || !dbToken) {
  console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables')
  process.exit(1)
}

const db = createClient({
  url: dbUrl,
  authToken: dbToken,
})

async function migrate() {
  try {
    console.log('Starting migration 006: Update Ticket Indexes...')

    // Check if indexes already exist
    const checkIndexes = await db.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='index' 
      AND name IN ('idx_tickets_assigned_to', 'idx_tickets_updated_at', 'idx_ticket_messages_is_admin')
    `)

    const existingIndexes = checkIndexes.rows.map((row: any) => row.name)

    // Add index for assigned_to
    if (!existingIndexes.includes('idx_tickets_assigned_to')) {
      console.log('Adding index: idx_tickets_assigned_to')
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to)
      `)
    } else {
      console.log('Index idx_tickets_assigned_to already exists')
    }

    // Add index for updated_at
    if (!existingIndexes.includes('idx_tickets_updated_at')) {
      console.log('Adding index: idx_tickets_updated_at')
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_tickets_updated_at ON tickets(updated_at)
      `)
    } else {
      console.log('Index idx_tickets_updated_at already exists')
    }

    // Add index for is_admin
    if (!existingIndexes.includes('idx_ticket_messages_is_admin')) {
      console.log('Adding index: idx_ticket_messages_is_admin')
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_ticket_messages_is_admin ON ticket_messages(is_admin)
      `)
    } else {
      console.log('Index idx_ticket_messages_is_admin already exists')
    }

    // Update database version
    console.log('Updating database version to 2.3.0...')
    await db.execute(`
      UPDATE site_settings SET value = '2.3.0' WHERE key = 'db_version'
    `)

    // Verify version
    const versionCheck = await db.execute(`
      SELECT value FROM site_settings WHERE key = 'db_version'
    `)
    const version = versionCheck.rows[0]?.value
    console.log(`✅ Database version updated to: ${version}`)

    console.log('✅ Migration 006 completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

migrate()


