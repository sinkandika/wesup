import { requireRole } from "@/src/server/lib/auth";
import { getDailyTicket } from "@/src/server/services/ticket/ticket.service";
import { NextResponse } from "next/server";


// GET TECHNICIAN DAILY TICKET RECEIVED
export async function GET() {
  try {
    const user = await requireRole(["technician"]);

    const count = await getDailyTicket(user.id);

    return NextResponse.json({
      success: true,
      data: count,
    });

  } catch (error) {
    console.error("fetch daily tickets error", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch daily tickets",
      },
      { status: 500 }
    );
  }
}