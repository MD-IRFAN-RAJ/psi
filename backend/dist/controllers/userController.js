"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_codes_1 = require("http-status-codes");
const prisma_1 = __importDefault(require("../config/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    static async getProfile(req, res) {
        const userId = req.user.userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                avatarUrl: true,
                role: true,
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json(user);
    }
    static async updateProfile(req, res) {
        const userId = req.user.userId;
        const { firstName, lastName, phoneNumber, email, password } = req.body;
        const updateData = {
            firstName,
            lastName,
            phoneNumber,
            email,
        };
        if (password && password.length > 0) {
            updateData.passwordHash = await bcryptjs_1.default.hash(password, 10);
        }
        if (req.file) {
            updateData.avatarUrl = `/uploads/${req.file.filename}`;
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                avatarUrl: true,
                role: true,
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json(updatedUser);
    }
    static async listUsers(req, res) {
        const users = await prisma_1.default.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                avatarUrl: true,
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json(users);
    }
}
exports.UserController = UserController;
