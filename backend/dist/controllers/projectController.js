"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const http_status_codes_1 = require("http-status-codes");
const prisma_1 = __importDefault(require("../config/prisma"));
class ProjectController {
    static isAdminLike(role) {
        return !!role && ['ADMIN', 'CTO', 'MANAGER'].includes(role);
    }
    static assignmentInclude = {
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
    static async createProject(req, res) {
        const { name, key, description } = req.body;
        try {
            const project = await prisma_1.default.project.create({
                data: { name, key, description },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json(project);
        }
        catch (error) {
            if (error.code === 'P2002') {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: 'Project key already exists' });
            }
            res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }
    static async listProjects(req, res) {
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        const where = ProjectController.isAdminLike(userRole)
            ? {}
            : {
                assignedMembers: {
                    some: {
                        userId,
                    },
                },
            };
        const projects = await prisma_1.default.project.findMany({
            where,
            include: {
                _count: {
                    select: { tasks: true }
                },
                ...ProjectController.assignmentInclude,
            }
        });
        res.status(http_status_codes_1.StatusCodes.OK).json(projects);
    }
    static async getProject(req, res) {
        const { id } = req.params;
        const userId = req.user?.userId;
        const userRole = req.user?.role;
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
        const project = await prisma_1.default.project.findFirst({
            where: where,
            include: {
                tasks: {
                    include: { assignee: true }
                },
                ...ProjectController.assignmentInclude,
            }
        });
        if (!project) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'Project not found' });
        }
        res.status(http_status_codes_1.StatusCodes.OK).json(project);
    }
    static async assignMembers(req, res) {
        const projectId = req.params.id;
        const { teamLeadId, teamMemberIds } = req.body;
        const project = await prisma_1.default.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
                error: 'Project not found',
            });
        }
        const normalizedMemberIds = Array.isArray(teamMemberIds)
            ? Array.from(new Set(teamMemberIds.filter(Boolean)))
            : [];
        const candidateIds = [teamLeadId, ...normalizedMemberIds].filter(Boolean);
        if (candidateIds.length > 0) {
            const users = await prisma_1.default.user.findMany({
                where: { id: { in: candidateIds } },
                select: { id: true, role: true },
            });
            const userById = new Map(users.map((u) => [u.id, u]));
            if (teamLeadId) {
                const lead = userById.get(teamLeadId);
                if (!lead || !['TEAM_LEAD', 'MANAGER'].includes(lead.role)) {
                    return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                        error: 'Selected team lead is invalid',
                    });
                }
            }
            const invalidMembers = normalizedMemberIds.filter((userId) => {
                const member = userById.get(userId);
                return !member || !['TEAM_MEMBER', 'USER'].includes(member.role);
            });
            if (invalidMembers.length > 0) {
                return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({
                    error: 'One or more team members are invalid',
                });
            }
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.projectAssignment.deleteMany({
                where: { projectId },
            });
            if (teamLeadId) {
                await tx.projectAssignment.create({
                    data: {
                        projectId,
                        userId: teamLeadId,
                        role: 'TEAM_LEAD',
                        assignedById: req.user?.userId,
                    },
                });
            }
            if (normalizedMemberIds.length > 0) {
                await tx.projectAssignment.createMany({
                    data: normalizedMemberIds.map((userId) => ({
                        projectId,
                        userId,
                        role: 'TEAM_MEMBER',
                        assignedById: req.user?.userId,
                    })),
                });
            }
        });
        const updated = await prisma_1.default.project.findUnique({
            where: { id: projectId },
            include: {
                _count: {
                    select: { tasks: true },
                },
                ...ProjectController.assignmentInclude,
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json(updated);
    }
}
exports.ProjectController = ProjectController;
