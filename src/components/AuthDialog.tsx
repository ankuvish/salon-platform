"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Mail, Lock, UserCircle, Store } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-config";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup";
}

export default function AuthDialog({ open, onOpenChange, defaultTab = "login" }: AuthDialogProps) {
  const [tab, setTab] = useState(defaultTab);

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
    }
  }, [open, defaultTab]);
  const [userType, setUserType] = useState<"customer" | "owner">("customer");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState<"otp" | "email">("otp");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error("Enter phone number");
      return;
    }
    const fullPhone = `${countryCode}${phone}`;
    if (!/^\+[1-9]\d{1,14}$/.test(fullPhone)) {
      toast.error("Enter valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("/api/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setCountdown(30);
        toast.success("OTP sent!");
        if (data.otp) toast.info(`Dev OTP: ${data.otp}`);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error('OTP Error:', error);
      toast.error("Failed to send OTP. Check if backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!phone) {
      toast.error("Enter phone number");
      return;
    }
    const fullPhone = `${countryCode}${phone}`;
    if (!/^\+[1-9]\d{1,14}$/.test(fullPhone)) {
      toast.error("Enter valid phone number");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ phone: fullPhone }),
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setCountdown(30);
        toast.success("OTP sent!");
        if (data.otp) toast.info(`Dev OTP: ${data.otp}`);
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error('Forgot Password Error:', error);
      toast.error("Failed to send OTP. Check if backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !/^\d{6}$/.test(otp)) {
      toast.error("Enter 6-digit OTP");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ phone: `${countryCode}${phone}`, otp, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Password reset successfully!");
        setShowForgotPassword(false);
        setOtpSent(false);
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error('Reset Password Error:', error);
      toast.error("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!loginEmail || !loginPassword) {
      toast.error("Email and password are required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("/api/auth/login-email", {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("bearer_token", data.token);
        toast.success("Login successful!");
        onOpenChange(false);
        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else if (data.user.role === "moderator") {
          window.location.href = "/moderator";
        } else if (data.user.role === "owner") {
          window.location.href = "/dashboard";
        } else {
          window.location.reload();
        }
      } else {
        if (data.code === 'USER_NOT_FOUND') {
          toast.error("User not found. Please sign up first.");
        } else {
          toast.error(data.error || "Failed to login");
        }
      }
    } catch (error) {
      console.error('Email Login Error:', error);
      toast.error("Failed to login. Check if backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || !/^\d{6}$/.test(otp)) {
      toast.error("Enter 6-digit OTP");
      return;
    }

    if (tab === "signup" && !name) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone: `${countryCode}${phone}`, otp, name, email, gender, role: userType }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("bearer_token", data.token);
        toast.success("Success!");
        onOpenChange(false);
        if (data.user.role === "admin") {
          window.location.href = "/admin";
        } else if (data.user.role === "moderator") {
          window.location.href = "/moderator";
        } else if (data.user.role === "owner") {
          window.location.href = "/dashboard";
        } else {
          window.location.reload();
        }
      } else {
        if (data.code === 'NAME_REQUIRED') {
          toast.error("User not found. Please sign up first.");
        } else {
          toast.error(data.error || "Failed to verify OTP");
        }
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      toast.error("Failed to verify OTP. Check if backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 dark:from-purple-950 dark:via-pink-950 dark:to-amber-950 border-2 border-purple-200 dark:border-purple-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-amber-500/10 rounded-lg pointer-events-none" />
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl text-center bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">Welcome to SalonBook</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="relative z-10">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4">
            {showForgotPassword ? (
              <>
                <div className="text-center mb-4">
                  <h3 className="font-semibold">Reset Password</h3>
                  <p className="text-sm text-muted-foreground">Enter your phone number to receive OTP</p>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode} disabled={otpSent}>
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
                    <Input
                      type="tel"
                      placeholder="XXXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      disabled={otpSent}
                      className="flex-1"
                    />
                  </div>
                </div>

                {otpSent && (
                  <>
                    <div className="space-y-2">
                      <Label>OTP</Label>
                      <Input
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>New Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <Input
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {!otpSent ? (
                  <Button onClick={handleForgotPassword} disabled={isLoading} className="w-full">
                    Send OTP
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button onClick={handleResetPassword} disabled={isLoading} className="w-full">
                      Reset Password
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleForgotPassword}
                      disabled={countdown > 0 || isLoading}
                      className="w-full"
                    >
                      {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
                    </Button>
                  </div>
                )}

                <Button variant="link" size="sm" onClick={() => { setShowForgotPassword(false); setOtpSent(false); setOtp(""); }} className="w-full">
                  Back to Login
                </Button>
              </>
            ) : (
              <>
                <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as any)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="otp"><Phone className="h-4 w-4 mr-2" />OTP</TabsTrigger>
                    <TabsTrigger value="email"><Mail className="h-4 w-4 mr-2" />Email</TabsTrigger>
                  </TabsList>
                </Tabs>

                {loginMethod === "otp" ? (
                  <>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <div className="flex gap-2">
                        <Select value={countryCode} onValueChange={setCountryCode} disabled={otpSent}>
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
                        <Input
                          type="tel"
                          placeholder="XXXXXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          disabled={otpSent}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {otpSent && (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">OTP sent to {countryCode}{phone}</p>
                          <Button variant="link" size="sm" onClick={() => { setOtpSent(false); setOtp(""); setCountdown(0); }} className="h-auto p-0">
                            Change
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Label>OTP</Label>
                          <Input
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            maxLength={6}
                          />
                        </div>
                      </>
                    )}

                    {!otpSent ? (
                      <Button onClick={handleSendOTP} disabled={isLoading} className="w-full">
                        Send OTP
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Button onClick={handleVerifyOTP} disabled={isLoading} className="w-full">
                          Verify & Login
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleSendOTP}
                          disabled={countdown > 0}
                          className="w-full"
                        >
                          {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>

                    <Button onClick={handleEmailLogin} disabled={isLoading} className="w-full">
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                  </>
                )}

                <Button variant="link" size="sm" onClick={() => setShowForgotPassword(true)} className="w-full">
                  Forgot Password?
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <Tabs value={userType} onValueChange={(v) => setUserType(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customer"><UserCircle className="h-4 w-4 mr-2" />Customer</TabsTrigger>
                <TabsTrigger value="owner"><Store className="h-4 w-4 mr-2" />Owner</TabsTrigger>
              </TabsList>
            </Tabs>

            {userType === "owner" ? (
              <div className="text-center py-8 space-y-4">
                <Store className="h-16 w-16 mx-auto text-primary" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Salon Owner Registration</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Salon owner registration requires additional details including salon information, services, and staff.
                  </p>
                </div>
                <Button onClick={() => { onOpenChange(false); window.location.href = "/register"; }} className="w-full" size="lg">
                  Go to Registration Page
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email (Optional)</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Gender (Optional)</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex gap-2">
                    <Select value={countryCode} onValueChange={setCountryCode} disabled={otpSent}>
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
                    <Input
                      type="tel"
                      placeholder="XXXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      disabled={otpSent}
                      className="flex-1"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-2">
                    <Label>OTP</Label>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                    />
                  </div>
                )}

                {!otpSent ? (
                  <Button onClick={handleSendOTP} disabled={isLoading} className="w-full">
                    Send OTP
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button onClick={handleVerifyOTP} disabled={isLoading} className="w-full">
                      Verify & Sign Up
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSendOTP}
                      disabled={countdown > 0}
                      className="w-full"
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
