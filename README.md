# RoyalT Customz Website

A modern, full-featured website for RoyalT Customz offering custom services, products, appointments, and more.

## 🚀 Features

### User Features
- **User Authentication** - Registration with custom username, login, session management
- **Account Dashboard** - Personal dashboard with stats, orders, appointments
- **Order Management** - View order history and track status
- **Appointment Booking** - Schedule 1-on-1 classes (MLO, Shell, Chain, Tattoo, Face, Other)
- **Support Tickets** - Create and manage support tickets
- **Profile Settings** - Manage account information

### Admin Features
- **Admin Dashboard** - Complete admin panel at `/admin`
- **Content Management** - Manage marketplace, blogs, portfolio, services
- **User Management** - View and manage users
- **Order Management** - View and process orders
- **Appointment Management** - Manage appointments
- **Ticket Management** - Handle support tickets

### Website Features
- **Marketplace** - Product catalog with shopping cart
- **Blog** - Content management and blog posts
- **Portfolio** - Showcase gallery
- **Reviews** - Customer review system
- **Contact** - Contact form and information

## 📦 Tech Stack

- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Turso (libSQL) - Cloud SQLite
- **Authentication:** JWT with HTTP-only cookies
- **Icons:** Lucide React
- **Calendar:** React Calendar

## 🗄️ Database

- **Version:** 2.0.0 (Production Ready)
- **Type:** Turso (libSQL)
- **Tables:** 21 tables with complete relationships
- **Status:** Fully synced with website

### Database Setup

1. **Environment Variables** - Create `.env.local`:
```env
TURSO_DATABASE_URL=libsql://royalt-customz-website-deltaravo42.aws-us-east-2.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
JWT_SECRET=your_strong_secret_key_here
```

2. **Initialize Database:**
```bash
npm run init-db-sql
```

3. **Check Database Version:**
```bash
npm run check-db
```

See `DEPLOYMENT.md` and `database/schema.sql` for complete setup instructions.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Turso database account
- Environment variables configured

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create `.env.local` with your Turso credentials

3. **Initialize database:**
```bash
npm run init-db-sql
```

4. **Run development server:**
```bash
npm run dev
```

5. **Open browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
royalt-customz/
├── app/
│   ├── account/          # User account pages
│   │   ├── dashboard/    # User dashboard
│   │   ├── overview/     # Account overview
│   │   ├── orders/       # Order history
│   │   ├── appointments/ # Appointments
│   │   ├── tickets/      # Support tickets
│   │   └── settings/     # Account settings
│   ├── admin/            # Admin panel
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── account/      # Account data endpoints
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── ...               # Other pages
├── components/           # React components
├── lib/                  # Utilities
│   ├── db.ts            # Database connection
│   └── auth.ts          # Authentication helpers
├── database/             # Database files
│   ├── schema.sql       # Complete database schema
│   └── migrations/      # Migration scripts
└── scripts/             # Utility scripts
```

## 🔐 Authentication

- Users can create accounts with custom usernames
- JWT-based authentication
- HTTP-only cookies for security
- Role-based access (user/admin)
- Auto-login after registration

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Account (Authenticated)
- `GET /api/account/stats` - User statistics
- `GET /api/account/orders` - User orders
- `GET /api/account/appointments` - User appointments
- `GET /api/account/tickets` - User tickets

## 🎨 Design

- Modern, dark theme
- Red, black, and grey color palette
- Responsive design
- Smooth animations
- Professional UI/UX

## 📝 Database Schema

Complete schema with 21 tables:
- Users (with roles)
- Products
- Orders & Order Items
- Appointments
- Tickets & Ticket Messages
- Reviews
- Blog Posts & Tags
- Portfolio Items
- Cart & Wishlist
- Payments
- Coupons
- Notifications
- Subscriptions
- Contact Messages
- Site Settings
- Activity Logs

See `database/schema.sql` for full details.

## 🚢 Deployment

See `DEPLOYMENT.md` for complete deployment instructions.

### Quick Deploy Checklist:
1. ✅ Database schema ready (v2.0.0)
2. ✅ Environment variables configured
3. ✅ Database initialized
4. ✅ Admin user created
5. ⏳ Deploy to hosting platform

## 📄 License

Private - RoyalT Customz

## 🔗 Links

- Database Schema: `database/schema.sql`
- Deployment Guide: `DEPLOYMENT.md`
- Database Sync Status: `DATABASE_SYNC_STATUS.md`
- Turso Setup: `TURSO_SETUP.md`
