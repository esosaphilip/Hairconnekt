import { ArrowLeft, Calendar, Clock, MapPin, Star, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";

const bookings = {
  completed: [
    {
      id: 1,
      providerName: "Aisha Mohammed",
      providerBusiness: "Aisha's Braiding Studio",
      providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      service: "Box Braids",
      date: "15. Okt 2025",
      time: "14:00 Uhr",
      duration: "4 Std.",
      price: "€95",
      location: "Dortmund",
      status: "completed",
      reviewed: true,
      rating: 5,
    },
    {
      id: 2,
      providerName: "Fatima Hassan",
      providerBusiness: "Natural Hair Lounge",
      providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      service: "Cornrows",
      date: "8. Okt 2025",
      time: "10:00 Uhr",
      duration: "3 Std.",
      price: "€65",
      location: "Dortmund",
      status: "completed",
      reviewed: true,
      rating: 5,
    },
    {
      id: 3,
      providerName: "Lina Okafor",
      providerBusiness: null,
      providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      service: "Senegalese Twists",
      date: "1. Okt 2025",
      time: "15:00 Uhr",
      duration: "5 Std.",
      price: "€110",
      location: "Dortmund",
      status: "completed",
      reviewed: true,
      rating: 4,
    },
  ],
  cancelled: [
    {
      id: 4,
      providerName: "Sarah Williams",
      providerBusiness: "Braids & Beauty",
      providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      service: "Knotless Braids",
      date: "20. Sep 2025",
      time: "13:00 Uhr",
      duration: "4 Std.",
      price: "€105",
      location: "Dortmund",
      status: "cancelled",
      cancelledBy: "client",
      cancelReason: "Terminkonflikt",
    },
  ],
};

export function BookingHistoryScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("completed");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Abgeschlossen</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500 text-white">Storniert</Badge>;
      default:
        return null;
    }
  };

  const BookingCard = ({ booking }: { booking: any }) => (
    <Card
      className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
      role="button"
      tabIndex={0}
      aria-label={`Buchung ${booking.providerName} öffnen`}
      onClick={() => navigate(`/appointment/${booking.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          navigate(`/appointment/${booking.id}`);
        }
      }}
    >
      <div className="flex gap-3 mb-3">
        <Avatar className="w-16 h-16 flex-shrink-0">
          <ImageWithFallback
            src={booking.providerImage}
            alt={booking.providerName}
            className="w-full h-full object-cover"
          />
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h5 className="truncate">{booking.providerName}</h5>
              {booking.providerBusiness && (
                <p className="text-sm text-gray-500 truncate">
                  {booking.providerBusiness}
                </p>
              )}
            </div>
            {getStatusBadge(booking.status)}
          </div>
          <Badge variant="secondary" className="mt-1">
            {booking.service}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{booking.date}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            {booking.time} • {booking.duration}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{booking.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t">
        <div className="text-[#8B4513]">{booking.price}</div>
        {booking.status === "completed" && booking.reviewed && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-sm">Bewertet ({booking.rating})</span>
          </div>
        )}
        {booking.status === "cancelled" && (
          <div className="text-sm text-gray-500">
            {booking.cancelledBy === "client" ? "Von dir storniert" : "Vom Anbieter storniert"}
          </div>
        )}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </Card>
  );

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Buchungshistorie</h3>
          <div className="w-6"></div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white px-4 py-6 mt-2">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl text-[#8B4513] mb-1">
              {bookings.completed.length}
            </div>
            <div className="text-xs text-gray-600">Abgeschlossen</div>
          </div>
          <div>
            <div className="text-2xl text-[#8B4513] mb-1">
              {bookings.cancelled.length}
            </div>
            <div className="text-xs text-gray-600">Storniert</div>
          </div>
          <div>
            <div className="text-2xl text-[#8B4513] mb-1">
              {bookings.completed.length + bookings.cancelled.length}
            </div>
            <div className="text-xs text-gray-600">Gesamt</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="completed">
              Abgeschlossen ({bookings.completed.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Storniert ({bookings.cancelled.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="completed" className="space-y-3 mt-0">
            {bookings.completed.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-3 mt-0">
            {bookings.cancelled.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
