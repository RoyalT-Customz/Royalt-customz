import { db } from '../lib/db'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

async function createAdmin() {
  try {
    console.log('Creating admin user...\n')

    // Default admin credentials
    const adminUsername = process.env.ADMIN_USERNAME || 'admin'
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@royaltcustomz.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!@#'
    const adminFirstName = process.env.ADMIN_FIRST_NAME || 'Admin'
    const adminLastName = process.env.ADMIN_LAST_NAME || 'User'

    // Check if admin already exists
    const existingAdmin = await db.execute({
      sql: 'SELECT id, username FROM users WHERE username = ? OR email = ?',
      args: [adminUsername, adminEmail],
    })

    if (existingAdmin.rows.length > 0) {
      const existing = existingAdmin.rows[0] as any
      console.log(`⚠️  Admin user already exists: ${existing.username}`)
      console.log('   To update the admin password, delete the user first or use a different username/email.\n')
      
      // Ask if user wants to update password
      const updatePassword = process.argv.includes('--update-password')
      if (updatePassword) {
        console.log('Updating admin password...')
        const hashedPassword = await bcrypt.hash(adminPassword, 10)
        await db.execute({
          sql: 'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?',
          args: [hashedPassword, adminUsername],
        })
        console.log('✅ Admin password updated successfully!\n')
      } else {
        console.log('   Use --update-password flag to update the password.')
      }
      
      // Show current admin info
      const adminInfo = await db.execute({
        sql: 'SELECT id, username, email, role, is_active, is_verified FROM users WHERE username = ?',
        args: [adminUsername],
      })
      const admin = adminInfo.rows[0] as any
      console.log('Current admin info:')
      console.log(`   ID: ${admin.id}`)
      console.log(`   Username: ${admin.username}`)
      console.log(`   Email: ${admin.email}`)
      console.log(`   Role: ${admin.role}`)
      console.log(`   Active: ${admin.is_active ? 'Yes' : 'No'}`)
      console.log(`   Verified: ${admin.is_verified ? 'Yes' : 'No'}\n`)
      process.exit(0)
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    // Create admin user
    const adminId = '00000000-0000-0000-0000-000000000001'
    const fullName = `${adminFirstName} ${adminLastName}`

    await db.execute({
      sql: `INSERT INTO users (
        id, username, email, password, first_name, last_name, full_name, 
        role, is_active, is_verified, hide_full_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      args: [
        adminId,
        adminUsername,
        adminEmail,
        hashedPassword,
        adminFirstName,
        adminLastName,
        fullName,
        'admin',
        1, // is_active
        1, // is_verified
        1, // hide_full_name (default: only show username)
      ],
    })

    console.log('✅ Admin user created successfully!\n')
    console.log('Admin Credentials:')
    console.log(`   Username: ${adminUsername}`)
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   Role: admin`)
    console.log(`   ID: ${adminId}\n`)
    console.log('⚠️  IMPORTANT: Change the password immediately after first login!\n')

    // Verify creation
    const verify = await db.execute({
      sql: 'SELECT id, username, email, role, is_active, is_verified FROM users WHERE id = ?',
      args: [adminId],
    })

    if (verify.rows.length > 0) {
      const admin = verify.rows[0] as any
      console.log('Verification:')
      console.log(`   ✅ User ID: ${admin.id}`)
      console.log(`   ✅ Username: ${admin.username}`)
      console.log(`   ✅ Email: ${admin.email}`)
      console.log(`   ✅ Role: ${admin.role}`)
      console.log(`   ✅ Active: ${admin.is_active ? 'Yes' : 'No'}`)
      console.log(`   ✅ Verified: ${admin.is_verified ? 'Yes' : 'No'}\n`)
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    process.exit(1)
  }
}

createAdmin()


