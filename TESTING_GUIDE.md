# Security Testing Guide - CSRF & Rate Limiting

## Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Verify AUTH_SECRET is set:**
   ```bash
   # Check .env file contains:
   AUTH_SECRET=your-secret-here
   ```

3. **Optional: Disable features for baseline testing:**
   ```bash
   # Add to .env to disable temporarily:
   DISABLE_CSRF=true
   DISABLE_RATE_LIMIT=true
   ```

---

## Test 1: CSRF Cookie Injection ✅

**Purpose:** Verify CSRF tokens are generated and set on page loads.

**Steps:**
1. Open browser to `http://localhost:3000`
2. Open DevTools → Application → Cookies → `http://localhost:3000`
3. Look for two cookies:
   - `__Host-csrf-token` - Should be **HttpOnly**, encrypted value
   - `csrf-token` - Should be **readable**, 64-character hex string

**Expected Results:**
```
✅ Both cookies present
✅ csrf-token is 64 characters long
✅ __Host-csrf-token is encrypted (different from csrf-token)
✅ Both cookies have SameSite=Lax
✅ Max-Age = 86400 (24 hours)
```

**Troubleshooting:**
- If cookies missing: Check middleware.ts imports and CSRF generation code
- If encryption fails: Verify AUTH_SECRET is set in .env

---

## Test 2: CSRF Token Accessibility (Client-Side)

**Purpose:** Verify JavaScript can read the CSRF token.

**Steps:**
1. Open browser console on `http://localhost:3000`
2. Run:
   ```javascript
   document.cookie.match(/csrf-token=([^;]+)/)?.[1]
   ```
3. Should return a 64-character hex string

**Expected Results:**
```
✅ Returns token string (e.g., "a1b2c3d4...")
✅ Token matches value in Application → Cookies
```

---

## Test 3: Rate Limiting - Registration Endpoint

**Purpose:** Verify rate limiting blocks after 5 attempts in 15 minutes.

**Setup:**
- Ensure `DISABLE_RATE_LIMIT` is **NOT** set or set to `false`
- Development mode uses 500 attempts (relaxed), so temporarily adjust:
  - Edit `src/lib/constants.ts` line ~14
  - Change: `maxRequests: isDevelopment ? 500 : 5`
  - To: `maxRequests: 5` (temporarily remove isDevelopment check)
  - Save and restart server

**Steps:**
1. Open DevTools Network tab
2. Navigate to registration page: `http://localhost:3000/registreren`
3. Fill form with test data:
   - Name: Test User 1
   - Email: test1@example.com
   - Password: TestPass123!@#
4. Submit 6 times (change email each time: test1, test2, test3...)
5. Watch Network tab for responses

**Expected Results:**

**Attempt 1-5:**
```
Status: 201 (if valid) or 400 (if duplicate email)
Response: { "message": "Account aangemaakt", "userId": "..." }
Headers:
  X-RateLimit-Limit: 5
  X-RateLimit-Remaining: 4, 3, 2, 1, 0
  X-RateLimit-Reset: <timestamp>
```

**Attempt 6:**
```
Status: 429 Too Many Requests
Response: { "error": "Te veel verzoeken. Probeer het later opnieuw." }
Headers:
  Retry-After: <seconds until reset>
  X-RateLimit-Limit: 5
  X-RateLimit-Remaining: 0
  X-RateLimit-Reset: <timestamp>
```

**Console Log:**
```
[Rate Limit] Limit exceeded: {
  pathname: '/api/auth/register',
  key: 'ip',
  identifier: '::1' or '127.0.0.1',
  limit: 5,
  timestamp: ...
}
```

**Cleanup:**
- Revert `constants.ts` back to `isDevelopment ? 500 : 5` after testing
- Restart server

---

## Test 4: Rate Limiting - Contact Form

**Purpose:** Verify contact form limits to 3 submissions per hour.

**Setup (same as Test 3):**
- Edit `src/lib/constants.ts` line ~21
- Change `maxRequests: isDevelopment ? 300 : 3` to `maxRequests: 3`
- Restart server

**Steps:**
1. Navigate to: `http://localhost:3000/contact`
2. Fill form and submit 4 times
3. Watch Network tab

**Expected Results:**

**Attempts 1-3:** Status 200, success message
**Attempt 4:** Status 429, rate limit error

**Cleanup:**
- Revert `constants.ts` back to `isDevelopment ? 300 : 3`

---

## Test 5: CSRF Protection - Registration WITHOUT Token

**Purpose:** Verify requests without CSRF token are blocked.

