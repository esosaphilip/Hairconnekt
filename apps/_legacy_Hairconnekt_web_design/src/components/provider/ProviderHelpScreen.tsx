import {
  ArrowLeft,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  Book,
  ChevronRight,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

const faqs = [
  {
    question: "Wie funktioniert die Auszahlung?",
    answer:
      "Auszahlungen werden innerhalb von 2-3 Werktagen nach Antragstellung auf dein hinterlegtes Bankkonto überwiesen. Du kannst eine Auszahlung beantragen, sobald dein Guthaben mindestens €50 beträgt.",
  },
  {
    question: "Wie kann ich meine Verfügbarkeit anpassen?",
    answer:
      'Gehe zu "Mehr" > "Verfügbarkeitszeiten" oder nutze die Schnellaktion "Verfügbarkeit" auf dem Dashboard. Dort kannst du deine regulären Öffnungszeiten sowie spezifische Blockierzeiten festlegen.',
  },
  {
    question: "Wie bearbeite ich mein Profil?",
    answer:
      'Tippe auf "Mehr" > "Mein Profil". Dort kannst du alle deine Profilinformationen, Fotos, Services und Preise bearbeiten.',
  },
  {
    question: "Welche Servicegebühren fallen an?",
    answer:
      "Die Servicegebühr hängt von deinem Abonnement ab: Basic 15%, Pro 10%, Premium 8%. Die Gebühr wird automatisch bei jeder Buchung berechnet.",
  },
  {
    question: "Wie antworte ich auf Bewertungen?",
    answer:
      'Gehe zu "Bewertungen" und tippe auf die Schaltfläche "Antworten" unter der jeweiligen Bewertung. Eine schnelle und professionelle Antwort zeigt Wertschätzung für das Feedback.',
  },
  {
    question: "Kann ich Buchungen ablehnen?",
    answer:
      "Ja, du kannst Buchungsanfragen ablehnen. Beachte jedoch, dass eine hohe Ablehnungsrate deine Sichtbarkeit in den Suchergebnissen beeinträchtigen kann.",
  },
  {
    question: "Wie füge ich neue Services hinzu?",
    answer:
      'Gehe zu "Mehr" > "Services & Preise" und tippe auf das "+"-Symbol. Dort kannst du Service-Name, Beschreibung, Dauer und Preis festlegen.',
  },
  {
    question: "Was ist ein Portfolio und wie lade ich Bilder hoch?",
    answer:
      'Dein Portfolio zeigt deine besten Arbeiten. Gehe zu "Mehr" > "Portfolio verwalten" und lade Fotos deiner Frisuren hoch. Hochqualitative Bilder erhöhen deine Buchungsrate deutlich.',
  },
];

const quickLinks = [
  {
    icon: Book,
    title: "Leitfaden für Anbieter",
    description: "Erste Schritte und Best Practices",
  },
  {
    icon: FileText,
    title: "Nutzungsbedingungen",
    description: "Rechtliche Informationen",
  },
  {
    icon: HelpCircle,
    title: "Häufig gestellte Fragen",
    description: "Antworten auf häufige Fragen",
  },
];

export function ProviderHelpScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Hilfe & Support</h3>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Wie können wir dir helfen?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Contact Support */}
        <Card className="p-5 mb-6 bg-gradient-to-br from-[#8B4513] to-[#5C2E0A] text-white">
          <h4 className="mb-2">Brauchst du schnelle Hilfe?</h4>
          <p className="text-sm opacity-90 mb-4">
            Unser Support-Team steht dir zur Verfügung
          </p>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-white text-[#8B4513] hover:bg-gray-100"
              onClick={() => alert("Chat öffnen - Funktion in Entwicklung")}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button
              className="flex-1 bg-white text-[#8B4513] hover:bg-gray-100"
              onClick={() => (window.location.href = "mailto:support@hairconnekt.de")}
            >
              <Mail className="w-4 h-4 mr-2" />
              E-Mail
            </Button>
          </div>
        </Card>

        {/* Quick Links */}
        <div className="mb-6">
          <h4 className="mb-3">Schnellzugriff</h4>
          <div className="space-y-3">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Card
                  key={index}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => alert(`${link.title} - Funktion in Entwicklung`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#8B4513] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-[#8B4513]" />
                    </div>
                    <div className="flex-1">
                      <h5>{link.title}</h5>
                      <p className="text-sm text-gray-600">{link.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-6">
          <h4 className="mb-3">Häufig gestellte Fragen</h4>
          <Card className="overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="px-4 hover:bg-gray-50">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <p className="text-sm text-gray-700">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          {filteredFaqs.length === 0 && (
            <Card className="p-8 text-center">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h5 className="mb-2">Keine Ergebnisse gefunden</h5>
              <p className="text-sm text-gray-600">
                Versuche es mit anderen Suchbegriffen
              </p>
            </Card>
          )}
        </div>

        {/* Contact Info */}
        <Card className="p-4">
          <h4 className="mb-3">Kontakt</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h5>E-Mail</h5>
                <a
                  href="mailto:support@hairconnekt.de"
                  className="text-[#8B4513] hover:underline"
                >
                  support@hairconnekt.de
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h5>Telefon</h5>
                <a href="tel:+4930123456" className="text-[#8B4513] hover:underline">
                  +49 30 123456
                </a>
                <p className="text-xs text-gray-600">Mo-Fr: 9:00 - 18:00</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h5>Live-Chat</h5>
                <p className="text-gray-600">Verfügbar Mo-Fr: 9:00 - 18:00</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Feedback */}
        <Card className="p-4 mt-4">
          <h5 className="mb-2">Feedback geben</h5>
          <p className="text-sm text-gray-600 mb-3">
            Hilf uns, HairConnekt zu verbessern. Teile deine Ideen und Vorschläge mit uns.
          </p>
          <Button
            className="w-full bg-[#8B4513] hover:bg-[#5C2E0A]"
            onClick={() => alert("Feedback senden - Funktion in Entwicklung")}
          >
            Feedback senden
          </Button>
        </Card>
      </div>
    </div>
  );
}
