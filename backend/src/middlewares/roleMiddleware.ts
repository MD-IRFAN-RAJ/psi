import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role as string)) {
      return res.status(StatusCodes.FORBIDDEN).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
