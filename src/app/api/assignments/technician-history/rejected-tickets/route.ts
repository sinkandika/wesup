import { requireRole } from "@/src/server/lib/auth";
import { getRejectedTicket } from "@/src/server/services/ticket/ticket.service";
import { NextResponse } from "next/server";

// GET TECHNICIAN REJECTED TICKET RECEIVED
export async function GET() {

  try {
    const user = await requireRole(["technician"])
    const count = await getRejectedTicket(user.id);

  return NextResponse.json({
    success: true,
    data: count,
  });

  } catch (error) {
    console.error("fetch all tickets error", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch all tickets",
      },
      { status: 500 }
    );
  }
}