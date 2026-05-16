import prisma from '../config/prisma';
import fs from 'fs';
import path from 'path';

export class AttachmentService {
  static async uploadAttachment(taskId: string, file: Express.Multer.File) {
    // Check current attachment count for the task
    const count = await prisma.attachment.count({ where: { taskId } });
    if (count >= 3) {
      // Delete the uploaded file if limit exceeded
      fs.unlinkSync(file.path);
      throw new Error('Maximum of 3 attachments allowed per task');
    }

    return prisma.attachment.create({
      data: {
        taskId,
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
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

    // Delete file from disk
    if (fs.existsSync(attachment.fileUrl)) {
      fs.unlinkSync(attachment.fileUrl);
    }

    await prisma.attachment.delete({ where: { id } });
    return true;
  }
}
