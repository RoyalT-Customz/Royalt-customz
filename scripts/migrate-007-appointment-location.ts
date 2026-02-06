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
    console.log('Starting migration 007: Add Appointment Location...')

    // Check if location column already exists
    const tableInfo = await db.execute(`
      PRAGMA table_info(appointments)
    `)

    const hasLocation = tableInfo.rows.some((row: any) => row.name === 'location')

    if (hasLocation) {
      console.log('Location column already exists in appointments table')
    } else {
      console.log('Adding location column to appointments table...')
      await db.execute(`
        ALTER TABLE appointments ADD COLUMN location TEXT
      `)
      console.log('✅ Location column added successfully')
    }

    // Update database version
    console.log('Updating database version to 2.4.0...')
    await db.execute(`
      UPDATE site_settings SET value = '2.4.0' WHERE key = 'db_version'
    `)

    // Verify version
    const versionCheck = await db.execute(`
      SELECT value FROM site_settings WHERE key = 'db_version'
    `)
    const version = versionCheck.rows[0]?.value
    console.log(`✅ Database version updated to: ${version}`)

    console.log('✅ Migration 007 completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    db.close()
  }
}

migrate()



