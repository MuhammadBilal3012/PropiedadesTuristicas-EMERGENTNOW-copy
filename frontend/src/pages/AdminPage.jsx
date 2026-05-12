import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, MapPin, Building2, MessageSquare, Upload, Save, Plus, Pencil, Trash2, X,
  Image as ImageIcon, Loader2, Palette, Type, Layout,
  LogOut, Video, CheckCircle, XCircle, Users, Key, UserPlus, Home, 
  Briefcase, DollarSign, Phone, Mail, ExternalLink,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import {
  getAgencySettings, updateAgencySettings, getLocations, createLocation, updateLocation, deleteLocation,
  getProperties, createProperty, updateProperty, deleteProperty, getContactMessages, deleteContactMessage,
  uploadFile, getStatistics, getUsers, createUser, deleteUser, changePassword, updateUserProfile,
  getSellRequests, updateSellRequestStatus, deleteSellRequest,
  getJobApplications, updateJobApplicationStatus, deleteJobApplication,
} from '../lib/api';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';

const FONTS = [
  { value: 'Playfair Display', label: 'Playfair Display (Elegante)' },
  { value: 'Manrope', label: 'Manrope (Moderno)' },
  { value: 'Inter', label: 'Inter (Limpio)' },
  { value: 'Roboto', label: 'Roboto (Clásico)' },
  { value: 'Poppins', label: 'Poppins (Amigable)' },
  { value: 'Montserrat', label: 'Montserrat (Profesional)' },
];

const COLORS = [
  { value: '#0F172A', label: 'Navy (Actual)' },
  { value: '#1E3A5F', label: 'Azul Oscuro' },
  { value: '#2D3748', label: 'Gris Oscuro' },
  { value: '#1A365D', label: 'Azul Marino' },
  { value: '#234E52', label: 'Verde Oscuro' },
  { value: '#742A2A', label: 'Rojo Vino' },
];

const SECONDARY_COLORS = [
  { value: '#C5A059', label: 'Dorado (Actual)' },
  { value: '#D69E2E', label: 'Oro' },
  { value: '#38A169', label: 'Verde' },
  { value: '#3182CE', label: 'Azul' },
  { value: '#805AD5', label: 'Púrpura' },
  { value: '#DD6B20', label: 'Naranja' },
];

