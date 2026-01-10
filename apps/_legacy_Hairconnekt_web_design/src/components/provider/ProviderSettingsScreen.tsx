import {
  ArrowLeft,
  Bell,
  Lock,
  Globe,
  Moon,
  Smartphone,
  Mail,
  Shield,
  Eye,
  CreditCard,
  Users,
  Calendar,
  MessageCircle,
  Star,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Switch } from "../ui/switch";

export function ProviderSettingsScreen() {
  const navigate = useNavigate();
  
  // Notification Settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);
  const [reviewAlerts, setReviewAlerts] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Privacy Settings
  const [showPhoneNumber, setShowPhoneNumber] = useState(true);
  const [showEmail, setShowEmail] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);

  // Business Settings
  const [autoAcceptBookings, setAutoAcceptBookings] = useState(false);
  const [allowWalkIns, setAllowWalkIns] = useState(true);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Einstellungen</h3>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Notifications */}
        <div>
          <h5 className="mb-3 text-gray-500 uppercase text-xs tracking-wider">
            Benachrichtigungen
          </h5>
          <Card className="divide-y">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>Push-Benachrichtigungen</h5>
                  <p className="text-sm text-gray-600">
                    Erhalte wichtige Updates auf deinem Gerät
                  </p>
                </div>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>E-Mail-Benachrichtigungen</h5>
                  <p className="text-sm text-gray-600">
                    Wichtige Updates per E-Mail
                  </p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>Buchungsbenachrichtigungen</h5>
                  <p className="text-sm text-gray-600">
                    Bei neuen Buchungen benachrichtigen
                  </p>
                </div>
              </div>
              <Switch
                checked={bookingAlerts}
                onCheckedChange={setBookingAlerts}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>Nachrichtenbenachrichtigungen</h5>
                  <p className="text-sm text-gray-600">
                    Bei neuen Nachrichten benachrichtigen
                  </p>
                </div>
              </div>
              <Switch
                checked={messageAlerts}
                onCheckedChange={setMessageAlerts}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>Bewertungsbenachrichtigungen</h5>
                  <p className="text-sm text-gray-600">
                    Bei neuen Bewertungen benachrichtigen
                  </p>
                </div>
              </div>
              <Switch
                checked={reviewAlerts}
                onCheckedChange={setReviewAlerts}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>Marketing-E-Mails</h5>
                  <p className="text-sm text-gray-600">
                    Tipps, Neuigkeiten und Angebote
                  </p>
                </div>
              </div>
              <Switch
                checked={marketingEmails}
                onCheckedChange={setMarketingEmails}
              />
            </div>
          </Card>
        </div>

        {/* Privacy & Security */}
        <div>
          <h5 className="mb-3 text-gray-500 uppercase text-xs tracking-wider">
            Datenschutz & Sicherheit
          </h5>
          <Card className="divide-y">
            <button
              onClick={() => alert("Passwort ändern - Funktion in Entwicklung")}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <span>Passwort ändern</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>Telefonnummer anzeigen</h5>
                  <p className="text-sm text-gray-600">
                    Kunden können deine Nummer sehen
                  </p>
                </div>
              </div>
              <Switch
                checked={showPhoneNumber}
                onCheckedChange={setShowPhoneNumber}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>E-Mail-Adresse anzeigen</h5>
                  <p className="text-sm text-gray-600">
                    Kunden können deine E-Mail sehen
                  </p>
                </div>
              </div>
              <Switch
                checked={showEmail}
                onCheckedChange={setShowEmail}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>Profil sichtbar</h5>
                  <p className="text-sm text-gray-600">
                    In Suchergebnissen anzeigen
                  </p>
                </div>
              </div>
              <Switch
                checked={profileVisible}
                onCheckedChange={setProfileVisible}
              />
            </div>

            <button
              onClick={() => alert("Datenschutzeinstellungen - Funktion in Entwicklung")}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span>Datenschutzeinstellungen</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* Business Settings */}
        <div>
          <h5 className="mb-3 text-gray-500 uppercase text-xs tracking-wider">
            Geschäftseinstellungen
          </h5>
          <Card className="divide-y">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>Buchungen automatisch annehmen</h5>
                  <p className="text-sm text-gray-600">
                    Neue Buchungen sofort bestätigen
                  </p>
                </div>
              </div>
              <Switch
                checked={autoAcceptBookings}
                onCheckedChange={setAutoAcceptBookings}
              />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>Walk-ins erlauben</h5>
                  <p className="text-sm text-gray-600">
                    Kunden ohne Termin empfangen
                  </p>
                </div>
              </div>
              <Switch
                checked={allowWalkIns}
                onCheckedChange={setAllowWalkIns}
              />
            </div>

            <button
              onClick={() => navigate("/provider/availability")}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span>Verfügbarkeitszeiten</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => navigate("/provider/services")}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <span>Services & Preise</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </Card>
        </div>

        {/* App Settings */}
        <div>
          <h5 className="mb-3 text-gray-500 uppercase text-xs tracking-wider">
            App-Einstellungen
          </h5>
          <Card className="divide-y">
            <button
              onClick={() => alert("Sprache ändern - Funktion in Entwicklung")}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <div className="text-left">
                  <h5>Sprache</h5>
                  <p className="text-sm text-gray-600">Deutsch</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <div className="p-4 flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-600" />
                <div>
                  <h5>Dunkler Modus</h5>
                  <p className="text-sm text-gray-600">Bald verfügbar</p>
                </div>
              </div>
              <Switch disabled />
            </div>
          </Card>
        </div>

        {/* About */}
        <div>
          <h5 className="mb-3 text-gray-500 uppercase text-xs tracking-wider">
            Über
          </h5>
          <Card className="divide-y">
            <button
              onClick={() => alert("Nutzungsbedingungen")}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span>Nutzungsbedingungen</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => alert("Datenschutzerklärung")}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span>Datenschutzerklärung</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <div className="p-4">
              <p className="text-sm text-gray-600">Version 1.0.0</p>
            </div>
          </Card>
        </div>

        {/* Danger Zone */}
        <div>
          <h5 className="mb-3 text-red-600 uppercase text-xs tracking-wider">
            Gefahrenzone
          </h5>
          <Card>
            <button
              onClick={() => {
                if (confirm("Möchtest du dein Konto wirklich deaktivieren?")) {
                  alert("Konto deaktivieren - Funktion in Entwicklung");
                }
              }}
              className="w-full p-4 text-red-600 hover:bg-red-50 transition-colors"
            >
              Konto deaktivieren
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
