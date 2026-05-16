import prisma from '../config/prisma';
import { CreateTaskInput, UpdateTaskInput } from '../validators/taskValidator';
import { TaskStatus, Priority } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/apiError';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  authorId?: string;
  projectId?: string;
  sprintId?: string;
  search?: string;
  includeDone?: boolean;
  viewerId?: string;
  viewerRole?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class TaskService {
  private static isAdminLike(role: string) {
    return ['ADMIN', 'CTO', 'MANAGER'].includes(role);
  }

  private static async hasProjectAccess(userId: string, projectId: string) {
    const assignment = await (prisma as any).projectAssignment.findFirst({
      where: {
        projectId,
        userId,
      },
    });
    return !!assignment;
  }

  static async createTask(data: CreateTaskInput, authorId: string, userRole: string) {
    if (!TaskService.isAdminLike(userRole)) {
      if (!data.projectId) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Project selection is required for your role');
      }

      const hasAccess = await TaskService.hasProjectAccess(authorId, data.projectId);
      if (!hasAccess) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Not authorized to create tasks for this project');
      }
    }

    return prisma.task.create({
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        authorId,
        projectId: data.projectId,
        sprintId: data.sprintId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        project: true,
      },
    });
  }

  static async getTasks(filters: TaskFilters, pagination: PaginationOptions) {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (!filters.status && !filters.includeDone) {
      where.status = { not: 'DONE' };
    }
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.sprintId) where.sprintId = filters.sprintId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.viewerId && filters.viewerRole && !TaskService.isAdminLike(filters.viewerRole)) {
      const assignmentProjectIds = await (prisma as any).projectAssignment.findMany({
        where: { userId: filters.viewerId },
        select: { projectId: true },
      });

      const accessibleProjectIds = assignmentProjectIds.map((row: any) => row.projectId);

      where.AND = [
        {
          OR: [
            { authorId: filters.viewerId },
            { assigneeId: filters.viewerId },
            { projectId: { in: accessibleProjectIds.length > 0 ? accessibleProjectIds : ['__none__'] } },
          ],
        },
      ];
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: { id: true, firstName: true, lastName: true },
          },
          assignee: {
            select: { id: true, firstName: true, lastName: true },
          },
          _count: {
            select: { attachments: true },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      tasks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getTaskById(id: string, viewerId: string, viewerRole: string) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        attachments: true,
      },
    });

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found');
    }

    if (!TaskService.isAdminLike(viewerRole)) {
      const isAuthor = task.authorId === viewerId;
      const isAssignee = task.assigneeId === viewerId;
      let hasProjectAccess = false;

      if (task.projectId) {
        hasProjectAccess = await TaskService.hasProjectAccess(viewerId, task.projectId);
      }

      if (!isAuthor && !isAssignee && !hasProjectAccess) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Not authorized to view this task');
      }
    }

    return task;
  }

  static async updateTask(id: string, data: UpdateTaskInput, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found');
    }

    if (!TaskService.isAdminLike(userRole)) {
      const isAuthor = task.authorId === userId;
      const isAssignee = task.assigneeId === userId;
      let projectAccess = false;

      if (task.projectId) {
        projectAccess = await TaskService.hasProjectAccess(userId, task.projectId);
      }

      if (!isAuthor && !isAssignee && !projectAccess) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Not authorized to update this task');
      }

      // Team members can only close/reopen their own/assigned tasks.
      if (['TEAM_MEMBER', 'USER'].includes(userRole)) {
        const editingOwnTask = isAuthor || isAssignee;
        if (!editingOwnTask) {
          throw new ApiError(StatusCodes.FORBIDDEN, 'Not authorized to update this task');
        }

        const allowedFields = ['status'];
        const submittedFields = Object.keys(data).filter((key) => (data as any)[key] !== undefined);
        const onlyStatus = submittedFields.every((field) => allowedFields.includes(field));
        if (!onlyStatus) {
          throw new ApiError(StatusCodes.FORBIDDEN, 'Your role can only update task status');
        }
      }
    }

    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        dueDate: data.dueDate ? new Date(data.dueDate) : data.dueDate === null ? null : undefined,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  static async deleteTask(id: string, userId: string, userRole: string) {
    const task = await prisma.task.findUnique({ where: { id } });

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found');
    }

    if (!TaskService.isAdminLike(userRole)) {
      const isAuthor = task.authorId === userId;
      let projectAccess = false;

      if (task.projectId) {
        projectAccess = await TaskService.hasProjectAccess(userId, task.projectId);
      }

      if (!isAuthor && !projectAccess) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Not authorized to delete this task');
      }

      if (['TEAM_MEMBER', 'USER'].includes(userRole) && !isAuthor) {
        throw new ApiError(StatusCodes.FORBIDDEN, 'Only task author can delete this task');
      }
    }

    await prisma.task.delete({ where: { id } });
    return true;
  }
}
