import { Request, Response } from 'express';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const createTask = async (req: Request, res: Response): Promise<void> => {
  const { title, description, deadline } = req.body;
  const taskRepository = AppDataSource.getRepository(Task);

  if (!req.user) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }

  const task = taskRepository.create({ title, description, deadline, user: req.user });
  await taskRepository.save(task);

  res.status(201).send(task);
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { status, page = 1, limit = 10, search, deadline } = req.query;
  const taskRepository = AppDataSource.getRepository(Task);

  if (!req.user) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }

  const query = taskRepository.createQueryBuilder('task')
    .where('task.userId = :userId', { userId: req.user.id });

  if (status) {
    query.andWhere('task.status = :status', { status });
  }

  if (search) {
    query.andWhere(
      '(task.title LIKE :search OR task.description LIKE :search)',
      { search: `%${search}%` }
    );
  }

  if (deadline) {
    query.andWhere('task.deadline <= :deadline', { deadline });
  }

  query.orderBy('task.createdAt', 'DESC');

  const tasks = await query
    .skip((+page - 1) * +limit)
    .take(+limit)
    .getMany();

  const total = await query.getCount();

  res.send({
    tasks,
    total,
  });
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, status, deadline } = req.body;
  const taskRepository = AppDataSource.getRepository(Task);

  console.log('edit data', title, description, status, deadline);

  if (!req.user) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }

  const task = await taskRepository.findOne({ where: { id: +id, user: { id: req.user.id } } });
  if (!task) {
    res.status(404).send({ message: 'Task not found' });
    return;
  }

  task.title = title || task.title;
  task.description = description || task.description;
  task.status = status || task.status;
  task.deadline = deadline || task.deadline;

  await taskRepository.save(task);
  res.send(task);
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const taskRepository = AppDataSource.getRepository(Task);

  if (!req.user) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }

  const task = await taskRepository.findOne({ where: { id: +id, user: { id: req.user.id } } });
  if (!task) {
    res.status(404).send({ message: 'Task not found' });
    return;
  }

  await taskRepository.remove(task);
  res.send({ message: 'Task deleted successfully' });
};

export const updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  const taskRepository = AppDataSource.getRepository(Task);

  if (!req.user) {
    res.status(401).send({ message: 'Unauthorized' });
    return;
  }

  const task = await taskRepository.findOne({ where: { id: +id, user: { id: req.user.id } } });
  if (!task) {
    res.status(404).send({ message: 'Task not found' });
    return;
  }

  task.status = status;

  await taskRepository.save(task);

  res.send(task);
};
