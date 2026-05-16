import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../config/prisma';

export class ProjectController {
  private static isAdminLike(role?: string) {
    return !!role && ['ADMIN', 'CTO', 'MANAGER'].includes(role);
  }

  private static assignmentInclude = {
    assignedMembers: {
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            avatarUrl: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    },
  };

  static async createProject(req: Request, res: Response) {
    const { name, key, description } = req.body;
    try {
      const project = await prisma.project.create({
        data: { name, key, description },
      });
      res.status(StatusCodes.CREATED).json(project);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Project key already exists' });
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  }

  static async listProjects(req: Request, res: Response) {
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as string;

    const where = ProjectController.isAdminLike(userRole)
      ? {}
      : {
          assignedMembers: {
            some: {
              userId,
            },
          },
        };

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: { tasks: true }
        },
        ...(ProjectController.assignmentInclude as any),
      }
    });
    res.status(StatusCodes.OK).json(projects);
  }

  static async getProject(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const userRole = req.user?.role as string;

    const where = ProjectController.isAdminLike(userRole)
      ? { id }
      : {
          id,
          assignedMembers: {
            some: {
              userId,
            },
          },
        };

    const project = await prisma.project.findFirst({
      where: where as any,
      include: {
        tasks: {
          include: { assignee: true }
        },
        ...(ProjectController.assignmentInclude as any),
      }
    });
    if (!project) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'Project not found' });
    }
    res.status(StatusCodes.OK).json(project);
  }

  static async assignMembers(req: Request, res: Response) {
  const projectId = req.params.id as string;

  const { teamLeadId, teamMemberIds } = req.body as {
    teamLeadId?: string | null;
    teamMemberIds?: string[];
  };

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return res.status(StatusCodes.NOT_FOUND).json({
      error: 'Project not found',
    });
  }

  const normalizedMemberIds = Array.isArray(teamMemberIds)
    ? Array.from(new Set(teamMemberIds.filter(Boolean)))
    : [];

  const candidateIds = [teamLeadId, ...normalizedMemberIds].filter(Boolean) as string[];

  if (candidateIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { id: { in: candidateIds } },
      select: { id: true, role: true },
    });

    const userById = new Map(users.map((u) => [u.id, u]));

    if (teamLeadId) {
      const lead = userById.get(teamLeadId);

      if (!lead || !['TEAM_LEAD', 'MANAGER'].includes(lead.role)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: 'Selected team lead is invalid',
        });
      }
    }

    const invalidMembers = normalizedMemberIds.filter((userId) => {
      const member = userById.get(userId);

      return !member || !['TEAM_MEMBER', 'USER'].includes(member.role);
    });

    if (invalidMembers.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'One or more team members are invalid',
      });
    }
  }

  await prisma.$transaction(async (tx) => {
    await (tx as any).projectAssignment.deleteMany({
      where: { projectId },
    });

    if (teamLeadId) {
      await (tx as any).projectAssignment.create({
        data: {
          projectId,
          userId: teamLeadId,
          role: 'TEAM_LEAD',
          assignedById: req.user?.userId as string,
        },
      });
    }

    if (normalizedMemberIds.length > 0) {
      await (tx as any).projectAssignment.createMany({
        data: normalizedMemberIds.map((userId) => ({
          projectId,
          userId,
          role: 'TEAM_MEMBER',
          assignedById: req.user?.userId as string,
        })),
      });
    }
  });

  const updated = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      _count: {
        select: { tasks: true },
      },
      ...(ProjectController.assignmentInclude as any),
    },
  });

  res.status(StatusCodes.OK).json(updated);
}
}