**Steps:**
1. Open DevTools → Network tab
2. Right-click on any previous POST request → Copy as cURL
3. Modify the cURL command to remove the `X-CSRF-Token` header:
   ```bash
   curl 'http://localhost:3000/api/auth/register' \
     -H 'Content-Type: application/json' \
     --data-raw '{"name":"Test","email":"test999@example.com","password":"TestPass123!@#","phoneConsent":false}'
   ```
4. Run the command

**Expected Results:**
```
Status: 403 Forbidden
Response: { "error": "Beveiligingstoken ontbreekt" }
Console: CSRF validation failed: { error: 'CSRF_MISSING', timestamp: ... }
```

---

## Test 6: CSRF Protection - Registration WITH Invalid Token

**Purpose:** Verify requests with invalid CSRF token are blocked.

**Steps:**
1. Get a valid CSRF token from cookies:
   ```javascript
   document.cookie.match(/csrf-token=([^;]+)/)?.[1]
   ```
2. Modify one character in the token
3. Use modified cURL:
   ```bash
   curl 'http://localhost:3000/api/auth/register' \
     -H 'Content-Type: application/json' \
     -H 'X-CSRF-Token: INVALID_TOKEN_HERE' \
     -H 'Cookie: csrf-token=ORIGINAL_TOKEN; __Host-csrf-token=ENCRYPTED_VALUE' \
     --data-raw '{"name":"Test","email":"test999@example.com","password":"TestPass123!@#","phoneConsent":false}'
   ```

**Expected Results:**
```
Status: 403 Forbidden
Response: { "error": "Ongeldig beveiligingstoken" }
```

---

## Test 7: CSRF Protection - Registration WITH Valid Token

**Purpose:** Verify valid tokens allow requests through.

**Steps:**
1. Get valid CSRF token from cookies
2. Submit registration form normally (which includes token)
3. Check Network tab

**Expected Results:**
```
Status: 201 Created (or 400 if email exists)
Response: { "message": "Account aangemaakt", "userId": "..." }
✅ No CSRF errors
✅ Request succeeds
```

---

## Test 8: Password Reset Flow (Forgot + Reset)

**Purpose:** Verify both forgot-password and reset-password have protection.

**Test 8A: Forgot Password Rate Limiting**

**Steps:**
1. Navigate to: `http://localhost:3000/wachtwoord-vergeten`
2. Submit form 6 times with any email

**Expected Results:**
- First 5 attempts: Success (with message about checking email)
- 6th attempt: 429 rate limit error

**Test 8B: Reset Password with Invalid CSRF**

**Steps:**
1. Create a password reset token (use forgot password flow)
2. Copy the reset URL from console logs
3. Navigate to the reset page
4. Submit reset form via cURL without CSRF token

**Expected Results:**
```
Status: 403 Forbidden
Response: { "error": "Beveiligingstoken ontbreekt" }
```

---

## Test 9: Contact Form Protection

**Purpose:** Verify contact form has both CSRF and rate limiting.

**Steps:**
1. Navigate to: `http://localhost:3000/contact`
2. Submit form WITHOUT opening DevTools (normal flow)
3. Check Network tab → POST to `/api/contact`
4. Verify request includes `X-CSRF-Token` header
5. Submit 4 times to trigger rate limit

**Expected Results:**
```
✅ First submission: 200 Success
✅ Request includes X-CSRF-Token header automatically
✅ Second submission: 200 Success
✅ Third submission: 200 Success
✅ Fourth submission: 429 Rate Limit
```

---

## Test 10: Development Mode Relaxed Limits

**Purpose:** Verify development mode has relaxed rate limits.

**Steps:**
1. Ensure `.env` has `NODE_ENV=development` or is unset
2. Check `src/lib/constants.ts` - should have `isDevelopment ? 500 : 5` pattern
3. Try submitting registration 10 times

**Expected Results:**
```
✅ All 10 attempts succeed (no rate limiting in dev mode)
✅ Logs show: X-RateLimit-Limit: 500
```

---

## Test 11: CSRF Token Persistence Across Navigation

**Purpose:** Verify CSRF tokens persist across page navigations.

**Steps:**
1. Navigate to homepage
2. Note CSRF token in cookies: `TOKEN_1`
3. Navigate to `/contact`
4. Check CSRF token in cookies: `TOKEN_2`
5. Navigate to `/registreren`
6. Check CSRF token in cookies: `TOKEN_3`

**Expected Results:**
```
✅ TOKEN_1, TOKEN_2, TOKEN_3 should be DIFFERENT (regenerated on each page load)
✅ All tokens are valid 64-character hex strings
✅ Each page load creates fresh tokens
```

---

