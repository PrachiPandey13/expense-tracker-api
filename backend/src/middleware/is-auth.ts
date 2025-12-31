import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  userId?: number;
}

export default (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  // Expect: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Misconfiguration — this is a server issue
    return res.status(500).json({ message: 'JWT_SECRET is not set.' });
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: number; email: string };
    req.userId = decoded.userId;
    return next();
  } catch (err) {
    // Invalid / expired token → client issue
    return res.status(401).json({ message: 'Not authenticated.' });
  }
};
