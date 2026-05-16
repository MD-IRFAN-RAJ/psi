// src/tests/task.test.ts

import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../app';
import prisma from '../config/prisma';

describe('Task Management API', () => {
  let adminToken: string;
  let taskId: string;

  const adminEmail = 'admin1@gmail.com';
  const adminPassword = '123456789';

  beforeAll(async () => {
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: adminEmail,
        password: adminPassword,
      });

    adminToken = login.body.accessToken;
  });

  afterAll(async () => {
    if (taskId) {
      await prisma.task.deleteMany({
        where: {
          id: taskId,
        },
      });
    }

    await prisma.$disconnect();
  });

  describe('POST /api/v1/tasks', () => {
    it('should allow authenticated user to create task', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Task',
          description: 'Task created from Jest test',
          priority: 'HIGH',
        });

      expect(response.status).toBe(StatusCodes.CREATED);

      expect(response.body.title).toBe('Test Task');

      taskId = response.body.id;
    });

    it('should return 401 if token missing', async () => {
      const response = await request(app)
        .post('/api/v1/tasks')
        .send({
          title: 'Unauthorized Task',
        });

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('should return paginated tasks', async () => {
      const response = await request(app)
        .get('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(StatusCodes.OK);

      expect(Array.isArray(response.body.tasks)).toBe(true);
    });
  });

  describe('PUT /api/v1/tasks/:id', () => {
    it('should update task status', async () => {
      const response = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'DONE',
        });

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.status).toBe('DONE');
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('should delete task', async () => {
      const response = await request(app)
        .delete(`/api/v1/tasks/${taskId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(StatusCodes.NO_CONTENT);
    });
  });
});