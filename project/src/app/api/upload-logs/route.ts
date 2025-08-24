import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { connectToDatabase } from '@/lib/mongo';
import { UploadLog } from '@/models/UploadLog';

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
    
    console.log('Upload logs API - Session user:', {
      id: session.user.id,
      email: session.user.email,
      idType: typeof session.user.id,
      emailType: typeof session.user.email
    });

    // Connect to database
    await connectToDatabase();

    // Fetch upload logs for the authenticated user
    // Try multiple userId formats since the session might have different ID types
    const userIds = [
      session.user.id,
      session.user.email,
      session.user.id?.toString(),
      session.user.email?.toString()
    ].filter(Boolean); // Remove undefined/null values
    
    console.log('Looking for logs with userIds:', userIds);
    
    // First, let's see all upload logs in the database for debugging
    const allLogs = await UploadLog.find({}).lean();
    console.log(`Total upload logs in database: ${allLogs.length}`);
    if (allLogs.length > 0) {
      console.log('Sample log:', {
        _id: allLogs[0]._id,
        userId: allLogs[0].userId,
        fileName: allLogs[0].fileName,
        dataType: allLogs[0].dataType
      });
    }
    
    const logs = await UploadLog.find({ 
      userId: { $in: userIds }
    })
    .sort({ createdAt: -1 }) // Sort by creation date descending
    .lean(); // Convert to plain objects for better performance
    
    console.log(`Found ${logs.length} logs for user with userIds:`, userIds);

    return NextResponse.json({
      success: true,
      logs
    });

  } catch (error) {
    console.error('Error fetching upload logs:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}