import { ArrowLeft, Shield, Download, Printer, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

export function PrivacyPolicyScreen() {
  const navigate = useNavigate();

  const handleDownload = () => {
    toast.success("Datenschutzerklärung wird heruntergeladen...");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Datenschutz</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Header Card */}
        <Card className="p-4 bg-[#8B4513] text-white">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <div>
              <h4 className="text-white">Datenschutzerklärung</h4>
              <p className="text-sm opacity-90">Zuletzt aktualisiert: 29. Oktober 2024</p>
            </div>
          </div>
        </Card>

        {/* GDPR Notice */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h5 className="text-blue-900 mb-2">DSGVO-konform</h5>
          <p className="text-sm text-blue-800">
            Diese Datenschutzerklärung entspricht den Anforderungen der Datenschutz-Grundverordnung (DSGVO) und des Bundesdatenschutzgesetzes (BDSG).
          </p>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrint}
          >
            <Printer className="w-4 h-4 mr-2" />
            Drucken
          </Button>
        </div>

        {/* Privacy Content */}
        <Card className="p-6">
          <div className="space-y-6 text-sm">
            <section>
              <h4 className="mb-3">1. Verantwortliche Stelle</h4>
              <p className="text-gray-700 mb-2">
                Verantwortlich für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p className="text-gray-700 mb-2">
                <strong>HairConnekt GmbH</strong><br />
                Musterstraße 123<br />
                10115 Berlin, Deutschland
              </p>
              <p className="text-gray-700 mb-2">
                Telefon: +49 30 12345678<br />
                E-Mail: datenschutz@hairconnekt.de
              </p>
              <p className="text-gray-700">
                <strong>Datenschutzbeauftragter:</strong><br />
                Dr. Anna Schmidt<br />
                E-Mail: dsb@hairconnekt.de
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">2. Allgemeines zur Datenverarbeitung</h4>
              <p className="text-gray-700 mb-2">
                <strong>2.1 Umfang der Verarbeitung personenbezogener Daten</strong><br />
                Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>2.2 Rechtsgrundlage</strong><br />
                Die Verarbeitung erfolgt auf Grundlage von:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</li>
                <li>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</li>
                <li>Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen)</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">3. Erhebung und Speicherung personenbezogener Daten</h4>
              <p className="text-gray-700 mb-2">
                <strong>3.1 Bei Registrierung</strong><br />
                Bei der Registrierung erheben wir folgende Daten:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-2">
                <li>Vor- und Nachname</li>
                <li>E-Mail-Adresse</li>
                <li>Telefonnummer (optional)</li>
                <li>Passwort (verschlüsselt gespeichert)</li>
                <li>Profilbild (optional)</li>
              </ul>
              <p className="text-gray-700 mb-2">
                <strong>3.2 Bei Buchungen</strong><br />
                Für Buchungen benötigen wir:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-2">
                <li>Buchungsdetails (Datum, Uhrzeit, Service)</li>
                <li>Zahlungsinformationen</li>
                <li>Adresse (wenn erforderlich)</li>
              </ul>
              <p className="text-gray-700">
                <strong>3.3 Automatisch erfasste Daten</strong><br />
                Beim Zugriff auf unsere Website werden automatisch erfasst:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>IP-Adresse (anonymisiert nach 7 Tagen)</li>
                <li>Browsertyp und -version</li>
                <li>Betriebssystem</li>
                <li>Referrer URL</li>
                <li>Zugriffszeitpunkt</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">4. Verwendung der Daten</h4>
              <p className="text-gray-700 mb-2">
                Wir verwenden Ihre personenbezogenen Daten für folgende Zwecke:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Bereitstellung und Betrieb der Plattform</li>
                <li>Abwicklung von Buchungen und Zahlungen</li>
                <li>Kommunikation mit Ihnen (E-Mails, Benachrichtigungen)</li>
                <li>Kundensupport und Bearbeitung von Anfragen</li>
                <li>Betrugsprävention und Sicherheit</li>
                <li>Verbesserung unserer Dienste (Analysen, anonymisiert)</li>
                <li>Marketing (nur mit Ihrer Einwilligung)</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">5. Weitergabe von Daten</h4>
              <p className="text-gray-700 mb-2">
                <strong>5.1 An Dienstleister</strong><br />
                Bei Buchungen werden notwendige Daten (Name, Kontaktdaten) an den gewählten Dienstleister weitergegeben.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>5.2 Auftragsverarbeiter</strong><br />
                Wir nutzen folgende Dienstleister (Auftragsverarbeiter):
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-2">
                <li>Hosting: AWS (Amazon Web Services)</li>
                <li>Zahlungen: Stripe, PayPal</li>
                <li>E-Mail: SendGrid</li>
                <li>Analysen: Google Analytics (anonymisiert, opt-out möglich)</li>
              </ul>
              <p className="text-gray-700">
                <strong>5.3 Keine Weitergabe an Dritte</strong><br />
                Wir verkaufen Ihre Daten nicht an Dritte. Eine Weitergabe erfolgt nur mit Ihrer Einwilligung oder wenn wir gesetzlich dazu verpflichtet sind.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">6. Cookies und Tracking</h4>
              <p className="text-gray-700 mb-2">
                <strong>6.1 Cookies</strong><br />
                Wir verwenden Cookies, um die Nutzererfahrung zu verbessern. Sie können in Ihrem Browser die Cookie-Einstellungen anpassen.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Arten von Cookies:</strong>
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1 mb-2">
                <li><strong>Notwendige Cookies:</strong> Für die Funktion der Website erforderlich</li>
                <li><strong>Funktionale Cookies:</strong> Für erweiterte Funktionen (z.B. Spracheinstellungen)</li>
                <li><strong>Analyse-Cookies:</strong> Zur Verbesserung der Website (nur mit Einwilligung)</li>
              </ul>
              <p className="text-gray-700">
                <strong>6.2 Google Analytics</strong><br />
                Wir nutzen Google Analytics mit IP-Anonymisierung. Sie können das Tracking durch Installation des{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8B4513] underline"
                >
                  Browser-Add-ons
                </a>
                {" "}deaktivieren.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">7. Speicherdauer</h4>
              <p className="text-gray-700 mb-2">
                Wir speichern Ihre personenbezogenen Daten nur solange, wie es für die Zwecke erforderlich ist:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li><strong>Account-Daten:</strong> Bis zur Löschung des Accounts</li>
                <li><strong>Buchungsdaten:</strong> 10 Jahre (steuerrechtliche Aufbewahrungspflicht)</li>
                <li><strong>Kommunikation:</strong> 3 Jahre nach letztem Kontakt</li>
                <li><strong>Log-Daten:</strong> 7 Tage</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">8. Ihre Rechte</h4>
              <p className="text-gray-700 mb-2">
                Nach der DSGVO haben Sie folgende Rechte:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Auskunft über Ihre gespeicherten Daten</li>
                <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Korrektur falscher Daten</li>
                <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Löschung Ihrer Daten (&quot;Recht auf Vergessenwerden&quot;)</li>
                <li><strong>Einschränkung (Art. 18 DSGVO):</strong> Einschränkung der Verarbeitung</li>
                <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Erhalt Ihrer Daten in strukturiertem Format</li>
                <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Widerspruch gegen die Verarbeitung</li>
                <li><strong>Widerruf der Einwilligung:</strong> Jederzeit möglich, ohne Auswirkung auf die Rechtmäßigkeit der bisherigen Verarbeitung</li>
              </ul>
              <p className="text-gray-700 mt-2">
                Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter: datenschutz@hairconnekt.de
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">9. Datensicherheit</h4>
              <p className="text-gray-700 mb-2">
                Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>SSL/TLS-Verschlüsselung für Datenübertragung</li>
                <li>Verschlüsselte Speicherung von Passwörtern</li>
                <li>Regelmäßige Sicherheits-Updates</li>
                <li>Zugriffskontrollen und Berechtigungsmanagement</li>
                <li>Regelmäßige Backups</li>
                <li>Firewalls und Intrusion Detection</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">10. Datenübermittlung in Drittländer</h4>
              <p className="text-gray-700">
                Teilweise nutzen wir Dienstleister außerhalb der EU/EWR (z.B. AWS, Google). Die Übermittlung erfolgt auf Basis von Standardvertragsklauseln der EU-Kommission oder anderen geeigneten Garantien gemäß Art. 46 DSGVO.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">11. Minderjährige</h4>
              <p className="text-gray-700">
                Unsere Dienste richten sich nicht an Personen unter 18 Jahren. Wir erheben wissentlich keine Daten von Minderjährigen.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">12. Beschwerderecht</h4>
              <p className="text-gray-700 mb-2">
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer Daten zu beschweren.
              </p>
              <p className="text-gray-700">
                <strong>Zuständige Aufsichtsbehörde:</strong><br />
                Berliner Beauftragte für Datenschutz und Informationsfreiheit<br />
                Friedrichstraße 219<br />
                10969 Berlin<br />
                Telefon: 030 13889-0<br />
                E-Mail: mailbox@datenschutz-berlin.de
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">13. Änderungen der Datenschutzerklärung</h4>
              <p className="text-gray-700">
                Wir behalten uns vor, diese Datenschutzerklärung anzupassen, um sie an geänderte Rechtslage oder Änderungen unserer Dienste anzupassen. Die aktuelle Version finden Sie stets auf dieser Seite.
              </p>
            </section>
          </div>
        </Card>

        {/* Contact Card */}
        <Card className="p-4 bg-gray-100">
          <h5 className="mb-2 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#8B4513]" />
            Fragen zum Datenschutz?
          </h5>
          <p className="text-sm text-gray-700 mb-3">
            Bei Fragen zur Verarbeitung Ihrer Daten oder zur Ausübung Ihrer Rechte kontaktieren Sie unseren Datenschutzbeauftragten.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = "mailto:datenschutz@hairconnekt.de"}
          >
            <Mail className="w-4 h-4 mr-2" />
            datenschutz@hairconnekt.de
          </Button>
        </Card>

        {/* Download Your Data */}
        <Card className="p-4 bg-[#8B4513] text-white">
          <h5 className="text-white mb-2">Deine Daten herunterladen</h5>
          <p className="text-sm opacity-90 mb-3">
            Du hast das Recht, eine Kopie all deiner Daten zu erhalten.
          </p>
          <Button
            variant="outline"
            className="w-full bg-white text-[#8B4513] hover:bg-gray-100"
            onClick={() => navigate("/privacy")}
          >
            Zu den Datenschutzeinstellungen
          </Button>
        </Card>
      </div>
    </div>
  );
}
