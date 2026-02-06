import { db } from '../lib/db'

async function migrateDatabase() {
  try {
    console.log('Starting migration 009: Add hide_full_name column...\n')

    // Check if hide_full_name column exists
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

    // Check if hide_full_name column exists
    const hideFullNameExists = await checkColumn('users', 'hide_full_name')
    
    if (!hideFullNameExists) {
      console.log('⚠️  hide_full_name column does not exist. Adding it...')
      try {
        await db.execute({
          sql: 'ALTER TABLE users ADD COLUMN hide_full_name INTEGER DEFAULT 1',
        })
        console.log('✅ Added hide_full_name column with default value 1')
      } catch (error: any) {
        if (error.message?.includes('duplicate column') || error.message?.includes('already exists')) {
          console.log('⊘ Column already exists: hide_full_name')
        } else {
          console.error('✗ Error adding hide_full_name column:', error.message)
          throw error
        }
      }
    } else {
      console.log('⊘ hide_full_name column already exists')
    }

    // Update all existing users to have hide_full_name = 1 if it's NULL
    try {
      const result = await db.execute({
        sql: 'UPDATE users SET hide_full_name = 1 WHERE hide_full_name IS NULL',
      })
      console.log(`✅ Updated users with NULL hide_full_name to 1`)
    } catch (error: any) {
      console.error('✗ Error updating users:', error.message)
      // Don't throw - this is not critical if column doesn't exist
    }

    // Update database version
    try {
      await db.execute({
        sql: `INSERT OR REPLACE INTO site_settings (id, key, value, type, description) 
              VALUES ('db-version', 'db_version', '2.5.1', 'text', 'Database schema version')`,
      })
      console.log('✅ Updated database version to 2.5.1')
    } catch (error: any) {
      console.log('⊘ Could not update version:', error.message)
    }

    console.log('\n✅ Migration 009 completed successfully!')
    console.log('hide_full_name column has been added to the users table')
    process.exit(0)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrateDatabase()



