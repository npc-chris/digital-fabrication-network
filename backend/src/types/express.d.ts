import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: string;
      providerApproved?: boolean;
    }

    interface Request {
      user?: User;
    }
  }
}

export interface AuthRequest extends Request {
  user: Express.User;
}
