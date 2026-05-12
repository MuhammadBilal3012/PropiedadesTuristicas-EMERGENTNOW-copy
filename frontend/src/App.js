import { useState, useEffect } from 'react';
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/layout/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';

import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SellWithUsPage from './pages/SellWithUsPage';
import WorkWithUsPage from './pages/WorkWithUsPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminPage';

import { getAgencySettings } from './lib/api';

function App() {
  const [agency, setAgency] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const savedUser = localStorage.getItem('admin_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
      }
    }

    getAgencySettings()
      .then(data => setAgency(data))
      .catch(err => console.error('Error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#C5A059' }}></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/admin" element={user ? <Navigate to="/admin/dashboard" replace /> : <LoginPage onLogin={handleLogin} agency={agency} />} />
        <Route path="/admin/dashboard" element={user ? <AdminDashboard user={user} onLogout={handleLogout} agency={agency} /> : <Navigate to="/admin" replace />} />
        
        <Route path="/" element={<PageWrapper agency={agency}><HomePage agency={agency} /></PageWrapper>} />
        <Route path="/propiedades" element={<PageWrapper agency={agency}><PropertiesPage agency={agency} /></PageWrapper>} />
        <Route path="/propiedad/:id" element={<PageWrapper agency={agency}><PropertyDetailPage agency={agency} /></PageWrapper>} />
        <Route path="/nosotros" element={<PageWrapper agency={agency}><AboutPage agency={agency} /></PageWrapper>} />
        <Route path="/contacto" element={<PageWrapper agency={agency}><ContactPage agency={agency} /></PageWrapper>} />
        <Route path="/vende-con-nosotros" element={<PageWrapper agency={agency}><SellWithUsPage agency={agency} /></PageWrapper>} />
        <Route path="/trabaja-con-nosotros" element={<PageWrapper agency={agency}><WorkWithUsPage agency={agency} /></PageWrapper>} />
      </Routes>
    </BrowserRouter>
  );
}

function PageWrapper({ agency, children }) {
  return (
    <div className="overflow-x-hidden">
      <Header agency={agency} />
      {children}
      <Footer agency={agency} />
      <WhatsAppButton phone={agency?.whatsapp} />
    </div>
  );
}

export default App;
