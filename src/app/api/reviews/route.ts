import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, salons, user, bookings } from '@/db/schema';
import { eq, gte, desc, asc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const salonId = searchParams.get('salon_id');
    const customerId = searchParams.get('customer_id');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy');
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(reviews);

    // Build filter conditions
    const conditions = [];
    
    if (salonId) {
      const parsedSalonId = parseInt(salonId);
      if (!isNaN(parsedSalonId)) {
        conditions.push(eq(reviews.salonId, parsedSalonId));
      }
    }

    if (customerId) {
      // Changed: customerId is now text, no need to parse
      conditions.push(eq(reviews.customerId, customerId));
    }

    if (minRating) {
      const parsedMinRating = parseInt(minRating);
      if (!isNaN(parsedMinRating) && parsedMinRating >= 1 && parsedMinRating <= 5) {
        conditions.push(gte(reviews.rating, parsedMinRating));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    if (sortBy === 'createdAt') {
      query = order === 'asc' 
        ? query.orderBy(asc(reviews.createdAt))
        : query.orderBy(desc(reviews.createdAt));
    } else {
      query = query.orderBy(desc(reviews.createdAt));
    }

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
    const { salonId, customerId, bookingId, rating, comment } = body;

    // Validate required fields
    if (!salonId) {
      return NextResponse.json({ 
        error: "salonId is required",
        code: "MISSING_SALON_ID" 
      }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({ 
        error: "customerId is required",
        code: "MISSING_CUSTOMER_ID" 
      }, { status: 400 });
    }

    if (!bookingId) {
      return NextResponse.json({ 
        error: "bookingId is required",
        code: "MISSING_BOOKING_ID" 
      }, { status: 400 });
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json({ 
        error: "rating is required",
        code: "MISSING_RATING" 
      }, { status: 400 });
    }

    // Validate rating is integer between 1 and 5
    const parsedRating = parseInt(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return NextResponse.json({ 
        error: "rating must be an integer between 1 and 5",
        code: "INVALID_RATING" 
      }, { status: 400 });
    }

    // Validate salonId exists
    const salon = await db.select()
      .from(salons)
      .where(eq(salons.id, parseInt(salonId)))
      .limit(1);

    if (salon.length === 0) {
      return NextResponse.json({ 
        error: "Salon not found",
        code: "SALON_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate customerId exists - now text type
    const customer = await db.select()
      .from(user)
      .where(eq(user.id, customerId))
      .limit(1);

    if (customer.length === 0) {
      return NextResponse.json({ 
        error: "Customer not found",
        code: "CUSTOMER_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate bookingId exists
    const booking = await db.select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(bookingId)))
      .limit(1);

    if (booking.length === 0) {
      return NextResponse.json({ 
        error: "Booking not found",
        code: "BOOKING_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate that booking belongs to the customer - now comparing text IDs
    if (booking[0].customerId !== customerId) {
      return NextResponse.json({ 
        error: "Booking does not belong to this customer",
        code: "BOOKING_CUSTOMER_MISMATCH" 
      }, { status: 400 });
    }

    // Validate that booking status is 'completed'
    if (booking[0].status !== 'completed') {
      return NextResponse.json({ 
        error: "Only completed bookings can be reviewed",
        code: "BOOKING_NOT_COMPLETED" 
      }, { status: 400 });
    }

    // Create the review - customerId is now text
    const newReview = await db.insert(reviews)
      .values({
        salonId: parseInt(salonId),
        customerId: customerId.trim(),
        bookingId: parseInt(bookingId),
        rating: parsedRating,
        comment: comment || null,
        createdAt: new Date().toISOString()
      })
      .returning();

    // Update salon's average rating
    const allReviews = await db.select({ rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.salonId, parseInt(salonId)));

    const avgRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
    const roundedRating = Math.round(avgRating * 10) / 10; // Round to 1 decimal place

    await db.update(salons)
      .set({ rating: roundedRating })
      .where(eq(salons.id, parseInt(salonId)));

    return NextResponse.json(newReview[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}