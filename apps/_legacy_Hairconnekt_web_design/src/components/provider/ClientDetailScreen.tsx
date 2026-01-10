import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  
  Clock,
  Heart,
  Tag,
  Edit2,
  
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { toast } from "sonner";
import { api } from "../../services/http";
import { getProviderAppointments } from "../../services/appointments";

// Using plain JavaScript objects for client and appointment items

// Live data will be fetched from backend; remove mock client

export function ClientDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clientItem, setClientItem] = useState(null);
  const [completed, setCompleted] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [notes, setNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api
      .get("/providers/clients")
      .then((res) => {
        const item = (res?.items || []).find((c) => c.id === id) || null;
        setClientItem(item);
      })
      .catch((err) => {
        const msg = err?.message || "Fehler beim Laden des Kunden";
        setError(msg);
      })
      .finally(() => setLoading(false));

    getProviderAppointments("completed")
      .then((res) => setCompleted((res?.items || []).filter((a) => a.client?.id === id)))
      .catch(() => undefined);
    getProviderAppointments("upcoming")
      .then((res) => setUpcoming((res?.items || []).filter((a) => a.client?.id === id)))
      .catch(() => undefined);
  }, [id]);

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    toast.success("Notizen gespeichert");
  };

  const handleCall = () => {
    if (clientItem?.phone) {
      window.location.href = `tel:${clientItem.phone}`;
    }
  };

  // Email not available for client; no handler needed

  const handleMessage = () => {
    if (clientItem?.id) navigate(`/provider/messages/${clientItem.id}`);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/provider/clients")}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h3 className="flex-1">Kundendetails</h3>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-full ${
              isFavorite ? "text-red-500" : "text-gray-400"
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {loading && (
          <Card className="p-4">
            <div className="text-sm text-gray-600">Lade Kundendaten...</div>
          </Card>
        )}
        {error && (
          <Card className="p-4">
            <div className="text-sm text-red-600">{error}</div>
          </Card>
        )}
        {/* Client Header */}
        {clientItem && (
          <Card className="p-6">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar className="w-24 h-24 mb-3">
                <ImageWithFallback
                  src={clientItem.image || ""}
                  alt={clientItem.name}
                  className="w-full h-full object-cover"
                />
              </Avatar>
              <h2 className="mb-1">{clientItem.name}</h2>
              <p className="text-gray-600 mb-3">
                {(() => {
                  const all = [...completed, ...upcoming];
                  const dates = all.map((a) => a.appointmentDate).sort();
                  if (dates.length === 0) return "";
                  const d = new Date(dates[0] + "T00:00:00");
                  return `Kunde seit ${d.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}`;
                })()}
              </p>
              <div className="flex gap-2 flex-wrap justify-center">
                {clientItem.isVIP && (
                  <Badge className="bg-amber-400 text-white">VIP</Badge>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              {clientItem.phone && (
                <a
                  href={`tel:${clientItem.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#8B4513]" />
                  <span>{clientItem.phone}</span>
                </a>
              )}
              <div className="flex items-center gap-3 p-3 rounded-lg text-gray-400">
                <Mail className="w-5 h-5 text-[#8B4513]" />
                <span className="text-sm">Nicht verfügbar</span>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        {clientItem && (
          <div className="grid grid-cols-4 gap-3">
            <Card className="p-3 text-center">
              <div className="text-2xl text-[#8B4513] mb-1">
                {clientItem.appointments}
              </div>
              <div className="text-xs text-gray-600">Termine</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl text-[#8B4513] mb-1">
                €{Math.round((clientItem.totalSpentCents || 0) / 100)}
              </div>
              <div className="text-xs text-gray-600">Umsatz</div>
            </Card>
            <Card className="p-3 text-center">
              <div className="text-2xl text-[#8B4513] mb-1">—</div>
              <div className="text-xs text-gray-600">Bewertung</div>
            </Card>
            <Card className="p-3 text-center">
              <Clock className="w-6 h-6 text-[#8B4513] mx-auto mb-1" />
              <div className="text-xs text-gray-600">
                {clientItem.lastVisitIso ? new Date(clientItem.lastVisitIso).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }) : "—"}
              </div>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {clientItem && (
            <Button
              onClick={() => navigate(`/provider/appointments/create?clientId=${clientItem.id}`)}
              className="bg-[#8B4513] hover:bg-[#5C2E0A]"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Termin
            </Button>
          )}
          <Button variant="outline" onClick={handleMessage}>
            <MessageCircle className="w-4 h-4 mr-2" />
            Nachricht
          </Button>
          <Button variant="outline" onClick={handleCall}>
            <Phone className="w-4 h-4 mr-2" />
            Anrufen
          </Button>
        </div>

        {/* Internal Notes */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-600" />
              <h4>Meine Notizen</h4>
              <Badge variant="secondary" className="text-xs">
                Privat
              </Badge>
            </div>
            {!isEditingNotes ? (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-[#8B4513]"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditingNotes(false);
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  className="bg-[#8B4513] hover:bg-[#5C2E0A]"
                >
                  Speichern
                </Button>
              </div>
            )}
          </div>

          {isEditingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border rounded-md resize-none"
              placeholder="Notizen zu diesem Kunden..."
            />
          ) : (
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {notes || (
                <p className="text-gray-400 italic">Noch keine Notizen</p>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2">
            Letzte Änderung: vor 3 Tagen
          </p>
        </Card>

        {/* Appointment History */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4>Terminhistorie ({completed.length + upcoming.length})</h4>
            <button
              onClick={() => clientItem?.id && navigate(`/provider/calendar?clientId=${clientItem.id}`)}
              className="text-sm text-[#8B4513]"
            >
              Alle anzeigen
            </button>
          </div>

          <div className="space-y-3">
            {[...completed, ...upcoming]
              .sort((a, b) => (a.appointmentDate > b.appointmentDate ? -1 : a.appointmentDate < b.appointmentDate ? 1 : 0))
              .slice(0, 3)
              .map((apt, idx, arr) => {
                const dateStr = new Date(apt.appointmentDate + "T00:00:00").toLocaleDateString("de-DE", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                });
                const serviceSummary = (apt.services || []).map((s) => s.name).join(" + ") || "—";
                const priceEuro = Math.round((apt.totalPriceCents || 0) / 100);
                const statusLabel = apt.status === "COMPLETED" ? "Abgeschlossen" : apt.status === "CONFIRMED" ? "Bestätigt" : apt.status === "CANCELLED" ? "Storniert" : "Ausstehend";
                return (
                  <div key={apt.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{dateStr}</p>
                        <p className="text-sm text-gray-600">{serviceSummary}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[#8B4513]">€{priceEuro}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {statusLabel}
                        </Badge>
                      </div>
                    </div>
                    {apt.id !== arr[arr.length - 1]?.id && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                );
              })}
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Gesamtumsatz:</span>
              <span className="text-xl font-semibold text-[#8B4513]">
                €{Math.round((clientItem?.totalSpentCents || 0) / 100)}
              </span>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-4">
          <h4 className="mb-3">Zusätzliche Informationen</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bevorzugte Zahlungsmethode</span>
              <span>Bar</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-600">Durchschnittliche Dauer</span>
              <span>4.5 Stunden</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-600">Lieblingsservice</span>
              <span>Box Braids</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-gray-600">Stornierungsrate</span>
              <span className="text-green-600">0% (sehr zuverlässig)</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
