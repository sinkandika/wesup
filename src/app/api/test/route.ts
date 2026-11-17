import { supabase } from "@/src/server/lib/supabase";
import { NextResponse } from "next/server";


export async function GET() {
  const { data, error } = await supabase
    .from("departments")
    .select("*");

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Supabase connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Supabase connection successful",
    data,
  });
}