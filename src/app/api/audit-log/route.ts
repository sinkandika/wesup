import { requireRole } from "@/src/server/lib/auth";
import { getAuditLogs } from "@/src/server/services/audit-log/audit.log.service";
import { NextRequest, NextResponse } from "next/server";

// GET AUDIT LOGS
export async function GET(request: NextRequest) {
  try {
    await requireRole(["supervisor", "admin"]);

    const { searchParams } = request.nextUrl;

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);

    if (
      !Number.isInteger(page) ||
      !Number.isInteger(limit) ||
      page < 1 ||
      limit < 1
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid pagination parameters",
        },
        { status: 400 }
      );
    }

    const result = await getAuditLogs(page, limit);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get audit logs API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve audit logs",
      },
      { status: 500 }
    );
  }
}
