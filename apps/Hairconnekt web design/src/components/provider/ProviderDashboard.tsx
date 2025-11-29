import {
  Calendar,
  Clock,
  Euro,
  Star,
  TrendingUp,
  Bell,
  Settings,
  CalendarX,
  CalendarPlus,
  Edit,
  MessageCircle,
  MoreVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { api } from "@/services/http";

// Helper to format cents to Euro string
function formatEuro(cents) {
  const euros = (cents || 0) / 100;
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(euros);
}

function statusToBadge(status) {
  switch ((status || '').toUpperCase()) {
    case 'CONFIRMED':
      return { label: 'Bestätigt', className: 'bg-green-500 text-white' };
    case 'PENDING':
      return { label: 'Ausstehend', className: 'bg-yellow-500 text-white' };
    case 'COMPLETED':
      return { label: 'Abgeschlossen', className: 'bg-gray-600 text-white' };
    case 'CANCELLED':
      return { label: 'Storniert', className: 'bg-red-500 text-white' };
    default:
      return { label: 'Status', className: 'bg-gray-300 text-gray-800' };
  }
}

export function ProviderDashboard() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [p, d] = await Promise.all([
          api.get('/providers/me'),
          api.get('/providers/dashboard'),
        ]);
        if (!mounted) return;
        setProfile(p);
        setDashboard(d);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3>
              Willkommen zurück{profile?.user?.firstName ? `, ${profile.user.firstName}!` : '!'} 👋
            </h3>
            <p className="text-sm text-gray-600">Montag, 28. Oktober 2025</p>
          </div>
          <div className="flex gap-2">
            <button className="relative p-2">
              <Bell className="w-6 h-6 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF6B6B] rounded-full"></span>
            </button>
            <button onClick={() => navigate("/provider/more/settings")}>
              <Settings className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Availability Toggle */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h5 className={isAvailable ? "text-green-600" : "text-gray-600"}>
                {isAvailable ? "Verfügbar" : "Nicht verfügbar"}
              </h5>
              <p className="text-sm text-gray-600">
                {isAvailable
                  ? "Kunden können dich jetzt buchen"
                  : "Du erscheinst nicht in den Suchergebnissen"}
              </p>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-[#8B4513]" />
              <span className="text-sm text-gray-600">Termine heute</span>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl text-[#8B4513] mb-1">{dashboard?.stats?.todayCount ?? 0}</div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span>+2 vs. gestern</span>
                </div>
              </div>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/provider/calendar")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/provider/calendar");
              }
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Nächster Termin</span>
            </div>
            <div>
              {dashboard?.stats?.nextAppointment ? (
                <>
                  <div className="text-2xl mb-1">{dashboard.stats.nextAppointment.time}</div>
                  <p className="text-xs text-gray-600">mit {dashboard.stats.nextAppointment.client}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    In {Math.max(0, Math.floor(dashboard.stats.nextAppointment.hoursUntil))} Std. {Math.max(0, Math.round((dashboard.stats.nextAppointment.hoursUntil % 1) * 60))} Min.
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-600">Keine Termine heute</p>
              )}
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/provider/earnings")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/provider/earnings");
              }
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">Diese Woche</span>
            </div>
            <div>
              <div className="text-2xl text-green-600 mb-1">{formatEuro(dashboard?.stats?.weekEarningsCents || 0)}</div>
              <p className="text-xs text-gray-500">(netto)</p>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+18%</span>
              </div>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/provider/reviews")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                navigate("/provider/reviews");
              }
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-gray-600">Bewertung</span>
            </div>
            <div>
              <div className="text-2xl mb-1">{(dashboard?.stats?.ratingAverage ?? 0).toFixed(1)} ★</div>
              <p className="text-xs text-gray-600">{dashboard?.stats?.reviewCount ?? 0} Bewertungen</p>
              <p className="text-xs text-gray-500 mt-1">→ Stabil</p>
            </div>
          </Card>
        </div>

        {/* Today's Schedule */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h4>Heutiger Zeitplan</h4>
            <button
              onClick={() => navigate("/provider/calendar")}
              className="text-sm text-[#8B4513] hover:underline"
            >
              Alle anzeigen
            </button>
          </div>

          <div className="space-y-3">
            {(dashboard?.todayAppointments || []).map((appointment) => (
              <Card key={appointment.id} className="p-4">
                <div className="flex gap-3">
                  <div className="text-center pt-1">
                    <div className="w-1 h-full bg-green-500 rounded-full mx-auto"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-gray-600">{appointment.time}</p>
                        {appointment.hoursUntil <= 3 && (
                          <p className="text-xs text-blue-600">
                            In {Math.max(0, Math.floor(appointment.hoursUntil))} Std.{" "}
                            {Math.max(0, Math.round((appointment.hoursUntil % 1) * 60))} Min.
                          </p>
                        )}
                      </div>
                      {(() => {
                        const b = statusToBadge(appointment.status);
                        return <Badge className={b.className}>{b.label}</Badge>;
                      })()}
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-10 h-10">
                        <ImageWithFallback
                          src={appointment.client.image}
                          alt={appointment.client.name}
                          className="w-full h-full object-cover"
                        />
                      </Avatar>
                      <div className="flex-1">
                        <h5>{appointment.client.name}</h5>
                        <p className="text-sm text-gray-600">{appointment.service}</p>
                      </div>
                      <span className="text-[#8B4513]">{formatEuro(appointment.priceCents)}</span>
                    </div>

                    <div className="flex gap-2">
                      {appointment.hoursUntil <= 0.5 && (
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 flex-1">
                          Starten
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Nachricht
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <div className="w-1 h-12 border-l-2 border-dashed border-gray-300 mx-auto"></div>
              <span>15:00 - 16:00 Frei</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <h4 className="mb-3">Schnellaktionen</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/provider/calendar/block")}
            >
              <CalendarX className="w-6 h-6 text-gray-600" />
              <span className="text-sm">Blockierte Zeit</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/provider/appointments/create")}
            >
              <CalendarPlus className="w-6 h-6 text-gray-600" />
              <span className="text-sm">Termin erstellen</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/provider/services")}
            >
              <Edit className="w-6 h-6 text-gray-600" />
              <span className="text-sm">Dienste bearbeiten</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate("/provider/availability")}
            >
              <Clock className="w-6 h-6 text-gray-600" />
              <span className="text-sm">Verfügbarkeit</span>
            </Button>
          </div>
        </div>

        {/* Recent Reviews */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4>Neueste Bewertungen</h4>
            <button
              onClick={() => navigate("/provider/reviews")}
              className="text-sm text-[#8B4513] hover:underline"
            >
              Alle anzeigen
            </button>
          </div>

          <div className="space-y-3">
            {(dashboard?.recentReviews || []).map((review) => (
              <Card key={review.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5>{review.client}</h5>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(review.date).toLocaleDateString('de-DE')}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{review.text}</p>
                {!review.hasResponse && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#8B4513]"
                    onClick={() => navigate("/provider/reviews")}
                  >
                    Antworten
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
