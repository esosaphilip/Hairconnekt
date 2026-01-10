import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  AlertTriangle,
  Download,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
// Removed unused AlertDialog imports (TypeScript-only types would cause lint errors in JS files)

export function PrivacySecurityScreen() {
  const navigate = useNavigate();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showLastSeen: true,
    showPhoneNumber: false,
    allowMessages: true,
    shareAnalytics: true,
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error("Bitte fülle alle Felder aus");
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error("Die neuen Passwörter stimmen nicht überein");
      return;
    }

    if (passwordData.new.length < 8) {
      toast.error("Das Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Passwort erfolgreich geändert");
    setPasswordData({ current: "", new: "", confirm: "" });
    setShowPasswordChange(false);
  };

  const handleDataDownload = () => {
    toast.success("Deine Daten werden vorbereitet. Du erhältst eine E-Mail mit dem Download-Link.");
  };

  const MenuItem = ({ icon: Icon, label, description, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        <div className="text-left">
          <p>{label}</p>
          {description && <p className="text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </button>
  );

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Datenschutz & Sicherheit</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Security Info */}
        <Card className="p-4 bg-blue-50 border-blue-100">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-blue-900 mb-1">Deine Sicherheit ist uns wichtig</h5>
              <p className="text-sm text-blue-800">
                Wir verwenden branchenübliche Verschlüsselung, um deine Daten zu schützen.
              </p>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-4">
          <h4 className="mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#8B4513]" />
            Datenschutzeinstellungen
          </h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Profil sichtbar</p>
                <p className="text-xs text-gray-500">
                  Anderen Nutzern dein Profil anzeigen
                </p>
              </div>
              <Switch
                checked={privacySettings.profileVisible}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, profileVisible: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Zuletzt online anzeigen</p>
                <p className="text-xs text-gray-500">
                  Anderen zeigen, wann du zuletzt aktiv warst
                </p>
              </div>
              <Switch
                checked={privacySettings.showLastSeen}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, showLastSeen: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Telefonnummer anzeigen</p>
                <p className="text-xs text-gray-500">
                  Telefonnummer in deinem Profil sichtbar machen
                </p>
              </div>
              <Switch
                checked={privacySettings.showPhoneNumber}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, showPhoneNumber: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Nachrichten erlauben</p>
                <p className="text-xs text-gray-500">
                  Erlaube anderen Nutzern, dir zu schreiben
                </p>
              </div>
              <Switch
                checked={privacySettings.allowMessages}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, allowMessages: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p>Nutzungsdaten teilen</p>
                <p className="text-xs text-gray-500">
                  Hilf uns, die App zu verbessern
                </p>
              </div>
              <Switch
                checked={privacySettings.shareAnalytics}
                onCheckedChange={(checked) =>
                  setPrivacySettings({ ...privacySettings, shareAnalytics: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Password & Security */}
        <Card className="p-4">
          <h4 className="mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#8B4513]" />
            Passwort & Sicherheit
          </h4>

          {!showPasswordChange ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPasswordChange(true)}
            >
              Passwort ändern
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Aktuelles Passwort</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, current: e.target.value })
                    }
                    placeholder="Aktuelles Passwort eingeben"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="new-password">Neues Passwort</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, new: e.target.value })
                    }
                    placeholder="Neues Passwort eingeben"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm: e.target.value })
                  }
                  placeholder="Neues Passwort wiederholen"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setPasswordData({ current: "", new: "", confirm: "" });
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0A]"
                  onClick={handlePasswordChange}
                >
                  Speichern
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Tipps für ein sicheres Passwort:</strong>
                  <br />• Mindestens 8 Zeichen
                  <br />• Groß- und Kleinbuchstaben
                  <br />• Zahlen und Sonderzeichen
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Connected Devices */}
        <Card className="p-4">
          <h4 className="mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#8B4513]" />
            Verbundene Geräte
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p>iPhone 14 Pro</p>
                <p className="text-xs text-gray-500">Zuletzt aktiv: Jetzt</p>
              </div>
              <Badge className="bg-green-500 text-white">Aktiv</Badge>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Du kannst dich von anderen Geräten aus deinem Account abmelden.
            </p>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-4">
          <h4 className="mb-4 flex items-center gap-2">
            <Download className="w-5 h-5 text-[#8B4513]" />
            Datenverwaltung
          </h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={handleDataDownload}
            >
              <span>Meine Daten herunterladen</span>
              <Download className="w-4 h-4" />
            </Button>
            <p className="text-xs text-gray-500">
              Erhalte eine Kopie deiner Daten gemäß DSGVO
            </p>
          </div>
        </Card>

        {/* Legal Links */}
        <Card className="p-0">
          <MenuItem
            icon={Shield}
            label="Datenschutzerklärung"
            description="Wie wir deine Daten verwenden"
            onClick={() => navigate("/privacy-policy")}
          />
          <Separator />
          <MenuItem
            icon={Lock}
            label="Allgemeine Geschäftsbedingungen"
            description="Nutzungsbedingungen lesen"
            onClick={() => navigate("/terms")}
          />
        </Card>

        {/* Delete Account Warning */}
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h5 className="text-red-900 mb-1">Gefahrenzone</h5>
              <p className="text-sm text-red-800 mb-3">
                Das Löschen deines Accounts kann nicht rückgängig gemacht werden.
              </p>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-100"
                onClick={() => navigate("/delete-account")}
              >
                Account löschen
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, className }) {
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${className}`}>
      {children}
    </span>
  );
}
