import { NextResponse } from 'next/server';
import { getUserById, updateUser, deleteUser, initializeDatabase } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await initializeDatabase();
    const { id } = await params;
    const user = await getUserById(id);
    
    if (!user) {
      return NextResponse.json({ detail: 'Usuario no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ detail: 'Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await initializeDatabase();
    const { id } = await params;
    const data = await request.json();

    const updateData = { ...data };
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }
    
    const user = await updateUser(id, updateData);
    return NextResponse.json(user || {});
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ detail: 'Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await initializeDatabase();
    const { id } = await params;
    await deleteUser(id);
    return NextResponse.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ detail: 'Error' }, { status: 500 });
  }
}
