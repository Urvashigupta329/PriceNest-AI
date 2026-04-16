"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const user_model_1 = require("../models/user.model");
const apiErrors_1 = require("../utils/apiErrors");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(80),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(200)
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(200)
});
async function registerUser(input) {
    const existing = await user_model_1.UserModel.findOne({ email: input.email });
    if (existing)
        throw new apiErrors_1.ApiError(409, "Email already in use");
    const passwordHash = await bcryptjs_1.default.hash(input.password, 10);
    const user = await user_model_1.UserModel.create({
        name: input.name,
        email: input.email,
        passwordHash,
        role: "user"
    });
    return { id: user._id.toString(), name: user.name, email: user.email };
}
async function loginUser(input) {
    const user = await user_model_1.UserModel.findOne({ email: input.email });
    if (!user)
        throw new apiErrors_1.ApiError(401, "Invalid email or password");
    const ok = await bcryptjs_1.default.compare(input.password, user.passwordHash);
    if (!ok)
        throw new apiErrors_1.ApiError(401, "Invalid email or password");
    const token = jsonwebtoken_1.default.sign({ sub: user._id.toString(), role: user.role }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
    return {
        token,
        user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    };
}
