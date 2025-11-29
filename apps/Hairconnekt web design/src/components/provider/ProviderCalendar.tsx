import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Search, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Avatar } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { getProviderAppointments } from "../../services/appointments";

const daysOfWeek = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function ProviderCalendar() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [viewMode, setViewMode] = useState("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  // Derived values for month grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const daysInMonth = useMemo(() => new Date(year, month + 1, 0).getDate(), [year, month]);
  const monthDays = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  useEffect(() => {
    // Fetch upcoming appointments for provider
    setLoading(true);
    setError(null);
    getProviderAppointments("upcoming")
      .then((res) => {
        // our api.get returns parsed JSON, not an AxiosResponse
        setAppointments(res?.items || []);
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || err?.message || "Fehler beim Laden der Termine";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  // Group appointments by day-of-month
  const apptsByDay = useMemo(() => {
    const map = new Map();
    appointments.forEach((a) => {
      const d = new Date(a.appointmentDate + "T00:00:00");
      const day = d.getDate();
      const list = map.get(day) || [];
      list.push(a);
      map.set(day, list);
    });
    return map;
  }, [appointments]);

  const getAppointmentDots = (day) => {
    return (apptsByDay.get(day) || []).map((a) => a.status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "CONFIRMED": return "bg-green-500";
      case "PENDING": return "bg-yellow-500";
      case "IN_PROGRESS": return "bg-blue-500";
      default: return "bg-gray-300";
    }
  };

  const selectedDateLabel = useMemo(() => {
    const d = new Date(year, month, selectedDate);
    return d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
  }, [year, month, selectedDate]);

  const selectedDayAppointments = useMemo(() => {
    const list = apptsByDay.get(selectedDate) || [];
    // Compute revenue euro sum and format times
    const items = list.map((a) => {
      const start = (a.startTime || "").slice(0, 5);
      const end = (a.endTime || "").slice(0, 5);
      const serviceSummary = (a.services || []).map((s) => s.name).join(" + ");
      const priceEuro = (a.totalPriceCents || 0) / 100;
      return {
        id: a.id,
        time: `${start} - ${end}`,
        client: {
          name: a.client?.name || "Kunde",
          image: a.client?.avatarUrl || "",
        },
        service: serviceSummary,
        price: `€${priceEuro.toFixed(0)}`,
        status: a.status,
      };
    });
    const totalRevenueEuro = items.reduce((sum, i) => {
      const num = Number(i.price.replace(/[^\d]/g, ""));
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
    return { items, totalRevenueEuro };
  }, [apptsByDay, selectedDate]);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3>Terminkalender</h3>
          <div className="flex gap-2">
            <button className="p-2">
              <Filter className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2">
              <Search className="w-5 h-5 text-gray-700" />
            </button>
            <button className="p-2">
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          {["Tag", "Woche", "Monat"].map((view, idx) => {
            const mode = ["day", "week", "month"][idx];
            return (
              <Button
                key={view}
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
                className={viewMode === mode ? "bg-[#8B4513] hover:bg-[#5C2E0A]" : ""}
              >
                {view}
              </Button>
            );
          })}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-1 text-sm text-gray-600"
            onClick={() => {
              const prev = new Date(year, month - 1, 1);
              setCurrentDate(prev);
              setSelectedDate(1);
            }}
          >
            <ChevronLeft className="w-4 h-4" />
            Vorherige
          </button>
          <h4>
            {currentDate.toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
          </h4>
          <button
            className="flex items-center gap-1 text-sm text-gray-600"
            onClick={() => {
              const next = new Date(year, month + 1, 1);
              setCurrentDate(next);
              setSelectedDate(1);
            }}
          >
            Nächste
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month View Calendar */}
      {viewMode === "month" && (
        <div className="px-4 py-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-xs text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map(day => {
              const dayAppointments = getAppointmentDots(day);
              const isSelected = day === selectedDate;
              const todayCheck = new Date();
              const isToday = day === todayCheck.getDate() && month === todayCheck.getMonth() && year === todayCheck.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-2 rounded-lg relative ${
                    isSelected
                      ? "bg-[#8B4513] text-white"
                      : isToday
                      ? "border-2 border-[#8B4513] text-[#8B4513]"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <span className="text-sm">{day}</span>
                  {dayAppointments.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayAppointments.slice(0, 3).map((apt, idx) => (
                        <div
                          key={idx}
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? "bg-white" : getStatusColor(apt)
                          }`}
                        />
                      ))}
                      {dayAppointments.length > 3 && (
                        <span className="text-[8px]">+{dayAppointments.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Details */}
      <div className="bg-white mt-4 rounded-t-3xl shadow-lg">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h4>{selectedDateLabel}</h4>
              <p className="text-sm text-gray-600">
                {apptsByDay.get(selectedDate)?.length || 0} Termine · €{selectedDayAppointments.totalRevenueEuro} Umsatz
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/provider/create-appointment")}
              className="bg-[#8B4513] hover:bg-[#5C2E0A]"
            >
              + Termin
            </Button>
          </div>

          {/* Appointments List */}
          <div className="space-y-3">
            {loading && (
              <Card className="p-4">
                <div className="text-sm text-gray-600">Lade Termine...</div>
              </Card>
            )}
            {error && (
              <Card className="p-4">
                <div className="text-sm text-red-600">{error}</div>
              </Card>
            )}
            {!loading && !error && (selectedDayAppointments.items.length > 0 ? (
              selectedDayAppointments.items.map((apt) => (
                <Card key={apt.id} className="p-4">
                  <div className="flex gap-3">
                    <div className="text-sm text-gray-600 pt-1 w-24">
                      {apt.time}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="w-10 h-10">
                          <ImageWithFallback
                          src={apt.client.image}
                          alt={apt.client.name}
                          className="w-full h-full object-cover"
                          />
                        </Avatar>
                        <div className="flex-1">
                          <h5>{apt.client.name}</h5>
                          <p className="text-sm text-gray-600">{apt.service}</p>
                        </div>
                        <span className="text-[#8B4513]">{apt.price}</span>
                      </div>
                      <Badge className={`${apt.status === "CONFIRMED" ? "bg-green-500" : apt.status === "IN_PROGRESS" ? "bg-blue-500" : "bg-yellow-500"} text-white text-xs`}>
                        {apt.status === "CONFIRMED" ? "Bestätigt" : apt.status === "IN_PROGRESS" ? "Läuft" : "Ausstehend"}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-4">
                <div className="text-sm text-gray-600">Keine Termine für diesen Tag</div>
              </Card>
            ))}

            {/* Free Slot */}
            <Card className="p-4 border-dashed bg-gray-50">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-sm">15:00 - 16:00 Verfügbar</span>
                <Button size="sm" variant="ghost">
                  Buchen
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
