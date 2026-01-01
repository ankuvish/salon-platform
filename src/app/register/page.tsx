"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { SalonOwnerRegistrationForm, SalonOwnerFormData } from "@/components/SalonOwnerRegistrationForm";
import Navigation from "@/components/Navigation";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  
  const userType = "owner";
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Salon owner form data
  const [salonOwnerData, setSalonOwnerData] = useState<SalonOwnerFormData | null>(null);



  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/");
    }
  }, [session, isPending, router]);



  const handleSalonOwnerFormSubmit = (data: SalonOwnerFormData) => {
    setSalonOwnerData(data);
    setPassword(data.password);
    handleRegisterWithPassword(data);
  };



  const handleRegisterWithPassword = async (salonData: SalonOwnerFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: salonData.ownerName,
          email: salonData.email,
          password: salonData.password,
          phone: salonData.phone,
          role: "owner"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("bearer_token", data.token);
        document.cookie = `bearer_token=${data.token}; path=/; max-age=${30 * 24 * 60 * 60};`;
        await createSalonProfile(data.user.id);
      } else {
        toast.error(data.error || "Registration failed");
      }
    } catch (error) {
      toast.error("Failed to register. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };



  const createSalonProfile = async (userId: string) => {
    if (!salonOwnerData) return;

    try {
      // Convert first image to base64
      let imageUrl = "";
      if (salonOwnerData.shopImages.length > 0) {
        const reader = new FileReader();
        imageUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(salonOwnerData.shopImages[0]);
        });
      }

      // Create salon
      const salonResponse = await fetch("http://localhost:4000/api/salons", {
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
          imageUrl: imageUrl,
          numberOfSeats: parseInt(salonOwnerData.numberOfSeats) || 1,
        }),
      });

      if (!salonResponse.ok) {
        throw new Error("Failed to create salon");
      }

      const salon = await salonResponse.json();
      const salonId = salon._id || salon.id;

      // Create services and staff
      for (const service of salonOwnerData.services) {
        // First, create or get staff
        const staffResponse = await fetch("http://localhost:4000/api/staff", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("bearer_token")}`
          },
          body: JSON.stringify({
            salonId: salonId,
            name: service.staffName,
            specialization: service.name,
          }),
        });

        if (!staffResponse.ok) continue;
        
        const staff = await staffResponse.json();

        // Then create service
        await fetch("http://localhost:4000/api/services", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("bearer_token")}`
          },
          body: JSON.stringify({
            salonId: salonId,
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



  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-amber-100 dark:from-purple-950 dark:via-pink-950 dark:to-amber-950 p-4 pt-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-400/20 to-amber-400/20 pointer-events-none" />
      <Card className="w-full max-w-4xl relative z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-800 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl text-center bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent font-bold">Welcome to SalonBook</CardTitle>
          <CardDescription className="text-center text-gray-600 dark:text-gray-400">
            Register your salon with complete details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="text-center p-6 bg-gradient-to-br from-purple-100 via-pink-100 to-amber-100 dark:from-purple-900/50 dark:via-pink-900/50 dark:to-amber-900/50 rounded-lg border-2 border-purple-200 dark:border-purple-700">
              <Store className="h-10 w-10 mx-auto mb-3 text-purple-600 dark:text-purple-400" />
              <h3 className="font-bold text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">Salon Owner Registration</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete your salon details to get started</p>
            </div>

            <div className="mt-6">
              <div className="space-y-6">
                <SalonOwnerRegistrationForm 
                  onSubmit={handleSalonOwnerFormSubmit}
                  isLoading={isLoading}
                  initialPhone=""
                />
                
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Already have an account? </span>
                  <Link href="/login" className="text-primary hover:underline">
                    Login here
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}