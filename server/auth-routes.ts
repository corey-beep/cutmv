/*
 * © 2025 Full Digital LLC. All Rights Reserved.
 * CUTMV - Authentication Routes
 * Magic link authentication endpoints
 */

import { Router } from 'express';
import { authService } from './auth-service';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';

const router = Router();

// Request magic link with referral support
router.post('/signin', async (req, res) => {
  try {
    const { email, callbackUrl, ref } = req.body;
    
    // Validate email
    const validatedData = insertUserSchema.parse({ email });
    
    await authService.sendMagicLink(validatedData.email, callbackUrl, ref);
    
    res.json({ 
      success: true, 
      message: 'Login link sent to your email' 
    });
  } catch (error) {
    console.error('❌ Signin error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to send login link' 
    });
  }
});

// Verify 6-digit code and create session
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate inputs
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Validate email format
    const validatedData = insertUserSchema.parse({ email });

    // Verify the 6-digit code
    const { user, session } = await authService.verifyCode(validatedData.email, code);

    // Set session cookie with matching name and settings as magic link verification
    const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT;

    res.cookie('cutmv-session', session.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days (match magic link)
    });

    console.log('✅ 6-digit code verified and session created:', {
      userId: user.id,
      email: user.email,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('❌ Code verification error:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Invalid verification code',
    });
  }
});

