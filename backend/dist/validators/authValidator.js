"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    firstName: zod_1.z.string().min(2),
    lastName: zod_1.z.string().min(2),
    role: zod_1.z.enum(['ADMIN', 'CTO', 'MANAGER', 'TEAM_LEAD', 'TEAM_MEMBER']).optional(),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
exports.refreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string(),
});
