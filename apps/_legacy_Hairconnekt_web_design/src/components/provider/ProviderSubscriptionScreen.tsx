import {
  ArrowLeft,
  Check,
  Crown,
  CreditCard,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: 0,
    period: "Kostenlos",
    features: [
      "Bis zu 10 Termine/Monat",
      "Basisprofil",
      "Online-Buchungen",
      "E-Mail-Support",
      "15% Servicegebühr",
    ],
    limitations: [
      "Keine Portfolio-Galerie",
      "Keine Statistiken",
      "Keine Gutschein-Funktion",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29.99,
    period: "/Monat",
    popular: true,
    features: [
      "Unbegrenzte Termine",
      "Erweitertes Profil",
      "Portfolio-Galerie",
      "Statistiken & Berichte",
      "Gutschein-Funktion",
      "Prioritäts-Support",
      "10% Servicegebühr",
      "Hervorgehobenes Profil",
    ],
    limitations: [],
  },
  {
    id: "premium",
    name: "Premium",
    price: 49.99,
    period: "/Monat",
    features: [
      "Alle Pro-Features",
      "Nur 8% Servicegebühr",
      "Premium-Badge",
      "Top-Platzierung in Suche",
      "Werbe-Tools",
      "24/7 Priority Support",
      "Erweiterte Analysen",
      "Marketing-Unterstützung",
    ],
    limitations: [],
  },
];

const currentPlan = "pro";

export function ProviderSubscriptionScreen() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Abonnement & Gebühren</h3>
          <div className="w-6" />
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="px-4 py-4">
        <Card className="p-5 bg-gradient-to-br from-[#8B4513] to-[#5C2E0A] text-white mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-5 h-5" />
            <span className="text-sm opacity-90">Aktueller Plan</span>
          </div>
          <h2 className="mb-1">Pro</h2>
          <p className="text-sm opacity-90 mb-4">Verlängert sich am 15. November 2025</p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-xs opacity-75 mb-1">Nächste Zahlung</p>
              <h4>€29.99</h4>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <p className="text-xs opacity-75 mb-1">Servicegebühr</p>
              <h4>10%</h4>
            </div>
          </div>

          <Button
            className="w-full bg-white text-[#8B4513] hover:bg-gray-100"
            onClick={() => alert("Zahlungsmethode verwalten")}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Zahlungsmethode verwalten
          </Button>
        </Card>

        {/* This Month's Stats */}
        <Card className="p-4 mb-6">
          <h4 className="mb-3">Dieser Monat</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Buchungen</span>
              <span>52 Termine</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Brutto-Umsatz</span>
              <span>€4,100</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b text-red-600">
              <span className="text-sm">Servicegebühren (10%)</span>
              <span>-€410</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b text-red-600">
              <span className="text-sm">Abonnement</span>
              <span>-€29.99</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-900">Deine Einnahmen</span>
              <span className="text-green-600 text-lg">€3,660.01</span>
            </div>
          </div>
        </Card>

        {/* Plans */}
        <div className="mb-4">
          <h4 className="mb-3">Verfügbare Pläne</h4>
          <div className="space-y-4">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-4 ${
                  currentPlan === plan.id ? "border-2 border-[#8B4513]" : ""
                } ${plan.popular ? "relative" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#FF6B6B] text-white">
                      Beliebteste Wahl
                    </Badge>
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4>{plan.name}</h4>
                      {currentPlan === plan.id && (
                        <Badge className="bg-green-500 text-white text-xs">
                          Aktiv
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl text-[#8B4513]">
                        €{plan.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">{plan.period}</span>
                    </div>
                  </div>
                  {plan.id === "pro" && <Crown className="w-6 h-6 text-amber-400" />}
                  {plan.id === "premium" && <Star className="w-6 h-6 text-purple-500" />}
                </div>

                <div className="space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {currentPlan === plan.id ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      confirm("Möchtest du wirklich kündigen?") &&
                      alert("Kündigungsprozess - Funktion in Entwicklung")
                    }
                  >
                    Plan kündigen
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-[#8B4513] hover:bg-[#5C2E0A]"
                    onClick={() =>
                      alert(`Upgrade auf ${plan.name} - Funktion in Entwicklung`)
                    }
                  >
                    {plan.price > 0 ? "Upgrade" : "Downgrade"}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <Card className="p-4 mb-4">
          <h4 className="mb-3">Vorteile eines Upgrades</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h5>Mehr Sichtbarkeit</h5>
                <p className="text-sm text-gray-600">
                  Erreiche mehr Kunden durch bessere Platzierung in Suchergebnissen
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h5>Mehr Buchungen</h5>
                <p className="text-sm text-gray-600">
                  Profis erhalten durchschnittlich 40% mehr Buchungen
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h5>Bessere Tools</h5>
                <p className="text-sm text-gray-600">
                  Nutze erweiterte Funktionen für besseres Business-Management
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h5>Niedrigere Gebühren</h5>
                <p className="text-sm text-gray-600">
                  Spare bei jeder Buchung durch reduzierte Servicegebühren
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment History */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4>Zahlungshistorie</h4>
            <button className="text-sm text-[#8B4513] hover:underline">
              Alle anzeigen
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <h5>Pro Abonnement</h5>
                <p className="text-sm text-gray-600">15. Oktober 2025</p>
              </div>
              <span className="text-green-600">€29.99</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <div>
                <h5>Pro Abonnement</h5>
                <p className="text-sm text-gray-600">15. September 2025</p>
              </div>
              <span className="text-green-600">€29.99</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h5>Pro Abonnement</h5>
                <p className="text-sm text-gray-600">15. August 2025</p>
              </div>
              <span className="text-green-600">€29.99</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
