import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verification, user, session } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, name, email, gender, role } = body;

    // Validation: Check required fields
    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required', code: 'MISSING_PHONE' },
        { status: 400 }
      );
    }

    if (!otp) {
      return NextResponse.json(
        { error: 'OTP is required', code: 'MISSING_OTP' },
        { status: 400 }
      );
    }

    // Validation: OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits', code: 'INVALID_OTP_FORMAT' },
        { status: 400 }
      );
    }

    // Validation: Gender if provided
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      return NextResponse.json(
        { error: 'Gender must be one of: male, female, other', code: 'INVALID_GENDER' },
        { status: 400 }
      );
    }

    // Validation: Role if provided
    if (role && !['customer', 'owner'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be one of: customer, owner', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    // Step 1: Verify OTP
    const verificationRecords = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.identifier, phone),
          eq(verification.value, otp)
        )
      )
      .limit(1);

    if (verificationRecords.length === 0) {
      // Check if there's any verification for this phone
      const anyVerification = await db
        .select()
        .from(verification)
        .where(eq(verification.identifier, phone))
        .limit(1);

      if (anyVerification.length === 0) {
        return NextResponse.json(
          { error: 'No OTP found for this phone number', code: 'OTP_NOT_FOUND' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'OTP is incorrect', code: 'INVALID_OTP' },
        { status: 400 }
      );
    }

    const verificationRecord = verificationRecords[0];

    // Check if OTP is expired
    if (new Date() > new Date(verificationRecord.expiresAt)) {
      return NextResponse.json(
        { error: 'OTP has expired, please request a new one', code: 'OTP_EXPIRED' },
        { status: 400 }
      );
    }

    // Step 2: Check if user exists with this phone number
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.phone, phone))
      .limit(1);

    let currentUser;
    let isNewUser = false;

    if (existingUsers.length > 0) {
      // User exists - use existing record
      currentUser = existingUsers[0];
    } else {
      // New user - validate name is provided
      if (!name) {
        return NextResponse.json(
          { error: 'Name is required for new users', code: 'NAME_REQUIRED' },
          { status: 400 }
        );
      }

      // Create new user
      isNewUser = true;
      const userId = randomUUID();
      const userEmail = email || `user_${randomUUID().substring(0, 8)}@temp.com`;
      
      const newUsers = await db
        .insert(user)
        .values({
          id: userId,
          name: name.trim(),
          email: userEmail.toLowerCase(),
          emailVerified: false,
          role: role || 'customer',
          phone: phone,
          gender: gender || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      currentUser = newUsers[0];
    }

    // Step 3: Create session
    const sessionToken = randomUUID();
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const newSessions = await db
      .insert(session)
      .values({
        id: randomUUID(),
        userId: currentUser.id,
        token: sessionToken,
        expiresAt: sessionExpiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: ipAddress,
        userAgent: userAgent,
      })
      .returning();

    // Step 4: Delete used OTP verification record
    await db
      .delete(verification)
      .where(eq(verification.id, verificationRecord.id));

    // Return success response
    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone,
          role: currentUser.role,
          gender: currentUser.gender,
        },
        token: sessionToken,
        expiresAt: sessionExpiresAt,
        isNewUser: isNewUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/auth/verify-otp error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}