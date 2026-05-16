import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';

export class UserController {
  static async getProfile(req: Request, res: Response) {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
      },
    });
    res.status(StatusCodes.OK).json(user);
  }

  static async updateProfile(req: Request, res: Response) {
    const userId = req.user!.userId;
    const { firstName, lastName, phoneNumber, email, password } = req.body;
    
    const updateData: any = {
      firstName,
      lastName,
      phoneNumber,
      email,
    };

    if (password && password.length > 0) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    if (req.file) {
      updateData.avatarUrl = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId as string },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        avatarUrl: true,
        role: true,
      },
    });

    res.status(StatusCodes.OK).json(updatedUser);
  }

  static async listUsers(req: Request, res: Response) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });
    res.status(StatusCodes.OK).json(users);
  }
}
