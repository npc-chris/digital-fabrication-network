import express from 'express';
import request from 'supertest';

jest.mock('../config/database', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    execute: jest.fn(),
  },
}));

import waitlistRoutes, { formatHexPriorityCode } from './waitlist.routes';
import { db } from '../config/database';

describe('Waitlist Routes & Priority Code Formatter', () => {
  let app: express.Express;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/waitlist', waitlistRoutes);
  });

  it('formats sequential hex priority codes deterministically', () => {
    expect(formatHexPriorityCode(1)).toBe('DFN-0x0001');
    expect(formatHexPriorityCode(15)).toBe('DFN-0x000F');
    expect(formatHexPriorityCode(255)).toBe('DFN-0x00FF');
    expect(formatHexPriorityCode(0)).toBe('DFN-0x0001');
  });

  it('rejects invalid or missing waitlist email submissions', async () => {
    (db.execute as jest.Mock).mockResolvedValue({ rows: [] });

    const missing = await request(app).post('/api/waitlist').send({ fullName: 'Ada' });
    expect(missing.status).toBe(400);

    const invalid = await request(app).post('/api/waitlist').send({ email: 'not-an-email' });
    expect(invalid.status).toBe(400);
  });

  it('registers new applicants with sequential hex queue code', async () => {
    (db.execute as jest.Mock).mockResolvedValue({ rows: [{ count: 14 }] });

    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    (db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([
          {
            id: 15,
            email: 'hardware@lagos.ng',
            role: 'explorer',
            queueNumber: 15,
          },
        ]),
      }),
    });

    const res = await request(app).post('/api/waitlist').send({
      email: 'Hardware@Lagos.NG',
      fullName: 'Tunde Ade',
      role: 'explorer',
      organization: 'Yaba Robotics',
    });

    expect(res.status).toBe(201);
    expect(res.body.queueNumber).toBe(15);
    expect(res.body.hexCode).toBe('DFN-0x000F');
    expect(res.body.alreadyRegistered).toBe(false);
  });

  it('retrieves existing priority spot on duplicate signup', async () => {
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([
            {
              id: 3,
              email: 'existing@fab.ng',
              role: 'provider',
              queueNumber: 3,
              fullName: 'Chidi Okafor',
              organization: 'Ogun CNC',
            },
          ]),
        }),
      }),
    });

    const res = await request(app)
      .post('/api/waitlist')
      .send({ email: 'existing@fab.ng' });

    expect(res.status).toBe(200);
    expect(res.body.alreadyRegistered).toBe(true);
    expect(res.body.hexCode).toBe('DFN-0x0003');
  });
});
