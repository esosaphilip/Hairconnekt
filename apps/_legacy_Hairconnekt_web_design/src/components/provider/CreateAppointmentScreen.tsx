import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Search,
} from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
// Removed unused Separator and Badge imports
import { toast } from "sonner";

const mockServices = [
  { id: "1", name: "Box Braids", duration: "4-6 Std.", price: "€85-€120" },
  { id: "2", name: "Cornrows", duration: "2-3 Std.", price: "€45-€65" },
  { id: "3", name: "Knotless Braids", duration: "5-7 Std.", price: "€95-€135" },
  { id: "4", name: "Twists", duration: "3-4 Std.", price: "€65-€85" },
];

const mockClients = [
  { id: "1", name: "Sarah Müller", phone: "+49 151 9876 5432" },
  { id: "2", name: "Maria Klein", phone: "+49 151 1234 5678" },
  { id: "3", name: "Anna Schmidt", phone: "+49 151 8765 4321" },
];

export function CreateAppointmentScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get("clientId");

  const [clientMode, setClientMode] = useState<"existing" | "new">(
    preselectedClientId ? "existing" : "existing"
  );
  const [selectedClient, setSelectedClient] = useState(preselectedClientId || "");
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [location, setLocation] = useState<"salon" | "mobile">("salon");
  const [mobileAddress, setMobileAddress] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "invoice">(
    "pending"
  );
  const [notes, setNotes] = useState("");

  const filteredClients = mockClients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleCreate = () => {
    if (clientMode === "existing" && !selectedClient) {
      toast.error("Bitte wähle einen Kunden aus");
      return;
    }

    if (clientMode === "new" && (!newClient.name || !newClient.phone)) {
      toast.error("Bitte fülle Name und Telefonnummer aus");
      return;
    }

    if (!date || !time) {
      toast.error("Bitte wähle Datum und Uhrzeit");
      return;
    }

    if (selectedServices.length === 0) {
      toast.error("Bitte wähle mindestens einen Service");
      return;
    }

    if (location === "mobile" && !mobileAddress) {
      toast.error("Bitte gib eine Adresse für den mobilen Service ein");
      return;
    }

    toast.success("Termin erfolgreich erstellt!");
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
            <h3>Termin erstellen</h3>
            <p className="text-sm text-gray-600">
              Für Telefon- oder Walk-in-Buchungen
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Client Selection */}
        <Card className="p-4">
          <h4 className="mb-4">Kunde auswählen</h4>

          <div className="flex gap-2 mb-4">
            <Button
              variant={clientMode === "existing" ? "default" : "outline"}
              className={`flex-1 ${
                clientMode === "existing" ? "bg-[#8B4513]" : ""
              }`}
              onClick={() => setClientMode("existing")}
            >
              Bestehender Kunde
            </Button>
            <Button
              variant={clientMode === "new" ? "default" : "outline"}
              className={`flex-1 ${clientMode === "new" ? "bg-[#8B4513]" : ""}`}
              onClick={() => setClientMode("new")}
            >
              Neuer Kunde
            </Button>
          </div>

          {clientMode === "existing" ? (
            <div>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kunde suchen..."
                  className="pl-10"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client.id)}
                    className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                      selectedClient === client.id
                        ? "border-[#8B4513] bg-[#8B4513]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.phone}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) =>
                    setNewClient({ ...newClient, name: e.target.value })
                  }
                  placeholder="Max Mustermann"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) =>
                    setNewClient({ ...newClient, phone: e.target.value })
                  }
                  placeholder="+49 151 1234 5678"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">E-Mail (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newClient.email}
                  onChange={(e) =>
                    setNewClient({ ...newClient, email: e.target.value })
                  }
                  placeholder="kunde@email.com"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Date & Time */}
        <Card className="p-4">
          <h4 className="mb-4">Datum & Uhrzeit</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="date">Datum *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="time">Uhrzeit *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* Service Selection */}
        <Card className="p-4">
          <h4 className="mb-4">Services auswählen</h4>
          <div className="space-y-2">
            {mockServices.map((service) => (
              <button
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  selectedServices.includes(service.id)
                    ? "border-[#8B4513] bg-[#8B4513]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-600">
                      {service.duration} • {service.price}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => {}}
                    className="mt-1"
                  />
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Location */}
        <Card className="p-4">
          <h4 className="mb-4">Standort</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setLocation("salon")}
              className={`p-3 rounded-lg border-2 transition-all ${
                location === "salon"
                  ? "border-[#8B4513] bg-[#8B4513]/5"
                  : "border-gray-200"
              }`}
            >
              <p className="font-medium">Im Salon</p>
            </button>
            <button
              onClick={() => setLocation("mobile")}
              className={`p-3 rounded-lg border-2 transition-all ${
                location === "mobile"
                  ? "border-[#8B4513] bg-[#8B4513]/5"
                  : "border-gray-200"
              }`}
            >
              <p className="font-medium">Mobiler Service</p>
            </button>
          </div>

          {location === "mobile" && (
            <div className="mt-3">
              <Label htmlFor="address">Adresse *</Label>
              <Input
                id="address"
                value={mobileAddress}
                onChange={(e) => setMobileAddress(e.target.value)}
                placeholder="Straße, PLZ Stadt"
                className="mt-1"
              />
            </div>
          )}
        </Card>

        {/* Payment */}
        <Card className="p-4">
          <h4 className="mb-4">Zahlung</h4>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentStatus("pending")}
              className={`p-3 rounded-lg border-2 transition-all text-sm ${
                paymentStatus === "pending"
                  ? "border-[#8B4513] bg-[#8B4513]/5"
                  : "border-gray-200"
              }`}
            >
              Vor Ort
            </button>
            <button
              onClick={() => setPaymentStatus("paid")}
              className={`p-3 rounded-lg border-2 transition-all text-sm ${
                paymentStatus === "paid"
                  ? "border-[#8B4513] bg-[#8B4513]/5"
                  : "border-gray-200"
              }`}
            >
              Bezahlt
            </button>
            <button
              onClick={() => setPaymentStatus("invoice")}
              className={`p-3 rounded-lg border-2 transition-all text-sm ${
                paymentStatus === "invoice"
                  ? "border-[#8B4513] bg-[#8B4513]/5"
                  : "border-gray-200"
              }`}
            >
              Rechnung
            </button>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-4">
          <Label htmlFor="notes">Interne Notizen (optional)</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Besondere Wünsche, Hinweise..."
            className="w-full mt-2 px-3 py-2 border rounded-md resize-none"
          />
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
            onClick={handleCreate}
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Termin erstellen
          </Button>
        </div>
      </div>
    </div>
  );
}
