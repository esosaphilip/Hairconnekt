import { useState } from "react";
import { User, Building, Car, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Checkbox } from "../ui/checkbox";

const serviceTypes = [
  {
    id: "individual",
    icon: User,
    title: "Einzelperson / Freelancer",
    description: "Ich arbeite selbstständig",
  },
  {
    id: "salon",
    icon: Building,
    title: "Salon / Barbershop",
    description: "Ich habe ein Geschäft",
  },
  {
    id: "mobile",
    icon: Car,
    title: "Mobiler Service",
    description: "Ich komme zu meinen Kunden",
  },
];

export function ProviderTypeSelection() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 mt-4">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h3>Welchen Service bietest du an?</h3>
          <p className="text-sm text-gray-600">Mehrfachauswahl möglich</p>
        </div>
      </div>

      {/* Service Type Cards */}
      <div className="space-y-3 mb-8">
        {serviceTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedTypes.includes(type.id);

          return (
            <Card
              key={type.id}
              onClick={() => toggleType(type.id)}
              className={`p-4 cursor-pointer transition-all ${
                isSelected ? "border-2 border-[#8B4513] bg-[#8B4513]/5" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isSelected ? "bg-[#8B4513]" : "bg-gray-100"
                }`}>
                  <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-gray-600"}`} />
                </div>
                <div className="flex-1">
                  <h5 className="mb-1">{type.title}</h5>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleType(type.id)}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Continue Button */}
      <Button
        onClick={() => navigate("/provider-onboarding/registration")}
        className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
        disabled={selectedTypes.length === 0}
      >
        Weiter
      </Button>
    </div>
  );
}
