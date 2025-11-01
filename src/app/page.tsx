"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import SalonCard from "@/components/SalonCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Sparkles, Users, Globe, Award, TrendingUp, Quote } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Footer } from "@/components/Footer";
import { apiRequest } from "@/lib/api-config";

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
  salonType?: string;
  isFeatured?: boolean;
}

export default function Home() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [minRating, setMinRating] = useState("0");
  const [salonType, setSalonType] = useState("all");

  const cities = ["all", "New York", "Los Angeles", "Chicago", "Miami", "Seattle"];

  const hasActiveFilters = searchQuery || selectedCity !== "all" || minRating !== "0" || salonType !== "all";

  useEffect(() => {
    fetchSalons();
  }, []);

  useEffect(() => {
    if (hasActiveFilters) {
      filterSalons();
    } else {
      setFilteredSalons(salons);
    }
  }, [searchQuery, selectedCity, minRating, salonType, salons, hasActiveFilters]);

  const fetchSalons = async () => {
    try {
      setIsLoading(true);
      
      // Fetch featured salons if no filters are active
      const endpoint = "/api/salons?featured=true&limit=50";
      const response = await apiRequest(endpoint);
      const data = await response.json();
      
      // If no featured salons, fetch all salons
      if (data.length === 0) {
        const allResponse = await apiRequest("/api/salons?limit=50");
        const allData = await allResponse.json();
        setSalons(allData);
        setFilteredSalons(allData);
      } else {
        setSalons(data);
        setFilteredSalons(data);
      }
    } catch (error) {
      console.error("Failed to fetch salons:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterSalons = () => {
    let filtered = [...salons];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((salon) =>
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // City filter
    if (selectedCity !== "all") {
      filtered = filtered.filter((salon) => salon.city === selectedCity);
    }

    // Rating filter
    const rating = parseFloat(minRating);
    if (rating > 0) {
      filtered = filtered.filter((salon) => salon.rating >= rating);
    }

    // Salon type filter
    if (salonType !== "all") {
      filtered = filtered.filter((salon) => salon.salonType === salonType);
    }

    setFilteredSalons(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Perfect Salon
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Book appointments instantly at top-rated salons near you. No more waiting in queues.
          </p>
          
          {/* Search Bar */}
          <div className="bg-background rounded-lg shadow-lg p-4 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search salons, services..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="md:w-[180px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.filter(c => c !== "all").map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={salonType} onValueChange={setSalonType}>
                <SelectTrigger className="md:w-[180px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="men">Men's Salon</SelectItem>
                  <SelectItem value="women">Women's Salon</SelectItem>
                  <SelectItem value="unisex">Unisex Salon</SelectItem>
                </SelectContent>
              </Select>
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger className="md:w-[160px]">
                  <Star className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="4.0">4.0+ Stars</SelectItem>
                  <SelectItem value="3.5">3.5+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-primary/5 border-y">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">150+</div>
              <p className="text-sm text-muted-foreground">Cities Worldwide</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">50K+</div>
              <p className="text-sm text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">2,500+</div>
              <p className="text-sm text-muted-foreground">Partner Salons</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-1">98%</div>
              <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Salons Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {hasActiveFilters
                  ? `${filteredSalons.length} Salons Found`
                  : "Featured Salons"}
              </h2>
              <p className="text-muted-foreground">
                {hasActiveFilters 
                  ? "Results matching your search criteria"
                  : "Discover top-rated salons with real-time availability"}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/ai-recommendations">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Recommendations
              </Link>
            </Button>
          </div>

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
          ) : filteredSalons.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No salons found matching your criteria. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSalons.map((salon) => (
                <SalonCard key={salon.id} salon={salon} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied customers across the globe who have transformed their salon booking experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                <p className="text-sm text-muted-foreground mb-6">
                  "SalonBook has completely changed how I manage my appointments. No more waiting in long queues! I can book my favorite stylist in seconds and get reminders before my appointment."
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>SA</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Sarah Anderson</p>
                    <p className="text-xs text-muted-foreground">New York, USA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                <p className="text-sm text-muted-foreground mb-6">
                  "As a salon owner, this platform has streamlined my entire booking process. I can manage my staff schedules, accept bookings, and track revenue all in one place. Highly recommended!"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">Maria Rodriguez</p>
                    <p className="text-xs text-muted-foreground">Los Angeles, USA</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                <p className="text-sm text-muted-foreground mb-6">
                  "The AI recommendations feature is incredible! It suggested a salon near my office that I never knew about, and it's now my go-to place. The booking process is smooth and hassle-free."
                </p>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>JP</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">James Patel</p>
                    <p className="text-xs text-muted-foreground">Chicago, USA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regional Distribution */}
          <div className="bg-background rounded-lg p-8 border">
            <h3 className="text-xl font-bold text-center mb-8">Available Across Major Cities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
              <div className="p-4 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-sm">New York</p>
                <p className="text-xs text-muted-foreground">450+ Salons</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-sm">Los Angeles</p>
                <p className="text-xs text-muted-foreground">380+ Salons</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-sm">Chicago</p>
                <p className="text-xs text-muted-foreground">290+ Salons</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-sm">Miami</p>
                <p className="text-xs text-muted-foreground">220+ Salons</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-sm">Seattle</p>
                <p className="text-xs text-muted-foreground">180+ Salons</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <MapPin className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="font-semibold text-sm">+145 More</p>
                <p className="text-xs text-muted-foreground">Cities</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose SalonBook?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Discovery</h3>
              <p className="text-muted-foreground">
                Find and compare salons by location, services, and ratings
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Availability</h3>
              <p className="text-muted-foreground">
                Book instantly with live slot availability and staff schedules
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
              <p className="text-muted-foreground">
                Get personalized salon and service suggestions powered by AI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}