import { Calendar, MapPin, Star, MessageCircle, MoreVertical, Clock } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "@/contexts/AuthContext";
import { AppointmentListItem, getClientAppointments } from "@/services/appointments";


export function AppointmentsScreen() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const navigate = useNavigate();
  const { user } = useAuth();
  const isVerified = !!(user?.emailVerified || user?.phoneVerified);

  // Live data state (overrides mock arrays declared above)
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentListItem[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<AppointmentListItem[]>([]);
  const [cancelledAppointments, setCancelledAppointments] = useState<AppointmentListItem[]>([]);
  const [loading, setLoading] = useState<Record<"upcoming" | "completed" | "cancelled", boolean>>({ upcoming: false, completed: false, cancelled: false });
  const [error, setError] = useState<Record<"upcoming" | "completed" | "cancelled", string>>({ upcoming: "", completed: "", cancelled: "" });

  const toEuro = (cents?: number) => {
    if (typeof cents !== "number") return "€0.00";
    return `€${(cents / 100).toFixed(2)}`;
  };

  const formatGermanDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-').map((x) => parseInt(x, 10));
      const dt = new Date(y, (m || 1) - 1, d);
      return dt.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  const formatTimeRange = (start: string, end: string) => {
    const toHM = (t: string) => {
      const [h, m] = t.split(':');
      return `${h}:${m}`;
    };
    return `${toHM(start)} - ${toHM(end)} Uhr`;
  };

  const loadAppointments = useCallback(async (status: "upcoming" | "completed" | "cancelled") => {
    try {
      setLoading((prev) => ({ ...prev, [status]: true }));
      setError((prev) => ({ ...prev, [status]: '' }));
      const res = await getClientAppointments(status);
      const items = res?.items || [];
      if (status === 'upcoming') setUpcomingAppointments(items);
      if (status === 'completed') setCompletedAppointments(items);
      if (status === 'cancelled') setCancelledAppointments(items);
    } catch (e: any) {
      setError((prev) => ({ ...prev, [status]: e?.message || 'Fehler beim Laden der Termine' }));
    } finally {
      setLoading((prev) => ({ ...prev, [status]: false }));
    }
  }, []);

  useEffect(() => {
    if (!isVerified) return;
    // initial load upcoming
    loadAppointments('upcoming');
  }, [isVerified, loadAppointments]);

  useEffect(() => {
    if (!isVerified) return;
    // lazy load on tab switch
    if (activeTab === 'completed' && completedAppointments.length === 0 && !loading['completed']) {
      loadAppointments('completed');
    }
    if (activeTab === 'cancelled' && cancelledAppointments.length === 0 && !loading['cancelled']) {
      loadAppointments('cancelled');
    }
  }, [activeTab, isVerified, completedAppointments.length, cancelledAppointments.length, loading['completed'], loading['cancelled'], loadAppointments]);

  const getStatusBadge = (status: string, hoursUntil?: number) => {
    if (hoursUntil && hoursUntil <= 2) {
      return <Badge className="bg-blue-500 text-white">Beginnt bald</Badge>;
    }
    if (status === "confirmed") {
      return <Badge className="bg-green-500 text-white">Bestätigt</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-amber-500 text-white">Ausstehend</Badge>;
    }
    return null;
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2>Meine Termine</h2>
          <div className="flex gap-2">
            <button className="p-2">
              <Calendar className="w-6 h-6 text-gray-700" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="upcoming" className="relative">
              Anstehend
              <Badge className="ml-1 bg-[#8B4513] text-white text-xs">{upcomingAppointments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
            <TabsTrigger value="cancelled">Abgesagt</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isVerified && (
          <Card className="p-4 mb-4 border-2 border-amber-200 bg-amber-50">
            <h4 className="mb-1">Verifiziere deinen Account</h4>
            <p className="text-sm text-gray-700 mb-3">
              Bitte verifiziere deine E-Mail oder Telefonnummer, um Termine zu verwalten und Nachrichten zu senden.
            </p>
            <div className="flex gap-2">
              <Button className="bg-[#8B4513] hover:bg-[#5C2E0A]" onClick={() => navigate("/verify")}>
                Jetzt verifizieren
              </Button>
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Profil öffnen
              </Button>
            </div>
          </Card>
        )}
        {isVerified && activeTab === "upcoming" && (
          <div className="space-y-4">
            {/* Next Appointment Highlight */}
            {upcomingAppointments[0] && (upcomingAppointments[0].hoursUntil || 0) <= 48 && (
              <Card className="p-4 bg-gradient-to-br from-[#8B4513]/10 to-transparent border-2 border-[#8B4513]/20">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-[#8B4513]" />
                  <span className="text-[#8B4513]">Dein nächster Termin</span>
                </div>
                <p className="text-2xl mb-1">In {upcomingAppointments[0].hoursUntil} Stunden</p>
                <p className="text-gray-600">{formatGermanDate(upcomingAppointments[0].appointmentDate)} • {formatTimeRange(upcomingAppointments[0].startTime, upcomingAppointments[0].endTime)}</p>
              </Card>
            )}

            {/* Appointment Cards */}
            {upcomingAppointments.map((appointment) => (
              <Link key={appointment.id} to={`/appointment/${appointment.id}`} className="block">
              <Card 
                className="p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="mb-1">{formatGermanDate(appointment.appointmentDate)}</h4>
                    <p className="text-gray-600">{formatTimeRange(appointment.startTime, appointment.endTime)}</p>
                    {(appointment.hoursUntil || 0) <= 48 && (
                      <p className="text-sm text-[#8B4513] mt-1">
                        In {appointment.hoursUntil} Std.
                      </p>
                    )}
                  </div>
                  {getStatusBadge(
                    appointment.status === 'CONFIRMED' ? 'confirmed' : appointment.status === 'PENDING' ? 'pending' : 'confirmed',
                    appointment.hoursUntil
                  )}
                </div>

                <div className="flex gap-3 mb-4">
                  <Avatar className="w-14 h-14">
                    <ImageWithFallback
                      src={appointment.provider?.avatarUrl || ''}
                      alt={appointment.provider?.name || appointment.provider?.businessName || 'Provider'}
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <h5>{appointment.provider?.name || appointment.provider?.businessName || 'Anbieter'}</h5>
                    {appointment.provider?.businessName && (
                      <p className="text-sm text-gray-600">{appointment.provider.businessName}</p>
                    )}
                    {/* Rating optional: backend liefert aktuell keinen Wert */}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      <p>{appointment.address}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {appointment.services.map((service, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-[#8B4513]">{toEuro(appointment.totalPriceCents)}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/messages");
                      }}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Nachricht
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
              </Link>
            ))}
            {upcomingAppointments.length === 0 && !loading['upcoming'] && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="mb-2">Keine anstehenden Termine</h4>
                <p className="text-gray-500 mb-4">
                  Buche jetzt deinen nächsten Termin!
                </p>
                <Button
                  className="bg-[#8B4513] hover:bg-[#5C2E0A]"
                  onClick={() => navigate("/search")}
                >
                  Braider finden
                </Button>
              </div>
            )}
            {loading['upcoming'] && (
              <div className="text-center py-6 text-gray-500">Lade anstehende Termine...</div>
            )}
            {error['upcoming'] && (
              <div className="text-center py-6 text-red-600">{error['upcoming']}</div>
            )}
          </div>
        )}

        {isVerified && activeTab === "completed" && (
          <div className="space-y-3">
            {completedAppointments.map((appointment) => (
              <Card key={appointment.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <ImageWithFallback
                      src={appointment.provider?.avatarUrl || ''}
                      alt={appointment.provider?.name || appointment.provider?.businessName || 'Provider'}
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <h5>{appointment.provider?.name || appointment.provider?.businessName || 'Anbieter'}</h5>
                    {appointment.provider?.businessName && (
                      <p className="text-sm text-gray-600">{appointment.provider.businessName}</p>
                    )}
                    <p className="text-sm text-gray-500">{formatGermanDate(appointment.appointmentDate)}</p>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    Abgeschlossen
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {appointment.services.map((service, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {service.name}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-[#8B4513]">{toEuro(appointment.totalPriceCents)}</span>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-[#8B4513] hover:bg-[#5C2E0A]">
                      <Star className="w-4 h-4 mr-1" />
                      Bewerten
                    </Button>
                    <Button size="sm" variant="outline">
                      Erneut buchen
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {completedAppointments.length === 0 && !loading['completed'] && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="mb-2">Keine abgeschlossenen Termine</h4>
                <p className="text-gray-500">Deine abgeschlossenen Termine erscheinen hier.</p>
              </div>
            )}
            {loading['completed'] && (
              <div className="text-center py-6 text-gray-500">Lade abgeschlossene Termine...</div>
            )}
            {error['completed'] && (
              <div className="text-center py-6 text-red-600">{error['completed']}</div>
            )}
          </div>
        )}

        {isVerified && activeTab === "cancelled" && (
          <div className="space-y-3">
            {cancelledAppointments.map((appointment) => (
              <Card key={appointment.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <ImageWithFallback
                      src={appointment.provider?.avatarUrl || ''}
                      alt={appointment.provider?.name || appointment.provider?.businessName || 'Provider'}
                      className="w-full h-full object-cover"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <h5>{appointment.provider?.name || appointment.provider?.businessName || 'Anbieter'}</h5>
                    {appointment.provider?.businessName && (
                      <p className="text-sm text-gray-600">{appointment.provider.businessName}</p>
                    )}
                    <p className="text-sm text-gray-500">{formatGermanDate(appointment.appointmentDate)}</p>
                  </div>
                  <Badge className="bg-red-500 text-white">Abgesagt</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {appointment.services.map((service, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {service.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-[#8B4513]">{toEuro(appointment.totalPriceCents)}</span>
                </div>
              </Card>
            ))}
            {cancelledAppointments.length === 0 && !loading['cancelled'] && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="mb-2">Keine abgesagten Termine</h4>
                <p className="text-gray-500">Deine stornierten Termine erscheinen hier.</p>
              </div>
            )}
            {loading['cancelled'] && (
              <div className="text-center py-6 text-gray-500">Lade abgesagte Termine...</div>
            )}
            {error['cancelled'] && (
              <div className="text-center py-6 text-red-600">{error['cancelled']}</div>
            )}
          </div>
        )}
        {!isVerified && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="mb-2">Termine gesperrt</h4>
            <p className="text-gray-500">
              Verifiziere deinen Account, um deine Termine zu sehen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
