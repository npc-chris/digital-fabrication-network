import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'super-secure-test-jwt-secret-32-chars-long';

// Mock database module
jest.mock('../config/database', () => {
  return {
    db: {
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
    },
  };
});

import { AuthService } from './auth.service';
import { db } from '../config/database';

describe('AuthService (Unit Tests)', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('register', () => {
    it('successfully registers an explorer user, hashes password, creates profile, and returns a token', async () => {
      const mockUser = {
        id: 1,
        email: 'founder@hardware.ng',
        role: 'explorer',
        password: 'hashed_password_123',
      };

      // Mock duplicate check returning empty array
      const selectWhereMock = jest.fn().mockResolvedValue([]);
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: selectWhereMock,
        }),
      });

      // Mock db.insert for user
      const returningUserMock = jest.fn().mockResolvedValue([mockUser]);
      const valuesUserMock = jest.fn().mockReturnValue({ returning: returningUserMock });

      // Mock db.insert for profile
      const valuesProfileMock = jest.fn().mockResolvedValue([]);

      (db.insert as jest.Mock)
        .mockReturnValueOnce({ values: valuesUserMock })
        .mockReturnValueOnce({ values: valuesProfileMock });

      const result = await authService.register('founder@hardware.ng', 'Secr3tP@ssword', 'explorer');

      expect(result).toBeDefined();
      expect(result.user.email).toBe('founder@hardware.ng');
      expect(result.token).toBeDefined();

      // Verify JWT payload
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET!) as any;
      expect(decoded.email).toBe('founder@hardware.ng');
      expect(decoded.role).toBe('explorer');
    });

    it('successfully registers a provider (workshop) user', async () => {
      const mockProvider = {
        id: 2,
        email: 'machinist@aba-cluster.ng',
        role: 'provider',
        password: 'hashed_password_456',
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      (db.insert as jest.Mock)
        .mockReturnValueOnce({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockProvider]),
          }),
        })
        .mockReturnValueOnce({
          values: jest.fn().mockResolvedValue([]),
        });

      const result = await authService.register('machinist@aba-cluster.ng', 'PrecisionP@ss', 'provider');

      expect(result.user.role).toBe('provider');
      const decoded = jwt.verify(result.token, process.env.JWT_SECRET!) as any;
      expect(decoded.role).toBe('provider');
    });

    it('rejects duplicate email with 409 status code', async () => {
      // Mock existing user found
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([{ id: 99, email: 'duplicate@fabnetwork.ng' }]),
        }),
      });

      await expect(
        authService.register('duplicate@fabnetwork.ng', 'Pass1234', 'explorer')
      ).rejects.toMatchObject({
        message: 'Email already registered',
        statusCode: 409,
      });
    });
  });

  describe('login', () => {
    it('successfully authenticates valid email and password', async () => {
      const plainPassword = 'CorrectPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const existingUser = {
        id: 10,
        email: 'kemi@rawstock.ng',
        password: hashedPassword,
        role: 'explorer',
      };

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([existingUser]),
        }),
      });

      const result = await authService.login('kemi@rawstock.ng', plainPassword);

      expect(result).toBeDefined();
      expect(result.user.id).toBe(10);
      expect(result.token).toBeDefined();

      const decoded = jwt.verify(result.token, process.env.JWT_SECRET!) as any;
      expect(decoded.id).toBe(10);
      expect(decoded.email).toBe('kemi@rawstock.ng');
    });

    it('throws Invalid credentials when email does not exist', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        authService.login('unknown@hardware.ng', 'AnyPassword123')
      ).rejects.toThrow('Invalid credentials');
    });

    it('throws Invalid credentials when password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('OriginalPassword', 10);

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { id: 11, email: 'machinist@ikeja.ng', password: hashedPassword },
          ]),
        }),
      });

      await expect(
        authService.login('machinist@ikeja.ng', 'WrongPassword!')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
