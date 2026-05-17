"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const jwt_1 = require("../utils/jwt");
class AuthService {
    static async register(data) {
        const { email, password, firstName, lastName, role } = data;
        // Check if user exists
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await prisma_1.default.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                role: role || 'TEAM_MEMBER',
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });
        // Generate tokens
        const accessToken = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, role: user.role });
        return { user, accessToken, refreshToken };
    }
    static async login(data) {
        const { email, password } = data;
        // Find user
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Check password
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        // Generate tokens
        const accessToken = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: user.id, role: user.role });
        const userResponse = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        };
        return { user: userResponse, accessToken, refreshToken };
    }
    static async getMe(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
}
exports.AuthService = AuthService;
