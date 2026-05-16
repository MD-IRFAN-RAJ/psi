import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../config/prisma';

export class SprintController {
  private static isAdminLike(role?: string) {
    return !!role && ['ADMIN', 'CTO', 'MANAGER'].includes(role);
  }

  private static async canLeadProject(userId: string, projectId: string) {
    const assignment = await (prisma as any).projectAssignment.findFirst({
      where: {
        userId,
        projectId,
        role: 'TEAM_LEAD',
      },
    });

    return !!assignment;
  }

  static async createSprint(req: Request, res: Response) {
    const { name, goal, startDate, endDate, projectId } = req.body;

    try {
      const userId = req.user!.userId as string;
      const userRole = req.user!.role as string;

      if (!SprintController.isAdminLike(userRole)) {
        const canLead = await SprintController.canLeadProject(
          userId,
          projectId
        );

        if (!canLead) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({
              error: 'Not authorized to create sprint for this project',
            });
        }
      }

      const sprint = await prisma.sprint.create({
        data: {
          name,
          goal,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          projectId,
        },
      });

      res.status(StatusCodes.CREATED).json(sprint);
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

  static async listSprints(req: Request, res: Response) {
    const userId = req.user!.userId as string;
    const userRole = req.user!.role as string;

    const where = SprintController.isAdminLike(userRole)
      ? {}
      : {
          project: {
            assignedMembers: {
              some: {
                userId,
              },
            },
          },
        };

    const sprints = await prisma.sprint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.status(StatusCodes.OK).json(sprints);
  }

  static async getActiveSprint(req: Request, res: Response) {
    const userId = req.user!.userId as string;
    const userRole = req.user!.role as string;

    const where = SprintController.isAdminLike(userRole)
      ? { status: 'ACTIVE' }
      : {
          status: 'ACTIVE',
          project: {
            assignedMembers: {
              some: {
                userId,
              },
            },
          },
        };

    const sprint = await prisma.sprint.findFirst({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: {
          include: {
            assignee: true,
          },
        },
      },
    });

    res.status(StatusCodes.OK).json(sprint);
  }

  static async updateSprint(req: Request, res: Response) {
    const id = req.params.id as string;

    const { name, goal, startDate, endDate, status } = req.body;

    try {
      const existing = await prisma.sprint.findUnique({
        where: { id },
      });

      if (!existing) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: 'Sprint not found' });
      }

      const userId = req.user!.userId as string;
      const userRole = req.user!.role as string;

      if (!SprintController.isAdminLike(userRole)) {
        const canLead = await SprintController.canLeadProject(
          userId,
          existing.projectId
        );

        if (!canLead) {
          return res
            .status(StatusCodes.FORBIDDEN)
            .json({
              error: 'Not authorized to update this sprint',
            });
        }
      }

      const sprint = await prisma.sprint.update({
        where: { id },
        data: {
          name,
          goal,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          status,
        },
      });

      res.status(StatusCodes.OK).json(sprint);
    } catch (error: any) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }
}