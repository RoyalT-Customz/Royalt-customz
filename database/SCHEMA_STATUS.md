# Database Schema Status

## Current Version: 2.8.0

**Last Updated**: 2024  
**Status**: ✅ Up to Date - All Features Included

## Complete Table List (23 Tables)

1. ✅ **users** - User accounts with:
   - Basic info (username, email, password)
   - Profile fields (first_name, last_name, full_name, phone, avatar_url, bio)
   - Role and status (role, is_active, is_verified, last_login)
   - **Discord integration** (discord_user_id, discord_username, discord_display_name, discord_email, discord_server_verified, discord_connected_at)
   - **Privacy settings** (hide_email, hide_phone, privacy_level)

2. ✅ **products** - Product catalog (regular and escrow items)
3. ✅ **orders** - Customer orders
4. ✅ **order_items** - Order line items
5. ✅ **appointments** - Scheduled appointments
6. ✅ **tickets** - Support tickets
7. ✅ **ticket_messages** - Ticket conversations
8. ✅ **reviews** - Product/service reviews
9. ✅ **blog_posts** - Blog articles (with **category** field)
10. ✅ **blog_post_tags** - Blog post tags
11. ✅ **portfolio_items** - Portfolio showcase
12. ✅ **services** - Service types for appointments (NEW in 2.1.0)
13. ✅ **cart_items** - Shopping cart
14. ✅ **wishlist_items** - User wishlists
15. ✅ **payments** - Payment transactions
16. ✅ **coupons** - Discount codes
17. ✅ **coupon_usage** - Coupon tracking
18. ✅ **notifications** - User notifications
19. ✅ **subscriptions** - Newsletter subscriptions
20. ✅ **contact_messages** - Contact form submissions
21. ✅ **site_settings** - Site configuration
22. ✅ **activity_logs** - Activity logging
23. ✅ **password_reset_tokens** - Password reset tokens (NEW in 2.2.0)

## Features Included

### ✅ Version 2.0.0 Features
- User profile fields (first_name, last_name, avatar_url, bio)
- Role-based access (admin/user)
- User status tracking (is_active, is_verified, last_login)

### ✅ Version 2.1.0 Features
- **Services table** - For appointment service types
- **Blog posts category field** - For categorizing blog posts

### ✅ Version 2.2.0 Features
- **Discord integration fields**:
  - discord_user_id
  - discord_username
  - discord_display_name
  - discord_email
  - discord_server_verified
  - discord_connected_at
- **Privacy settings**:
  - hide_email
  - hide_phone
  - privacy_level
- **Password reset tokens table** - For secure password resets

### ✅ Version 2.3.0 Features
- **Enhanced ticket system indexes**:
  - idx_tickets_assigned_to - For admin assignment filtering
  - idx_tickets_updated_at - For sorting by last update
  - idx_ticket_messages_is_admin - For filtering admin/user messages
- **Complete ticket system** - Full CRUD with real-time updates
- **Discord verification requirements** - For appointments and tickets

### ✅ Version 2.4.0 Features
- **Appointment location field** - Added `location` column to appointments table
- **Enhanced appointment management** - Location tracking for appointments
- **Location sync** - Admin and client location preferences sync

### ✅ Version 2.5.0 Features
- **Hide full name default** - Set `hide_full_name = 1` as default for all users
- **Privacy settings enhancement** - Users can control visibility of full name

### ✅ Version 2.6.0 Features
- **Password reset tokens table** - Complete password reset system with 8-digit codes
- **Password reset indexes** - Optimized indexes for password reset token queries
- **Enhanced password reset flow** - Multi-step password reset with Discord verification

### ✅ Version 2.7.0 Features
- **Marketplace product detail pages** - Individual product pages for better viewing experience
- **Public product API endpoint** - `/api/products/[id]` for fetching single products
- **Enhanced product viewing** - Full product details, images, reviews, and ratings
- **Improved marketplace navigation** - Clickable products linking to detail pages

### ✅ Version 2.8.0 Features (Latest)
- **Product key features** - Customizable key features for each product (stored as JSON)
- **Framework support** - Framework compatibility badges (QBCore, ESX, etc.)
- **Technical details** - Optional technical specifications (code accessibility, subscription, lines of code, etc.)
- **Enhanced admin marketplace** - Admin can now add/edit key features, framework support, and technical details
- **Dynamic product display** - Product detail page displays custom features and framework support from database

## Migration Files Available

1. `001_add_user_fields.sql` - Initial user fields (deprecated, included in schema)
2. `002_add_user_profile_fields.sql` - Profile fields (deprecated, included in schema)
3. `003_add_services_table.sql` - Services table
4. `004_add_blog_category_and_services.sql` - Blog category + services
5. `005_add_discord_privacy_password_reset.sql` - Discord, privacy, password reset
6. `006_update_ticket_indexes.sql` - Ticket system performance indexes
7. `007_add_appointment_location.sql` - Appointment location field
8. `008_set_default_hide_full_name.sql` - Set hide_full_name default
9. `009_add_hide_full_name_column.sql` - Add hide_full_name column if missing
10. `010_ensure_password_reset_setup.sql` - Ensure password_reset_tokens table and indexes
11. `011_update_to_2_7_0.sql` - Update to version 2.7.0 (marketplace product detail pages)
12. `012_add_product_features.sql` - Add key_features, framework_support, technical_details columns

## How to Use

### For Fresh Database
Run the complete schema:
```bash
turso db execute <your-database-name> < database/schema.sql
```

### For Existing Database
Run migrations in order:
```bash
# Run via script (recommended)
npm run migrate-004  # For services and blog category
npm run migrate-005  # For Discord, privacy, password reset
npm run migrate-006  # For ticket system indexes
npm run migrate-007  # For appointment location field

# Or manually
turso db execute <your-database-name> < database/migrations/004_add_blog_category_and_services.sql
turso db execute <your-database-name> < database/migrations/005_add_discord_privacy_password_reset.sql
turso db execute <your-database-name> < database/migrations/006_update_ticket_indexes.sql
turso db execute <your-database-name> < database/migrations/007_add_appointment_location.sql
```

## Verification

To verify your database is up to date, check:
```sql
SELECT value FROM site_settings WHERE key = 'db_version';
```

Should return: `2.8.0`

## All Features Synced

✅ User authentication and profiles  
✅ Products and marketplace  
✅ Orders and order items  
✅ Appointments (with Discord requirement)  
✅ Support tickets (with Discord requirement, real-time updates)  
✅ Reviews  
✅ Blog posts (with categories)  
✅ Portfolio items  
✅ Services (for appointments)  
✅ Discord OAuth integration  
✅ Privacy settings  
✅ Password reset system  
✅ Shopping cart and wishlist  
✅ Payments and coupons  
✅ Notifications and subscriptions  
✅ Contact messages  
✅ Site settings  
✅ Activity logs  

## Next Steps

1. If you have an existing database, run the migrations:
   ```bash
   npm run migrate-004
   npm run migrate-005
   ```

2. Verify the version:
   ```bash
   npm run check-db
   ```

3. The schema is production-ready and includes all features!

