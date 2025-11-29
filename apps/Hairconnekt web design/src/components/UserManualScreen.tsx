import {
  ArrowLeft,
  BookOpen,
  Search,
  Calendar,
  MessageCircle,
  User,
  Star,
  CreditCard,
  HelpCircle,
  Download,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

const manualSections = {
  getting_started: {
    title: "Erste Schritte",
    icon: BookOpen,
    topics: [
      {
        question: "Wie erstelle ich ein Konto?",
        answer: `Um ein Konto zu erstellen:
        
1. Öffne die HairConnekt App
2. Tippe auf "Registrieren"
3. Wähle "Als Kunde fortfahren"
4. Gib deine E-Mail-Adresse und ein sicheres Passwort ein
5. Bestätige deine E-Mail-Adresse
6. Vervollständige dein Profil mit deinen persönlichen Informationen

Fertig! Du kannst jetzt Dienstleister finden und Termine buchen.`,
      },
      {
        question: "Wie finde ich Dienstleister in meiner Nähe?",
        answer: `So findest du Dienstleister:

1. Gib deinen Standort bei der ersten Nutzung ein
2. Auf der Startseite siehst du "In deiner Nähe"
3. Nutze die Suchfunktion (Lupe-Symbol unten)
4. Filtere nach:
   - Standort (Stadt auswählen)
   - Haarstil (z.B. Box Braids, Cornrows)
   - Preis
   - Bewertung
   - Verfügbarkeit

Tipp: Nutze die Karte, um Dienstleister in deiner Umgebung zu sehen.`,
      },
      {
        question: "Wie richte ich meine Standortfreigabe ein?",
        answer: `Standortfreigabe aktivieren:

iPhone:
1. Öffne Einstellungen
2. Scrolle zu HairConnekt
3. Tippe auf "Standort"
4. Wähle "Beim Verwenden der App"

Android:
1. Öffne Einstellungen
2. Tippe auf "Apps"
3. Wähle HairConnekt
4. Tippe auf "Berechtigungen"
5. Aktiviere "Standort"

Datenschutz: Dein genauer Standort wird nicht gespeichert, nur deine Stadt.`,
      },
    ],
  },
  booking: {
    title: "Buchungen",
    icon: Calendar,
    topics: [
      {
        question: "Wie buche ich einen Termin?",
        answer: `Termin buchen in 5 Schritten:

1. Wähle einen Dienstleister aus den Suchergebnissen
2. Durchsuche das Profil und Portfolio
3. Tippe auf "Termin buchen"
4. Wähle:
   - Gewünschten Service
   - Verfügbares Datum und Uhrzeit
   - Optional: Zusatzleistungen
5. Bestätige die Buchung und bezahle

Du erhältst sofort eine Buchungsbestätigung per E-Mail und App-Benachrichtigung.`,
      },
      {
        question: "Wie kann ich einen Termin stornieren?",
        answer: `Termin stornieren:

1. Gehe zu "Termine" (Kalender-Symbol unten)
2. Wähle den Termin aus
3. Tippe auf "Termin verwalten"
4. Wähle "Termin stornieren"
5. Bestätige die Stornierung

Stornierungsbedingungen:
- Bis 24 Stunden vorher: Kostenlos, volle Rückerstattung
- Weniger als 24 Stunden: 50% Stornogebühr
- Bei Nichterscheinen: Keine Rückerstattung

Rückerstattungen erfolgen innerhalb von 5-10 Werktagen.`,
      },
      {
        question: "Kann ich einen Termin verschieben?",
        answer: `Termin verschieben:

1. Öffne den Termin in "Termine"
2. Tippe auf "Termin verschieben"
3. Wähle ein neues Datum/Uhrzeit aus den verfügbaren Slots
4. Bestätige die Änderung

Wichtig: 
- Verschiebungen sind bis 24 Stunden vor dem Termin kostenlos möglich
- Der Dienstleister muss den neuen Termin bestätigen
- Bei kurzfristigen Verschiebungen können Gebühren anfallen`,
      },
      {
        question: "Was passiert bei verspäteter Ankunft?",
        answer: `Bei Verspätung:

- Informiere den Dienstleister sofort über die Chat-Funktion
- Bis 15 Minuten Verspätung: In der Regel kein Problem
- Über 15 Minuten: Der Dienstleister kann den Termin verkürzen oder stornieren
- Bei Stornierung durch Verspätung: Keine Rückerstattung

Tipp: Plane immer etwas Puffer ein, besonders bei komplexen Frisuren!`,
      },
    ],
  },
  communication: {
    title: "Kommunikation",
    icon: MessageCircle,
    topics: [
      {
        question: "Wie kontaktiere ich einen Dienstleister?",
        answer: `Dienstleister kontaktieren:

Vor der Buchung:
1. Öffne das Profil des Dienstlesters
2. Tippe auf "Nachricht senden"
3. Stelle deine Fragen
4. Warte auf Antwort (meist innerhalb von 24 Stunden)

Nach der Buchung:
- Automatischer Chat wird erstellt
- Zugriff über "Nachrichten" (Sprechblase-Symbol)
- Direkter Kontakt für Details zum Termin

Tipps für gute Kommunikation:
- Sei höflich und respektvoll
- Beschreibe genau, was du möchtest
- Sende bei Bedarf Referenzbilder
- Frage nach Details zu Produkten oder Dauer`,
      },
      {
        question: "Kann ich Bilder im Chat versenden?",
        answer: `Ja, Bilder versenden:

1. Öffne den Chat
2. Tippe auf das Kamera-Symbol
3. Wähle:
   - Foto aufnehmen
   - Aus Galerie wählen
4. Bild wird komprimiert und gesendet

Verwendungszwecke:
- Referenzbilder für gewünschte Frisur
- Fotos von deinem aktuellen Haar
- Inspiration aus sozialen Medien
- Dokumentation des Ergebnisses

Datenschutz: Bilder werden verschlüsselt übertragen.`,
      },
    ],
  },
  payments: {
    title: "Zahlungen",
    icon: CreditCard,
    topics: [
      {
        question: "Welche Zahlungsmethoden werden akzeptiert?",
        answer: `Verfügbare Zahlungsmethoden:

- Kreditkarte (Visa, Mastercard, American Express)
- Debitkarte
- PayPal
- Apple Pay (iOS)
- Google Pay (Android)

Alle Zahlungen werden sicher über verschlüsselte Verbindungen abgewickelt.

Zahlungsmethode hinzufügen:
1. Gehe zu Profil > Zahlungsmethoden
2. Tippe auf "Neue Methode hinzufügen"
3. Gib deine Zahlungsinformationen ein
4. Speichern

Deine Zahlungsdaten werden sicher bei unserem Zahlungsdienstleister gespeichert.`,
      },
      {
        question: "Wann wird die Zahlung abgebucht?",
        answer: `Zahlungszeitpunkt:

- Sofort bei Buchungsbestätigung: Betrag wird reserviert
- Nach dem Termin: Zahlung wird endgültig abgebucht
- Bei Stornierung: Automatische Rückerstattung

Servicegebühr:
- 10% des Buchungspreises
- Wird transparent angezeigt
- Deckt Zahlungsabwicklung und Support

Rechnung:
- Per E-Mail nach jedem Termin
- Auch in der App unter "Transaktionshistorie"`,
      },
      {
        question: "Wie erhalte ich eine Rückerstattung?",
        answer: `Rückerstattungsprozess:

Bei berechtigten Stornierungen:
1. Automatische Rückerstattung wird eingeleitet
2. Rückerstattung auf ursprüngliche Zahlungsmethode
3. Bearbeitungszeit: 5-10 Werktage

Bei Problemen:
1. Kontaktiere den Support innerhalb von 24 Stunden
2. Beschreibe das Problem
3. Füge Fotos hinzu (falls relevant)
4. Wir prüfen den Fall
5. Rückerstattung oder Gutschrift bei berechtigten Beschwerden

Kulanzregelung: Wir finden immer eine faire Lösung!`,
      },
    ],
  },
  profile: {
    title: "Profil & Einstellungen",
    icon: User,
    topics: [
      {
        question: "Wie bearbeite ich mein Profil?",
        answer: `Profil bearbeiten:

1. Gehe zu "Profil" (Person-Symbol unten rechts)
2. Tippe auf "Profil bearbeiten"
3. Aktualisiere:
   - Profilbild
   - Name
   - E-Mail (mit Verifizierung)
   - Telefonnummer (mit Verifizierung)
   - Bio (optional)
4. Tippe auf "Speichern"

Haartyp & Präferenzen:
- Unter "Haartyp & Präferenzen"
- Hilft bei besseren Empfehlungen
- Kann jederzeit aktualisiert werden`,
      },
      {
        question: "Wie ändere ich meine Benachrichtigungseinstellungen?",
        answer: `Benachrichtigungen anpassen:

1. Gehe zu Profil > Einstellungen
2. Scrolle zu Benachrichtigungen
3. Aktiviere/Deaktiviere:
   - Push-Benachrichtigungen
   - E-Mail-Benachrichtigungen
   - SMS-Benachrichtigungen

Benachrichtigungstypen:
- Buchungsbestätigungen
- Terminerinnerungen
- Nachrichten
- Bewertungsanfragen
- Angebote & Rabatte (optional)

Tipp: Terminerinnerungen solltest du aktiviert lassen!`,
      },
    ],
  },
  reviews: {
    title: "Bewertungen",
    icon: Star,
    topics: [
      {
        question: "Wie bewerte ich einen Dienstleister?",
        answer: `Bewertung abgeben:

1. Nach dem Termin erhältst du eine Erinnerung
2. Oder: Gehe zu Termine > Abgeschlossene Termine
3. Wähle den Termin
4. Tippe auf "Bewertung schreiben"
5. Bewerte:
   - Sterne (1-5)
   - Qualität des Service
   - Pünktlichkeit
   - Sauberkeit
   - Preis-Leistung
6. Schreibe einen Text (optional)
7. Füge Fotos hinzu (optional)
8. Veröffentlichen

Deine ehrliche Bewertung hilft anderen Nutzern und den Dienstleistern!`,
      },
      {
        question: "Kann ich meine Bewertung bearbeiten oder löschen?",
        answer: `Bewertungen verwalten:

Bearbeiten:
- Innerhalb von 48 Stunden nach Veröffentlichung
- Gehe zu Profil > Meine Bewertungen
- Wähle die Bewertung
- Tippe auf "Bearbeiten"

Löschen:
- Nur durch Support möglich
- Kontaktiere uns mit Begründung
- Wir prüfen den Fall

Hinweis: Bewertungen werden geprüft und müssen unseren Richtlinien entsprechen (respektvoll, ehrlich, konstruktiv).`,
      },
    ],
  },
};

export function UserManualScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("getting_started");

  const handleDownload = () => {
    toast.success("Benutzerhandbuch wird heruntergeladen...");
  };

  const filteredSections = Object.entries(manualSections).reduce((acc, [key, section]) => {
    if (!searchQuery) {
      acc[key] = section;
      return acc;
    }

    const filteredTopics = section.topics.filter(
      (topic) =>
        topic.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredTopics.length > 0) {
      acc[key] = { ...section, topics: filteredTopics };
    }

    return acc;
  }, {});

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Benutzerhandbuch</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Header Card */}
        <Card className="p-4 bg-[#8B4513] text-white">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <div>
              <h4 className="text-white">Willkommen beim HairConnekt Handbuch</h4>
              <p className="text-sm opacity-90">
                Alles, was du über die App wissen musst
              </p>
            </div>
          </div>
        </Card>

        {/* Download Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-2" />
          Handbuch als PDF herunterladen
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Handbuch durchsuchen..."
            className="pl-10"
          />
        </div>

        {/* Quick Links */}
        {!searchQuery && (
          <Card className="p-4">
            <h5 className="mb-3">Schnellzugriff</h5>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate("/support")}
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <HelpCircle className="w-4 h-4 text-[#8B4513]" />
                <span className="text-sm">Support</span>
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <BookOpen className="w-4 h-4 text-[#8B4513]" />
                <span className="text-sm">AGB</span>
              </button>
            </div>
          </Card>
        )}

        {/* Tabs */}
        {!searchQuery && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-auto">
              <TabsTrigger value="getting_started" className="text-xs">
                Start
              </TabsTrigger>
              <TabsTrigger value="booking" className="text-xs">
                Buchung
              </TabsTrigger>
              <TabsTrigger value="payments" className="text-xs">
                Zahlung
              </TabsTrigger>
            </TabsList>
            <TabsList className="w-full grid grid-cols-3 h-auto mt-2">
              <TabsTrigger value="communication" className="text-xs">
                Chat
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs">
                Profil
              </TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs">
                Bewertung
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Content */}
        {searchQuery ? (
          // Search Results
          <div className="space-y-4">
            {Object.keys(filteredSections).length === 0 ? (
              <Card className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Keine Ergebnisse für {searchQuery}
                </p>
                <Button
                  variant="link"
                  onClick={() => setSearchQuery("")}
                  className="mt-2"
                >
                  Suche zurücksetzen
                </Button>
              </Card>
            ) : (
              Object.entries(filteredSections).map(([key, section]) => (
                <Card key={key} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <section.icon className="w-5 h-5 text-[#8B4513]" />
                    <h4>{section.title}</h4>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {section.topics.map((topic, index) => (
                      <AccordionItem key={index} value={`${key}-${index}`}>
                        <AccordionTrigger className="text-left">
                          {topic.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-700 whitespace-pre-line">
                          {topic.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              ))
            )}
          </div>
        ) : (
          // Tabbed Content
          Object.entries(manualSections).map(([key, section]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <section.icon className="w-5 h-5 text-[#8B4513]" />
                  <h4>{section.title}</h4>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {section.topics.map((topic, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {topic.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-700 whitespace-pre-line">
                        {topic.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </TabsContent>
          ))
        )}

        {/* Still Need Help */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h5 className="text-blue-900 mb-2">Noch Fragen?</h5>
          <p className="text-sm text-blue-800 mb-4">
            Unser Support-Team hilft dir gerne weiter.
          </p>
          <Button
            className="w-full bg-[#8B4513] hover:bg-[#5C2E0A]"
            onClick={() => navigate("/support")}
          >
            Zum Support
          </Button>
        </Card>

        {/* Video Tutorials Coming Soon */}
        <Card className="p-6 bg-gray-100">
          <h5 className="mb-2">Bald verfügbar</h5>
          <p className="text-sm text-gray-700">
            Video-Tutorials und interaktive Guides kommen bald!
          </p>
        </Card>
      </div>
    </div>
  );
}
