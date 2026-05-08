import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { users, profiles } from '../models/schema';
import { eq } from 'drizzle-orm';

export class AuthService {
  async register(email: string, password: string, role: string = 'explorer') {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email));
      if (existingUser.length > 0) {
        const duplicateError = new Error('Email already registered') as Error & { statusCode?: number };
        duplicateError.statusCode = 409;
        throw duplicateError;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      const [user] = await db.insert(users).values({
        email,
        password: hashedPassword,
        role: role as any,
      }).returning();

      // Create profile with safe defaults
      await db.insert(profiles).values({
        userId: user.id,
        firstName: email.split('@')[0], // Use email prefix as default first name
      });

      const token = this.generateToken(user);
      return { user, token };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    if (!user || !user.password) {
      console.warn('Login failed: user not found or no password for email:', email);
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      console.warn('Login failed: password mismatch for email:', email);
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    console.log('Login successful for:', email);
    return { user, token };
  }

  async googleAuth(googleId: string, email: string, profile: any) {
    let [user] = await db.select().from(users).where(eq(users.googleId, googleId));

    if (!user) {
      const [existingEmailUser] = await db.select().from(users).where(eq(users.email, email));

      if (existingEmailUser) {
        const [linkedUser] = await db
          .update(users)
          .set({
            googleId,
            isVerified: true,
          })
          .where(eq(users.id, existingEmailUser.id))
          .returning();

        user = linkedUser;
      }
    }
    
    if (!user) {
      [user] = await db.insert(users).values({
        email,
        googleId,
        isVerified: true,
      }).returning();
    }

    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, user.id));
    if (!existingProfile) {
      // Only include defined fields in profile insert to avoid 'default' keyword issues
      const profileData: any = {
        userId: user.id,
      };

      if (profile.name?.givenName) {
        profileData.firstName = profile.name.givenName;
      }
      if (profile.name?.familyName) {
        profileData.lastName = profile.name.familyName;
      }
      if (profile.photos?.[0]?.value) {
        profileData.avatar = profile.photos[0].value;
      }

      // If no firstName provided, use email prefix as fallback
      if (!profileData.firstName) {
        profileData.firstName = email.split('@')[0];
      }

      await db.insert(profiles).values(profileData);
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  generateToken(user: any) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: '7d' }
    );
  }
}

export default new AuthService();
