import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Task } from './entities/Task';
import { User } from './entities/User';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Task],
  migrations: ['src/migrations/**/*.ts'],
  synchronize: false,
  logging: true,
});