# Database Schema Documentation

This directory contains the complete SQL schema for the RoyalT Customz website database.

## Files

- `schema.sql` - Complete database schema with all tables, indexes, and initial data

## Database Structure

### Core Tables

1. **users** - User accounts and authentication
2. **products** - Product catalog (regular and escrow items)
3. **orders** - Customer orders
4. **order_items** - Order line items
5. **appointments** - Scheduled appointments for classes
6. **tickets** - Support ticket system
7. **ticket_messages** - Ticket conversation messages
8. **reviews** - Product and service reviews
9. **blog_posts** - Blog articles
10. **blog_post_tags** - Blog post tags
11. **portfolio_items** - Portfolio showcase items

### E-commerce Tables

12. **cart_items** - Shopping cart items (user or session-based)
13. **wishlist_items** - User wishlists
14. **payments** - Payment transactions
15. **coupons** - Discount coupons
16. **coupon_usage** - Coupon usage tracking

### Communication Tables

17. **notifications** - User notifications
18. **subscriptions** - Newsletter subscriptions
19. **contact_messages** - Contact form submissions

### System Tables

20. **site_settings** - Site configuration
21. **activity_logs** - User activity logging

## How to Use

### Option 1: Using Turso CLI

```bash
# Install Turso CLI if not already installed
# Then run:
turso db execute royalt-customz-website-deltaravo42 < database/schema.sql
```

### Option 2: Using the Node.js Script

```bash
npm run init-db
```

This will use the `lib/db.ts` initialization function.

### Option 3: Manual Execution

You can copy and paste the SQL from `schema.sql` into your Turso database dashboard or use any SQL client that supports libSQL.

## Table Relationships

```
users
  ├── orders (1:N)
  ├── appointments (1:N)
  ├── tickets (1:N)
  ├── reviews (1:N)
  ├── cart_items (1:N)
  ├── wishlist_items (1:N)
  └── notifications (1:N)

orders
  ├── order_items (1:N)
  ├── payments (1:N)
  └── coupon_usage (1:N)

products
  ├── order_items (1:N)
  ├── reviews (1:N)
  ├── cart_items (1:N)
  └── wishlist_items (1:N)

tickets
  └── ticket_messages (1:N)

blog_posts
  ├── blog_post_tags (1:N)
  └── users (author) (N:1)
```

## Indexes

All tables have appropriate indexes for:
- Foreign keys
- Frequently queried columns
- Search operations
- Sorting operations

## Notes

- All IDs use TEXT type with UUID format
- Timestamps use DATETIME with CURRENT_TIMESTAMP defaults
- Foreign keys have appropriate ON DELETE actions (CASCADE or SET NULL)
- Boolean values use INTEGER (0 or 1)
- All tables include created_at and updated_at timestamps where applicable

## Maintenance

To update the schema:
1. Make changes to `schema.sql`
2. Test in development environment
3. Create migration scripts for production
4. Backup database before applying changes


