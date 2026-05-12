import { NextResponse } from 'next/server';
import { getContactMessages, createContactMessage, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    const messages = await getContactMessages();
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ detail: 'Error fetching messages' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initializeDatabase();
    const data = await request.json();
    const message = await createContactMessage(data);
    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ detail: 'Error creating message' }, { status: 500 });
  }
}
