import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { salons, services, user } from '@/db/schema';
import { eq, like, gte, and, or, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const city = searchParams.get('city');
    const minRating = searchParams.get('minRating');
    const serviceType = searchParams.get('serviceType');
    const salonType = searchParams.get('salonType'); // Added: men/women/unisex filter
    const verified = searchParams.get('verified'); // Added: verified filter
    const featured = searchParams.get('featured'); // Added: featured filter

    let query = db.select().from(salons);
    const conditions = [];

    // Search by name
    if (search) {
      conditions.push(like(salons.name, `%${search}%`));
    }

    // Filter by city
    if (city) {
      conditions.push(eq(salons.city, city));
    }

    // Filter by minimum rating
    if (minRating) {
      const rating = parseFloat(minRating);
      if (!isNaN(rating)) {
        conditions.push(gte(salons.rating, rating));
      }
    }

    // Filter by salon type
    if (salonType) {
      const validTypes = ['men', 'women', 'unisex'];
      if (validTypes.includes(salonType)) {
        conditions.push(eq(salons.salonType, salonType));
      }
    }

    // Filter by verified status
    if (verified !== null && verified !== undefined) {
      const isVerified = verified === 'true';
      conditions.push(eq(salons.isVerified, isVerified));
    }

    // Filter by featured status
    if (featured !== null && featured !== undefined) {
      const isFeatured = featured === 'true';
      conditions.push(eq(salons.isFeatured, isFeatured));
    }

    // Filter by service type - requires joining with services table
    if (serviceType) {
      const salonsWithService = await db
        .select({ salonId: services.salonId })
        .from(services)
        .where(like(services.name, `%${serviceType}%`));
      
      const salonIds = salonsWithService.map(s => s.salonId);
      
      if (salonIds.length > 0) {
        const salonIdConditions = salonIds.map(id => eq(salons.id, id));
        conditions.push(or(...salonIdConditions));
      } else {
        // No salons found with this service type
        return NextResponse.json([]);
      }
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(salons.rating))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      ownerId,
      name,
      description,
      address,
      city,
      phone,
      openingTime,
      closingTime,
      latitude,
      longitude,
      imageUrl,
      salonType,
      gstNumber,
      verificationDocuments,
    } = body;

    // Validate required fields
    if (!ownerId) {
      return NextResponse.json(
        { error: 'Owner ID is required', code: 'MISSING_OWNER_ID' },
        { status: 400 }
      );
    }

    // Validate ownerId exists in user table - now text type
    const owner = await db
      .select()
      .from(user)
      .where(eq(user.id, ownerId))
      .limit(1);

    if (owner.length === 0) {
      return NextResponse.json(
        { error: 'Owner not found', code: 'OWNER_NOT_FOUND' },
        { status: 400 }
      );
    }

    // Validate owner has 'owner' role
    if (owner[0].role !== 'owner') {
      return NextResponse.json(
        { error: 'User is not registered as an owner', code: 'NOT_OWNER_ROLE' },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Salon name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (!address || !address.trim()) {
      return NextResponse.json(
        { error: 'Address is required', code: 'MISSING_ADDRESS' },
        { status: 400 }
      );
    }

    if (!city || !city.trim()) {
      return NextResponse.json(
        { error: 'City is required', code: 'MISSING_CITY' },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone is required', code: 'MISSING_PHONE' },
        { status: 400 }
      );
    }

    if (!openingTime || !openingTime.trim()) {
      return NextResponse.json(
        { error: 'Opening time is required', code: 'MISSING_OPENING_TIME' },
        { status: 400 }
      );
    }

    if (!closingTime || !closingTime.trim()) {
      return NextResponse.json(
        { error: 'Closing time is required', code: 'MISSING_CLOSING_TIME' },
        { status: 400 }
      );
    }

    // Validate salonType if provided
    if (salonType) {
      const validTypes = ['men', 'women', 'unisex'];
      if (!validTypes.includes(salonType)) {
        return NextResponse.json(
          { error: 'salonType must be one of: men, women, unisex', code: 'INVALID_SALON_TYPE' },
          { status: 400 }
        );
      }
    }

    // Prepare insert data
    const insertData: any = {
      ownerId: ownerId.trim(), // Changed: ownerId is now text
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      phone: phone.trim(),
      openingTime: openingTime.trim(),
      closingTime: closingTime.trim(),
      rating: 0,
      salonType: salonType || 'unisex',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (latitude !== undefined && latitude !== null) {
      insertData.latitude = parseFloat(latitude);
    }

    if (longitude !== undefined && longitude !== null) {
      insertData.longitude = parseFloat(longitude);
    }

    if (imageUrl && imageUrl.trim()) {
      insertData.imageUrl = imageUrl.trim();
    }

    if (gstNumber && gstNumber.trim()) {
      insertData.gstNumber = gstNumber.trim();
    }

    if (verificationDocuments) {
      insertData.verificationDocuments = verificationDocuments;
    }

    const newSalon = await db.insert(salons).values(insertData).returning();

    return NextResponse.json(newSalon[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}