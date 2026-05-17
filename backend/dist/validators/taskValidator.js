"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(255),
    description: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
    priority: zod_1.z.nativeEnum(client_1.Priority).optional(),
    dueDate: zod_1.z.string().optional().nullable(),
    assigneeId: zod_1.z.string().uuid().optional().nullable(),
    projectId: zod_1.z.string().uuid().optional().nullable(),
    sprintId: zod_1.z.string().uuid().optional().nullable(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(3).max(255).optional(),
    description: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.TaskStatus).optional(),
    priority: zod_1.z.nativeEnum(client_1.Priority).optional(),
    dueDate: zod_1.z.string().optional().nullable(),
    assigneeId: zod_1.z.string().uuid().optional().nullable(),
    projectId: zod_1.z.string().uuid().optional().nullable(),
    sprintId: zod_1.z.string().uuid().optional().nullable(),
});
