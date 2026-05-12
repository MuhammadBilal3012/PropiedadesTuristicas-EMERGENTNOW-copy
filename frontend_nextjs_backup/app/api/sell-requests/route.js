import { NextResponse } from 'next/server';
import { getSellRequests, createSellRequest, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    const requests = await getSellRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Get sell requests error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initializeDatabase();
    const data = await request.json();
    const sellRequest = await createSellRequest(data);
    return NextResponse.json(sellRequest, { status: 201 });
  } catch (error) {
    console.error('Create sell request error:', error);
    return NextResponse.json({ detail: 'Error' }, { status: 500 });
  }
}