const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState('admin');
  
  // Data states
  const [agency, setAgency] = useState(null);
  const [locations, setLocations] = useState([]);
  const [properties, setProperties] = useState([]);
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [sellRequests, setSellRequests] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  
  // UI states
  const [savingAgency, setSavingAgency] = useState(false);
  const [locationDialog, setLocationDialog] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({ name: '', description: '', is_active: true });
  const [propertyDialog, setPropertyDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyForm, setPropertyForm] = useState({
    title: '', description: '', price: '', currency: 'USD', location: '', address: '',
    bedrooms: '', bathrooms: '', area: '', property_type: 'Casa', status: 'Disponible',
    images: [], video_urls: [], is_featured: false, amenities: [],
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', id: '', name: '' });
  
  // User management states
  const [userDialog, setUserDialog] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: 'agente', nombre_completo: '', telefono_whatsapp: '', foto_perfil: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [profilePhotoUploading, setProfilePhotoUploading] = useState(false);
  const profilePhotoInputRef = useRef(null);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  
  // Check if current user is admin (full access) or agent (limited)
  const isAdmin = currentUserRole === 'admin';
  const isAgent = currentUserRole === 'agente';
  
  // Count properties for agent welcome message
  const agentPropertiesCount = properties?.length || 0;
  
  const logoInputRef = useRef(null);
  const heroLogoInputRef = useRef(null);
  const heroImageInputRef = useRef(null);
  const imageInputRef = useRef(null);

  useEffect(() => {
    // Get current user role from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserRole(user.role || 'admin');
        setCurrentUsername(user.username || '');
        // If agent, default to properties tab and load their profile
        if (user.role === 'agente') {
          setActiveTab('properties');
          setUserForm({
            username: user.username,
            nombre_completo: user.nombre_completo || '',
            telefono_whatsapp: user.telefono_whatsapp || '',
            foto_perfil: user.foto_perfil || '',
            role: 'agente'
          });
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [agencyData, locationsData, propertiesData, messagesData, statsData, usersData, sellData, jobsData] = await Promise.all([
        getAgencySettings(),
        getLocations(),
        getProperties({ limit: 100 }),
        getContactMessages(),
        getStatistics(),
        getUsers().catch(() => []),
        getSellRequests().catch(() => []),
        getJobApplications().catch(() => []),
      ]);
      setAgency(agencyData);
      setLocations(locationsData);
      setProperties(propertiesData.properties || []);
      setMessages(messagesData);
      setStats(statsData);
      setUsers(usersData);
      setSellRequests(sellData);
      setJobApplications(jobsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    onLogout();
    navigate('/admin');
  };

  // Agency handlers
  const handleAgencyChange = (field, value) => {
    setAgency(prev => ({ ...prev, [field]: value }));
  };

  const handleStyleChange = (field, value) => {
    setAgency(prev => ({
      ...prev,
      style: { ...prev.style, [field]: value }
    }));
  };

  const handleSaveAgency = async () => {
    setSavingAgency(true);
    try {
      await updateAgencySettings(agency);
      toast.success('Configuración guardada');
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSavingAgency(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      const logoUrl = `${BACKEND_URL}${result.url}`;
      setAgency(prev => ({ ...prev, logo_url: logoUrl }));
      toast.success('Logo del header subido');
    } catch (error) {
      toast.error('Error al subir el logo');
    }
  };

  const handleHeroLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      const logoUrl = `${BACKEND_URL}${result.url}`;
      setAgency(prev => ({ ...prev, hero_logo_url: logoUrl }));
      toast.success('Logo flotante del hero subido');
    } catch (error) {
      toast.error('Error al subir el logo');
    }
  };

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      const imageUrl = `${BACKEND_URL}${result.url}`;
      setAgency(prev => ({
        ...prev,
        hero_images: [...(prev.hero_images || []), imageUrl]
      }));
      toast.success('Imagen del hero subida');
    } catch (error) {
      toast.error('Error al subir la imagen');
    }
  };

  const removeHeroImage = (index) => {
    setAgency(prev => ({
      ...prev,
      hero_images: prev.hero_images.filter((_, i) => i !== index)
    }));
  };

  // Location handlers
  const openLocationDialog = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({ name: location.name, description: location.description || '', is_active: location.is_active });
    } else {
      setEditingLocation(null);
      setLocationForm({ name: '', description: '', is_active: true });
    }
    setLocationDialog(true);
  };

  const handleSaveLocation = async () => {
    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, locationForm);
        toast.success('Ubicación actualizada');
      } else {
        await createLocation(locationForm);
        toast.success('Ubicación creada');
      }
      setLocationDialog(false);
      const updatedLocations = await getLocations();
      setLocations(updatedLocations);
    } catch (error) {
      toast.error('Error al guardar');
    }
  };

  const handleDeleteLocation = async () => {
    try {
      await deleteLocation(deleteDialog.id);
      toast.success('Ubicación eliminada');
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
      const updatedLocations = await getLocations();
      setLocations(updatedLocations);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  // Property handlers
  const openPropertyDialog = (property = null) => {
    if (property) {
      setEditingProperty(property);
      setPropertyForm({
        title: property.title, description: property.description, price: property.price.toString(),
        currency: property.currency, location: property.location, address: property.address || '',
        bedrooms: property.bedrooms.toString(), bathrooms: property.bathrooms.toString(),
        area: property.area.toString(), property_type: property.property_type,
        status: property.status || 'Disponible', images: property.images || [],
        video_urls: property.video_urls || [], is_featured: property.is_featured,
        amenities: property.amenities || [],
      });
    } else {
      setEditingProperty(null);
      setPropertyForm({
        title: '', description: '', price: '', currency: 'USD', location: '', address: '',
        bedrooms: '', bathrooms: '', area: '', property_type: 'Casa', status: 'Disponible',
        images: [], video_urls: [], is_featured: false, amenities: [],
      });
    }
    setPropertyDialog(true);
  };

  const handlePropertyImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      const imageUrl = `${BACKEND_URL}${result.url}`;
      setPropertyForm(prev => ({
        ...prev,
        images: [...prev.images, { url: imageUrl, alt: file.name }],
      }));
      toast.success('Imagen subida');
    } catch (error) {
      toast.error('Error al subir la imagen');
    }
  };

  const removePropertyImage = (index) => {
    setPropertyForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addVideoUrl = () => {
    if (newVideoUrl.trim()) {
      setPropertyForm(prev => ({ ...prev, video_urls: [...prev.video_urls, newVideoUrl.trim()] }));
      setNewVideoUrl('');
    }
  };

  const removeVideoUrl = (index) => {
    setPropertyForm(prev => ({ ...prev, video_urls: prev.video_urls.filter((_, i) => i !== index) }));
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setPropertyForm(prev => ({ ...prev, amenities: [...prev.amenities, newAmenity.trim()] }));
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    setPropertyForm(prev => ({ ...prev, amenities: prev.amenities.filter((_, i) => i !== index) }));
  };

  const handleSaveProperty = async () => {
    // Validación de campos requeridos
    if (!propertyForm.title?.trim()) {
      toast.error('El título es requerido');
      return;
    }
    if (!propertyForm.description?.trim()) {
      toast.error('La descripción es requerida');
      return;
    }
    if (!propertyForm.price || isNaN(parseFloat(propertyForm.price)) || parseFloat(propertyForm.price) <= 0) {
      toast.error('El precio debe ser un número válido mayor a 0');
      return;
    }
    if (!propertyForm.location) {
      toast.error('La ubicación es requerida');
      return;
    }
    if (!propertyForm.property_type) {
      toast.error('El tipo de propiedad es requerido');
      return;
    }

    try {
      const propertyData = {
        title: propertyForm.title.trim(),
        description: propertyForm.description.trim(),
        price: parseFloat(propertyForm.price),
        currency: propertyForm.currency || 'USD',
        location: propertyForm.location,
        address: propertyForm.address?.trim() || '',
        bedrooms: parseInt(propertyForm.bedrooms) || 0,
        bathrooms: parseInt(propertyForm.bathrooms) || 0,
        area: parseFloat(propertyForm.area) || 0,
        property_type: propertyForm.property_type,
        status: propertyForm.status || 'Disponible',
        images: propertyForm.images || [],
        video_urls: propertyForm.video_urls || [],
        is_featured: propertyForm.is_featured || false,
        amenities: propertyForm.amenities || [],
      };
      
      console.log('Enviando datos de propiedad:', propertyData);
      
      if (editingProperty) {
        await updateProperty(editingProperty.id, propertyData);
        toast.success('Propiedad actualizada exitosamente');
      } else {
        await createProperty(propertyData);
        toast.success('Propiedad creada exitosamente');
      }
      setPropertyDialog(false);
      const updatedProperties = await getProperties({ limit: 100 });
      setProperties(updatedProperties.properties || []);
    } catch (error) {
      console.error('Error al guardar propiedad:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Error desconocido';
      toast.error(`Error al guardar: ${errorMessage}`);
    }
  };

  const handleDeleteProperty = async () => {
    try {
      await deleteProperty(deleteDialog.id);
      toast.success('Propiedad eliminada');
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
      const updatedProperties = await getProperties({ limit: 100 });
      setProperties(updatedProperties.properties || []);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleDeleteMessage = async () => {
    try {
      await deleteContactMessage(deleteDialog.id);
      toast.success('Mensaje eliminado');
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
      const updatedMessages = await getContactMessages();
      setMessages(updatedMessages);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  // User management handlers
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setSavingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success('Contraseña actualizada exitosamente');
      setPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error('Contraseña actual incorrecta');
      } else {
        toast.error('Error al cambiar la contraseña');
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCreateUser = async () => {
    if (!userForm.username || !userForm.password) {
      toast.error('Complete todos los campos');
      return;
    }
    if (userForm.username.length < 3) {
      toast.error('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    if (userForm.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setSavingUser(true);
    try {
      const newUser = await createUser(
        userForm.username, 
        userForm.password, 
        userForm.role,
        userForm.nombre_completo,
        userForm.telefono_whatsapp,
        userForm.foto_perfil
      );
      toast.success(`Usuario "${newUser.username}" creado exitosamente como ${newUser.role === 'admin' ? 'Administrador' : 'Agente'}`);
      setUserDialog(false);
      setUserForm({ username: '', password: '', role: 'agente', nombre_completo: '', telefono_whatsapp: '', foto_perfil: '' });
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response?.status === 400) {
        toast.error('El usuario ya existe. Elija otro nombre.');
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Error al crear el usuario. Intente de nuevo.');
      }
    } finally {
      setSavingUser(false);
    }
  };

  const handleUpdateUserProfile = async () => {
    if (!editingUser) return;
    
    setSavingUser(true);
    try {
      await updateUserProfile(editingUser.id, {
        nombre_completo: userForm.nombre_completo || null,
        telefono_whatsapp: userForm.telefono_whatsapp || null,
        foto_perfil: userForm.foto_perfil || null
      });
      toast.success('Perfil actualizado exitosamente');
      setUserDialog(false);
      setEditingUser(null);
      setUserForm({ username: '', password: '', role: 'agente', nombre_completo: '', telefono_whatsapp: '', foto_perfil: '' });
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSavingUser(false);
    }
  };

  // Handle agent self profile save
  const handleSaveAgentProfile = async () => {
    setSavingUser(true);
    try {
      // Get current user from storage
      const userData = localStorage.getItem('user');
      if (!userData) {
        toast.error('No se encontró información del usuario');
        return;
      }
      const currentUser = JSON.parse(userData);
      
      await updateUserProfile(currentUser.id, {
        nombre_completo: userForm.nombre_completo || null,
        telefono_whatsapp: userForm.telefono_whatsapp || null,
        foto_perfil: userForm.foto_perfil || null
      });
      
      // Update localStorage with new profile info
      const updatedUser = {
        ...currentUser,
        nombre_completo: userForm.nombre_completo,
        telefono_whatsapp: userForm.telefono_whatsapp,
        foto_perfil: userForm.foto_perfil
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('admin_user', JSON.stringify(updatedUser));
      
      toast.success('Tu perfil ha sido actualizado');
    } catch (error) {
      console.error('Error updating agent profile:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSavingUser(false);
    }
  };

  const openUserDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username,
        password: '',
        role: user.role,
        nombre_completo: user.nombre_completo || '',
        telefono_whatsapp: user.telefono_whatsapp || '',
        foto_perfil: user.foto_perfil || ''
      });
    } else {
      setEditingUser(null);
      setUserForm({ username: '', password: '', role: 'agente', nombre_completo: '', telefono_whatsapp: '', foto_perfil: '' });
    }
    setUserDialog(true);
  };

  const handleProfilePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePhotoUploading(true);
    try {
      const result = await uploadFile(file);
      const photoUrl = `${BACKEND_URL}${result.url}`;
      setUserForm(prev => ({ ...prev, foto_perfil: photoUrl }));
      toast.success('Foto de perfil subida');
    } catch (error) {
      toast.error('Error al subir la foto');
    } finally {
      setProfilePhotoUploading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(deleteDialog.id);
      toast.success(`Usuario "${deleteDialog.name}" eliminado correctamente`);
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
      const updatedUsers = await getUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
      if (error.response?.status === 400) {
        toast.error('No puedes eliminar tu propio usuario');
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Error al eliminar el usuario');
      }
    }
  };

  // Sell Request Handlers
  const handleUpdateSellRequestStatus = async (id, status) => {
    try {
      await updateSellRequestStatus(id, status);
      toast.success('Estado actualizado');
      const updated = await getSellRequests();
      setSellRequests(updated);
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDeleteSellRequest = async () => {
    try {
      await deleteSellRequest(deleteDialog.id);
      toast.success('Solicitud eliminada');
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
      const updated = await getSellRequests();
      setSellRequests(updated);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  // Job Application Handlers
  const handleUpdateJobApplicationStatus = async (id, status) => {
    try {
      await updateJobApplicationStatus(id, status);
      toast.success('Estado actualizado');
      const updated = await getJobApplications();
      setJobApplications(updated);
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDeleteJobApplication = async () => {
    try {
      await deleteJobApplication(deleteDialog.id);
      toast.success('Aplicación eliminada');
      setDeleteDialog({ open: false, type: '', id: '', name: '' });
      const updated = await getJobApplications();
      setJobApplications(updated);
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  // WhatsApp contact link generator
  const getWhatsAppContactLink = (phone, message = '') => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 0 }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#C5A059' }} />
      </div>
    );
  }

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="bg-slate-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8" style={{ color: '#C5A059' }} />
            <div>
              <h1 className="font-heading text-xl font-bold text-white">
                {isAgent ? 'Panel de Agente' : 'Panel de Administración'}
              </h1>
              <p className="text-stone-400 text-sm">{agency?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-stone-400 text-sm hidden sm:block">
              Hola, {currentUsername || user?.username}
              {isAgent && <span className="ml-1 text-amber-400">(Agente)</span>}
            </span>
            <Button
              variant="ghost"
              onClick={() => setPasswordDialog(true)}
              className="text-stone-400 hover:text-white"
              title="Cambiar contraseña"
              data-testid="header-change-password-btn"
            >
              <Key className="h-5 w-5" />
              <span className="hidden md:inline ml-2 text-sm">Contraseña</span>
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-stone-400 hover:text-white">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Agent Welcome Banner */}
      {isAgent && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  ¡Bienvenido, Agente {currentUsername}!
                </h2>
                <p className="text-white/90 mt-1">
                  Tienes <span className="font-bold text-xl">{agentPropertiesCount}</span> propiedades publicadas en el sistema
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Building2 className="h-12 w-12 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white shadow-sm border mb-6 flex-wrap h-auto p-1">
            {isAdmin && (
              <TabsTrigger value="stats" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <Home className="h-4 w-4" /> Resumen
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="brand" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <ImageIcon className="h-4 w-4" /> Marca y Logo
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="style" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <Palette className="h-4 w-4" /> Estilo
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="locations" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <MapPin className="h-4 w-4" /> Ubicaciones
              </TabsTrigger>
            )}
            <TabsTrigger value="properties" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <Building2 className="h-4 w-4" /> Propiedades
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="messages" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <MessageSquare className="h-4 w-4" /> Mensajes
                {messages.length > 0 && <Badge className="ml-1 bg-amber-500">{messages.length}</Badge>}
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="sell-requests" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <DollarSign className="h-4 w-4" /> Ventas
                {sellRequests.filter(r => r.status === 'pending').length > 0 && <Badge className="ml-1 bg-amber-500">{sellRequests.filter(r => r.status === 'pending').length}</Badge>}
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="job-applications" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <Briefcase className="h-4 w-4" /> Empleo
                {jobApplications.filter(a => a.status === 'pending').length > 0 && <Badge className="ml-1 bg-green-500">{jobApplications.filter(a => a.status === 'pending').length}</Badge>}
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <Users className="h-4 w-4" /> Usuarios
              </TabsTrigger>
            )}
            {/* Agent can only see Mi Perfil tab */}
            {isAgent && (
              <TabsTrigger value="my-profile" className="gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <Users className="h-4 w-4" /> Mi Perfil
              </TabsTrigger>
            )}
          </TabsList>

          {/* RESUMEN TAB - Simplified overview */}
          <TabsContent value="stats">
            <div className="bg-white p-6 md:p-8 shadow-sm border">
              <h2 className="font-heading text-xl font-semibold text-slate-900 mb-6">Resumen General</h2>
              
              {/* Simple Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-stone-50 p-6 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-green-50">
                      <Building2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats?.total_properties || 0}</p>
                      <p className="text-sm text-stone-500">Propiedades</p>
                    </div>
                  </div>
                </div>
                <div className="bg-stone-50 p-6 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-blue-50">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats?.total_locations || 0}</p>
                      <p className="text-sm text-stone-500">Ubicaciones</p>
                    </div>
                  </div>
                </div>
                <div className="bg-stone-50 p-6 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-purple-50">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stats?.total_messages || 0}</p>
                      <p className="text-sm text-stone-500">Mensajes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Properties */}
              <div>
                <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">
                  Propiedades Destacadas
                </h3>
                {stats?.top_properties?.length > 0 ? (
                  <div className="space-y-3">
                    {stats.top_properties.map((prop) => (
                      <div key={prop.id} className="flex items-center gap-4 p-3 bg-stone-50 border rounded-lg">
                        {prop.image && (
                          <img src={prop.image} alt={prop.title} className="w-16 h-16 object-cover rounded" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{prop.title}</p>
                          <p className="text-sm text-stone-500">{prop.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold" style={{ color: '#C5A059' }}>{formatPrice(prop.price, prop.currency)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-500 text-center py-8">No hay propiedades destacadas aún</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* BRAND TAB */}
          <TabsContent value="brand">
            <div className="bg-white p-6 md:p-8 shadow-sm border">
              <h2 className="font-heading text-xl font-semibold text-slate-900 mb-6">Configuración de Marca y Logos</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Logo Header - All pages except home */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-blue-600" />
                    Logo del Header
                  </Label>
                  <p className="text-sm text-stone-500 mb-4">Se mostrará en el menú de navegación (todas las páginas excepto Inicio)</p>
                  <div className="flex items-center gap-4">
                    {agency?.logo_url ? (
                      <img src={agency.logo_url} alt="Logo Header" className="h-16 object-contain bg-white p-2 rounded border" />
                    ) : (
                      <div className="h-16 w-28 bg-white rounded border flex items-center justify-center text-stone-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <input type="file" ref={logoInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      <Button variant="outline" onClick={() => logoInputRef.current?.click()} data-testid="upload-logo-btn">
                        <Upload className="h-4 w-4 mr-2" /> Subir Logo
                      </Button>
                      {agency?.logo_url && (
                        <Button variant="ghost" size="sm" onClick={() => handleAgencyChange('logo_url', null)} className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-1" /> Quitar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hero Logo - Floating on home page */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" style={{ color: '#C5A059' }} />
                    Logo Flotante del Hero
                  </Label>
                  <p className="text-sm text-stone-500 mb-4">Se mostrará sobre el video/imagen en la página de Inicio. Soporta PNG transparente.</p>
                  <div className="flex items-center gap-4">
                    {agency?.hero_logo_url ? (
                      <img 
                        src={agency.hero_logo_url} 
                        alt="Logo Hero" 
                        className="object-contain bg-slate-800 p-2 rounded border"
                        style={{ 
                          width: `${agency?.hero_logo_width || 150}px`, 
                          height: `${agency?.hero_logo_height || 100}px` 
                        }}
                      />
                    ) : (
                      <div className="h-16 w-28 bg-slate-800 rounded border flex items-center justify-center text-stone-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <input type="file" ref={heroLogoInputRef} accept="image/*" onChange={handleHeroLogoUpload} className="hidden" />
                      <Button variant="outline" onClick={() => heroLogoInputRef.current?.click()} data-testid="upload-hero-logo-btn">
                        <Upload className="h-4 w-4 mr-2" /> Subir Logo
                      </Button>
                      {agency?.hero_logo_url && (
                        <Button variant="ghost" size="sm" onClick={() => handleAgencyChange('hero_logo_url', null)} className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-1" /> Quitar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Logo Size Controls */}
                  {agency?.hero_logo_url && (
                    <div className="mt-4 p-3 bg-slate-700 rounded-lg">
                      <Label className="text-white text-sm font-medium mb-3 block">Tamaño del Logo (píxeles)</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-stone-300 text-xs">Ancho</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              min="50"
                              max="500"
                              value={agency?.hero_logo_width || 150}
                              onChange={(e) => handleAgencyChange('hero_logo_width', parseInt(e.target.value) || 150)}
                              className="w-20 bg-slate-600 border-slate-500 text-white text-center"
                            />
                            <span className="text-stone-400 text-xs">px</span>
                          </div>
                          <input
                            type="range"
                            min="50"
                            max="500"
                            value={agency?.hero_logo_width || 150}
                            onChange={(e) => handleAgencyChange('hero_logo_width', parseInt(e.target.value))}
                            className="w-full mt-2 accent-amber-500"
                          />
                        </div>
                        <div>
                          <Label className="text-stone-300 text-xs">Alto</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              min="30"
                              max="300"
                              value={agency?.hero_logo_height || 100}
                              onChange={(e) => handleAgencyChange('hero_logo_height', parseInt(e.target.value) || 100)}
                              className="w-20 bg-slate-600 border-slate-500 text-white text-center"
                            />
                            <span className="text-stone-400 text-xs">px</span>
                          </div>
                          <input
                            type="range"
                            min="30"
                            max="300"
                            value={agency?.hero_logo_height || 100}
                            onChange={(e) => handleAgencyChange('hero_logo_height', parseInt(e.target.value))}
                            className="w-full mt-2 accent-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Agency Name */}
                <div>
                  <Label className="text-base font-semibold">Nombre de la Agencia</Label>
                  <p className="text-sm text-stone-500 mb-4">Aparecerá en el menú, títulos y pie de página</p>
                  <Input
                    value={agency?.name || ''}
                    onChange={(e) => handleAgencyChange('name', e.target.value)}
                    className="text-lg"
                    data-testid="agency-name-input"
                  />
                </div>

                {/* Logo Position in Hero */}
                <div className="p-4 bg-stone-50 rounded-lg border">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Layout className="h-5 w-5" style={{ color: '#C5A059' }} />
                    Posición del Logo Flotante
                  </Label>
                  <p className="text-sm text-stone-500 mb-4">
                    Selecciona dónde aparecerá el logo flotante en el hero de la página de Inicio
                  </p>
                  <Select 
                    value={agency?.logo_position || 'top-left'} 
                    onValueChange={(value) => handleAgencyChange('logo_position', value)}
                  >
                    <SelectTrigger className="w-full md:w-64" data-testid="logo-position-select">
                      <SelectValue placeholder="Selecciona posición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">↖ Arriba Izquierda</SelectItem>
                      <SelectItem value="top-center">↑ Arriba Centro</SelectItem>
                      <SelectItem value="top-right">↗ Arriba Derecha</SelectItem>
                      <SelectItem value="center-left">← Centro Izquierda</SelectItem>
                      <SelectItem value="center">● Centro</SelectItem>
                      <SelectItem value="center-right">→ Centro Derecha</SelectItem>
                      <SelectItem value="bottom-left">↙ Abajo Izquierda</SelectItem>
                      <SelectItem value="bottom-center">↓ Abajo Centro</SelectItem>
                      <SelectItem value="bottom-right">↘ Abajo Derecha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Hero Images */}
                <div className="md:col-span-2">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" style={{ color: '#C5A059' }} />
                    Imágenes de Portada (Hero)
                  </Label>
                  <p className="text-sm text-stone-500 mb-4">
                    Sube una o más imágenes para el banner principal. Si subes varias, rotarán automáticamente.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {agency?.hero_images?.map((img, index) => (
                      <div key={index} className="relative group">
                        <img src={img} alt={`Hero ${index + 1}`} className="w-32 h-24 object-cover rounded border" />
                        <button
                          onClick={() => removeHeroImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <input type="file" ref={heroImageInputRef} accept="image/*" onChange={handleHeroImageUpload} className="hidden" />
                    <button
                      onClick={() => heroImageInputRef.current?.click()}
                      className="w-32 h-24 border-2 border-dashed border-stone-300 rounded flex items-center justify-center text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
                      data-testid="add-hero-image-btn"
                    >
                      <Plus className="h-8 w-8" />
                    </button>
                  </div>
                </div>

                {/* Hero Video */}
                <div className="md:col-span-2 p-4 bg-stone-50 rounded-lg border">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Video className="h-5 w-5" style={{ color: '#C5A059' }} />
                    Video de Portada (Hero) - Opcional
                  </Label>
                  <p className="text-sm text-stone-500 mb-4">
                    Si agregas un video de YouTube, se mostrará en lugar de las imágenes. El video se reproducirá automáticamente, en silencio y en bucle.
                  </p>
                  <Input
                    value={agency?.hero_video_url || ''}
                    onChange={(e) => handleAgencyChange('hero_video_url', e.target.value)}
                    className="mt-2"
                    placeholder="https://youtube.com/watch?v=... o https://youtu.be/..."
                    data-testid="hero-video-input"
                  />
                  <p className="text-xs text-stone-400 mt-2">
                    💡 Deja vacío para usar las imágenes de arriba. Si pones un video, este tendrá prioridad.
                  </p>
                </div>

                {/* Hero Title & Subtitle Styling */}
                <div className="md:col-span-2 p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg border border-slate-700">
                  <Label className="text-base font-semibold flex items-center gap-2 text-white mb-4">
                    <Type className="h-5 w-5" style={{ color: '#C5A059' }} />
                    Estilo de Títulos del Hero
                  </Label>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Title Position */}
                    <div>
                      <Label className="text-stone-300 text-sm">Posición del Texto</Label>
                      <Select 
                        value={agency?.hero_title_position || 'center'} 
                        onValueChange={(value) => handleAgencyChange('hero_title_position', value)}
                      >
                        <SelectTrigger className="mt-2 bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Posición" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">← Izquierda</SelectItem>
                          <SelectItem value="center">● Centro</SelectItem>
                          <SelectItem value="right">→ Derecha</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Title Size */}
                    <div>
                      <Label className="text-stone-300 text-sm">Tamaño del Título</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          min="24"
                          max="80"
                          value={agency?.hero_title_size || 48}
                          onChange={(e) => handleAgencyChange('hero_title_size', parseInt(e.target.value) || 48)}
                          className="w-20 bg-slate-700 border-slate-600 text-white text-center"
                        />
                        <span className="text-stone-400 text-xs">px</span>
                      </div>
                      <input
                        type="range"
                        min="24"
                        max="80"
                        value={agency?.hero_title_size || 48}
                        onChange={(e) => handleAgencyChange('hero_title_size', parseInt(e.target.value))}
                        className="w-full mt-2 accent-amber-500"
                      />
                    </div>

                    {/* Subtitle Size */}
                    <div>
                      <Label className="text-stone-300 text-sm">Tamaño del Subtítulo</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          min="12"
                          max="36"
                          value={agency?.hero_subtitle_size || 18}
                          onChange={(e) => handleAgencyChange('hero_subtitle_size', parseInt(e.target.value) || 18)}
                          className="w-20 bg-slate-700 border-slate-600 text-white text-center"
                        />
                        <span className="text-stone-400 text-xs">px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="36"
                        value={agency?.hero_subtitle_size || 18}
                        onChange={(e) => handleAgencyChange('hero_subtitle_size', parseInt(e.target.value))}
                        className="w-full mt-2 accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* Vertical Position */}
                  <div className="mt-4">
                    <Label className="text-white text-sm font-medium mb-2 block">Posición Vertical del Texto</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-stone-400 text-xs">Arriba</span>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        value={agency?.hero_title_vertical_position || 50}
                        onChange={(e) => handleAgencyChange('hero_title_vertical_position', parseInt(e.target.value))}
                        className="flex-1 accent-amber-500"
                      />
                      <span className="text-stone-400 text-xs">Abajo</span>
                      <Input
                        type="number"
                        min="20"
                        max="80"
                        value={agency?.hero_title_vertical_position || 50}
                        onChange={(e) => handleAgencyChange('hero_title_vertical_position', parseInt(e.target.value) || 50)}
                        className="w-16 bg-slate-700 border-slate-600 text-white text-center"
                      />
                      <span className="text-stone-400 text-xs">%</span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                    <p className="text-stone-400 text-xs mb-2">Vista previa:</p>
                    <div 
                      className="text-white"
                      style={{ 
                        textAlign: agency?.hero_title_position || 'center',
                      }}
                    >
                      <p style={{ fontSize: `${Math.min((agency?.hero_title_size || 48) / 2, 24)}px`, fontWeight: 'bold' }}>
                        {agency?.hero_headline || 'Título del Hero'}
                      </p>
                      <p style={{ fontSize: `${Math.min((agency?.hero_subtitle_size || 18) / 1.5, 14)}px`, opacity: 0.8 }}>
                        {agency?.hero_subheadline || 'Subtítulo del hero'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="md:col-span-2" />

                {/* Contact Info */}
                <div>
                  <Label>WhatsApp</Label>
                  <Input value={agency?.whatsapp || ''} onChange={(e) => handleAgencyChange('whatsapp', e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input value={agency?.phone || ''} onChange={(e) => handleAgencyChange('phone', e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={agency?.email || ''} onChange={(e) => handleAgencyChange('email', e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>Dirección</Label>
                  <Input value={agency?.address || ''} onChange={(e) => handleAgencyChange('address', e.target.value)} className="mt-2" />
                </div>

                <Separator className="md:col-span-2" />

                {/* Social & Video */}
                <div>
                  <Label>Facebook URL</Label>
                  <Input value={agency?.facebook_url || ''} onChange={(e) => handleAgencyChange('facebook_url', e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input value={agency?.instagram_url || ''} onChange={(e) => handleAgencyChange('instagram_url', e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>TikTok URL</Label>
                  <Input value={agency?.tiktok_url || ''} onChange={(e) => handleAgencyChange('tiktok_url', e.target.value)} className="mt-2" />
                </div>

                <Separator className="md:col-span-2" />

                {/* Hero Text */}
                <div>
                  <Label>Título del Hero</Label>
                  <Input value={agency?.hero_headline || ''} onChange={(e) => handleAgencyChange('hero_headline', e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>Subtítulo del Hero</Label>
                  <Input value={agency?.hero_subheadline || ''} onChange={(e) => handleAgencyChange('hero_subheadline', e.target.value)} className="mt-2" />
                </div>

                <Separator className="md:col-span-2" />

                {/* About Us Section */}
                <div className="md:col-span-2">
                  <Label className="text-base font-semibold mb-2 block">Página "Sobre Nosotros"</Label>
                </div>
                <div>
                  <Label>Título de la Página</Label>
                  <Input value={agency?.about_title || ''} onChange={(e) => handleAgencyChange('about_title', e.target.value)} className="mt-2" placeholder="Sobre Nosotros" />
                </div>
                <div>
                  <Label>Descripción Principal (Nuestra Historia)</Label>
                  <Input value={agency?.about_description || ''} onChange={(e) => handleAgencyChange('about_description', e.target.value)} className="mt-2" />
                </div>
                
                {/* Mission, Vision, Values - Editable titles */}
                <div className="md:col-span-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <Label className="text-base font-semibold mb-4 block flex items-center gap-2">
                    <Layout className="h-5 w-5" style={{ color: '#C5A059' }} />
                    Misión, Visión y Valores (3 tarjetas principales)
                  </Label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Título Tarjeta 1</Label>
                      <Input value={agency?.about_mission_title || 'Misión'} onChange={(e) => handleAgencyChange('about_mission_title', e.target.value)} className="mt-1" />
                      <Label className="mt-2 block text-xs text-stone-500">Descripción</Label>
                      <Textarea value={agency?.about_mission || ''} onChange={(e) => handleAgencyChange('about_mission', e.target.value)} className="mt-1" rows={3} />
                    </div>
                    <div>
                      <Label>Título Tarjeta 2</Label>
                      <Input value={agency?.about_vision_title || 'Visión'} onChange={(e) => handleAgencyChange('about_vision_title', e.target.value)} className="mt-1" />
                      <Label className="mt-2 block text-xs text-stone-500">Descripción</Label>
                      <Textarea value={agency?.about_vision || ''} onChange={(e) => handleAgencyChange('about_vision', e.target.value)} className="mt-1" rows={3} />
                    </div>
                    <div>
                      <Label>Título Tarjeta 3</Label>
                      <Input value={agency?.about_values_title || 'Valores'} onChange={(e) => handleAgencyChange('about_values_title', e.target.value)} className="mt-1" />
                      <Label className="mt-2 block text-xs text-stone-500">Descripción</Label>
                      <Textarea value={agency?.about_values || ''} onChange={(e) => handleAgencyChange('about_values', e.target.value)} className="mt-1" rows={3} />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div>
                  <Label>Años de Experiencia</Label>
                  <Input type="number" value={agency?.about_years_experience || ''} onChange={(e) => handleAgencyChange('about_years_experience', parseInt(e.target.value) || 0)} className="mt-2" />
                </div>
                <div>
                  <Label>Propiedades Vendidas</Label>
                  <Input type="number" value={agency?.about_properties_sold || ''} onChange={(e) => handleAgencyChange('about_properties_sold', parseInt(e.target.value) || 0)} className="mt-2" />
                </div>
                <div>
                  <Label>Clientes Satisfechos</Label>
                  <Input type="number" value={agency?.about_happy_clients || ''} onChange={(e) => handleAgencyChange('about_happy_clients', parseInt(e.target.value) || 0)} className="mt-2" />
                </div>
                <div>
                  <Label>Miembros del Equipo</Label>
                  <Input type="number" value={agency?.about_team_members || ''} onChange={(e) => handleAgencyChange('about_team_members', parseInt(e.target.value) || 0)} className="mt-2" />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={handleSaveAgency} disabled={savingAgency} className="px-8" style={{ backgroundColor: '#C5A059' }} data-testid="save-brand-btn">
                  {savingAgency ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* STYLE TAB */}
          <TabsContent value="style">
            <div className="bg-white p-6 md:p-8 shadow-sm border">
              <h2 className="font-heading text-xl font-semibold text-slate-900 mb-6">Editor de Estilo</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Colors */}
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Palette className="h-5 w-5" /> Color Principal
                  </Label>
                  <p className="text-sm text-stone-500 mb-3">Color del menú, botones y encabezados</p>
                  <Select value={agency?.style?.primary_color || '#0F172A'} onValueChange={(v) => handleStyleChange('primary_color', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COLORS.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: c.value }} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Color Secundario (Acentos)</Label>
                  <p className="text-sm text-stone-500 mb-3">Color de botones de acción, iconos destacados</p>
                  <Select value={agency?.style?.secondary_color || '#C5A059'} onValueChange={(v) => handleStyleChange('secondary_color', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SECONDARY_COLORS.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: c.value }} />
                            {c.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="md:col-span-2" />

                {/* Fonts */}
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Type className="h-5 w-5" /> Fuente de Títulos
                  </Label>
                  <Select value={agency?.style?.heading_font || 'Playfair Display'} onValueChange={(v) => handleStyleChange('heading_font', v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONTS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Fuente del Cuerpo</Label>
                  <Select value={agency?.style?.body_font || 'Manrope'} onValueChange={(v) => handleStyleChange('body_font', v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FONTS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Tamaño de Títulos</Label>
                  <Select value={agency?.style?.heading_size || 'large'} onValueChange={(v) => handleStyleChange('heading_size', v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeño</SelectItem>
                      <SelectItem value="medium">Mediano</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Tamaño del Texto</Label>
                  <Select value={agency?.style?.body_size || 'medium'} onValueChange={(v) => handleStyleChange('body_size', v)}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeño</SelectItem>
                      <SelectItem value="medium">Mediano</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="md:col-span-2" />

                {/* Layout */}
                <div>
                  <Label className="text-base font-semibold flex items-center gap-2">
                    <Layout className="h-5 w-5" /> Alineación del Hero
                  </Label>
                  <p className="text-sm text-stone-500 mb-3">Posición del texto en la sección principal</p>
                  <Select value={agency?.style?.hero_text_position || 'center'} onValueChange={(v) => handleStyleChange('hero_text_position', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Izquierda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                      <SelectItem value="right">Derecha</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-semibold">Alineación General</Label>
                  <p className="text-sm text-stone-500 mb-3">Alineación de secciones y contenido</p>
                  <Select value={agency?.style?.layout_alignment || 'center'} onValueChange={(v) => handleStyleChange('layout_alignment', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Izquierda</SelectItem>
                      <SelectItem value="center">Centro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-8 p-6 border-2 border-dashed border-stone-300 rounded-lg">
                <p className="text-sm text-stone-500 mb-4">Vista Previa:</p>
                <div className="p-4" style={{ backgroundColor: agency?.style?.primary_color || '#0F172A' }}>
                  <h3 style={{ fontFamily: agency?.style?.heading_font, color: agency?.style?.secondary_color || '#C5A059', fontSize: agency?.style?.heading_size === 'small' ? '1.5rem' : agency?.style?.heading_size === 'large' ? '2.5rem' : '2rem' }}>
                    Título de Ejemplo
                  </h3>
                  <p style={{ fontFamily: agency?.style?.body_font, color: 'white', fontSize: agency?.style?.body_size === 'small' ? '0.875rem' : agency?.style?.body_size === 'large' ? '1.125rem' : '1rem' }}>
                    Este es un texto de ejemplo para ver cómo se verán las fuentes y colores.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={handleSaveAgency} disabled={savingAgency} className="px-8" style={{ backgroundColor: '#C5A059' }} data-testid="save-style-btn">
                  {savingAgency ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Guardar Estilos
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* LOCATIONS TAB */}
          <TabsContent value="locations">
            <div className="bg-white p-6 md:p-8 shadow-sm border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-semibold text-slate-900">Ubicaciones / Provincias</h2>
                <Button onClick={() => openLocationDialog()} style={{ backgroundColor: '#C5A059' }} data-testid="add-location-btn">
                  <Plus className="h-4 w-4 mr-2" /> Agregar
                </Button>
              </div>
              <div className="grid gap-3">
                {locations.map((location) => (
                  <div key={location.id} className="flex items-center justify-between p-4 bg-stone-50 border">
                    <div className="flex items-center gap-4">
                      <MapPin className="h-5 w-5" style={{ color: '#C5A059' }} />
                      <div>
                        <p className="font-medium text-slate-900">{location.name}</p>
                        {location.description && <p className="text-sm text-stone-500">{location.description}</p>}
                      </div>
                      {!location.is_active && <Badge variant="secondary">Inactiva</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openLocationDialog(location)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, type: 'location', id: location.id, name: location.name })}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                ))}
                {locations.length === 0 && <div className="text-center py-12 text-stone-500">No hay ubicaciones</div>}
              </div>
            </div>
          </TabsContent>

          {/* PROPERTIES TAB */}
          <TabsContent value="properties">
            <div className="bg-white p-6 md:p-8 shadow-sm border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-semibold text-slate-900">Propiedades ({properties.length})</h2>
                <Button onClick={() => openPropertyDialog()} style={{ backgroundColor: '#C5A059' }} data-testid="add-property-btn">
                  <Plus className="h-4 w-4 mr-2" /> Agregar
                </Button>
              </div>
              <div className="grid gap-3">
                {properties.map((property) => (
                  <div key={property.id} className="flex items-center gap-4 p-4 bg-stone-50 border">
                    <img src={property.images?.[0]?.url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200'} alt={property.title} className="w-20 h-20 object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-900 truncate">{property.title}</p>
                        {property.is_featured && <Badge style={{ backgroundColor: '#C5A059' }}>Destacada</Badge>}
                        <Badge variant={property.status === 'Vendido' ? 'destructive' : property.status === 'Reservado' ? 'secondary' : 'outline'}>
                          {property.status === 'Vendido' && <XCircle className="h-3 w-3 mr-1" />}
                          {property.status === 'Disponible' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {property.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-stone-500">{property.location}</p>
                      <p className="font-semibold" style={{ color: '#C5A059' }}>{formatPrice(property.price, property.currency)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{property.property_type}</Badge>
                      <Button variant="ghost" size="icon" onClick={() => openPropertyDialog(property)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, type: 'property', id: property.id, name: property.title })}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </div>
                ))}
                {properties.length === 0 && <div className="text-center py-12 text-stone-500">No hay propiedades</div>}
              </div>
            </div>
          </TabsContent>

          {/* MESSAGES TAB */}
          <TabsContent value="messages">
            <div className="bg-white p-6 md:p-8 shadow-sm border">
              <h2 className="font-heading text-xl font-semibold text-slate-900 mb-6">Mensajes ({messages.length})</h2>
              <div className="grid gap-4">
                {messages.map((message) => (
                  <div key={message.id} className="p-4 bg-stone-50 border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-slate-900">{message.name}</p>
                        <p className="text-sm text-stone-500">{message.email} {message.phone && `• ${message.phone}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400">{formatDate(message.created_at)}</span>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteDialog({ open: true, type: 'message', id: message.id, name: `mensaje de ${message.name}` })}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-stone-700 whitespace-pre-wrap">{message.message}</p>
                  </div>
                ))}
                {messages.length === 0 && <div className="text-center py-12 text-stone-500">No hay mensajes</div>}
              </div>
            </div>
          </TabsContent>

          {/* SELL REQUESTS TAB */}
          <TabsContent value="sell-requests">
            <div className="bg-white p-6 md:p-8 shadow-sm border">
              <h2 className="font-heading text-xl font-semibold text-slate-900 mb-6">
                Solicitudes de Venta ({sellRequests.length})
              </h2>
              <p className="text-stone-500 mb-6">
                Personas interesadas en vender su propiedad con nosotros.
              </p>
              <div className="grid gap-4">
                {sellRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-stone-50 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C5A05920' }}>
                          <DollarSign className="h-5 w-5" style={{ color: '#C5A059' }} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{request.name}</p>
                          <div className="flex items-center gap-3 text-sm text-stone-500">
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {request.phone}</span>
                            {request.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {request.email}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={request.status} onValueChange={(v) => handleUpdateSellRequestStatus(request.id, v)}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="contacted">Contactado</SelectItem>
                            <SelectItem value="closed">Cerrado</SelectItem>
                          </SelectContent>
                        </Select>
                        <a
                          href={getWhatsAppContactLink(request.phone, `Hola ${request.name}, hemos recibido tu solicitud de venta de propiedad. ¿En qué podemos ayudarte?`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                          title="Contactar por WhatsApp"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog({ open: true, type: 'sell-request', id: request.id, name: `solicitud de ${request.name}` })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="ml-13 pl-13">
                      <div className="flex gap-4 mb-2 text-sm">
                        {request.property_type && (
                          <Badge variant="outline">{request.property_type}</Badge>
                        )}
                        {request.location && (
                          <span className="flex items-center gap-1 text-stone-500">
                            <MapPin className="h-3 w-3" /> {request.location}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-700 whitespace-pre-wrap">{request.property_description}</p>
                      <p className="text-xs text-stone-400 mt-2">{formatDate(request.created_at)}</p>
                    </div>
                  </div>
                ))}
                {sellRequests.length === 0 && (
                  <div className="text-center py-12 text-stone-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                    <p>No hay solicitudes de venta</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* JOB APPLICATIONS TAB */}
          <TabsContent value="job-applications">
            <div className="bg-white p-6 md:p-8 shadow-sm border">
              <h2 className="font-heading text-xl font-semibold text-slate-900 mb-6">
                Aplicaciones de Empleo ({jobApplications.length})
              </h2>
              <p className="text-stone-500 mb-6">
                Candidatos interesados en trabajar con nosotros.
              </p>
              <div className="grid gap-4">
                {jobApplications.map((application) => (
                  <div key={application.id} className="p-4 bg-stone-50 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{application.name}</p>
                          <div className="flex items-center gap-3 text-sm text-stone-500">
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {application.email}</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {application.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={application.status} onValueChange={(v) => handleUpdateJobApplicationStatus(application.id, v)}>
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="reviewed">Revisado</SelectItem>
                            <SelectItem value="interviewed">Entrevistado</SelectItem>
                            <SelectItem value="hired">Contratado</SelectItem>
                            <SelectItem value="rejected">Rechazado</SelectItem>
                          </SelectContent>
                        </Select>
                        <a
                          href={getWhatsAppContactLink(application.phone, `Hola ${application.name}, gracias por tu interés en trabajar con nosotros. Nos gustaría conversar contigo.`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                          title="Contactar por WhatsApp"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog({ open: true, type: 'job-application', id: application.id, name: `aplicación de ${application.name}` })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="ml-13 pl-13">
                      <div className="flex gap-3 mb-2">
                        {application.position && (
                          <Badge variant="outline" className="bg-green-50">{application.position}</Badge>
                        )}
                        {application.linkedin_url && (
                          <a
                            href={application.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> LinkedIn
                          </a>
                        )}
                        {application.cv_url && (
                          <a
                            href={application.cv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" /> CV
                          </a>
                        )}
                      </div>
                      {application.message && (
                        <p className="text-stone-700 whitespace-pre-wrap">{application.message}</p>
                      )}
                      <p className="text-xs text-stone-400 mt-2">{formatDate(application.created_at)}</p>
                    </div>
                  </div>
                ))}
                {jobApplications.length === 0 && (
                  <div className="text-center py-12 text-stone-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                    <p>No hay aplicaciones de empleo</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <div className="bg-white p-6 md:p-8 shadow-sm border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-xl font-semibold text-slate-900">Gestión de Usuarios</h2>
                <div className="flex gap-3">
                  <Button onClick={() => openUserDialog()} style={{ backgroundColor: '#C5A059' }} data-testid="add-user-btn">
                    <UserPlus className="h-4 w-4 mr-2" /> Crear Usuario
                  </Button>
                </div>
              </div>

              {/* Current User Info */}
              <div className="bg-blue-50 border border-blue-200 p-4 mb-6 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Sesión actual:</strong> {user?.username} ({user?.role})
                </p>
              </div>

              {/* Users List */}
              <div className="grid gap-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 bg-stone-50 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {/* User Avatar */}
                      {u.foto_perfil ? (
                        <img 
                          src={u.foto_perfil} 
                          alt={u.nombre_completo || u.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-400"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-semibold">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{u.nombre_completo || u.username}</p>
                        <p className="text-sm text-stone-500">@{u.username}</p>
                        {u.telefono_whatsapp && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {u.telefono_whatsapp}
                          </p>
                        )}
                      </div>
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                      {u.id === user?.id && <Badge className="bg-green-500">Tú</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Edit Profile Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUserDialog(u)}
                        data-testid={`edit-user-${u.id}`}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Perfil
                      </Button>
                      {u.id !== user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteDialog({ open: true, type: 'user', id: u.id, name: u.username })}
                          data-testid={`delete-user-${u.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {users.length === 0 && <div className="text-center py-12 text-stone-500">No hay usuarios</div>}
              </div>
            </div>
          </TabsContent>

          {/* MY PROFILE TAB - For Agents Only */}
          <TabsContent value="my-profile">
            <div className="bg-white p-6 md:p-8 shadow-sm border">
              <h2 className="font-heading text-xl font-semibold text-slate-900 mb-6">Mi Perfil</h2>
              
              <div className="max-w-md space-y-6">
                {/* Profile Photo */}
                <div className="flex items-center gap-6">
                  {userForm.foto_perfil ? (
                    <img 
                      src={userForm.foto_perfil} 
                      alt="Mi foto" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-amber-400"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-white text-3xl font-bold">
                      {currentUsername.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <input 
                      type="file" 
                      ref={profilePhotoInputRef} 
                      accept="image/*" 
                      onChange={handleProfilePhotoUpload} 
                      className="hidden" 
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => profilePhotoInputRef.current?.click()}
                      disabled={profilePhotoUploading}
                    >
                      {profilePhotoUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                      Cambiar Foto
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Nombre Completo</Label>
                  <Input 
                    value={userForm.nombre_completo || ''} 
                    onChange={(e) => setUserForm(prev => ({ ...prev, nombre_completo: e.target.value }))}
                    className="mt-2"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <Label>Teléfono WhatsApp</Label>
                  <Input 
                    value={userForm.telefono_whatsapp || ''} 
                    onChange={(e) => setUserForm(prev => ({ ...prev, telefono_whatsapp: e.target.value }))}
                    className="mt-2"
                    placeholder="+1809XXXXXXX"
                  />
                  <p className="text-xs text-stone-500 mt-1">Este número se mostrará en las propiedades que publiques</p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSaveAgentProfile} style={{ backgroundColor: '#C5A059' }}>
                    <Save className="h-4 w-4 mr-2" /> Guardar Cambios
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Location Dialog */}
      <Dialog open={locationDialog} onOpenChange={setLocationDialog}>
        <DialogContent aria-describedby="loc-desc">
          <DialogHeader><DialogTitle>{editingLocation ? 'Editar Ubicación' : 'Nueva Ubicación'}</DialogTitle></DialogHeader>
          <p id="loc-desc" className="sr-only">Formulario de ubicación</p>
          <div className="space-y-4 py-4">
            <div><Label>Nombre *</Label><Input value={locationForm.name} onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))} className="mt-2" data-testid="location-name-input" /></div>
            <div><Label>Descripción</Label><Input value={locationForm.description} onChange={(e) => setLocationForm(prev => ({ ...prev, description: e.target.value }))} className="mt-2" /></div>
            <div className="flex items-center gap-2"><Switch checked={locationForm.is_active} onCheckedChange={(c) => setLocationForm(prev => ({ ...prev, is_active: c }))} /><Label>Activa</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocationDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveLocation} style={{ backgroundColor: '#C5A059' }} data-testid="save-location-btn">{editingLocation ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Property Dialog */}
      <Dialog open={propertyDialog} onOpenChange={setPropertyDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="prop-desc">
          <DialogHeader><DialogTitle>{editingProperty ? 'Editar Propiedad' : 'Nueva Propiedad'}</DialogTitle></DialogHeader>
          <p id="prop-desc" className="sr-only">Formulario de propiedad</p>
          <div className="space-y-6 py-4">
            {/* Images */}
            <div>
              <Label>Galería de Fotos</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {propertyForm.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.url} alt={img.alt} className="w-20 h-20 object-cover" />
                    <button onClick={() => removePropertyImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"><X className="h-3 w-3" /></button>
                  </div>
                ))}
                <input type="file" ref={imageInputRef} accept="image/*" onChange={handlePropertyImageUpload} className="hidden" />
                <button onClick={() => imageInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-stone-300 flex items-center justify-center text-stone-400"><Plus className="h-6 w-6" /></button>
              </div>
            </div>

            {/* Videos */}
            <div>
              <Label>Videos de YouTube</Label>
              <div className="flex gap-2 mt-2">
                <Input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                <Button type="button" variant="outline" onClick={addVideoUrl}><Video className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {propertyForm.video_urls.map((url, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">{url.slice(0, 30)}...<button onClick={() => removeVideoUrl(i)}><X className="h-3 w-3" /></button></Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2"><Label>Título *</Label><Input value={propertyForm.title} onChange={(e) => setPropertyForm(prev => ({ ...prev, title: e.target.value }))} className="mt-2" data-testid="property-title-input" /></div>
              <div><Label>Precio *</Label><Input type="number" value={propertyForm.price} onChange={(e) => setPropertyForm(prev => ({ ...prev, price: e.target.value }))} className="mt-2" /></div>
              <div><Label>Moneda</Label><Select value={propertyForm.currency} onValueChange={(v) => setPropertyForm(prev => ({ ...prev, currency: v }))}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="USD">USD</SelectItem><SelectItem value="DOP">DOP</SelectItem><SelectItem value="EUR">EUR</SelectItem></SelectContent></Select></div>
              <div><Label>Ubicación *</Label><Select value={propertyForm.location} onValueChange={(v) => setPropertyForm(prev => ({ ...prev, location: v }))}><SelectTrigger className="mt-2"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent>{locations.filter(l => l.is_active).map(l => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Tipo *</Label><Select value={propertyForm.property_type} onValueChange={(v) => setPropertyForm(prev => ({ ...prev, property_type: v }))}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Casa">Casa</SelectItem><SelectItem value="Apartamento">Apartamento</SelectItem><SelectItem value="Villa">Villa</SelectItem><SelectItem value="Terreno">Terreno</SelectItem><SelectItem value="Local Comercial">Local Comercial</SelectItem></SelectContent></Select></div>
              <div><Label>Estado</Label><Select value={propertyForm.status} onValueChange={(v) => setPropertyForm(prev => ({ ...prev, status: v }))}><SelectTrigger className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Disponible">Disponible</SelectItem><SelectItem value="Vendido">Vendido</SelectItem><SelectItem value="Reservado">Reservado</SelectItem></SelectContent></Select></div>
              <div><Label>Dirección</Label><Input value={propertyForm.address} onChange={(e) => setPropertyForm(prev => ({ ...prev, address: e.target.value }))} className="mt-2" /></div>
              <div><Label>Habitaciones</Label><Input type="number" value={propertyForm.bedrooms} onChange={(e) => setPropertyForm(prev => ({ ...prev, bedrooms: e.target.value }))} className="mt-2" /></div>
              <div><Label>Baños</Label><Input type="number" value={propertyForm.bathrooms} onChange={(e) => setPropertyForm(prev => ({ ...prev, bathrooms: e.target.value }))} className="mt-2" /></div>
              <div><Label>Área (m²)</Label><Input type="number" value={propertyForm.area} onChange={(e) => setPropertyForm(prev => ({ ...prev, area: e.target.value }))} className="mt-2" /></div>
              <div className="md:col-span-2"><Label>Descripción *</Label><Textarea value={propertyForm.description} onChange={(e) => setPropertyForm(prev => ({ ...prev, description: e.target.value }))} className="mt-2" rows={4} /></div>
              <div className="md:col-span-2">
                <Label>Amenidades</Label>
                <div className="flex gap-2 mt-2"><Input value={newAmenity} onChange={(e) => setNewAmenity(e.target.value)} placeholder="Ej: Piscina" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())} /><Button type="button" variant="outline" onClick={addAmenity}><Plus className="h-4 w-4" /></Button></div>
                <div className="flex flex-wrap gap-2 mt-2">{propertyForm.amenities.map((a, i) => <Badge key={i} variant="secondary" className="gap-1">{a}<button onClick={() => removeAmenity(i)}><X className="h-3 w-3" /></button></Badge>)}</div>
              </div>
              <div className="md:col-span-2 flex items-center gap-2"><Switch checked={propertyForm.is_featured} onCheckedChange={(c) => setPropertyForm(prev => ({ ...prev, is_featured: c }))} /><Label>Propiedad Destacada</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPropertyDialog(false)}>Cancelar</Button>
            <Button onClick={handleSaveProperty} style={{ backgroundColor: '#C5A059' }} data-testid="save-property-btn">{editingProperty ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(o) => !o && setDeleteDialog({ open: false, type: '', id: '', name: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar {deleteDialog.name}?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { 
              if (deleteDialog.type === 'location') handleDeleteLocation(); 
              else if (deleteDialog.type === 'property') handleDeleteProperty(); 
              else if (deleteDialog.type === 'message') handleDeleteMessage(); 
              else if (deleteDialog.type === 'user') handleDeleteUser(); 
              else if (deleteDialog.type === 'sell-request') handleDeleteSellRequest();
              else if (deleteDialog.type === 'job-application') handleDeleteJobApplication();
            }} className="bg-red-500 hover:bg-red-600">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent aria-describedby="password-desc">
          <DialogHeader><DialogTitle>Cambiar Contraseña</DialogTitle></DialogHeader>
          <p id="password-desc" className="sr-only">Formulario para cambiar contraseña</p>
          <div className="space-y-4 py-4">
            <div>
              <Label>Contraseña Actual *</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="mt-2"
                data-testid="current-password-input"
              />
            </div>
            <div>
              <Label>Nueva Contraseña *</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="mt-2"
                placeholder="Mínimo 6 caracteres"
                data-testid="new-password-input"
              />
            </div>
            <div>
              <Label>Confirmar Nueva Contraseña *</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="mt-2"
                data-testid="confirm-password-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)}>Cancelar</Button>
            <Button onClick={handleChangePassword} disabled={savingPassword} style={{ backgroundColor: '#C5A059' }} data-testid="save-password-btn">
              {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cambiar Contraseña'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={userDialog} onOpenChange={(open) => { setUserDialog(open); if (!open) setEditingUser(null); }}>
        <DialogContent aria-describedby="user-desc" className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Perfil de Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <p id="user-desc" className="sr-only">Formulario para {editingUser ? 'editar' : 'crear'} usuario</p>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Basic Info */}
            {!editingUser && (
              <>
                <div>
                  <Label>Nombre de Usuario *</Label>
                  <Input
                    value={userForm.username}
                    onChange={(e) => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                    className="mt-2"
                    placeholder="Ej: usuario1"
                    data-testid="new-username-input"
                  />
                </div>
                <div>
                  <Label>Contraseña *</Label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-2"
                    placeholder="Mínimo 6 caracteres"
                    data-testid="new-user-password-input"
                  />
                </div>
                <div>
                  <Label>Rol</Label>
                  <Select value={userForm.role} onValueChange={(v) => setUserForm(prev => ({ ...prev, role: v }))}>
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador (Acceso total)</SelectItem>
                      <SelectItem value="agente">Agente (Solo propiedades)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Profile Info - Always shown */}
            <Separator />
            <p className="text-sm text-stone-500 font-medium">Información del Perfil (para tarjetas de propiedades)</p>
            
            {/* Profile Photo */}
            <div>
              <Label>Foto de Perfil</Label>
              <div className="flex items-center gap-4 mt-2">
                {userForm.foto_perfil ? (
                  <img src={userForm.foto_perfil} alt="Foto de perfil" className="w-16 h-16 rounded-full object-cover border-2 border-amber-400" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-stone-200 flex items-center justify-center border-2 border-dashed border-stone-300">
                    <Users className="w-6 h-6 text-stone-400" />
                  </div>
                )}
                <div className="space-y-2">
                  <input 
                    type="file" 
                    ref={profilePhotoInputRef} 
                    accept="image/*" 
                    onChange={handleProfilePhotoUpload} 
                    className="hidden" 
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => profilePhotoInputRef.current?.click()}
                    disabled={profilePhotoUploading}
                    data-testid="upload-profile-photo-btn"
                  >
                    {profilePhotoUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    {userForm.foto_perfil ? 'Cambiar' : 'Subir'} Foto
                  </Button>
                  {userForm.foto_perfil && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => setUserForm(prev => ({ ...prev, foto_perfil: '' }))}
                      className="text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Quitar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label>Nombre Completo</Label>
              <Input
                value={userForm.nombre_completo}
                onChange={(e) => setUserForm(prev => ({ ...prev, nombre_completo: e.target.value }))}
                className="mt-2"
                placeholder="Ej: Juan Pérez"
                data-testid="user-full-name-input"
              />
              <p className="text-xs text-stone-400 mt-1">Se mostrará en las tarjetas de propiedades</p>
            </div>

            <div>
              <Label>Teléfono WhatsApp</Label>
              <Input
                value={userForm.telefono_whatsapp}
                onChange={(e) => setUserForm(prev => ({ ...prev, telefono_whatsapp: e.target.value }))}
                className="mt-2"
                placeholder="Ej: +18091234567"
                data-testid="user-whatsapp-input"
              />
              <p className="text-xs text-stone-400 mt-1">Los clientes podrán contactar directamente desde las propiedades</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUserDialog(false); setEditingUser(null); }} disabled={savingUser}>
              Cancelar
            </Button>
            <Button 
              onClick={editingUser ? handleUpdateUserProfile : handleCreateUser} 
              disabled={savingUser} 
              style={{ backgroundColor: '#C5A059' }} 
              data-testid="create-user-btn"
            >
              {savingUser ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {editingUser ? 'Guardando...' : 'Creando...'}</>
              ) : (
                editingUser ? 'Guardar Cambios' : 'Crear Usuario'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
