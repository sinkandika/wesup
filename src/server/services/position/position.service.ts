import { supabase } from "../../lib/supabase";

// GET POSITION
export async function getPositions(departmentId?: string) {
  let query = supabase
    .from("positions")
    .select("id, name, department_id")
    .order("name", { ascending: true });

  // only return positions where department_id matches the selected department.
  if (departmentId) {
    query = query.eq("department_id", departmentId);
  }

  const { data, error } = await query;

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  return {
    success: true,
    data,
  };
}