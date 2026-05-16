import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../config/multer';

const router = Router();

router.get('/', authMiddleware, UserController.listUsers);
router.get('/profile', authMiddleware, UserController.getProfile);
router.put('/profile', authMiddleware, upload.single('avatar'), UserController.updateProfile);

export default router;
