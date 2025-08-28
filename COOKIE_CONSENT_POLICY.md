# CUTMV Cookie Consent Policy

**© 2025 Full Digital LLC - Extended Consent Management**

## Consent Duration & Validity

### Extended Consent Period
- **Duration**: Cookie consent is valid for **1 full year** from acceptance
- **Scope**: Applies to all pages and sessions under `cutmv.fulldigitalll.com`
- **Persistence**: Consent survives browser restarts, device switches, and navigation

### When Consent is Requested Again
- **Manual Cache Clear**: User clears browser data/cookies manually
- **Annual Refresh**: After 365 days, consent expires and requires renewal
- **Browser Storage Issues**: If localStorage is corrupted or unavailable

## Technical Implementation

### Global State Management
- **Singleton Pattern**: Single consent check per browser session
- **Cross-Page Persistence**: Consent state shared across all app pages
- **Mobile Optimized**: Handles mobile browser focus events and localStorage quirks

### Session Cookie Integration
- **Essential Cookies Always Allowed**: Session authentication works regardless of analytics consent
- **Non-Intrusive**: Cookie consent never blocks core app functionality
- **Session Preservation**: No page reloads that could interrupt authentication

### Consent Options
1. **Accept All**: Enables analytics, marketing, and essential cookies
2. **Essential Only**: Allows session cookies, disables tracking
3. **Decline**: Same as Essential Only but explicitly declined

## User Experience

### Mobile Behavior
- **Single Appearance**: Consent banner appears once per year maximum
- **Instant Response**: No delays or repeated requests on page navigation
- **Touch Friendly**: Large buttons optimized for mobile interaction

### Desktop Behavior
- **Consistent Experience**: Same behavior across all devices
- **Session Continuity**: Authentication sessions maintained across consent actions
- **Background Processing**: Consent handling doesn't interrupt bulk exports or processing

## Data Privacy Compliance

### Storage Locations
- `cutmv-cookie-consent`: User's consent choice (accepted/declined/essential-only)
- `cutmv-cookie-timestamp`: ISO timestamp of consent action
- Global state cache for session management

### Analytics Integration
- **PostHog**: Only enabled with explicit "Accept All" consent
- **Sentry**: Error tracking enabled regardless (essential functionality)
- **Email Tracking**: Marketing pixels only with consent

## Troubleshooting

### Consent Appearing Repeatedly
- Check browser localStorage functionality
- Verify domain consistency (must be exact match)
- Clear browser cache and re-consent if issues persist

### Session Authentication Issues
- Essential cookies always allowed regardless of analytics consent
- Session cookies use secure domain-specific settings
- Magic link authentication unaffected by consent status

---

**Note**: This policy ensures GDPR/CCPA compliance while providing the best user experience for legitimate business operations.