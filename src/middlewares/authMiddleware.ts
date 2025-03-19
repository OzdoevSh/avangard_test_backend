import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    res.status(401).send({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.id } });
    if (!user) {
      res.status(401).send({ message: 'Invalid token' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).send({ message: 'Invalid token' });
  }
};