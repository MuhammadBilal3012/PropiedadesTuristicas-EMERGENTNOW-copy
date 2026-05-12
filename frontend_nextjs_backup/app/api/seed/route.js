import { NextResponse } from 'next/server';
import { initializeDatabase, seedDatabase } from '@/lib/db';

export async function POST() {
  try {
    await initializeDatabase();
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ detail: 'Error seeding database' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await initializeDatabase();
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ detail: 'Error seeding database' }, { status: 500 });
  }
}
