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
      {/* Hero Section - Header */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
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
        </div>
      </section>

      {/* Image + Story Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-xl">
                <img
                  src={agency?.hero_images?.[1] || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?crop=entropy&cs=srgb&fm=jpg&q=85'}
                  alt="Nuestra oficina"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 p-6 text-white hidden md:block rounded-lg shadow-lg" style={{ backgroundColor: '#C5A059' }}>
                <p className="font-heading text-3xl font-bold mb-1">{agency?.about_years_experience || 15}+</p>
                <p className="text-white/90 text-sm">Años de Experiencia</p>
              </div>
            </div>

            {/* Story - WITHOUT Mission/Vision here, WITHOUT button */}
            <div>
              <p className="text-sm uppercase tracking-[0.2em] mb-4" style={{ color: '#C5A059' }}>
                Nuestra Historia
              </p>
              <h2 className="font-heading text-2xl md:text-3xl font-semibold text-slate-900 mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {agency?.about_description || 'Más de 15 años transformando sueños en hogares'}
              </h2>
              <p className="text-stone-600 leading-relaxed">
                Somos una empresa dedicada a ofrecer las mejores propiedades en República Dominicana. 
                Con años de experiencia en el mercado inmobiliario, hemos ayudado a cientos de familias 
                a encontrar el hogar de sus sueños.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Section - Like the reference image */}
      <section className="py-12 md:py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: '#C5A059' }}>
              ¿Por qué elegirnos?
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-slate-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Lo que nos hace diferentes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Mission */}
            <div className="p-8 bg-white hover:shadow-xl transition-all duration-300 border border-stone-100 rounded-lg">
              <div className="w-1 h-12 mb-6 rounded" style={{ backgroundColor: '#C5A059' }} />
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {agency?.about_mission_title || 'Misión'}
              </h3>
              <p className="text-stone-600">
                {agency?.about_mission || 'Nuestra misión es ayudarte a encontrar la propiedad perfecta que se adapte a tus necesidades y estilo de vida.'}
              </p>
            </div>
            
            {/* Vision */}
            <div className="p-8 bg-white hover:shadow-xl transition-all duration-300 border border-stone-100 rounded-lg">
              <div className="w-1 h-12 mb-6 rounded" style={{ backgroundColor: '#C5A059' }} />
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {agency?.about_vision_title || 'Visión'}
              </h3>
              <p className="text-stone-600">
                {agency?.about_vision || 'Ser la inmobiliaria líder en República Dominicana, reconocida por nuestra excelencia en servicio al cliente.'}
              </p>
            </div>
            
            {/* Values */}
            <div className="p-8 bg-white hover:shadow-xl transition-all duration-300 border border-stone-100 rounded-lg">
              <div className="w-1 h-12 mb-6 rounded" style={{ backgroundColor: '#C5A059' }} />
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-3" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {agency?.about_values_title || 'Valores'}
              </h3>
              <p className="text-stone-600">
                {agency?.about_values || 'Compromiso, honestidad, transparencia y dedicación en cada transacción que realizamos.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - 4 Icons at the bottom */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: '#C5A059' }}>
              Nuestros Logros
            </p>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-slate-900" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Números que hablan por nosotros
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-stone-50 rounded-lg hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full" style={{ backgroundColor: '#C5A059' }}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
                <p className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-1">
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() + '+' : stat.value}
                </p>
                <p className="text-stone-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            ¿Listo para encontrar tu próxima propiedad?
          </h2>
          <p className="text-white/70 mb-6 text-base">
            Nuestro equipo de expertos está listo para ayudarte.
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
