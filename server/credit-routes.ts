/*
 * © 2025 Full Digital LLC. All Rights Reserved.
 * CUTMV - Credit System API Routes
 * Complete credit wallet management and usage tracking
 */

import { Router } from 'express';
import { creditService } from './services/credit-service';
import { requireAuth } from './auth-middleware';

const router = Router();

/**
 * Get user's current credit balance
 */
router.get('/balance', requireAuth, async (req, res) => {
  try {
    const credits = await creditService.getUserCredits(req.user!.id);
    
    res.json({
      success: true,
      credits,
      userId: req.user!.id
    });
  } catch (error) {
    console.error('Error getting credit balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get credit balance'
    });
  }
});

/**
 * Get user's credit transaction history
 */
router.get('/history', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const history = await creditService.getCreditHistory(req.user!.id, limit);
    
    res.json({
      success: true,
      history,
      total: history.length
    });
  } catch (error) {
    console.error('Error getting credit history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get credit history'
    });
  }
});

/**
 * Check if user can afford export
 */
router.get('/can-afford/:cost?', requireAuth, async (req, res) => {
  try {
    const cost = parseInt(req.params.cost || '1');
    const canAfford = await creditService.canAffordExport(req.user!.id, cost);
    const currentCredits = await creditService.getUserCredits(req.user!.id);
    
    res.json({
      success: true,
      canAfford,
      currentCredits,
      requiredCredits: cost,
      shortfall: canAfford ? 0 : Math.max(0, cost - currentCredits)
    });
  } catch (error) {
    console.error('Error checking affordability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check affordability'
    });
  }
});

/**
 * Process export payment with credits
 */
router.post('/pay-for-export', requireAuth, async (req, res) => {
  try {
    const { cost = 1, note } = req.body;
    
    const success = await creditService.processExportPayment(req.user!.id, cost);
    
    if (success) {
      const remainingCredits = await creditService.getUserCredits(req.user!.id);
      
      res.json({
        success: true,
        message: `Successfully deducted ${cost} credit(s)`,
        remainingCredits,
        deductedAmount: cost
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Insufficient credits for export'
      });
    }
  } catch (error) {
    console.error('Error processing credit payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process credit payment'
    });
  }
});

/**
 * Process first export bonus (one-time only)
 */
router.post('/first-export-bonus', requireAuth, async (req, res) => {
  try {
    const success = await creditService.processFirstExportBonus(req.user!.id);
    
    if (success) {
      const currentCredits = await creditService.getUserCredits(req.user!.id);
      
      res.json({
        success: true,
        message: 'First export bonus granted!',
        bonusAmount: 1,
        currentCredits
      });
    } else {
      res.json({
        success: false,
        message: 'First export bonus already claimed or not eligible'
      });
    }
  } catch (error) {
    console.error('Error processing first export bonus:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process first export bonus'
    });
  }
});

export default router;