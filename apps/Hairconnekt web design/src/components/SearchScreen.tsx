import { useEffect, useState, useRef } from "react";
import { Search, X, Clock, MapPin, Star, Heart, Grid, List, Map, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "@/services/http";
import { addFavorite, removeFavorite, favoriteStatus } from "@/services/favorites";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const recentSearches = [
  "Box Braids",
  "Cornrows",
  "Salons in Dortmund",
];

const filterChips = [
  { id: "salon", label: "Salon" },
  { id: "individual", label: "Einzelperson" },
  { id: "mobile", label: "Mobil" },
  { id: "price-low", label: "€" },
  { id: "price-mid", label: "€€" },
  { id: "rating", label: "4★+" },
  { id: "today", label: "Heute" },
  { id: "nearby", label: "< 5km" },
];

// Removed TypeScript-only SearchResult type alias for plain JavaScript compatibility

export function SearchScreen() {
  const { tokens } = useAuth();
  const isAuthenticated = !!tokens?.accessToken;
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [viewMode, setViewMode] = useState("list");
  const [favorites, setFavorites] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const toggleFilter = (filterId) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleToggleFavorite = async (rawId, e) => {
    e.stopPropagation();
    const id = String(rawId);
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const isFav = favorites.includes(id);
    // Optimistic UI
    setFavorites((prev) => (isFav ? prev.filter((f) => f !== id) : [...prev, id]));
    try {
      if (isFav) await removeFavorite(id);
      else await addFavorite(id);
    } catch (err) {
      // Revert on failure
      setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)));
      const msg = err instanceof Error ? err.message : "Aktion fehlgeschlagen";
      toast.error(msg);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  useEffect(() => {
    async function fetchResults() {
      if (!searchTerm.trim()) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await api.get("/search", { q: searchTerm });
        const normalized = Array.isArray(data?.results) ? data.results : [];
        setResults(normalized);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Suche derzeit nicht verfügbar";
        setError(message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
    const timeout = setTimeout(fetchResults, 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Initialize favorite status for current results when user is authenticated
  useEffect(() => {
    let cancelled = false;
    async function initFav() {
      if (!isAuthenticated) return;
      const ids = (results || []).map((r) => String(r.id)).filter(Boolean);
      if (!ids.length) return;
      try {
        const res = await favoriteStatus(ids);
        if (!cancelled) setFavorites(res.favorites || []);
      } catch {
        // ignore silently
      }
    }
    initFav();
    return () => { cancelled = true; };
  }, [isAuthenticated, results]);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header with Search */}
      <div className="bg-white px-4 pt-4 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            ref={inputRef}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Suche nach Styles, Braiders, Salons..."
            className="pl-10 pr-10 h-12 rounded-xl"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Recent Searches */}
        {!searchTerm && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-500">Letzte Suchen</p>
              <button className="text-sm text-[#8B4513]">Alle löschen</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <Badge
                  key={index}
                  asChild
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200 flex items-center gap-1"
                >
                  <button type="button" onClick={() => setSearchTerm(search)}>
                    <Clock className="w-3 h-3" />
                    {search}
                    <X className="w-3 h-3 ml-1" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 rounded-full"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Erweiterte Filter
          </Button>
          {filterChips.map((chip) => (
            <Badge
              key={chip.id}
              asChild
              variant={activeFilters.includes(chip.id) ? "default" : "outline"}
              className={`flex-shrink-0 cursor-pointer ${
                activeFilters.includes(chip.id)
                  ? "bg-[#8B4513] text-white"
                  : ""
              }`}
            >
              <button type="button" onClick={() => toggleFilter(chip.id)}>
                {chip.label}
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Results Header */}
      {searchTerm && (
        <div className="bg-white px-4 py-3 border-t border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm">
              <span>{loading ? "Suchen..." : `${results.length} Ergebnisse`}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "text-[#8B4513]" : "text-gray-400"}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "text-[#8B4513]" : "text-gray-400"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 ${viewMode === "map" ? "text-[#8B4513]" : "text-gray-400"}`}
              >
                <Map className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sort Dropdown */}
          <select className="w-full p-2 border border-gray-200 rounded-lg text-sm">
            <option>Empfohlen</option>
            <option>Bewertung</option>
            <option>Preis (niedrig-hoch)</option>
            <option>Preis (hoch-niedrig)</option>
            <option>Entfernung</option>
            <option>Neueste</option>
          </select>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.map((filterId) => {
                const chip = filterChips.find(c => c.id === filterId);
                return (
                  <Badge
                    key={filterId}
                    className="bg-[#8B4513] text-white flex items-center gap-1"
                  >
                    {chip?.label}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => toggleFilter(filterId)}
                    />
                  </Badge>
                );
              })}
              <button
                className="text-xs text-[#8B4513]"
                onClick={() => setActiveFilters([])}
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results List */}
      <div className="px-4 py-4">
        {searchTerm ? (
          loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-200 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((braider) => (
                <Card
                  key={braider.id}
                  className="p-4 cursor-pointer hover:shadow-lg transition-shadow relative"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/provider/${braider.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      navigate(`/provider/${braider.id}`);
                    }
                  }}
                >
                  <button
                    onClick={(e) => handleToggleFavorite(braider.id, e)}
                    className="absolute top-4 right-4 z-10"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                      favorites.includes(String(braider.id))
                        ? "fill-pink-500 text-pink-500"
                        : "text-gray-400"
                      }`}
                    />
                  </button>

                  <div className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-16 h-16">
                        <ImageWithFallback
                          src={braider.image || ""}
                          alt={braider.name}
                          className="w-full h-full object-cover"
                        />
                      </Avatar>
                      {braider.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h5 className="truncate">{braider.name}</h5>
                      {braider.business && (
                        <p className="text-sm text-gray-500 truncate">{braider.business}</p>
                      )}
                      {!!braider.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span>{braider.rating}</span>
                          {!!braider.reviews && (
                            <span className="text-gray-400">({braider.reviews})</span>
                          )}
                        </div>
                      )}
                      {!!braider.distance && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {braider.distance} entfernt
                        </p>
                      )}
                      {Array.isArray(braider.specialties) && braider.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {braider.specialties.slice(0, 3).map((specialty, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {braider.price && <span className="text-[#8B4513]">{braider.price}</span>}
                        {braider.available && (
                          <Badge className="bg-green-500 text-white text-xs">
                            Verfügbar heute
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="mb-2">Keine Ergebnisse</h4>
              <p className="text-gray-500">
                Suche ist bald verfügbar, während wir unser Provider-Verzeichnis aufbauen.
              </p>
              {error && (
                <p className="text-xs text-red-500 mt-2">{error}</p>
              )}
            </div>
          )
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="mb-2">Finde deinen perfekten Braider</h4>
            <p className="text-gray-500">
              Suche nach Styles, Braiders oder Salons
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
