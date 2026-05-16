import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/authService';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/authValidator';

export class AuthController {
  static async register(req: Request, res: Response) {
    // Validate input
    const validatedData = registerSchema.parse(req.body);

    const result = await AuthService.register(validatedData);

    res.status(StatusCodes.CREATED).json(result);
  }

  static async login(req: Request, res: Response) {
    // Validate input
    const validatedData = loginSchema.parse(req.body);

    const result = await AuthService.login(validatedData);

    res.status(StatusCodes.OK).json(result);
  }

  static async me(req: any, res: Response) {
    const userId = req.user.userId;
    const user = await AuthService.getMe(userId);

    res.status(StatusCodes.OK).json(user);
  }

  static async refresh(req: Request, res: Response) {
    // Validate input
    const { refreshToken } = refreshTokenSchema.parse(req.body);
    
    // In a real production app, we would verify the refresh token against a whitelist in DB/Redis
    // For this assignment, we'll keep it stateless as per architecture decisions
    // unless the user requests token rotation/revocation.
    
    // Placeholder for refresh logic - verify token and issue new access token
    // This is often handled in a dedicated utility or service.
    
    res.status(StatusCodes.NOT_IMPLEMENTED).json({ message: 'Token refresh logic not implemented' });
  }
}
