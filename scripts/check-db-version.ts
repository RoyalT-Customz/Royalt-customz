import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from '../lib/db'

async function main() {
  try {
    console.log('Checking database version...')
    
    // Check if site_settings table exists and has version
    try {
      const result = await db.execute({
        sql: "SELECT value FROM site_settings WHERE key = 'db_version'",
      })
      
      if (result.rows.length > 0) {
        const currentVersion = (result.rows[0] as any).value
        const expectedVersion = readFileSync(join(process.cwd(), 'database', 'VERSION.txt'), 'utf-8').trim()
        
        console.log(`Current database version: ${currentVersion}`)
        console.log(`Expected version: ${expectedVersion}`)
        
        if (currentVersion === expectedVersion) {
          console.log('✅ Database is up to date!')
        } else {
          console.log('⚠️  Database version mismatch. Consider running migrations.')
        }
      } else {
        console.log('⚠️  No version found in database. Run initialization script.')
      }
    } catch (error) {
      console.log('⚠️  Database may not be initialized. Run: npm run init-db-sql')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error checking database version:', error)
    process.exit(1)
  }
}

main()


