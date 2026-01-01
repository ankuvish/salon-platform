"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useSession } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, User, X, CheckCircle, Edit, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Booking {
  id: number;
  salonId: number;
  serviceId: number;
  staffId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  createdAt: string;
}

export default function MyBookingsPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Don't do anything while session is loading
    if (sessionLoading) {
      return;
    }

    // Session loaded - now check authentication
    if (!session?.user) {
      // Check if token exists in localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
      
      if (!token) {
        // No token at all - definitely not logged in, redirect immediately
        router.push("/login?redirect=/my-bookings");
        return;
      }
      
      // Token exists but session is null - redirect to login
      router.push("/login?redirect=/my-bookings");
      return;
    }

    // User is authenticated - fetch bookings
    fetchBookings();
  }, [session, sessionLoading, hasCheckedAuth, router]);

  const fetchBookings = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      const response = await apiRequest(`/api/bookings?customer_id=${session.user.id}&limit=100`);
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data.map((b: any) => ({ ...b, id: b._id || b.id })));
      } else {
        toast.error("Failed to load bookings");
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      setCancellingId(bookingId);
      const response = await apiRequest(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Booking cancelled successfully");
        fetchBookings();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error("Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Booking deleted successfully");
        fetchBookings();
      } else {
        toast.error("Failed to delete booking");
      }
    } catch (error) {
      console.error("Failed to delete booking:", error);
      toast.error("Failed to delete booking");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "completed":
        return <Badge variant="outline">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const groupBookings = (bookingsList: Booking[]) => {
    const groups: { [key: string]: Booking[] } = {};
    bookingsList.forEach((booking) => {
      const key = `${booking.salonId}-${booking.bookingDate}-${booking.startTime}-${booking.staffId}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(booking);
    });
    return Object.values(groups);
  };

  const filterBookings = (status: string) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    switch (status) {
      case "upcoming":
        return groupBookings(bookings.filter(
          (b) =>
            (b.status === "confirmed" || b.status === "pending") &&
            b.bookingDate >= today
        ));
      case "past":
        return groupBookings(bookings.filter(
          (b) =>
            b.status === "completed" ||
            (b.bookingDate < today && b.status !== "cancelled")
        ));
      case "cancelled":
        return groupBookings(bookings.filter((b) => b.status === "cancelled"));
      default:
        return groupBookings(bookings);
    }
  };

  const BookingCard = ({ bookings: bookingGroup }: { bookings: Booking[] }) => {
    const booking = bookingGroup[0];
    const [salonName, setSalonName] = useState("Loading...");
    const [salonCity, setSalonCity] = useState("");
    const [serviceNames, setServiceNames] = useState<string[]>(["Loading..."]);
    const [staffName, setStaffName] = useState("Loading...");
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [rescheduleData, setRescheduleData] = useState({
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
    });
    const [isRescheduling, setIsRescheduling] = useState(false);

    useEffect(() => {
      const fetchDetails = async () => {
        try {
          const salonId = booking.salonId?._id || booking.salonId?.id || booking.salonId;
          
          const [salonRes, serviceRes, staffRes] = await Promise.all([
            apiRequest(`/api/salons/${salonId}`),
            apiRequest(`/api/services?salon_id=${salonId}`),
            apiRequest(`/api/staff?salon_id=${salonId}`),
          ]);

          if (salonRes.ok) {
            const salon = await salonRes.json();
            setSalonName(salon.name || "Unknown Salon");
            setSalonCity(salon.city || "");
          } else {
            console.error("Salon fetch failed:", await salonRes.text());
            setSalonName("Error loading salon");
          }

          if (serviceRes.ok) {
            const services = await serviceRes.json();
            const names = bookingGroup.map((b) => {
              const serviceId = b.serviceId?._id || b.serviceId?.id || b.serviceId;
              const service = services.find((s: any) => {
                const sId = s._id || s.id;
                return sId?.toString() === serviceId?.toString();
              });
              return service?.name || "Service not found";
            });
            setServiceNames(names);
          } else {
            setServiceNames(["Error loading services"]);
          }

          if (staffRes.ok) {
            const staffList = await staffRes.json();
            const staffId = booking.staffId?._id || booking.staffId?.id || booking.staffId;
            const staff = staffList.find((s: any) => {
              const sId = s._id || s.id;
              return sId?.toString() === staffId?.toString();
            });
            setStaffName(staff?.name || "Staff not found");
          } else {
            console.error("Staff fetch failed:", await staffRes.text());
            setStaffName("Error loading staff");
          }
        } catch (error) {
          console.error("Failed to fetch booking details:", error, booking);
          setSalonName("Error loading salon");
          setServiceNames(["Error loading services"]);
          setStaffName("Error loading staff");
        }
      };

      fetchDetails();
    }, [bookingGroup]);

    const handleReschedule = async () => {
      try {
        setIsRescheduling(true);
        const salonId = booking.salonId?._id || booking.salonId?.id || booking.salonId;
        const servicesRes = await apiRequest(`/api/services?salon_id=${salonId}`);
        const services = servicesRes.ok ? await servicesRes.json() : [];
        
        for (const b of bookingGroup) {
          const bookingId = b._id || b.id;
          if (!bookingId) {
            console.error("Invalid booking ID:", b);
            toast.error("Invalid booking ID");
            return;
          }
          
          const serviceId = b.serviceId?._id || b.serviceId?.id || b.serviceId;
          const service = services.find((s: any) => 
            (s._id || s.id)?.toString() === serviceId?.toString()
          );
          const duration = service?.durationMinutes || 60;
          const [hours, minutes] = rescheduleData.startTime.split(':').map(Number);
          const endMinutes = hours * 60 + minutes + duration;
          const endHours = Math.floor(endMinutes / 60);
          const endMins = endMinutes % 60;
          const endTime = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
          
          const response = await apiRequest(`/api/bookings/${bookingId}`, {
            method: "PUT",
            body: JSON.stringify({
              bookingDate: rescheduleData.bookingDate,
              startTime: rescheduleData.startTime,
              endTime: endTime,
            }),
          });
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Reschedule failed:", errorText);
            toast.error("Failed to reschedule booking");
            return;
          }
        }
        toast.success("Booking rescheduled successfully");
        setIsRescheduleOpen(false);
        fetchBookings();
      } catch (error) {
        console.error("Failed to reschedule booking:", error);
        toast.error("Failed to reschedule booking");
      } finally {
        setIsRescheduling(false);
      }
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const bookingDateObj = new Date(booking.bookingDate);
    bookingDateObj.setHours(0, 0, 0, 0);
    const isPast = bookingDateObj < today;
    const canCancel = booking.status === "pending" || booking.status === "confirmed";
    const canReschedule = canCancel && !isPast;
    const canDelete = booking.status === "cancelled" || booking.status === "completed" || isPast;

    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">{salonName}</CardTitle>
              {salonCity && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3" />
                  <span>{salonCity}</span>
                </div>
              )}
              {serviceNames.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  {serviceNames.map((name, idx) => (
                    <div key={idx}>• {name}</div>
                  ))}
                </div>
              )}
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{booking.startTime} - {booking.endTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{staffName}</span>
          </div>
          {booking.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>Notes:</strong> {booking.notes}
              </p>
            </div>
          )}
          {((canReschedule || canCancel) && !isPast) || canDelete ? (
            <div className="pt-2 border-t flex gap-2">
              {canReschedule && (
                <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Reschedule
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Reschedule Booking</DialogTitle>
                      <DialogDescription>
                        Select a new date and time for your appointment. Changes must be made at least 24 hours in advance.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">New Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={rescheduleData.bookingDate}
                          onChange={(e) =>
                            setRescheduleData({ ...rescheduleData, bookingDate: e.target.value })
                          }
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">New Time</Label>
                        <Input
                          id="time"
                          type="time"
                          value={rescheduleData.startTime}
                          onChange={(e) =>
                            setRescheduleData({ ...rescheduleData, startTime: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRescheduleOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleReschedule} disabled={isRescheduling}>
                        {isRescheduling ? "Rescheduling..." : "Confirm Reschedule"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      disabled={cancellingId === booking.id}
                    >
                      <X className="h-4 w-4 mr-2" />
                      {cancellingId === booking.id ? "Cancelling..." : "Cancel"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel this booking? This will cancel all services in this appointment. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          for (const b of bookingGroup) {
                            await handleCancelBooking(b.id);
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Cancel Booking
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this booking? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={async () => {
                          for (const b of bookingGroup) {
                            const bookingId = b._id || b.id;
                            if (bookingId) await handleDeleteBooking(bookingId);
                          }
                        }}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const upcomingBookings = filterBookings("upcoming");
  const pastBookings = filterBookings("past");
  const cancelledBookings = filterBookings("cancelled");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            Manage your salon appointments
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Bookings</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any upcoming appointments
                  </p>
                  <Button onClick={() => router.push("/")}>
                    Browse Salons
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingBookings.map((group, idx) => (
                  <BookingCard key={idx} bookings={group} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Past Bookings</h3>
                  <p className="text-muted-foreground">
                    Your completed appointments will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastBookings.map((group, idx) => (
                  <BookingCard key={idx} bookings={group} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <X className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Cancelled Bookings</h3>
                  <p className="text-muted-foreground">
                    You haven't cancelled any appointments
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cancelledBookings.map((group, idx) => (
                  <BookingCard key={idx} bookings={group} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}