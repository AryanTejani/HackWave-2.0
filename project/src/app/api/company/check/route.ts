import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { connectToDatabase } from '@/lib/mongo';
import { Company } from '@/models/Company';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const company = await Company.findOne({ userId: session.user.id });
    
    if (!company) {
      return NextResponse.json({
        exists: false,
        isComplete: false
      });
    }
    
    return NextResponse.json({
      exists: true,
      isComplete: company.isProfileComplete || false,
      company
    });
  } catch (error) {
    console.error('Error checking company profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
