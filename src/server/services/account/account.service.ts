import { supabase } from "../../lib/supabase";
import { uploadImageService } from "../image/image.service";

export type UpdateAccountData = {
  firstName?: string;
  lastName?: string | null;
  phoneNumber?: string | null;
  image?: File;
};

// GET USER BY ID
export async function getAccountDetail(
  userId: string
) {
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone_number,
      role,
      status,
      employee_id,
      image_url,

      departments:department_id (
        name
      ),

      positions:position_id (
        name
      )
    `)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// UPDATE USER
export async function UpdateAccountDetail(
  userId: string,
  data: UpdateAccountData,
) {
  const updateData: {
    first_name?: string;
    last_name?: string | null;
    phone_number?: string | null;
    image_url?: string;
    updated_at: string
  } = {
    updated_at: new Date().toISOString(),
  };

  // map editable fields
  if (data.firstName !== undefined) {
    updateData.first_name = data.firstName;
  }

  if (data.lastName !== undefined) {
    updateData.last_name = data.lastName || null;
  }

  if (data.phoneNumber !== undefined) {
    updateData.phone_number = data.phoneNumber || null;
  }

  // upload image if provided
  if (data.image) {
    const arrayBuffer = await data.image.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadImageService(
      fileBuffer,
      "wesup/users"
    );

    updateData.image_url = (
      uploadResult as { secure_url: string }
    ).secure_url;
  }
  
  // Update user information
  const { data: account, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select(`
      id,
      first_name,
      last_name,
      email,
      phone_number,
      role,
      status,
      employee_id,
      image_url,
      created_at,
      updated_at,
      departments:department_id (
        name
      ),
      positions:position_id (
        name
      )
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return account;
}