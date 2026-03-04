/**
 * Authentication utilities for session management
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  onboardingCompleted: boolean;
  [key: string]: unknown;
}

export interface AuthResult {
  isAuthenticated: boolean;
  user: AuthUser | null;
}

/**
 * Verify the current session by checking the token with the backend
 * @returns Promise<AuthResult> - Whether the user is authenticated and user data
 */
export async function verifySession(): Promise<AuthResult> {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return { isAuthenticated: false, user: null };
  }
  
  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(data.user));
      return { isAuthenticated: true, user: data.user };
    } else {
      // Token is invalid, clear storage
      clearSession();
      return { isAuthenticated: false, user: null };
    }
  } catch {
    // Network error - use cached data if available
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return { isAuthenticated: true, user };
      } catch {
        return { isAuthenticated: false, user: null };
      }
    }
    return { isAuthenticated: false, user: null };
  }
}

/**
 * Check if there's a token stored (doesn't verify validity)
 * @returns boolean - Whether a token exists
 */
export function hasStoredToken(): boolean {
  return !!localStorage.getItem('token');
}

/**
 * Get the stored user data without verification
 * @returns AuthUser | null
 */
export function getStoredUser(): AuthUser | null {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Clear all session data from localStorage
 */
export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Save session data after successful login/register
 * @param token - JWT token
 * @param user - User data
 */
export function saveSession(token: string, user: AuthUser): void {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export { API_URL };
