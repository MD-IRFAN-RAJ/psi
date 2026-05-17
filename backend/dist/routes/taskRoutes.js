"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const attachmentController_1 = require("../controllers/attachmentController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// All task routes are protected by authMiddleware
router.use(authMiddleware_1.authMiddleware);
router.post('/', taskController_1.TaskController.create);
router.get('/', taskController_1.TaskController.list);
router.get('/:id', taskController_1.TaskController.get);
router.put('/:id', taskController_1.TaskController.update);
router.delete('/:id', taskController_1.TaskController.delete);
// Attachments
router.post('/:taskId/attachments', (req, res, next) => {
    multer_1.upload.single('file')(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'File too large. Max 5MB allowed.' });
            }
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, attachmentController_1.AttachmentController.upload);
router.get('/attachments/:id', attachmentController_1.AttachmentController.download);
router.delete('/attachments/:id', attachmentController_1.AttachmentController.delete);
exports.default = router;
