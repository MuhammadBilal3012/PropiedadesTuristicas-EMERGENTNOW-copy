'use client';

import Link from 'next/link';
import { Building2, Phone, Mail, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const FacebookIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

export default function Footer({ agency }) {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { key: 'home', path: '/', label: 'Inicio' },
    { key: 'properties', path: '/propiedades', label: 'Propiedades' },
    { key: 'about', path: '/nosotros', label: 'Sobre Nosotros' },
    { key: 'contact', path: '/contacto', label: 'Contacto' },
  ];

  const socialLinks = [
    { key: 'facebook', url: agency?.facebook_url || 'https://facebook.com', icon: FacebookIcon, label: 'Facebook' },
    { key: 'instagram', url: agency?.instagram_url || 'https://instagram.com', icon: InstagramIcon, label: 'Instagram' },
    { key: 'tiktok', url: agency?.tiktok_url || 'https://tiktok.com', icon: TikTokIcon, label: 'TikTok' },
  ];

  return (
    <footer data-testid="main-footer" className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              {agency?.logo_url ? (
                <img 
                  src={agency.logo_url} 
                  alt={agency?.name || 'Logo'} 
                  className="h-12 w-auto object-contain"
                  data-testid="footer-logo"
                />
              ) : (
                <Building2 className="h-8 w-8" style={{ color: '#C5A059' }} />
              )}
              <span className="font-heading text-2xl font-semibold">
                {agency?.name || 'Propiedades Turisticas RD'}
              </span>
            </div>
            <p className="text-stone-400 leading-relaxed max-w-md mb-6">
              {agency?.about_description || 'Expertos en bienes raices con mas de 15 anos de experiencia en el mercado inmobiliario de Republica Dominicana.'}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/vende-con-nosotros" 
                className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: '#C5A059' }}
                data-testid="sell-with-us-btn"
              >
                Vende con Nosotros
              </Link>
              <Link 
                href="/trabaja-con-nosotros" 
                className="inline-flex items-center justify-center px-6 py-3 font-semibold text-white bg-green-600 hover:bg-green-700 transition-all"
                data-testid="work-with-us-btn"
              >
                Trabaja con Nosotros
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-6" style={{ color: '#C5A059' }}>
              Enlaces Rapidos
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link href={link.path} className="text-stone-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-6" style={{ color: '#C5A059' }}>
              Contacto
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#C5A059' }} />
                <span className="text-stone-400">{agency?.phone || '+18098475498'}</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#C5A059' }} />
                <span className="text-stone-400">{agency?.email || 'info@propiedadesturisticasrd.com'}</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#C5A059' }} />
                <span className="text-stone-400">{agency?.address || 'Santo Domingo, Republica Dominicana'}</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.key}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`social-${social.key}`}
                  className="p-2 bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-white transition-all"
                  aria-label={social.label}
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-stone-800" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-stone-500 text-sm">
          <p>&copy; {currentYear} {agency?.name || 'Propiedades Turisticas RD'}. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/privacidad" className="hover:text-white transition-colors">Politica de Privacidad</Link>
            <Link href="/terminos" className="hover:text-white transition-colors">Terminos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
