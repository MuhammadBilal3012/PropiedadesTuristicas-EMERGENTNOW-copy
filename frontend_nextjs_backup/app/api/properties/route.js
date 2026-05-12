import { NextResponse } from 'next/server';
import { getProperties, createProperty, initializeDatabase } from '@/lib/db';

export async function GET(request) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    
    const filters = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      location: searchParams.get('location'),
      min_price: searchParams.get('min_price'),
      max_price: searchParams.get('max_price'),
      bedrooms: searchParams.get('bedrooms'),
      property_type: searchParams.get('property_type'),
      status: searchParams.get('status'),
      featured_only: searchParams.get('featured_only') === 'true',
    };

    const result = await getProperties(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Get properties error:', error);
    return NextResponse.json({ detail: 'Error fetching properties' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initializeDatabase();
    const data = await request.json();
    const property = await createProperty(data);
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Create property error:', error);
    return NextResponse.json({ detail: 'Error creating property' }, { status: 500 });
  }
}