## Test 12: API Routes NOT Covered Yet

**Purpose:** Verify other endpoints still work (not broken by new middleware).

**Test endpoints that shouldn't be affected yet:**

1. **GET /api/events/public** (read-only, should work)
   ```bash
   curl http://localhost:3000/api/events/public
   ```
   Expected: 200 OK, returns events array

2. **POST /api/reservations** (not yet protected)
   - Should still work normally
   - No CSRF check yet
   - No rate limiting yet

---

## Test 13: Error Handling in Client (Future)

**Purpose:** Preview what client-side error handling will look like.

**Manual Test:**
1. Open any form that will use mutations (e.g., contact form)
2. Open DevTools → Console
3. Run:
   ```javascript
   fetch('/api/contact', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: 'Test',
       email: 'test@example.com',
       subject: 'Test',
       message: 'Test message'
     })
   }).then(r => r.json()).then(console.log)
   ```

**Expected Results:**
```
Status: 403 (CSRF missing)
Response: { error: "Beveiligingstoken ontbreekt" }
```

---

## Test 14: Memory Cleanup (Rate Limit Store)

**Purpose:** Verify rate limit store cleans up expired entries.

**Steps:**
1. Keep server running for 2+ minutes
2. Watch console logs
3. After 60 seconds, should see cleanup log

**Expected Results (if in dev mode):**
```
[Rate Limit] Cleaned up 5 expired entries. Store size: 12
```

---

## Common Issues & Solutions

### Issue: CSRF cookies not appearing
**Solution:**
- Check `src/middleware.ts` has CSRF imports
- Verify `AUTH_SECRET` is set in `.env`
- Clear browser cookies and refresh

### Issue: All requests return 403
**Solution:**
- Disable CSRF temporarily: `DISABLE_CSRF=true` in `.env`
- Check browser console for errors
- Verify token generation works: check cookies manually

### Issue: Rate limits too strict in development
**Solution:**
- Verify `NODE_ENV=development` in `.env`
- Check `src/lib/constants.ts` uses `isDevelopment` checks
- Temporarily set `DISABLE_RATE_LIMIT=true`

### Issue: Rate limits don't reset
**Solution:**
- Wait for window to expire (15 min for auth, 1 hour for contact)
- Restart server (clears in-memory store)
- Check console for cleanup logs

### Issue: Encryption errors
**Solution:**
- Ensure `AUTH_SECRET` is at least 32 characters
- Check no special characters in AUTH_SECRET causing issues
- Try regenerating AUTH_SECRET: `openssl rand -base64 32`

---

## Success Criteria Checklist

Before moving to medium-priority routes, verify:

- [ ] CSRF cookies generated on page load
- [ ] CSRF tokens are 64-character hex strings
- [ ] `__Host-csrf-token` is HttpOnly and encrypted
- [ ] Registration blocked after 5 attempts (prod limits)
- [ ] Contact form blocked after 3 attempts (prod limits)
- [ ] Forgot password blocked after 5 attempts
- [ ] Reset password blocked after 5 attempts
- [ ] Requests without CSRF token return 403
- [ ] Requests with invalid CSRF token return 403
- [ ] Requests with valid CSRF token succeed
- [ ] 429 responses include `Retry-After` header
- [ ] Rate limit headers present in responses
- [ ] Development mode has relaxed limits (500x)
- [ ] Console logs show rate limit violations
- [ ] Memory cleanup runs every 60 seconds
- [ ] Existing unprotected routes still work

---

## Next Steps After Testing

Once all tests pass:

1. ✅ **Report test results** - Share any issues found
2. 🚀 **Continue implementation:**
   - Task #10: Update 10 medium-priority API routes
   - Task #11: Update client-side fetch calls
   - Task #12: Final integration testing
3. 📝 **Update documentation** in CLAUDE.md
4. 🔄 **Deploy to production** with proper env vars

---

## Testing Commands Summary

```bash
# Start dev server
npm run dev

# Check environment
cat .env | grep AUTH_SECRET
cat .env | grep NODE_ENV

# Temporarily disable features
export DISABLE_CSRF=true
export DISABLE_RATE_LIMIT=true

# Re-enable features
unset DISABLE_CSRF
unset DISABLE_RATE_LIMIT

# Test CSRF token in browser console
document.cookie.match(/csrf-token=([^;]+)/)?.[1]

# Test rate limiting with cURL
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"Test$i\",\"email\":\"test$i@example.com\",\"password\":\"TestPass123!@#\",\"phoneConsent\":false}"
  echo "\n---"
done
```

---

**Ready to test? Start with Test 1 and work through the checklist!**
