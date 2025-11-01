"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useSession } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Upload,
  Shield,
  Image as ImageIcon
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

interface Salon {
  id: number;
  name: string;
  rating: number;
  imageUrl?: string | null;
}

interface Booking {
  id: number;
  customerId: number;
  serviceId: number;
  staffId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
}

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
}

export default function DashboardPage() {
  const { data: session, isPending: sessionLoading } = useSession();
  const router = useRouter();
  const hasCheckedAuth = useRef(false);

  const [salon, setSalon] = useState<Salon | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Service dialog state
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    durationMinutes: ""
  });

  // Staff dialog state
  const [isStaffDialogOpen, setIsStaffDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: "",
    specialization: ""
  });

  // Verification dialog state
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    gstNumber: "",
    salonType: "unisex"
  });

  // Banner upload state
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [bannerUrl, setBannerUrl] = useState("");
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  useEffect(() => {
    // Always wait for session to finish loading
    if (sessionLoading) return;

    // If no session after loading completes, redirect to login (only once)
    if (!session?.user) {
      if (!hasCheckedAuth.current) {
        hasCheckedAuth.current = true;
        router.push("/login?redirect=/dashboard");
      }
      return;
    }

    // Reset the flag when we have a session (allows future checks)
    hasCheckedAuth.current = false;

    // Check if user is owner
    if (session.user.role !== "owner") {
      toast.error("Access denied. Salon owners only.");
      router.push("/");
      return;
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, [session, sessionLoading, router]);

  const fetchDashboardData = async () => {
    if (!session?.user) return;

    try {
      setIsLoading(true);
      
      const salonsRes = await apiRequest(`/api/salons?limit=100`);
      const salonsData = await salonsRes.json();
      
      const userSalon = salonsData.find((s: any) => s.ownerId === session.user.id);
      
      if (!userSalon) {
        toast.error("No salon found. Please contact support.");
        return;
      }

      setSalon(userSalon);
      setBannerUrl(userSalon.imageUrl || "");
      setVerificationForm({
        gstNumber: userSalon.gstNumber || "",
        salonType: userSalon.salonType || "unisex"
      });

      const [bookingsRes, servicesRes, staffRes] = await Promise.all([
        apiRequest(`/api/bookings?salon_id=${userSalon.id}&limit=100`),
        apiRequest(`/api/services?salon_id=${userSalon.id}&limit=100`),
        apiRequest(`/api/staff?salon_id=${userSalon.id}&limit=100`)
      ]);

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Service management functions
  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon) return;

    try {
      const method = editingService ? "PUT" : "POST";
      const url = editingService ? `/api/services/${editingService.id}` : "/api/services";
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify({
          salonId: salon.id,
          name: serviceForm.name,
          description: serviceForm.description,
          price: parseFloat(serviceForm.price),
          durationMinutes: parseInt(serviceForm.durationMinutes)
        })
      });

      if (response.ok) {
        toast.success(editingService ? "Service updated" : "Service added");
        setIsServiceDialogOpen(false);
        resetServiceForm();
        fetchDashboardData();
      } else {
        toast.error("Failed to save service");
      }
    } catch (error) {
      toast.error("Failed to save service");
    }
  };

  const handleServiceDelete = async (serviceId: number) => {
    try {
      const response = await apiRequest(`/api/services/${serviceId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Service deleted");
        fetchDashboardData();
      } else {
        toast.error("Failed to delete service");
      }
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const resetServiceForm = () => {
    setServiceForm({ name: "", description: "", price: "", durationMinutes: "" });
    setEditingService(null);
  };

  const openEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: "",
      price: service.price.toString(),
      durationMinutes: service.durationMinutes.toString()
    });
    setIsServiceDialogOpen(true);
  };

  // Staff management functions
  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon) return;

    try {
      const method = editingStaff ? "PUT" : "POST";
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : "/api/staff";
      
      const response = await apiRequest(url, {
        method,
        body: JSON.stringify({
          salonId: salon.id,
          name: staffForm.name,
          specialization: staffForm.specialization
        })
      });

      if (response.ok) {
        toast.success(editingStaff ? "Staff member updated" : "Staff member added");
        setIsStaffDialogOpen(false);
        resetStaffForm();
        fetchDashboardData();
      } else {
        toast.error("Failed to save staff member");
      }
    } catch (error) {
      toast.error("Failed to save staff member");
    }
  };

  const handleStaffDelete = async (staffId: number) => {
    try {
      const response = await apiRequest(`/api/staff/${staffId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Staff member deleted");
        fetchDashboardData();
      } else {
        toast.error("Failed to delete staff member");
      }
    } catch (error) {
      toast.error("Failed to delete staff member");
    }
  };

  const resetStaffForm = () => {
    setStaffForm({ name: "", specialization: "" });
    setEditingStaff(null);
  };

  const openEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setStaffForm({
      name: staffMember.name,
      specialization: staffMember.specialization
    });
    setIsStaffDialogOpen(true);
  };

  // Verification functions
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon) return;

    try {
      const response = await apiRequest(`/api/salons/${salon.id}`, {
        method: "PUT",
        body: JSON.stringify({
          gstNumber: verificationForm.gstNumber,
          salonType: verificationForm.salonType
        })
      });

      if (response.ok) {
        toast.success("Verification details updated");
        setIsVerificationDialogOpen(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to update verification details");
      }
    } catch (error) {
      toast.error("Failed to update verification details");
    }
  };

  // Banner upload functions
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon || !bannerUrl.trim()) return;

    try {
      setIsUploadingBanner(true);
      const response = await apiRequest(`/api/salons/${salon.id}`, {
        method: "PUT",
        body: JSON.stringify({
          imageUrl: bannerUrl.trim()
        })
      });

      if (response.ok) {
        toast.success("Banner updated successfully");
        setIsBannerDialogOpen(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to update banner");
      }
    } catch (error) {
      toast.error("Failed to update banner");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case "pending":
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case "completed":
        return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Booking ${newStatus} successfully`);
        fetchDashboardData();
      } else {
        toast.error("Failed to update booking");
      }
    } catch (error) {
      toast.error("Failed to update booking");
    }
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
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
          <h1 className="text-2xl font-bold mb-4">No Salon Found</h1>
          <p className="text-muted-foreground mb-6">
            You don't have a salon associated with your account.
          </p>
          <Button onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter(b => b.bookingDate === today);
  const upcomingBookings = bookings.filter(b => 
    b.bookingDate >= today && (b.status === "confirmed" || b.status === "pending")
  );
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const totalRevenue = bookings
    .filter(b => b.status === "completed")
    .reduce((sum, b) => {
      const service = services.find(s => s.id === b.serviceId);
      return sum + (service?.price || 0);
    }, 0);

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const service = services.find(s => s.id === booking.serviceId);
    const staffMember = staff.find(s => s.id === booking.staffId);

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{service?.name || "Unknown Service"}</h3>
              <p className="text-sm text-muted-foreground">
                {staffMember?.name || "Unknown Staff"}
              </p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
            {service && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>${service.price.toFixed(2)}</span>
              </div>
            )}
          </div>

          {booking.notes && (
            <p className="text-sm text-muted-foreground mb-4 p-2 bg-muted rounded">
              {booking.notes}
            </p>
          )}

          {booking.status === "pending" && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => updateBookingStatus(booking.id, "confirmed")}
              >
                Confirm
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1"
                onClick={() => updateBookingStatus(booking.id, "cancelled")}
              >
                Decline
              </Button>
            </div>
          )}

          {booking.status === "confirmed" && new Date(booking.bookingDate) <= new Date() && (
            <Button 
              size="sm" 
              className="w-full"
              onClick={() => updateBookingStatus(booking.id, "completed")}
            >
              Mark Complete
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              {salon.name} • Rating: {salon.rating.toFixed(1)} ⭐
              {salon.isVerified && (
                <Badge variant="outline" className="ml-2">
                  <Shield className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Banner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleBannerSubmit}>
                  <DialogHeader>
                    <DialogTitle>Salon Banner Image</DialogTitle>
                    <DialogDescription>
                      Update your salon's banner image that appears on listing cards
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {bannerUrl && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-muted">
                        <Image
                          src={bannerUrl}
                          alt="Banner preview"
                          fill
                          className="object-cover"
                          onError={() => toast.error("Invalid image URL")}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="bannerUrl">Image URL</Label>
                      <Input
                        id="bannerUrl"
                        placeholder="https://example.com/image.jpg"
                        value={bannerUrl}
                        onChange={(e) => setBannerUrl(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter a public URL of your salon's banner image
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsBannerDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploadingBanner}>
                      {isUploadingBanner ? "Saving..." : "Save Banner"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={isVerificationDialogOpen} onOpenChange={setIsVerificationDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Shield className="h-4 w-4 mr-2" />
                  Verification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleVerificationSubmit}>
                  <DialogHeader>
                    <DialogTitle>Salon Verification</DialogTitle>
                    <DialogDescription>
                      Verify your salon to build trust with customers
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                      <Input
                        id="gstNumber"
                        placeholder="22AAAAA0000A1Z5"
                        value={verificationForm.gstNumber}
                        onChange={(e) => setVerificationForm({
                          ...verificationForm,
                          gstNumber: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salonType">Salon Type</Label>
                      <Select
                        value={verificationForm.salonType}
                        onValueChange={(value) => setVerificationForm({
                          ...verificationForm,
                          salonType: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="men">Men's Salon</SelectItem>
                          <SelectItem value="women">Women's Salon</SelectItem>
                          <SelectItem value="unisex">Unisex Salon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsVerificationDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Save Changes</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayBookings.length}</div>
              <p className="text-xs text-muted-foreground">
                {todayBookings.filter(b => b.status === "confirmed").length} confirmed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From completed bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
              <p className="text-xs text-muted-foreground">
                Active staff
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">
              Bookings ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="services">
              Services ({services.length})
            </TabsTrigger>
            <TabsTrigger value="staff">
              Staff ({staff.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>
                  Manage your salon appointments
                </CardDescription>
              </CardHeader>
            </Card>

            {upcomingBookings.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Bookings</h3>
                  <p className="text-muted-foreground">
                    New bookings will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Services Offered</CardTitle>
                  <CardDescription>Manage your salon's service menu</CardDescription>
                </div>
                <Dialog open={isServiceDialogOpen} onOpenChange={(open) => {
                  setIsServiceDialogOpen(open);
                  if (!open) resetServiceForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleServiceSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                        <DialogDescription>
                          Add services customers can book at your salon
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Service Name *</Label>
                          <Input
                            id="name"
                            required
                            placeholder="Haircut"
                            value={serviceForm.name}
                            onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Professional haircut with styling"
                            value={serviceForm.description}
                            onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="price">Price ($) *</Label>
                            <Input
                              id="price"
                              type="number"
                              step="0.01"
                              required
                              placeholder="25.00"
                              value={serviceForm.price}
                              onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration (min) *</Label>
                            <Input
                              id="duration"
                              type="number"
                              required
                              placeholder="30"
                              value={serviceForm.durationMinutes}
                              onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => {
                          setIsServiceDialogOpen(false);
                          resetServiceForm();
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingService ? "Update" : "Add"} Service
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
            </Card>

            {services.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Services</h3>
                  <p className="text-muted-foreground mb-6">
                    Add services to start accepting bookings
                  </p>
                  <Button onClick={() => setIsServiceDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Service
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {services.map((service) => (
                  <Card key={service.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{service.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {service.durationMinutes} min
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              ${service.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditService(service)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{service.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleServiceDelete(service.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="staff" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your salon staff</CardDescription>
                </div>
                <Dialog open={isStaffDialogOpen} onOpenChange={(open) => {
                  setIsStaffDialogOpen(open);
                  if (!open) resetStaffForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleStaffSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingStaff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
                        <DialogDescription>
                          Add team members who will provide services
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="staffName">Name *</Label>
                          <Input
                            id="staffName"
                            required
                            placeholder="John Doe"
                            value={staffForm.name}
                            onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization *</Label>
                          <Input
                            id="specialization"
                            required
                            placeholder="Hair Styling, Coloring"
                            value={staffForm.specialization}
                            onChange={(e) => setStaffForm({ ...staffForm, specialization: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => {
                          setIsStaffDialogOpen(false);
                          resetStaffForm();
                        }}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingStaff ? "Update" : "Add"} Staff Member
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
            </Card>

            {staff.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Staff Members</h3>
                  <p className="text-muted-foreground mb-6">
                    Add staff members to manage schedules
                  </p>
                  <Button onClick={() => setIsStaffDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Staff Member
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {staff.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {member.specialization}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditStaff(member)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleStaffDelete(member.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          {bookings.filter(b => b.staffId === member.id && b.status === "confirmed").length} upcoming bookings
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}