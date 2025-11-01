"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useSession } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarIcon, Clock, DollarSign, User, CheckCircle2, CreditCard, Banknote, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface Salon {
  id: number;
  name: string;
  address: string;
  city: string;
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
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

export default function BookAppointmentPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const salonId = params.id as string;
  const preSelectedServiceId = searchParams.get("service");

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<TimeSlot[]>([]);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(preSelectedServiceId || "");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (salonId) {
      fetchBookingData();
    }
  }, [salonId]);

  useEffect(() => {
    if (selectedDate && selectedStaffId && selectedServiceId) {
      fetchAvailability();
    } else {
      setAvailableSlots([]);
      setBookedSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedStaffId, selectedServiceId]);

  const fetchBookingData = async () => {
    try {
      setIsLoading(true);
      
      const [salonRes, servicesRes, staffRes] = await Promise.all([
        apiRequest(`/api/salons/${salonId}`),
        apiRequest(`/api/services?salon_id=${salonId}&limit=50`),
        apiRequest(`/api/staff?salon_id=${salonId}&limit=50`)
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
    } catch (error) {
      console.error("Failed to fetch booking data:", error);
      toast.error("Failed to load booking information");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedDate || !selectedStaffId || !selectedServiceId) return;

    try {
      setIsLoadingSlots(true);
      const dateStr = selectedDate.toISOString().split("T")[0];
      
      const response = await apiRequest(
        `/api/availability?salon_id=${salonId}&staff_id=${selectedStaffId}&date=${dateStr}&service_id=${selectedServiceId}`
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.slots?.filter((s: any) => s.available) || []);
        setBookedSlots(data.slots?.filter((s: any) => s.booked) || []);
      } else {
        toast.error("Failed to fetch available time slots");
        setAvailableSlots([]);
        setBookedSlots([]);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      toast.error("Failed to fetch available time slots");
      setAvailableSlots([]);
      setBookedSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!session?.user) {
      toast.error("Please sign in to book an appointment");
      router.push(`/login?redirect=/book/${salonId}`);
      return;
    }

    if (!selectedServiceId || !selectedStaffId || !selectedDate || !selectedSlot) {
      toast.error("Please complete all booking details");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    try {
      setIsBooking(true);
      const dateStr = selectedDate.toISOString().split("T")[0];

      const response = await apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          customerId: session.user.id,
          salonId: parseInt(salonId),
          serviceId: parseInt(selectedServiceId),
          staffId: parseInt(selectedStaffId),
          bookingDate: dateStr,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          status: "pending",
          notes: notes.trim() || null,
          paymentMethod: paymentMethod,
          paymentStatus: paymentMethod === "cash" ? "pending" : "processing",
        }),
      });

      if (response.ok) {
        const booking = await response.json();

        if (paymentMethod === "online" || paymentMethod === "netbanking") {
          toast.info("Redirecting to payment gateway...");
          setTimeout(() => {
            setBookingSuccess(true);
            toast.success("Payment processed successfully!");
          }, 2000);
        } else {
          setBookingSuccess(true);
          toast.success("Appointment booked successfully!");
        }
        
        setTimeout(() => {
          router.push("/my-bookings");
        }, 3000);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };

  if (sessionLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
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

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground mb-6">
                Your appointment has been successfully booked. {paymentMethod === "cash" ? "You can pay at the salon." : "Your payment has been processed."}
              </p>
              <div className="space-y-2 mb-8">
                <Button asChild className="w-full">
                  <Link href="/my-bookings">View My Bookings</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const selectedService = services.find(s => s.id === parseInt(selectedServiceId));
  const allSlots = [...availableSlots, ...bookedSlots].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
          <p className="text-muted-foreground">
            {salon.name} • {salon.address}, {salon.city}
          </p>
        </div>

        {!session?.user && (
          <Card className="mb-6 border-orange-200 bg-orange-50/50">
            <CardContent className="pt-6">
              <p className="text-sm">
                Please{" "}
                <Link href="/login" className="text-primary font-semibold hover:underline">
                  sign in
                </Link>{" "}
                to book an appointment.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {/* Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                1. Select Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="service">Choose a service</Label>
                <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                  <SelectTrigger id="service">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.name} - ${service.price.toFixed(2)} ({service.durationMinutes} min)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedService && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">{selectedService.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {selectedService.durationMinutes} minutes
                      </Badge>
                      <Badge variant="secondary">
                        <DollarSign className="h-3 w-3 mr-1" />
                        ${selectedService.price.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Staff Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                2. Select Staff Member
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="staff">Choose your preferred stylist</Label>
                <Select 
                  value={selectedStaffId} 
                  onValueChange={setSelectedStaffId}
                  disabled={!selectedServiceId}
                >
                  <SelectTrigger id="staff">
                    <SelectValue placeholder="Select a staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name} - {member.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                3. Choose Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">Select a date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md border"
                    classNames={{
                      months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                      month: "space-y-4",
                      caption: "flex justify-center pt-1 relative items-center",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex",
                      head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md",
                      day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      day_today: "bg-accent text-accent-foreground",
                      day_outside: "text-muted-foreground opacity-50",
                      day_disabled: "text-muted-foreground opacity-50",
                      day_hidden: "invisible",
                    }}
                  />
                </div>

                {selectedDate && selectedStaffId && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Available time slots</Label>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-green-500"></span>
                          Available
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-red-500"></span>
                          Booked
                        </span>
                      </div>
                    </div>
                    {isLoadingSlots ? (
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <Skeleton key={i} className="h-10 w-full" />
                        ))}
                      </div>
                    ) : allSlots.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 border rounded-lg text-center">
                        No time slots available for this date.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {allSlots.map((slot, index) => {
                          const isBooked = slot.isBooked;
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          
                          return (
                            <Button
                              key={index}
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => !isBooked && setSelectedSlot(slot)}
                              disabled={isBooked}
                              className={`w-full ${
                                isBooked 
                                  ? 'bg-red-100 dark:bg-red-950 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950 cursor-not-allowed' 
                                  : isSelected
                                  ? ''
                                  : 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900'
                              }`}
                            >
                              {slot.startTime}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>4. Additional Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special requests or preferences..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                5. Select Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Pay at Salon (Cash)</p>
                        <p className="text-sm text-muted-foreground">Pay when you visit the salon</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex items-center gap-3 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Online Payment</p>
                        <p className="text-sm text-muted-foreground">Pay securely with credit/debit card</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="netbanking" id="netbanking" />
                    <Label htmlFor="netbanking" className="flex items-center gap-3 cursor-pointer flex-1">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Net Banking</p>
                        <p className="text-sm text-muted-foreground">Pay through your bank account</p>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Booking Summary & Submit */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">
                    {selectedService?.name || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Staff:</span>
                  <span className="font-medium">
                    {staff.find(s => s.id === parseInt(selectedStaffId))?.name || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString() || "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">
                    {selectedSlot ? `${selectedSlot.startTime} - ${selectedSlot.endTime}` : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-medium capitalize">
                    {paymentMethod === "cash" ? "Pay at Salon" : paymentMethod === "online" ? "Online Payment" : "Net Banking"}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg">
                    ${selectedService?.price.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleBooking}
                disabled={
                  !session?.user ||
                  !selectedServiceId ||
                  !selectedStaffId ||
                  !selectedDate ||
                  !selectedSlot ||
                  !paymentMethod ||
                  isBooking
                }
              >
                {isBooking ? "Processing..." : paymentMethod === "cash" ? "Confirm Booking" : "Proceed to Payment"}
              </Button>

              {!session?.user && (
                <p className="text-sm text-center text-muted-foreground mt-4">
                  Please sign in to complete your booking
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}