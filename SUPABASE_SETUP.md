# CUTMV Supabase Integration Setup Guide

## Overview
This guide helps you set up Supabase as the centralized database for CUTMV's user authentication, referral tracking, and credit management system.

## Prerequisites
- Replit project running CUTMV
- Supabase account (free at https://supabase.com)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `CUTMV`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for setup to complete (2-3 minutes)

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor** 
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql` from your CUTMV project
4. Paste into the SQL editor
5. Click **Run** to execute
6. Verify tables were created in **Table Editor**

You should see these tables:
- `users` - User accounts with referral codes
- `referrals` - Referral tracking
- `credit_transactions` - Credit earning/spending history  
- `exports` - User export tracking

## Step 3: Get API Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## Step 4: Configure Replit Secrets

1. In your Replit project, go to **Secrets** (lock icon in left sidebar)
2. Add these secrets:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: Replace with your actual values from Step 3!

## Step 5: Test Integration

1. Restart your Replit application
2. Check the console logs - you should see:
   ```
   ✅ Supabase integration initialized
   ```
   Instead of:
   ```
   ⚠️ Supabase configuration missing - falling back to local storage
   ```

3. Visit `/supabase` in your app to see the Supabase dashboard
4. Try creating a new user account to test the integration

## Step 6: Verify Features

Test these features work:

- **User Registration**: Sign up with email, check users table
- **Referral Tracking**: Sign up with `?ref=CODE`, verify referrals table
- **Credit System**: Check credit_transactions table for automatic rewards
- **Admin Analytics**: Visit `/admin` and check Supabase analytics tab

## Troubleshooting

### "Supabase configuration missing"
- Verify secrets are set correctly in Replit
- Check spelling of `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Restart the application after adding secrets

### "Failed to create user in Supabase"
- Check your database schema was created correctly
- Verify your anon key has the right permissions
- Check Supabase logs in your dashboard

### "Row Level Security policy violation"
- The schema includes RLS policies for security
- Make sure you ran the complete `supabase-schema.sql`

## Benefits After Setup

Once configured, CUTMV will have:
- ✅ Persistent user data across devices/sessions
- ✅ Automated referral tracking and credit rewards
- ✅ Centralized admin analytics and user management
- ✅ Foundation for future features (leaderboards, user dashboard)
- ✅ Scalable backend supporting growth

## Next Steps

1. **User Dashboard**: Visit `/supabase` to see user data and referrals
2. **Admin Analytics**: Check `/admin` for comprehensive Supabase analytics
3. **Referral Sharing**: Users can now share referral links and earn credits
4. **Credit Integration**: Connect credit spending to export processing

## Support

If you encounter issues:
1. Check Replit console logs for error messages
2. Verify Supabase dashboard shows tables and data
3. Test with a simple user signup first
4. Contact support if integration fails