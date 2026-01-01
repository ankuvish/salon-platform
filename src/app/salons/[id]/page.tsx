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
import { MapPin, Phone, Clock, DollarSign, Users, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Link from "next/link";
import StarRating from "@/components/StarRating";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import FollowButton from "@/components/FollowButton";

interface Salon {
  _id?: string;
  id?: number;
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  rating: number;
  imageUrl: string | null;
  openingTime: string;
  closingTime: string;
  ownerId?: string;
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
  const urlParam = params.id as string;
  const salonId = urlParam.includes('-') ? urlParam.split('-').pop() || urlParam : urlParam;
  const { data: session } = useSession();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userComment, setUserComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (salonId) {
      fetchSalonDetails();
    }
  }, [salonId]);

  const fetchSalonDetails = async () => {
    try {
      setIsLoading(true);
      
      // Handle dummy salons
      if (urlParam.includes('dummy-')) {
        const dummySalons = [
          {
            _id: "dummy-9999",
            id: 9999,
            name: "Luxury Hair Studio",
            description: "Premium hair styling and spa services with expert stylists. We offer a wide range of services from haircuts to full spa treatments.",
            address: "123 Fashion Street",
            city: "Mumbai",
            phone: "+91 98765 43210",
            rating: 4.8,
            imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
            openingTime: "09:00",
            closingTime: "21:00",
          },
          {
            _id: "dummy-9998",
            id: 9998,
            name: "Elite Beauty Lounge",
            description: "Modern salon offering cutting-edge beauty treatments with the latest technology and experienced professionals.",
            address: "456 Style Avenue",
            city: "Delhi",
            phone: "+91 98765 43211",
            rating: 4.9,
            imageUrl: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
            openingTime: "10:00",
            closingTime: "20:00",
          },
          {
            _id: "dummy-9997",
            id: 9997,
            name: "Gentleman's Grooming",
            description: "Classic barbershop with modern grooming services. Specializing in men's haircuts, beard styling, and traditional shaves.",
            address: "789 Barber Lane",
            city: "Bangalore",
            phone: "+91 98765 43212",
            rating: 4.7,
            imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
            openingTime: "08:00",
            closingTime: "22:00",
          }
        ];
        
        const dummySalon = dummySalons.find(s => urlParam.includes(s._id));
        if (dummySalon) {
          setSalon(dummySalon);
          setServices([
            { id: 1, name: "Haircut", description: "Professional haircut with styling", durationMinutes: 30, price: 500 },
            { id: 2, name: "Hair Coloring", description: "Full hair coloring service", durationMinutes: 90, price: 2500 },
            { id: 3, name: "Facial", description: "Relaxing facial treatment", durationMinutes: 45, price: 1200 },
            { id: 4, name: "Manicure", description: "Complete nail care", durationMinutes: 30, price: 800 },
          ]);
          setStaff([
            { id: 1, name: "Sarah Johnson", specialization: "Hair Stylist", avatarUrl: null },
            { id: 2, name: "Mike Chen", specialization: "Barber", avatarUrl: null },
            { id: 3, name: "Emma Davis", specialization: "Beautician", avatarUrl: null },
          ]);
        }
        setIsLoading(false);
        return;
      }
      
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

      // Fetch user's existing review
      if (session?.user?.id) {
        const reviewsRes = await apiRequest(`/api/reviews?salonId=${salonId}`);
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
          const userReview = reviewsData.find((r: any) => 
            r.customerId?._id?.toString() === session.user.id?.toString() ||
            r.customerId?.toString() === session.user.id?.toString()
          );
          if (userReview) {
            setUserRating(userReview.rating);
            setUserComment(userReview.comment || "");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch salon details:", error);
    } finally {
      setIsLoading(false);
    }
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
      <div className="relative h-48 sm:h-56 md:h-64 w-full bg-muted">
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
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{salon.name}</h1>
                {salon.ownerId && <FollowButton targetUserId={salon.ownerId} />}
              </div>
              {session?.user?.role === "customer" ? (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    {userRating > 0 ? "Your rating:" : "Rate this salon:"}
                  </p>
                  <StarRating
                    value={userRating}
                    onChange={async (rating) => {
                      try {
                        const response = await apiRequest(`/api/reviews`, {
                          method: "POST",
                          body: JSON.stringify({
                            salonId: salon._id || salon.id,
                            customerId: session.user.id,
                            rating: rating
                          })
                        });
                        if (response.ok) {
                          setUserRating(rating);
                          toast.success("Rating submitted!");
                        } else {
                          const error = await response.json();
                          toast.error(error.details || "Failed to submit rating");
                        }
                      } catch (error: any) {
                        toast.error(error.message || "Failed to submit rating");
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Overall rating:</p>
                  <StarRating value={salon.rating} onChange={() => {}} readonly />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="lg" className="w-full md:w-auto" onClick={() => {
              if (!session?.user) {
                toast.error("Please sign in to book an appointment");
                router.push('/login');
              } else {
                router.push(`/book/${salon._id || salon.id}`);
              }
            }}>
              <Calendar className="h-5 w-5 mr-2" />
              Book Appointment
            </Button>
            </div>
          </div>
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-3 sm:mb-4">{salon.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
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

        <Separator className="my-6 sm:my-8" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Services and Staff */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
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
                      className="p-3 sm:p-4 rounded-lg border bg-primary/5 border-primary/20"
                    >
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
                        <div className="flex-1 w-full">
                          <h3 className="text-sm sm:text-base font-semibold mb-1">{promo.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {promo.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Valid until: {new Date(promo.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="text-base sm:text-lg font-bold">
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
                        className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1 w-full">
                          <h3 className="text-sm sm:text-base font-semibold mb-1">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                            <span className="text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {service.durationMinutes} min
                            </span>
                            <span className="font-semibold text-primary text-sm sm:text-base">
                              ₹{service.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        {!urlParam.includes('dummy-') && (
                          <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                            <Link href={`/book/${salon._id || salon.id}?service=${service.id}`}>
                              Book
                            </Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews Section */}
            {session?.user?.role === "customer" && (
              <Card>
                <CardHeader>
                  <CardTitle>Leave a Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {userRating > 0 ? "Your rating:" : "Rate this salon:"}
                      </p>
                      <StarRating
                        value={userRating}
                        onChange={async (rating) => {
                          setUserRating(rating);
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Review (Optional)</label>
                      <textarea
                        className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                        placeholder="Share your experience..."
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      disabled={userRating === 0 || isSubmittingReview}
                      onClick={async () => {
                        try {
                          setIsSubmittingReview(true);
                          const response = await apiRequest(`/api/reviews`, {
                            method: "POST",
                            body: JSON.stringify({
                              salonId: salon._id || salon.id,
                              customerId: session.user.id,
                              rating: userRating,
                              comment: userComment
                            })
                          });
                          if (response.ok) {
                            toast.success("Review submitted!");
                            fetchSalonDetails();
                          } else {
                            const error = await response.json();
                            toast.error(error.details || "Failed to submit review");
                          }
                        } catch (error: any) {
                          toast.error(error.message || "Failed to submit review");
                        } finally {
                          setIsSubmittingReview(false);
                        }
                      }}
                    >
                      {isSubmittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Customer Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews ({reviews.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review._id || review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{review.customerId?.name || "Anonymous"}</h4>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={i < review.rating ? "text-yellow-500" : "text-gray-300"}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {staff.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 sm:p-4 rounded-lg border"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatarUrl || undefined} />
                          <AvatarFallback>
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold truncate">{member.name}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
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
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" onClick={() => {
                  if (!session?.user) {
                    toast.error("Please sign in to book an appointment");
                    router.push('/login');
                  } else {
                    router.push(`/book/${salon._id || salon.id}`);
                  }
                }}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
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