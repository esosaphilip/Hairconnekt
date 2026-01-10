import { useState } from "react";
import {
  ArrowLeft,
  Euro,
  CreditCard,
  Building2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

export function PayoutRequestScreen() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("1245.50");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableBalance = 1245.5;
  const minimumPayout = 50;
  const processingFee = 2.5;
  const netAmount = parseFloat(amount) - processingFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseFloat(amount) < minimumPayout) {
      alert(`Mindestbetrag für Auszahlung: €${minimumPayout}`);
      return;
    }

    if (parseFloat(amount) > availableBalance) {
      alert("Nicht genügend Guthaben verfügbar");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Auszahlung beantragt! Du erhältst eine Bestätigung per E-Mail.");
      navigate("/provider/earnings");
    }, 2000);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Auszahlung beantragen</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4">
        {/* Available Balance */}
        <Card className="p-5 bg-gradient-to-br from-[#8B4513] to-[#5C2E0A] text-white mb-4">
          <p className="text-sm opacity-90 mb-2">Verfügbares Guthaben</p>
          <h1>€{availableBalance.toFixed(2)}</h1>
          <p className="text-xs opacity-75 mt-2">
            Mindestbetrag für Auszahlung: €{minimumPayout}
          </p>
        </Card>

        {/* Amount Input */}
        <Card className="p-4 mb-4">
          <h4 className="mb-4">Auszahlungsbetrag</h4>
          
          <div className="mb-4">
            <Label htmlFor="amount">Betrag</Label>
            <div className="relative mt-2">
              <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={minimumPayout}
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAmount(minimumPayout.toString())}
            >
              Min (€{minimumPayout})
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAmount((availableBalance / 2).toFixed(2))}
            >
              50%
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setAmount(availableBalance.toString())}
            >
              Alles
            </Button>
          </div>
        </Card>

        {/* Breakdown */}
        <Card className="p-4 mb-4">
          <h4 className="mb-3">Übersicht</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between pb-2 border-b">
              <span className="text-gray-600">Auszahlungsbetrag</span>
              <span>€{parseFloat(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pb-2 border-b text-red-600">
              <span>Bearbeitungsgebühr</span>
              <span>-€{processingFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-900">Du erhältst</span>
              <span className="text-green-600 text-lg">
                €{netAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Bank Account */}
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h5>Bankkonto</h5>
              <p className="text-sm text-gray-600">DE89 3704 0044 0532 0130 00</p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={() => alert("Bankkonto ändern - Funktion in Entwicklung")}
          >
            Bankkonto ändern
          </Button>
        </Card>

        {/* Info Alert */}
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Die Auszahlung wird innerhalb von 2-3 Werktagen auf dein hinterlegtes
            Bankkonto überwiesen. Du erhältst eine Bestätigungs-E-Mail.
          </AlertDescription>
        </Alert>

        {/* Payment Method */}
        <Card className="p-4 mb-4">
          <h5 className="mb-3">Auszahlungsmethode</h5>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border-2 border-[#8B4513] rounded-lg cursor-pointer">
              <input type="radio" name="method" defaultChecked className="w-4 h-4" />
              <CreditCard className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <h5>Banküberweisung</h5>
                <p className="text-sm text-gray-600">2-3 Werktage</p>
              </div>
            </label>
          </div>
        </Card>

        {/* Previous Payouts */}
        <Card className="p-4 mb-6">
          <h5 className="mb-3">Letzte Auszahlungen</h5>
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h5>€950.00</h5>
                <p className="text-sm text-gray-600">15. September 2025</p>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Abgeschlossen</span>
              </div>
            </div>
            <div className="flex items-center justify-between pb-3 border-b">
              <div>
                <h5>€1,120.00</h5>
                <p className="text-sm text-gray-600">15. August 2025</p>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Abgeschlossen</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h5>€890.00</h5>
                <p className="text-sm text-gray-600">15. Juli 2025</p>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Abgeschlossen</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#8B4513] hover:bg-[#5C2E0A]"
          disabled={
            isSubmitting ||
            parseFloat(amount) < minimumPayout ||
            parseFloat(amount) > availableBalance
          }
        >
          {isSubmitting ? "Wird bearbeitet..." : "Auszahlung beantragen"}
        </Button>

        <p className="text-xs text-center text-gray-600 mt-3">
          Durch Klicken auf &quot;Auszahlung beantragen&quot; bestätigst du, dass die Angaben
          korrekt sind.
        </p>
      </form>
    </div>
  );
}
