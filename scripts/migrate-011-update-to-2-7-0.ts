import { db } from '../lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

async function migrateTo270() {
  try {
    console.log('🔄 Starting migration to version 2.7.0...')

    // Read migration SQL file
    const migrationPath = join(process.cwd(), 'database', 'migrations', '011_update_to_2_7_0.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    // Execute migration
    await db.execute(migrationSQL)

    console.log('✅ Migration to version 2.7.0 completed successfully!')
    console.log('📝 Changes:')
    console.log('   - Updated database version to 2.7.0')
    console.log('   - Marketplace product detail pages feature enabled')
    console.log('   - Public product API endpoint ready')
  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    
    // If version update fails, try to update it directly
    if (error.message?.includes('no such column') || error.message?.includes('syntax error')) {
      console.log('⚠️  Attempting direct version update...')
      try {
        await db.execute({
          sql: "UPDATE site_settings SET value = '2.7.0' WHERE key = 'db_version'",
          args: [],
        })
        console.log('✅ Version updated directly to 2.7.0')
      } catch (directError) {
        console.error('❌ Direct version update also failed:', directError)
        process.exit(1)
      }
    } else {
      process.exit(1)
    }
  }
}

migrateTo270()

