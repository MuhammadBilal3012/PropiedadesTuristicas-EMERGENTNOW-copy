import { initializeDatabase, getPropertyById, getAgencySettings } from '@/lib/db';
import PropertyDetailClient from './PropertyDetailClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
  try {
    await initializeDatabase();
    const { id } = await params;
    const property = await getPropertyById(id);
    
    if (!property) {
      return { title: 'Propiedad no encontrada' };
    }

    return {
      title: `${property.title} | Propiedades Turísticas RD`,
      description: property.description?.substring(0, 160),
      openGraph: {
        title: property.title,
        description: property.description?.substring(0, 160),
        images: property.images?.[0]?.url ? [property.images[0].url] : [],
      },
    };
  } catch (e) {
    return { title: 'Propiedad no encontrada' };
  }
}

export default async function PropertyDetailPage({ params }) {
  try {
    await initializeDatabase();
  } catch (e) {
    console.error('DB init error:', e);
  }
  
  const { id } = await params;
  
  const [property, agency] = await Promise.all([
    getPropertyById(id).catch(() => null),
    getAgencySettings().catch(() => null),
  ]);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} agency={agency} />;
}
