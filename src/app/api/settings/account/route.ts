import { requireAuth } from "@/src/server/lib/auth";
import { getAccountDetail, UpdateAccountData, UpdateAccountDetail } from "@/src/server/services/account/account.service";
import { NextRequest, NextResponse } from "next/server";

// GET USER BY ID
export async function GET() {
  try {
    const user = await requireAuth();

    const account = await getAccountDetail(user.id);

    return NextResponse.json({
      success: true,
      data: account,
    });
    
  } catch (error) {
    console.error("fetch account detail error:", error)

    return NextResponse.json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch account detail"
    },
    {status: 500}
    )
  }
};

// UPDATE USER
export async function PATCH(request: NextRequest) {
  const user = await requireAuth();

  try {
    const formData = await request.formData();

    const updateData: UpdateAccountData = {};

    // First name
    if (formData.has("firstName")) {
      const firstName = formData.get("firstName");

      if (typeof firstName !== "string" || !firstName.trim()) {
        return NextResponse.json(
          {
            success: false,
            message: "First name cannot be empty"
          },
          { status: 400 }
        );
      }

      updateData.firstName = firstName.trim();
    }

    // Last name
    if (formData.has("lastName")) {
      const lastName = formData.get("lastName");

      if (typeof lastName !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid last name"
          },
          { status: 400 }
        );
      }

      updateData.lastName = lastName.trim() || null;
    }

    // Phone number
    if (formData.has("phoneNumber")) {
      const phoneNumber = formData.get("phoneNumber");

      if (typeof phoneNumber !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid phone number"
          },
          { status: 400 }
        );
      }

      updateData.phoneNumber = phoneNumber.trim() || null;
    }

    // Profile image
    const image = formData.get("image");

    if (image !== null) {
      if (!(image instanceof File) || image.size === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid profile image"
          },
          { status: 400 }
        );
      }

      updateData.image = image;
    }

    // Check if there is anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No account information provided"
        },
        { status: 400 }
      );
    }

    const account = await UpdateAccountDetail(
      user.id,
      updateData
    );

    return NextResponse.json({
      success: true,
      message: "Account updated successfully",
      data: account
    });

  } catch (error) {
    console.error("UPDATE ACCOUNT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update account information"
      },
      { status: 500 }
    );
  }
}


