import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { authOptions } from './auth-config';
import { connectToDatabase } from './mongo';
import { User } from '@/models/User';

/**
 * Get the current authenticated user from the request
 * @param request - Next.js request object
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(request: NextRequest) {
  try {
    // For Next.js 13+ App Router, we need to get the token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.email) {
      console.log('No token or email found');
      return null;
    }

    console.log('Token found for email:', token.email);

    await connectToDatabase();
    
    const user = await User.findOne({ email: token.email });
    console.log('User found:', user ? 'yes' : 'no');
    if (user) {
      console.log('User ID from database:', user._id);
      console.log('User ID type:', typeof user._id);
      console.log('User ID toString:', user._id.toString());
    }
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Verify that the user is authenticated and return user data
 * @param request - Next.js request object
 * @returns User object or throws error if not authenticated
 */
export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
}

/**
 * Check if the user owns the resource
 * @param userId - User ID from the request
 * @param resourceUserId - User ID from the resource
 * @returns boolean indicating ownership
 */
export function checkOwnership(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId;
}

/**
 * Get user ID from the request
 * @param request - Next.js request object
 * @returns User ID string or null
 */
export async function getUserId(request: NextRequest): Promise<string | null> {
  const user = await getCurrentUser(request);
  return user?._id?.toString() || null;
}
