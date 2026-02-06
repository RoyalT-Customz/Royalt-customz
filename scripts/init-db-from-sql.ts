import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from '../lib/db'

async function main() {
  try {
    console.log('Reading SQL schema file...')
    const sqlPath = join(process.cwd(), 'database', 'schema.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    console.log('Executing SQL schema...')
    
    // Split SQL by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await db.execute(statement)
          console.log(`✓ Executed: ${statement.substring(0, 50)}...`)
        } catch (error: any) {
          // Ignore "already exists" errors
          if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
            console.log(`⊘ Skipped (already exists): ${statement.substring(0, 50)}...`)
          } else {
            console.error(`✗ Error executing statement:`, error.message)
            console.error(`Statement: ${statement.substring(0, 100)}...`)
          }
        }
      }
    }

    console.log('\n✅ Database schema initialized successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    process.exit(1)
  }
}

main()


