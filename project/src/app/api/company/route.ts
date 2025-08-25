import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { connectToDatabase } from '@/lib/mongo';
import { Company } from '@/models/Company';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    const body = await request.json();
    const { userId, ...companyData } = body;

    // Validate required fields
    if (!companyData.name) {
      return NextResponse.json(
        { message: 'Company name is required' },
        { status: 400 }
      );
    }

    // Check if company profile already exists
    const existingCompany = await Company.findOne({ userId: session.user.id });
    
    if (existingCompany) {
      // Update existing profile
      const updatedCompany = await Company.findOneAndUpdate(
        { userId: session.user.id },
        { 
          ...companyData,
          isProfileComplete: true,
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );
      
      return NextResponse.json({
        message: 'Company profile updated successfully',
        company: updatedCompany
      });
    } else {
      // Create new profile
      const newCompany = await Company.create({
        userId: session.user.id,
        ...companyData,
        isProfileComplete: true
      });
      
      return NextResponse.json({
        message: 'Company profile created successfully',
        company: newCompany
      }, { status: 201 });
    }
  } catch (error) {
    console.error('Error in company API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      return NextResponse.json(
        { message: 'Company profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ company });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
