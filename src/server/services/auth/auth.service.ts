import { createToken, verifyToken } from "@/src/server/lib/jwt";
import { supabase } from "@/src/server/lib/supabase";
import bcrypt from "bcryptjs";
import { uploadImageService } from "../image/image.service";

type RegisterData = {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: string
  employeeId?: string;
  departmentId?: string;
  positionId?: string;
  image?: File | null;
};

type LoginData = {
  email: string;
  password: string;
};

type CurrentUser = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  role: "admin" | "supervisor" | "user" | "technician";
  status: "active" | "inactive";
  employee_id: string | null;
  image_url: string | null;
  department_id: string | null;
  position_id: string | null;
  created_at: string;
  updated_at: string;
};

type GetCurrentUserResult =
| {
    success: true;
    data: {
      user: CurrentUser;
    };
  }
| {
    success: false;
    message: string;
  };

// REGISTER 
export async function registerUser(data: RegisterData) {
  const {
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    role,
    employeeId,
    departmentId,
    positionId,
    image,
  } = data;

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // upload image to cloudinary wesup/users folder
  let imageUrl: string | null = null;

  if (image) {
    const arrayBuffer = await image.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const uploadResult = await uploadImageService(
      fileBuffer,
      "wesup/users"
    );

    imageUrl = (uploadResult as { secure_url: string }).secure_url;
  }

  // create user in users db
  const { data: userData, error: userError } = await supabase
    .from("users")
    .insert({
      first_name: firstName,
      last_name: lastName || null,
      email,
      password: hashedPassword,
      phone_number: phoneNumber || null,
      role: role || "user",
      employee_id: employeeId || null,
      department_id: departmentId || null,
      position_id: positionId || null,
      image_url: imageUrl,
    })
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
      department_id,
      position_id,
      created_at,
      updated_at
    `) // do this if we don't want return password
    .single();

  if (userError) {
    return {
      success: false,
      message: userError.message,
    };
  }

  return {
    success: true,
    message: "Registration successful",
    data: {
      user: userData,
    },
  };
};

// LOGIN
export async function loginUser(data: LoginData) {
  const { email, password } = data;

  // find user by email
  const { data: user, error: userError } = await supabase
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
      department_id,
      position_id,
      created_at,
      updated_at,
      password
    `)
    .eq("email", email)
    .single();

  if (userError || !user) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  // check account status
  if (user.status !== "active") {
    return {
      success: false,
      message: "Your account is inactive",
    };
  }

  // compare password with bcrypt hash
  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    return {
      success: false,
      message: "Invalid email or password",
    };
  }

  // remove password before returning user
  const { password: _, ...safeUser } = user;

  // create token
  const token = createToken({
    userId: user.id,
    role: user.role,
  });

  return {
    success: true,
    message: "Login successful",
    data: {
      user: safeUser,
      token,
    },
  };
};

// GET CURRENT USER (auth/me)
export async function getCurrentUser(
  token: string
): Promise<GetCurrentUserResult>{
  // verify JWT
  const payload = verifyToken(token);

  if (!payload) {
    return {
      success: false,
      message: "Invalid or expired token",
    };
  }

  // find/check user
  const { data: user, error: userError } = await supabase
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
      department_id,
      position_id,
      created_at,
      updated_at
    `)
    .eq("id", payload.userId)
    .single();

  if (userError || !user) {
    return {
      success: false,
      message: "User not found",
    };
  }

  // check account status
  if (user.status !== "active") {
    return {
      success: false,
      message: "Your account is inactive",
    };
  }

  return {
    success: true,
    data: {
      user,
    },
  };
}