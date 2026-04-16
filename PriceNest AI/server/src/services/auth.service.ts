import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserModel } from "../models/user.model";
import { ApiError } from "../utils/apiErrors";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(200)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200)
});

export async function registerUser(input: z.infer<typeof registerSchema>) {
  const existing = await UserModel.findOne({ email: input.email });
  if (existing) throw new ApiError(409, "Email already in use");

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: "user"
  });

  return { id: user._id.toString(), name: user.name, email: user.email };
}

export async function loginUser(input: z.infer<typeof loginSchema>) {
  const user = await UserModel.findOne({ email: input.email });
  if (!user) throw new ApiError(401, "Invalid email or password");

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new ApiError(401, "Invalid email or password");

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
  };
}

