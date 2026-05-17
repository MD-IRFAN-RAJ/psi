"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttachmentService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
class AttachmentService {
    static async uploadAttachment(taskId, file) {
        // Check current attachment count for the task
        const count = await prisma_1.default.attachment.count({ where: { taskId } });
        if (count >= 3) {
            throw new Error('Maximum of 3 attachments allowed per task');
        }
        // Convert buffer to data URI
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const result = await cloudinary_1.default.uploader.upload(dataUri, {
            resource_type: 'auto',
            folder: 'task_attachments',
            public_id: undefined,
        });
        return prisma_1.default.attachment.create({
            data: {
                taskId,
                fileName: file.originalname,
                fileUrl: result.secure_url,
                fileType: file.mimetype,
                fileSize: file.size,
                filePublicId: result.public_id,
            },
        });
    }
    static async getAttachmentById(id) {
        const attachment = await prisma_1.default.attachment.findUnique({ where: { id } });
        if (!attachment) {
            throw new Error('Attachment not found');
        }
        return attachment;
    }
    static async deleteAttachment(id) {
        const attachment = await prisma_1.default.attachment.findUnique({ where: { id } });
        if (!attachment) {
            throw new Error('Attachment not found');
        }
        // Try to delete from Cloudinary if we have a public id
        if (attachment.filePublicId) {
            try {
                await cloudinary_1.default.uploader.destroy(attachment.filePublicId, { resource_type: 'auto' });
            }
            catch (err) {
                // Non-fatal: log and continue to remove DB record
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.warn('Cloudinary delete failed:', errorMessage);
            }
        }
        await prisma_1.default.attachment.delete({ where: { id } });
        return true;
    }
}
exports.AttachmentService = AttachmentService;
