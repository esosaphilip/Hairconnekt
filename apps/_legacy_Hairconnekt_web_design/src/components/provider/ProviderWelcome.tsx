import { Users, Calendar, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

const benefits = [
  {
    icon: Users,
    title: "Mehr Kunden erreichen",
    description: "Wachse dein Business mit neuen Kunden",
  },
  {
    icon: Calendar,
    title: "Termine einfach verwalten",
    description: "Alles an einem Ort organisiert",
  },
  {
    icon: Shield,
    title: "Sichere Zahlungen",
    description: "Garantierte Auszahlungen",
  },
  {
    icon: Zap,
    title: "Flexibles Arbeiten",
    description: "Arbeite wann und wo du willst",
  },
];

export function ProviderWelcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      {/* Logo */}
      <div className="text-center mt-12 mb-8">
        <h1 className="text-[#8B4513] mb-3">HairConnekt</h1>
        <h2 className="mb-2">Werde Teil von HairConnekt</h2>
        <p className="text-gray-600">Erreiche neue Kunden und wachse dein Business</p>
      </div>

      {/* Benefits */}
      <div className="flex-1 space-y-4 my-8">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex gap-4 p-4 rounded-lg bg-gray-50">
            <div className="w-12 h-12 rounded-full bg-[#8B4513]/10 flex items-center justify-center flex-shrink-0">
              <benefit.icon className="w-6 h-6 text-[#8B4513]" />
            </div>
            <div>
              <h4 className="mb-1">{benefit.title}</h4>
              <p className="text-sm text-gray-600">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 pb-4">
        {/* Primary action: Provider Login */}
        <Button
          onClick={() =>
            navigate("/login", {
              state: { userType: "provider", returnUrl: "/provider/dashboard" },
            })
          }
          className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-14"
        >
          Als Anbieter anmelden
        </Button>

        {/* Secondary: Provider Registration link */}
        <div className="text-center">
          <button
            onClick={() => navigate("/provider-onboarding/type")}
            className="text-gray-600 hover:text-gray-800"
          >
            Neu bei HairConnekt?{" "}
            <span className="text-[#8B4513] hover:underline">Jetzt registrieren</span>
          </button>
        </div>
      </div>
    </div>
  );
}
