import { getLocations } from "@/src/server/services/location/location.service";

// GET LOCATION
export async function GET() {
  try {
    const result = await getLocations();

    if (!result.success) {
      return Response.json(result, { status: 500 });
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    console.error("Get location error:", error);

    return Response.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    )
  }
}