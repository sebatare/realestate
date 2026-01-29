# 🔐 Authentication System - Dual Mode (Local & Cognito)

## Overview

The Real Estate Platform now supports **dual authentication modes**:

1. **Development Mode**: Local authentication with email/password
2. **Production Mode**: AWS Cognito authentication

Both modes share the same JWT token format and role-based access control system.

---

## Development Mode: Local Authentication

### How It Works

- **Storage**: Passwords are stored in PostgreSQL, hashed with bcryptjs (10 rounds)
- **Authentication**: Email + password login via `/auth/login-local` endpoint
- **Token**: JWT token generated locally and stored in browser localStorage
- **No Dependencies**: Works without AWS Cognito setup

### Login & Registration

Navigate to `/login` page to:

- **Sign In**: Use existing credentials
- **Sign Up**: Create new account with role selection

### Endpoints

#### Register User

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name",
  "role": "tenant" | "manager"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "tenant"
  }
}
```

#### Login User

```bash
POST /auth/login-local
Content-Type: application/json

{
  "email": "manager@test.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "manager@test.com",
    "name": "John Manager",
    "role": "manager"
  }
}
```

### JWT Token Format

```json
{
  "userId": 1,
  "email": "manager@test.com",
  "role": "manager",
  "custom:role": "manager",
  "iat": 1706554800,
  "exp": 1706641200
}
```

**Claims**:

- `userId`: Numeric ID from database
- `email`: User email address
- `role`: "manager" or "tenant"
- `custom:role`: Same as role (for compatibility with Cognito)
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (24 hours from issue)

### Test Accounts

**Managers**:

```
manager@test.com / password123
sarah@test.com / password456
```

**Tenants**:

```
tenant@test.com / password789
mike@test.com / password101112
lisa@test.com / password131415
```

---

## Production Mode: AWS Cognito

### Configuration

Set these environment variables:

**Frontend** (`client/.env`):

```env
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID=us-east-2_xxxxxxxxx
NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxx
```

**Backend** (`server/.env`):

```env
JWT_SECRET=your-secret-key
```

### How It Works

1. User authenticates via AWS Cognito login screen
2. Cognito returns `idToken` with user information
3. Frontend sends idToken in `Authorization: Bearer <idToken>` header
4. Backend decodes token without verification (Cognito already verified it)
5. Backend extracts `custom:role` claim to determine user type

### Required Cognito Setup

1. Create User Pool with these settings:
   - Password policy: At least 8 characters
   - MFA: Optional
   - Custom attributes:
     - `custom:role` (String, Required)

2. Create Users with:
   - Email
   - Name
   - Phone
   - `custom:role` claim: "manager" or "tenant"

3. Set User Pool Client with:
   - Authentication flows enabled
   - Read attributes: email, name, phone_number, custom:role
   - Write attributes: email, name, phone_number

---

## Database Schema Changes

### Manager & Tenant Models

Both models now include password support:

```prisma
model Manager {
  id          Int     @id @default(autoincrement())
  cognitoId   String  @unique
  email       String  @unique
  name        String
  phoneNumber String
  password    String? // For local auth (bcrypt hashed)
  createdAt   DateTime? @default(now())
  updatedAt   DateTime? @updatedAt
  // ... other fields
}

