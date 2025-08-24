import { NextRequest, NextResponse } from 'next/server';
import { seedDemoData, checkDemoData } from '@/lib/demo-data/seeder';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id || session.user.email;

    const result = await seedDemoData(userId);
    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully for your account',
      data: result
    });
  } catch (error) {
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id || session.user.email;

    const data = await checkDemoData(userId);
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
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
