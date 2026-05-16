import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { AttachmentController } from '../controllers/attachmentController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../config/multer';

const router = Router();

// All task routes are protected by authMiddleware
router.use(authMiddleware);

router.post('/', TaskController.create);
router.get('/', TaskController.list);
router.get('/:id', TaskController.get);
router.put('/:id', TaskController.update);
router.delete('/:id', TaskController.delete);

// Attachments
router.post('/:taskId/attachments', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Max 5MB allowed.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}, AttachmentController.upload);

router.get('/attachments/:id', AttachmentController.download);
router.delete('/attachments/:id', AttachmentController.delete);

export default router;

