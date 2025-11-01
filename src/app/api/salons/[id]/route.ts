import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { salons, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const salon = await db
      .select()
      .from(salons)
      .where(eq(salons.id, parseInt(id)))
      .limit(1);

    if (salon.length === 0) {
      return NextResponse.json(
        { error: 'Salon not found', code: 'SALON_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(salon[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingSalon = await db
      .select()
      .from(salons)
      .where(eq(salons.id, parseInt(id)))
      .limit(1);

    if (existingSalon.length === 0) {
      return NextResponse.json(
        { error: 'Salon not found', code: 'SALON_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      ownerId,
      name,
      description,
      address,
      city,
      latitude,
      longitude,
      phone,
      rating,
      imageUrl,
      openingTime,
      closingTime,
      salonType,
      gstNumber,
      isVerified,
      verificationDocuments,
    } = body;

    const updates: any = {};

    if (ownerId !== undefined) {
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

      if (owner[0].role !== 'owner') {
        return NextResponse.json(
          { error: 'User is not registered as an owner', code: 'NOT_OWNER_ROLE' },
          { status: 400 }
        );
      }

      updates.ownerId = ownerId.trim();
    }

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description.trim();
    if (address !== undefined) updates.address = address.trim();
    if (city !== undefined) updates.city = city.trim();
    if (latitude !== undefined) updates.latitude = latitude;
    if (longitude !== undefined) updates.longitude = longitude;
    if (phone !== undefined) updates.phone = phone.trim();
    if (rating !== undefined) updates.rating = rating;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl.trim();
    if (openingTime !== undefined) updates.openingTime = openingTime.trim();
    if (closingTime !== undefined) updates.closingTime = closingTime.trim();

    if (salonType !== undefined) {
      const validTypes = ['men', 'women', 'unisex'];
      if (!validTypes.includes(salonType)) {
        return NextResponse.json(
          { error: 'salonType must be one of: men, women, unisex', code: 'INVALID_SALON_TYPE' },
          { status: 400 }
        );
      }
      updates.salonType = salonType;
    }

    if (gstNumber !== undefined) updates.gstNumber = gstNumber.trim();
    if (isVerified !== undefined) updates.isVerified = isVerified;
    if (verificationDocuments !== undefined) updates.verificationDocuments = verificationDocuments;

    const updatedSalon = await db
      .update(salons)
      .set(updates)
      .where(eq(salons.id, parseInt(id)))
      .returning();

    if (updatedSalon.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update salon', code: 'UPDATE_FAILED' },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedSalon[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const existingSalon = await db
      .select()
      .from(salons)
      .where(eq(salons.id, parseInt(id)))
      .limit(1);

    if (existingSalon.length === 0) {
      return NextResponse.json(
        { error: 'Salon not found', code: 'SALON_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deletedSalon = await db
      .delete(salons)
      .where(eq(salons.id, parseInt(id)))
      .returning();

    if (deletedSalon.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete salon', code: 'DELETE_FAILED' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'Salon deleted successfully',
        salon: deletedSalon[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}