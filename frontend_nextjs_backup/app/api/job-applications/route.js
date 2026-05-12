import { NextResponse } from 'next/server';
import { getJobApplications, createJobApplication, initializeDatabase } from '@/lib/db';

export async function GET() {
  try {
    await initializeDatabase();
    const applications = await getJobApplications();
    return NextResponse.json(applications);
  } catch (error) {
    console.error('Get job applications error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initializeDatabase();
    const data = await request.json();
    const application = await createJobApplication(data);
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Create job application error:', error);
    return NextResponse.json({ detail: 'Error' }, { status: 500 });
  }
}
