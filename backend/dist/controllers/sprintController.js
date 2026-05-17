"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SprintController = void 0;
const http_status_codes_1 = require("http-status-codes");
const prisma_1 = __importDefault(require("../config/prisma"));
class SprintController {
    static isAdminLike(role) {
        return !!role && ['ADMIN', 'CTO', 'MANAGER'].includes(role);
    }
    static async canLeadProject(userId, projectId) {
        const assignment = await prisma_1.default.projectAssignment.findFirst({
            where: {
                userId,
                projectId,
                role: 'TEAM_LEAD',
            },
        });
        return !!assignment;
    }
    static async createSprint(req, res) {
        const { name, goal, startDate, endDate, projectId } = req.body;
        try {
            const userId = req.user.userId;
            const userRole = req.user.role;
            if (!SprintController.isAdminLike(userRole)) {
                const canLead = await SprintController.canLeadProject(userId, projectId);
                if (!canLead) {
                    return res
                        .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                        .json({
                        error: 'Not authorized to create sprint for this project',
                    });
                }
            }
            const sprint = await prisma_1.default.sprint.create({
                data: {
                    name,
                    goal,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    projectId,
                },
            });
            res.status(http_status_codes_1.StatusCodes.CREATED).json(sprint);
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: error.message });
        }
    }
    static async listSprints(req, res) {
        const userId = req.user.userId;
        const userRole = req.user.role;
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
        const sprints = await prisma_1.default.sprint.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { tasks: true },
                },
            },
        });
        res.status(http_status_codes_1.StatusCodes.OK).json(sprints);
    }
    static async getActiveSprint(req, res) {
        const userId = req.user.userId;
        const userRole = req.user.role;
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
        const sprint = await prisma_1.default.sprint.findFirst({
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
        res.status(http_status_codes_1.StatusCodes.OK).json(sprint);
    }
    static async updateSprint(req, res) {
        const id = req.params.id;
        const { name, goal, startDate, endDate, status } = req.body;
        try {
            const existing = await prisma_1.default.sprint.findUnique({
                where: { id },
            });
            if (!existing) {
                return res
                    .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                    .json({ error: 'Sprint not found' });
            }
            const userId = req.user.userId;
            const userRole = req.user.role;
            if (!SprintController.isAdminLike(userRole)) {
                const canLead = await SprintController.canLeadProject(userId, existing.projectId);
                if (!canLead) {
                    return res
                        .status(http_status_codes_1.StatusCodes.FORBIDDEN)
                        .json({
                        error: 'Not authorized to update this sprint',
                    });
                }
            }
            const sprint = await prisma_1.default.sprint.update({
                where: { id },
                data: {
                    name,
                    goal,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    status,
                },
            });
            res.status(http_status_codes_1.StatusCodes.OK).json(sprint);
        }
        catch (error) {
            res
                .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ error: error.message });
        }
    }
}
exports.SprintController = SprintController;
