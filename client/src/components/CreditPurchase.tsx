/*
 * © 2025 Full Digital LLC. All Rights Reserved.
 * CUTMV - Credit Purchase Component
 * Buy credits for video processing
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, CreditCard, Check, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CREDIT_PACKAGES = [
  { amount: 10, credits: 1000, popular: false },
  { amount: 25, credits: 2500, popular: true },
  { amount: 50, credits: 5000, popular: false },
  { amount: 100, credits: 10000, popular: false },
];

interface CreditPurchaseProps {
  onPurchaseComplete?: () => void;
}

export default function CreditPurchase({ onPurchaseComplete }: CreditPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState(CREDIT_PACKAGES[1]); // Default to $25
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    setIsPurchasing(true);

    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: selectedPackage.amount,
        }),
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast({
          title: 'Purchase failed',
          description: data.error || 'Failed to create checkout session',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Credit purchase error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-brand-green" />
          Purchase Credits
        </CardTitle>
        <CardDescription>
          Buy credits to process your videos. Credits never expire!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Pricing Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Credit Pricing
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  $10 = 1,000 credits ($1 = 100 credits)
                </p>
              </div>
            </div>
          </div>

          {/* Package Selection */}
          <div className="grid grid-cols-2 gap-3">
            {CREDIT_PACKAGES.map((pkg) => (
              <button
                key={pkg.amount}
                onClick={() => setSelectedPackage(pkg)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  selectedPackage.amount === pkg.amount
                    ? 'border-brand-green bg-brand-green/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 -right-2 bg-brand-green text-brand-black">
                    Popular
                  </Badge>
                )}
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${pkg.amount}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {pkg.credits.toLocaleString()} credits
                  </p>
                </div>
                {selectedPackage.amount === pkg.amount && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-brand-green" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Selected Package Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                You'll receive:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedPackage.credits.toLocaleString()} credits
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total:
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${selectedPackage.amount}
              </span>
            </div>
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={isPurchasing}
            className="w-full bg-brand-green hover:bg-brand-green-light text-brand-black font-semibold"
          >
            {isPurchasing ? (
              <>
                <div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Purchase {selectedPackage.credits.toLocaleString()} Credits
              </>
            )}
          </Button>

          {/* Example Usage */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Example Usage:
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• 1 cutdown video: 99 credits</li>
              <li>• GIF pack (10 GIFs): 199 credits</li>
              <li>• Thumbnail pack (10 thumbnails): 199 credits</li>
              <li>• Spotify Canvas (5 loops): 499 credits</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
