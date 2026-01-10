import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Input } from './ui/input';
import { MapPin, Search, ChevronRight, Navigation } from 'lucide-react';
import { toast } from 'sonner';

const germanCities = [
  { name: 'Berlin', state: 'Berlin', population: '3.7M' },
  { name: 'Hamburg', state: 'Hamburg', population: '1.9M' },
  { name: 'München', state: 'Bayern', population: '1.5M' },
  { name: 'Köln', state: 'Nordrhein-Westfalen', population: '1.1M' },
  { name: 'Frankfurt', state: 'Hessen', population: '760K' },
  { name: 'Stuttgart', state: 'Baden-Württemberg', population: '630K' },
  { name: 'Düsseldorf', state: 'Nordrhein-Westfalen', population: '620K' },
  { name: 'Dortmund', state: 'Nordrhein-Westfalen', population: '590K' },
  { name: 'Essen', state: 'Nordrhein-Westfalen', population: '580K' },
  { name: 'Leipzig', state: 'Sachsen', population: '600K' },
  { name: 'Bremen', state: 'Bremen', population: '570K' },
  { name: 'Dresden', state: 'Sachsen', population: '560K' },
  { name: 'Hannover', state: 'Niedersachsen', population: '540K' },
  { name: 'Nürnberg', state: 'Bayern', population: '520K' },
  { name: 'Duisburg', state: 'Nordrhein-Westfalen', population: '500K' },
];

export function LocationSelectionScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCities = germanCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCity = (cityName: string) => {
    localStorage.setItem('selectedCity', cityName);
    
    // Navigate to welcome screen after a brief delay
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      toast.promise(
        new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              // In a real app, you would reverse geocode the coordinates
              // For now, just select Berlin as default
              localStorage.setItem('selectedCity', 'Berlin');
              localStorage.setItem('userLocation', JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }));
              resolve('Berlin');
            },
            (error) => {
              reject(error);
            }
          );
        }),
        {
          loading: 'Standort wird ermittelt...',
          success: () => {
            setTimeout(() => navigate('/'), 500);
            return 'Standort erfolgreich ermittelt';
          },
          error: 'Standort konnte nicht ermittelt werden',
        }
      );
    } else {
      toast.error('Geolocation wird von Ihrem Browser nicht unterstützt');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-[#8B4513]" />
            </div>
          </div>
          <h1 className="text-white text-center mb-2">
            Wo möchten Sie einen Friseur finden?
          </h1>
          <p className="text-white/80 text-center">
            Wählen Sie Ihre Stadt, um lokale Friseure zu entdecken
          </p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-6">
        {/* Current Location Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-6"
        >
          <button
            onClick={handleUseCurrentLocation}
            className="w-full p-4 border-2 border-[#FF6B6B] rounded-xl flex items-center gap-3 hover:bg-[#FF6B6B]/5 transition-colors"
          >
            <div className="w-12 h-12 bg-[#FF6B6B]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Navigation className="w-6 h-6 text-[#FF6B6B]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-gray-900">Aktuellen Standort verwenden</p>
              <p className="text-gray-500 text-sm">Schnell und genau</p>
            </div>
          </button>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-sm">oder</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Stadt suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 border-gray-200 rounded-xl"
            />
          </div>
        </motion.div>

        {/* Cities List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="space-y-2"
        >
          <p className="text-gray-500 text-sm mb-3">Beliebte Städte</p>
          <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredCities.map((city, index) => (
              <motion.button
                key={city.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                onClick={() => handleSelectCity(city.name)}
                className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[#8B4513]" />
                  </div>
                  <div className="text-left">
                    <p className="text-gray-900">{city.name}</p>
                    <p className="text-gray-500 text-sm">{city.state} • {city.population}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#8B4513] transition-colors" />
              </motion.button>
            ))}
          </div>

          {filteredCities.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Keine Städte gefunden</p>
              <p className="text-gray-400 text-sm mt-1">
                Versuchen Sie eine andere Suche
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
