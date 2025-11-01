import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { salons } from '@/db/schema';
import { eq, gte, and } from 'drizzle-orm';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract and validate required parameters
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    
    if (!latParam || !lngParam) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required', code: 'MISSING_COORDINATES' },
        { status: 400 }
      );
    }
    
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);
    
    // Validate latitude
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return NextResponse.json(
        { error: 'Latitude must be between -90 and 90', code: 'INVALID_LATITUDE' },
        { status: 400 }
      );
    }
    
    // Validate longitude
    if (isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Longitude must be between -180 and 180', code: 'INVALID_LONGITUDE' },
        { status: 400 }
      );
    }
    
    // Extract and validate optional parameters
    const radiusParam = searchParams.get('radius');
    const radius = radiusParam ? parseFloat(radiusParam) : 5;
    
    if (isNaN(radius) || radius < 0.1 || radius > 50) {
      return NextResponse.json(
        { error: 'Radius must be between 0.1 and 50 km', code: 'INVALID_RADIUS' },
        { status: 400 }
      );
    }
    
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam), 100) : 20;
    
    const salonType = searchParams.get('salonType');
    if (salonType && !['men', 'women', 'unisex'].includes(salonType)) {
      return NextResponse.json(
        { error: 'Salon type must be men, women, or unisex', code: 'INVALID_SALON_TYPE' },
        { status: 400 }
      );
    }
    
    const verifiedParam = searchParams.get('verified');
    const verified = verifiedParam !== null ? verifiedParam === 'true' : null;
    
    const minRatingParam = searchParams.get('minRating');
    let minRating: number | null = null;
    if (minRatingParam) {
      minRating = parseFloat(minRatingParam);
      if (isNaN(minRating) || minRating < 0 || minRating > 5) {
        return NextResponse.json(
          { error: 'Minimum rating must be between 0 and 5', code: 'INVALID_RATING' },
          { status: 400 }
        );
      }
    }
    
    // Build query with filters
    const conditions = [];
    
    if (salonType) {
      conditions.push(eq(salons.salonType, salonType));
    }
    
    if (verified !== null) {
      conditions.push(eq(salons.isVerified, verified));
    }
    
    if (minRating !== null) {
      conditions.push(gte(salons.rating, minRating));
    }
    
    // Query database with filters
    let query = db.select().from(salons);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const allSalons = await query;
    
    // Filter salons with valid coordinates and calculate distances
    const salonsWithDistance = allSalons
      .filter(salon => salon.latitude !== null && salon.longitude !== null)
      .map(salon => {
        const distance = calculateDistance(
          lat,
          lng,
          salon.latitude!,
          salon.longitude!
        );
        
        return {
          ...salon,
          distance: Math.round(distance * 100) / 100 // Round to 2 decimals
        };
      })
      .filter(salon => salon.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
    
    return NextResponse.json(salonsWithDistance, { status: 200 });
    
  } catch (error) {
    console.error('GET nearby salons error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}