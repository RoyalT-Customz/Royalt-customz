-- Create Admin User
-- Run this after initializing the database schema
-- Default credentials: admin / Admin123!@#
-- IMPORTANT: Change the password immediately after first login!

-- The password hash below is for: Admin123!@#
-- To generate a new hash, use: npm run create-admin

INSERT OR REPLACE INTO users (
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
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@royaltcustomz.com',
    '$2a$10$rK8X8X8X8X8X8X8X8X8X8u8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', -- This will be replaced by the script
    'Admin',
    'User',
    'Admin User',
    'admin',
    1,
    1,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Verify admin user was created
SELECT id, username, email, role, is_active, is_verified, created_at 
FROM users 
WHERE username = 'admin';


