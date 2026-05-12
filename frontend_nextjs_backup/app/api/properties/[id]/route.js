import { NextResponse } from 'next/server';
import { getPropertyById, updateProperty, deleteProperty, initializeDatabase } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    await initializeDatabase();
    const { id } = await params;
    const property = await getPropertyById(id);
    
    if (!property) {
      return NextResponse.json({ detail: 'Propiedad no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    return NextResponse.json({ detail: 'Error fetching property' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await initializeDatabase();
    const { id } = await params;
    const data = await request.json();
    const property = await updateProperty(id, data);
    
    if (!property) {
      return NextResponse.json({ detail: 'Propiedad no encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(property);
  } catch (error) {
    console.error('Update property error:', error);
    return NextResponse.json({ detail: 'Error updating property' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await initializeDatabase();
    const { id } = await params;
    await deleteProperty(id);
    return NextResponse.json({ message: 'Propiedad eliminada' });
  } catch (error) {
    console.error('Delete property error:', error);
    return NextResponse.json({ detail: 'Error deleting property' }, { status: 500 });
  }
}
