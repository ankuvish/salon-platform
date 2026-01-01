"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import AuthDialog from "@/components/AuthDialog";
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
  const urlParam = params.id as string;
  const salonId = urlParam.includes('-') ? urlParam.split('-').pop() || urlParam : urlParam;
  const preSelectedServiceId = searchParams.get("service");

  const [salon, setSalon] = useState<Salon | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<TimeSlot[]>([]);

  const [selectedServices, setSelectedServices] = useState<string[]>(preSelectedServiceId ? [preSelectedServiceId] : []);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const bookingAttempted = useRef(false);

  useEffect(() => {
    if (salonId) {
      fetchBookingData();
    }
  }, [salonId]);

  useEffect(() => {
    if (selectedDate && selectedStaffId && selectedServices.length > 0) {
      setSelectedSlot(null);
      fetchAvailability();
    } else {
      setAvailableSlots([]);
      setBookedSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDate, selectedStaffId, selectedServices]);

  useEffect(() => {
    if (session?.user && bookingAttempted.current) {
      bookingAttempted.current = false;
      setAuthOpen(false);
      toast.success("You're now logged in! Confirming your booking...");
      setTimeout(() => handleBooking(), 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const fetchBookingData = async () => {
    try {
      setIsLoading(true);
      
      // Handle dummy salons
      if (urlParam.includes('dummy-')) {
        const dummySalons = [
          { _id: "dummy-9999", id: 9999, name: "Luxury Hair Studio", address: "123 Fashion Street", city: "Mumbai" },
          { _id: "dummy-9998", id: 9998, name: "Elite Beauty Lounge", address: "456 Style Avenue", city: "Delhi" },
          { _id: "dummy-9997", id: 9997, name: "Gentleman's Grooming", address: "789 Barber Lane", city: "Bangalore" },
        ];
        const dummySalon = dummySalons.find(s => urlParam.includes(s._id));
        if (dummySalon) {
          setSalon({ ...dummySalon, id: dummySalon.id });
          setServices([
            { id: 1, name: "Haircut", description: "Professional haircut with styling", durationMinutes: 30, price: 500 },
            { id: 2, name: "Hair Coloring", description: "Full hair coloring service", durationMinutes: 90, price: 2500 },
            { id: 3, name: "Facial", description: "Relaxing facial treatment", durationMinutes: 45, price: 1200 },
            { id: 4, name: "Manicure", description: "Complete nail care", durationMinutes: 30, price: 800 },
          ]);
          setStaff([
            { id: 1, name: "Sarah Johnson", specialization: "Hair Stylist" },
            { id: 2, name: "Mike Chen", specialization: "Barber" },
            { id: 3, name: "Emma Davis", specialization: "Beautician" },
          ]);
        }
        setIsLoading(false);
        return;
      }
      
      const [salonRes, servicesRes, staffRes] = await Promise.all([
        apiRequest(`/api/salons/${salonId}`),
        apiRequest(`/api/services?salon_id=${salonId}&limit=50`),
        apiRequest(`/api/staff?salon_id=${salonId}&limit=50`)
      ]);

      if (salonRes.ok) {
        const salonData = await salonRes.json();
        setSalon({ ...salonData, id: salonData._id || salonData.id });
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.map((s: any) => ({ ...s, id: s._id || s.id })));
      }

      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData.map((s: any) => ({ ...s, id: s._id || s.id })));
      }
    } catch (error) {
      console.error("Failed to fetch booking data:", error);
      toast.error("Failed to load booking information");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailability = async () => {
    if (!selectedDate || !selectedStaffId || selectedServices.length === 0) return;

    try {
      setIsLoadingSlots(true);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const totalDuration = selectedServices.reduce((sum, serviceId) => {
        const service = services.find(s => s.id.toString() === serviceId);
        return sum + (service?.durationMinutes || 0);
      }, 0);
      
      // Generate dummy slots for dummy salons
      if (urlParam.includes('dummy-')) {
        const slots = [];
        for (let hour = 9; hour < 20; hour++) {
          slots.push({ startTime: `${hour.toString().padStart(2, '0')}:00`, endTime: `${(hour + 1).toString().padStart(2, '0')}:00`, available: true });
          slots.push({ startTime: `${hour.toString().padStart(2, '0')}:30`, endTime: `${hour.toString().padStart(2, '0')}:30`, available: true });
        }
        setAvailableSlots(slots);
        setBookedSlots([]);
        setIsLoadingSlots(false);
        return;
      }
      
      const response = await apiRequest(
        `/api/availability?salon_id=${salonId}&staff_id=${selectedStaffId}&date=${dateStr}&service_id=${selectedServices[0]}&duration=${totalDuration}`
      );

      if (response.ok) {
        const data = await response.json();
        const allSlots = data.slots || [];
        setAvailableSlots(allSlots.filter((s: any) => s.available) || []);
        setBookedSlots(allSlots.filter((s: any) => s.booked) || []);
      } else {
        setAvailableSlots([]);
        setBookedSlots([]);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      setAvailableSlots([]);
      setBookedSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!session?.user) {
      if (selectedServices.length === 0 || !selectedStaffId || !selectedDate || !selectedSlot || !paymentMethod) {
        toast.error("Please complete all booking details first");
        return;
      }
      toast.error("Please sign in to book an appointment");
      setAuthOpen(true);
      bookingAttempted.current = true;
      return;
    }

    if (selectedServices.length === 0 || !selectedStaffId || !selectedDate || !selectedSlot) {
      toast.error("Please complete all booking details");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!termsAccepted) {
      toast.error("Please accept the terms and conditions");
      return;
    }

    try {
      setIsBooking(true);
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Calculate total duration and end time
      const totalDuration = selectedServices.reduce((sum, serviceId) => {
        const service = services.find(s => s.id.toString() === serviceId);
        return sum + (service?.durationMinutes || 0);
      }, 0);

      const [startHour, startMin] = selectedSlot.startTime.split(':').map(Number);
      let endHour = startHour;
      let endMin = startMin + totalDuration;
      if (endMin >= 60) {
        endHour += Math.floor(endMin / 60);
        endMin = endMin % 60;
      }
      const calculatedEndTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

      // Create bookings for each service
      const bookingPromises = selectedServices.map(serviceId => 
        apiRequest("/api/bookings", {
          method: "POST",
          body: JSON.stringify({
            customerId: session.user.id,
            salonId: salonId,
            serviceId: serviceId,
            staffId: selectedStaffId,
            bookingDate: dateStr,
            startTime: selectedSlot.startTime,
            endTime: calculatedEndTime,
            status: "pending",
            notes: notes.trim() || null,
            paymentMethod: paymentMethod,
            paymentStatus: paymentMethod === "cash" ? "pending" : "processing",
          }),
        })
      );

      const responses = await Promise.all(bookingPromises);
      const allSuccess = responses.every(r => r.ok);
      
      // Log any failures
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          const errorData = await responses[i].json();
          console.error('Booking failed:', errorData);
          toast.error(`Booking failed: ${errorData.details || errorData.error}`);
        }
      }

      if (allSuccess) {
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
        toast.error("Failed to book appointment");
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

  const selectedServicesList = services.filter(s => selectedServices.includes(s.id.toString()));
  const totalPrice = selectedServicesList.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServicesList.reduce((sum, s) => sum + s.durationMinutes, 0);
  const allSlots = [...availableSlots, ...bookedSlots].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground mb-4">
                Your appointment has been successfully booked. {paymentMethod === "cash" ? "You can pay at the salon." : "Your payment has been processed."}
              </p>
              
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-amber-900 dark:text-amber-100 text-sm mb-1">Important Reminder</p>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Please arrive <span className="font-bold">10 minutes before</span> your scheduled appointment time at <span className="font-bold">{selectedSlot?.startTime}</span> to ensure a smooth check-in process.
                    </p>
                  </div>
                </div>
              </div>
              
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultTab="login" />

      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Book Appointment</h1>
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
                <Label>Choose services (multiple allowed)</Label>
                <div className="space-y-2">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-start sm:items-center space-x-2 p-3 border rounded-lg hover:bg-accent">
                      <input
                        type="checkbox"
                        id={`service-${service.id}`}
                        checked={selectedServices.includes(service.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, service.id.toString()]);
                          } else {
                            setSelectedServices(selectedServices.filter(id => id !== service.id.toString()));
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                          <span className="font-medium text-sm sm:text-base">{service.name}</span>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <span>{service.durationMinutes} min</span>
                            <span className="font-semibold text-primary">₹{service.price.toFixed(2)}</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
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
                  disabled={selectedServices.length === 0}
                >
                  <SelectTrigger id="staff">
                    <SelectValue placeholder="Select a staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name}
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
                    disabled={(date) => {
                      const utc = new Date();
                      const istOffset = 5.5 * 60 * 60 * 1000;
                      const ist = new Date(utc.getTime() + istOffset);
                      const istToday = new Date(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate());
                      const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                      return checkDate < istToday;
                    }}
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
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
                  <span className="text-muted-foreground">Services:</span>
                  <span className="font-medium">
                    {selectedServicesList.length > 0 ? `${selectedServicesList.length} selected` : "Not selected"}
                  </span>
                </div>
                {selectedServicesList.length > 0 && (
                  <div className="pl-4 space-y-1">
                    {selectedServicesList.map(service => (
                      <div key={service.id} className="flex justify-between text-xs text-muted-foreground">
                        <span>• {service.name}</span>
                        <span>₹{service.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Staff:</span>
                  <span className="font-medium">
                    {staff.find(s => s.id.toString() === selectedStaffId)?.name || "Not selected"}
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
                    {selectedSlot ? `${selectedSlot.startTime} - ${(() => {
                      const [startHour, startMin] = selectedSlot.startTime.split(':').map(Number);
                      let endHour = startHour;
                      let endMin = startMin + totalDuration;
                      if (endMin >= 60) {
                        endHour += Math.floor(endMin / 60);
                        endMin = endMin % 60;
                      }
                      return `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
                    })()}` : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment:</span>
                  <span className="font-medium capitalize">
                    {paymentMethod === "cash" ? "Pay at Salon" : paymentMethod === "online" ? "Online Payment" : "Net Banking"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {totalDuration > 0 ? `${totalDuration} minutes` : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2 mb-4 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 mt-1"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms-of-service" target="_blank" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy-policy" target="_blank" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleBooking}
                disabled={
                  !session?.user ||
                  selectedServices.length === 0 ||
                  !selectedStaffId ||
                  !selectedDate ||
                  !selectedSlot ||
                  !paymentMethod ||
                  !termsAccepted ||
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