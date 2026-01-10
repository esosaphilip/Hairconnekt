import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";

const hairTypes = [
  { id: "1a", label: "1A - Glattes Haar" },
  { id: "1b", label: "1B - Glattes Haar mit Volumen" },
  { id: "1c", label: "1C - Glattes Haar mit leichten Wellen" },
  { id: "2a", label: "2A - Leichte Wellen" },
  { id: "2b", label: "2B - Definierte Wellen" },
  { id: "2c", label: "2C - Starke Wellen" },
  { id: "3a", label: "3A - Lockere Locken" },
  { id: "3b", label: "3B - Definierte Locken" },
  { id: "3c", label: "3C - Enge Locken" },
  { id: "4a", label: "4A - Weiche Coils" },
  { id: "4b", label: "4B - Z-förmige Coils" },
  { id: "4c", label: "4C - Sehr enge Coils" },
];

const hairLengths = [
  { id: "short", label: "Kurz (bis Kinn)" },
  { id: "medium", label: "Mittel (bis Schulter)" },
  { id: "long", label: "Lang (über Schulter)" },
  { id: "very-long", label: "Sehr lang (bis Taille+)" },
];

const preferredStyles = [
  { id: "box-braids", label: "Box Braids" },
  { id: "knotless", label: "Knotless Braids" },
  { id: "cornrows", label: "Cornrows" },
  { id: "senegalese", label: "Senegalese Twists" },
  { id: "faux-locs", label: "Faux Locs" },
  { id: "passion-twists", label: "Passion Twists" },
  { id: "goddess-braids", label: "Goddess Braids" },
  { id: "fulani-braids", label: "Fulani Braids" },
];

const allergies = [
  { id: "latex", label: "Latex" },
  { id: "synthetic", label: "Synthetisches Haar" },
  { id: "certain-oils", label: "Bestimmte Öle" },
  { id: "fragrances", label: "Duftstoffe" },
];

export function HairPreferencesScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hairType: "4a",
    hairLength: "medium",
    preferredStyles: ["box-braids", "knotless"],
    allergies: [],
    sensitivScalp: false,
    additionalNotes: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleStyleToggle = (styleId: string) => {
    setFormData({
      ...formData,
      preferredStyles: formData.preferredStyles.includes(styleId)
        ? formData.preferredStyles.filter((id) => id !== styleId)
        : [...formData.preferredStyles, styleId],
    });
  };

  const handleAllergyToggle = (allergyId: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.includes(allergyId)
        ? formData.allergies.filter((id) => id !== allergyId)
        : [...formData.allergies, allergyId],
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Haartyp & Präferenzen erfolgreich aktualisiert!");
    navigate(-1);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Haartyp & Präferenzen</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Hair Type */}
        <Card className="p-4">
          <h5 className="mb-3">Haartyp</h5>
          <select
            value={formData.hairType}
            onChange={(e) =>
              setFormData({ ...formData, hairType: e.target.value })
            }
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {hairTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Wähle deinen Haartyp nach dem Andre Walker System
          </p>
        </Card>

        {/* Hair Length */}
        <Card className="p-4">
          <h5 className="mb-3">Haarlänge</h5>
          <div className="space-y-2">
            {hairLengths.map((length) => (
              <label
                key={length.id}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="radio"
                  name="hairLength"
                  value={length.id}
                  checked={formData.hairLength === length.id}
                  onChange={(e) =>
                    setFormData({ ...formData, hairLength: e.target.value })
                  }
                  className="w-4 h-4 text-[#8B4513]"
                />
                <span>{length.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Preferred Styles */}
        <Card className="p-4">
          <h5 className="mb-3">Bevorzugte Styles</h5>
          <div className="grid grid-cols-2 gap-2">
            {preferredStyles.map((style) => (
              <div
                key={style.id}
                className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleStyleToggle(style.id)}
                role="button"
                aria-pressed={formData.preferredStyles.includes(style.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleStyleToggle(style.id);
                  }
                }}
              >
                <Checkbox
                  checked={formData.preferredStyles.includes(style.id)}
                  onCheckedChange={() => handleStyleToggle(style.id)}
                />
                <span className="text-sm">{style.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Allergies */}
        <Card className="p-4">
          <h5 className="mb-3">Allergien & Empfindlichkeiten</h5>
          <div className="space-y-2 mb-3">
            {allergies.map((allergy) => (
              <div
                key={allergy.id}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleAllergyToggle(allergy.id)}
                role="button"
                aria-pressed={formData.allergies.includes(allergy.id)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAllergyToggle(allergy.id);
                  }
                }}
              >
                <Checkbox
                  checked={formData.allergies.includes(allergy.id)}
                  onCheckedChange={() => handleAllergyToggle(allergy.id)}
                />
                <span>{allergy.label}</span>
              </div>
            ))}
          </div>
          <div
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer"
            role="button"
            aria-pressed={formData.sensitivScalp}
            tabIndex={0}
            onClick={() => setFormData({ ...formData, sensitivScalp: !formData.sensitivScalp })}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setFormData({ ...formData, sensitivScalp: !formData.sensitivScalp });
              }
            }}
          >
            <Checkbox
              checked={formData.sensitivScalp}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, sensitivScalp: checked === true })
              }
            />
            <span>Ich habe eine empfindliche Kopfhaut</span>
          </div>
        </Card>

        {/* Additional Notes */}
        <Card className="p-4">
          <Label htmlFor="notes" className="mb-3 block">
            Zusätzliche Hinweise (optional)
          </Label>
          <textarea
            id="notes"
            value={formData.additionalNotes}
            onChange={(e) =>
              setFormData({ ...formData, additionalNotes: e.target.value })
            }
            placeholder="Weitere Informationen über deine Haarbedürfnisse..."
            rows={4}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
          />
        </Card>

        {/* Info */}
        <Card className="p-4 bg-blue-50 border-blue-100">
          <h5 className="mb-2 text-blue-900">Warum ist das wichtig?</h5>
          <p className="text-sm text-blue-800">
            Diese Informationen helfen Braidern, den besten Service für dich zu
            bieten und Styles vorzuschlagen, die zu deinem Haartyp passen.
          </p>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-[#8B4513] hover:bg-[#5C2E0A]"
        >
          {isSaving ? (
            "Wird gespeichert..."
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Änderungen speichern
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
