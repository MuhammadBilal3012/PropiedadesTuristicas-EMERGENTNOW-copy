'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Inicio de sesión exitoso');
        router.push('/admin');
      } else {
        toast.error(data.detail || 'Credenciales inválidas');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-900 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">Panel Administrativo</h1>
            <p className="text-stone-500 mt-2">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                data-testid="login-username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                required
                className="mt-1.5 bg-stone-50"
                placeholder="admin"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                data-testid="login-password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                required
                className="mt-1.5 bg-stone-50"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              data-testid="login-submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold"
              style={{ backgroundColor: '#0F172A' }}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Ingresando...</>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
