import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, MapPin, Home, Briefcase, Edit2, Trash2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

const mockAddresses = [
  {
    id: "1",
    label: "Zuhause",
    street: "Musterstraße 123",
    city: "Dortmund",
    postalCode: "44139",
    state: "Nordrhein-Westfalen",
    isDefault: true,
  },
  {
    id: "2",
    label: "Arbeit",
    street: "Büroweg 45",
    city: "Dortmund",
    postalCode: "44141",
    state: "Nordrhein-Westfalen",
    isDefault: false,
  },
  {
    id: "3",
    label: "Bei Mama",
    street: "Familienstraße 7",
    city: "Bochum",
    postalCode: "44787",
    state: "Nordrhein-Westfalen",
    isDefault: false,
  },
];

const ICON_MAP = {
  Zuhause: Home,
  Arbeit: Briefcase,
  default: MapPin,
};

export function AddressManagementScreen() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState(mockAddresses);

  const handleDelete = (id) => {
    if (confirm("Möchtest du diese Adresse wirklich löschen?")) {
      setAddresses(addresses.filter((addr) => addr.id !== id));
      toast.success("Adresse gelöscht");
    }
  };

  const handleSetDefault = (id) => {
    setAddresses(
      addresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === id,
      }))
    );
    toast.success("Standardadresse geändert");
  };

  const getIcon = (label) => {
    return ICON_MAP[label] || ICON_MAP.default;
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h3>Meine Adressen</h3>
            <p className="text-sm text-gray-600">
              {addresses.length} gespeicherte Adressen
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            Gespeicherte Adressen werden bei Buchungen mit mobilem Service verwendet.
          </p>
        </Card>

        {/* Address List */}
        {addresses.map((address) => {
          const Icon = getIcon(address.label);
          return (
            <Card key={address.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-[#8B4513]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="truncate">{address.label}</h4>
                    {address.isDefault && (
                      <Badge className="bg-[#8B4513] text-white text-xs">
                        Standard
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{address.street}</p>
                  <p className="text-sm text-gray-600">
                    {address.postalCode} {address.city}
                  </p>
                  <p className="text-sm text-gray-600">{address.state}</p>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    {!address.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Als Standard
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/addresses/edit/${address.id}`)}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Bearbeiten
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Löschen
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {/* Empty State */}
        {addresses.length === 0 && (
          <Card className="p-8 text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h4 className="mb-2">Keine Adressen gespeichert</h4>
            <p className="text-gray-600 mb-4">
              Füge deine erste Adresse hinzu
            </p>
            <Button
              onClick={() => navigate("/addresses/add")}
              className="bg-[#8B4513] hover:bg-[#5C2E0A]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adresse hinzufügen
            </Button>
          </Card>
        )}
      </div>

      {/* FAB */}
      {addresses.length > 0 && (
        <button
          onClick={() => navigate("/addresses/add")}
          className="fixed bottom-24 right-4 w-14 h-14 bg-[#8B4513] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#5C2E0A] transition-colors"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
