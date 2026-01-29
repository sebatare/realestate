# How to Test the Performance Improvements

This guide walks you through testing the performance optimizations implemented in this session.

---

## Quick Start

### 1. Start the Backend

```bash
cd server
npm run dev
# Output: Server running on http://localhost:5000
```

### 2. Start the Frontend (in another terminal)

```bash
cd client
npm run dev
# Output: http://localhost:3000
```

---

## Testing Checklist

### ✅ Test 1: Basic Page Load

**Goal**: Verify page loads without errors

1. Navigate to `http://localhost:3000`
2. Should see home page instantly (no loading delay)
3. Check browser console: No auth-related errors

**Expected Result**: ✅ Page loads quickly without errors

---

### ✅ Test 2: Authentication & Context

**Goal**: Verify auth context is working correctly

1. Open DevTools (F12) → Network tab
2. Go to `http://localhost:3000/search`
3. Look at Network requests:
   - Should see ONE `getAuthUser` API call
   - Not 15+ duplicate calls
4. Navigate around the site (properties, favorites, etc.)
5. Network tab should NOT show new auth calls

**Expected Result**: ✅ Single auth call, reused everywhere via context

---

### ✅ Test 3: Request Parallelism

**Goal**: Verify requests execute in parallel, not sequentially

1. Open DevTools (F12) → Network tab
2. Go to `http://localhost:3000/search`
3. In Network tab, look at the request waterfall:
   - **Before Fix**: Auth call, then all other calls start (sequential)
   - **After Fix**: Multiple requests starting simultaneously (parallel)

**Expected Result**: ✅ Multiple requests starting at same time, NOT waiting for auth

---

### ✅ Test 4: Token Caching

**Goal**: Verify token caching is preventing repeated auth fetches

**Option A - Via Console**:

```javascript
// In browser console, add this to api.ts to verify token caching
// Edit api.ts to add console.log:
console.log("Using cached token:", !!cachedToken);

// Then in console, trigger a new request
// Should see "Using cached token: true"
```

**Option B - Via DevTools**:

1. Open DevTools → Application → Local Storage
2. Look for Amplify auth data
3. Token should be stored and reused (not fetched repeatedly)

**Expected Result**: ✅ Token reused, not re-fetched on every request

---

### ✅ Test 5: Manager Route Redirection

**Goal**: Verify managers are redirected properly

1. Log in as a manager (sebastian@example.com)
2. Try to go to `/search`
3. Should redirect to `/managers/properties` instantly
4. No infinite loading spinner

**Expected Result**: ✅ Instant redirect, no loading delays

---

### ✅ Test 6: Tenant Search Functionality

**Goal**: Verify tenants can search properties without issues

1. Log in as a tenant
2. Navigate to `/search`
3. Should load without errors
4. Map should display correctly
5. Property listings should show

**Expected Result**: ✅ Search page works, map renders, listings display

---

### ✅ Test 7: Favorites Toggle

**Goal**: Verify favorite functionality works correctly

1. Log in as a tenant
2. Go to `/search`
3. Click heart icon on a property
4. Should update instantly without page refresh
5. Check Network tab: single request, not multiple

**Expected Result**: ✅ Favorites update instantly, single API call

---

### ✅ Test 8: Layout Persistence

**Goal**: Verify sidebar/layout state persists across navigations

1. Navigate between different pages (search, properties, etc.)
2. Layout should NOT unmount/remount (no flash)
3. Auth state should be consistent

**Expected Result**: ✅ Smooth navigation, no layout flashing

---

## Performance Measurement

### Using Lighthouse

1. Open DevTools → Lighthouse tab
2. Select "Mobile" or "Desktop"
3. Click "Analyze page load"
4. Check scores for:
   - **Performance**: Should be 70+
   - **Best Practices**: Should be 90+
   - **Accessibility**: Should be 80+

**Target Metrics**:

- First Contentful Paint (FCP): < 1s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1

---

### Using Chrome DevTools Network Tab

1. Open DevTools → Network tab
2. Reload page (Cmd+R or Ctrl+R)
3. Check waterfall view:
   - Look for "Time" column
   - Requests should start roughly at same time (parallel)
   - No obvious "gaps" where requests wait for others

**Before Fix Waterfall**:

```
auth ▓▓▓▓▓▓▓▓▓ [500ms]
getProperties ▓▓ [10ms] (starts after auth)
getSettings ▓▓ [10ms] (starts after auth)
getListings ▓▓ [10ms] (starts after auth)
```

**After Fix Waterfall**:

```
auth ▓▓ [10ms]
getProperties ▓▓ [10ms] (starts immediately)
getSettings ▓▓ [10ms] (starts immediately)
getListings ▓▓ [10ms] (starts immediately)
```

---

### Using Web Vitals (Real User Metrics)

Add to `client/src/app/layout.tsx` if wanting to track:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

