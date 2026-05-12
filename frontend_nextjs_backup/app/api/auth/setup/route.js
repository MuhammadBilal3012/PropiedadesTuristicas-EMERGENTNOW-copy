import { NextResponse } from 'next/server';
import { getUserByUsername, createUser, initializeDatabase } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    await initializeDatabase();

    // Check if admin exists
    const admin = await getUserByUsername('admin');

    if (admin) {
      return NextResponse.json({
        message: 'Admin user already exists',
        username: admin.username,
      });
    }

    // Create admin user
    const hashedPassword = await hashPassword('admin123');
    await createUser({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      nombre_completo: 'Administrador',
    });

    return NextResponse.json({
      message: 'Admin user created',
      username: 'admin',
      password: 'admin123',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { detail: 'Error creating admin user' },
      { status: 500 }
    );
  }
}
