"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_codes_1 = require("http-status-codes");
const authService_1 = require("../services/authService");
const authValidator_1 = require("../validators/authValidator");
class AuthController {
    static async register(req, res) {
        // Validate input
        const validatedData = authValidator_1.registerSchema.parse(req.body);
        const result = await authService_1.AuthService.register(validatedData);
        res.status(http_status_codes_1.StatusCodes.CREATED).json(result);
    }
    static async login(req, res) {
        // Validate input
        const validatedData = authValidator_1.loginSchema.parse(req.body);
        const result = await authService_1.AuthService.login(validatedData);
        res.status(http_status_codes_1.StatusCodes.OK).json(result);
    }
    static async me(req, res) {
        const userId = req.user.userId;
        const user = await authService_1.AuthService.getMe(userId);
        res.status(http_status_codes_1.StatusCodes.OK).json(user);
    }
    static async refresh(req, res) {
        // Validate input
        const { refreshToken } = authValidator_1.refreshTokenSchema.parse(req.body);
        // In a real production app, we would verify the refresh token against a whitelist in DB/Redis
        // For this assignment, we'll keep it stateless as per architecture decisions
        // unless the user requests token rotation/revocation.
        // Placeholder for refresh logic - verify token and issue new access token
        // This is often handled in a dedicated utility or service.
        res.status(http_status_codes_1.StatusCodes.NOT_IMPLEMENTED).json({ message: 'Token refresh logic not implemented' });
    }
}
exports.AuthController = AuthController;
