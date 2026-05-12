import { NextResponse } from 'next/server';
import { getLocations, initializeDatabase } from '@/lib/db';

export async function GET(request) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active_only') === 'true';
    const locations = await getLocations(activeOnly);
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    return NextResponse.json({ detail: 'Error fetching locations' }, { status: 500 });
  }
}
