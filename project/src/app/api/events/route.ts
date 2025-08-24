// app/api/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { eventIntelligence } from '@/lib/event-intelligence';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    console.log('Events API: Getting events for user:', userId);

    // Get active events
    const activeEvents = eventIntelligence.getActiveEvents();
    const eventStats = eventIntelligence.getEventStatistics();

    return NextResponse.json({
      success: true,
      data: {
        activeEvents,
        statistics: eventStats
      },
      message: 'Events retrieved successfully'
    });

  } catch (error) {
    console.error('Events API Error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(request);
    const userId = user._id.toString();

    const body = await request.json();
    const { newsText } = body;

    if (!newsText) {
      return NextResponse.json(
        { success: false, error: 'News text is required' },
        { status: 400 }
      );
    }

    console.log('Events API: Ingesting news event for user:', userId);

    // Ingest news event
    const event = await eventIntelligence.ingestNewsEvent(newsText);

    if (!event) {
      return NextResponse.json(
        { success: false, error: 'Failed to process news event' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event,
      message: 'Event ingested successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Events API Error:', error);
    
    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to ingest event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
