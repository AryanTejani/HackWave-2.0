import { NextRequest, NextResponse } from 'next/server';
import { seedDemoData, checkDemoData } from '@/lib/demo-data/seeder';

export async function POST(request: NextRequest) {
  try {
    const result = await seedDemoData();
    return NextResponse.json({
      success: true,
      message: 'Demo data seeded successfully',
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

export async function GET() {
  try {
    const data = await checkDemoData();
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
