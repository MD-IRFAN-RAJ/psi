import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AttachmentService } from '../services/attachmentService';
import path from 'path';
import fs from 'fs';

export class AttachmentController {
  static async upload(req: Request, res: Response) {
    const taskId = req.params.taskId as string;
    const file = req.file;

    if (!file) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: 'No file uploaded' });
    }

    const attachment = await AttachmentService.uploadAttachment(taskId, file);
    res.status(StatusCodes.CREATED).json(attachment);
  }

  static async download(req: Request, res: Response) {
    const id = req.params.id as string;
    const attachment = await AttachmentService.getAttachmentById(id);
    // Redirect to Cloudinary URL (attachments stored remotely)
    if (!attachment.fileUrl) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'File URL not available' });
    }
    res.redirect(attachment.fileUrl);
  }

  static async delete(req: Request, res: Response) {
    const id = req.params.id as string;
    await AttachmentService.deleteAttachment(id);
    res.status(StatusCodes.NO_CONTENT).send();
  }
}
