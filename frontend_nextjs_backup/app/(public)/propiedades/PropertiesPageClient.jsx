'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PropertyCard from '@/components/PropertyCard';
import SearchBar from '@/components/SearchBar';
import { Button } from '@/components/ui/button';

export default function PropertiesPageClient({ locations }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    total_pages: 0,
  });

  const loadProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', searchParams.get('page') || '1');
      params.set('limit', '9');

      const location = searchParams.get('location');
      const minPrice = searchParams.get('min_price');
      const maxPrice = searchParams.get('max_price');
      const bedrooms = searchParams.get('bedrooms');
      const propertyType = searchParams.get('property_type');

      if (location && location !== 'all') params.set('location', location);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      if (bedrooms) params.set('bedrooms', bedrooms);
      if (propertyType && propertyType !== 'all') params.set('property_type', propertyType);

      const response = await fetch(`/api/properties?${params.toString()}`);
      const data = await response.json();
      
      setProperties(data.properties || []);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        total_pages: data.total_pages,
      });
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const handleSearch = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    params.set('page', '1');
    router.push(`/propiedades?${params.toString()}`);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/propiedades?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div data-testid="properties-page" className="min-h-screen bg-stone-50">
      {/* Header */}
      <section className="bg-slate-900 pt-32 pb-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: '#C5A059' }}>
            Catálogo Completo
          </p>
          <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Nuestras Propiedades
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Explora nuestra selección de propiedades exclusivas en los mejores destinos de República Dominicana
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 relative z-10">
        <SearchBar onSearch={handleSearch} variant="catalog" locations={locations} />
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Results count */}
        <div className="flex justify-between items-center mb-8">
          <p className="text-stone-600">
            {loading ? (
              'Buscando propiedades...'
            ) : (
              <>
                Mostrando <span className="font-semibold text-slate-900">{properties.length}</span> de{' '}
                <span className="font-semibold text-slate-900">{pagination.total}</span> propiedades
              </>
            )}
          </p>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: '#C5A059' }} />
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12" data-testid="pagination">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="border-stone-300"
                >
                  Anterior
                </Button>

                {[...Array(pagination.total_pages)].map((_, i) => (
                  <Button
                    key={i + 1}
                    variant={pagination.page === i + 1 ? 'default' : 'outline'}
                    onClick={() => handlePageChange(i + 1)}
                    className={
                      pagination.page === i + 1
                        ? 'bg-slate-900 text-white'
                        : 'border-stone-300'
                    }
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.total_pages}
                  className="border-stone-300"
                >
                  Siguiente
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <div className="w-24 h-24 mx-auto mb-6 bg-stone-100 rounded-full flex items-center justify-center">
              <svg className="h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-semibold text-slate-900 mb-2">
              No se encontraron propiedades
            </h3>
            <p className="text-stone-500 mb-6">
              Intenta ajustar los filtros de búsqueda para encontrar más resultados
            </p>
            <Button
              onClick={() => router.push('/propiedades')}
              style={{ backgroundColor: '#C5A059' }}
              className="text-white"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
