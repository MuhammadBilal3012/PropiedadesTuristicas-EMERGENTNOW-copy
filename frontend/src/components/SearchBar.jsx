import { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Bed, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { getLocations } from '../lib/api';

const SearchBar = ({ onSearch, variant = 'hero' }) => {
  const [filters, setFilters] = useState({
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    property_type: '',
  });
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchLocations = async () => {
      try {
        const data = await getLocations(true);
        if (isMounted) {
          setLocations(data);
        }
      } catch (error) {
        console.error('Error loading locations:', error);
      }
    };
    
    fetchLocations();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const cleanFilters = {};
    if (filters.location && filters.location !== 'all') cleanFilters.location = filters.location;
    if (filters.minPrice) cleanFilters.min_price = parseFloat(filters.minPrice);
    if (filters.maxPrice) cleanFilters.max_price = parseFloat(filters.maxPrice);
    if (filters.bedrooms && filters.bedrooms !== 'any') cleanFilters.bedrooms = parseInt(filters.bedrooms);
    if (filters.property_type && filters.property_type !== 'all') cleanFilters.property_type = filters.property_type;
    
    onSearch(cleanFilters);
  };

  const propertyTypes = [
    { value: 'Casa', label: 'Casa' },
    { value: 'Apartamento', label: 'Apartamento' },
    { value: 'Villa', label: 'Villa' },
    { value: 'Terreno', label: 'Terreno' },
  ];

  const isHero = variant === 'hero';

  return (
    <div
      data-testid="search-bar"
      className={`${
        isHero
          ? 'bg-white/95 backdrop-blur-md p-4 md:p-8 shadow-2xl'
          : 'bg-white p-3 md:p-6 shadow-md border border-stone-100'
      }`}
    >
      <div className={`grid gap-3 md:gap-4 ${isHero ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-6'}`}>
        {/* Location */}
        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] md:text-xs uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1">
            <MapPin className="h-3 w-3 md:h-3.5 md:w-3.5" />
            Ubicación
          </label>
          <Select
            value={filters.location}
            onValueChange={(value) => handleChange('location', value)}
          >
            <SelectTrigger data-testid="location-filter" className="bg-stone-50 border-stone-200 focus:border-slate-900 h-9 md:h-10 text-sm">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las ubicaciones</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.name}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] md:text-xs uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1">
            <DollarSign className="h-3 w-3 md:h-3.5 md:w-3.5" />
            Precio Mín.
          </label>
          <Input
            data-testid="min-price-filter"
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="bg-stone-50 border-stone-200 focus:border-slate-900 h-9 md:h-10 text-sm"
          />
        </div>

        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] md:text-xs uppercase tracking-wider text-stone-500 font-semibold">
            Precio Máx.
          </label>
          <Input
            data-testid="max-price-filter"
            type="number"
            placeholder="Sin límite"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="bg-stone-50 border-stone-200 focus:border-slate-900 h-9 md:h-10 text-sm"
          />
        </div>

        {/* Bedrooms */}
        <div className="space-y-1.5 md:space-y-2">
          <label className="text-[10px] md:text-xs uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1">
            <Bed className="h-3 w-3 md:h-3.5 md:w-3.5" />
            Habitaciones
          </label>
          <Select
            value={filters.bedrooms}
            onValueChange={(value) => handleChange('bedrooms', value)}
          >
            <SelectTrigger data-testid="bedrooms-filter" className="bg-stone-50 border-stone-200 focus:border-slate-900 h-9 md:h-10 text-sm">
              <SelectValue placeholder="Cualquiera" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Cualquiera</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Type */}
        <div className="space-y-1.5 md:space-y-2 col-span-2 md:col-span-1">
          <label className="text-[10px] md:text-xs uppercase tracking-wider text-stone-500 font-semibold flex items-center gap-1">
            <Home className="h-3 w-3 md:h-3.5 md:w-3.5" />
            Tipo
          </label>
          <Select
            value={filters.property_type}
            onValueChange={(value) => handleChange('property_type', value)}
          >
            <SelectTrigger data-testid="type-filter" className="bg-stone-50 border-stone-200 focus:border-slate-900 h-9 md:h-10 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search Button - only show in non-hero variant */}
        {!isHero && (
          <div className="space-y-1.5 md:space-y-2">
            <label className="text-[10px] md:text-xs uppercase tracking-wider text-transparent font-semibold">
              Buscar
            </label>
            <Button
              data-testid="search-btn"
              onClick={handleSearch}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-9 md:h-10 text-sm"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        )}
      </div>

      {/* Search Button for hero variant */}
      {isHero && (
        <div className="mt-4 md:mt-6">
          <Button
            data-testid="search-btn"
            onClick={handleSearch}
            className="w-full md:w-auto px-8 md:px-12 py-2.5 md:py-3 text-white font-semibold text-base md:text-lg transition-all hover:shadow-lg"
            style={{ backgroundColor: '#C5A059' }}
          >
            <Search className="h-4 w-4 md:h-5 md:w-5 mr-2" />
            Buscar
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
