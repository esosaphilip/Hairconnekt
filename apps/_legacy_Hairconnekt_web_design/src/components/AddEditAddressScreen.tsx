import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { toast } from "sonner";

const GERMAN_STATES = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
];

export function AddEditAddressScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    label: "",
    street: "",
    postalCode: "",
    city: "",
    state: "Nordrhein-Westfalen",
    isDefault: false,
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    if (!formData.label || !formData.street || !formData.postalCode || !formData.city) {
      toast.error("Bitte fülle alle Pflichtfelder aus");
      return;
    }

    const message = isEditing
      ? "Adresse erfolgreich aktualisiert!"
      : "Adresse erfolgreich hinzugefügt!";
    toast.success(message);
    setTimeout(() => navigate("/addresses"), 1000);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/addresses")}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h3 className="flex-1">
            {isEditing ? "Adresse bearbeiten" : "Neue Adresse"}
          </h3>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-[#8B4513] hover:bg-[#5C2E0A]"
          >
            <Save className="w-4 h-4 mr-2" />
            Speichern
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Card className="p-4">
          <h4 className="mb-4">Adressinformationen</h4>

          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Adresslabel *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleChange("label", e.target.value)}
                placeholder="z.B. Zuhause, Arbeit, Bei Mama"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Wähle einen Namen zur einfachen Identifizierung
              </p>
            </div>

            <div>
              <Label htmlFor="street">Straße und Hausnummer *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                placeholder="Musterstraße 123"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="postalCode">PLZ *</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                  placeholder="44139"
                  maxLength={5}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">Stadt *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Dortmund"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="state">Bundesland *</Label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                {GERMAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Als Standardadresse festlegen</Label>
                <p className="text-xs text-gray-500 mt-1">
                  Diese Adresse wird automatisch bei Buchungen vorausgewählt
                </p>
              </div>
              <Switch
                checked={formData.isDefault}
                onCheckedChange={(checked) => handleChange("isDefault", checked)}
              />
            </div>
          </div>
        </Card>

        {/* Preview */}
        <Card className="p-4 bg-gray-50">
          <h4 className="mb-2">Vorschau</h4>
          <div className="text-sm">
            {formData.label && <p className="font-medium">{formData.label}</p>}
            {formData.street && <p className="text-gray-600">{formData.street}</p>}
            {(formData.postalCode || formData.city) && (
              <p className="text-gray-600">
                {formData.postalCode} {formData.city}
              </p>
            )}
            {formData.state && <p className="text-gray-600">{formData.state}</p>}
            {!formData.label && !formData.street && (
              <p className="text-gray-400 italic">
                Fülle die Felder aus, um eine Vorschau zu sehen
              </p>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/addresses")}
          >
            Abbrechen
          </Button>
          <Button
            className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0A]"
            onClick={handleSave}
          >
            Speichern
          </Button>
        </div>
      </div>
    </div>
  );
}
