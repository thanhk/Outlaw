import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';

interface JwtPayload {
  userId: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    // Type assertion for the user object
    const typedUser = user as { _id: { toString: () => string } };
    req.user = { id: typedUser._id.toString() };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
}; 