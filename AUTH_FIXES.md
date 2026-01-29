# Auth Errors Fixed - Cognito ID Issues

## Problem Summary

### Error Message

```
User needs to be authenticated to call this API
```

### Root Cause

The frontend was using the **wrong field** to get the user's cognito ID:

- ❌ **Wrong**: `authUser.cognitoInfo.userId`
- ✅ **Correct**: `authUser.userInfo.cognitoId`

When the wrong field was used, an empty string `""` was passed to the API, which then failed authentication checks.

---

## Files Fixed

### 1. **Listings.tsx** - Search Page (CRITICAL)

**File**: `client/src/app/(nondashboard)/search/Listings.tsx`

**Problems**:

- Using wrong field for cognitoId
- Passing empty string to authenticated endpoint `/tenants/:cognitoId`
- This caused "User needs to be authenticated" error even for logged-in users

**Changes**:

```tsx
// ❌ BEFORE
const { data: tenant } = useGetTenantQuery(
  authUser?.cognitoInfo?.userId || "",
  { skip: !authUser?.cognitoInfo?.userId }
);

// ✅ AFTER
const cognitoId = authUser?.userInfo?.cognitoId || "";
const { data: tenant } = useGetTenantQuery(cognitoId, {
  skip: !cognitoId || !authUser,
});

// Also fixed in handleFavoriteToggle:
cognitoId: authUser.userInfo?.cognitoId || "",  // instead of cognitoInfo.userId
```

### 2. **newproperty/page.tsx** - Manager Property Creation

**File**: `client/src/app/(dashboard)/managers/newproperty/page.tsx`

**Problem**: Same wrong field usage when creating properties

**Fix**:

```tsx
// ❌ BEFORE
formData.append("managerCognitoId", authUser.cognitoInfo.userId);

// ✅ AFTER
formData.append("managerCognitoId", authUser.userInfo?.cognitoId || "");
```

### 3. **Map.tsx** - Error Type Safety

**File**: `client/src/app/(nondashboard)/search/Map.tsx`

**Problem**: TypeScript error trying to access `error?.data?.message` on wrong error type

**Fix**:

```tsx
// ✅ Removed unsafe access to error.data.message
if (isError)
  return (
    <div className="flex flex-col items-center justify-center h-full text-red-600">
      <p className="font-semibold">Failed to load map</p>
      <p className="text-sm mt-2">
        Check your connection or try a different location
      </p>
    </div>
  );
```

---

## Why This Matters

The API structure returns:

```typescript
interface User {
  cognitoInfo: { username: string; userId: string; ... }
  userInfo: { id: number; cognitoId: string; ... }
  userRole: string;
}
```

- `cognitoInfo` = AWS Cognito info from the token
- `userInfo` = **Database record** with the actual cognitoId needed for API calls
- When the backend looks up users by cognitoId, it's looking in the **database**, not Cognito

So we need `userInfo.cognitoId`, not `cognitoInfo.userId`.

---

## API Endpoints Requiring Auth

These routes require authentication middleware:

```typescript
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);
```

**Endpoints affected**:

- `GET /tenants/{cognitoId}` - Get tenant profile
- `POST /tenants/{cognitoId}/favorites/{propertyId}` - Add favorite
- `DELETE /tenants/{cognitoId}/favorites/{propertyId}` - Remove favorite
- `GET /managers/{cognitoId}/properties` - Get manager properties

All of these now use the **correct** cognitoId from `userInfo.cognitoId`.

---

## Testing

After these fixes:

### When Logged In as Tenant

- ✅ Should not see "User needs to be authenticated" errors
- ✅ Can favorite/unfavorite properties
- ✅ Map search should work
- ✅ Location filter should work

### When Logged In as Manager

- ✅ Should be redirected from `/search` to `/managers/properties`
- ✅ Can create new properties
- ✅ Can view own properties

### When Not Logged In

- ✅ Can view properties (no auth required for `/properties`)
- ✅ Can search by location
- ✅ Cannot favorite (expected, shows button disabled)

---

## Verification

**Type checking**: ✅ No TypeScript errors

```bash
npx tsc --noEmit  # Success
```

**All instances fixed**:

```bash
grep -r "cognitoInfo.userId" src/  # No matches found
```
