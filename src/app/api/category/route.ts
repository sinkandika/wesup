import { getCategories } from "@/src/server/services/category/category.service";

// GET CATEGORIES
export async function GET() {
  try {
    const result = await getCategories();

    if (!result.success) {
      return Response.json(result, { status: 500 });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Get category error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    )
  }
}