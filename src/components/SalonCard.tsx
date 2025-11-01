"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Scissors, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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

interface SalonCardProps {
  salon: {
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
    services?: Service[];
    staff?: Staff[];
  };
}

export default function SalonCard({ salon }: SalonCardProps) {
  const displayedServices = salon.services?.slice(0, 3) || [];
  const displayedStaff = salon.staff?.slice(0, 3) || [];
  const hasMoreServices = (salon.services?.length || 0) > 3;
  const hasMoreStaff = (salon.staff?.length || 0) > 3;

  // Render star rating with proper fill colors
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Star key={i} className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />
        );
      } else {
        stars.push(
          <Star key={i} className="h-3 w-3 text-gray-300" />
        );
      }
    }
    return stars;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full bg-muted">
        {salon.imageUrl ? (
          <Image
            src={salon.imageUrl}
            alt={salon.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <span className="text-4xl">💇</span>
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            {renderStars(salon.rating)}
            <span className="ml-1 text-xs font-semibold">{salon.rating.toFixed(1)}</span>
          </div>
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{salon.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {salon.description}
        </p>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="line-clamp-1">{salon.address}, {salon.city}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{salon.openingTime} - {salon.closingTime}</span>
          </div>
        </div>

        {/* Services Section */}
        {displayedServices.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1 text-xs font-medium mb-2">
              <Scissors className="h-3 w-3" />
              <span>Services</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {displayedServices.map((service) => (
                <Badge key={service.id} variant="secondary" className="text-xs">
                  {service.name} - ${service.price}
                </Badge>
              ))}
              {hasMoreServices && (
                <Badge variant="outline" className="text-xs">
                  +{(salon.services?.length || 0) - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Staff Section */}
        {displayedStaff.length > 0 && (
          <div>
            <div className="flex items-center gap-1 text-xs font-medium mb-2">
              <Users className="h-3 w-3" />
              <span>Staff</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {displayedStaff.map((staffMember) => (
                <Badge key={staffMember.id} variant="secondary" className="text-xs">
                  {staffMember.name}
                </Badge>
              ))}
              {hasMoreStaff && (
                <Badge variant="outline" className="text-xs">
                  +{(salon.staff?.length || 0) - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full">
          <Link href={`/salons/${salon.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}