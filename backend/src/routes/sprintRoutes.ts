import { Router } from 'express';
import { SprintController } from '../controllers/sprintController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

router.post('/', authMiddleware, roleMiddleware(['ADMIN', 'CTO', 'MANAGER', 'TEAM_LEAD']), SprintController.createSprint);
router.get('/', authMiddleware, SprintController.listSprints);
router.get('/active', authMiddleware, SprintController.getActiveSprint);
router.patch('/:id', authMiddleware, roleMiddleware(['ADMIN', 'CTO', 'MANAGER', 'TEAM_LEAD']), SprintController.updateSprint);

export default router;
