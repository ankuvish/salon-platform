import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, session, account } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation: Check required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    // Step 1: Find user by email
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.email, email.toLowerCase()))
      .limit(1);

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    const currentUser = existingUsers[0];

    // Step 2: Get account with password from account table
    const userAccount = await db
      .select()
      .from(account)
      .where(eq(account.userId, currentUser.id))
      .limit(1);

    if (userAccount.length === 0 || !userAccount[0].password) {
      return NextResponse.json(
        { error: 'This account does not have a password set. Please use OTP login.', code: 'NO_PASSWORD' },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, userAccount[0].password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    // Step 3: Create session
    const sessionToken = randomUUID();
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await db
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
      });

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
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/auth/login-email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}