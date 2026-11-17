import { getDepartment } from "@/src/server/services/department/department.service";

// GET DEPARTMENT
export async function GET() {
  try {
    const result = await getDepartment();

    if (!result.success) {
      return Response.json(result, { status: 500 });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Get department error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}