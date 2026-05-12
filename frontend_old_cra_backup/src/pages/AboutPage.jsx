import { Link } from 'react-router-dom';
import { Award, Users, Home, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';

const AboutPage = ({ agency }) => {
  const stats = [
    { icon: Home, value: agency?.about_properties_sold || 500, label: 'Propiedades Vendidas' },
    { icon: Users, value: agency?.about_happy_clients || 1000, label: 'Clientes Satisfechos' },
    { icon: Award, value: agency?.about_years_experience || 15, label: 'Años de Experiencia' },
    { icon: TrendingUp, value: agency?.about_team_members || 25, label: 'Miembros del Equipo' },
  ];

  return (
    <div data-testid="about-page" className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${agency?.hero_images?.[0] || 'https://images.unsplash.com/photo-1724598674807-6acb225b98f2?crop=entropy&cs=srgb&fm=jpg&q=85'})`,
          }}
        />
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="relative z-10 text-center px-4">
          <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: '#C5A059' }}>
            Conócenos
          </p>
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {agency?.about_title || 'Sobre Nosotros'}
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Tu socio de confianza en bienes raíces en República Dominicana
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#C5A059' }}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <p className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() + '+' : stat.value}
                </p>
                <p className="text-stone-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: '#C5A059' }}>
                Nuestra Historia
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900 mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {agency?.about_description || 'Más de 15 años transformando sueños en hogares'}
              </h2>
              <div className="space-y-4 text-stone-600 leading-relaxed">
                <p><strong>Misión:</strong> {agency?.about_mission || 'Nuestra misión es ayudarte a encontrar la propiedad perfecta que se adapte a tus necesidades y estilo de vida.'}</p>
                <p><strong>Visión:</strong> {agency?.about_vision || 'Ser la inmobiliaria líder en República Dominicana, reconocida por nuestra excelencia en servicio al cliente.'}</p>
              </div>
              <Link to="/contacto" className="inline-block mt-8">
                <Button className="px-8 py-3 text-white font-semibold" style={{ backgroundColor: '#C5A059' }}>
                  Contáctanos
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={agency?.hero_images?.[1] || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?crop=entropy&cs=srgb&fm=jpg&q=85'}
                  alt="Nuestra oficina"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 p-8 text-white hidden md:block" style={{ backgroundColor: '#0F172A' }}>
                <p className="font-heading text-4xl font-bold mb-2">{agency?.about_years_experience || 15}+</p>
                <p className="text-white/80">Años de Experiencia</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - From Admin */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: '#C5A059' }}>
              ¿Por qué elegirnos?
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Lo que nos hace diferentes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 bg-stone-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-stone-100">
              <div className="w-1 h-12 mb-6" style={{ backgroundColor: '#C5A059' }} />
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3">
                {agency?.feature1_title || 'Experiencia Comprobada'}
              </h3>
              <p className="text-stone-600">{agency?.feature1_description || 'Más de 15 años de experiencia en el mercado inmobiliario dominicano.'}</p>
            </div>
            <div className="p-8 bg-stone-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-stone-100">
              <div className="w-1 h-12 mb-6" style={{ backgroundColor: '#C5A059' }} />
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3">
                {agency?.feature2_title || 'Atención Personalizada'}
              </h3>
              <p className="text-stone-600">{agency?.feature2_description || 'Un equipo dedicado a encontrar la propiedad perfecta para ti.'}</p>
            </div>
            <div className="p-8 bg-stone-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-stone-100">
              <div className="w-1 h-12 mb-6" style={{ backgroundColor: '#C5A059' }} />
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3">
                {agency?.feature3_title || 'Precios Competitivos'}
              </h3>
              <p className="text-stone-600">{agency?.feature3_description || 'Las mejores opciones de inversión al mejor precio del mercado.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            ¿Listo para encontrar tu próxima propiedad?
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            Nuestro equipo de expertos está listo para ayudarte a hacer realidad tus sueños inmobiliarios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/propiedades">
              <Button className="px-8 py-3 text-white font-semibold" style={{ backgroundColor: '#C5A059' }}>
                Ver Propiedades
              </Button>
            </Link>
            <Link to="/contacto">
              <Button variant="outline" className="px-8 py-3 border-white text-white hover:bg-white hover:text-slate-900 font-semibold">
                Contactar
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
