import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  X,
  Copy,
  Calendar,
  Clock,
  Save,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { toast } from "sonner";

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  isWorkday: boolean;
  slots: TimeSlot[];
}

type WeekSchedule = {
  [key: string]: DaySchedule;
};

const DAYS = [
  { key: "monday", label: "Montag" },
  { key: "tuesday", label: "Dienstag" },
  { key: "wednesday", label: "Mittwoch" },
  { key: "thursday", label: "Donnerstag" },
  { key: "friday", label: "Freitag" },
  { key: "saturday", label: "Samstag" },
  { key: "sunday", label: "Sonntag" },
];

export function AvailabilitySettingsScreen() {
  const navigate = useNavigate();
  const [bufferTime, setBufferTime] = useState(15);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(30);
  const [sameDayBooking, setSameDayBooking] = useState(true);
  const [minAdvanceHours, setMinAdvanceHours] = useState(2);

  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { isWorkday: true, slots: [{ start: "09:00", end: "18:00" }] },
    tuesday: { isWorkday: true, slots: [{ start: "09:00", end: "18:00" }] },
    wednesday: { isWorkday: true, slots: [{ start: "09:00", end: "18:00" }] },
    thursday: { isWorkday: true, slots: [{ start: "09:00", end: "18:00" }] },
    friday: { isWorkday: true, slots: [{ start: "09:00", end: "18:00" }] },
    saturday: { isWorkday: true, slots: [{ start: "10:00", end: "16:00" }] },
    sunday: { isWorkday: false, slots: [] },
  });

  const toggleWorkday = (day: string) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        isWorkday: !schedule[day].isWorkday,
        slots: !schedule[day].isWorkday
          ? [{ start: "09:00", end: "18:00" }]
          : [],
      },
    });
  };

  const addTimeSlot = (day: string) => {
    const lastSlot = schedule[day].slots[schedule[day].slots.length - 1];
    const newStart = lastSlot ? lastSlot.end : "09:00";
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: [...schedule[day].slots, { start: newStart, end: "18:00" }],
      },
    });
  };

  const removeTimeSlot = (day: string, index: number) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: schedule[day].slots.filter((_, i) => i !== index),
      },
    });
  };

  const updateTimeSlot = (
    day: string,
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const newSlots = [...schedule[day].slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        slots: newSlots,
      },
    });
  };

  const copyToOtherDays = (sourceDay: string) => {
    const sourceDaySchedule = schedule[sourceDay];
    const newSchedule = { ...schedule };

    DAYS.forEach(({ key }) => {
      if (key !== sourceDay) {
        newSchedule[key] = {
          isWorkday: sourceDaySchedule.isWorkday,
          slots: sourceDaySchedule.slots.map((slot) => ({ ...slot })),
        };
      }
    });

    setSchedule(newSchedule);
    toast.success(`Zeiten auf alle Tage kopiert`);
  };

  const handleSave = () => {
    // Validate schedules
    let hasError = false;
    Object.entries(schedule).forEach(([day, data]) => {
      if (data.isWorkday && data.slots.length === 0) {
        toast.error(`Bitte füge Arbeitszeiten für ${DAYS.find(d => d.key === day)?.label} hinzu`);
        hasError = true;
      }
      data.slots.forEach((slot) => {
        if (slot.start >= slot.end) {
          toast.error(`Endzeit muss nach Startzeit liegen (${DAYS.find(d => d.key === day)?.label})`);
          hasError = true;
        }
      });
    });

    if (!hasError) {
      toast.success("Verfügbarkeit erfolgreich gespeichert!");
      setTimeout(() => navigate("/provider/more"), 1000);
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/provider/more")}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h3>Verfügbarkeit festlegen</h3>
            <p className="text-sm text-gray-600">
              Lege deine Arbeitszeiten fest
            </p>
          </div>
          <Button onClick={handleSave} size="sm" className="bg-[#8B4513] hover:bg-[#5C2E0A]">
            <Save className="w-4 h-4 mr-2" />
            Speichern
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Weekly Schedule */}
        <Card className="p-4">
          <h4 className="mb-4">Regelmäßige Arbeitszeiten</h4>

          {DAYS.map(({ key, label }) => (
            <div key={key} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={schedule[key].isWorkday}
                    onCheckedChange={() => toggleWorkday(key)}
                  />
                  <span className="font-medium">{label}</span>
                </div>
                {schedule[key].isWorkday && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToOtherDays(key)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Auf andere Tage kopieren
                  </Button>
                )}
              </div>

              {schedule[key].isWorkday ? (
                <div className="ml-12 space-y-2">
                  {schedule[key].slots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) =>
                          updateTimeSlot(key, index, "start", e.target.value)
                        }
                        className="px-3 py-2 border rounded-md"
                      />
                      <span className="text-gray-500">bis</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) =>
                          updateTimeSlot(key, index, "end", e.target.value)
                        }
                        className="px-3 py-2 border rounded-md"
                      />
                      {schedule[key].slots.length > 1 && (
                        <button
                          onClick={() => removeTimeSlot(key, index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(key)}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Zeitslot hinzufügen
                  </Button>
                </div>
              ) : (
                <div className="ml-12">
                  <Badge variant="secondary">Geschlossen</Badge>
                </div>
              )}

              {key !== "sunday" && <Separator className="mt-4" />}
            </div>
          ))}
        </Card>

        {/* Buffer Time */}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gray-600 mt-1" />
            <div className="flex-1">
              <h4 className="mb-1">Pufferzeit zwischen Terminen</h4>
              <p className="text-sm text-gray-600 mb-3">
                Zeit zum Vorbereiten zwischen Kunden
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={bufferTime}
                  onChange={(e) => setBufferTime(Number(e.target.value))}
                  className="flex-1"
                />
                <Badge className="bg-[#8B4513] text-white">
                  {bufferTime} Min.
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Booking Settings */}
        <Card className="p-4">
          <div className="flex items-start gap-3 mb-4">
            <Calendar className="w-5 h-5 text-gray-600 mt-1" />
            <div className="flex-1">
              <h4 className="mb-1">Buchungseinstellungen</h4>
              <p className="text-sm text-gray-600">
                Wie weit im Voraus können Kunden buchen
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="advanceBookingDays" className="text-sm font-medium mb-2 block">
                Vorlaufzeit für Buchungen
              </label>
              <select
                id="advanceBookingDays"
                value={advanceBookingDays}
                onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="7">7 Tage</option>
                <option value="14">14 Tage</option>
                <option value="30">30 Tage</option>
                <option value="60">60 Tage</option>
                <option value="90">90 Tage</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Kunden können bis zu {advanceBookingDays} Tage im Voraus buchen
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Buchungen am selben Tag</p>
                <p className="text-sm text-gray-600">
                  Erlaube Buchungen für heute
                </p>
              </div>
              <Switch
                checked={sameDayBooking}
                onCheckedChange={setSameDayBooking}
              />
            </div>

            {sameDayBooking && (
              <div className="ml-4 pl-4 border-l-2 border-gray-200">
                <label htmlFor="minAdvanceHours" className="text-sm font-medium mb-2 block">
                  Mindestvorlaufzeit
                </label>
                <select
                  id="minAdvanceHours"
                  value={minAdvanceHours}
                  onChange={(e) => setMinAdvanceHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="1">1 Stunde</option>
                  <option value="2">2 Stunden</option>
                  <option value="3">3 Stunden</option>
                  <option value="4">4 Stunden</option>
                  <option value="6">6 Stunden</option>
                  <option value="12">12 Stunden</option>
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/provider/calendar/block")}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Urlaub/Auszeit planen
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/provider/calendar")}
          >
            <Clock className="w-4 h-4 mr-2" />
            Kalender ansehen
          </Button>
        </div>
      </div>
    </div>
  );
}
