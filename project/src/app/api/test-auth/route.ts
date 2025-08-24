import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('Test Auth API: GET request received');
    
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();
    
    console.log('Test Auth API: User authenticated, userId:', userId);
    
    return NextResponse.json({
      success: true,
      message: 'Authentication working',
      user: {
        id: userId,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Test Auth API: Error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
