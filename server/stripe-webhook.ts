/*
 * © 2025 Full Digital LLC. All Rights Reserved.
 * CUTMV - Stripe Webhook Handler
 * Handles subscription events and credit allocation
 */

import { Router, raw } from 'express';
import Stripe from 'stripe';
import { subscriptionService } from './services/subscription-service';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Webhook endpoint - must use raw body parser
router.post(
  '/webhook',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      console.error('❌ No Stripe signature found');
      return res.status(400).send('No signature');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.warn('⚠️ No STRIPE_WEBHOOK_SECRET set - webhook signature verification disabled');
        // In development, parse without verification
        event = JSON.parse(req.body.toString());
      } else {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret
        );
      }
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    console.log(`🎣 Received Stripe webhook: ${event.type}`);

    try {
      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;

          // Only handle subscription checkouts
          if (session.mode === 'subscription' && session.subscription) {
            console.log(`✅ Checkout completed for subscription: ${session.subscription}`);

            // The subscription.created event will handle credit allocation
            // We just log this for tracking
          }
          break;
        }

        case 'customer.subscription.created': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`📝 Subscription created: ${subscription.id}`);

          // Grant initial credits
          await subscriptionService.handleSubscriptionPaymentSuccess(
            subscription.id,
            subscription.customer as string
          );
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;

          // Only handle subscription invoices
          if (invoice.subscription && invoice.billing_reason === 'subscription_cycle') {
            console.log(`💳 Subscription payment succeeded: ${invoice.subscription}`);

            // Grant monthly credits
            await subscriptionService.handleSubscriptionPaymentSuccess(
              invoice.subscription as string,
              invoice.customer as string
            );
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`❌ Subscription deleted: ${subscription.id}`);

          // Handle subscription cancellation
          await subscriptionService.handleSubscriptionCanceled(subscription.id);
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`🔄 Subscription updated: ${subscription.id}`);

          // Could handle plan changes here if needed
          break;
        }

        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }

      // Return a 200 response to acknowledge receipt
      res.json({ received: true });
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      res.status(500).json({
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