if (typeof window !== "undefined") {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}
```

Then check console for metrics:

- FCP (First Contentful Paint): When first content appears
- LCP (Largest Contentful Paint): When largest element renders
- CLS (Cumulative Layout Shift): Unexpected layout changes
- FID (First Input Delay): Responsiveness to user input
- TTFB (Time to First Byte): Server response time

---

## Troubleshooting During Testing

### Issue: Page still slow

**Diagnostics**:

1. Check Network tab: Are requests still sequential?
   - If yes: Token caching not working, check api.ts
   - If no: Frontend is fast, backend might be slow
2. Check backend logs: Is response time > 1s?
   - If yes: Database queries need optimization
   - If no: Network latency issue

### Issue: Auth token errors (401/403)

**Diagnostics**:

1. Open DevTools → Network tab
2. Look for auth request in network
3. Check response headers for error message
4. Verify `.env.local` has correct `API_BASE_URL`

### Issue: Infinite redirect loop

**Diagnostics**:

1. Check layout.tsx logic
2. Verify userRole is being read correctly
3. Check that redirect URLs are correct
4. Clear browser cache and cookies

### Issue: Auth context showing errors

**Diagnostics**:

1. Verify AuthUserProvider wraps entire app (in providers.tsx)
2. Check that useAuthUser() is only called inside provider
3. Look for "useAuthUser must be used within AuthUserProvider" error
4. Verify AuthContext.tsx is properly exported

---

## Performance Comparison Script

Add this to browser console to compare before/after:

```javascript
// Log current performance metrics
console.log("=== Performance Check ===");
console.log(
  "Navigation Timing:",
  performance.getEntriesByType("navigation")[0].toJSON(),
);
console.log(
  "DOM Content Loaded:",
  performance.timing.domContentLoadedEventEnd -
    performance.timing.navigationStart,
  "ms",
);
console.log(
  "Page Load Complete:",
  performance.timing.loadEventEnd - performance.timing.navigationStart,
  "ms",
);
console.log(
  "Number of Resources:",
  performance.getEntriesByType("resource").length,
);
console.log(
  "Resource Load Time:",
  performance
    .getEntriesByType("resource")
    .reduce((sum, r) => sum + r.duration, 0),
  "ms total",
);
```

**Expected Results After Optimization**:

- DOM Content Loaded: < 1000ms
- Page Load Complete: < 2000ms
- Resource Load Time: < 1000ms total

---

## Rollback Plan

If performance doesn't improve or new issues appear:

```bash
# Revert to previous state
git log --oneline
git checkout HEAD~1

# Or manually revert changes:
# 1. Delete client/src/context/AuthContext.tsx
# 2. Restore api.ts prepareHeaders to original async version
# 3. Revert layout files to use useGetAuthUserQuery()
```

---

## Performance Expectations

### Page Load Times

| Page                 | Before | After     | Improvement |
| -------------------- | ------ | --------- | ----------- |
| Home /               | 1-2s   | 300-500ms | 3-5x faster |
| /search              | 2-3s   | 500-800ms | 3-4x faster |
| /managers/properties | 1-2s   | 300-600ms | 2-3x faster |
| /tenants/favorites   | 1-2s   | 300-600ms | 2-3x faster |

### API Request Metrics

| Metric                      | Before    | After   |
| --------------------------- | --------- | ------- |
| useGetAuthUserQuery calls   | 15+       | 1       |
| Auth latency per request    | 500ms     | 0-10ms  |
| Total requests on page load | 20+       | 10-12   |
| Request waterfall depth     | 3+ levels | 1 level |

---

## Verification Checklist

- [ ] App starts without errors
- [ ] Pages load without long delays
- [ ] Auth context provides user data consistently
- [ ] No infinite redirect loops
- [ ] No 401/403 auth errors
- [ ] Network requests are parallel
- [ ] Only 1 useGetAuthUserQuery call at app start
- [ ] Subsequent page navigations don't fetch auth again
- [ ] Favorites toggle works instantly
- [ ] Manager → Tenant pages redirect properly
- [ ] No layout flashing/remounting
- [ ] TypeScript compiles without errors
- [ ] Production build completes successfully

---

## Support

If you encounter any issues:

1. Check the documentation files:
   - `PERFORMANCE_OPTIMIZATION_COMPLETE.md` - Technical details
   - `SESSION_COMPLETE_STATUS.md` - Overview of all changes

2. Check TypeScript:

   ```bash
   npx tsc --noEmit
   ```

3. Rebuild if needed:

   ```bash
   npm run build
   npm start
   ```

4. Clear cache:
   - Browser: Cmd+Shift+Delete (DevTools) or Settings
   - Node: `rm -rf node_modules package-lock.json && npm install`

---

**Happy Testing! 🚀**

The performance improvements should be noticeable immediately. Report any issues or unexpected behavior.
