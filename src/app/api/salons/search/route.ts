import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { salons, services, staff } from '@/db/schema';
import { eq, like, or, and, inArray } from 'drizzle-orm';

interface SalonWithDetails {
  id: number;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  rating: number;
  imageUrl: string | null;
  openingTime: string;
  closingTime: string;
  salonType: string;
  gstNumber: string | null;
  isVerified: boolean;
  verificationDocuments: any;
  createdAt: string;
  distance?: number;
  services: Array<{
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
  }>;
  staff: Array<{
    id: number;
    name: string;
    specialization: string;
    avatarUrl: string | null;
  }>;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const latStr = url.searchParams.get('latitude');
    const lngStr = url.searchParams.get('longitude');
    const radiusStr = url.searchParams.get('radius');
    const limitStr = url.searchParams.get('limit');

    let latitude: number | null = null;
    let longitude: number | null = null;

    // Parse coordinates if provided
    if (latStr && lngStr) {
      latitude = parseFloat(latStr);
      longitude = parseFloat(lngStr);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json({
          error: 'Latitude and longitude must be valid numbers',
          code: 'INVALID_LOCATION_FORMAT'
        }, { status: 400 });
      }

      if (latitude < -90 || latitude > 90) {
        return NextResponse.json({
          error: 'Latitude must be between -90 and 90',
          code: 'INVALID_LATITUDE'
        }, { status: 400 });
      }

      if (longitude < -180 || longitude > 180) {
        return NextResponse.json({
          error: 'Longitude must be between -180 and 180',
          code: 'INVALID_LONGITUDE'
        }, { status: 400 });
      }
    } else if (latStr || lngStr) {
      return NextResponse.json({
        error: 'Both latitude and longitude must be provided together',
        code: 'INCOMPLETE_LOCATION'
      }, { status: 400 });
    }

    // Require at least one search criterion
    if (!q && latitude === null) {
      return NextResponse.json({
        error: 'At least one search criteria must be provided (q or latitude/longitude)',
        code: 'MISSING_SEARCH_CRITERIA'
      }, { status: 400 });
    }

    const radius = radiusStr ? parseFloat(radiusStr) : 10;
    if (isNaN(radius) || radius < 0.1 || radius > 50) {
      return NextResponse.json({
        error: 'Radius must be between 0.1 and 50 km',
        code: 'INVALID_RADIUS'
      }, { status: 400 });
    }

    const limit = limitStr ? parseInt(limitStr) : 20;
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json({
        error: 'Limit must be between 1 and 100',
        code: 'INVALID_LIMIT'
      }, { status: 400 });
    }

    let matchingSalonIds = new Set<number>();

    if (q) {
      const searchTerm = q.trim();

      const salonMatches = await db.select({ id: salons.id })
        .from(salons)
        .where(
          or(
            like(salons.name, `%${searchTerm}%`),
            like(salons.city, `%${searchTerm}%`),
            like(salons.zipCode, `%${searchTerm}%`)
          )
        );

      salonMatches.forEach(salon => matchingSalonIds.add(salon.id));

      const serviceMatches = await db.select({ salonId: services.salonId })
        .from(services)
        .where(like(services.name, `%${searchTerm}%`));

      serviceMatches.forEach(service => matchingSalonIds.add(service.salonId));

      const staffMatches = await db.select({ salonId: staff.salonId })
        .from(staff)
        .where(like(staff.name, `%${searchTerm}%`));

      staffMatches.forEach(staffMember => matchingSalonIds.add(staffMember.salonId));

      if (matchingSalonIds.size === 0 && latitude === null) {
        return NextResponse.json([]);
      }
    }

    let salonResults;
    
    if (matchingSalonIds.size > 0) {
      salonResults = await db.select()
        .from(salons)
        .where(inArray(salons.id, Array.from(matchingSalonIds)));
    } else if (latitude !== null && longitude !== null) {
      salonResults = await db.select().from(salons);
    } else {
      return NextResponse.json([]);
    }

    const processedSalons: SalonWithDetails[] = [];

    for (const salon of salonResults) {
      const salonServices = await db.select({
        id: services.id,
        name: services.name,
        price: services.price,
        durationMinutes: services.durationMinutes
      })
        .from(services)
        .where(eq(services.salonId, salon.id));

      const salonStaff = await db.select({
        id: staff.id,
        name: staff.name,
        specialization: staff.specialization,
        avatarUrl: staff.avatarUrl
      })
        .from(staff)
        .where(eq(staff.salonId, salon.id));

      let distance: number | undefined = undefined;
      
      if (latitude !== null && longitude !== null) {
        if (salon.latitude !== null && salon.longitude !== null) {
          distance = calculateDistance(latitude, longitude, salon.latitude, salon.longitude);
          distance = Math.round(distance * 100) / 100;

          if (distance > radius) {
            continue;
          }
        } else {
          continue;
        }
      }

      const salonWithDetails: SalonWithDetails = {
        id: salon.id,
        ownerId: salon.ownerId,
        name: salon.name,
        description: salon.description,
        address: salon.address,
        city: salon.city,
        zipCode: salon.zipCode,
        latitude: salon.latitude,
        longitude: salon.longitude,
        phone: salon.phone,
        rating: salon.rating,
        imageUrl: salon.imageUrl,
        openingTime: salon.openingTime,
        closingTime: salon.closingTime,
        salonType: salon.salonType,
        gstNumber: salon.gstNumber,
        isVerified: salon.isVerified,
        verificationDocuments: salon.verificationDocuments,
        createdAt: salon.createdAt,
        services: salonServices,
        staff: salonStaff
      };

      if (distance !== undefined) {
        salonWithDetails.distance = distance;
      }

      processedSalons.push(salonWithDetails);
    }

    if (latitude !== null && longitude !== null) {
      processedSalons.sort((a, b) => {
        const distA = a.distance ?? Infinity;
        const distB = b.distance ?? Infinity;
        return distA - distB;
      });
    } else {
      processedSalons.sort((a, b) => b.rating - a.rating);
    }

    const limitedResults = processedSalons.slice(0, limit);

    return NextResponse.json(limitedResults);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}