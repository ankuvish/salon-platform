import { NextRequest, NextResponse } from "next/server";
import { notificationService } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Missing required fields: type, data" },
        { status: 400 }
      );
    }

    let result;

    switch (type) {
      case "booking_confirmation":
        result = await notificationService.sendBookingConfirmation(data);
        break;
      case "booking_reminder":
        result = await notificationService.sendBookingReminder(data);
        break;
      case "booking_cancellation":
        result = await notificationService.sendBookingCancellation(data);
        break;
      case "booking_reschedule":
        result = await notificationService.sendBookingReschedule(data);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Notification API error:", error);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}