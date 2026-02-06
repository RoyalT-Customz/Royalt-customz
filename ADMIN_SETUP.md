# Admin User Setup Guide

This guide explains how to create an admin user for your RoyalT Customz website.

## Method 1: Using TypeScript Script (Recommended)

This method creates the admin user directly in your Turso database.

### Step 1: Set Environment Variables (Optional)

You can customize the admin credentials by setting these in your `.env.local`:

```env
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@royaltcustomz.com
ADMIN_PASSWORD=Admin123!@#
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
```

If not set, the script will use the default values shown above.

### Step 2: Run the Script

```bash
npm run create-admin
```

This will:
- ✅ Create an admin user with role 'admin'
- ✅ Hash the password securely
- ✅ Set the user as active and verified
- ✅ Show you the credentials

### Step 3: Update Password (if needed)

To update an existing admin password:

```bash
npm run create-admin -- --update-password
```

## Method 2: Using SQL File

This method generates a SQL file that you can run directly in Turso.

### Step 1: Generate SQL File

```bash
npm run create-admin-sql
```

This will update `database/create-admin.sql` with a properly hashed password.

### Step 2: Run SQL in Turso

```bash
turso db shell <your-database-name> < database/create-admin.sql
```

Or if you're using the Turso web console, copy and paste the contents of `database/create-admin.sql`.

## Default Admin Credentials

⚠️ **IMPORTANT: Change these immediately after first login!**

- **Username:** `admin`
- **Email:** `admin@royaltcustomz.com`
- **Password:** `Admin123!@#`
- **Role:** `admin`

## Customizing Admin Credentials

### Option 1: Environment Variables

Create or update `.env.local`:

```env
ADMIN_USERNAME=myadmin
ADMIN_EMAIL=myadmin@example.com
ADMIN_PASSWORD=MySecurePassword123!
ADMIN_FIRST_NAME=John
ADMIN_LAST_NAME=Doe
```

Then run:
```bash
npm run create-admin
```

### Option 2: Edit SQL File

1. Run `npm run create-admin-sql` to generate the SQL file
2. Edit `database/create-admin.sql` with your desired values
3. Make sure to hash the password using bcrypt (or use the script)
4. Run the SQL file in Turso

## Verifying Admin User

After creating the admin user, you can verify it by:

1. **Via Script:**
   ```bash
   npm run create-admin
   ```
   (It will show existing admin info if one already exists)

2. **Via SQL:**
   ```sql
   SELECT id, username, email, role, is_active, is_verified 
   FROM users 
   WHERE username = 'admin';
   ```

3. **Via Login:**
   - Go to `/login`
   - Use the admin credentials
   - You should be redirected to `/admin` dashboard

## Troubleshooting

### "Admin user already exists"

If you see this message:
- The admin user is already created
- Use `--update-password` flag to update the password
- Or delete the existing admin and create a new one

### "Error: Missing TURSO_DATABASE_URL"

Make sure your `.env.local` file has:
```env
TURSO_DATABASE_URL=libsql://your-database-url
TURSO_AUTH_TOKEN=your-auth-token
```

### "Cannot connect to database"

- Verify your Turso credentials are correct
- Check your internet connection
- Ensure the database exists in your Turso account

## Security Best Practices

1. ✅ **Change default password immediately** after first login
2. ✅ **Use a strong password** (min 12 characters, mixed case, numbers, symbols)
3. ✅ **Don't commit** `.env.local` to version control
4. ✅ **Use environment variables** for production credentials
5. ✅ **Enable 2FA** if available in your admin panel
6. ✅ **Regularly audit** admin user access

## Admin Features

Once logged in as admin, you'll have access to:

- `/admin` - Admin dashboard
- `/admin/marketplace` - Manage products
- `/admin/blogs` - Manage blog posts
- `/admin/portfolio` - Manage portfolio items
- `/admin/services` - Manage services
- Full access to all user data and settings


