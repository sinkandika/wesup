import { getAuthenticatedUser} from "@/src/server/lib/auth";
import { cancelUserTicket } from "@/src/server/services/ticket/ticket.service";
import { NextRequest, NextResponse } from "next/server";

// USER CANCEL TICKET
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Check user role
    if (user.role !== "user") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: user access required",
        },
        { status: 403 }
      );
    }

    // Get ticket id
    const { ticketId } = await params;

    // Get cancellation note
    const body = await request.json();
    const cancelNote = body.cancellationNote?.trim();

    if (typeof cancelNote !== "string" || !cancelNote) {
      return NextResponse.json({
        success: false,
        message: "Canncellation note is required"
      },
        { status:400 }
      );
    }

    if (cancelNote.length > 1000) {
      return NextResponse.json({
        success: false,
        message: "Cancellation cannot exceed more that 1000 character",
      },
        { status:400 }
      );
    }

    // cancel ticket
    const ticket = await cancelUserTicket(
      ticketId,
      user.id,
      cancelNote, // cancellationNote
    );

    return NextResponse.json({
      success: true,
      message: "Ticket cancelled!",
      data: ticket,
    });

  } catch (error) {
    console.error("cancel ticket error", error);

    return NextResponse.json({
      success: false,
      message:
        error instanceof Error
        ? error.message
        : "Failed to cancel ticket"
    },
    {status: 500}
    );
  }
}