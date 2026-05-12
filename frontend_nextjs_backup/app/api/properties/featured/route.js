import { NextResponse } from 'next/server';
import { getFeaturedProperties, initializeDatabase } from '@/lib/db';

export async function GET(request) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 6;
    const properties = await getFeaturedProperties(limit);
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Get featured properties error:', error);
    return NextResponse.json({ detail: 'Error fetching featured properties' }, { status: 500 });
  }
}
