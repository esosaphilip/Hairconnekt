import { ArrowLeft, Plus, Edit, Trash2, Clock, Euro } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { toast } from "sonner";

// Mock services data
const mockServices = [
  {
    id: "1",
    name: "Box Braids - Medium Length",
    category: "Box Braids",
    price: 120,
    duration: 240,
    isActive: true,
    description: "Klassische Box Braids in mittlerer Länge",
  },
  {
    id: "2",
    name: "Knotless Braids - Long",
    category: "Knotless Braids",
    price: 180,
    duration: 300,
    isActive: true,
    description: "Schonende Knotless Braids in langer Länge",
  },
  {
    id: "3",
    name: "Cornrows - Simple Pattern",
    category: "Cornrows",
    price: 60,
    duration: 120,
    isActive: true,
    description: "Einfache Cornrows in verschiedenen Mustern",
  },
  {
    id: "4",
    name: "Senegalese Twists - Shoulder Length",
    category: "Twists",
    price: 140,
    duration: 270,
    isActive: true,
    description: "Elegante Senegalese Twists",
  },
  {
    id: "5",
    name: "Passion Twists",
    category: "Passion Twists",
    price: 150,
    duration: 240,
    isActive: false,
    description: "Moderne Passion Twists mit natürlichem Look",
  },
  {
    id: "6",
    name: "Starter Locs",
    category: "Locs",
    price: 100,
    duration: 180,
    isActive: true,
    description: "Starter Locs für natürliches Haar",
  },
];

export function ServicesManagementScreen() {
  const navigate = useNavigate();

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} Min.`;
    if (mins === 0) return `${hours} Std.`;
    return `${hours} Std. ${mins} Min.`;
  };

  const toggleServiceStatus = (id) => {
    toast.success(`Service-Status aktualisiert: ${id}`);
  };

  const handleDelete = (id) => {
    toast.success(`Service gelöscht: ${id}`);
  };

  const activeServices = mockServices.filter(s => s.isActive);
  const inactiveServices = mockServices.filter(s => !s.isActive);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h3>Services verwalten</h3>
              <p className="text-sm text-gray-600">{activeServices.length} aktive Services</p>
            </div>
          </div>
          <Button
            onClick={() => navigate("/provider/services/add")}
            className="bg-[#8B4513] hover:bg-[#5C2E0A]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Neu
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-4 bg-white border-b">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl text-[#8B4513]">{mockServices.length}</p>
            <p className="text-xs text-gray-600">Gesamt</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-green-600">{activeServices.length}</p>
            <p className="text-xs text-gray-600">Aktiv</p>
          </div>
          <div className="text-center">
            <p className="text-2xl text-gray-400">{inactiveServices.length}</p>
            <p className="text-xs text-gray-600">Inaktiv</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Active Services */}
        {activeServices.length > 0 && (
          <div>
            <h4 className="mb-3">Aktive Services</h4>
            <div className="space-y-3">
              {activeServices.map((service) => (
                <Card key={service.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm">{service.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={() => toggleServiceStatus(service.id)}
                    />
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      <span>{service.price}€</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(service.duration)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/provider/services/edit/${service.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Service löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Möchtest du &quot;{service.name}&quot; wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(service.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Inactive Services */}
        {inactiveServices.length > 0 && (
          <div>
            <h4 className="mb-3 text-gray-600">Inaktive Services</h4>
            <div className="space-y-3">
              {inactiveServices.map((service) => (
                <Card key={service.id} className="p-4 opacity-60">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm">{service.name}</h5>
                        <Badge variant="outline" className="text-xs">
                          {service.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                    <Switch
                      checked={service.isActive}
                      onCheckedChange={() => toggleServiceStatus(service.id)}
                    />
                  </div>

                  <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Euro className="w-4 h-4" />
                      <span>{service.price}€</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(service.duration)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/provider/services/edit/${service.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Service löschen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Möchtest du &quot;{service.name}&quot; wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(service.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Löschen
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {mockServices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Plus className="w-12 h-12 text-gray-400" />
            </div>
            <h4 className="mb-2">Noch keine Services</h4>
            <p className="text-gray-600 text-center mb-6">
              Füge deine ersten Services hinzu, damit Kunden dich buchen können
            </p>
            <Button
              onClick={() => navigate("/provider/services/add")}
              className="bg-[#8B4513] hover:bg-[#5C2E0A]"
            >
              Service hinzufügen
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
