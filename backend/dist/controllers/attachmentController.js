"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentController = void 0;
const http_status_codes_1 = require("http-status-codes");
const attachmentService_1 = require("../services/attachmentService");
class AttachmentController {
    static async upload(req, res) {
        const taskId = req.params.taskId;
        const file = req.file;
        if (!file) {
            return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
        }
        const attachment = await attachmentService_1.AttachmentService.uploadAttachment(taskId, file);
        res.status(http_status_codes_1.StatusCodes.CREATED).json(attachment);
    }
    static async download(req, res) {
        const id = req.params.id;
        const attachment = await attachmentService_1.AttachmentService.getAttachmentById(id);
        // Redirect to Cloudinary URL (attachments stored remotely)
        if (!attachment.fileUrl) {
            return res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ error: 'File URL not available' });
        }
        res.redirect(attachment.fileUrl);
    }
    static async delete(req, res) {
        const id = req.params.id;
        await attachmentService_1.AttachmentService.deleteAttachment(id);
        res.status(http_status_codes_1.StatusCodes.NO_CONTENT).send();
    }
}
exports.AttachmentController = AttachmentController;
