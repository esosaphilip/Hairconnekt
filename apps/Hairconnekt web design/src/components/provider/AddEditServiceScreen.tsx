import { useState } from "react";
import { ArrowLeft, Euro, Info } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";
import { Slider } from "../ui/slider";
import { toast } from "sonner";

const categories = [
  "Box Braids",
  "Knotless Braids",
  "Cornrows",
  "Senegalese Twists",
  "Passion Twists",
  "Locs",
  "Natural Hair Care",
  "Barber Services",
  "Other",
];

const durationOptions = [
  { value: 30, label: "30 Min." },
  { value: 60, label: "1 Std." },
  { value: 90, label: "1,5 Std." },
  { value: 120, label: "2 Std." },
  { value: 150, label: "2,5 Std." },
  { value: 180, label: "3 Std." },
  { value: 240, label: "4 Std." },
  { value: 300, label: "5 Std." },
  { value: 360, label: "6 Std." },
];

export function AddEditServiceScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: 100,
    duration: 180,
    deposit: 20,
    isActive: true,
    allowOnlineBooking: true,
    requiresConsultation: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Bitte einen Service-Namen eingeben");
      return;
    }
    if (!formData.category) {
      toast.error("Bitte eine Kategorie auswählen");
      return;
    }

    toast.success(isEditing ? "Service aktualisiert!" : "Service erstellt!");
    navigate("/provider/services");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h3>{isEditing ? "Service bearbeiten" : "Neuer Service"}</h3>
            <p className="text-sm text-gray-600">
              {isEditing ? "Aktualisiere deinen Service" : "Füge einen neuen Service hinzu"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Basic Info */}
        <Card className="p-4 space-y-4">
          <h5>Grundinformationen</h5>

          <div>
            <Label htmlFor="name">Service-Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="z.B. 'Box Braids - Medium Length'"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="category">Kategorie *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Kategorie wählen" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Beschreibe den Service, verwendete Techniken, etc."
              rows={4}
              className="mt-1"
            />
          </div>
        </Card>

        {/* Pricing & Duration */}
        <Card className="p-4 space-y-4">
          <h5>Preis & Dauer</h5>

          <div>
            <Label htmlFor="price">Preis (€) *</Label>
            <div className="relative mt-1">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="price"
                type="number"
                min="0"
                step="5"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kunden sehen diesen Preis bei der Buchung
            </p>
          </div>

          <div>
            <Label htmlFor="duration">Dauer *</Label>
            <Select
              value={formData.duration.toString()}
              onValueChange={(value) => setFormData({ ...formData, duration: Number(value) })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Anzahlung (%)</Label>
            <div className="mt-3">
              <Slider
                value={[formData.deposit]}
                onValueChange={(value) => setFormData({ ...formData, deposit: value[0] })}
                min={0}
                max={100}
                step={5}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">{formData.deposit}% Anzahlung</span>
                <span className="text-sm text-[#8B4513]">
                  {((formData.price * formData.deposit) / 100).toFixed(2)}€
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kunden zahlen bei der Buchung eine Anzahlung
            </p>
          </div>
        </Card>

        {/* Booking Settings */}
        <Card className="p-4 space-y-4">
          <h5>Buchungseinstellungen</h5>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Service aktiv</Label>
              <p className="text-xs text-gray-500">
                Kunden können diesen Service buchen
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Online-Buchung erlauben</Label>
              <p className="text-xs text-gray-500">
                Kunden können direkt online buchen
              </p>
            </div>
            <Switch
              checked={formData.allowOnlineBooking}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, allowOnlineBooking: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Label>Beratung erforderlich</Label>
              <p className="text-xs text-gray-500">
                Kunden müssen zuerst eine Beratung buchen
              </p>
            </div>
            <Switch
              checked={formData.requiresConsultation}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, requiresConsultation: checked })
              }
            />
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="mb-1">
                Stelle sicher, dass deine Preise wettbewerbsfähig sind und deine tatsächlichen
                Kosten decken.
              </p>
              <p>
                Die angegebene Dauer sollte realistisch sein, inkl. Vorbereitung und
                Nachbereitung.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Abbrechen
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0A]"
          >
            {isEditing ? "Speichern" : "Service erstellen"}
          </Button>
        </div>
      </form>
    </div>
  );
}
