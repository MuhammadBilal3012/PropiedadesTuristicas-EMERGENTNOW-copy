'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Home, Users, Settings, FileText, LogOut, Briefcase, 
  Loader2, Plus, Pencil, Trash2, Eye, X, Upload, Save, Image
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('propiedades');
  
  // Data states
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [agency, setAgency] = useState(null);
  const [sellRequests, setSellRequests] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [locations, setLocations] = useState([]);

  // Form states
  const [propertyForm, setPropertyForm] = useState(getEmptyPropertyForm());
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'agente', nombre_completo: '', telefono_whatsapp: '' });
  const [editingProperty, setEditingProperty] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  function getEmptyPropertyForm() {
    return {
      title: '', description: '', price: '', currency: 'USD', location: '',
      address: '', bedrooms: '', bathrooms: '', area: '', property_type: 'Casa',
      status: 'Disponible', images: [], is_featured: false, amenities: [],
      latitude: '', longitude: ''
    };
  }

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      if (!token || !userData) {
        router.push('/login');
        return;
      }
      setUser(JSON.parse(userData));
      setLoading(false);
      loadData();
    };
    checkAuth();
  }, [router]);

  const loadData = async () => {
    try {
      const [propsRes, usersRes, agencyRes, sellRes, jobRes, locRes] = await Promise.all([
        fetch('/api/properties?limit=100'),
        fetch('/api/users'),
        fetch('/api/agency'),
        fetch('/api/sell-requests'),
        fetch('/api/job-applications'),
        fetch('/api/locations'),
      ]);

      const propsData = await propsRes.json();
      setProperties(propsData.properties || []);
      setUsers(await usersRes.json());
      setAgency(await agencyRes.json());
      setSellRequests(await sellRes.json());
      setJobApplications(await jobRes.json());
      setLocations(await locRes.json());
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      
      if (response.ok) {
        setPropertyForm(prev => ({
          ...prev,
          images: [...prev.images, { url: data.url, alt: file.name }]
        }));
        toast.success('Imagen subida correctamente');
      } else {
        toast.error(data.detail || 'Error al subir imagen');
      }
    } catch (error) {
      toast.error('Error al subir imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProperty = async () => {
    try {
      const method = editingProperty ? 'PUT' : 'POST';
      const url = editingProperty ? `/api/properties/${editingProperty.id}` : '/api/properties';
      
      const payload = {
        ...propertyForm,
        price: parseFloat(propertyForm.price) || 0,
        bedrooms: parseInt(propertyForm.bedrooms) || 0,
        bathrooms: parseInt(propertyForm.bathrooms) || 0,
        area: parseFloat(propertyForm.area) || 0,
        latitude: propertyForm.latitude ? parseFloat(propertyForm.latitude) : null,
        longitude: propertyForm.longitude ? parseFloat(propertyForm.longitude) : null,
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingProperty ? 'Propiedad actualizada' : 'Propiedad creada');
        setPropertyDialogOpen(false);
        setEditingProperty(null);
        setPropertyForm(getEmptyPropertyForm());
        loadData();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Error al guardar propiedad');
      }
    } catch (error) {
      toast.error('Error al guardar propiedad');
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta propiedad?')) return;
    try {
      await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      toast.success('Propiedad eliminada');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleSaveUser = async () => {
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm),
      });

      if (response.ok) {
        toast.success(editingUser ? 'Usuario actualizado' : 'Usuario creado');
        setUserDialogOpen(false);
        setEditingUser(null);
        setUserForm({ username: '', password: '', role: 'agente', nombre_completo: '', telefono_whatsapp: '' });
        loadData();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Error al guardar usuario');
      }
    } catch (error) {
      toast.error('Error al guardar usuario');
    }
  };

  const handleSaveAgency = async () => {
    try {
      const response = await fetch('/api/agency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agency),
      });

      if (response.ok) {
        toast.success('Configuración guardada');
        loadData();
      } else {
        toast.error('Error al guardar configuración');
      }
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const openEditProperty = (property) => {
    setEditingProperty(property);
    setPropertyForm({
      title: property.title || '',
      description: property.description || '',
      price: property.price?.toString() || '',
      currency: property.currency || 'USD',
      location: property.location || '',
      address: property.address || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      area: property.area?.toString() || '',
      property_type: property.property_type || 'Casa',
      status: property.status || 'Disponible',
      images: property.images || [],
      is_featured: property.is_featured || false,
      amenities: property.amenities || [],
      latitude: property.latitude?.toString() || '',
      longitude: property.longitude?.toString() || '',
    });
    setPropertyDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div data-testid="admin-page" className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8" style={{ color: '#C5A059' }} />
            <div>
              <h1 className="font-bold text-lg">Panel Administrativo</h1>
              <p className="text-xs text-stone-400">
                {isAdmin ? 'Administrador' : 'Agente'}: {user?.nombre_completo || user?.username}
              </p>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-slate-800">
            <LogOut className="h-4 w-4 mr-2" />Salir
          </Button>
        </div>
      </header>

      {/* Welcome Banner for Agents */}
      {!isAdmin && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-bold text-amber-800">
              ¡Bienvenido, {user?.nombre_completo || user?.username}!
            </h2>
            <p className="text-amber-700">
              Tienes {properties.filter(p => p.created_by === user?.id).length} propiedades registradas.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="propiedades" className="flex items-center gap-2">
              <Home className="h-4 w-4" />Propiedades
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="usuarios" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />Usuarios
                </TabsTrigger>
                <TabsTrigger value="configuracion" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />Configuración
                </TabsTrigger>
                <TabsTrigger value="solicitudes" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />Solicitudes
                </TabsTrigger>
                <TabsTrigger value="aplicaciones" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />Aplicaciones
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="propiedades">
            <div className="bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-xl font-bold">Propiedades</h2>
                <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => { setEditingProperty(null); setPropertyForm(getEmptyPropertyForm()); }}
                      style={{ backgroundColor: '#C5A059' }}
                      className="text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />Nueva Propiedad
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Título *</Label>
                          <Input value={propertyForm.title} onChange={(e) => setPropertyForm(p => ({ ...p, title: e.target.value }))} className="mt-1" />
                        </div>
                        <div>
                          <Label>Precio *</Label>
                          <div className="flex gap-2 mt-1">
                            <Input type="number" value={propertyForm.price} onChange={(e) => setPropertyForm(p => ({ ...p, price: e.target.value }))} className="flex-1" />
                            <Select value={propertyForm.currency} onValueChange={(v) => setPropertyForm(p => ({ ...p, currency: v }))}>
                              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="DOP">DOP</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Descripción</Label>
                        <Textarea value={propertyForm.description} onChange={(e) => setPropertyForm(p => ({ ...p, description: e.target.value }))} rows={3} className="mt-1" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Ubicación</Label>
                          <Select value={propertyForm.location} onValueChange={(v) => setPropertyForm(p => ({ ...p, location: v }))}>
                            <SelectTrigger className="mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                            <SelectContent>
                              {locations.map(loc => (
                                <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tipo</Label>
                          <Select value={propertyForm.property_type} onValueChange={(v) => setPropertyForm(p => ({ ...p, property_type: v }))}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Casa">Casa</SelectItem>
                              <SelectItem value="Apartamento">Apartamento</SelectItem>
                              <SelectItem value="Villa">Villa</SelectItem>
                              <SelectItem value="Terreno">Terreno</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Estado</Label>
                          <Select value={propertyForm.status} onValueChange={(v) => setPropertyForm(p => ({ ...p, status: v }))}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Disponible">Disponible</SelectItem>
                              <SelectItem value="Vendido">Vendido</SelectItem>
                              <SelectItem value="Reservado">Reservado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label>Habitaciones</Label>
                          <Input type="number" value={propertyForm.bedrooms} onChange={(e) => setPropertyForm(p => ({ ...p, bedrooms: e.target.value }))} className="mt-1" />
                        </div>
                        <div>
                          <Label>Baños</Label>
                          <Input type="number" value={propertyForm.bathrooms} onChange={(e) => setPropertyForm(p => ({ ...p, bathrooms: e.target.value }))} className="mt-1" />
                        </div>
                        <div>
                          <Label>Área (m²)</Label>
                          <Input type="number" value={propertyForm.area} onChange={(e) => setPropertyForm(p => ({ ...p, area: e.target.value }))} className="mt-1" />
                        </div>
                        <div className="flex items-end">
                          <div className="flex items-center gap-2">
                            <Checkbox checked={propertyForm.is_featured} onCheckedChange={(c) => setPropertyForm(p => ({ ...p, is_featured: c }))} />
                            <Label>Destacada</Label>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Latitud (opcional)</Label>
                          <Input type="number" step="any" value={propertyForm.latitude} onChange={(e) => setPropertyForm(p => ({ ...p, latitude: e.target.value }))} className="mt-1" placeholder="18.4861" />
                        </div>
                        <div>
                          <Label>Longitud (opcional)</Label>
                          <Input type="number" step="any" value={propertyForm.longitude} onChange={(e) => setPropertyForm(p => ({ ...p, longitude: e.target.value }))} className="mt-1" placeholder="-69.9312" />
                        </div>
                      </div>
                      <div>
                        <Label>Imágenes</Label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {propertyForm.images.map((img, i) => (
                            <div key={i} className="relative w-20 h-20">
                              <img src={img.url} alt="" className="w-full h-full object-cover" />
                              <button 
                                onClick={() => setPropertyForm(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i) }))}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          <label className="w-20 h-20 border-2 border-dashed border-stone-300 flex items-center justify-center cursor-pointer hover:border-amber-500">
                            {uploadingImage ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 text-stone-400" />}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                          </label>
                        </div>
                      </div>
                      <Button onClick={handleSaveProperty} style={{ backgroundColor: '#0F172A' }} className="text-white">
                        <Save className="h-4 w-4 mr-2" />{editingProperty ? 'Actualizar' : 'Crear'} Propiedad
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Imagen</th>
                      <th className="text-left py-3 px-2">Título</th>
                      <th className="text-left py-3 px-2">Ubicación</th>
                      <th className="text-left py-3 px-2">Precio</th>
                      <th className="text-left py-3 px-2">Estado</th>
                      <th className="text-left py-3 px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((prop) => (
                      <tr key={prop.id} className="border-b hover:bg-stone-50">
                        <td className="py-3 px-2">
                          <img src={prop.images?.[0]?.url || 'https://via.placeholder.com/60'} alt="" className="w-16 h-12 object-cover" />
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-medium">{prop.title}</span>
                          {prop.is_featured && <Badge className="ml-2 bg-amber-500">Destacada</Badge>}
                        </td>
                        <td className="py-3 px-2 text-stone-600">{prop.location}</td>
                        <td className="py-3 px-2 font-semibold">${prop.price?.toLocaleString()}</td>
                        <td className="py-3 px-2">
                          <Badge variant={prop.status === 'Disponible' ? 'default' : 'secondary'}>{prop.status}</Badge>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => openEditProperty(prop)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDeleteProperty(prop.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="usuarios">
              <div className="bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading text-xl font-bold">Usuarios</h2>
                  <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => { setEditingUser(null); setUserForm({ username: '', password: '', role: 'agente', nombre_completo: '', telefono_whatsapp: '' }); }} style={{ backgroundColor: '#C5A059' }} className="text-white">
                        <Plus className="h-4 w-4 mr-2" />Nuevo Usuario
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div>
                          <Label>Usuario *</Label>
                          <Input value={userForm.username} onChange={(e) => setUserForm(p => ({ ...p, username: e.target.value }))} disabled={!!editingUser} className="mt-1" />
                        </div>
                        <div>
                          <Label>{editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña *'}</Label>
                          <Input type="password" value={userForm.password} onChange={(e) => setUserForm(p => ({ ...p, password: e.target.value }))} className="mt-1" />
                        </div>
                        <div>
                          <Label>Nombre Completo</Label>
                          <Input value={userForm.nombre_completo} onChange={(e) => setUserForm(p => ({ ...p, nombre_completo: e.target.value }))} className="mt-1" />
                        </div>
                        <div>
                          <Label>Teléfono WhatsApp</Label>
                          <Input value={userForm.telefono_whatsapp} onChange={(e) => setUserForm(p => ({ ...p, telefono_whatsapp: e.target.value }))} className="mt-1" placeholder="+1809..." />
                        </div>
                        <div>
                          <Label>Rol</Label>
                          <Select value={userForm.role} onValueChange={(v) => setUserForm(p => ({ ...p, role: v }))}>
                            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="agente">Agente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleSaveUser} style={{ backgroundColor: '#0F172A' }} className="text-white">
                          <Save className="h-4 w-4 mr-2" />{editingUser ? 'Actualizar' : 'Crear'} Usuario
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {users.map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          {u.foto_perfil ? (
                            <img src={u.foto_perfil} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Users className="h-6 w-6 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{u.nombre_completo || u.username}</p>
                          <p className="text-sm text-stone-500">@{u.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingUser(u); setUserForm({ ...u, password: '' }); setUserDialogOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Settings Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="configuracion">
              <div className="bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-6">Configuración de la Agencia</h2>
                {agency && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Nombre de la Agencia</Label>
                        <Input value={agency.name || ''} onChange={(e) => setAgency(a => ({ ...a, name: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label>Logo URL</Label>
                        <Input value={agency.logo_url || ''} onChange={(e) => setAgency(a => ({ ...a, logo_url: e.target.value }))} className="mt-1" />
                      </div>
                    </div>
                    <Separator />
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Titular Hero</Label>
                        <Input value={agency.hero_headline || ''} onChange={(e) => setAgency(a => ({ ...a, hero_headline: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label>Subtitular Hero</Label>
                        <Input value={agency.hero_subheadline || ''} onChange={(e) => setAgency(a => ({ ...a, hero_subheadline: e.target.value }))} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label>Video Hero (URL de YouTube)</Label>
                      <Input value={agency.hero_video_url || ''} onChange={(e) => setAgency(a => ({ ...a, hero_video_url: e.target.value }))} className="mt-1" placeholder="https://youtube.com/watch?v=..." />
                    </div>
                    <Separator />
                    <h3 className="font-bold text-lg">Sección "Sobre Nosotros"</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Título</Label>
                        <Input value={agency.about_title || ''} onChange={(e) => setAgency(a => ({ ...a, about_title: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label>Años de Experiencia</Label>
                        <Input type="number" value={agency.about_years_experience || ''} onChange={(e) => setAgency(a => ({ ...a, about_years_experience: parseInt(e.target.value) }))} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label>Descripción</Label>
                      <Textarea value={agency.about_description || ''} onChange={(e) => setAgency(a => ({ ...a, about_description: e.target.value }))} rows={3} className="mt-1" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Misión</Label>
                        <Textarea value={agency.about_mission || ''} onChange={(e) => setAgency(a => ({ ...a, about_mission: e.target.value }))} rows={3} className="mt-1" />
                      </div>
                      <div>
                        <Label>Visión</Label>
                        <Textarea value={agency.about_vision || ''} onChange={(e) => setAgency(a => ({ ...a, about_vision: e.target.value }))} rows={3} className="mt-1" />
                      </div>
                    </div>
                    <Separator />
                    <h3 className="font-bold text-lg">Contacto</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <Label>Teléfono</Label>
                        <Input value={agency.phone || ''} onChange={(e) => setAgency(a => ({ ...a, phone: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label>WhatsApp</Label>
                        <Input value={agency.whatsapp || ''} onChange={(e) => setAgency(a => ({ ...a, whatsapp: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input value={agency.email || ''} onChange={(e) => setAgency(a => ({ ...a, email: e.target.value }))} className="mt-1" />
                      </div>
                    </div>
                    <Button onClick={handleSaveAgency} style={{ backgroundColor: '#C5A059' }} className="text-white">
                      <Save className="h-4 w-4 mr-2" />Guardar Configuración
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Sell Requests Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="solicitudes">
              <div className="bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-6">Solicitudes de Venta</h2>
                <div className="space-y-4">
                  {sellRequests.length === 0 ? (
                    <p className="text-stone-500 text-center py-8">No hay solicitudes</p>
                  ) : (
                    sellRequests.map((req) => (
                      <div key={req.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{req.name}</p>
                            <p className="text-sm text-stone-500">{req.phone} · {req.email}</p>
                          </div>
                          <Badge>{req.status}</Badge>
                        </div>
                        <p className="text-sm mt-2">{req.property_description}</p>
                        <p className="text-xs text-stone-400 mt-2">
                          {req.property_type} en {req.location} · {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          )}

          {/* Job Applications Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="aplicaciones">
              <div className="bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold mb-6">Aplicaciones de Trabajo</h2>
                <div className="space-y-4">
                  {jobApplications.length === 0 ? (
                    <p className="text-stone-500 text-center py-8">No hay aplicaciones</p>
                  ) : (
                    jobApplications.map((app) => (
                      <div key={app.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{app.name}</p>
                            <p className="text-sm text-stone-500">{app.phone} · {app.email}</p>
                          </div>
                          <Badge>{app.status}</Badge>
                        </div>
                        {app.position && <p className="text-sm mt-1 text-amber-600">Posición: {app.position}</p>}
                        {app.message && <p className="text-sm mt-2">{app.message}</p>}
                        <p className="text-xs text-stone-400 mt-2">{new Date(app.created_at).toLocaleDateString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
