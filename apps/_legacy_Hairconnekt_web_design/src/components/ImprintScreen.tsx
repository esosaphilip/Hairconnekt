import { ArrowLeft, Building2, Mail, Phone, Scale, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";

export function ImprintScreen() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Impressum</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Impressum Notice */}
        <Card className="p-4 bg-[#8B4513] text-white">
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6" />
            <div>
              <h4 className="text-white">Impressum</h4>
              <p className="text-sm opacity-90">Angaben gemäß § 5 TMG</p>
            </div>
          </div>
        </Card>

        {/* Company Information */}
        <Card className="p-6">
          <div className="space-y-6 text-sm">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-5 h-5 text-[#8B4513]" />
                <h4>Unternehmensangaben</h4>
              </div>
              <p className="text-gray-700 mb-1">
                <strong>HairConnekt GmbH</strong>
              </p>
              <p className="text-gray-700 mb-1">
                Musterstraße 123<br />
                10115 Berlin<br />
                Deutschland
              </p>
            </section>

            <Separator />

            <section>
              <h5 className="mb-2">Handelsregister</h5>
              <p className="text-gray-700 mb-1">
                Registergericht: Amtsgericht Berlin-Charlottenburg<br />
                Registernummer: HRB 123456 B
              </p>
            </section>

            <Separator />

            <section>
              <h5 className="mb-2">Vertreten durch</h5>
              <p className="text-gray-700">
                Geschäftsführer: Max Mustermann, Lisa Schneider
              </p>
            </section>

            <Separator />

            <section>
              <h5 className="mb-2">Umsatzsteuer-ID</h5>
              <p className="text-gray-700 mb-1">
                Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
                DE123456789
              </p>
            </section>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <div className="space-y-4 text-sm">
            <h4 className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#8B4513]" />
              Kontaktdaten
            </h4>

            <div className="space-y-3">
              <div>
                <p className="text-gray-600 mb-1">Telefon</p>
                <a
                  href="tel:+493012345678"
                  className="text-[#8B4513] flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  +49 30 12345678
                </a>
              </div>

              <Separator />

              <div>
                <p className="text-gray-600 mb-1">E-Mail</p>
                <a
                  href="mailto:info@hairconnekt.de"
                  className="text-[#8B4513] flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  info@hairconnekt.de
                </a>
              </div>

              <Separator />

              <div>
                <p className="text-gray-600 mb-1">Support-E-Mail</p>
                <a
                  href="mailto:support@hairconnekt.de"
                  className="text-[#8B4513] flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  support@hairconnekt.de
                </a>
              </div>

              <Separator />

              <div>
                <p className="text-gray-600 mb-1">Datenschutz-E-Mail</p>
                <a
                  href="mailto:datenschutz@hairconnekt.de"
                  className="text-[#8B4513] flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  datenschutz@hairconnekt.de
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Responsible for Content */}
        <Card className="p-6">
          <div className="space-y-4 text-sm">
            <h4>Verantwortlich für den Inhalt</h4>
            <p className="text-gray-700">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:<br />
              Max Mustermann<br />
              HairConnekt GmbH<br />
              Musterstraße 123<br />
              10115 Berlin
            </p>
          </div>
        </Card>

        {/* Online Dispute Resolution */}
        <Card className="p-6">
          <div className="space-y-4 text-sm">
            <h4>Online-Streitbeilegung</h4>
            <p className="text-gray-700 mb-2">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
            </p>
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8B4513] underline break-all"
            >
              https://ec.europa.eu/consumers/odr
            </a>
            <p className="text-gray-700 mt-2">
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </div>
        </Card>

        {/* Consumer Dispute Resolution */}
        <Card className="p-6">
          <div className="space-y-4 text-sm">
            <h4>Verbraucherstreitbeilegung</h4>
            <p className="text-gray-700">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </div>
        </Card>

        {/* Liability for Content */}
        <Card className="p-6">
          <div className="space-y-4 text-sm">
            <h4 className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#8B4513]" />
              Haftung für Inhalte
            </h4>
            <div className="space-y-3 text-gray-700">
              <p>
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
              <p>
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>
            </div>
          </div>
        </Card>

        {/* Liability for Links */}
        <Card className="p-6">
          <div className="space-y-4 text-sm">
            <h4>Haftung für Links</h4>
            <div className="space-y-3 text-gray-700">
              <p>
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              </p>
              <p>
                Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
              </p>
            </div>
          </div>
        </Card>

        {/* Copyright */}
        <Card className="p-6">
          <div className="space-y-4 text-sm">
            <h4>Urheberrecht</h4>
            <div className="space-y-3 text-gray-700">
              <p>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
              <p>
                Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
              </p>
            </div>
          </div>
        </Card>

        {/* Image Credits */}
        <Card className="p-6">
          <div className="space-y-4 text-sm">
            <h4>Bildnachweise</h4>
            <p className="text-gray-700">
              Die auf dieser Website verwendeten Bilder stammen von:
            </p>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>Unsplash (unsplash.com) - Lizenzfrei</li>
              <li>Eigene Fotografien</li>
              <li>Mit Genehmigung der Dienstleister bereitgestellte Portfolio-Bilder</li>
            </ul>
          </div>
        </Card>

        {/* Legal Links */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/terms")}
            className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow text-center"
          >
            <FileText className="w-6 h-6 mx-auto mb-2 text-[#8B4513]" />
            <p className="text-sm">AGB</p>
          </button>
          <button
            onClick={() => navigate("/privacy-policy")}
            className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow text-center"
          >
            <Scale className="w-6 h-6 mx-auto mb-2 text-[#8B4513]" />
            <p className="text-sm">Datenschutz</p>
          </button>
        </div>
      </div>
    </div>
  );
}
