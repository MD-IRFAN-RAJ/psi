"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const http_status_codes_1 = require("http-status-codes");
const taskService_1 = require("../services/taskService");
const taskValidator_1 = require("../validators/taskValidator");
class TaskController {
    static async create(req, res) {
        const validatedData = taskValidator_1.createTaskSchema.parse(req.body);
        const userId = req.user.userId;
        const userRole = req.user.role;
        const task = await taskService_1.TaskService.createTask(validatedData, userId, userRole);
        res.status(http_status_codes_1.StatusCodes.CREATED).json(task);
    }
    static async list(req, res) {
        const filters = {
            status: req.query.status,
            priority: req.query.priority,
            assigneeId: req.query.assigneeId,
            authorId: req.query.authorId,
            search: req.query.search,
            includeDone: req.query.includeDone === 'true',
            viewerId: req.user.userId,
            viewerRole: req.user.role,
        };
        const pagination = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder || 'desc',
        };
        const result = await taskService_1.TaskService.getTasks(filters, pagination);
        res.status(http_status_codes_1.StatusCodes.OK).json(result);
    }
    static async get(req, res) {
        const id = req.params.id;
        const task = await taskService_1.TaskService.getTaskById(id, req.user.userId, req.user.role);
        res.status(http_status_codes_1.StatusCodes.OK).json(task);
    }
    static async update(req, res) {
        const id = req.params.id;
        const validatedData = taskValidator_1.updateTaskSchema.parse(req.body);
        const userId = req.user.userId;
        const userRole = req.user.role;
        const task = await taskService_1.TaskService.updateTask(id, validatedData, userId, userRole);
        res.status(http_status_codes_1.StatusCodes.OK).json(task);
    }
    static async delete(req, res) {
        const id = req.params.id;
        const userId = req.user.userId;
        const userRole = req.user.role;
        await taskService_1.TaskService.deleteTask(id, userId, userRole);
        res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
    }
}
exports.TaskController = TaskController;
