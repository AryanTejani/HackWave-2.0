import { NextRequest, NextResponse } from 'next/server';
import { seedDemoData, checkDemoData } from '@/lib/demo-data/seeder';
import { requireAuth } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    const result = await seedDemoData(userId);
    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully for your account',
      data: result
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    console.error('Error seeding demo data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed demo data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    const data = await checkDemoData(userId);
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    console.error('Error checking demo data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check demo data' 
      },
      { status: 500 }
    );
  }
}
