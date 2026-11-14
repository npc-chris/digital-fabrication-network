import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'super-secure-test-jwt-secret-32-chars-long';
process.env.GOOGLE_CLIENT_ID = 'mock-google-client-id-for-tests';
process.env.GOOGLE_CLIENT_SECRET = 'mock-google-client-secret-for-tests';

// Mock authService
jest.mock('../services/auth.service', () => {
  return {
    __esModule: true,
    default: {
      register: jest.fn(),
      login: jest.fn(),
    },
  };
});

// Mock database
jest.mock('../config/database', () => {
  return {
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    },
  };
});

import authService from '../services/auth.service';
import authRoutes from './auth.routes';
import { db } from '../config/database';

describe('Auth Routes (API Tests)', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/register', () => {
    it('returns 400 when email format is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: 'ValidPassword123' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].msg).toContain('valid email');
    });

    it('returns 400 when password is shorter than 6 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@hardware.ng', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].msg).toContain('at least 6 characters');
    });

    it('returns 201 with user and token on successful registration', async () => {
      const mockResult = {
        user: { id: 1, email: 'founder@nigeria.ng', role: 'explorer' },
        token: 'mock-jwt-token-xyz',
      };
      (authService.register as jest.Mock).mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'founder@nigeria.ng',
          password: 'StrongPassword123!',
          role: 'explorer',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('founder@nigeria.ng');
      expect(response.body.token).toBe('mock-jwt-token-xyz');
    });

    it('returns 409 when email already exists', async () => {
      const duplicateError: any = new Error('Email already registered');
      duplicateError.statusCode = 409;
      (authService.register as jest.Mock).mockRejectedValue(duplicateError);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@fabnetwork.ng',
          password: 'Password123!',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns 200 with token on valid credentials', async () => {
      const mockLoginResult = {
        user: { id: 5, email: 'machinist@aba.ng', role: 'provider' },
        token: 'auth-jwt-token-abc',
      };
      (authService.login as jest.Mock).mockResolvedValue(mockLoginResult);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'machinist@aba.ng', password: 'CorrectPassword' });

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(5);
      expect(response.body.token).toBe('auth-jwt-token-abc');
    });

    it('returns 401 when invalid credentials provided', async () => {
      (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@hardware.ng', password: 'BadPassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('returns 401 when Authorization header is missing', async () => {
      const response = await request(app).get('/api/auth/me');
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No token provided');
    });

    it('returns 200 with user profile when valid bearer token is provided', async () => {
      const token = jwt.sign(
        { id: 42, email: 'verified@hardware.ng', role: 'explorer' },
        process.env.JWT_SECRET!
      );

      // Mock user, profile, and onboarding DB responses
      (db.select as jest.Mock)
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ id: 42, email: 'verified@hardware.ng', role: 'explorer' }]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ userId: 42, firstName: 'Femi', lastName: 'Founder' }]),
          }),
        })
        .mockReturnValueOnce({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        });

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('verified@hardware.ng');
      expect(response.body.profile.firstName).toBe('Femi');
    });
  });
});
