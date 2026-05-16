import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

router.post('/', authMiddleware, roleMiddleware(['ADMIN', 'CTO', 'MANAGER']), ProjectController.createProject);
router.get('/', authMiddleware, ProjectController.listProjects);
router.get('/:id', authMiddleware, ProjectController.getProject);
router.post(
	'/:id/assign-members',
	authMiddleware,
	roleMiddleware(['ADMIN', 'CTO', 'MANAGER']),
	ProjectController.assignMembers
);

export default router;
