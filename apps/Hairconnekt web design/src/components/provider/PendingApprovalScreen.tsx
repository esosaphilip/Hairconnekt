import { Clock, CheckCircle, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function PendingApprovalScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-[#8B4513]/10 flex items-center justify-center">
            <Clock className="w-12 h-12 text-[#8B4513]" />
          </div>
        </div>

        {/* Main Message */}
        <div className="text-center mb-8">
          <h2 className="mb-3">Deine Anmeldung wird geprüft</h2>
          <p className="text-gray-600 mb-2">
            Vielen Dank für deine Registrierung bei HairConnekt!
          </p>
          <p className="text-gray-600">
            Unser Team prüft deine Angaben und Dokumente. Dies dauert in der Regel 24-48 Stunden.
          </p>
        </div>

        {/* Timeline */}
        <Card className="p-6 mb-6">
          <h4 className="mb-4">Was passiert als Nächstes?</h4>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h5 className="text-sm mb-1">Antrag eingereicht</h5>
                <p className="text-xs text-gray-600">Deine Daten wurden erfolgreich übermittelt</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[#8B4513] flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
              <div>
                <h5 className="text-sm mb-1">Überprüfung läuft</h5>
                <p className="text-xs text-gray-600">Verifizierung deiner Dokumente und Angaben</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
              <div>
                <h5 className="text-sm mb-1">E-Mail Bestätigung</h5>
                <p className="text-xs text-gray-600">Du erhältst eine Nachricht über die Entscheidung</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
              <div>
                <h5 className="text-sm mb-1">Profil aktivieren</h5>
                <p className="text-xs text-gray-600">Beginne, Kunden zu erreichen</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-4 bg-gray-50 mb-6">
          <p className="text-sm mb-3">Fragen zur Prüfung?</p>
          <div className="space-y-2">
            <a href="mailto:support@hairconnekt.de" className="flex items-center gap-2 text-sm text-[#8B4513] hover:underline">
              <Mail className="w-4 h-4" />
              support@hairconnekt.de
            </a>
            <a href="tel:+4930123456" className="flex items-center gap-2 text-sm text-[#8B4513] hover:underline">
              <Phone className="w-4 h-4" />
              +49 30 123 456
            </a>
          </div>
        </Card>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/home")}
            className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
          >
            Zurück zur Startseite
          </Button>
          <Button
            onClick={() => navigate("/provider/dashboard")}
            variant="outline"
            className="w-full h-12"
          >
            Vorschau: Dashboard ansehen
          </Button>
        </div>

        {/* Info Note */}
        <p className="text-xs text-gray-500 text-center mt-6">
          Du kannst diese Seite schließen. Wir informieren dich per E-Mail über den Status.
        </p>
      </div>
    </div>
  );
}
