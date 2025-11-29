import { MapPin, Bell, ChevronRight, Clock, Star, Heart, Zap, Car, Gift, Sparkles, Filter, UserCircle, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "@/services/http";
import { addFavorite, removeFavorite, favoriteStatus } from "@/services/favorites";
import { toast } from "sonner";

const popularStyles = [
  {
    id: 1,
    name: "Box Braids",
    price: "ab €45",
    duration: "3-4 Std.",
    image: "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 2,
    name: "Cornrows",
    price: "ab €35",
    duration: "2-3 Std.",
    image: "https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 3,
    name: "Senegalese Twists",
    price: "ab €55",
    duration: "4-5 Std.",
    image: "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
];

const quickActions = [
  { icon: Zap, label: "Notfall-Termin", color: "bg-orange-500" },
  { icon: Car, label: "Mobile Service", color: "bg-blue-500" },
  { icon: Gift, label: "Gutscheine", color: "bg-purple-500" },
  { icon: Heart, label: "Favoriten", color: "bg-pink-500" },
  { icon: Sparkles, label: "Neue Braider", color: "bg-amber-500" },
];


export function HomeScreen() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();
  const { tokens, user } = useAuth();
  const isAuthenticated = !!tokens?.accessToken;
  const displayName = user?.firstName ? `${user.firstName}! 👋` : user?.email ? `${user.email}` : "Willkommen bei";
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.email ? user.email[0].toUpperCase() : "U");

  const [locationLabel, setLocationLabel] = useState("Standort wird ermittelt...");
  const [nearby, setNearby] = useState(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);

  const formatPrice = useMemo(() => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }), []);

  useEffect(() => {
    let cancelled = false;
    const setLoc = (txt) => setLocationLabel(txt);
    const fetchNearby = async (lat, lon) => {
      setNearbyLoading(true);
      setNearbyError(null);
      try {
        const res = await api.get(`/providers/nearby`, { lat, lon, radiusKm: 25, limit: 10 });
        if (!cancelled) setNearby(res.items || []);
      } catch (e) {
        if (!cancelled) {
          setNearbyError(e?.message || 'Konnte nahegelegene Anbieter nicht laden');
          setNearby([]);
        }
      } finally {
        if (!cancelled) setNearbyLoading(false);
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            // Reverse geocoding for friendly city label (best-effort)
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
            const resp = await fetch(url);
            const data = await resp.json().catch(() => null);
            const city = data?.address?.city || data?.address?.town || data?.address?.village || data?.address?.county;
            const state = data?.address?.state || data?.address?.region;
            const label = [city, state].filter(Boolean).join(', ');
            setLoc(label || 'Mein Standort');
          } catch {
            setLoc('Mein Standort');
          }
          fetchNearby(latitude, longitude);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setLoc('Standort deaktiviert');
          setNearby([]);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setLoc('Standort nicht verfügbar');
      setNearby([]);
    }
    return () => { cancelled = true; };
  }, []);

  // Initialize favorite status for nearby providers when loaded
  useEffect(() => {
    let cancelled = false;
    async function initFavStatus() {
      if (!isAuthenticated) return;
      const ids = (nearby || []).map((n) => n.id).filter(Boolean);
      if (!ids.length) return;
      try {
        const res = await favoriteStatus(ids);
        if (!cancelled) setFavorites(res.favorites || []);
      } catch {
        // best-effort: ignore
      }
    }
    initFavStatus();
    return () => { cancelled = true; };
  }, [isAuthenticated, nearby]);

  const handleToggleFavorite = async (id, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const isFav = favorites.includes(id);
    // Optimistic update
    setFavorites((prev) => (isFav ? prev.filter((f) => f !== id) : [...prev, id]));
    try {
      if (isFav) {
        await removeFavorite(id);
      } else {
        await addFavorite(id);
      }
    } catch (err) {
      // Revert on failure
      setFavorites((prev) => (isFav ? [...prev, id] : prev.filter((f) => f !== id)));
      const msg = err?.message || "Aktion fehlgeschlagen";
      toast.error(msg);
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-4 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <div className="w-full h-full bg-[#8B4513] flex items-center justify-center">
                  <span className="text-white">{initials}</span>
                </div>
              </Avatar>
              <div>
                <p className="text-sm text-gray-500">Hallo,</p>
                <h4>{displayName}</h4>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm text-gray-500">Willkommen bei</p>
                <h4>HairConnekt 👋</h4>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/login")}
                className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
              >
                <UserCircle className="w-4 h-4 mr-1" />
                Anmelden
              </Button>
            )}
            {isAuthenticated && (
              <button className="relative p-2">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B6B] rounded-full"></span>
              </button>
            )}
          </div>
        </div>

        <button className="flex items-center gap-1 text-gray-700 mb-4">
          <MapPin className="w-4 h-4" />
          <span>{locationLabel}</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Search Bar */}
        <div
          className="relative"
          role="button"
          tabIndex={0}
          aria-label="Suche öffnen"
          onClick={() => navigate("/search")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              navigate("/search");
            }
          }}
        >
          <Input
            placeholder="Suche nach Styles, Braiders, Salons..."
            className="pl-10 pr-12 h-12 rounded-xl shadow-sm cursor-pointer"
            readOnly
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Filter className="w-5 h-5 text-gray-400" />
          </div>
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
            <Filter className="w-5 h-5 text-[#8B4513]" />
          </button>
        </div>
      </div>

      {/* Verification Banner */}
      {isAuthenticated && (user?.emailVerified === false || user?.phoneVerified === false) && (
        <div className="px-4 mt-2">
          <Card className="p-3 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-900">
                  Bitte verifiziere {user?.emailVerified === false ? "deine E-Mail" : "deine Telefonnummer"}, um alle Funktionen zu nutzen.
                </p>
                <div className="mt-2">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700" onClick={() => navigate("/verify")}>
                    Jetzt verifizieren
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-4 py-4 bg-white mt-2">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {quickActions.map((action, index) => (
            <div
              key={index}
              role="button"
              tabIndex={0}
              aria-label={action.label}
              className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => {
                if (action.label === "Notfall-Termin") {
                  navigate("/search", { state: { urgent: true } });
                } else if (action.label === "Mobile Service") {
                  navigate("/search", { state: { mobileService: true } });
                } else if (action.label === "Gutscheine") {
                  navigate("/vouchers");
                } else if (action.label === "Favoriten") {
                  navigate("/favorites");
                } else if (action.label === "Neue Braider") {
                  navigate("/search", { state: { newProviders: true } });
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (action.label === "Notfall-Termin") {
                    navigate("/search", { state: { urgent: true } });
                  } else if (action.label === "Mobile Service") {
                    navigate("/search", { state: { mobileService: true } });
                  } else if (action.label === "Gutscheine") {
                    navigate("/vouchers");
                  } else if (action.label === "Favoriten") {
                    navigate("/favorites");
                  } else if (action.label === "Neue Braider") {
                    navigate("/search", { state: { newProviders: true } });
                  }
                }
              }}
            >
              <div className={`w-14 h-14 rounded-full ${action.color} flex items-center justify-center`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs text-gray-700 text-center w-20">{action.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Styles */}
      <div className="px-4 py-6 bg-white mt-2">
        <div className="flex justify-between items-center mb-4">
          <h3>Beliebte Styles</h3>
          <button
            className="text-[#8B4513] flex items-center gap-1"
            onClick={() => navigate("/all-styles")}
          >
            Alle ansehen
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {popularStyles.map((style) => (
            <Link key={style.id} to="/search" className="block" aria-label={`Beliebter Style: ${style.name}`}>
              <Card className="flex-shrink-0 w-40 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <ImageWithFallback
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h5 className="mb-1">{style.name}</h5>
                    <div className="flex items-center justify-between text-xs">
                      <span>{style.price}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {style.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Nearby Braiders */}
      <div className="px-4 py-6">
        <h3 className="mb-4">Braiders in deiner Nähe</h3>
        {nearbyLoading && (
          <div className="text-sm text-gray-500 mb-2">Lade nahegelegene Anbieter...</div>
        )}
        {nearbyError && (
          <div className="text-sm text-red-600 mb-2">{nearbyError}</div>
        )}
        <div className="space-y-3">
          {(nearby || []).map((braider) => (
            <Card
              key={braider.id}
              className="p-4 cursor-pointer hover:shadow-lg transition-shadow relative"
              role="button"
              tabIndex={0}
              aria-label={`Anbieterprofil öffnen: ${braider.name}`}
              onClick={() => navigate(`/provider/${braider.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
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
                    favorites.includes(braider.id)
                      ? "fill-pink-500 text-pink-500"
                      : "text-gray-400"
                  }`}
                />
              </button>

              <div className="flex gap-3">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-16 h-16">
                    <ImageWithFallback
                      src={braider.imageUrl || "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"}
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
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{Math.round((braider.rating || 0) * 10) / 10}</span>
                    <span className="text-gray-400">({braider.reviews || 0})</span>
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {braider.distanceKm?.toFixed(1)} km entfernt
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(braider.specialties || []).slice(0, 3).map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[#8B4513]">
                      {braider.priceFromCents != null ? `ab ${formatPrice.format((braider.priceFromCents || 0) / 100)}` : 'Preis auf Anfrage'}
                    </span>
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
          {!nearbyLoading && (nearby?.length || 0) === 0 && (
            <div className="text-sm text-gray-500">Keine Braider in deiner Nähe gefunden.</div>
          )}
        </div>
      </div>
    </div>
  );
}
