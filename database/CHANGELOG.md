# Database Schema Changelog

## Version 2.0.0 - Complete Production Schema
**Date:** Current  
**Status:** Production Ready

### Major Updates
- ✅ Added `role` field to users table (default: 'user', supports 'admin')
- ✅ Added `first_name` and `last_name` fields to users table
- ✅ Added `avatar_url` and `bio` fields for user profiles
- ✅ Added `is_active` and `is_verified` flags
- ✅ Added `last_login` tracking
- ✅ Added index for `role` field for admin queries
- ✅ All tables include proper foreign keys and indexes
- ✅ Complete schema for e-commerce, appointments, tickets, and content management

### Tables Included (21 total)
1. users - User accounts with roles
2. products - Product catalog
3. orders - Customer orders
4. order_items - Order line items
5. appointments - Scheduled appointments
6. tickets - Support tickets
7. ticket_messages - Ticket conversations
8. reviews - Product/service reviews
9. blog_posts - Blog articles
10. blog_post_tags - Blog post tags
11. portfolio_items - Portfolio showcase
12. cart_items - Shopping cart
13. wishlist_items - User wishlists
14. payments - Payment transactions
15. coupons - Discount codes
16. coupon_usage - Coupon tracking
17. notifications - User notifications
18. subscriptions - Newsletter subscriptions
19. contact_messages - Contact form submissions
20. site_settings - Site configuration
21. activity_logs - Activity logging

### Migration Notes
If you have an existing database, run the migration script:
```sql
-- See database/migrations/001_add_user_fields.sql
```

### Admin User Setup
To create an admin user:
```sql
UPDATE users SET role = 'admin' WHERE username = 'your_admin_username';
```

## Version 1.0.0 - Initial Schema
**Date:** Initial Release
- Basic user authentication
- Core tables for products, orders, appointments
- Support ticket system


