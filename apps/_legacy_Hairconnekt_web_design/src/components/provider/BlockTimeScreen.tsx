import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { toast } from "sonner";

const BLOCK_REASONS = [
  { value: "pause", label: "Pause" },
  { value: "lunch", label: "Mittagspause" },
  { value: "external", label: "Termin außerhalb" },
  { value: "vacation", label: "Urlaub" },
  { value: "sick", label: "Krankheit" },
  { value: "other", label: "Sonstiges" },
];

const DAYS_OF_WEEK = [
  { value: "monday", label: "Mo" },
  { value: "tuesday", label: "Di" },
  { value: "wednesday", label: "Mi" },
  { value: "thursday", label: "Do" },
  { value: "friday", label: "Fr" },
  { value: "saturday", label: "Sa" },
  { value: "sunday", label: "So" },
];

export function BlockTimeScreen() {
  const navigate = useNavigate();
  const [reason, setReason] = useState("vacation");
  const [customReason, setCustomReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [allDay, setAllDay] = useState(true);
  const [repeat, setRepeat] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState("weekly");
  const [repeatDays, setRepeatDays] = useState([]);
  const [repeatEndType, setRepeatEndType] = useState("never");
  const [repeatEndDate, setRepeatEndDate] = useState("");
  const [repeatCount, setRepeatCount] = useState(1);
  const [notes, setNotes] = useState("");

  const toggleRepeatDay = (day) => {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleBlock = () => {
    if (!startDate) {
      toast.error("Bitte wähle ein Startdatum");
      return;
    }

    if (repeat && repeatFrequency === "weekly" && repeatDays.length === 0) {
      toast.error("Bitte wähle mindestens einen Wochentag");
      return;
    }

    if (!allDay && startTime >= endTime) {
      toast.error("Endzeit muss nach Startzeit liegen");
      return;
    }

    toast.success("Zeit erfolgreich blockiert!");
    setTimeout(() => navigate("/provider/calendar"), 1000);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/provider/calendar")}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h3>Zeit blockieren</h3>
            <p className="text-sm text-gray-600">
              Blockiere Zeiten für Pausen oder Urlaub
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Reason Selection */}
        <Card className="p-4">
          <Label className="mb-3 block">Grund</Label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {BLOCK_REASONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setReason(r.value)}
                className={`px-4 py-3 rounded-lg border-2 transition-all ${
                  reason === r.value
                    ? "border-[#8B4513] bg-[#8B4513]/5 font-medium"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {reason === "other" && (
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Grund angeben..."
              className="w-full px-3 py-2 border rounded-md"
            />
          )}
        </Card>

        {/* Date & Time Selection */}
        <Card className="p-4">
          <h4 className="mb-4">Zeitraum</h4>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-2 block">Startdatum</Label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <Label className="mb-2 block">Enddatum (optional)</Label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label>Ganztägig</Label>
              <Switch checked={allDay} onCheckedChange={setAllDay} />
            </div>

            {!allDay && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-2 block">Startzeit</Label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Endzeit</Label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Repeat Options */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Label>Wiederholen</Label>
            <Switch checked={repeat} onCheckedChange={setRepeat} />
          </div>

          {repeat && (
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Häufigkeit</Label>
                <select
                  value={repeatFrequency}
                  onChange={(e) => setRepeatFrequency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                  <option value="monthly">Monatlich</option>
                </select>
              </div>

              {repeatFrequency === "weekly" && (
                <div>
                  <Label className="mb-2 block">Wochentage</Label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => toggleRepeatDay(day.value)}
                        className={`flex-1 py-2 rounded-md border-2 transition-all ${
                          repeatDays.includes(day.value)
                            ? "border-[#8B4513] bg-[#8B4513] text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <Label className="mb-2 block">Wiederholung endet</Label>
                <select
                  value={repeatEndType}
                  onChange={(e) => setRepeatEndType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md mb-3"
                >
                  <option value="never">Nie</option>
                  <option value="date">Am Datum</option>
                  <option value="count">Nach X Wiederholungen</option>
                </select>

                {repeatEndType === "date" && (
                  <input
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                    min={startDate}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                )}

                {repeatEndType === "count" && (
                  <input
                    type="number"
                    value={repeatCount}
                    onChange={(e) => setRepeatCount(Number(e.target.value))}
                    min="1"
                    max="52"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Anzahl der Wiederholungen"
                  />
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Notes */}
        <Card className="p-4">
          <Label className="mb-2 block">Notizen (privat)</Label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Optionale Notizen..."
            className="w-full px-3 py-2 border rounded-md resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Diese Notizen sind nur für dich sichtbar
          </p>
        </Card>

        {/* Summary */}
        <Card className="p-4 bg-gray-50">
          <h4 className="mb-2">Zusammenfassung</h4>
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-gray-600">Grund:</span>{" "}
              <span className="font-medium">
                {BLOCK_REASONS.find((r) => r.value === reason)?.label}
                {reason === "other" && customReason && ` (${customReason})`}
              </span>
            </p>
            <p>
              <span className="text-gray-600">Zeitraum:</span>{" "}
              <span className="font-medium">
                {startDate || "Nicht gewählt"}
                {endDate && ` bis ${endDate}`}
              </span>
            </p>
            {!allDay && (
              <p>
                <span className="text-gray-600">Uhrzeit:</span>{" "}
                <span className="font-medium">
                  {startTime} - {endTime}
                </span>
              </p>
            )}
            {allDay && (
              <p>
                <span className="text-gray-600">Ganztägig</span>
              </p>
            )}
            {repeat && (
              <p>
                <span className="text-gray-600">Wiederholt sich:</span>{" "}
                <span className="font-medium">
                  {repeatFrequency === "daily" && "Täglich"}
                  {repeatFrequency === "weekly" && "Wöchentlich"}
                  {repeatFrequency === "monthly" && "Monatlich"}
                </span>
              </p>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/provider/calendar")}
          >
            Abbrechen
          </Button>
          <Button
            className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0A]"
            onClick={handleBlock}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Zeit blockieren
          </Button>
        </div>
      </div>
    </div>
  );
}
