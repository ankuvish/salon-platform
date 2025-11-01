"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Lock, UserCircle, Store, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { SalonOwnerRegistrationForm, SalonOwnerFormData } from "@/components/SalonOwnerRegistrationForm";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  
  const [userType, setUserType] = useState<"customer" | "owner">("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Salon owner form data
  const [salonOwnerData, setSalonOwnerData] = useState<SalonOwnerFormData | null>(null);

  // Pre-fill phone number from URL query parameter
  useEffect(() => {
    const phoneFromUrl = searchParams.get("phone");
    if (phoneFromUrl) {
      setPhone(decodeURIComponent(phoneFromUrl));
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSalonOwnerFormSubmit = (data: SalonOwnerFormData) => {
    setSalonOwnerData(data);
    setPhone(data.phone);
    setEmail(data.email);
    setName(data.ownerName);
    // Automatically send OTP after salon owner fills the form
    handleSendOTP(data.phone, data.ownerName);
  };

  const handleSendOTP = async (phoneNumber?: string, userName?: string) => {
    const phoneToUse = phoneNumber || phone;
    const nameToUse = userName || name;
    
    // Validate required fields
    if (!nameToUse.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!phoneToUse) {
      toast.error("Please enter your phone number");
      return;
    }

    // Validate phone format
    if (!/^\+[1-9]\d{1,14}$/.test(phoneToUse)) {
      toast.error("Please enter phone number in international format (e.g., +919876543210)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneToUse }),
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
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone, 
          otp,
          name: name.trim(),
          email: email.trim() || undefined,
          gender: gender || undefined,
          role: userType
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if it's a new user or existing user
        if (!data.isNewUser && data.user.role !== userType) {
          toast.error(`This phone number is already registered as a ${data.user.role}. Please login instead.`);
          setIsLoading(false);
          return;
        }

        // Store token
        localStorage.setItem("bearer_token", data.token);
        
        // If salon owner, need to create salon with all the data
        if (userType === "owner" && salonOwnerData) {
          await createSalonProfile(data.user.id);
        } else {
          toast.success(data.isNewUser ? "Account created successfully!" : "Welcome back!");
          
          // Redirect based on user type
          if (userType === "owner") {
            router.push("/dashboard");
          } else {
            router.push("/");
          }
        }
      } else {
        toast.error(data.error || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const createSalonProfile = async (userId: string) => {
    if (!salonOwnerData) return;

    try {
      // Create salon
      const salonResponse = await fetch("/api/salons", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("bearer_token")}`
        },
        body: JSON.stringify({
          ownerId: userId,
          name: salonOwnerData.salonName,
          description: salonOwnerData.description,
          address: `${salonOwnerData.address}, ${salonOwnerData.street}`,
          city: salonOwnerData.city,
          zipCode: salonOwnerData.zipCode,
          phone: salonOwnerData.phone,
          salonType: salonOwnerData.salonType,
          openingTime: salonOwnerData.openingTime,
          closingTime: salonOwnerData.closingTime,
          // Note: Image upload would need separate handling with file upload API
        }),
      });

      if (!salonResponse.ok) {
        throw new Error("Failed to create salon");
      }

      const salon = await salonResponse.json();

      // Create services and staff
      for (const service of salonOwnerData.services) {
        // First, create or get staff
        const staffResponse = await fetch("/api/staff", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("bearer_token")}`
          },
          body: JSON.stringify({
            salonId: salon.id,
            name: service.staffName,
            specialization: service.name,
          }),
        });

        if (!staffResponse.ok) continue;
        
        const staff = await staffResponse.json();

        // Then create service
        await fetch("/api/services", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("bearer_token")}`
          },
          body: JSON.stringify({
            salonId: salon.id,
            name: service.name,
            description: `${service.name} service`,
            price: parseFloat(service.price),
            durationMinutes: parseInt(service.durationMinutes),
          }),
        });
      }

      toast.success("Salon profile created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating salon profile:", error);
      toast.error("Account created but failed to set up salon. Please complete setup in dashboard.");
      router.push("/dashboard");
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
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Link href="/" className="text-2xl font-bold">
              SalonHub
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            {userType === "customer" 
              ? "Register with your phone number using OTP" 
              : "Register your salon with complete details"}
          </CardDescription>
        </CardHeader>
        <CardContent>
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

            <TabsContent value="customer" className="mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={otpSent || isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (Optional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={otpSent || isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
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

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender (Optional)</Label>
                  <Select value={gender} onValueChange={setGender} disabled={otpSent || isLoading}>
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {otpSent && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">
                      Enter OTP <span className="text-destructive">*</span>
                    </Label>
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
                  <Button onClick={() => handleSendOTP()} disabled={isLoading} className="w-full">
                    {isLoading ? "Sending..." : "Send OTP"}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Button onClick={handleVerifyOTP} disabled={isLoading} className="w-full">
                      {isLoading ? "Verifying..." : "Verify & Register"}
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

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link href="/login" className="text-primary hover:underline">
                    Login here
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="owner" className="mt-6">
              {!otpSent ? (
                <div className="space-y-6">
                  <SalonOwnerRegistrationForm 
                    onSubmit={handleSalonOwnerFormSubmit}
                    isLoading={isLoading}
                    initialPhone={phone}
                  />
                  
                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link href="/login" className="text-primary hover:underline">
                      Login here
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      Registration Details:
                    </p>
                    <div className="space-y-1 text-sm">
                      <p><strong>Owner:</strong> {name}</p>
                      <p><strong>Salon:</strong> {salonOwnerData?.salonName}</p>
                      <p><strong>Phone:</strong> {phone}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="otp-owner">
                      Enter OTP <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp-owner"
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

                  <div className="space-y-2">
                    <Button onClick={handleVerifyOTP} disabled={isLoading} className="w-full">
                      {isLoading ? "Creating Salon..." : "Verify & Create Salon"}
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
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}