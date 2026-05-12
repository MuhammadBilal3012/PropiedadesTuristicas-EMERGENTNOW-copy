import { initializeDatabase, getAgencySettings } from '@/lib/db';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';

export default async function PublicLayout({ children }) {
  try {
    await initializeDatabase();
  } catch (e) {
    console.error('DB init error:', e);
  }
  
  const agency = await getAgencySettings().catch(() => null);

  return (
    <div className="overflow-x-hidden">
      <Header agency={agency} />
      {children}
      <Footer agency={agency} />
      <WhatsAppButton phone={agency?.whatsapp} />
    </div>
  );
}
