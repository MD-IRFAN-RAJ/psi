import prisma from '../config/prisma';
import cloudinary from '../config/cloudinary';

export class AttachmentService {
  static async uploadAttachment(taskId: string, file: Express.Multer.File) {
    // Check current attachment count for the task
    const count = await prisma.attachment.count({ where: { taskId } });
    if (count >= 3) {
      throw new Error('Maximum of 3 attachments allowed per task');
    }

    // Convert buffer to data URI
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'auto',
      folder: 'task_attachments',
      public_id: undefined,
    });

    return prisma.attachment.create({
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

  static async getAttachmentById(id: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      throw new Error('Attachment not found');
    }
    return attachment;
  }

  static async deleteAttachment(id: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id } });
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Try to delete from Cloudinary if we have a public id
    if ((attachment as any).filePublicId) {
      try {
        await cloudinary.uploader.destroy((attachment as any).filePublicId, { resource_type: 'auto' });
      } catch (err) {
        // Non-fatal: log and continue to remove DB record
        console.warn('Cloudinary delete failed:', err.message || err);
      }
    }

    await prisma.attachment.delete({ where: { id } });
    return true;
  }
}
