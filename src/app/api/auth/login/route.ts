import { loginUser } from "@/src/server/services/auth/auth.service";

// POST LOGIN
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = await loginUser(body);

    if (!result.success || !result.data) {
      return Response.json(result, { status: 401 });
    }

    const response = Response.json(
      {
        success: true,
        message: result.message,
        data: {
          user: result.data.user,
        },
      },
      { status: 200 }
    );

    response.headers.append(
      "Set-Cookie",
      `token=${result.data.token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax`
    );

    return response;
  } catch (error) {
    console.error("Login route error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}