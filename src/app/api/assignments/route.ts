import { requireRole } from "@/src/server/lib/auth";
import { getWaitingTickets } from "@/src/server/services/ticket/ticket.service";
import { NextResponse } from "next/server";

// GET TICKET WITH STATUS "waiting"
export async function GET() {

  try {
    const user = await requireRole(["technician"]);

    const ticket = await getWaitingTickets(user.id);

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("fetch ticket error", error);

    return NextResponse.json({
      success: false,
      message:
        error instanceof Error
        ? error.message
        : "Failed to fetch ticket"
    },
    {status: 500}
    );
  }
  
}