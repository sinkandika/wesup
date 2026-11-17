
import { requireRole } from "@/src/server/lib/auth";
import { cancelTechnicianTicket } from "@/src/server/services/ticket/ticket.service";
import { NextRequest, NextResponse } from "next/server";

// TECHNICIAN CANCEL TICKET
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const technician = await requireRole(["technician"]);
    // get ticket id
    const { ticketId } = await params;

    const body = await request.json();
    const { cancellationNote } = body;

    if (
      !cancellationNote ||
      typeof cancellationNote !== "string" ||
      !cancellationNote.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cancellation note is required",
        },
        { status: 400 }
      );
    }

    const result = await cancelTechnicianTicket(
      ticketId,
      technician.id,
      cancellationNote.trim()
    );

    return NextResponse.json({
      success: true,
      message: "Ticket cancelled successfully",
      data: result,
    });
  } catch (error) {
    console.error("Cancel ticket error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to cancel ticket",
      },
      { status: 500 }
    );
  }
}
