"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Star, Heart, Settings, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Booking {
  _id: string;
  bookingDate: string;
  startTime: string;
  status: string;
  salonId: { name: string; address: string; imageUrl?: string };
  serviceId: { name: string; price: number };
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
    if (session?.user) {
      fetchBookings();
    }
  }, [session, isPending, router]);

  const fetchBookings = async () => {
    try {
      const [bookingsRes, followersRes, followingRes] = await Promise.all([
        fetch(`http://localhost:4000/api/bookings?customerId=${session?.user?.id}`),
        fetch(`http://localhost:4000/api/follows/followers/count?userId=${session?.user?.id}`),
        fetch(`http://localhost:4000/api/follows/following/count?userId=${session?.user?.id}`)
      ]);
      
      const bookingsData = await bookingsRes.json();
      setBookings(bookingsData.slice(0, 5));
      
      if (followersRes.ok) {
        const followersData = await followersRes.json();
        setFollowersCount(followersData.count);
      }
      
      if (followingRes.ok) {
        const followingData = await followingRes.json();
        setFollowingCount(followingData.count);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-48 w-full mb-8" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const completedBookings = bookings.filter(b => b.status === "completed").length;
  const upcomingBookings = bookings.filter(b => b.status === "confirmed" || b.status === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Profile Header */}
        <Card className="border-2 border-purple-200 shadow-xl mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative w-[152px] h-[152px] rounded-full">
                <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '3s', background: 'conic-gradient(from 0deg, #d4af37 0%, #ffffff 5%, #d4af37 15%, #4169e1 40%, #ff1493 65%, #d4af37 100%)' }} />
                <div className="absolute inset-0 rounded-full" style={{ animation: 'glowCycle 3s ease-in-out infinite' }} />
                <style jsx>{`
                  @keyframes glowCycle {
                    0%, 100% { filter: drop-shadow(0 0 20px rgba(184, 134, 11, 1)) drop-shadow(0 0 35px rgba(184, 134, 11, 0.6)); }
                    33% { filter: drop-shadow(0 0 20px rgba(25, 55, 150, 1)) drop-shadow(0 0 35px rgba(25, 55, 150, 0.6)); }
                    66% { filter: drop-shadow(0 0 20px rgba(200, 16, 115, 1)) drop-shadow(0 0 35px rgba(200, 16, 115, 0.6)); }
                  }
                `}</style>
                <div className="absolute inset-[10px] rounded-full bg-background flex items-center justify-center z-10">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-3xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                <p className="text-muted-foreground mb-4">{user.username || user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Link href="/followers">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 cursor-pointer hover:bg-purple-200 transition-colors">
                      <User className="h-3 w-3 mr-1" />
                      {followersCount} Followers
                    </Badge>
                  </Link>
                  <Link href="/followers">
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 cursor-pointer hover:bg-pink-200 transition-colors">
                      <Heart className="h-3 w-3 mr-1" />
                      {followingCount} Following
                    </Badge>
                  </Link>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                    <Star className="h-3 w-3 mr-1" />
                    Member since {new Date(user.createdAt || Date.now()).getFullYear()}
                  </Badge>
                </div>
                <Link href="/settings">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <Card className="border-2 border-pink-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-pink-600" />
                  Recent Bookings
                </span>
                <Link href="/my-bookings">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No bookings yet</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="flex gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <div className="h-12 w-12 rounded bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{booking.serviceId.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{booking.salonId.name}</p>
                        <p className="text-xs text-muted-foreground">{booking.bookingDate} at {booking.startTime}</p>
                      </div>
                      <Badge variant={booking.status === "completed" ? "default" : booking.status === "confirmed" ? "secondary" : "outline"}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-2 border-amber-100 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bookings</p>
                    <p className="text-2xl font-bold text-purple-700">{bookings.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-pink-50 to-pink-100">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-pink-700">{completedBookings}</p>
                  </div>
                  <Star className="h-8 w-8 text-pink-600" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100">
                  <div>
                    <p className="text-sm text-muted-foreground">Upcoming</p>
                    <p className="text-2xl font-bold text-amber-700">{upcomingBookings}</p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
