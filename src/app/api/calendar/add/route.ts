import { NextRequest, NextResponse } from 'next/server';

/**
 * Calendar API route
 * Generates a Google Calendar event URL for election-related dates.
 * For full OAuth integration, this would use the Google Calendar API.
 * For MVP, we generate a direct "add to calendar" URL.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, startTime, endTime, location } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Title and date are required.' },
        { status: 400 }
      );
    }

    // Format dates for Google Calendar URL
    // Date format: YYYYMMDD or YYYYMMDDTHHmmssZ
    const startDate = startTime
      ? `${date.replace(/-/g, '')}T${startTime.replace(/:/g, '')}00`
      : date.replace(/-/g, '');
    const endDate = endTime
      ? `${date.replace(/-/g, '')}T${endTime.replace(/:/g, '')}00`
      : date.replace(/-/g, '');

    // Build Google Calendar URL
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      dates: `${startDate}/${endDate}`,
      details: description || 'Election day - exercise your right to vote!',
      location: location || '',
      ctz: 'Asia/Kolkata',
    });

    const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;

    return NextResponse.json({
      calendarUrl,
      message: 'Calendar event URL generated successfully.',
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar event.' },
      { status: 500 }
    );
  }
}
