# Known Issues & Incomplete Features

**Last Updated:** December 6, 2025

---

## ✅ Recently Completed (December 2025)

### Referral System
**Status:** ✅ **COMPLETE**
- Database schema: ✅ Complete (4 tables)
- Frontend UI: ✅ Complete (referrals page, dashboard widgets)
- Backend logic: ✅ Complete
- Payment integration: ✅ Complete
- **Implementation Details:**
  - Credits automatically applied to Stripe checkout
  - First export bonus triggers referrer credit award
  - Full transaction history and audit trail
  - Rate limiting and abuse prevention active

---

## 🟡 Partially Implemented Features

### Enhanced FFmpeg Progress Tracking
**Status:** 🟡 **Built but Not Activated** (70% complete)
- Backend implementation: ✅ 100% complete
- WebSocket infrastructure: ✅ 100% ready
- Frontend integration: ⚠️ 30% (not connected)
- Primary endpoint: ⚠️ Not switched over

**What Exists:**
- `server/ffmpeg-progress.ts` - Full FFmpeg `-progress pipe:1` implementation
- `server/enhanced-process.ts` - Queue-based processing with progress streaming
- Real-time frame-accurate progress parsing
- WebSocket broadcasting infrastructure

**What's Missing:**
- Frontend ProcessingControls needs to use `/api/process-enhanced` endpoint
- WebSocket handler needs to parse and display FFmpeg stats (frame, fps, speed)
- UI components need to show real-time processing stats
- End-to-end testing before production activation

**Estimated Completion:** 6-8 hours
**Recommendation:** Target for v3.5 release

---

### Cloudflare Workers Serverless Processing
**Status:** 🟡 **Code Exists but Not Deployed** (50% complete)
- Worker code: ✅ Complete (`server/cloudflare-worker.ts`)
- Queue management: ✅ Complete (`server/cloudflare-queue.ts`)
- Cloudflare deployment: ❌ Not deployed
- Current usage: Fallback system only (not primary)

**Decision Required:**
- **Option A:** Deploy workers for serverless scaling (8-12 hours effort)
  - Requires: Cloudflare account setup, FFmpeg binary for Workers, testing
  - Benefits: Auto-scaling, distributed processing, reduced server load

- **Option B:** Remove unused code (30 minutes effort)
  - Remove worker files if serverless not needed currently
  - Revisit when scaling becomes necessary

**Recommendation:** Deploy if expecting high volume, otherwise remove code to reduce maintenance

---

### Supabase Integration
**Status:** ⚠️ **Usage Unclear** (requires audit)
- Package installed: ✅ `@supabase/supabase-js`
- Service file exists: ✅ `server/supabase.ts` (10KB)
- Primary auth: Uses custom magic link system (not Supabase Auth)
- Database: Uses PostgreSQL directly via Neon (not Supabase)
- Usage in codebase: ❓ Unknown

**Action Required:**
1. Search codebase for Supabase client usage
2. If used: Document what it's used for
3. If unused: Remove package and service file (~500KB savings)

**Estimated Effort:** 1-2 hours to audit

---

## ⚠️ Technical Debt

### 1. Backup File Cleanup
**Status:** ✅ **COMPLETED** (December 6, 2025)
- ~~4 backup route files deleted~~ ✅ Done
- ~~Freed ~569KB of redundant code~~ ✅ Done

### 2. TypeScript Validation
**Status:** 🔲 **Not Run Recently**
**Action:** Run `npm run check` to verify type safety
**Expected:** Minimal issues, but good to validate

### 3. Unused Export Detection
**Status:** 🔲 **Not Run**
**Tools Available:**
- `ts-prune` (already installed)
- `ts-unused-exports` (already installed)

**Action:**
```bash
npx ts-prune
npx ts-unused-exports tsconfig.json
```

---

## 📊 Feature Completion Summary

| Feature | Database | Backend | Frontend | Integration | Overall |
|---------|----------|---------|----------|-------------|---------|
| Video Processing | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | **✅ 100%** |
| Authentication | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | **✅ 100%** |
| Payment/Stripe | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | **✅ 100%** |
| Referral System | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | **✅ 100%** ⬆️ |
| Credit Wallet | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | **✅ 100%** ⬆️ |
| Enhanced Progress | ✅ 100% | ✅ 100% | 🟡 30% | 🟡 20% | **🟡 62%** |
| Cloudflare Workers | ✅ 100% | ✅ 100% | N/A | ❌ 0% | **🟡 50%** |

⬆️ = Recently completed (December 2025)

---

## 🎯 Recommended Next Steps

### Immediate (< 1 hour)
1. ✅ ~~Delete backup files~~ **DONE**
2. ✅ ~~Update documentation~~ **DONE**
3. 🔲 Run TypeScript validation (`npm run check`)
4. 🔲 Audit Supabase usage

### Short-term (1-2 days)
5. 🔲 Integrate enhanced FFmpeg progress tracking
6. 🔲 Deploy Cloudflare Workers OR remove unused code

### Long-term (Future releases)
7. 🔲 Add feature flags for gradual rollouts
8. 🔲 A/B test enhanced progress vs. standard
9. 🔲 Monitor referral system adoption and metrics

---

## 📝 Notes for Developers

### Referral System (Now Complete)
- Credits are now automatically applied at checkout
- $1 credit = $1.00 discount = 100 cents off Stripe payment
- Maximum credits usable = floor(totalAmount / 100)
- Credits are deducted AFTER successful payment (webhook)
- First export bonus triggers in `background-job-manager.ts:markJobCompleted()`

### Enhanced Progress System (Built but Inactive)
- DO NOT delete `ffmpeg-progress.ts` or `enhanced-process.ts`
- These are complete implementations ready for activation
- To activate: Update `ProcessingControls.tsx` to use `/api/process-enhanced`
- Test thoroughly before switching production traffic

### Cloudflare Workers (Decision Pending)
- Code is production-ready
- Requires deployment configuration
- Decision: Deploy vs. Remove code
- If removing, archive code first (may need later)

---

*This document tracks implementation gaps and technical debt. Update when features are completed or new issues are discovered.*
