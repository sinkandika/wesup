import { getCurrentUser } from "@/src/server/services/auth/auth.service";
import { getTicketDetails } from "@/src/server/services/ticket/ticket.service";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// GET TICKET DETAILS BY ID
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Get JWT token from cookie
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        );
      }

      // Get current user
      const authResult = await getCurrentUser(token);

      if (!authResult.success) {
        return NextResponse.json(
          {
            success: false,
            message: authResult.message,
          },
          { status: 401 }
        );
      }

      const user = authResult.data.user;
    
    // get ticket id from the URL
    const { ticketId } = await params;
    
    const ticket = await getTicketDetails(ticketId);

    return NextResponse.json({
      success: true,
      message: "Ticket details retrieved successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("ticket retrieved error", error);

    return NextResponse.json({
      success: false,
      message:
        error instanceof Error
        ? error.message
        : "Failed to retrieved ticket"
    },
    {status: 500}
    );
  }
}