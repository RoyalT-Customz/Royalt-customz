import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'

async function migrateDatabase() {
  const dbUrl = process.env.TURSO_DATABASE_URL
  const dbAuthToken = process.env.TURSO_AUTH_TOKEN

  if (!dbUrl || !dbAuthToken) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables')
    process.exit(1)
  }

  const client = createClient({
    url: dbUrl,
    authToken: dbAuthToken,
  })

  try {
    console.log('🔄 Starting migration 010: Ensure password reset setup...')

    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'database', 'migrations', '010_ensure_password_reset_setup.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      try {
        await client.execute(statement)
        console.log('✅ Executed:', statement.substring(0, 50) + '...')
      } catch (error: any) {
        // Ignore errors for ALTER TABLE if column already exists
        const errorMessage = error?.message || error?.cause?.message || String(error || '')
        if (
          errorMessage.includes('duplicate column name') ||
          errorMessage.includes('already exists') ||
          errorMessage.includes('no such column')
        ) {
          console.log('⚠️  Skipped (already exists):', statement.substring(0, 50) + '...')
        } else {
          throw error
        }
      }
    }

    console.log('✅ Migration 010 completed successfully!')
    console.log('📝 Password reset tokens table is now properly set up')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    client.close()
  }
}

migrateDatabase()



