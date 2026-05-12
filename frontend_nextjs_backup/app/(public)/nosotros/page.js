import { initializeDatabase, getAgencySettings } from '@/lib/db';
import { Building2, CheckCircle, Target, Eye, Award, Users, Home, Heart } from 'lucide-react';

export const metadata = {
  title: 'Sobre Nosotros | Propiedades Turísticas RD',
  description: 'Conoce más sobre nuestra empresa y nuestro equipo de profesionales inmobiliarios.',
};

export default async function AboutPage() {
  try {
    await initializeDatabase();
  } catch (e) {
    console.error('DB init error:', e);
  }
  
  const agency = await getAgencySettings().catch(() => null);

  return (
    <div data-testid="about-page" className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="bg-slate-900 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: '#C5A059' }}>
            Conócenos
          </p>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            {agency?.about_title || 'Sobre Nosotros'}
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            {agency?.about_description || 'Somos expertos en bienes raíces con más de 15 años de experiencia en el mercado inmobiliario de República Dominicana.'}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 md:px-8 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="bg-white p-6 md:p-8 shadow-lg text-center">
              <Award className="h-8 w-8 mx-auto mb-3" style={{ color: '#C5A059' }} />
              <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                {agency?.about_years_experience || 15}+
              </p>
              <p className="text-stone-500 text-sm">Años de Experiencia</p>
            </div>
            <div className="bg-white p-6 md:p-8 shadow-lg text-center">
              <Home className="h-8 w-8 mx-auto mb-3" style={{ color: '#C5A059' }} />
              <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                {agency?.about_properties_sold || 500}+
              </p>
              <p className="text-stone-500 text-sm">Propiedades Vendidas</p>
            </div>
            <div className="bg-white p-6 md:p-8 shadow-lg text-center">
              <Heart className="h-8 w-8 mx-auto mb-3" style={{ color: '#C5A059' }} />
              <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                {agency?.about_happy_clients || 1000}+
              </p>
              <p className="text-stone-500 text-sm">Clientes Satisfechos</p>
            </div>
            <div className="bg-white p-6 md:p-8 shadow-lg text-center">
              <Users className="h-8 w-8 mx-auto mb-3" style={{ color: '#C5A059' }} />
              <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-1">
                {agency?.about_team_members || 25}
              </p>
              <p className="text-stone-500 text-sm">Miembros del Equipo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="p-8 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-8 w-8" style={{ color: '#C5A059' }} />
                <h2 className="font-heading text-2xl font-bold text-slate-900">Nuestra Misión</h2>
              </div>
              <p className="text-stone-600 leading-relaxed">
                {agency?.about_mission || 'Nuestra misión es ayudarte a encontrar la propiedad perfecta que se adapte a tus necesidades y estilo de vida, brindando un servicio excepcional en cada paso del proceso.'}
              </p>
            </div>
            <div className="p-8 bg-stone-50 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-8 w-8" style={{ color: '#C5A059' }} />
                <h2 className="font-heading text-2xl font-bold text-slate-900">Nuestra Visión</h2>
              </div>
              <p className="text-stone-600 leading-relaxed">
                {agency?.about_vision || 'Ser la inmobiliaria líder en República Dominicana, reconocida por nuestra excelencia en servicio al cliente, innovación y compromiso con la comunidad.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 md:px-8 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-medium tracking-wider uppercase text-sm">
              ¿Por qué elegirnos?
            </span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mt-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Nuestras Fortalezas
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 shadow-lg">
              <CheckCircle className="h-10 w-10 mb-4" style={{ color: '#C5A059' }} />
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">
                {agency?.feature1_title || 'Experiencia Comprobada'}
              </h3>
              <p className="text-stone-600">
                {agency?.feature1_description || 'Más de 15 años de experiencia en el mercado inmobiliario dominicano, con un profundo conocimiento de las mejores zonas y oportunidades de inversión.'}
              </p>
            </div>
            <div className="bg-white p-8 shadow-lg">
              <Users className="h-10 w-10 mb-4" style={{ color: '#C5A059' }} />
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">
                {agency?.feature2_title || 'Atención Personalizada'}
              </h3>
              <p className="text-stone-600">
                {agency?.feature2_description || 'Un equipo dedicado a encontrar la propiedad perfecta para ti, entendiendo tus necesidades únicas y ofreciendo soluciones a medida.'}
              </p>
            </div>
            <div className="bg-white p-8 shadow-lg">
              <Building2 className="h-10 w-10 mb-4" style={{ color: '#C5A059' }} />
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">
                {agency?.feature3_title || 'Precios Competitivos'}
              </h3>
              <p className="text-stone-600">
                {agency?.feature3_description || 'Las mejores opciones de inversión al mejor precio del mercado, con acceso exclusivo a propiedades premium en toda la isla.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
