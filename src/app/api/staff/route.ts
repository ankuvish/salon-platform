import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { staff, salons } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const salonId = searchParams.get('salon_id') || searchParams.get('salonId');
    
    // Validate required salonId parameter
    if (!salonId) {
      return NextResponse.json({ 
        error: 'Salon ID is required',
        code: 'MISSING_SALON_ID' 
      }, { status: 400 });
    }

    const parsedSalonId = parseInt(salonId);
    if (isNaN(parsedSalonId)) {
      return NextResponse.json({ 
        error: 'Valid Salon ID is required',
        code: 'INVALID_SALON_ID' 
      }, { status: 400 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = db.select().from(staff).where(eq(staff.salonId, parsedSalonId));

    if (search) {
      query = query.where(
        and(
          eq(staff.salonId, parsedSalonId),
          or(
            like(staff.name, `%${search}%`),
            like(staff.specialization, `%${search}%`)
          )
        )
      );
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
    const { salonId, name, specialization, avatarUrl } = body;

    // Validate required fields
    if (!salonId) {
      return NextResponse.json({ 
        error: 'Salon ID is required',
        code: 'MISSING_SALON_ID' 
      }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Name is required',
        code: 'MISSING_NAME' 
      }, { status: 400 });
    }

    if (!specialization || typeof specialization !== 'string' || specialization.trim() === '') {
      return NextResponse.json({ 
        error: 'Specialization is required',
        code: 'MISSING_SPECIALIZATION' 
      }, { status: 400 });
    }

    // Validate salonId is a valid number
    const parsedSalonId = parseInt(salonId);
    if (isNaN(parsedSalonId)) {
      return NextResponse.json({ 
        error: 'Valid Salon ID is required',
        code: 'INVALID_SALON_ID' 
      }, { status: 400 });
    }

    // Validate salonId exists in salons table
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

    // Prepare insert data with auto-generated fields
    const insertData = {
      salonId: parsedSalonId,
      name: name.trim(),
      specialization: specialization.trim(),
      avatarUrl: avatarUrl ? avatarUrl.trim() : null,
      createdAt: new Date().toISOString()
    };

    // Insert new staff member
    const newStaff = await db.insert(staff)
      .values(insertData)
      .returning();

    return NextResponse.json(newStaff[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}