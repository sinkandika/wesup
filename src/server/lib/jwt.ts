import jwt from "jsonwebtoken";

type JwtPayload = {
  userId: string;
  role: string;
};

const JWT_SECRET = process.env.JWT_SECRET!;

// create token jwt
export function createToken(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn:"7d",
  });
}

// verify token
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}