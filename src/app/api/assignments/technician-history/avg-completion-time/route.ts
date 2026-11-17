import { requireRole } from "@/src/server/lib/auth";
import { getAverageCompletionTime } from "@/src/server/services/ticket/ticket.service";
import { NextResponse } from "next/server";


// GET TECHNICIAN AVERAGE COMPLETION TIME
export async function GET() {
  try {
    const user = await requireRole(["technician"]);

    const averageTime = await getAverageCompletionTime(user.id);

    return NextResponse.json({
      success: true,
      data: averageTime,
    });

  } catch (error) {
    console.error("fetch average completion time error", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch average completion time",
      },
      { status: 500 }
    );
  }
}