import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Save } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";
import { usersApi } from "@/services/users";

export function EditProfileScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([usersApi.getMe(), usersApi.getPreferences()])
      .then(([me, pref]) => {
        if (!mounted) return;
        setAvatarUrl(me.avatarUrl || null);
        setFormData((prev) => ({
          ...prev,
          firstName: me.firstName || "",
          lastName: me.lastName || "",
          email: me.email || "",
          phone: me.phone || "",
          birthDate: pref?.dateOfBirth || "",
          gender:
            (pref?.gender === "MALE"
              ? "male"
              : pref?.gender === "FEMALE"
              ? "female"
              : pref?.gender === "OTHER"
              ? "other"
              : ""),
        }));
      })
      .catch((err) => {
        console.error("Failed to load profile for edit:", err);
        const message = err && typeof err.message === "string" ? err.message : "Fehler beim Laden des Profils";
        toast.error(message);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.phone) {
      toast.error("Bitte fülle Vorname, Nachname und Telefonnummer aus");
      return;
    }
    setSaving(true);
    try {
      // 1) Update base user fields
      await usersApi.updateMe({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      // 2) Update client profile preferences (DOB, gender)
      const genderEnum =
        formData.gender === "male"
          ? "MALE"
          : formData.gender === "female"
          ? "FEMALE"
          : formData.gender === "other"
          ? "OTHER"
          : null;
      await usersApi.updatePreferences({
        dateOfBirth: formData.birthDate || null,
        gender: genderEnum,
      });
      toast.success("Profil erfolgreich aktualisiert!");
      setTimeout(() => navigate("/profile"), 600);
    } catch (err) {
      console.error("Profile update failed:", err);
      const message = err && typeof err.message === "string" ? err.message : "Aktualisierung fehlgeschlagen";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const fileInputId = "avatar-file-input";
  const handlePickAvatar = () => {
    const inputEl = document.getElementById(fileInputId);
    // Ensure the element exists and supports click()
    if (inputEl && typeof inputEl.click === "function") {
      inputEl.click();
    }
  };

  const handleAvatarSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const res = await usersApi.uploadAvatar(file);
      setAvatarUrl(res.url);
      toast.success("Profilbild aktualisiert");
    } catch (err) {
      console.error("Avatar upload failed:", err);
      const message = err && typeof err.message === "string" ? err.message : "Upload fehlgeschlagen";
      toast.error(message);
    } finally {
      setUploadingAvatar(false);
      // reset file input
      e.target.value = "";
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h3 className="flex-1">Profil bearbeiten</h3>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-[#8B4513] hover:bg-[#5C2E0A]"
            disabled={saving || loading}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Profile Picture */}
        <Card className="p-6">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24 bg-[#8B4513] text-white overflow-hidden">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                ) : (
                  <AvatarFallback>
                    <span className="text-3xl">
                      {(formData.firstName?.[0] || "").toUpperCase()}
                      {(formData.lastName?.[0] || "").toUpperCase()}
                    </span>
                  </AvatarFallback>
                )}
              </Avatar>
              <input
                id={fileInputId}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelected}
              />
              <button
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#8B4513] rounded-full flex items-center justify-center border-2 border-white disabled:opacity-60"
                onClick={handlePickAvatar}
                disabled={uploadingAvatar}
                title="Profilbild ändern"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Tippe auf das Kamera-Symbol um dein Foto zu ändern
            </p>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="p-4">
          <h4 className="mb-4">Persönliche Informationen</h4>

          <div className="space-y-4">
            <div>
              <Label htmlFor="firstName">Vorname *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Nachname *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                readOnly
                disabled
                className="mt-1 bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Die E-Mail-Adresse wird zur Anmeldung verwendet und kann hier
                nicht geändert werden.
              </p>
            </div>

            <div>
              <Label htmlFor="phone">Telefonnummer *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="birthDate">Geburtsdatum</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="gender">Geschlecht</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="">Keine Angabe</option>
                <option value="male">Männlich</option>
                <option value="female">Weiblich</option>
                <option value="other">Divers</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/profile")}
          >
            Abbrechen
          </Button>
          <Button
            className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0A]"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </div>
      </div>
    </div>
  );
}
