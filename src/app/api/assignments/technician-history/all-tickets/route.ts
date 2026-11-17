import { requireRole } from "@/src/server/lib/auth";
import { getAllTicketsReceived } from "@/src/server/services/ticket/ticket.service";
import { NextResponse } from "next/server";


// GET ALL TICKETS ASSIGNMENT RECEIVED
export async function GET() {
  try {
    const user = await requireRole(["technician"]);

    const count = await getAllTicketsReceived(user.id);

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