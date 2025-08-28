# CUTMV - Music Video Cut-Down Tool

## Overview
CUTMV is a specialized web application for music video editing and clip creation. It enables users to upload videos, generate clips using adaptive algorithms or custom timestamps, and apply professional fade effects through an intuitive interface. The project aims to bring advanced video editing capabilities to music creators without the complexity of traditional tools, with a vision to become a go-to platform for quick, high-quality music video content generation. CUTMV is a paid-only service producing professional-quality exports optimized for commercial use.

## User Preferences
Preferred communication style: Simple, everyday language.
Interface preference: Simple, minimal - focus on core workflow: upload, timestamps, download.
Large file support: Needs to handle up to 10GB video files reliably without hanging or crashes.
Progress feedback: Users want real-time upload progress for large files.
Storage management: Automatic cleanup preferred to prevent workspace disk issues.
Authentication model: Paid-only service with public landing page and authentication-gated app access. Magic link authentication system fully operational with production-safe cookie settings and enhanced debugging.
Business model: Paid-only service with authentication-gated access - all video processing requires user accounts and produces professional-quality exports optimized for commercial use.
Design preferences: Consistent headers across all pages, original CUTMV scrolling banner, maintain visual consistency throughout site.
Brand colors: Exact Full Digital brand green (hsl(85, 70%, 55%)) used consistently.
SEO requirements: Comprehensive favicon implementation with proper cross-platform support for all pages.
Domain consistency: All system components must use https://cutmv.fulldigitalll.com as the primary production domain.
NEVER CREATE DEV LOGIN SYSTEMS OR DEV DASHBOARDS. User tests EXCLUSIVELY by deploying to custom domain (https://cutmv.fulldigitalll.com). User logs in with personal email through production magic link system. NO development endpoints, NO dev authentication buttons, NO development bypasses, NO debug tools, NO test environments, NO ancillary testing interfaces, NO local testing whatsoever. All testing must use the production authentication flow. Any development login functionality or testing tools are strictly forbidden and must be removed immediately. EXCLUSIVE TESTING PROTOCOL: Deploy → Login → Test through authenticated session. ABSOLUTE RULE: There should be absolutely no local testing. All testing should be per protocol via redeployment and login authenticated actions.

## System Architecture

This application follows a modern full-stack architecture with clear separation between frontend and backend concerns, emphasizing a progressive 3-step workflow (Upload → Timestamps → Process) and a responsive, mobile-first UI/UX design.

## Recent Fixes (August 2025)
- **BREAKTHROUGH August 8th**: Completely eliminated the core TypeScript undefined access error (`this.getTimeLeftMinutes` in static context) that was causing ALL exports to fail immediately. Fixed by converting to proper static method calls (`TimeoutManager.getTimeLeftMinutes`). Processing now works without crashes.
- **Enhanced R2 Download Validation**: Added HEAD requests, empty file detection, and comprehensive error handling. Fixed R2 video download failures causing FFmpeg to hang with non-existent input files.
- **R2 Infrastructure Crisis RESOLVED (Aug 8, 2025)**: 
  - AWS SDK v3.848.0 and v3.600.0 had `labelValue.split` bug preventing R2 uploads
  - **FIXED**: Downgraded to AWS SDK v3.400.0 - R2 uploads and downloads now working
  - **FIXED**: Magic link authentication - resolved URL encryption crypto errors causing login failures
  - ✅ New uploads: Fully functional with proper R2 storage
  - ✅ New downloads: Signed URLs work correctly
  - ✅ Authentication: Magic link system operational
  - ⚠️ Legacy videos: Some existing videos still return 403 Forbidden (access permission issue)
  - 🔧 Export processing: Will work for new uploads, may fail for some legacy videos
- **Timeout Recalibration**: Adjusted timeout settings for complex processing: base 10min, multiplier 3.0x, buffer 50% to handle multi-cutdown exports with fade effects and aspect ratio conversions. Fixed 8.5-minute deadline failures.
- **CRITICAL THUMBNAIL PERFORMANCE FIX (Aug 8, 2025)**: Fixed 10+ minute thumbnail delays by eliminating slow R2 ffprobe duration lookups. Thumbnails now use cached video duration and fast fallbacks, reducing processing from minutes to seconds.
- **Enhanced Job Status Tracking**: Implemented orphaned job detection system that automatically cleans up processing jobs interrupted by system restarts. Added proper status validation and real-time monitoring.
- **Cutdown Processing Optimization**: Streamlined and optimized the entire cutdown workflow for maximum reliability. Enhanced FFmpeg processing with proper aspect ratio handling, fade effects, and real-time progress tracking.
- **Real-Time TypeScript Error Prevention**: Implemented comprehensive multi-layered TypeScript enforcement system with ESLint v9, Husky pre-commit hooks, and strict type checking. Established zero-tolerance type error policy for development and deployment.
- **Canonical Domain Strategy Implementation**: Completed single domain strategy with cutmv.fulldigitalll.com as exclusive canonical domain. All non-canonical domains (cutmv.com, fulldigitalll.com) now redirect with 301 before setting cookies. Implemented domain-scoped cookies (Domain=.fulldigitalll.com) for unified session management across mobile devices.
- **Mobile Cookie Consent**: Fixed perpetual consent requests on mobile by removing window focus listeners that interfered with app switching.
- **Duplicate Job Prevention**: Eliminated circular calling pattern between enhanced processor and background job manager that created duplicate jobs and emails.
- **Extended Cookie Consent**: Implemented 365-day validity period with global singleton state management.
- **Single Job Per User**: Added database validation to prevent concurrent processing jobs with clear user messaging.
- **Failed Job Badging**: Enhanced automatic detection and proper status marking of failed export jobs with detailed error messages.
- **Job Failure Monitor Fixed**: Resolved all TypeScript errors preventing the monitor from detecting and auto-restarting stuck processing jobs.
- **Stuck Job Recovery**: Enhanced monitor now detects stuck pending jobs (>1 minute) and processing jobs (>35 minutes) and automatically restarts them.
- **Unified Deadline System Implementation**: Replaced multiple competing timeout layers with single source of truth deadline calculation. Jobs now compute one deadline timestamp at start and all components respect this deadline. Implemented cancellation tokens, stage time allocation, and deadline-aware admission control for Canvas processing.
- **Complete Timeout Conflict Elimination**: Systematically removed ALL conflicting timeout systems from FFmpeg layer, Enhanced Processor, and Background Job Manager. Only the unified deadline system remains active across all processing components.

### Frontend
- **Frameworks**: React 18 with TypeScript, Vite, shadcn/ui (Radix UI), Tailwind CSS.
- **State Management**: TanStack Query for server state, React hooks for local state.
- **Routing**: Wouter.
- **UI/UX Decisions**: Progressive 3-step workflow, responsive design, comprehensive error handling, accessibility-focused components, Full Digital branding (black headers, bright green accents), professional typography. Consistent Header, original CUTMV scrolling banner, unified visual identity.
- **Authentication**: Public landing page (/) with protected application (/app) requiring magic link authentication.
- **SEO & Meta Tags**: Comprehensive favicon implementation with dynamic page-specific titles/descriptions.
- **Navigation System**: Streamlined sidebar navigation with consolidated Settings menu, mobile-responsive hamburger menu, and persistent Tool access.

### Backend
- **Runtime**: Node.js with Express.js, TypeScript with ES modules.
- **API Style**: REST API with JSON responses.
- **Video Processing**: FFmpeg for manipulation and metadata extraction with universal progress tracking. Automated black frame elimination, configurable cross-dissolve, exponential audio fades, and intelligent letterbox removal.
- **File Upload**: Multer for large file uploads (up to 10GB) with dynamic chunk sizing and retry logic.
- **Monetization**: Exclusive paid service model with premium, professional-quality exports, promo code management, and credit wallet system. Secure promo code system with complete frontend privacy - codes only visible when user starts typing, external sharing handled independently.
- **Core Features**:
    - Video Upload System: Drag-and-drop, validation, progress feedback, metadata extraction.
    - Timestamp Processing: Flexible parsing, validation against video duration, visual preview.
    - Video Clip Generation: Batch processing, quality settings, real-time progress, ZIP generation.
    - Adaptive Export System: Intelligent scaling for GIFs, thumbnails, and Canvas loops. Dual aspect ratio export (16:9 and 9:16 vertical with smart center cropping). Spotify Canvas export.
    - AI Integration: AI-powered metadata suggestions via intelligent filename analysis. GPT-powered automated blog system.
    - DIY Referral System: Self-hosted credit-based referral program with custom domain links.
    - User Profile Management: Account settings, email management, referral integration. Enhanced personalization with user names.
    - Email-Only Authentication: Magic link system with PostgreSQL user management.
    - Professional Export Quality: All outputs are commercial-grade. Universal 29-day retention.
    - Comprehensive Temporary File Cleanup: Guaranteed cleanup for all FFmpeg processes.
    - Advanced Time Estimation System: Comprehensive time prediction system with complexity analysis for all export combinations, real-time tracking, and fluctuation handling.
    - Floating Feedback System: Site-wide categorized feedback form with star rating and email delivery.
    - Activity Logging System: Automatic logging of user activities for audit trails and support.
    - Download System: Complete end-to-end download flow from dashboard to R2 file delivery with secure token validation.
    - Production Optimization: Comprehensive adaptive timeout scaling for simultaneous multi-export processing based on file size (up to 10GB), video duration, export combinations, bulk processing detection, and Canvas complexity. Timeouts range from 5-45 minutes dynamically calculated per job.
    - Email Branding: Consistent Full Digital branding across all email templates with professional inline SVG logos for guaranteed email client compatibility.
    - Cookie Consent: Robust localStorage error handling and mobile-specific behavior. Extended 365-day validity period with global singleton state management.
    - Concurrent Job Management: Allows up to 3 simultaneous exports per user to prevent overlap while enabling efficient processing.
    - Enhanced Job Status Management: Automatic failed job detection and proper status badging with detailed error messages.

### Data Architecture
- **Database**: PostgreSQL with Drizzle ORM.
- **Schema**: Type-safe schema defined in TypeScript files.
- **File Storage**: Exclusive Cloudflare R2 storage with comprehensive user association and access controls. Organized folder structure: `user-{hash}/uploads/` and `user-{hash}/exports/`.

## External Dependencies

- **Database**:
    - `@neondatabase/serverless`: PostgreSQL database driver
    - `drizzle-orm`: Type-safe ORM
- **Video Processing**:
    - `fluent-ffmpeg`: Node.js wrapper for FFmpeg
- **File Handling**:
    - `multer`: Express middleware for file uploads
    - `adm-zip`: ZIP file creation
    - `@aws-sdk/client-s3`: For Cloudflare R2 integration
- **UI & Frontend**:
    - `@radix-ui/*`: Headless UI primitives
    - `@tanstack/react-query`: Server state management
    - `tailwindcss`: CSS framework
    - `react-dropzone`: Drag-and-drop file upload
- **Email & Messaging**:
    - `resend`: Email delivery service
    - `kickbox`: Email verification service
- **Analytics & Monitoring**:
    - `sentry`: Error tracking and performance monitoring
    - `PostHog`: Product analytics
- **Authentication**:
    - `bcrypt`: Password hashing (for admin)
- **AI/Content Generation**:
    - `openai`: For GPT-powered blog system
- **Deployment**:
    - Cloudflare Queues: For serverless processing (with fallback to direct processing)