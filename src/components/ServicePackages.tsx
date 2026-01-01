"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Users, Sparkles, Clock, DollarSign, Check } from "lucide-react";

interface ServicePackage {
  id: string;
  name: string;
  type: "home" | "event" | "salon";
  description: string;
  services: string[];
  duration: number;
  price: number;
  discount?: number;
  minPeople?: number;
  maxPeople?: number;
  travelCharge?: number;
  availableFor: string[];
}

interface ServicePackagesProps {
  packages: ServicePackage[];
  onSelectPackage: (packageId: string, type: "home" | "event" | "salon") => void;
}

export default function ServicePackages({ packages, onSelectPackage }: ServicePackagesProps) {
  const homePackages = packages.filter(p => p.type === "home");
  const eventPackages = packages.filter(p => p.type === "event");
  const salonPackages = packages.filter(p => p.type === "salon");

  const PackageCard = ({ pkg }: { pkg: ServicePackage }) => (
    <Card className="hover:border-primary/50 transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {pkg.type === "home" && <Home className="h-5 w-5 text-blue-500" />}
              {pkg.type === "event" && <Users className="h-5 w-5 text-purple-500" />}
              {pkg.type === "salon" && <Sparkles className="h-5 w-5 text-pink-500" />}
              <CardTitle className="text-lg">{pkg.name}</CardTitle>
            </div>
            <Badge variant={pkg.type === "home" ? "default" : pkg.type === "event" ? "secondary" : "outline"}>
              {pkg.type === "home" ? "Home Service" : pkg.type === "event" ? "Event Package" : "In-Salon"}
            </Badge>
          </div>
          {pkg.discount && (
            <Badge className="bg-green-500 text-white">
              Save {pkg.discount}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{pkg.description}</p>
        
        <div className="space-y-2">
          <p className="text-sm font-semibold">Includes:</p>
          <ul className="space-y-1">
            {pkg.services.map((service, idx) => (
              <li key={idx} className="text-sm flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{pkg.duration} min</span>
          </div>
          {pkg.minPeople && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{pkg.minPeople}-{pkg.maxPeople} people</span>
            </div>
          )}
        </div>

        {pkg.travelCharge && (
          <p className="text-xs text-muted-foreground">
            + ₹{pkg.travelCharge} travel charge
          </p>
        )}

        <div className="pt-3 border-t">
          <div className="flex items-center justify-between mb-3">
            <div>
              {pkg.discount && (
                <span className="text-sm text-muted-foreground line-through mr-2">
                  ₹{(pkg.price / (1 - pkg.discount / 100)).toFixed(0)}
                </span>
              )}
              <span className="text-2xl font-bold text-primary">
                ₹{pkg.price}
              </span>
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={() => onSelectPackage(pkg.id, pkg.type)}
          >
            {pkg.type === "home" ? "Book Home Service" : pkg.type === "event" ? "Book Event" : "Book at Salon"}
          </Button>
        </div>

        {pkg.availableFor.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Available for: {pkg.availableFor.join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Home Service Packages */}
      {homePackages.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Home className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-2xl font-bold">Home Service Packages</h2>
              <p className="text-sm text-muted-foreground">Professional services at your doorstep</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {homePackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      )}

      {/* Event Packages */}
      {eventPackages.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-6 w-6 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold">Event Packages</h2>
              <p className="text-sm text-muted-foreground">Perfect for weddings, parties & special occasions</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventPackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      )}

      {/* Salon Packages */}
      {salonPackages.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-6 w-6 text-pink-500" />
            <div>
              <h2 className="text-2xl font-bold">In-Salon Packages</h2>
              <p className="text-sm text-muted-foreground">Combo deals for salon visits</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salonPackages.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