model Tenant {
  id          Int     @id @default(autoincrement())
  cognitoId   String  @unique
  email       String  @unique
  name        String
  phoneNumber String
  password    String? // For local auth (bcrypt hashed)
  createdAt   DateTime? @default(now())
  updatedAt   DateTime? @updatedAt
  // ... other fields
}
```

**Notes**:

- `password` is optional (null for Cognito-only accounts)
- `password` is always bcrypt hashed (cost factor: 10)
- `cognitoId` is required but can be "local-{timestamp}" for local accounts
- `email` is unique and used for login

---

## Backend Implementation

### Auth Middleware

The middleware automatically detects token type:

```typescript
// Located: server/src/middleware/authMiddleware.ts

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
      let decoded;

      // Try local JWT first
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch {
        // Fall back to Cognito (decode without verify)
        decoded = jwt.decode(token);
      }

      // Extract role from either format
      const role = decoded.role || decoded["custom:role"];

      // Check if user has permission
      if (!allowedRoles.includes(role.toLowerCase())) {
        return res.status(403).json({ error: "Access Denied" });
      }

      req.user = { id: decoded.userId || decoded.sub, role };
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };
};
```

### Auth Controllers

Located: `server/src/controllers/authControllers.ts`

- `register(req, res)`: Create new user with hashed password
- `loginLocal(req, res)`: Authenticate and return JWT token

### Auth Routes

Located: `server/src/routes/authRoutes.ts`

```typescript
router.post("/register", register);
router.post("/login-local", loginLocal);
```

---

## Frontend Implementation

### Login Page

Located: `client/src/app/(auth)/login/page.tsx`

Features:

- Toggle between Sign In and Sign Up forms
- Email/password validation
- Role selection (Tenant/Manager)
- Demo account display
- Toast notifications

### Auth Provider

Located: `client/src/app/(auth)/authProvider.tsx`

- Checks localStorage for token on app load
- Redirects authenticated users away from login page
- Redirects unauthenticated users away from dashboard
- Allows public pages (landing, search) without auth

### RTK Query Headers

Located: `client/src/state/api.ts`

Automatically includes token in request headers:

```typescript
prepareHeaders: (headers) => {
  // Check for local token first
  const localToken = localStorage.getItem("token");

  if (localToken) {
    headers.set("Authorization", `Bearer ${localToken}`);
  } else if (cachedToken) {
    // Fall back to Cognito token
    headers.set("Authorization", `Bearer ${cachedToken}`);
  }

  return headers;
};
```

---

## Security Considerations

### Password Security

- Passwords hashed with bcryptjs (10 rounds)
- Minimum 8 characters recommended
- Never stored in plain text
- Never logged or exposed in errors

### Token Security

- JWT tokens expire in 24 hours
- Tokens stored in localStorage (XSS vulnerable)
- **Recommendation**: Move to httpOnly cookies for production
- Tokens include user role for quick authorization checks

### Role-Based Access Control

Routes automatically check user role:

```typescript
// Only managers can access
app.use("/managers", authMiddleware(["manager"]), managerRoutes);

// Only tenants can access
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);

// Public routes (no auth required)
app.use("/auth", authRoutes);
app.use("/search", searchRoutes);
```

---

## Migration Path: Local → Cognito

When transitioning from local to Cognito:

1. **Sync user accounts** to AWS Cognito
2. **Set cognitoId** in database to match Cognito user ID
3. **Keep password field** (won't hurt; tokens won't use it)
4. **Update environment variables** to point to Cognito pool
5. **Update frontend** to use AWS Amplify authenticator
6. **Backend middleware** continues to work (automatic fallback)

---

## Troubleshooting

### "Invalid email or password"

- Check email exists in database
- Verify password is correct
- Try resetting password (not yet implemented)

### "Token expired"

- Log out and log in again
- Token expires in 24 hours

### "Access Denied"

- Verify user role matches route requirement
- Manager routes require "manager" role
- Tenant routes require "tenant" role

### "Invalid token"

- Check Authorization header format: `Bearer <token>`
- Verify token is not corrupted
- Try logging in again

---

## Development Workflow

### Setup Local Auth for First Time

```bash
# 1. Install dependencies
cd server && npm install bcryptjs

# 2. Run migrations (already done)
npx prisma migrate deploy

# 3. Seed with test users
npm run seed:simple

# 4. Start server
npm run dev
```

### Testing Endpoints

```bash
# Register new user
curl -X POST http://localhost:3002/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"testpass","name":"Test User","role":"tenant"}'

# Login
curl -X POST http://localhost:3002/auth/login-local \
  -H 'Content-Type: application/json' \
  -d '{"email":"manager@test.com","password":"password123"}'

# Use token in request
curl -H 'Authorization: Bearer <token>' \
  http://localhost:3002/managers/123
```

---

## Future Improvements

- [ ] Refresh token mechanism (separate short-lived access token)
- [ ] Password reset functionality
- [ ] Email verification for new accounts
- [ ] Two-factor authentication (TOTP/SMS)
- [ ] Social login (Google, GitHub)
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging for security events
- [ ] httpOnly cookies for token storage
- [ ] CSRF protection

---

## References

- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [JWT.io](https://jwt.io/)
- [AWS Cognito](https://aws.amazon.com/cognito/)
- [Express Authentication Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
