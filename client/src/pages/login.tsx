/*
 * © 2025 Full Digital LLC. All Rights Reserved.
 * CUTMV - Login Page
 * Email-only authentication with magic links
 */

import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, ArrowLeft, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  
  // Get error from URL params (no email pre-filling for security)
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const error = urlParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email,
          callbackUrl: '/app' 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
        toast({
          title: "Login link sent!",
          description: "Check your email for a secure login link.",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send login link",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Login successful!",
          description: "Redirecting to your dashboard...",
        });
        // Redirect to dashboard
        window.location.href = '/app';
      } else {
        toast({
          title: "Invalid code",
          description: data.error || "The code you entered is invalid or expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Login to CUTMV
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter your email to receive a secure login link
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {emailSent ? (
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-brand-green/10 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-brand-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Check your email
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      We've sent a login link and 6-digit code to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      The code will expire in 15 minutes
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                        Or enter your code
                      </span>
                    </div>
                  </div>

                  {/* Code Entry Form */}
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        6-digit verification code
                      </label>
                      <Input
                        id="code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full text-center text-2xl tracking-widest font-mono"
                        disabled={isVerifying}
                        autoComplete="one-time-code"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green-light text-brand-black font-semibold"
                      disabled={isVerifying || verificationCode.length !== 6}
                    >
                      {isVerifying ? (
                        <>
                          <div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin mr-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Verify code
                        </>
                      )}
                    </Button>
                  </form>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                      setVerificationCode('');
                    }}
                    className="w-full"
                  >
                    Try different email
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="w-full"
                        disabled={isLoading}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-brand-green hover:bg-brand-green-light text-brand-black font-semibold"
                      disabled={isLoading || !email}
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send login link
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  No password needed. We'll send you a secure login link and 6-digit code.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Don't have an account? One will be created automatically when you log in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}