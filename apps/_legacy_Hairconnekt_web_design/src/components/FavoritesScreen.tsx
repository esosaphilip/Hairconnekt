import { ArrowLeft, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { listFavorites, removeFavorite, FavoriteItem } from "@/services/favorites";
import { toast } from "sonner";

export function FavoritesScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listFavorites()
      .then((res) => {
        if (!cancelled) setItems(res.results || []);
      })
      .catch((err: unknown) => {
        const msg = err && typeof err === "object" && "message" in err
          ? String((err as { message?: string }).message)
          : "Fehler beim Laden der Favoriten";
        if (!cancelled) setError(msg);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRemoveFavorite = async (
    providerId: string,
    name: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    // Optimistic update
    const prev = items;
    setItems((cur) => cur.filter((it) => it.providerId !== providerId));
    try {
      await removeFavorite(providerId);
      toast.success(`${name} entfernt`);
    } catch (err: unknown) {
      setItems(prev);
      const msg = err && typeof err === "object" && "message" in err
        ? String((err as { message?: string }).message)
        : "Entfernen fehlgeschlagen";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h3>Favoriten</h3>
        </div>
      </div>

      {loading && (
        <div className="p-4">
          <Card className="p-4">
            <div className="text-sm text-gray-600">Lade Favoriten...</div>
          </Card>
        </div>
      )}

      {!loading && error && (
        <div className="p-4">
          <Card className="p-4 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        </div>
      )}

      {!loading && items.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="mb-2">Noch keine Favoriten</h3>
          <p className="text-gray-600 text-center mb-6">
            Speichere deine Lieblings-Braider für schnellen Zugriff
          </p>
          <Button
            onClick={() => navigate("/search")}
            className="bg-[#8B4513] hover:bg-[#5C2E0A]"
          >
            Braider entdecken
          </Button>
        </div>
      ) : (
        /* Favorites List */
        <div className="p-4 space-y-3">
          <p className="text-sm text-gray-600 mb-2">
            {items.length} {items.length === 1 ? "Favorit" : "Favoriten"}
          </p>

          {items.map((provider) => (
            <Link key={provider.id} to={`/provider/${provider.providerId}`} className="block">
            <Card
              className="overflow-hidden hover:shadow-md transition-all"
            >
              <div className="flex gap-3 p-3">
                {/* Image */}
                <div className="relative w-24 h-24 flex-shrink-0">
                  <img
                    src={provider.image || "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200"}
                    alt={provider.name || "Provider"}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={(e) => handleRemoveFavorite(provider.providerId, provider.name, e)}
                    className="absolute top-1 right-1 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm truncate">{provider.name}</h4>
                  </div>
                  {/* Secondary info when available */}
                  {provider.business && (
                    <p className="text-xs text-gray-600 mb-2">{provider.business}</p>
                  )}
                </div>
              </div>
            </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {!loading && items.length > 0 && (
        <div className="p-4 bg-white border-t mt-4">
          <div className="flex items-center justify-between mb-3">
            <h5>Weitere Empfehlungen</h5>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/search")}
              className="text-[#8B4513]"
            >
              Alle ansehen
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Entdecke ähnliche Braider in deiner Nähe
          </p>
        </div>
      )}
    </div>
  );
}
