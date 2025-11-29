import { ArrowLeft, Clock, MapPin, Phone, MessageCircle, Navigation, Star, MoreVertical, Ban, Edit } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { useState } from "react";
import { toast } from "sonner";

// Mock appointment data
const mockAppointments: Record<string, {
  id: string;
  status: "upcoming" | "completed" | "cancelled";
  provider: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    address: string;
    phone: string;
  };
  service: {
    name: string;
    duration: string;
    price: string;
  };
  date: string;
  time: string;
  bookingId: string;
  notes?: string;
  cancellationPolicy?: string;
}> = {
  "1": {
    id: "1",
    status: "upcoming",
    provider: {
      id: "1",
      name: "Sarah Mueller",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      rating: 4.9,
      address: "Friedrichstraße 123, 10117 Berlin",
      phone: "+49 30 123 456",
    },
    service: {
      name: "Knotless Box Braids",
      duration: "4-5 Std.",
      price: "180,00 €",
    },
    date: "29. Oktober 2025",
    time: "14:00",
    bookingId: "HC-2025-10-0001",
    notes: "Bitte eigene Extensions mitbringen (Farbe: 1B)",
    cancellationPolicy: "Kostenlose Stornierung bis 24 Stunden vor dem Termin",
  },
  "2": {
    id: "2",
    status: "completed",
    provider: {
      id: "2",
      name: "Marcus Johnson",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      rating: 4.8,
      address: "Kurfürstendamm 45, 10719 Berlin",
      phone: "+49 30 789 012",
    },
    service: {
      name: "Cornrows with Extensions",
      duration: "3 Std.",
      price: "120,00 €",
    },
    date: "15. Oktober 2025",
    time: "10:00",
    bookingId: "HC-2025-10-0002",
  },
};

export function AppointmentDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const appointment = mockAppointments[id || "1"];

  if (!appointment) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <h3 className="mb-2">Termin nicht gefunden</h3>
          <Button onClick={() => navigate("/appointments")}>Zurück zu Terminen</Button>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    toast.success("Termin wurde storniert");
    setShowCancelDialog(false);
    navigate("/appointments");
  };

  const handleReschedule = () => {
    toast.info("Umbuchung kommt bald");
  };

  const handleGetDirections = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(appointment.provider.address)}`, "_blank");
  };

  const handleLeaveReview = () => {
    toast.info("Bewertungsfunktion kommt bald");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-green-100 text-green-700">Bevorstehend</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-700">Abgeschlossen</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700">Storniert</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/appointments")}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h3>Termindetails</h3>
              <p className="text-xs text-gray-500">{appointment.bookingId}</p>
            </div>
          </div>
          {appointment.status === "upcoming" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleReschedule}>
                  <Edit className="w-4 h-4 mr-2" />
                  Termin verschieben
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-red-600">
                  <Ban className="w-4 h-4 mr-2" />
                  Termin stornieren
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="flex justify-center">
          {getStatusBadge(appointment.status)}
        </div>

        {/* Date & Time */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-[#8B4513]/10 rounded-2xl flex flex-col items-center justify-center">
              <p className="text-2xl text-[#8B4513]">29</p>
              <p className="text-xs text-gray-600">OKT</p>
            </div>
            <div>
              <h4>{appointment.date}</h4>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Clock className="w-4 h-4" />
                <p className="text-sm">{appointment.time} Uhr</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Provider Info */}
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-16 h-16">
              <img src={appointment.provider.avatar} alt={appointment.provider.name} className="object-cover" />
            </Avatar>
            <div className="flex-1">
              <h4 className="mb-1">{appointment.provider.name}</h4>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{appointment.provider.rating}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/provider/${appointment.provider.id}`)}
            >
              Profil
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-gray-600">{appointment.provider.address}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleGetDirections}>
                <Navigation className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <a href={`tel:${appointment.provider.phone}`} className="text-sm text-[#8B4513] hover:underline">
                {appointment.provider.phone}
              </a>
            </div>
          </div>
        </Card>

        {/* Service Details */}
        <Card className="p-4">
          <h5 className="mb-3">Service-Details</h5>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Service</span>
              <span>{appointment.service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Dauer</span>
              <span>{appointment.service.duration}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Gesamtpreis</span>
              <span className="text-[#8B4513]">{appointment.service.price}</span>
            </div>
          </div>
        </Card>

        {/* Notes */}
        {appointment.notes && (
          <Card className="p-4 bg-amber-50 border-amber-200">
            <h5 className="mb-2">Hinweise</h5>
            <p className="text-sm text-gray-700">{appointment.notes}</p>
          </Card>
        )}

        {/* Cancellation Policy */}
        {appointment.status === "upcoming" && appointment.cancellationPolicy && (
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h5 className="mb-2">Stornierungsbedingungen</h5>
            <p className="text-sm text-gray-700">{appointment.cancellationPolicy}</p>
          </Card>
        )}

        {/* Action Buttons */}
        {appointment.status === "upcoming" && (
          <div className="space-y-3 pt-2">
            <Button
              onClick={() => navigate(`/chat/${appointment.provider.id}`)}
              className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Nachricht senden
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={handleGetDirections} className="h-12">
                <Navigation className="w-5 h-5 mr-2" />
                Route
              </Button>
              <Button variant="outline" onClick={handleReschedule} className="h-12">
                <Edit className="w-5 h-5 mr-2" />
                Verschieben
              </Button>
            </div>
          </div>
        )}

        {appointment.status === "completed" && (
          <Button
            onClick={handleLeaveReview}
            className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
          >
            <Star className="w-5 h-5 mr-2" />
            Bewertung abgeben
          </Button>
        )}
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Termin stornieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du diesen Termin wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.
              {appointment.cancellationPolicy && (
                <p className="mt-2 text-sm">{appointment.cancellationPolicy}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zurück</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">
              Ja, stornieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
