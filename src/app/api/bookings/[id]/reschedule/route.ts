import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, salons, services, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notificationService } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);

    if (isNaN(bookingId)) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    const body = await request.json();
    const { bookingDate, startTime, endTime } = body;

    if (!bookingDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields: bookingDate, startTime, endTime" },
        { status: 400 }
      );
    }

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const oldBookingDate = new Date(booking.bookingDate);
    const now = new Date();
    const hoursUntilBooking =
      (oldBookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24) {
      return NextResponse.json(
        {
          error:
            "Cannot reschedule booking less than 24 hours before appointment",
        },
        { status: 400 }
      );
    }

    const [updatedBooking] = await db
      .update(bookings)
      .set({
        bookingDate,
        startTime,
        endTime,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    // Send reschedule notification
    try {
      const [customer] = await db
        .select()
        .from(user)
        .where(eq(user.id, booking.customerId))
        .limit(1);

      const [salon] = await db
        .select()
        .from(salons)
        .where(eq(salons.id, booking.salonId))
        .limit(1);

      const [service] = await db
        .select()
        .from(services)
        .where(eq(services.id, booking.serviceId))
        .limit(1);

      if (customer && salon && service) {
        await notificationService.sendBookingReschedule({
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone || "",
          salonName: salon.name,
          serviceName: service.name,
          bookingDate,
          startTime,
          endTime,
          bookingId: booking.id.toString(),
          oldDate: booking.bookingDate,
          oldTime: booking.startTime,
        });
      }
    } catch (notifError) {
      console.error("Failed to send reschedule notification:", notifError);
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error("Failed to reschedule booking:", error);
    return NextResponse.json(
      { error: "Failed to reschedule booking" },
      { status: 500 }
    );
  }
}