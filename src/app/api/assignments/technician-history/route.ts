import { requireRole } from "@/src/server/lib/auth";
import { getTechnicianHistory } from "@/src/server/services/ticket/ticket.service";
import { NextResponse } from "next/server";

// GET TECHNICIAN HISTORY BY ID
export async function GET() {
  try {
    const user = await requireRole(["technician"]);

    const history = await getTechnicianHistory(user.id);

    return NextResponse.json({
      success: true,
      data: history,
    });
    
  } catch (error) {
    console.error("fetch ticket error", error);

    return NextResponse.json({
      success: false,
      message:
        error instanceof Error
        ? error.message
        : "Failed to fetch ticket"
    },
    {status: 500}
    );
  }
  
}