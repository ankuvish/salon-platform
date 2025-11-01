import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { account } from '@/db/schema';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'User ID is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { 
          error: 'Password is required',
          code: 'MISSING_PASSWORD'
        },
        { status: 400 }
      );
    }

    // Validate password strength (optional but recommended)
    if (password.length < 8) {
      return NextResponse.json(
        { 
          error: 'Password must be at least 8 characters long',
          code: 'WEAK_PASSWORD'
        },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if account exists for this userId
    const existingAccount = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId))
      .limit(1);

    let result;

    if (existingAccount.length > 0) {
      // Update existing account
      const updated = await db
        .update(account)
        .set({
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(account.userId, userId))
        .returning();

      if (updated.length === 0) {
        console.error('POST set-password error: Failed to update account password');
        return NextResponse.json(
          { 
            error: 'Failed to update password',
            code: 'UPDATE_FAILED'
          },
          { status: 500 }
        );
      }

      result = updated[0];
    } else {
      // Create new account record
      const newAccount = await db
        .insert(account)
        .values({
          id: randomUUID(),
          accountId: userId,
          providerId: 'credential',
          userId: userId,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      if (newAccount.length === 0) {
        console.error('POST set-password error: Failed to create account');
        return NextResponse.json(
          { 
            error: 'Failed to create account',
            code: 'CREATE_FAILED'
          },
          { status: 500 }
        );
      }

      result = newAccount[0];
    }

    // Return success response (excluding sensitive password data)
    return NextResponse.json(
      {
        success: true,
        message: 'Password set successfully',
        account: {
          id: result.id,
          userId: result.userId,
          providerId: result.providerId,
          accountId: result.accountId
        }
      },
      { status: existingAccount.length > 0 ? 200 : 201 }
    );

  } catch (error) {
    console.error('POST set-password error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error
      },
      { status: 500 }
    );
  }
}