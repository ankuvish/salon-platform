import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { verification } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

// TODO: Implement rate limiting middleware
// - Maximum 3 OTP requests per hour per phone number
// - Consider using Redis or in-memory store for rate limit tracking
// - Add IP-based rate limiting as additional security layer

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // Validation: Check if phone is provided
    if (!phone) {
      return NextResponse.json(
        { 
          error: 'Phone number is required',
          code: 'MISSING_PHONE' 
        },
        { status: 400 }
      );
    }

    // Validation: Check if phone is a string and not empty after trimming
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      return NextResponse.json(
        { 
          error: 'Phone number is required',
          code: 'MISSING_PHONE' 
        },
        { status: 400 }
      );
    }

    // Validation: Check phone format - must match +[country code][number]
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      return NextResponse.json(
        { 
          error: 'Phone number must be in +[country code][number] format (e.g., +919876543210)',
          code: 'INVALID_PHONE_FORMAT' 
        },
        { status: 400 }
      );
    }

    // Validation: Check phone length (minimum 10 characters including +)
    if (trimmedPhone.length < 10) {
      return NextResponse.json(
        { 
          error: 'Phone number must be at least 10 characters',
          code: 'PHONE_TOO_SHORT' 
        },
        { status: 400 }
      );
    }

    // Validation: Check phone length (maximum 15 characters including +)
    if (trimmedPhone.length > 15) {
      return NextResponse.json(
        { 
          error: 'Phone number must be at most 15 characters',
          code: 'PHONE_TOO_LONG' 
        },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiration time (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Delete any existing OTP records for this phone number
    await db.delete(verification)
      .where(eq(verification.identifier, trimmedPhone));

    // Insert new verification record
    const verificationRecord = await db.insert(verification)
      .values({
        id: randomUUID(),
        identifier: trimmedPhone,
        value: otp,
        expiresAt: expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // TODO: In production, integrate SMS service (e.g., Twilio, AWS SNS)
    // Example Twilio integration:
    // await twilioClient.messages.create({
    //   body: `Your verification code is: ${otp}. Valid for 10 minutes.`,
    //   to: trimmedPhone,
    //   from: process.env.TWILIO_PHONE_NUMBER
    // });

    // Development response - includes OTP for testing
    // WARNING: Remove OTP from response in production
    return NextResponse.json(
      {
        message: 'OTP sent successfully',
        phone: trimmedPhone,
        otp: otp, // DEV ONLY - Remove in production
        expiresIn: '10 minutes',
        note: 'In production, OTP would be sent via SMS service (e.g., Twilio, AWS SNS). This response includes OTP for development purposes only.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST /api/auth/send-otp error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}