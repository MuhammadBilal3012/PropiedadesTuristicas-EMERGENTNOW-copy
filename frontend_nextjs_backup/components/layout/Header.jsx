'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, Building2, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function Header({ agency }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/propiedades', label: 'Propiedades', icon: Building2 },
    { path: '/nosotros', label: 'Nosotros', icon: Users },
    { path: '/contacto', label: 'Contacto', icon: Mail },
  ];

  const isActive = (path) => pathname === path;
  const isHomePage = pathname === '/';

  return (
    <header
      data-testid="main-header"
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
        scrolled || !isHomePage
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-2'
          : 'bg-transparent py-3 md:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-8">
        <div className="flex items-center justify-between">
          {/* Logo + Brand - VISIBLE ON ALL DEVICES */}
          <Link href="/" className="flex items-center gap-2 md:gap-4 flex-shrink min-w-0" data-testid="logo-link">
            {agency?.logo_url ? (
              <img
                src={agency.logo_url}
                alt={agency?.name || 'Logo'}
                className="h-10 md:h-16 lg:h-20 object-contain flex-shrink-0"
                data-testid="header-logo"
              />
            ) : (
              <Building2 className="h-8 w-8 md:h-10 md:w-10 flex-shrink-0" style={{ color: '#C5A059' }} />
            )}
            <span 
              className={`font-bold tracking-tight truncate transition-colors ${
                scrolled || !isHomePage ? 'text-slate-900' : 'text-white'
              }`}
              style={{ 
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 'clamp(0.9rem, 3vw, 1.75rem)',
                textShadow: scrolled || !isHomePage ? 'none' : '1px 1px 2px rgba(0,0,0,0.3)'
              }}
              data-testid="header-brand-name"
            >
              {agency?.name || 'PROPIEDADES RD'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-8" data-testid="desktop-nav">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`font-medium transition-colors text-sm lg:text-base whitespace-nowrap ${
                  scrolled || !isHomePage
                    ? isActive(item.path)
                      ? 'text-slate-900 border-b-2 border-amber-500 pb-1'
                      : 'text-stone-600 hover:text-slate-900'
                    : isActive(item.path)
                    ? 'text-white border-b-2 border-amber-400 pb-1'
                    : 'text-white/90 hover:text-white'
                }`}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                data-testid="mobile-menu-btn"
                className={`flex-shrink-0 ${scrolled || !isHomePage ? 'text-slate-900' : 'text-white'}`}
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b bg-stone-50">
                  <div className="flex items-center gap-3">
                    {agency?.logo_url ? (
                      <img src={agency.logo_url} alt="Logo" className="h-10 object-contain" />
                    ) : (
                      <Building2 className="h-8 w-8" style={{ color: '#C5A059' }} />
                    )}
                    <span className="text-base font-bold text-slate-900 truncate" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                      {agency?.name || 'Propiedades RD'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col py-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-4 px-6 py-4 font-medium transition-all ${
                        isActive(item.path)
                          ? 'bg-amber-50 text-amber-700 border-l-4 border-amber-500'
                          : 'text-stone-600 hover:bg-stone-50'
                      }`}
                      style={{ fontFamily: "'Montserrat', sans-serif" }}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
