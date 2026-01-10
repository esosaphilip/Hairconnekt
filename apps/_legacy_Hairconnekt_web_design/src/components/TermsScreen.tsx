import { ArrowLeft, FileText, Download, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { toast } from "sonner";

export function TermsScreen() {
  const navigate = useNavigate();

  const handleDownload = () => {
    toast.success("AGB werden heruntergeladen...");
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
          <h3>AGB</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Last Updated */}
        <Card className="p-4 bg-[#8B4513] text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <div>
              <h4 className="text-white">Allgemeine Geschäftsbedingungen</h4>
              <p className="text-sm opacity-90">Zuletzt aktualisiert: 29. Oktober 2024</p>
            </div>
          </div>
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

        {/* Terms Content */}
        <Card className="p-6">
          <div className="space-y-6 text-sm">
            <section>
              <h4 className="mb-3">1. Geltungsbereich</h4>
              <p className="text-gray-700 mb-2">
                Diese Allgemeinen Geschäftsbedingungen (im Folgenden &quot;AGB&quot;) gelten für die Nutzung der HairConnekt-Plattform und aller damit verbundenen Dienste.
              </p>
              <p className="text-gray-700">
                HairConnekt ist eine Vermittlungsplattform, die Kunden mit unabhängigen Friseuren, Friseursalons und Barbieren (zusammen &quot;Dienstleister&quot;) verbindet.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">2. Vertragspartner</h4>
              <p className="text-gray-700 mb-2">
                <strong>Betreiber der Plattform:</strong><br />
                HairConnekt GmbH<br />
                Musterstraße 123<br />
                10115 Berlin, Deutschland<br />
                E-Mail: info@hairconnekt.de<br />
                Telefon: +49 30 12345678
              </p>
              <p className="text-gray-700">
                Handelsregister: HRB 123456 B<br />
                Registergericht: Amtsgericht Berlin-Charlottenburg<br />
                Geschäftsführer: Max Mustermann
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">3. Leistungsbeschreibung</h4>
              <p className="text-gray-700 mb-2">
                HairConnekt stellt eine Online-Plattform bereit, über die:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Kunden Dienstleister finden und kontaktieren können</li>
                <li>Termine für Friseurdienstleistungen gebucht werden können</li>
                <li>Zahlungen sicher abgewickelt werden</li>
                <li>Bewertungen und Rezensionen abgegeben werden können</li>
                <li>Kommunikation zwischen Kunden und Dienstleistern ermöglicht wird</li>
              </ul>
              <p className="text-gray-700 mt-2">
                HairConnekt ist selbst kein Dienstleister und erbringt keine Friseurdienstleistungen. Die Dienstleistungen werden ausschließlich von den unabhängigen Dienstleistern erbracht.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">4. Nutzerkonto und Registrierung</h4>
              <p className="text-gray-700 mb-2">
                <strong>4.1 Registrierung</strong><br />
                Für die Nutzung bestimmter Funktionen ist eine Registrierung erforderlich. Bei der Registrierung müssen Sie wahrheitsgemäße und vollständige Angaben machen.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>4.2 Altersbeschränkung</strong><br />
                Die Nutzung von HairConnekt ist nur Personen ab 18 Jahren gestattet. Mit der Registrierung bestätigen Sie, dass Sie mindestens 18 Jahre alt sind.
              </p>
              <p className="text-gray-700">
                <strong>4.3 Account-Sicherheit</strong><br />
                Sie sind verpflichtet, Ihre Zugangsdaten geheim zu halten und uns unverzüglich zu informieren, falls Dritte unbefugt Zugang zu Ihrem Account erhalten haben.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">5. Buchungen und Zahlungen</h4>
              <p className="text-gray-700 mb-2">
                <strong>5.1 Buchungsvorgang</strong><br />
                Buchungen erfolgen über die Plattform. Mit der Buchungsbestätigung kommt ein Vertrag zwischen Ihnen und dem Dienstleister zustande.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>5.2 Preise</strong><br />
                Alle Preise verstehen sich in Euro inklusive der gesetzlichen Mehrwertsteuer. Die Preise werden von den Dienstleistern festgelegt.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>5.3 Zahlung</strong><br />
                Die Zahlung erfolgt über die von HairConnekt bereitgestellten Zahlungsmethoden (Kreditkarte, Debitkarte, PayPal). HairConnekt wickelt die Zahlungen als Zahlungsdienstleister ab.
              </p>
              <p className="text-gray-700">
                <strong>5.4 Servicegebühr</strong><br />
                HairConnekt erhebt eine Servicegebühr von 10% auf den Buchungspreis. Diese wird transparent bei der Buchung ausgewiesen.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">6. Stornierung und Rücktritt</h4>
              <p className="text-gray-700 mb-2">
                <strong>6.1 Stornierung durch den Kunden</strong><br />
                Buchungen können bis zu 24 Stunden vor dem Termin kostenlos storniert werden. Bei späterer Stornierung oder Nichterscheinen wird der volle Betrag fällig.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>6.2 Stornierung durch den Dienstleister</strong><br />
                Bei Stornierung durch den Dienstleister erhalten Sie eine vollständige Rückerstattung. Der Dienstleister kann für Stornierungen sanktioniert werden.
              </p>
              <p className="text-gray-700">
                <strong>6.3 Rückerstattung</strong><br />
                Rückerstattungen werden innerhalb von 5-10 Werktagen auf die ursprüngliche Zahlungsmethode vorgenommen.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">7. Pflichten der Nutzer</h4>
              <p className="text-gray-700 mb-2">
                Als Nutzer verpflichten Sie sich:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Keine rechtswidrigen, beleidigenden oder anstößigen Inhalte zu veröffentlichen</li>
                <li>Keine falschen oder irreführenden Informationen bereitzustellen</li>
                <li>Die Rechte Dritter, insbesondere Urheberrechte, zu respektieren</li>
                <li>Termine pünktlich wahrzunehmen oder rechtzeitig zu stornieren</li>
                <li>Sich respektvoll gegenüber anderen Nutzern zu verhalten</li>
              </ul>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">8. Bewertungen und Rezensionen</h4>
              <p className="text-gray-700 mb-2">
                <strong>8.1 Veröffentlichung</strong><br />
                Sie können nach einem Termin eine Bewertung abgeben. Bewertungen müssen ehrlich, fair und sachlich sein.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>8.2 Löschung</strong><br />
                HairConnekt behält sich das Recht vor, unangemessene, beleidigende oder nachweislich falsche Bewertungen zu entfernen.
              </p>
              <p className="text-gray-700">
                <strong>8.3 Rechte</strong><br />
                Mit der Veröffentlichung einer Bewertung räumen Sie HairConnekt das nicht-exklusive, weltweite Recht ein, diese zu nutzen und anzuzeigen.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">9. Haftung</h4>
              <p className="text-gray-700 mb-2">
                <strong>9.1 Haftungsbeschränkung</strong><br />
                HairConnekt haftet nur als Vermittlungsplattform. Für die Qualität der erbrachten Dienstleistungen sind ausschließlich die Dienstleister verantwortlich.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>9.2 Gewährleistung</strong><br />
                HairConnekt übernimmt keine Gewährleistung für die ständige Verfügbarkeit der Plattform. Wartungsarbeiten können zu vorübergehenden Unterbrechungen führen.
              </p>
              <p className="text-gray-700">
                <strong>9.3 Schadenersatz</strong><br />
                Die Haftung von HairConnekt ist auf Vorsatz und grobe Fahrlässigkeit beschränkt, soweit gesetzlich zulässig.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">10. Datenschutz</h4>
              <p className="text-gray-700">
                Der Schutz Ihrer persönlichen Daten ist uns wichtig. Details zur Datenverarbeitung finden Sie in unserer{" "}
                <button
                  onClick={() => navigate("/privacy-policy")}
                  className="text-[#8B4513] underline"
                >
                  Datenschutzerklärung
                </button>
                .
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">11. Änderungen der AGB</h4>
              <p className="text-gray-700">
                HairConnekt behält sich das Recht vor, diese AGB zu ändern. Änderungen werden Ihnen per E-Mail mitgeteilt. Widersprechen Sie nicht innerhalb von 14 Tagen, gelten die Änderungen als akzeptiert.
              </p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-3">12. Schlussbestimmungen</h4>
              <p className="text-gray-700 mb-2">
                <strong>12.1 Anwendbares Recht</strong><br />
                Es gilt das Recht der Bundesrepublik Deutschland.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>12.2 Gerichtsstand</strong><br />
                Gerichtsstand ist Berlin, soweit gesetzlich zulässig.
              </p>
              <p className="text-gray-700 mb-2">
                <strong>12.3 Salvatorische Klausel</strong><br />
                Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
              </p>
              <p className="text-gray-700">
                <strong>12.4 Online-Streitbeilegung</strong><br />
                Die EU-Kommission stellt eine Plattform zur Online-Streitbeilegung bereit:{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8B4513] underline"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </section>
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-4 bg-gray-100">
          <h5 className="mb-2">Fragen zu den AGB?</h5>
          <p className="text-sm text-gray-700 mb-3">
            Bei Fragen oder Anmerkungen zu unseren AGB kontaktieren Sie uns gerne.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/support")}
          >
            Zum Support
          </Button>
        </Card>
      </div>
    </div>
  );
}
