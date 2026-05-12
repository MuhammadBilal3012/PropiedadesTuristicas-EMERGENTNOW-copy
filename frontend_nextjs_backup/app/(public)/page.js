import { NextResponse } from 'next/server';
import { initializeDatabase, seedDatabase, getAgencySettings, getFeaturedProperties, getTotalViews } from '@/lib/db';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
  try {
    await initializeDatabase();
    await seedDatabase();
  } catch (e) {
    console.error('DB init error:', e);
  }

  const [agency, featuredProperties, totalViews] = await Promise.all([
    getAgencySettings().catch(() => null),
    getFeaturedProperties().catch(() => []),
    getTotalViews().catch(() => 0),
  ]);

  return (
    <HomePageClient 
      agency={agency} 
      featuredProperties={featuredProperties}
      initialViews={totalViews}
    />
  );
}
