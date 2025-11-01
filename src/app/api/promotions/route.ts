import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { promotions, salons } from '@/db/schema';
import { eq, gte, lte, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const salonId = searchParams.get('salon_id');
    const activeParam = searchParams.get('active');
    const validParam = searchParams.get('valid');

    let query = db.select().from(promotions);
    const conditions = [];

    // Filter by salonId
    if (salonId) {
      const parsedSalonId = parseInt(salonId);
      if (isNaN(parsedSalonId)) {
        return NextResponse.json({ 
          error: 'Invalid salon_id parameter',
          code: 'INVALID_SALON_ID' 
        }, { status: 400 });
      }
      conditions.push(eq(promotions.salonId, parsedSalonId));
    }

    // Filter by active status
    if (activeParam !== null) {
      const isActive = activeParam === 'true';
      conditions.push(eq(promotions.isActive, isActive));
    }

    // Filter by current date validity
    if (validParam === 'true') {
      const currentDate = new Date().toISOString().split('T')[0];
      conditions.push(lte(promotions.validFrom, currentDate));
      conditions.push(gte(promotions.validUntil, currentDate));
    }

    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
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
    const { 
      salonId, 
      title, 
      description, 
      discountPercentage, 
      validFrom, 
      validUntil,
      isActive = true
    } = body;

    // Validate required fields
    if (!salonId) {
      return NextResponse.json({ 
        error: 'salonId is required',
        code: 'MISSING_SALON_ID' 
      }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ 
        error: 'title is required',
        code: 'MISSING_TITLE' 
      }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json({ 
        error: 'description is required',
        code: 'MISSING_DESCRIPTION' 
      }, { status: 400 });
    }

    if (!discountPercentage && discountPercentage !== 0) {
      return NextResponse.json({ 
        error: 'discountPercentage is required',
        code: 'MISSING_DISCOUNT_PERCENTAGE' 
      }, { status: 400 });
    }

    if (!validFrom) {
      return NextResponse.json({ 
        error: 'validFrom is required',
        code: 'MISSING_VALID_FROM' 
      }, { status: 400 });
    }

    if (!validUntil) {
      return NextResponse.json({ 
        error: 'validUntil is required',
        code: 'MISSING_VALID_UNTIL' 
      }, { status: 400 });
    }

    // Validate salonId is a valid integer
    const parsedSalonId = parseInt(salonId);
    if (isNaN(parsedSalonId)) {
      return NextResponse.json({ 
        error: 'salonId must be a valid integer',
        code: 'INVALID_SALON_ID' 
      }, { status: 400 });
    }

    // Validate salon exists
    const salonExists = await db.select()
      .from(salons)
      .where(eq(salons.id, parsedSalonId))
      .limit(1);

    if (salonExists.length === 0) {
      return NextResponse.json({ 
        error: 'Salon not found',
        code: 'SALON_NOT_FOUND' 
      }, { status: 400 });
    }

    // Validate discountPercentage
    const parsedDiscount = parseInt(discountPercentage);
    if (isNaN(parsedDiscount) || parsedDiscount < 1 || parsedDiscount > 100) {
      return NextResponse.json({ 
        error: 'discountPercentage must be between 1 and 100',
        code: 'INVALID_DISCOUNT_PERCENTAGE' 
      }, { status: 400 });
    }

    // Validate date formats (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(validFrom)) {
      return NextResponse.json({ 
        error: 'validFrom must be in YYYY-MM-DD format',
        code: 'INVALID_VALID_FROM_FORMAT' 
      }, { status: 400 });
    }

    if (!dateRegex.test(validUntil)) {
      return NextResponse.json({ 
        error: 'validUntil must be in YYYY-MM-DD format',
        code: 'INVALID_VALID_UNTIL_FORMAT' 
      }, { status: 400 });
    }

    // Validate validFrom is before validUntil
    const fromDate = new Date(validFrom);
    const untilDate = new Date(validUntil);

    if (isNaN(fromDate.getTime())) {
      return NextResponse.json({ 
        error: 'validFrom is not a valid date',
        code: 'INVALID_VALID_FROM_DATE' 
      }, { status: 400 });
    }

    if (isNaN(untilDate.getTime())) {
      return NextResponse.json({ 
        error: 'validUntil is not a valid date',
        code: 'INVALID_VALID_UNTIL_DATE' 
      }, { status: 400 });
    }

    if (fromDate >= untilDate) {
      return NextResponse.json({ 
        error: 'validFrom must be before validUntil',
        code: 'INVALID_DATE_RANGE' 
      }, { status: 400 });
    }

    // Create new promotion
    const newPromotion = await db.insert(promotions)
      .values({
        salonId: parsedSalonId,
        title: title.trim(),
        description: description.trim(),
        discountPercentage: parsedDiscount,
        validFrom,
        validUntil,
        isActive,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newPromotion[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}