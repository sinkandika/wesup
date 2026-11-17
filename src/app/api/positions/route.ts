import { getPositions } from "@/src/server/services/position/position.service";

// GET POSITION
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const departmentId = searchParams.get("departmentId") || undefined;

    const result = await getPositions(departmentId);

    if (!result.success) {
      return Response.json(result, { status: 500 });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Get positions error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}