import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/src/server/services/auth/auth.service";
import { acceptTicket } from "@/src/server/services/ticket/ticket.service";
import { requireRole } from "@/src/server/lib/auth";


// TECHNICIAN ACCEPT TICKET
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const user = await requireRole(["technician"]);

    // Get ticket ID from route params
    const { ticketId } = await params;

    // Accept ticket
    const assignment = await acceptTicket(ticketId, user.id);

    return NextResponse.json({
      success: true,
      message: "Ticket accepted successfully",
      data: assignment,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to accept ticket";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}