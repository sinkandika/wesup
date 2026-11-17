import { registerUser } from "@/src/server/services/auth/auth.service";

// POST REGISTER
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const image = formData.get("image") as File | null;

    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      phoneNumber: formData.get("phoneNumber") as string,
      employeeId: formData.get("employeeId") as string,
      role: formData.get("role") as string,
      departmentId: formData.get("departmentId") as string,
      positionId: formData.get("positionId") as string,
      image,
    };

    const result = await registerUser(data);

    if (!result.success) {
      return Response.json(result, { status: 400 });
    }

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error("Register route error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}