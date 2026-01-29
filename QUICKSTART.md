# 🚀 Quick Start Guide

Get the Real Estate Platform running in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- npm or yarn

## 1. Install Dependencies (2 min)

```bash
# Backend
cd server && npm install

# Frontend (in another terminal)
cd client && npm install
```

## 2. Setup Database (1 min)

```bash
cd server

# Create database and apply migrations
npx prisma migrate deploy

# Seed with test data (managers, tenants, properties, etc.)
npm run seed:simple
```

## 3. Start Servers (1 min)

**Terminal 1 - Backend**:

```bash
cd server && npm run dev
# Running on http://localhost:3002
```

**Terminal 2 - Frontend**:

```bash
cd client && npm run dev
# Running on http://localhost:3000
```

## 4. Login (1 min)

Visit `http://localhost:3000/login`

**Test Credentials**:

```
Manager: manager@test.com / password123
Tenant: tenant@test.com / password789
```

---

## ✅ You're Done!

- Managers: See dashboard at `/managers/properties`
- Tenants: Browse properties at `/search`

---

## Common Issues

**"database does not exist"**

```bash
# Create database first
createdb realestate
npx prisma migrate deploy
```

**"Port 3002 already in use"**

```bash
# Change port in server/.env
PORT=3003
```

**"Cannot find module bcryptjs"**

```bash
cd server && npm install bcryptjs
```

---

## Next Steps

- Read [AUTHENTICATION.md](./AUTHENTICATION.md) for auth details
- Read [README.md](./README.md) for full documentation
- Check out example queries in AUTHENTICATION.md
- Explore the `/managers` and `/search` pages

---

## Development Commands

```bash
# Backend
npm run dev       # Start with hot reload
npm run build     # Compile TypeScript
npm run seed:simple # Reseed database

# Frontend
npm run dev       # Start dev server
npm run build     # Build for production
npm run lint      # Check code quality
```

Enjoy building! 🎉
