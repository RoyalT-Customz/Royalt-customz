import { db } from '../lib/db'
import bcrypt from 'bcryptjs'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

async function generateAdminSQL() {
  try {
    console.log('Generating admin SQL with hashed password...\n')

    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@royaltcustomz.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#'
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin'
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User'

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    const adminId = '00000000-0000-0000-0000-000000000001'
    const fullName = `${adminFirstName} ${adminLastName}`

    // Read the template SQL file
    const sqlTemplatePath = join(process.cwd(), 'database', 'create-admin.sql')
    let sqlContent = readFileSync(sqlTemplatePath, 'utf-8')

    // Replace the placeholder password hash
    sqlContent = sqlContent.replace(
      /\$2a\$10\$rK8X8X8X8X8X8X8X8X8X8u8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X/,
      hashedPassword
    )

    // Update the values in the INSERT statement
    const insertPattern = /INSERT OR REPLACE INTO users[\s\S]+?;/
    const newInsert = `INSERT OR REPLACE INTO users (
    id,
    username,
    email,
    password,
    first_name,
    last_name,
    full_name,
    role,
    is_active,
    is_verified,
    hide_full_name,
    created_at,
    updated_at
) VALUES (
    '${adminId}',
    '${adminUsername}',
    '${adminEmail}',
    '${hashedPassword}',
    '${adminFirstName}',
    '${adminLastName}',
    '${fullName}',
    'admin',
    1,
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);`

    sqlContent = sqlContent.replace(insertPattern, newInsert)

    // Write the updated SQL file
    writeFileSync(sqlTemplatePath, sqlContent, 'utf-8')

    console.log('✅ Admin SQL file updated with hashed password!')
    console.log(`   File: database/create-admin.sql`)
    console.log(`   Username: ${adminUsername}`)
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   Password Hash: ${hashedPassword.substring(0, 20)}...\n`)
    console.log('You can now run this SQL file in Turso:\n')
    console.log('   turso db shell <database-name> < database/create-admin.sql\n')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error generating admin SQL:', error)
    process.exit(1)
  }
}

generateAdminSQL()

