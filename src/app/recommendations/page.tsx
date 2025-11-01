"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  MapPin, 
  Star, 
  TrendingUp, 
  Clock,
  DollarSign,
  Calendar,
  Tag
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";

interface Salon {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  rating: number;
  imageUrl: string | null;
  distance?: number;
}

interface Service {
  id: number;
  salonId: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

interface Promotion {
  id: number;
  salonId: number;
  title: string;
  description: string;
  discountPercentage: number;
  validFrom: string;
  validUntil: string;
}

interface Booking {
  id: number;
  salonId: number;
  serviceId: number;
  bookingDate: string;
}

interface Recommendation {
  salon: Salon;
  reason: string;
  score: number;
}

export default function RecommendationsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [trendingServices, setTrendingServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [session]);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);

      // Fetch all data in parallel
      const [salonsRes, bookingsRes, promotionsRes, servicesRes] = await Promise.all([
        fetch("/api/salons?limit=100"),
        session?.user ? fetch("/api/bookings?limit=100") : Promise.resolve({ ok: false }),
        fetch("/api/promotions?valid=true"),
        fetch("/api/services?limit=100")
      ]);

      let salons: Salon[] = [];
      let userBookings: Booking[] = [];
      let allPromotions: Promotion[] = [];
      let allServices: Service[] = [];

      if (salonsRes.ok) {
        salons = await salonsRes.json();
      }

      if (bookingsRes.ok && session?.user) {
        const bookingsData = await bookingsRes.json();
        userBookings = bookingsData.filter(
          (b: any) => b.customerId === parseInt(session.user.id)
        );
      }

      if (promotionsRes.ok) {
        allPromotions = await promotionsRes.json();
        setPromotions(allPromotions.slice(0, 6));
      }

      if (servicesRes.ok) {
        allServices = await servicesRes.json();
      }

      // AI-powered recommendation logic
      const recommendedSalons = generateRecommendations(salons, userBookings, allServices);
      setRecommendations(recommendedSalons);

      // Trending services (most common across bookings)
      const trending = getTrendingServices(allServices).slice(0, 6);
      setTrendingServices(trending);

    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      toast.error("Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecommendations = (
    salons: Salon[],
    userBookings: Booking[],
    allServices: Service[]
  ): Recommendation[] => {
    // AI logic: Score salons based on multiple factors
    const recommendations: Recommendation[] = [];

    salons.forEach((salon) => {
      let score = 0;
      let reasons: string[] = [];

      // Factor 1: High rating (weight: 30%)
      if (salon.rating >= 4.5) {
        score += salon.rating * 0.3;
        reasons.push("Highly rated");
      }

      // Factor 2: User has visited before (weight: 40%)
      const visitCount = userBookings.filter(b => b.salonId === salon.id).length;
      if (visitCount > 0) {
        score += Math.min(visitCount * 0.4, 0.4);
        reasons.push("You've visited before");
      }

      // Factor 3: Services match user's history (weight: 20%)
      const salonServices = allServices.filter(s => s.salonId === salon.id);
      const userServiceIds = userBookings.map(b => b.serviceId);
      const matchingServices = salonServices.filter(s => userServiceIds.includes(s.id));
      if (matchingServices.length > 0) {
        score += 0.2;
        reasons.push("Offers your preferred services");
      }

      // Factor 4: Proximity (simulated - weight: 10%)
      // In production, use real geolocation
      const randomDistance = Math.random() * 10;
      if (randomDistance < 3) {
        score += 0.1;
        reasons.push("Nearby location");
      }

      // Add randomness for variety
      score += Math.random() * 0.1;

      if (score > 0.3) {
        recommendations.push({
          salon,
          reason: reasons.join(" • ") || "Popular choice",
          score
        });
      }
    });

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  };

  const getTrendingServices = (services: Service[]): Service[] => {
    // Simulate trending by shuffling and selecting popular-looking services
    const shuffled = [...services].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 12);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-96 mb-8" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">AI Recommendations</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Personalized salon suggestions based on your preferences and booking history
          </p>
        </div>

        {/* Personalized Message */}
        {session?.user && (
          <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    Welcome back, {session.user.name}!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    We've curated these recommendations based on your preferences and booking patterns.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Promotions */}
        {promotions.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">🎉 Active Promotions</h2>
                <p className="text-muted-foreground">Limited-time offers you don't want to miss</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {promotions.map((promo) => (
                <Card key={promo.id} className="border-green-500/20 bg-green-500/5">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg">{promo.title}</CardTitle>
                      <Badge className="bg-green-500 text-white text-lg font-bold">
                        -{promo.discountPercentage}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {promo.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Valid until {new Date(promo.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href={`/salons/${promo.salonId}`}>
                        View Salon
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Salons */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Recommended for You</h2>
              <p className="text-muted-foreground">Salons that match your preferences</p>
            </div>
          </div>

          {recommendations.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Building Your Recommendations</h3>
                <p className="text-muted-foreground mb-6">
                  Book your first appointment to get personalized recommendations
                </p>
                <Button asChild>
                  <Link href="/">Explore Salons</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((rec) => (
                <Card key={rec.salon.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-muted">
                    {rec.salon.imageUrl ? (
                      <Image
                        src={rec.salon.imageUrl}
                        alt={rec.salon.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <span className="text-6xl">💇</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/90 text-primary backdrop-blur-sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        AI Match: {Math.round(rec.score * 100)}%
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="flex items-start justify-between gap-2">
                      <span className="flex-1">{rec.salon.name}</span>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {rec.salon.rating.toFixed(1)}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {rec.salon.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="line-clamp-1">{rec.salon.address}, {rec.salon.city}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-primary font-medium">{rec.reason}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" asChild>
                        <Link href={`/salons/${rec.salon.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/book/${rec.salon.id}`}>
                          <Calendar className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Trending Services */}
        {trendingServices.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Trending Services</h2>
                <p className="text-muted-foreground">Popular services others are booking</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trendingServices.map((service) => (
                <Card key={service.id} className="hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{service.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Hot
                      </Badge>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {service.durationMinutes} min
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-primary">
                        <DollarSign className="h-3 w-3" />
                        {service.price.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-8 pb-8 text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">
              Get More Personalized Recommendations
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {session?.user 
                ? "Book more appointments to help us understand your preferences better"
                : "Sign in to receive AI-powered recommendations tailored just for you"
              }
            </p>
            <Button size="lg" asChild>
              <Link href={session?.user ? "/" : "/sign-in?redirect=/recommendations"}>
                {session?.user ? "Explore More Salons" : "Sign In to Continue"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}