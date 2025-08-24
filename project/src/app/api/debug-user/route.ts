import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug User API: GET request received');
    
    // Get authenticated user
    const user = await requireAuth(request);
    
    console.log('Debug User API: User object:', {
      _id: user._id,
      _idType: typeof user._id,
      _idString: user._id.toString(),
      email: user.email,
      name: user.name
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        idType: typeof user._id,
        idString: user._id.toString(),
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Debug User API: Error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Unknown error' },
      { status: 500 }
    );
  }
}
