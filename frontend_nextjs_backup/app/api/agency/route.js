import { NextResponse } from 'next/server';
import { getAgencySettings, updateAgencySettings, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    const settings = await getAgencySettings();
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error('Get agency error:', error);
    return NextResponse.json({ detail: 'Error fetching settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await initializeDatabase();
    const data = await request.json();
    const settings = await updateAgencySettings(data);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Update agency error:', error);
    return NextResponse.json({ detail: 'Error updating settings' }, { status: 500 });
  }
}
