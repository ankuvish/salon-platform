import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, salons, services, user } from "@/db/schema";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm";
import { notificationService } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Filter parameters
    const customerId = searchParams.get('customer_id');
    const salonId = searchParams.get('salon_id');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy');
    const order = searchParams.get('order') || 'asc';

    // Build filter conditions
    const conditions = [];
    
    if (customerId) {
      // Changed: customerId is now text, no need to parse
      conditions.push(eq(bookings.customerId, customerId));
    }
    
    if (salonId) {
      const salonIdInt = parseInt(salonId);
      if (!isNaN(salonIdInt)) {
        conditions.push(eq(bookings.salonId, salonIdInt));
      }
    }
    
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (validStatuses.includes(status)) {
        conditions.push(eq(bookings.status, status));
      }
    }
    
    if (startDate) {
      conditions.push(gte(bookings.bookingDate, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(bookings.bookingDate, endDate));
    }

    // Build query
    let query = db.select().from(bookings);
    
    // Apply filters
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    if (sortBy === 'bookingDate') {
      query = order === 'desc' 
        ? query.orderBy(desc(bookings.bookingDate))
        : query.orderBy(asc(bookings.bookingDate));
    }
    
    // Apply pagination
    const results = await query.limit(limit).offset(offset);
    
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      salonId,
      serviceId,
      staffId,
      bookingDate,
      startTime,
      endTime,
      status,
      notes,
      paymentMethod,
      paymentStatus,
      paymentTransactionId,
    } = body;

    if (
      !customerId ||
      !salonId ||
      !serviceId ||
      !staffId ||
      !bookingDate ||
      !startTime ||
      !endTime
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate paymentMethod if provided
    if (paymentMethod) {
      const validPaymentMethods = ['cash', 'online', 'netbanking'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return NextResponse.json(
          { 
            error: "Invalid paymentMethod. Must be one of: cash, online, netbanking",
            code: "INVALID_PAYMENT_METHOD"
          },
          { status: 400 }
        );
      }
    }

    // Validate paymentStatus if provided
    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'processing', 'completed', 'failed'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { 
            error: "Invalid paymentStatus. Must be one of: pending, processing, completed, failed",
            code: "INVALID_PAYMENT_STATUS"
          },
          { status: 400 }
        );
      }
    }

    const [newBooking] = await db
      .insert(bookings)
      .values({
        customerId,
        salonId,
        serviceId,
        staffId,
        bookingDate,
        startTime,
        endTime,
        status: status || "pending",
        notes: notes || null,
        createdAt: new Date().toISOString(),
        paymentMethod: paymentMethod || null,
        paymentStatus: paymentStatus || null,
        paymentTransactionId: paymentTransactionId || null,
      })
      .returning();

    // Send booking confirmation notification
    try {
      const [customer] = await db
        .select()
        .from(user)
        .where(eq(user.id, customerId))
        .limit(1);

      const [salon] = await db
        .select()
        .from(salons)
        .where(eq(salons.id, salonId))
        .limit(1);

      const [service] = await db
        .select()
        .from(services)
        .where(eq(services.id, serviceId))
        .limit(1);

      if (customer && salon && service) {
        await notificationService.sendBookingConfirmation({
          customerName: customer.name,
          customerEmail: customer.email,
          customerPhone: customer.phone || "",
          salonName: salon.name,
          serviceName: service.name,
          bookingDate,
          startTime,
          endTime,
          bookingId: newBooking.id.toString(),
        });
      }
    } catch (notifError) {
      console.error("Failed to send booking notification:", notifError);
      // Don't fail the booking if notification fails
    }

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}