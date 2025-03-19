import request from 'supertest';
import { AppDataSource } from '../data-source';
import app from '../app';

describe('Task API', () => {
  let token: string;
  let taskId: number;

  beforeAll(async () => {
    await AppDataSource.initialize();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  beforeEach(async () => {
    await AppDataSource.query('TRUNCATE TABLE "task" CASCADE');
    await AppDataSource.query('TRUNCATE TABLE "user" CASCADE');

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'shaozdo@mail.ru', password: 'Shahid06' });

    const authResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'shaozdo@mail.ru', password: 'Shahid06' });

    token = authResponse.body.token;

    const taskResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', description: 'Test Description', deadline: '2023-12-31' });

    taskId = taskResponse.body.id;
  });

  it('should create a new task', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Test Task', description: 'Test Description', deadline: '2023-12-31' });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('Test Task');
  });

  it('should get tasks with filters', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .query({ status: 'new', page: 1, limit: 10, search: 'Test', deadline: '2023-12-31' });

    expect(response.status).toBe(200);
    expect(response.body.tasks.length).toBeGreaterThan(0);
    expect(response.body.total).toBeGreaterThan(0);
  });

  it('should update a task', async () => {
    const response = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Task', description: 'Updated Description', status: 'completed', deadline: '2024-01-01' });

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Task');
    expect(response.body.status).toBe('completed');
  });

  it('should delete a task', async () => {
    const response = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Task deleted successfully');
  });

  it('should return 401 for unauthorized access', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
  });

  it('should return 404 for non-existent task', async () => {
    const response = await request(app)
      .put('/api/tasks/9999')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Non-existent Task' });

    expect(response.status).toBe(404);
  });

  it('should update the status of a task', async () => {
    const response = await request(app)
      .patch(`/api/tasks/${taskId}/updateStatus`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('completed');
  });
});