// Verify magic link and create session
router.get('/verify', async (req, res) => {
  try {
    const { auth, token, email, callbackUrl } = req.query;
    
    let actualEmail, actualToken, actualCallbackUrl;
    
    // Handle new encrypted auth format or legacy format
    if (auth) {
      try {
        const { urlSecurity } = await import('./url-security.js');
        const authData = urlSecurity.decodeSessionToken(auth as string);
        actualEmail = authData.email;
        actualToken = authData.sessionId;
        actualCallbackUrl = authData.videoName;
      } catch (error) {
        console.error('Failed to decrypt auth token:', error);
        return res.status(400).json({ error: 'Invalid authentication token' });
      }
    } else {
      // Legacy format for backward compatibility
      actualEmail = email as string;
      actualToken = token as string;
      actualCallbackUrl = callbackUrl as string;
    }
    
    console.log('🔗 Magic link verification attempt:', {
      token: actualToken ? `${actualToken.toString().substring(0, 8)}...` : 'missing',
      email: actualEmail,
      callbackUrl: actualCallbackUrl,
      authFormat: auth ? 'encrypted' : 'legacy',
      host: req.get('host'),
      userAgent: req.get('user-agent')
    });
    
    if (!actualToken || !actualEmail) {
      console.log('❌ Missing token or email in magic link');
      return res.status(400).json({ error: 'Missing token or email' });
    }

    const { user, session } = await authService.verifyMagicLink(
      actualToken, 
      actualEmail
    );
    
    console.log('✅ Magic link verified successfully for:', actualEmail);
    console.log('🔄 Setting up session and redirecting to dashboard...');

    // Set session cookie with canonical domain strategy
    const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT;
    const host = req.get('host') || '';
    const isCanonicalDomain = host === 'cutmv.fulldigitalll.com';
    
    const cookieOptions: any = {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    
    // Apply secure settings and domain scope for canonical domain
    if (isProduction && isCanonicalDomain) {
      cookieOptions.secure = true; // HTTPS required
      cookieOptions.domain = '.fulldigitalll.com'; // Domain scope for subdomain sharing
    } else if (isProduction && !isCanonicalDomain) {
      // Production but non-canonical domain - should have been redirected
      console.warn('⚠️ Setting cookie on non-canonical domain in production:', host);
      cookieOptions.secure = true;
      cookieOptions.domain = '.fulldigitalll.com';
    } else {
      // Development settings - don't use secure or domain restrictions
      cookieOptions.secure = false;
      // No domain restriction for development
    }
    
    res.cookie('cutmv-session', session.token, cookieOptions);
    
    console.log('🍪 Session cookie set:', {
      secure: cookieOptions.secure,
      domain: cookieOptions.domain || 'browser-default (no explicit domain)',
      sameSite: cookieOptions.sameSite,
      maxAge: cookieOptions.maxAge,
      environment: process.env.NODE_ENV,
      deployment: !!process.env.REPLIT_DEPLOYMENT,
      host: req.get('host'),
      isCanonicalDomain
    });

    // Redirect to app after successful login
    const redirectUrl = actualCallbackUrl || '/app';
    console.log('🔄 Redirecting authenticated user to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Verify error:', error);
    res.redirect(`/login?error=${encodeURIComponent('Invalid or expired login link')}`);
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const sessionToken = req.cookies['cutmv-session'];
    
    if (sessionToken) {
      await authService.logout(sessionToken);
    }
    
    // Clear cookie with canonical domain strategy
    const host = req.get('host') || '';
    const isProduction = process.env.NODE_ENV === 'production' || process.env.REPLIT_DEPLOYMENT;
    const isCanonicalDomain = host === 'cutmv.fulldigitalll.com';
    
    if (isProduction) {
      // Clear cookie with matching domain scope for proper cleanup
      res.clearCookie('cutmv-session', { 
        secure: true, 
        domain: '.fulldigitalll.com',
        sameSite: 'lax'
      });
      // Also clear consent cookie if needed
      res.clearCookie('cutmv-consent', {
        secure: true,
        domain: '.fulldigitalll.com',
        sameSite: 'lax'
      });
    } else {
      // Development - clear without domain restrictions
      res.clearCookie('cutmv-session');
      res.clearCookie('cutmv-consent');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Complete onboarding
router.post('/complete-onboarding', async (req, res) => {
  try {
    const sessionToken = req.cookies['cutmv-session'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auth = await authService.verifySession(sessionToken);
    if (!auth) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const { name, marketingConsent } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updatedUser = await authService.completeOnboarding(
      auth.user.id, 
      name.trim(), 
      marketingConsent === true
    );

    res.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('❌ Complete onboarding error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to complete onboarding' 
    });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const sessionToken = req.cookies['cutmv-session'];
    
    // Silent logging for debugging - no user-facing output
    console.log('Auth check:', {
      hasSession: !!sessionToken,
      endpoint: '/api/auth/me'
    });
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auth = await authService.verifySession(sessionToken);
    
    if (!auth) {
      res.clearCookie('cutmv-session');
      return res.status(401).json({ error: 'Invalid session' });
    }

    res.json({
      user: auth.user
    });
  } catch (error) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Get user dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const sessionToken = req.cookies['cutmv-session'];
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auth = await authService.verifySession(sessionToken);
    
    if (!auth) {
      res.clearCookie('cutmv-session');
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Get comprehensive Supabase data
    let dashboardData: {
      user: any;
      credits: number;
      referralStats: any;
      exports: any[];
    } = {
      user: auth.user,
      credits: 0,
      referralStats: null,
      exports: []
    };

    // Note: Credits and referral stats are now handled by dedicated services
    // This endpoint returns basic dashboard structure
    res.json(dashboardData);
  } catch (error) {
    console.error('❌ Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Profile management routes
router.patch('/profile', async (req, res) => {
  try {
    const { name, marketingConsent } = req.body;
    const sessionToken = req.cookies['cutmv-session'];

    if (!sessionToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auth = await authService.verifySession(sessionToken);
    if (!auth) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Update user in database
    const updatedUser = await authService.updateUserProfile(auth.user.id, {
      name: name?.trim(),
      marketingConsent: Boolean(marketingConsent)
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Billing info routes for stored payment methods
router.get('/billing/info', async (req, res) => {
  try {
    const sessionToken = req.cookies['cutmv-session'];

    if (!sessionToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const auth = await authService.verifySession(sessionToken);
    if (!auth) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // For now, return empty billing info since we're focusing on checkout flow
    // In the future, this would fetch stored payment methods from Stripe
    res.json({});
  } catch (error) {
    console.error('Billing info error:', error);
    res.status(500).json({ error: 'Failed to fetch billing information' });
  }
});

export default router;