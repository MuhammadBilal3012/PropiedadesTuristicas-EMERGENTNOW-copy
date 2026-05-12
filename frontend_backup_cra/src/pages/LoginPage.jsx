import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { login, setupAdmin } from '../lib/api';
import { toast } from 'sonner';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Por favor ingrese usuario y contraseña');
      return;
    }
    
    setLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      onLogin(data.user);
      toast.success(`Bienvenido, ${data.user.username}`);
      navigate('/admin/dashboard');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Usuario o contraseña incorrectos');
      } else {
        toast.error('Error al iniciar sesión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async () => {
    setLoading(true);
    try {
      const data = await setupAdmin();
      toast.success(`Usuario admin creado. Usuario: ${data.username}, Contraseña: ${data.password}`);
      setUsername(data.username);
      setPassword(data.password);
      setSetupMode(false);
    } catch (error) {
      if (error.response?.data?.message?.includes('already exists')) {
        toast.info('El usuario admin ya existe');
      } else {
        toast.error('Error al crear usuario admin');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="login-page" className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#C5A059' }}>
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Panel de Administración
          </h1>
          <p className="text-stone-400 mt-2">
            Ingresa tus credenciales para acceder
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="text-slate-700">Usuario</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-stone-50"
                  placeholder="Ingrese su usuario"
                  data-testid="login-username"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
              <div className="relative mt-2">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-stone-50"
                  placeholder="Ingrese su contraseña"
                  data-testid="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white font-semibold"
              style={{ backgroundColor: '#C5A059' }}
              data-testid="login-submit"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          {/* Setup Admin */}
          <div className="mt-6 pt-6 border-t border-stone-200">
            <p className="text-sm text-stone-500 text-center mb-4">
              ¿Primera vez? Crea el usuario administrador
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={handleSetup}
              disabled={loading}
              className="w-full"
              data-testid="setup-admin-btn"
            >
              Crear Usuario Admin
            </Button>
          </div>
        </div>

        {/* Back to site */}
        <p className="text-center mt-6">
          <a href="/" className="text-stone-400 hover:text-white text-sm transition-colors">
            ← Volver al sitio web
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
