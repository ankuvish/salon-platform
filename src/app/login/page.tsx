"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Lock, UserCircle, Store, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending, refetch } = useSession();
  const redirect = searchParams.get("redirect") || "/";
  const hasCheckedSession = useRef(false);
  const isLoggingIn = useRef(false);
  
  const [userType, setUserType] = useState<"customer" | "owner">("customer");
  const [loginMethod, setLoginMethod] = useState<"otp" | "email">("otp");
  
  // OTP fields
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Email/Password fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);

  useEffect(() => {
    // If session is loading, wait
    if (isPending) return;
    
    // Don't auto-redirect if we're in the process of logging in
    if (isLoggingIn.current) return;

    // If no session, reset check flag and allow login
    if (!session?.user) {
      hasCheckedSession.current = false;
      return;
    }

    // If session exists but has no role field (old session), clear it silently once
    if (!session.user.role && !hasCheckedSession.current) {
      hasCheckedSession.current = true;
      authClient.signOut().then(() => {
        localStorage.removeItem("bearer_token");
        refetch();
      });
      return;
    }

    // If session has valid role, redirect to destination
    if (session.user.role) {
      router.push(redirect);
    }
  }, [session, isPending, router, redirect, refetch]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }

    // Validate phone format
    if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
      toast.error("Please enter phone number in international format (e.g., +919876543210)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setCountdown(60);
        toast.success("OTP sent successfully! Check your phone.");
        // DEV ONLY: Show OTP in toast for testing
        if (data.otp) {
          toast.info(`Dev Mode - Your OTP: ${data.otp}`);
        }
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be 6 digits");
      return;
    }

    setIsLoading(true);
    isLoggingIn.current = true;
    
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user role matches selected user type
        if (data.user.role !== userType) {
          toast.error(`This account is registered as a ${data.user.role}. Please select the correct login type.`);
          isLoggingIn.current = false;
          setIsLoading(false);
          return;
        }

        // Store token
        localStorage.setItem("bearer_token", data.token);
        
        toast.success("Login successful!");
        
        // Redirect immediately without waiting
        if (userType === "owner") {
          router.push("/dashboard");
        } else {
          router.push(redirect);
        }
      } else {
        isLoggingIn.current = false;
        
        // Handle specific error codes
        if (data.code === 'NAME_REQUIRED') {
          setShowSignupPrompt(true);
          toast.error("Account not found. Please sign up first.");
        } else {
          toast.error(data.error || "Invalid OTP");
        }
      }
    } catch (error) {
      isLoggingIn.current = false;
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    isLoggingIn.current = true;
    
    try {
      const response = await fetch("/api/auth/login-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user role matches selected user type
        if (data.user.role !== userType) {
          toast.error(`This account is registered as a ${data.user.role}. Please select the correct login type.`);
          isLoggingIn.current = false;
          setIsLoading(false);
          return;
        }

        // Store token
        localStorage.setItem("bearer_token", data.token);
        
        toast.success("Login successful!");
        
        // Redirect immediately without waiting
        if (userType === "owner") {
          router.push("/dashboard");
        } else {
          router.push(redirect);
        }
      } else {
        isLoggingIn.current = false;
        
        // Handle specific error codes
        if (data.code === 'INVALID_CREDENTIALS' || data.code === 'NO_PASSWORD') {
          setShowSignupPrompt(true);
          if (data.code === 'NO_PASSWORD') {
            toast.error("This account uses OTP login. Please use OTP method or sign up with email/password.");
          } else {
            toast.error("Invalid credentials. If you don't have an account, please sign up first.");
          }
        } else {
          toast.error(data.error || "Login failed");
        }
      }
    } catch (error) {
      isLoggingIn.current = false;
      toast.error("Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp("");
    handleSendOTP();
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="text-2xl font-bold">
              SalonHub
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Login using your preferred method
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSignupPrompt && (
            <Alert className="mb-4 border-orange-500 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Account not found!</strong> If you don't have an account, please{" "}
                <Link href="/register" className="underline font-semibold hover:text-orange-900">
                  sign up first
                </Link>{" "}
                before logging in.
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={userType} onValueChange={(v) => setUserType(v as "customer" | "owner")} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer" className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Customer
              </TabsTrigger>
              <TabsTrigger value="owner" className="flex items-center gap-2">
                <Store className="h-4 w-4" />
                Salon Owner
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "otp" | "email")} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="otp" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                OTP Login
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Login
              </TabsTrigger>
            </TabsList>

            <TabsContent value="otp" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+919876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpSent || isLoading}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter phone number in international format (e.g., +91 for India)
                </p>
              </div>

              {otpSent && (
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      disabled={isLoading}
                      className="pl-10"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the 6-digit code sent to your phone
                  </p>
                </div>
              )}

              {!otpSent ? (
                <Button onClick={handleSendOTP} disabled={isLoading} className="w-full">
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button onClick={handleVerifyOTP} disabled={isLoading} className="w-full">
                    {isLoading ? "Verifying..." : "Verify & Login"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || isLoading}
                    className="w-full"
                  >
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                    autoComplete="off"
                  />
                </div>
              </div>

              <Button onClick={handleEmailLogin} disabled={isLoading} className="w-full">
                {isLoading ? "Logging in..." : "Login with Email"}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link href="/register" className="text-primary hover:underline font-semibold">
              Register here
            </Link>
          </div>

          {userType === "owner" && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md border border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Demo Owner Credentials:</strong><br />
                Phone: +919876543210 (Michael Rodriguez)<br />
                Email: michael.rodriguez@salonowner.com
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}