import { supabase } from "../../lib/supabase";

// GET DEPARTMENT
export async function getDepartment() {
  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return{
      success: false,
      message: error.message,
    };
  }

  return{
    success: true,
    data,
  };
}