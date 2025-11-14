import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { users, profiles } from '../models/schema';
import { eq } from 'drizzle-orm';

export class AuthService {
  async register(email: string, password: string, role: string = 'buyer') {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [user] = await db.insert(users).values({
      email,
      password: hashedPassword,
      role: role as any,
    }).returning();

    // Create profile
    await db.insert(profiles).values({
      userId: user.id,
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user || !user.password) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  async googleAuth(googleId: string, email: string, profile: any) {
    let [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    
    if (!user) {
      [user] = await db.insert(users).values({
        email,
        googleId,
        isVerified: true,
      }).returning();

      await db.insert(profiles).values({
        userId: user.id,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        avatar: profile.photos?.[0]?.value,
      });
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  private generateToken(user: any) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  }
}

export default new AuthService();
