import express from 'express';
import { createTask, getTasks, updateTask, deleteTask, updateTaskStatus } from '../controllers/TaskController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/updateStatus', updateTaskStatus);

export default router;