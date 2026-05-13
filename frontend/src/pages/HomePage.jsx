import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, CheckCircle, Users, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import PropertyCard from '../components/PropertyCard';
import { getFeaturedProperties, seedData } from '../lib/api';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const DEFAULT_HERO_IMAGE = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80';

const HomePage = ({ agency }) => {
  const navigate = useNavigate();
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);
  const viewTracked = useRef(false);

  // Cover the iframe briefly on mount to hide the YouTube title overlay flash
  useEffect(() => {
    setVideoReady(false);
    const t = setTimeout(() => setVideoReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const heroImages = agency?.hero_images?.length > 0 ? agency.hero_images : [DEFAULT_HERO_IMAGE];
  const videoUrl = agency?.hero_video_url || '';

  // Logo position from settings (default: top-left)
  const logoPosition = agency?.logo_position || 'top-left';

  const isYouTubeUrl = (url) => url && (url.includes('youtube.com') || url.includes('youtu.be'));

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    return url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1] || null;
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    // enablejsapi=1 lets us auto-resume on pause via the IFrame API below.
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&fs=0&disablekb=1&start=3&enablejsapi=1`;
  };

  // Force-resume the YouTube hero video if YouTube pauses it (e.g. after ads/buffering),
  // so mobile control overlays stay hidden.
  useEffect(() => {
    const videoId = getYouTubeVideoId(videoUrl);
    if (!videoId) return;

    let player;
    const ensureApi = () =>
      new Promise((resolve) => {
        if (window.YT && window.YT.Player) return resolve(window.YT);
        const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
        if (!existing) {
          const s = document.createElement('script');
          s.src = 'https://www.youtube.com/iframe_api';
          document.head.appendChild(s);
        }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve(window.YT);
        };
      });

    let cancelled = false;
    ensureApi().then((YT) => {
      if (cancelled) return;
      const iframe = document.getElementById('hero-youtube-player');
      if (!iframe) return;
      player = new YT.Player(iframe, {
        events: {
          onStateChange: (e) => {
            if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
              try { e.target.playVideo(); } catch (_) { /* ignore */ }
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try { player?.destroy(); } catch (_) { /* ignore */ }
    };
  }, [videoUrl]);

  // Track visit and fetch view count
  useEffect(() => {
    loadData();
    trackVisit();
    fetchViews();
  }, []);

  useEffect(() => {
    if (heroImages.length > 1 && !videoUrl) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroImages.length, videoUrl]);

  const trackVisit = async () => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    try {
      await axios.post(`${API_URL}/api/track/visit?page=home`);
    } catch (e) { /* ignore */ }
  };

  const fetchViews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/views/count`);
      setTotalViews(res.data.total_views || 0);
    } catch (e) { /* ignore */ }
  };

  const loadData = async () => {
    try {
      await seedData();
      const properties = await getFeaturedProperties(6);
      setFeaturedProperties(properties);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get logo position styles
  const getLogoPositionStyles = () => {
    const positions = {
      'top-left': { top: '20px', left: '20px' },
      'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
      'top-right': { top: '20px', right: '20px' },
      'center-left': { top: '50%', left: '20px', transform: 'translateY(-50%)' },
      'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      'center-right': { top: '50%', right: '20px', transform: 'translateY(-50%)' },
      'bottom-left': { bottom: '100px', left: '20px' },
      'bottom-center': { bottom: '100px', left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: '100px', right: '20px' },
    };
    return positions[logoPosition] || positions['top-left'];
  };

  // =============================================
  // RESPONSIVE VERSION - Single tree adapts to all devices
  // =============================================
  return (
    <div data-testid="home-page" className="overflow-x-hidden">
      
      {/* HERO SECTION - 100vh desktop, 33vh mobile */}
      <section 
        className="hero-section relative w-full overflow-hidden"
        style={{ height: '100vh', minHeight: '500px' }}
      >
        {/* Video Background */}
        {videoUrl && isYouTubeUrl(videoUrl) ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <iframe
              id="hero-youtube-player"
              src={getYouTubeEmbedUrl(videoUrl)}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: '177.77vh',
                height: '100vh',
                minWidth: '100%',
                minHeight: '56.25vw',
                position: 'absolute',
              }}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Hero Video"
            />
            {/* Black cover to hide YouTube title overlay flash on initial load */}
            <div
              className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
              style={{
                backgroundColor: '#000',
                opacity: videoReady ? 0 : 1,
                zIndex: 1,
              }}
              aria-hidden="true"
            />
          </div>
        ) : videoUrl && !isYouTubeUrl(videoUrl) ? (
          <video 
            ref={videoRef} 
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
            autoPlay 
            muted 
            loop 
            playsInline
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          heroImages.map((image, index) => (
            <div
              key={index}
              className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
              style={{ 
                backgroundImage: `url(${image})`, 
                opacity: index === currentHeroIndex ? 1 : 0,
                position: 'absolute',
                top: 0,
                left: 0,
              }}
            />
          ))
        )}
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" style={{ zIndex: 5 }} />

        {/* Floating Logo in Hero - uses hero_logo_url with custom dimensions */}
        {agency?.hero_logo_url && (
          <div 
            className="absolute z-30"
            style={getLogoPositionStyles()}
          >
            <img 
              src={agency.hero_logo_url} 
              alt={agency?.name || 'Logo'} 
              style={{ 
                width: `${agency?.hero_logo_width || 150}px`,
                height: `${agency?.hero_logo_height || 100}px`,
                objectFit: 'contain',
                filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
              }}
            />
          </div>
        )}
        
        {/* View Counter - Bottom right floating */}
        <div 
          className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white text-xs md:text-sm"
          style={{ 
            position: 'absolute', 
            bottom: '80px', 
            right: '16px', 
            zIndex: 100,
          }}
        >
          <Eye className="h-3 w-3 md:h-4 md:w-4" />
          <span>{totalViews.toLocaleString()}</span>
        </div>
        
        {/* Hero Content */}
        <div 
          className="absolute inset-x-0 flex flex-col px-4" 
          style={{ 
            zIndex: 10,
            top: `${agency?.hero_title_vertical_position || 50}%`,
            transform: 'translateY(-50%)',
            alignItems: agency?.hero_title_position === 'left' ? 'flex-start' : 
                       agency?.hero_title_position === 'right' ? 'flex-end' : 'center',
            textAlign: agency?.hero_title_position || 'center',
            paddingLeft: agency?.hero_title_position === 'left' ? '5%' : undefined,
            paddingRight: agency?.hero_title_position === 'right' ? '5%' : undefined,
          }}
        >
          <h1 
            className="font-bold text-white mb-4 max-w-4xl leading-tight"
            style={{ 
              fontFamily: "'Montserrat', sans-serif", 
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontSize: `${agency?.hero_title_size || 48}px`,
            }}
          >
            {agency?.hero_headline || 'Tenemos las Llaves del Hogar que Buscas'}
          </h1>
          {agency?.hero_subheadline && (
            <p 
              className="text-white/90 mb-8 max-w-2xl" 
              style={{ 
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                fontSize: `${agency?.hero_subtitle_size || 18}px`,
              }}
            >
              {agency.hero_subheadline}
            </p>
          )}
        </div>

        {/* Image Indicators */}
        {heroImages.length > 1 && !videoUrl && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 20 }}>
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentHeroIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${index === currentHeroIndex ? 'bg-white w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* FEATURED PROPERTIES - Directly after hero */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-medium tracking-wider uppercase text-sm">Propiedades Destacadas</span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mt-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Descubre tu Próximo Hogar
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-xl h-96 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.map((property) => <PropertyCard key={property.id} property={property} />)}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/propiedades">
              <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8">
                Ver Todas las Propiedades <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-medium tracking-wider uppercase text-sm">¿Por qué elegirnos?</span>
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mt-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Tu Socio Inmobiliario de Confianza
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {agency?.feature1_title || 'Experiencia Comprobada'}
              </h3>
              <p className="text-stone-600">{agency?.feature1_description || 'Más de 15 años de experiencia en el mercado inmobiliario dominicano.'}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {agency?.feature2_title || 'Atención Personalizada'}
              </h3>
              <p className="text-stone-600">{agency?.feature2_description || 'Un equipo dedicado a encontrar la propiedad perfecta para ti.'}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                {agency?.feature3_title || 'Precios Competitivos'}
              </h3>
              <p className="text-stone-600">{agency?.feature3_description || 'Las mejores opciones de inversión al mejor precio del mercado.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section 
        className="py-20 md:py-28 px-4 md:px-8 relative bg-cover bg-center bg-fixed"
        style={{ backgroundImage: `url(${heroImages[0]})` }}
      >
        <div className="absolute inset-0 bg-slate-900/80" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-6" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            ¿Listo para encontrar tu propiedad ideal?
          </h2>
          <p className="text-white/80 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Nuestro equipo de expertos está listo para ayudarte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/propiedades">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8">Explorar Propiedades</Button>
            </Link>
            <Link to="/vende-con-nosotros">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-900 px-8">Vende tu Propiedad</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CSS for unified responsive hero height */}
      <style>{`
        .hero-section {
          height: 100vh;
          height: 100dvh;
          min-height: 500px;
        }
        @media (max-width: 767px) {
          .hero-section {
            min-height: 600px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
