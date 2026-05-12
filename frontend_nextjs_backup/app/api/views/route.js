import { NextResponse } from 'next/server';
import { getTotalViews, incrementViews, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    const totalViews = await getTotalViews();
    return NextResponse.json({ total_views: totalViews });
  } catch (error) {
    console.error('Get views error:', error);
    return NextResponse.json({ total_views: 0 });
  }
}

export async function POST(request) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || 'home';
    const propertyId = searchParams.get('property_id');
    await incrementViews(page, propertyId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error);
    return NextResponse.json({ success: false });
  }
}
