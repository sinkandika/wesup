import { requireRole } from "@/src/server/lib/auth";
import { approveTicket } from "@/src/server/services/ticket/ticket.service";
import { NextRequest, NextResponse } from "next/server";

// SUPERVISOR APPROVE
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

    await approveTicket(
      assignmentId, 
      user.id,
      supervisorNote,
    );

    return NextResponse.json({
      success: true,
      message: "Ticket approved!"
    });

  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to approve ticket";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}