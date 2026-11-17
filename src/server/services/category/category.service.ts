import { supabase } from "../../lib/supabase";

// GET ALL CATEGORIES
export async function getCategories() {
  const { data, error } = await supabase
    .from ("categories")
    .select ("id, name, description")
    .order ("name", { ascending: true });

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