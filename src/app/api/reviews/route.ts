import { getCurrentUser } from "@/src/server/services/auth/auth.service";
import { getReviewTicket } from "@/src/server/services/ticket/ticket.service";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// TICKET WITH ASSIGNMENT STATUS "on_review"
export async function GET() {
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
  
      // Check supervisor role
      if (user.role !== "supervisor") {
        return NextResponse.json(
          {
            success: false,
            message: "Forbidden: supervisor access required",
          },
          { status: 403 }
        );
      }

      // response
      const reviews = await getReviewTicket();

      return NextResponse.json({
        success: true,
        reviews, 
      })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to get on review ticket";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}