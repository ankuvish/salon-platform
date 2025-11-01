"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import SalonCard from "@/components/SalonCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Navigation2, Search, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

interface Service {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
}

interface Staff {
  id: number;
  name: string;
  specialization: string;
  avatarUrl: string | null;
}

interface Salon {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  zipCode: string | null;
  phone: string;
  rating: number;
  imageUrl: string | null;
  openingTime: string;
  closingTime: string;
  latitude: number | null;
  longitude: number | null;
  distance?: number;
  services: Service[];
  staff: Staff[];
}

export default function NearbyPage() {
  const router = useRouter();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState("10");

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        fetchNearbySalons(location.lat, location.lng, parseFloat(radius), searchQuery);
        setIsGettingLocation(false);
        toast.success("Location detected successfully");
      },
      (error) => {
        toast.error("Unable to retrieve your location. Please search manually.");
        setIsGettingLocation(false);
        console.error("Geolocation error:", error);
      }
    );
  };

  const fetchNearbySalons = async (
    lat?: number, 
    lng?: number, 
    radiusKm?: number, 
    query?: string
  ) => {
    try {
      setIsLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      
      if (query && query.trim()) {
        params.append('q', query.trim());
      }
      
      if (lat !== undefined && lng !== undefined) {
        params.append('latitude', lat.toString());
        params.append('longitude', lng.toString());
        params.append('radius', (radiusKm || 10).toString());
      }
      
      const response = await fetch(`/api/salons/search?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setSalons(data);
        if (data.length === 0) {
          toast.info("No salons found. Try adjusting your search.");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to fetch salons");
      }
    } catch (error) {
      console.error("Failed to fetch salons:", error);
      toast.error("Failed to fetch salons");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim() && !userLocation) {
      toast.error("Please enter a search term or use your current location");
      return;
    }

    if (userLocation) {
      fetchNearbySalons(userLocation.lat, userLocation.lng, parseFloat(radius), searchQuery);
    } else {
      fetchNearbySalons(undefined, undefined, undefined, searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Salons Nearby</h1>
          <p className="text-muted-foreground">
            Search by salon name, area, zip code, service, or staff name
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Search Salons
            </CardTitle>
            <CardDescription>
              Find salons near you or search by name, location, services, or staff
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Use Current Location Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex-1"
                  variant={userLocation ? "secondary" : "default"}
                >
                  {isGettingLocation ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Detecting Location...
                    </>
                  ) : userLocation ? (
                    <>
                      <Navigation2 className="h-4 w-4 mr-2" />
                      Location Detected
                    </>
                  ) : (
                    <>
                      <Navigation2 className="h-4 w-4 mr-2" />
                      Use Current Location
                    </>
                  )}
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or search by</span>
                </div>
              </div>

              {/* Unified Search Form */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Query</Label>
                  <Input
                    id="search"
                    type="text"
                    placeholder="Shop name, area, zip code, service, or staff name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Examples: "Elegance Salon", "Mumbai", "400001", "haircut", "Alex"
                  </p>
                </div>

                {userLocation && (
                  <div className="space-y-2">
                    <Label htmlFor="radius">Search Radius (km)</Label>
                    <Input
                      id="radius"
                      type="number"
                      step="1"
                      min="1"
                      max="50"
                      placeholder="10"
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                    />
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Salons
                    </>
                  )}
                </Button>
              </form>

              {userLocation && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Current Location:</p>
                  <p className="text-xs text-muted-foreground">
                    Latitude: {userLocation.lat.toFixed(6)}, Longitude: {userLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Search Radius: {radius} km
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : salons.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {salons.length} Salon{salons.length !== 1 ? "s" : ""} Found
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salons.map((salon) => (
                <div key={salon.id} className="relative">
                  <SalonCard salon={salon} />
                  {salon.distance !== undefined && (
                    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-10">
                      {salon.distance.toFixed(1)} km away
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Find Salons Near You</h3>
              <p className="text-muted-foreground mb-6">
                Use your current location or search by salon name, area, zip code, service, or staff name
              </p>
              <Button onClick={getCurrentLocation}>
                <Navigation2 className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
}