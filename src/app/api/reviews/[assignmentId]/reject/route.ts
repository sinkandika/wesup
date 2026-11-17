import { requireRole } from "@/src/server/lib/auth";
import { rejectTicket } from "@/src/server/services/ticket/ticket.service";
import { NextRequest, NextResponse } from "next/server";

// SUPERVISOR REJECT THE TICKET
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }>}
) {
  try {
    const user = await requireRole(["supervisor"]);

    // response
    const { assignmentId } = await params;

    const body = await request.json();
    const { supervisorNote } = body;

    await rejectTicket(
      assignmentId, 
      user.id,
      supervisorNote
    );

    return NextResponse.json({
      success: true,
      message: "Ticket rejected!"
    })

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to reject ticket";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}