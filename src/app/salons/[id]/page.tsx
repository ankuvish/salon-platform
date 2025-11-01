"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { apiRequest } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Phone, Clock, Star, DollarSign, Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";

interface Salon {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  imageUrl: string | null;
  openingTime: string;
  closingTime: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
}

interface Staff {
  id: number;
  name: string;
  specialization: string;
  avatarUrl: string | null;
}

interface Promotion {
  id: number;
  title: string;
  description: string;
  discountPercentage: number;
  validFrom: string;
  validUntil: string;
}

export default function SalonDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const salonId = params.id as string;

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (salonId) {
      fetchSalonDetails();
    }
  }, [salonId]);

  const fetchSalonDetails = async () => {
    try {
      setIsLoading(true);
      
      const [salonRes, servicesRes, staffRes, promotionsRes] = await Promise.all([
        apiRequest(`/api/salons/${salonId}`),
        apiRequest(`/api/services?salon_id=${salonId}&limit=50`),
        apiRequest(`/api/staff?salon_id=${salonId}&limit=50`),
        apiRequest(`/api/promotions?salon_id=${salonId}`)
      ]);

      if (salonRes.ok) {
        const salonData = await salonRes.json();
        setSalon(salonData);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData);
      }

      if (promotionsRes.ok) {
        const promotionsData = await promotionsRes.json();
        setPromotions(promotionsData);
      }
    } catch (error) {
      console.error("Failed to fetch salon details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render star rating with proper fill colors
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-5 w-5 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-5 w-5 text-gray-300" />
        );
      }
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Salon Not Found</h1>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Image */}
      <div className="relative h-64 w-full bg-muted">
        {salon.imageUrl ? (
          <Image
            src={salon.imageUrl}
            alt={salon.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-6xl">💇</span>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Salon Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">{salon.name}</h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(salon.rating)}
                  <span className="ml-2 text-lg font-semibold">{salon.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <Button size="lg" asChild>
              <Link href={`/book/${salon.id}`}>
                <Calendar className="h-5 w-5 mr-2" />
                Book Appointment
              </Link>
            </Button>
          </div>
          
          <p className="text-lg text-muted-foreground mb-4">{salon.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span>{salon.address}, {salon.city}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Phone className="h-5 w-5 flex-shrink-0" />
              <span>{salon.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5 flex-shrink-0" />
              <span>{salon.openingTime} - {salon.closingTime}</span>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services and Staff */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Promotions */}
            {promotions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🎉 Active Promotions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {promotions.map((promo) => (
                    <div
                      key={promo.id}
                      className="p-4 rounded-lg border bg-primary/5 border-primary/20"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{promo.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {promo.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Valid until: {new Date(promo.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="text-lg font-bold">
                          -{promo.discountPercentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <p className="text-muted-foreground">No services available</p>
                ) : (
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-start justify-between gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {service.durationMinutes} min
                            </span>
                            <span className="font-semibold text-primary">
                              ${service.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/book/${salon.id}?service=${service.id}`}>
                            Book
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Staff */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Our Team
                </CardTitle>
              </CardHeader>
              <CardContent>
                {staff.length === 0 ? (
                  <p className="text-muted-foreground">No staff information available</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staff.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-4 rounded-lg border"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatarUrl || undefined} />
                          <AvatarFallback>
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{member.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {member.specialization}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={`/book/${salon.id}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Now
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`tel:${salon.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Salon
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">{salon.address}</p>
                  <p className="text-sm font-semibold">{salon.city}</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        salon.address + ", " + salon.city
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Open</span>
                  <span className="font-semibold">{salon.openingTime}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Close</span>
                  <span className="font-semibold">{salon.closingTime}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}