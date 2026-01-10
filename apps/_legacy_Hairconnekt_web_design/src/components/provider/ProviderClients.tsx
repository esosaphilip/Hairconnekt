import { useEffect, useMemo, useState } from "react";
import { Search, Star, Calendar, Euro, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { api } from "../../services/http";

function formatRelativeGerman(iso) {
  if (!iso) return "";
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours <= 0) return "gerade eben";
      return `vor ${diffHours} ${diffHours === 1 ? "Stunde" : "Stunden"}`;
    }
    if (diffDays < 7) return `vor ${diffDays} ${diffDays === 1 ? "Tag" : "Tagen"}`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5) return `vor ${diffWeeks} ${diffWeeks === 1 ? "Woche" : "Wochen"}`;
    const diffMonths = Math.floor(diffDays / 30);
    return `vor ${diffMonths} ${diffMonths === 1 ? "Monat" : "Monaten"}`;
  } catch {
    return "";
  }
}

export function ProviderClients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/providers/clients');
        if (!mounted) return;
        setData(res);
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : 'Fehler beim Laden der Kunden';
        setError(message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredClients = useMemo(() => {
    const items = data?.items || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => c.name.toLowerCase().includes(q));
  }, [data, searchQuery]);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3>Meine Kunden</h3>
          <button onClick={() => navigate("/provider/add-client")}>
            <UserPlus className="w-5 h-5 text-[#8B4513]" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Kunde suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 text-center">
            <div className="text-2xl text-[#8B4513] mb-1">{data?.totalClients ?? (loading ? '…' : 0)}</div>
            <p className="text-xs text-gray-600">Kunden</p>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl text-[#8B4513] mb-1">{data?.regularCustomers ?? (loading ? '…' : 0)}</div>
            <p className="text-xs text-gray-600">Stammkunden</p>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl text-green-600 mb-1">{typeof data?.newThisWeek === 'number' ? `+${data?.newThisWeek}` : (loading ? '…' : '+0')}</div>
            <p className="text-xs text-gray-600">Diese Woche</p>
          </Card>
        </div>

        {/* Sort/Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <Button size="sm" variant="outline" className="whitespace-nowrap">
            Neueste
          </Button>
          <Button size="sm" variant="outline" className="whitespace-nowrap">
            A-Z
          </Button>
          <Button size="sm" variant="outline" className="whitespace-nowrap">
            Häufigste
          </Button>
          <Button size="sm" variant="outline" className="whitespace-nowrap">
            Stammkunden
          </Button>
        </div>

        {/* Clients List */}
        {error && (
          <div className="text-center text-red-600 mb-3">{error}</div>
        )}
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <Card
              key={client.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              role="button"
              tabIndex={0}
              aria-label={`Kunde ${client.name} öffnen`}
              onClick={() => navigate(`/provider/clients/${client.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/provider/clients/${client.id}`);
                }
              }}
            >
              <div className="flex gap-3">
                <Avatar className="w-14 h-14 flex-shrink-0">
                  <ImageWithFallback
                    src={client.image}
                    alt={client.name}
                    className="w-full h-full object-cover"
                  />
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="truncate">{client.name}</h5>
                    {client.isVIP && (
                      <Badge className="bg-amber-400 text-white text-xs">VIP</Badge>
                    )}
                  </div>
                  
                  <a
                    href={client.phone ? `tel:${client.phone}` : undefined}
                    className="text-sm text-gray-600 hover:text-[#8B4513] block mb-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {client.phone || ""}
                  </a>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{client.appointments} Termine</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="w-3 h-3" />
                      <span>
                        €{(((client.totalSpentCents ?? 0) / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Letzter Termin: {formatRelativeGerman(client.lastVisitIso)}
                  </p>
                </div>

                <button className="self-center">
                  <Star className={`w-5 h-5 ${client.isVIP ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredClients.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">👥</div>
            <h4 className="mb-2">Keine Kunden gefunden</h4>
            <p className="text-gray-600 mb-4">
              {searchQuery ? "Versuche andere Suchbegriffe" : "Kunden werden automatisch hinzugefügt"}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
              >
                Filter zurücksetzen
              </Button>
            )}
          </div>
        )}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-14 h-14 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 w-1/3" />
                    <div className="h-3 bg-gray-200 w-1/2" />
                    <div className="h-3 bg-gray-200 w-2/3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
