"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Scissors, Users } from "lucide-react";
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
    _id?: string;
    id?: number;
    name: string;
    description: string;
    address: string;
    city: string;
    phone: string;
    rating: number;
    imageUrl?: string | null;
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
  const salonSlug = salon.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const salonId = salon._id || salon.id;

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 luxury-card hover:scale-[1.02] md:hover:scale-105 hover:border-purple-300 dark:hover:border-purple-700">
      <div className="relative h-48 sm:h-56 w-full bg-muted">
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
        <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-sm font-semibold text-black dark:text-white">
          ⭐ {salon.rating.toFixed(1)}
        </Badge>
      </div>
      <CardContent className="p-4 sm:p-5">
        <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-1">{salon.name}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
          {salon.description}
        </p>
        <div className="space-y-2 text-xs sm:text-sm mb-4">
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
      <CardFooter className="p-4 sm:p-5 pt-0">
        <Button asChild className="w-full luxury-button">
          <Link href={`/salons/${salonSlug}-${salonId}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}