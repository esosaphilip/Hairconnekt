import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  FileText,
  Send,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { toast } from "sonner";

const faqs = [
  {
    question: "Wie buche ich einen Termin?",
    answer:
      "Suche nach einem Braider in deiner Nähe, wähle einen Service und ein verfügbares Zeitfenster aus. Bestätige die Buchung und bezahle sicher über die App.",
  },
  {
    question: "Kann ich einen Termin stornieren?",
    answer:
      "Ja, du kannst Termine bis zu 24 Stunden vor dem geplanten Zeitpunkt kostenlos stornieren. Bei späterer Stornierung können Gebühren anfallen.",
  },
  {
    question: "Wie funktioniert die Bezahlung?",
    answer:
      "Zahlungen werden sicher über die App abgewickelt. Du kannst mit Kreditkarte, Debitkarte oder PayPal bezahlen. Die Zahlung erfolgt nach Bestätigung der Buchung.",
  },
  {
    question: "Was ist, wenn ich mit dem Service unzufrieden bin?",
    answer:
      "Kontaktiere uns innerhalb von 24 Stunden nach dem Termin. Wir werden die Situation prüfen und eine angemessene Lösung finden.",
  },
  {
    question: "Wie kann ich meine Daten ändern?",
    answer:
      "Gehe zu Profil > Persönliche Informationen, um deine Daten zu aktualisieren. Für Änderungen an E-Mail oder Telefonnummer ist eine Verifizierung erforderlich.",
  },
];

export function SupportScreen() {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!contactForm.subject || !contactForm.message) {
      toast.error("Bitte fülle alle Felder aus");
      return;
    }

    setIsSending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSending(false);
    toast.success("Nachricht wurde gesendet! Wir melden uns in Kürze.");
    setContactForm({ subject: "", message: "" });
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Hilfe & Support</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Quick Contact Options */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => window.open("https://wa.me/491511234567", "_blank")}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-center">WhatsApp</span>
          </button>

          <button
            onClick={() => (window.location.href = "mailto:support@hairconnekt.de")}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-center">E-Mail</span>
          </button>

          <button
            onClick={() => (window.location.href = "tel:+491511234567")}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Phone className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-center">Anrufen</span>
          </button>
        </div>

        {/* FAQ Section */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-[#8B4513]" />
            <h4>Häufig gestellte Fragen</h4>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        {/* Contact Form */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-5 h-5 text-[#8B4513]" />
            <h4>Nachricht senden</h4>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Betreff</Label>
              <Input
                id="subject"
                value={contactForm.subject}
                onChange={(e) =>
                  setContactForm({ ...contactForm, subject: e.target.value })
                }
                placeholder="Worum geht es?"
              />
            </div>
            <div>
              <Label htmlFor="message">Nachricht</Label>
              <textarea
                id="message"
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
                placeholder="Beschreibe dein Anliegen..."
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={isSending}
              className="w-full bg-[#8B4513] hover:bg-[#5C2E0A]"
            >
              {isSending ? "Wird gesendet..." : "Nachricht senden"}
            </Button>
          </div>
        </Card>

        {/* Help Resources */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#8B4513]" />
            <h4>Weitere Ressourcen</h4>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/terms")}
              className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border"
            >
              Allgemeine Geschäftsbedingungen
            </button>
            <button
              onClick={() => navigate("/privacy-policy")}
              className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border"
            >
              Datenschutzerklärung
            </button>
            <button
              onClick={() => navigate("/user-manual")}
              className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-colors border"
            >
              Benutzerhandbuch
            </button>
          </div>
        </Card>

        {/* Support Hours */}
        <Card className="p-4 bg-blue-50 border-blue-100">
          <h5 className="mb-2 text-blue-900">Support-Zeiten</h5>
          <p className="text-sm text-blue-800 mb-2">
            Unser Support-Team ist für dich da:
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Montag - Freitag: 9:00 - 18:00 Uhr</li>
            <li>• Samstag: 10:00 - 16:00 Uhr</li>
            <li>• Sonntag: Geschlossen</li>
          </ul>
          <p className="text-xs text-blue-700 mt-3">
            E-Mail-Anfragen werden innerhalb von 24 Stunden beantwortet.
          </p>
        </Card>
      </div>
    </div>
  );
}
