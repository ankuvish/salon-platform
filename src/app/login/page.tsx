"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Lock, UserCircle, Store, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending, refetch } = useSession();
  const redirect = searchParams.get("redirect") || "/";
  const hasCheckedSession = useRef(false);
  const isLoggingIn = useRef(false);
  
  const [userType] = useState<"customer" | "owner">("customer");
  const [loginMethod, setLoginMethod] = useState<"otp" | "email">("otp");
  
  // OTP fields
  const [countryCode, setCountryCode] = useState("+91");
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

    const fullPhone = `${countryCode}${phone}`;

    // Validate phone format
    if (!/^\+[1-9]\d{1,14}$/.test(fullPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setCountdown(30);
        toast.success("OTP sent successfully! Check your phone.");
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
      const response = await fetch("http://localhost:4000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `${countryCode}${phone}`, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("bearer_token", data.token);
        document.cookie = `bearer_token=${data.token}; path=/; max-age=${30 * 24 * 60 * 60};`;
        
        toast.success("Login successful!");
        
        if (data.user.role === "admin") {
          router.push("/admin");
        } else if (data.user.role === "moderator") {
          router.push("/moderator");
        } else if (data.user.role === "owner") {
          router.push("/dashboard");
        } else {
          router.push(redirect);
        }
      } else {
        isLoggingIn.current = false;
        toast.error(data.error || "Invalid OTP");
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
      const response = await fetch("http://localhost:4000/api/auth/login-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("bearer_token", data.token);
        document.cookie = `bearer_token=${data.token}; path=/; max-age=${30 * 24 * 60 * 60};`;
        
        toast.success("Login successful!");
        
        if (data.user.role === "admin") {
          router.push("/admin");
        } else if (data.user.role === "moderator") {
          router.push("/moderator");
        } else if (data.user.role === "owner") {
          router.push("/dashboard");
        } else {
          router.push(redirect);
        }
      } else {
        isLoggingIn.current = false;
        
        if (data.code === 'USER_NOT_FOUND') {
          setShowSignupPrompt(true);
        }
        if (data.code === 'NO_PASSWORD') {
          toast.error("This account uses OTP login. Please use OTP method.");
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
          <CardTitle className="text-3xl text-center font-bold">Welcome to SalonBook</CardTitle>
          <CardDescription className="text-center">
            Login using your preferred method
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSignupPrompt && (
            <Alert className="mb-4 border-orange-500 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Account not found!</strong> Salon owners{" "}
                <Link href="/register" className="underline font-semibold hover:text-orange-900">
                  register here
                </Link>.
                Customers: Use OTP to auto-register.
              </AlertDescription>
            </Alert>
          )}



          <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "otp" | "email")} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 mx-auto max-w-md">
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
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode} disabled={otpSent || isLoading}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+1">🇺🇸 +1</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91</SelectItem>
                      <SelectItem value="+86">🇨🇳 +86</SelectItem>
                      <SelectItem value="+81">🇯🇵 +81</SelectItem>
                      <SelectItem value="+49">🇩🇪 +49</SelectItem>
                      <SelectItem value="+33">🇫🇷 +33</SelectItem>
                      <SelectItem value="+61">🇦🇺 +61</SelectItem>
                      <SelectItem value="+971">🇦🇪 +971</SelectItem>
                      <SelectItem value="+966">🇸🇦 +966</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="XXXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      disabled={otpSent || isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select country code and enter your phone number
                </p>
              </div>

              {otpSent && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">OTP sent to {countryCode}{phone}</p>
                    <Button variant="link" size="sm" onClick={() => { setOtpSent(false); setOtp(""); setCountdown(0); }} className="h-auto p-0">
                      Change Number
                    </Button>
                  </div>
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
                </>
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

              <div className="text-center">
                <Button variant="link" size="sm" onClick={() => router.push("/reset-password")} className="text-xs">
                  Forgot Password?
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm mt-4">
            <span className="text-muted-foreground">Salon owner? </span>
            <Link href="/register" className="text-primary hover:underline font-semibold">
              Register your salon
            </Link>
          </div>
          
          <div className="text-center text-xs text-muted-foreground mt-2">
            Customers: Use OTP login to create account automatically
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}