import {
  ArrowLeft,
  AlertTriangle,
  Trash2,
  Download,
  MessageCircle,
  Calendar,
  Heart,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

const DELETION_REASONS = [
  "Ich nutze die App nicht mehr",
  "Ich habe ein Duplikat-Account",
  "Ich habe Datenschutzbedenken",
  "Die App entspricht nicht meinen Erwartungen",
  "Ich habe schlechte Erfahrungen gemacht",
  "Zu viele Benachrichtigungen",
  "Anderer Grund",
];

export function DeleteAccountScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"warning" | "confirmation" | "completed">("warning");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [showFinalDialog, setShowFinalDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataDownloaded, setDataDownloaded] = useState(false);

  const handleDownloadData = () => {
    toast.success("Deine Daten werden vorbereitet. Du erhältst eine E-Mail mit dem Download-Link.");
    setDataDownloaded(true);
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleProceedToConfirmation = () => {
    if (selectedReasons.length === 0) {
      toast.error("Bitte wähle mindestens einen Grund aus");
      return;
    }
    setStep("confirmation");
  };

  const handleDeleteAccount = async () => {
    if (!password) {
      toast.error("Bitte gib dein Passwort ein");
      return;
    }

    if (confirmText.toLowerCase() !== "account löschen") {
      toast.error('Bitte gib "Account löschen" ein, um zu bestätigen');
      return;
    }

    setShowFinalDialog(true);
  };

  const handleFinalDelete = async () => {
    setShowFinalDialog(false);
    setIsDeleting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsDeleting(false);
    setStep("completed");
  };

  if (step === "completed") {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="mb-2">Account erfolgreich gelöscht</h3>
          <p className="text-gray-600 mb-4">
            Dein Account und alle zugehörigen Daten wurden gelöscht. Es tut uns leid, dich gehen zu sehen.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Du wirst in wenigen Sekunden zur Startseite weitergeleitet...
          </p>
          <Button
            className="w-full bg-[#8B4513] hover:bg-[#5C2E0A]"
            onClick={() => {
              // Clear any stored data
              localStorage.clear();
              sessionStorage.clear();
              setTimeout(() => navigate("/"), 2000);
            }}
          >
            Zur Startseite
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Account löschen</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {step === "warning" && (
          <>
            {/* Warning Banner */}
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-900 mb-2">Achtung: Unwiderrufliche Aktion</h4>
                  <p className="text-sm text-red-800">
                    Das Löschen deines Accounts kann nicht rückgängig gemacht werden. Alle deine Daten werden permanent gelöscht.
                  </p>
                </div>
              </div>
            </Card>

            {/* What will be deleted */}
            <Card className="p-6">
              <h4 className="mb-4 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-[#8B4513]" />
                Was wird gelöscht?
              </h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p>Alle Nachrichten und Chats</p>
                    <p className="text-xs text-gray-500">
                      Deine gesamte Kommunikationshistorie
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p>Alle Termine und Buchungen</p>
                    <p className="text-xs text-gray-500">
                      Buchungshistorie und geplante Termine
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p>Favoriten und Bewertungen</p>
                    <p className="text-xs text-gray-500">
                      Gespeicherte Dienstleister und deine Rezensionen
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p>Zahlungsinformationen</p>
                    <p className="text-xs text-gray-500">
                      Gespeicherte Zahlungsmethoden und Transaktionshistorie
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Download Data First */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h5 className="text-blue-900 mb-2">Daten vor dem Löschen sichern</h5>
              <p className="text-sm text-blue-800 mb-3">
                Gemäß DSGVO hast du das Recht, eine Kopie deiner Daten zu erhalten. Wir empfehlen, deine Daten vor dem Löschen herunterzuladen.
              </p>
              <Button
                variant="outline"
                className="w-full border-blue-300 bg-white"
                onClick={handleDownloadData}
              >
                <Download className="w-4 h-4 mr-2" />
                {dataDownloaded ? "Download angefordert ✓" : "Meine Daten herunterladen"}
              </Button>
            </Card>

            {/* Alternative Options */}
            <Card className="p-6">
              <h4 className="mb-4">Alternativen erwägen?</h4>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/privacy")}
                >
                  Datenschutzeinstellungen anpassen
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/notifications")}
                >
                  Benachrichtigungen deaktivieren
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/support")}
                >
                  Support kontaktieren
                </Button>
              </div>
            </Card>

            {/* Reasons for Deletion */}
            <Card className="p-6">
              <h4 className="mb-4">Warum möchtest du deinen Account löschen?</h4>
              <p className="text-sm text-gray-600 mb-4">
                Dein Feedback hilft uns, HairConnekt zu verbessern. (Optional)
              </p>
              <div className="space-y-3 mb-4">
                {DELETION_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <Checkbox
                      checked={selectedReasons.includes(reason)}
                      onCheckedChange={() => toggleReason(reason)}
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>
              {selectedReasons.includes("Anderer Grund") && (
                <div>
                  <Label htmlFor="feedback">Weitere Details (optional)</Label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Erzähle uns mehr..."
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  />
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(-1)}
              >
                Abbrechen
              </Button>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={handleProceedToConfirmation}
              >
                Weiter zur Bestätigung
              </Button>
            </div>
          </>
        )}

        {step === "confirmation" && (
          <>
            {/* Final Warning */}
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-red-900 mb-2">Letzte Warnung</h4>
                  <p className="text-sm text-red-800">
                    Dies ist deine letzte Chance. Nach diesem Schritt wird dein Account unwiderruflich gelöscht.
                  </p>
                </div>
              </div>
            </Card>

            {/* Confirmation Form */}
            <Card className="p-6">
              <h4 className="mb-4">Bestätigung erforderlich</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Passwort eingeben</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Dein Passwort"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Zur Sicherheit musst du dein Passwort eingeben
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirm-text">
                    Gib &quot;Account löschen&quot; ein, um zu bestätigen
                  </Label>
                  <Input
                    id="confirm-text"
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Account löschen"
                  />
                </div>
              </div>
            </Card>

            {/* Summary of Selected Reasons */}
            {selectedReasons.length > 0 && (
              <Card className="p-4 bg-gray-100">
                <h5 className="mb-2">Deine Gründe:</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  {selectedReasons.map((reason) => (
                    <li key={reason}>• {reason}</li>
                  ))}
                </ul>
                {feedback && (
                  <p className="text-sm text-gray-600 mt-2 italic">&quot;{feedback}&quot;</p>
                )}
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStep("warning")}
              >
                Zurück
              </Button>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Wird gelöscht..." : "Account endgültig löschen"}
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Final Confirmation Dialog */}
      <AlertDialog open={showFinalDialog} onOpenChange={setShowFinalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bist du dir absolut sicher?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Dein Account und alle zugehörigen Daten werden permanent von unseren Servern gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Ja, Account löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
