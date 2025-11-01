import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { services, salons } from '@/db/schema';
import { eq, like, gte, lte, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // REQUIRED: salonId parameter
    const salonId = searchParams.get('salon_id');
    if (!salonId || isNaN(parseInt(salonId))) {
      return NextResponse.json({ 
        error: 'Valid salon_id is required',
        code: 'INVALID_SALON_ID' 
      }, { status: 400 });
    }

    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Search parameter
    const search = searchParams.get('search');

    // Price range parameters
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    // Duration range parameters
    const minDuration = searchParams.get('minDuration');
    const maxDuration = searchParams.get('maxDuration');

    // Build conditions array
    const conditions = [eq(services.salonId, parseInt(salonId))];

    // Add search condition
    if (search) {
      conditions.push(like(services.name, `%${search}%`));
    }

    // Add price range conditions
    if (minPrice) {
      const minPriceValue = parseFloat(minPrice);
      if (!isNaN(minPriceValue)) {
        conditions.push(gte(services.price, minPriceValue));
      }
    }

    if (maxPrice) {
      const maxPriceValue = parseFloat(maxPrice);
      if (!isNaN(maxPriceValue)) {
        conditions.push(lte(services.price, maxPriceValue));
      }
    }

    // Add duration range conditions
    if (minDuration) {
      const minDurationValue = parseInt(minDuration);
      if (!isNaN(minDurationValue)) {
        conditions.push(gte(services.durationMinutes, minDurationValue));
      }
    }

    if (maxDuration) {
      const maxDurationValue = parseInt(maxDuration);
      if (!isNaN(maxDurationValue)) {
        conditions.push(lte(services.durationMinutes, maxDurationValue));
      }
    }

    // Execute query with all conditions
    const results = await db.select()
      .from(services)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

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
    const { salonId, name, description, durationMinutes, price } = body;

    // Validate required fields
    if (!salonId) {
      return NextResponse.json({ 
        error: 'salonId is required',
        code: 'MISSING_SALON_ID' 
      }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Valid name is required',
        code: 'MISSING_NAME' 
      }, { status: 400 });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ 
        error: 'Valid description is required',
        code: 'MISSING_DESCRIPTION' 
      }, { status: 400 });
    }

    if (!durationMinutes || typeof durationMinutes !== 'number') {
      return NextResponse.json({ 
        error: 'Valid durationMinutes is required',
        code: 'MISSING_DURATION' 
      }, { status: 400 });
    }

    if (price === undefined || price === null || typeof price !== 'number') {
      return NextResponse.json({ 
        error: 'Valid price is required',
        code: 'MISSING_PRICE' 
      }, { status: 400 });
    }

    // Validate salonId is valid integer
    const parsedSalonId = parseInt(salonId.toString());
    if (isNaN(parsedSalonId)) {
      return NextResponse.json({ 
        error: 'Valid salonId is required',
        code: 'INVALID_SALON_ID' 
      }, { status: 400 });
    }

    // Validate durationMinutes is positive integer
    if (durationMinutes <= 0 || !Number.isInteger(durationMinutes)) {
      return NextResponse.json({ 
        error: 'durationMinutes must be a positive integer',
        code: 'INVALID_DURATION' 
      }, { status: 400 });
    }

    // Validate price is positive number
    if (price <= 0) {
      return NextResponse.json({ 
        error: 'price must be a positive number',
        code: 'INVALID_PRICE' 
      }, { status: 400 });
    }

    // Validate salonId exists in salons table
    const existingSalon = await db.select()
      .from(salons)
      .where(eq(salons.id, parsedSalonId))
      .limit(1);

    if (existingSalon.length === 0) {
      return NextResponse.json({ 
        error: 'Salon not found',
        code: 'SALON_NOT_FOUND' 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedDescription = description.trim();

    // Create new service
    const newService = await db.insert(services)
      .values({
        salonId: parsedSalonId,
        name: sanitizedName,
        description: sanitizedDescription,
        durationMinutes: durationMinutes,
        price: price,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newService[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}