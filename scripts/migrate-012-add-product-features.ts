import { db } from '../lib/db'
import { readFileSync } from 'fs'
import { join } from 'path'

async function migrateTo280() {
  try {
    console.log('🔄 Starting migration to version 2.8.0...')

    // Read migration SQL file
    const migrationPath = join(process.cwd(), 'database', 'migrations', '012_add_product_features.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    // Execute migration
    await db.execute(migrationSQL)

    console.log('✅ Migration to version 2.8.0 completed successfully!')
    console.log('📝 Changes:')
    console.log('   - Added key_features column to products table')
    console.log('   - Added framework_support column to products table')
    console.log('   - Added technical_details column to products table')
    console.log('   - Updated database version to 2.8.0')
  } catch (error: any) {
    console.error('❌ Migration failed:', error)
    
    // If column already exists, try to update version only
    if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
      console.log('⚠️  Columns may already exist, updating version only...')
      try {
        await db.execute({
          sql: "UPDATE site_settings SET value = '2.8.0' WHERE key = 'db_version'",
          args: [],
        })
        console.log('✅ Version updated to 2.8.0')
      } catch (directError) {
        console.error('❌ Version update also failed:', directError)
        process.exit(1)
      }
    } else {
      process.exit(1)
    }
  }
}

migrateTo280()

