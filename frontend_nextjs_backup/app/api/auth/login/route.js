import { NextResponse } from 'next/server';
import { getUserByUsername, createUser, initializeDatabase } from '@/lib/db';
import { verifyPassword, createToken, setSession } from '@/lib/auth';

export async function POST(request) {
  try {
    await initializeDatabase();
    
    const { username, password } = await request.json();
    console.log('[LOGIN] Attempting login for:', username);

    if (!username || !password) {
      return NextResponse.json(
        { detail: 'Usuario y contraseña requeridos' },
        { status: 400 }
      );
    }

    // Find user
    const user = await getUserByUsername(username);
    console.log('[LOGIN] User found:', !!user);
    console.log('[LOGIN] User has password:', !!user?.password);

    if (!user) {
      console.log('[LOGIN] User not found');
      return NextResponse.json(
        { detail: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('[LOGIN] Verifying password...');
    const validPassword = await verifyPassword(password, user.password);
    console.log('[LOGIN] Password valid:', validPassword);
    
    if (!validPassword) {
      console.log('[LOGIN] Invalid password');
      return NextResponse.json(
        { detail: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Create token
    const token = await createToken({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    // Set session cookie
    await setSession(token);

    console.log('[LOGIN] Success for user:', user.username);
    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nombre_completo: user.nombre_completo,
        telefono_whatsapp: user.telefono_whatsapp,
        foto_perfil: user.foto_perfil,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { detail: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
