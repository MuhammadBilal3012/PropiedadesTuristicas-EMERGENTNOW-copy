import { Suspense } from 'react';
import PropertiesPageClient from './PropertiesPageClient';
import { initializeDatabase, getLocations } from '@/lib/db';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Propiedades | Propiedades Turísticas RD',
  description: 'Explora nuestra selección de propiedades exclusivas en República Dominicana.',
};

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#C5A059' }} />
    </div>
  );
}

export default async function PropertiesPage() {
  try {
    await initializeDatabase();
  } catch (e) {
    console.error('DB init error:', e);
  }
  
  const locations = await getLocations(true).catch(() => []);
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PropertiesPageClient locations={locations} />
    </Suspense>
  );
}
