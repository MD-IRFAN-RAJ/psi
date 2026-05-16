// src/tests/auth.test.ts

import request from 'supertest';
import { StatusCodes } from 'http-status-codes';
import app from '../app';
import prisma from '../config/prisma';

describe('Authentication API', () => {
  const adminEmail = 'admin1@gmail.com';
  const adminPassword = '123456789';

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 200 and tokens for valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: adminEmail,
          password: adminPassword,
        });

      expect(response.status).toBe(StatusCodes.OK);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe(adminEmail);
    });

    it('should return error for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@gmail.com',
          password: 'wrongpassword',
        });

      expect(response.status).not.toBe(StatusCodes.OK);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 if no token provided', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(StatusCodes.UNAUTHORIZED);
    });

    it('should return user profile for valid token', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: adminEmail,
          password: adminPassword,
        });

      const token = loginRes.body.accessToken;

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(StatusCodes.OK);
      expect(response.body.email).toBe(adminEmail);
    });
  });
});