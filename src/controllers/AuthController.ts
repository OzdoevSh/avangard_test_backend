import { Request, Response } from 'express';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send({ message: 'Email and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).send({ message: 'Password must be at least 6 characters long' });
    return;
  }

  const userRepository = AppDataSource.getRepository(User);

  try {
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).send({ message: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 8);

    const user = userRepository.create({ email, password: hashedPassword });
    await userRepository.save(user);

    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send({ message: 'Error registering user' });
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).send({ message: 'Email and password are required' });
    return;
  }

  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { email } });
    if (!user) {
      res.status(401).send({ message: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).send({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' });

    res.send({ token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ message: 'Error logging in' });
  }
};