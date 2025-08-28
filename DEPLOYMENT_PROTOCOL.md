# CUTMV Deployment & Testing Protocol

**© 2025 Full Digital LLC - Internal Documentation**

## Critical Deployment Rules

### ❌ FORBIDDEN PRACTICES
- **NO development login systems or dev dashboards** 
- **NO test environments, debug tools, or ancillary testing interfaces**
- **NO development bypasses or authentication shortcuts**
- **NO mock data endpoints or fallback testing systems**

### ✅ EXCLUSIVE TESTING PROTOCOL

**ONLY ACCEPTABLE TESTING METHOD:**
1. **Deploy** to production domain: https://cutmv.fulldigitalll.com
2. **Login** using personal email through production magic link system
3. **Test** through authenticated session actions and requests

## Deployment Process

### Step 1: Pre-Deployment Checklist
- [ ] All code changes committed
- [ ] No debug/test files present in codebase
- [ ] Authentication system uses production magic links only
- [ ] Session management configured for production domain
- [ ] API endpoints return proper JSON responses
- [ ] Background job system integrated with enhanced processor

### Step 2: Deploy to Production
- Use Replit Deploy button
- Target domain: https://cutmv.fulldigitalll.com
- Verify deployment success

### Step 3: Production Testing Protocol
1. **Authentication Test**
   - Go to https://cutmv.fulldigitalll.com
   - Use personal email for magic link login
   - Verify successful login and dashboard access

2. **Upload Test**
   - Upload a video file
   - Verify metadata extraction and R2 storage
   - Confirm video appears in dashboard

3. **Individual Export Test**
   - Test single export options (cutdowns, GIF, thumbnails, Canvas)
   - Verify processing starts and completes
   - Check email notifications received

4. **Bulk Export Test**
   - Select multiple export options simultaneously
   - Submit bulk export request
   - Monitor processing progress
   - Verify completion emails and download links

### Step 4: Issue Resolution
If issues occur during production testing:
- Check server logs in Replit console
- Verify database records in background_jobs table
- Confirm email delivery through Resend service
- Check R2 storage for processed files

## System Architecture Notes

### Authentication Flow
- Magic link sent via Resend email service
- Session cookie: `cutmv-session` with exact domain matching
- 8-hour session timeout for security
- Production HTTPS required with secure cookies

### Processing Pipeline
- Enhanced processor with Cloudflare Queues fallback
- Background job manager creates database records
- Email notifications for start/completion/failure
- Adaptive timeouts based on processing complexity
- R2 storage for all uploads and exports

### Critical Components
1. **Enhanced Processor** (`server/enhanced-process.ts`)
   - Creates background job records via backgroundJobManager
   - Handles direct processing when queues unavailable
   - Manages complex timeout calculations

2. **Background Job Manager** (`server/background-job-manager.ts`)
   - Creates job database records
   - Sends email notifications
   - Tracks processing progress

3. **Authentication System** (`server/auth-*`)
   - Magic link generation and verification
   - Session management with secure cookies
   - Production domain-specific configuration

## Troubleshooting Guide

### Session Authentication Issues
- Verify cookie domain matches exactly: `cutmv.fulldigitalll.com`
- Check HTTPS requirement in production
- Confirm session not expired (8-hour limit)

### Bulk Export Failures
- Check API endpoints return JSON, not HTML
- Verify background job creation in database
- Monitor enhanced processor logs
- Confirm email service operational

### Processing Timeouts
- Adaptive timeouts: 5-45 minutes based on complexity
- Large files (up to 10GB) require extended timeouts
- Multiple export types increase processing time

## Email Notification System
- **Service**: Resend API
- **Templates**: Professional Full Digital branding
- **Triggers**: Processing start, completion, failure
- **Delivery**: Automatic via background job manager

## File Storage
- **Primary**: Cloudflare R2 storage
- **Organization**: User-specific folders (`user-{hash}/uploads/`, `user-{hash}/exports/`)
- **Access**: Signed URLs for secure downloads
- **Retention**: 29 days for all exports

---

**Remember**: This system is production-only. All testing must occur through the live deployment with real authentication and processing workflows.