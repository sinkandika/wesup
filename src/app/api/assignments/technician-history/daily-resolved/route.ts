import { requireRole } from "@/src/server/lib/auth";
import { getDailyResolvedTicket } from "@/src/server/services/ticket/ticket.service";
import { NextResponse } from "next/server";

// GET TECHNICIAN DAILY TICKET RESOLVED
export async function GET() {
  try {
    const user = await requireRole(["technician"]);

    const result = await getDailyResolvedTicket(user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Failed to fetch daily resolved tickets:", error);

    return NextResponse.json({
      success: false,
      message: error instanceof Error
        ? error.message
        : "Failed to fetch daily resolved tickets",
    }, { status: 500 });
  }
}