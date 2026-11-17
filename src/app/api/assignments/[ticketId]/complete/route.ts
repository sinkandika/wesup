import { requireRole } from "@/src/server/lib/auth";
import { completeTicket } from "@/src/server/services/ticket/ticket.service";
import { NextRequest, NextResponse } from "next/server";

// TECHNICIAN COMPLETE TICKET
export async function POST(
  request:NextRequest,
  { params }: { params: Promise<{ ticketId: string }>}
) {
  try {
    const user = await requireRole(["technician"]);

    // get ticket ID and request body
    const { ticketId } = await params;
    const body = await request.json();

    const technicianNote = 
    typeof body.technicianNote === "string"
      ? body.technicianNote
      : null;
    
    // complete the ticket
    const result = await completeTicket(
      ticketId,
      user.id,
      technicianNote
    );

    return NextResponse.json({
      success: true,
      message: "Ticket submitted for supervisor review",
      data: result,
    });

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to complettet ticket";
    
    const status = 
      message === "Ticket is not available for completion" ||
      message === "No active assignment found for this technician" ||
      message === "Assignment has already been updated"
        ? 409
        : 500;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status }
    );
  }
  
}