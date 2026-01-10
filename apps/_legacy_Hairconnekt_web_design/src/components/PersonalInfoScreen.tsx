import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";

export function PersonalInfoScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "Max",
    lastName: "Müller",
    email: "max.mueller@email.com",
    phone: "+49 151 1234 5678",
    dateOfBirth: "1995-05-15",
    gender: "male",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Persönliche Informationen erfolgreich aktualisiert!");
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
          <h3>Persönliche Informationen</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6">
        <Card className="p-4">
          <div className="space-y-4">
            {/* First Name */}
            <div>
              <Label htmlFor="firstName">Vorname</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="Vorname"
              />
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="lastName">Nachname</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Nachname"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="E-Mail-Adresse"
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Telefonnummer</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="Telefonnummer"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender">Geschlecht</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="male">Männlich</option>
                <option value="female">Weiblich</option>
                <option value="diverse">Divers</option>
                <option value="prefer-not-to-say">Keine Angabe</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Info */}
        <Card className="p-4 mt-4 bg-blue-50 border-blue-100">
          <h5 className="mb-2 text-blue-900">Datenschutz</h5>
          <p className="text-sm text-blue-800">
            Deine persönlichen Daten werden sicher gespeichert und nicht an
            Dritte weitergegeben. Sie werden nur zur Bereitstellung unserer
            Services verwendet.
          </p>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full mt-6 bg-[#8B4513] hover:bg-[#5C2E0A]"
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
