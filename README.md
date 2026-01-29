# 🏠 Real Estate Platform

A modern full-stack real estate management platform built with **Next.js**, **Express.js**, **Prisma**, and **PostgreSQL**. Manage properties, tenants, leases, and applications with an intuitive interface and powerful backend.

---

## 🎯 Features

- 🔐 **Authentication** - AWS Cognito integration with role-based access control
- 🗺️ **Interactive Maps** - Mapbox integration for property visualization
- 📋 **Property Management** - Create, edit, and manage rental properties
- 👥 **Tenant Management** - Track tenant information and applications
- 📅 **Lease Management** - Manage lease agreements and payments
- 🔍 **Advanced Search** - Filter properties by location, price, amenities, and more
- 💾 **Database** - PostgreSQL with PostGIS for geospatial queries
- ⚡ **Performance Optimized** - Token caching and request deduplication

---

## 📋 Prerequisites

Before running the project, ensure you have:

- **Node.js** 18+ and **npm**
- **PostgreSQL** 12+ (running locally or remotely)
- **AWS Cognito** user pool configured (for authentication)
- **Mapbox** access token (for map features)

---

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd realestate

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment Variables

**Backend** (`server/.env`):

```env
PORT=3002
DATABASE_URL="postgresql://username:password@localhost:5432/realestate"
AWS_REGION=us-east-2
S3_BUCKET_NAME=your-s3-bucket
```

**Frontend** (`client/.env`):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3002
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=your-cognito-pool-id
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=your-client-id
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

### 3. Set Up Database

```bash
cd server

# Create database and run migrations
npx prisma migrate dev

# Seed database with test data
npm run seed:simple
```

### 4. Start the Application

**Terminal 1 - Backend Server**:

```bash
cd server
npm run dev
# Server runs on http://localhost:3002
```

**Terminal 2 - Frontend Application**:

```bash
cd client
npm run dev
# Application runs on http://localhost:3001
```

Access the application at: **http://localhost:3001**

---

## 🧪 Test Accounts

The `seed:simple` command creates two test accounts for development:

### Manager Account

```
Email: manager@test.com
Name: John Manager
Cognito ID: manager-test-001
```

**Access**: Manager dashboard at `/managers/properties`

### Tenant Account

```
Email: tenant@test.com
Name: Jane Tenant
Cognito ID: tenant-test-001
```

**Access**: Property search at `/search` and favorites at `/tenants/favorites`

**Note**: In production, use real AWS Cognito authentication. These test accounts are for local development only.

---

## 📁 Project Structure

```
realestate/
├── client/                          # Next.js frontend
│   ├── src/
│   │   ├── app/                     # Next.js app router
│   │   ├── components/              # React components
│   │   ├── context/                 # React context (auth state)
│   │   ├── state/                   # Redux Toolkit + RTK Query
│   │   ├── lib/                     # Utilities and schemas
│   │   └── types/                   # TypeScript definitions
│   └── .env                         # Frontend environment variables
│
├── server/                          # Express backend
│   ├── src/
│   │   ├── index.ts                 # Server entry point
│   │   ├── controllers/             # Business logic
│   │   ├── routes/                  # API routes
│   │   ├── middleware/              # Auth & other middleware
│   │   └── types/                   # TypeScript definitions
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   ├── seed.ts                  # Full database seed
│   │   └── seed-simple.ts           # Minimal seed (2 test users)
│   └── .env                         # Backend environment variables
│
└── README.md                        # This file
```

---

## 🔧 Available Scripts

### Backend

```bash
npm run dev           # Start development server with hot reload
npm run build         # Compile TypeScript to JavaScript
npm run start         # Run compiled server
npm run seed          # Seed database with full test data
npm run seed:simple   # Seed database with minimal test data (2 users)
```

### Frontend

```bash
npm run dev           # Start Next.js development server
npm run build         # Build production bundle
npm run start         # Start production server
npm run lint          # Run ESLint
```

---

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit + RTK Query** - State management & API caching
- **AWS Amplify** - Authentication
- **Mapbox GL** - Interactive maps
- **Tailwind CSS** - Styling
- **Radix UI** - Component library

### Backend

- **Express.js** - Web framework
- **Prisma** - ORM with PostgreSQL
- **PostGIS** - Geospatial queries
- **AWS SDK** - S3 file uploads
- **JWT** - Token authentication
- **TypeScript** - Type safety

### Database

- **PostgreSQL** - Primary database
- **PostGIS** - Geographic data support

---

## 📚 API Documentation

The backend API is available at `http://localhost:3002` during development.

### Main Endpoints

**Properties**:

- `GET /properties` - List all properties with filters
- `GET /properties/:id` - Get property details
- `POST /properties` - Create new property (manager only)

**Managers**:

- `GET /managers/:cognitoId` - Get manager profile
- `GET /managers/:cognitoId/properties` - Get manager's properties

**Tenants**:

- `GET /tenants/:cognitoId` - Get tenant profile
- `GET /tenants/:cognitoId/favorites` - Get favorite properties

**Authentication**: All protected endpoints require a Bearer token in the `Authorization` header.

---

## 🔐 Authentication Flow

1. User logs in via AWS Cognito (frontend)
2. Cognito returns `idToken` (JWT)
3. RTK Query automatically includes token in API requests
4. Backend validates JWT and extracts user role
5. Request is processed with role-based access control

---

## ⚡ Performance Features

- **Token Caching**: Reduced authentication latency by 50-80x
- **Request Deduplication**: Auth queries cached at app root via React Context
- **Parallel Requests**: Removed blocking async operations
- **Data Caching**: RTK Query manages automatic cache invalidation

---

## 🐛 Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env` is correct

### Port Already in Use

```
Port 3002 is already in use
```

- Change `PORT` in `server/.env` to an available port
- Update `NEXT_PUBLIC_API_BASE_URL` in `client/.env`

### Cognito Authentication Failed

- Verify credentials in `client/.env`
- Check AWS Cognito user pool configuration
- Ensure user exists in Cognito with correct role claim

### Map Not Loading

- Verify `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in `client/.env`
- Check browser console for errors

---

## 📝 Environment Variables Checklist

### Backend (.env)

- [ ] `PORT` - Server port (default: 3002)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `AWS_REGION` - AWS region for S3
- [ ] `S3_BUCKET_NAME` - S3 bucket name

### Frontend (.env)

- [ ] `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- [ ] `NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID` - Cognito user pool ID
- [ ] `NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID` - Cognito client ID
- [ ] `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - Mapbox access token

---

## 📦 Deployment

### Backend

```bash
cd server
npm run build
npm start
```

### Frontend

```bash
cd client
npm run build
npm start
```

For production, consider:

- Using environment-specific `.env.production` files
- Setting up CI/CD pipeline
- Configuring CDN for static assets
- Enabling HTTPS
- Setting up monitoring and logging

---

## 🤝 Development Guidelines

- Follow the existing code structure
- Use TypeScript for type safety
- Keep components small and focused
- Document complex logic
- Test before pushing changes

---

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review API documentation
3. Check terminal logs for error messages
4. Verify environment variables are set correctly

---

## 📄 License

This project is private and for authorized use only.

---

**Last Updated**: January 29, 2026
**Version**: 1.0.0

Happy coding! 🚀
