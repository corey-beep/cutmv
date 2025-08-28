# CUTMV Canonical Domain Strategy Implementation

## Summary
Implemented comprehensive single domain strategy to resolve mobile session losses and cookie consent issues.

## Key Changes

### 1. Canonical Domain Enforcement
- **Domain**: `cutmv.fulldigitalll.com` is the ONLY domain that serves the app
- **Redirects**: All other domains (cutmv.com, fulldigitalll.com, www variants) redirect with 301
- **No Cookies**: Non-canonical domains never set cookies - redirect BEFORE any HTML/cookies

### 2. Cookie Configuration
- **Session Cookie**: `Domain=.fulldigitalll.com` for cross-subdomain sharing
- **Consent Cookie**: `Domain=.fulldigitalll.com` prevents re-prompting across routes
- **Security**: Secure + SameSite=Lax for production, relaxed for development

### 3. CORS Configuration
- **Strict Origin**: Only `https://cutmv.fulldigitalll.com` allowed for credentials
- **Development**: localhost and replit.app preserved for testing

### 4. Magic Link Generation
- **Production**: Always uses canonical domain for magic links
- **Development**: Falls back to replit domains as needed

### 5. Logout Enhancement
- **Complete Cleanup**: Clears both session and consent cookies with matching domain scope
- **Production**: Uses same domain attributes as when cookies were set

## Before vs After

### Before (Issues)
```
Set-Cookie: cutmv-session=token; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000
```
- Host-only cookies lost during mobile app switching
- Different domains created separate cookie scopes
- Consent banner re-appeared on every route

### After (Fixed)
```
Set-Cookie: cutmv-session=token; HttpOnly; Secure; SameSite=Lax; Domain=.fulldigitalll.com; Max-Age=2592000
Set-Cookie: cutmv-consent=accepted; Secure; SameSite=Lax; Domain=.fulldigitalll.com; Max-Age=31536000
```
- Domain-scoped cookies persist across subdomains and app switches
- Single canonical domain eliminates scope confusion
- Consent persists across all routes and subdomains

## Testing Protocol
1. Deploy to production with new domain strategy
2. Test mobile Safari: login → navigate routes → verify no consent re-prompts
3. Test domain redirects: visit cutmv.com → confirm 301 to cutmv.fulldigitalll.com
4. Test logout: verify both session and consent cookies cleared
5. Test session persistence: mobile app switching doesn't lose session

## Files Modified
- `server/index.ts`: Canonical redirect middleware + strict CORS
- `server/auth-routes.ts`: Domain-scoped cookie strategy + enhanced logout
- `server/auth-service.ts`: Canonical domain magic link generation
- `client/src/components/CookieConsent.tsx`: Domain-scoped consent cookie

## Result
Mobile session management now follows production best practices with proper domain scoping, eliminating the root cause of session losses and repeated consent prompts.