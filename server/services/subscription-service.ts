/*
 * © 2025 Full Digital LLC. All Rights Reserved.
 * CUTMV - Subscription Service
 * Stripe subscription management with credit allocation
 */

import Stripe from 'stripe';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { creditService } from './credit-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Subscription plan configuration
export interface SubscriptionPlan {
  id: string;
  name: string;
  priceId: string;
  monthlyCredits: number;
  price: number; // in cents
  description: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    monthlyCredits: 10,
    price: 999, // $9.99/month
    description: '10 credits per month for basic video processing'
  },
  {
    id: 'pro',
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    monthlyCredits: 30,
    price: 1999, // $19.99/month
    description: '30 credits per month for professional use'
  },
  {
    id: 'business',
    name: 'Business',
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business',
    monthlyCredits: 100,
    price: 4999, // $49.99/month
    description: '100 credits per month for business teams'
  }
];

export class SubscriptionService {
  /**
   * Get or create Stripe customer for user
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<string> {
    try {
      // Check if user already has a Stripe customer ID
      const [user] = await db
        .select({ stripeCustomerId: users.stripeCustomerId })
        .from(users)
        .where(eq(users.id, userId));

      if (user?.stripeCustomerId) {
        console.log(`✅ User ${userId} already has Stripe customer: ${user.stripeCustomerId}`);
        return user.stripeCustomerId;
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        name: name || email,
        metadata: {
          userId
        }
      });

      // Save customer ID to database
      await db
        .update(users)
        .set({ stripeCustomerId: customer.id })
        .where(eq(users.id, userId));

      console.log(`✅ Created Stripe customer ${customer.id} for user ${userId}`);
      return customer.id;
    } catch (error) {
      console.error('Error getting or creating Stripe customer:', error);
      throw new Error('Failed to create Stripe customer');
    }
  }

  /**
   * Create a subscription checkout session
   */
  async createCheckoutSession(
    userId: string,
    email: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      if (!plan) {
        throw new Error(`Invalid plan ID: ${planId}`);
      }

      // Get or create customer
      const customerId = await this.getOrCreateCustomer(userId, email);

      // Create Checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          planId: plan.id,
          monthlyCredits: plan.monthlyCredits.toString()
        },
        subscription_data: {
          metadata: {
            userId,
            planId: plan.id,
            monthlyCredits: plan.monthlyCredits.toString()
          }
        }
      });

      console.log(`✅ Created checkout session ${session.id} for user ${userId}`);
      return session.url!;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Get user's current subscription status
   */
  async getSubscriptionStatus(userId: string): Promise<{
    hasActiveSubscription: boolean;
    subscriptionId?: string;
    customerId?: string;
    status?: string;
    currentPeriodEnd?: Date;
    plan?: SubscriptionPlan;
    cancelAtPeriodEnd?: boolean;
  }> {
    try {
      const [user] = await db
        .select({
          stripeCustomerId: users.stripeCustomerId,
          stripeSubscriptionId: users.stripeSubscriptionId
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!user?.stripeSubscriptionId) {
        return { hasActiveSubscription: false };
      }

      // Get subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

      const isActive = subscription.status === 'active' || subscription.status === 'trialing';

      // Find matching plan
      const priceId = subscription.items.data[0]?.price.id;
      const plan = SUBSCRIPTION_PLANS.find(p => p.priceId === priceId);

      return {
        hasActiveSubscription: isActive,
        subscriptionId: subscription.id,
        customerId: user.stripeCustomerId || undefined,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        plan,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return { hasActiveSubscription: false };
    }
  }

  /**
   * Cancel a subscription (at period end)
   */
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const [user] = await db
        .select({ stripeSubscriptionId: users.stripeSubscriptionId })
        .from(users)
        .where(eq(users.id, userId));

      if (!user?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      // Cancel at period end
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      console.log(`✅ Scheduled subscription ${user.stripeSubscriptionId} for cancellation`);
      return true;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return false;
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  async reactivateSubscription(userId: string): Promise<boolean> {
    try {
      const [user] = await db
        .select({ stripeSubscriptionId: users.stripeSubscriptionId })
        .from(users)
        .where(eq(users.id, userId));

      if (!user?.stripeSubscriptionId) {
        throw new Error('No subscription found');
      }

      // Remove cancellation
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: false
      });

      console.log(`✅ Reactivated subscription ${user.stripeSubscriptionId}`);
      return true;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      return false;
    }
  }

  /**
   * Handle successful subscription payment - grant credits
   */
  async handleSubscriptionPaymentSuccess(
    subscriptionId: string,
    customerId: string
  ): Promise<void> {
    try {
      console.log(`💳 Processing subscription payment success: ${subscriptionId}`);

      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      // Get user ID from metadata
      const userId = subscription.metadata.userId;
      const planId = subscription.metadata.planId;
      const monthlyCredits = parseInt(subscription.metadata.monthlyCredits || '0');

      if (!userId || !monthlyCredits) {
        console.error('Missing metadata in subscription:', subscription.metadata);
        throw new Error('Invalid subscription metadata');
      }

      // Update user's subscription ID in database
      await db
        .update(users)
        .set({
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId
        })
        .where(eq(users.id, userId));

      // Grant monthly credits
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
      const planName = plan?.name || 'Subscription';

      await creditService.grantSubscriptionCredits(userId, monthlyCredits, planName);

      console.log(`✅ Granted ${monthlyCredits} credits to user ${userId} for subscription payment`);
    } catch (error) {
      console.error('Error handling subscription payment success:', error);
      throw error;
    }
  }

  /**
   * Handle subscription cancellation
   */
  async handleSubscriptionCanceled(subscriptionId: string): Promise<void> {
    try {
      console.log(`❌ Processing subscription cancellation: ${subscriptionId}`);

      // Find user by subscription ID
      const [user] = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.stripeSubscriptionId, subscriptionId));

      if (user) {
        // Clear subscription ID
        await db
          .update(users)
          .set({ stripeSubscriptionId: null })
          .where(eq(users.id, user.id));

        console.log(`✅ Cleared subscription for user ${user.id}`);
      }
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
    }
  }

  /**
   * Get available subscription plans
   */
  getPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }
}

export const subscriptionService = new SubscriptionService();
