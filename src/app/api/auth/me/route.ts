import { getCurrentUser } from "@/src/server/services/auth/auth.service";

// GET CURRENT USER
export async function GET(request: Request) {
  try {
    // Get Cookie header
    const cookieHeader = request.headers.get("cookie");

    if (!cookieHeader) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    // Find token inside cookies
    const token = cookieHeader
      .split(";")
      .find((cookie) => cookie.trim().startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return Response.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const result = await getCurrentUser(token);

    if (!result.success) {
      return Response.json(result, { status: 401 });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Auth me route error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}