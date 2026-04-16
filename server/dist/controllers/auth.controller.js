"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async register(req, res) {
        const result = await (0, auth_service_1.registerUser)(req.body);
        return res.status(201).json(result);
    }
    static async login(req, res) {
        const result = await (0, auth_service_1.loginUser)(req.body);
        return res.status(200).json(result);
    }
}
exports.AuthController = AuthController;
