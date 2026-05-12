import { NextResponse } from 'next/server';
import { getUsers, createUser, getUserByUsername, initializeDatabase } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function GET() {
  try {
    await initializeDatabase();
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initializeDatabase();
    const data = await request.json();
    
    // Check if username exists
    const existing = await getUserByUsername(data.username);
    if (existing) {
      return NextResponse.json({ detail: 'El nombre de usuario ya existe' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await createUser({
      username: data.username,
      password: hashedPassword,
      role: data.role || 'agente',
      nombre_completo: data.nombre_completo || '',
      telefono_whatsapp: data.telefono_whatsapp || '',
      foto_perfil: data.foto_perfil || '',
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ detail: 'Error al crear usuario' }, { status: 500 });
  }
}
