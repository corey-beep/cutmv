# Railway Environment Variables - Quick Setup

## ⚠️ Critical Issue: Missing Environment Variables

Your Railway deployment is failing health checks because **required environment variables are not set**.

---

## 🚨 **Minimum Required Variables (Add These First)**

Add these in Railway Dashboard → Your Service → Variables tab:

```bash
# 1. Database (REQUIRED - app won't work without this)
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# 2. Application Config (REQUIRED)
NODE_ENV=production
SESSION_SECRET=generate-a-long-random-string-at-least-32-characters-long

# 3. Base URL (will be auto-set by Railway, but you can override)
# Railway automatically provides PORT and sets it, no need to add it
```

### **Where to Get DATABASE_URL:**

**Option A: Use Railway's PostgreSQL (Recommended)**
1. In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
2. Railway will create a database and automatically inject `DATABASE_URL`
3. ✅ No manual configuration needed!

**Option B: Use External Database (Neon, Supabase, etc.)**
1. Create database at https://neon.tech (free tier available)
2. Copy the connection string
3. Add as `DATABASE_URL` in Railway variables

---

## ✅ **Add These Next (For Full Functionality)**

```bash
# Stripe Payment (needed for payments to work)
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudflare R2 Storage (needed for file storage)
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET_NAME=cutmv
R2_ACCOUNT_ID=your-cloudflare-account-id

# Email (needed for magic link authentication)
RESEND_API_KEY=re_...
```

---

## 🔧 **Quick Fix Steps**

### **Step 1: Add Railway PostgreSQL Database**
1. In Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Wait 30 seconds for provisioning
4. `DATABASE_URL` is automatically added to your service ✅

### **Step 2: Add SESSION_SECRET**
1. Go to Variables tab
2. Click "New Variable"
3. Name: `SESSION_SECRET`
4. Value: Generate a random string (32+ characters)
   - Use this: https://generate-secret.vercel.app/32
   - Or run: `openssl rand -base64 32`

### **Step 3: Set NODE_ENV**
1. Add variable: `NODE_ENV` = `production`

### **Step 4: Redeploy**
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. OR just push a new commit to trigger auto-deploy

---

## 📋 **Full Environment Variables Checklist**

Copy this list and check off as you add each one in Railway:

### **Critical (App won't start without these):**
- [ ] `DATABASE_URL` (add Railway PostgreSQL or external)
- [ ] `SESSION_SECRET` (random 32+ char string)
- [ ] `NODE_ENV=production`

### **Important (Core features won't work):**
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `R2_ACCESS_KEY_ID`
- [ ] `R2_SECRET_ACCESS_KEY`
- [ ] `R2_ENDPOINT`
- [ ] `R2_BUCKET_NAME`
- [ ] `R2_ACCOUNT_ID`
- [ ] `RESEND_API_KEY`

### **Optional (Enhanced features):**
- [ ] `POSTHOG_API_KEY` (analytics)
- [ ] `SENTRY_DSN` (error tracking)
- [ ] `OPENAI_API_KEY` (AI features)
- [ ] `KICKBOX_API_KEY` (email validation)

---

## 🎯 **After Adding Variables**

1. Railway will automatically redeploy
2. Watch the deployment logs for:
   ```
   ✅ Environment validation completed
   serving on port 3000
   ```
3. Health check should now pass!
4. Your app will be live at: `https://your-app.up.railway.app`

---

## 🐛 **Still Failing? Check Deployment Logs**

1. Go to Railway Dashboard → Deployments
2. Click on the failed deployment
3. Look for error messages in the logs
4. Common issues:
   - Database connection string format wrong
   - Missing SSL mode: add `?sslmode=require` to DATABASE_URL
   - Invalid Stripe key format
   - R2 endpoint URL incorrect

---

## 💡 **Pro Tip: Use Railway's PostgreSQL**

The easiest way to get started:
1. Add Railway PostgreSQL database (takes 30 seconds)
2. It automatically connects to your service
3. No manual DATABASE_URL configuration needed
4. Included in your Railway plan
5. Automatic backups

**Cost:** Included in Hobby plan ($5/month total)

---

## 🚀 **Quick Start (5 Minutes)**

**For Testing (Minimal Setup):**
```bash
# Add Railway PostgreSQL database (auto-injects DATABASE_URL)
# Then add these 2 variables:
SESSION_SECRET=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
NODE_ENV=production
```

**Deploy and test - everything else can be added later!**

---

## ❓ **Need Help?**

- Railway logs show errors: Check Deployments → View Logs
- Database connection fails: Ensure `?sslmode=require` in URL
- Still stuck: Check `RAILWAY_DEPLOYMENT_GUIDE.md` for detailed troubleshooting

---

*Quick setup guide for Railway deployment - CUTMV v3.5*
