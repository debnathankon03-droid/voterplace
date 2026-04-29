import { NextRequest, NextResponse } from 'next/server';

/**
 * Profile API route
 * In production, this would read/write to Firestore.
 * For MVP, profiles are stored in localStorage (client-side).
 * This route is a placeholder for future Firestore integration.
 */

export async function GET() {
  return NextResponse.json({
    message: 'Profile endpoint ready. In production, this reads from Firestore.',
    hint: 'Profiles are currently stored in localStorage for MVP.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { age, state, voterStatus, preferredLanguage } = body;

    if (!age || !state || !voterStatus || !preferredLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: age, state, voterStatus, preferredLanguage' },
        { status: 400 }
      );
    }

    // In production: save to Firestore
    // const docRef = doc(db, 'profiles', uid);
    // await setDoc(docRef, { ...body, updatedAt: Date.now() });

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully.',
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to save profile.' },
      { status: 500 }
    );
  }
}
