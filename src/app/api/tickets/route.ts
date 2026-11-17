import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/src/server/services/auth/auth.service";
import { createTicket } from "@/src/server/services/ticket/ticket.service";

// CREATE TICKET
export async function POST(request: NextRequest) {
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

    // Read form data
    const formData = await request.formData();

    const locationId = formData.get("locationId");
    const departmentId = formData.get("departmentId");
    const priority = formData.get("priority") || "normal";
    const itemsValue = formData.get("items");

    if (
      typeof locationId !== "string" ||
      typeof departmentId !== "string" ||
      typeof itemsValue !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required ticket information",
        },
        { status: 400 }
      );
    }

    // Parse items
    const parsedItems: unknown = JSON.parse(itemsValue);

    if (
      !Array.isArray(parsedItems) ||
      parsedItems.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "At least one ticket item is required",
        },
        { status: 400 }
      );
    }

    // Convert image files into buffers
    const items = await Promise.all(
      parsedItems.map(async (item, index) => {
        const images = formData
          .getAll(`images-${index}`)
          .filter((file): file is File => file instanceof File);

        const imageBuffers = await Promise.all(
          images.map(async (file) =>
            Buffer.from(await file.arrayBuffer())
          )
        );

        return {
          categoryId: item.categoryId,
          title: item.title,
          description: item.description,
          images: imageBuffers,
        };
      })
    );

    // Create ticket
    const result = await createTicket({
      userId: user.id,
      locationId,
      departmentId,
      priority: priority as
        | "low"
        | "normal"
        | "high"
        | "urgent",
      items,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Ticket created successfully",
        data: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create ticket error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create ticket",
      },
      { status: 500 }
    );
  }
}