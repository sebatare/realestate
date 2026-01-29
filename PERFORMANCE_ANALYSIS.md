# Performance Issues Analysis

## 🔴 Critical Performance Problems Found

### 1. **Multiple `useGetAuthUserQuery()` Calls**

**Problem**: `getAuthUser` es llamado en casi TODOS los layouts y páginas

- `(nondashboard)/layout.tsx` → calls getAuthUser
- `(dashboard)/layout.tsx` → calls getAuthUser
- `Listings.tsx` → calls getAuthUser
- `managers/properties/page.tsx` → calls getAuthUser
- `tenants/residences/page.tsx` → calls getAuthUser
- `tenants/settings/page.tsx` → calls getAuthUser
- `tenants/favorites/page.tsx` → calls getAuthUser
- `managers/newproperty/page.tsx` → calls getAuthUser
- Y 10+ más...

**Result**: La misma query se dispara múltiples veces innecesariamente.

### 2. **Async `prepareHeaders` en RTK Query Base Query**

**Location**: `src/state/api.ts` lines 16-25

```typescript
prepareHeaders: async (headers) => {
  const session = await fetchAuthSession(); // ⚠️ ASYNC - bloquea todos los requests
  const { idToken } = session.tokens ?? {};
  if (idToken) {
    headers.set("Authorization", `Bearer ${idToken}`);
  }
  return headers;
};
```

**Problem**: Cada request (GET properties, GET tenants, etc.) espera por `fetchAuthSession()`

- RTK Query hace requests **secuencialmente** en lugar de en paralelo
- Crea waterfall de requests
- Típicamente 200-500ms por request

### 3. **`getAuthUser` Query Muy Pesada**

**Problem**: `getAuthUser` hace:

1. `fetchAuthSession()` (AWS Cognito API call)
2. `getCurrentUser()` (AWS Cognito API call)
3. `/managers/{userId}` o `/tenants/{userId}` (API call)

**Result**: 3 operaciones async en serie = slow

### 4. **Sin Caching o Cache Strategies**

- Cada página que visitas hace `getAuthUser` de nuevo
- No hay deduplicación de requests en paralelo
- RTK Query debería estar cacheando, pero la lógica de `prepareHeaders` interfiere

### 5. **No hay Lazy Loading o Skeleton Screens**

- Las páginas esperan a que TODOS los datos carguen
- Map component espera a properties
- Card components esperan a tenant data

---

## 📊 Performance Waterfall Example

```
Request Timeline (SECUENCIAL - MÁS LENTO):
Layout monta
  ↓ fetchAuthSession() [200ms]
  ↓ getCurrentUser() [100ms]
  ↓ /managers/{userId} [300ms]
  ↓ /properties [400ms]
  ↓ /tenants/{userId} [200ms]
═════════════════════════════════════
TOTAL: ~1200ms antes de que veas algo

Ideal (PARALELO):
Layout monta
  ├─ fetchAuthSession() [200ms]
  ├─ /properties [400ms]
  └─ /tenants/{userId} [200ms] ← Empieza después del auth
═════════════════════════════════════
TOTAL: ~600ms máximo
```

---

## 💡 Solutions (Priority Order)

### Priority 1: Fix `prepareHeaders` Async (HIGH IMPACT)

Make it sync or cache the token:

```typescript
// Option A: Cache Amplify session
let cachedToken: string | null = null;

prepareHeaders: (headers) => {
  if (cachedToken) {
    headers.set("Authorization", `Bearer ${cachedToken}`);
  }
  // Refresh token in background
  fetchAuthSession().then((session) => {
    const { idToken } = session.tokens ?? {};
    if (idToken) cachedToken = idToken.toString();
  });
  return headers;
};

// Option B: Store token in localStorage after first fetch
const storedToken = localStorage.getItem("authToken");
if (storedToken) {
  headers.set("Authorization", `Bearer ${storedToken}`);
}
```

### Priority 2: Deduplicate `getAuthUser` Calls

Use a Context Provider to share auth state:

```typescript
// Create a context
export const AuthContext = React.createContext<User | null>(null);

// Root layout provides it
function RootLayout() {
  const { data: authUser } = useGetAuthUserQuery();
  return (
    <AuthContext.Provider value={authUser}>
      {children}
    </AuthContext.Provider>
  );
}

// All child components consume from context
function SomeComponent() {
  const authUser = useContext(AuthContext);  // No more query!
}
```

### Priority 3: Optimize `getAuthUser` Query

Split it:

```typescript
// Don't mix Cognito + database calls
getAuthUser: build.query({
  queryFn: async () => {
    const session = await fetchAuthSession();
    const user = await getCurrentUser();
    return { cognitoInfo: user, userRole };
    // Don't fetch userInfo here - do it separately
  }
}),

// Separate query for user profile
getUserProfile: build.query({
  query: (cognitoId) => `/tenants/${cognitoId}`,
  // Only call when needed
})
```

### Priority 4: Add Skeleton Loading

Instead of blocking on data:

```typescript
if (isLoading) return <PropertyCardSkeleton />;
```

---

## 🚀 Quick Win: Clear Cache Aggressively

Currently RTK Query might cache too long. Add:

```typescript
api.util.resetApiState(); // When needed
```

---

## Metrics to Monitor

After fixes, check:

- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Network requests count
- Request waterfall in DevTools

Goal: < 2 seconds FCP on `/search` page
