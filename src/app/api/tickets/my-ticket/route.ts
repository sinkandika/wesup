import { requireRole } from "@/src/server/lib/auth"
import { getMyTicket } from "@/src/server/services/ticket/ticket.service";
import { NextResponse } from "next/server";

// GET ALL TICKET BY USER ID
export async function GET() {
  try {
    const user = await requireRole(["user", "supervisor"]);

    const tickets = await getMyTicket(user.id);

    return NextResponse.json({
      success: true,
      message: "My tickets retrieved success",
      data: tickets
    });

  } catch(error) {
    console.error("Get my ticket error:", error);

    return NextResponse.json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to retrieved my tickets",
    },
      { status: 500 }
    )
  }
}