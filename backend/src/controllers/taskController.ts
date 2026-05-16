import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { TaskService, TaskFilters, PaginationOptions } from '../services/taskService';
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator';
import { TaskStatus, Priority } from '@prisma/client';

export class TaskController {
  static async create(req: Request, res: Response) {
    const validatedData = createTaskSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const task = await TaskService.createTask(validatedData, userId as string, userRole as string);
    res.status(StatusCodes.CREATED).json(task);
  }

  static async list(req: Request, res: Response) {
    const filters: TaskFilters = {
      status: req.query.status as TaskStatus,
      priority: req.query.priority as Priority,
      assigneeId: req.query.assigneeId as string,
      authorId: req.query.authorId as string,
      search: req.query.search as string,
      includeDone: req.query.includeDone === 'true',
      viewerId: req.user!.userId as string,
      viewerRole: req.user!.role as string,
    };

    const pagination: PaginationOptions = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await TaskService.getTasks(filters, pagination);
    res.status(StatusCodes.OK).json(result);
  }

  static async get(req: Request, res: Response) {
    const id = req.params.id as string;
    const task = await TaskService.getTaskById(id, req.user!.userId as string, req.user!.role as string);
    res.status(StatusCodes.OK).json(task);
  }

  static async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const validatedData = updateTaskSchema.parse(req.body);
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const task = await TaskService.updateTask(id, validatedData, userId as string, userRole as string);
    res.status(StatusCodes.OK).json(task);
  }

  static async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    await TaskService.deleteTask(id, userId as string, userRole as string);
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
