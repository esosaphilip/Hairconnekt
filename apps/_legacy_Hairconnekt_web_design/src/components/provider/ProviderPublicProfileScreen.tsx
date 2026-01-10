import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  Heart,
  Share2,
  MessageCircle,
  Check,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const services = [
  {
    id: 1,
    name: "Box Braids",
    duration: "3-4 Std.",
    price: "€85 - €95",
    popular: true,
  },
  {
    id: 2,
    name: "Knotless Braids",
    duration: "4-5 Std.",
    price: "€95 - €110",
    popular: true,
  },
  {
    id: 3,
    name: "Cornrows",
    duration: "2-3 Std.",
    price: "€55 - €75",
    popular: false,
  },
  {
    id: 4,
    name: "Senegalese Twists",
    duration: "4-5 Std.",
    price: "€95 - €115",
    popular: false,
  },
];

const portfolio = [
  "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400",
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400",
  "https://images.unsplash.com/photo-1595475207225-428b62bda831?w=400",
  "https://images.unsplash.com/photo-1605980413361-8f8b5630a0a7?w=400",
];

const reviews = [
  {
    id: 1,
    client: "Sarah M.",
    rating: 5,
    text: "Fantastisch! Meine Box Braids sehen perfekt aus und Aisha war super professionell.",
    date: "vor 2 Tagen",
    service: "Box Braids",
  },
  {
    id: 2,
    client: "Maria K.",
    rating: 5,
    text: "Sehr professionell und freundlich. Komme definitiv wieder!",
    date: "vor 5 Tagen",
    service: "Cornrows",
  },
];

export function ProviderPublicProfileScreen() {
  const navigate = useNavigate();

  return (
    <div className="pb-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Öffentliches Profil</h3>
          <Button size="sm" variant="ghost" onClick={() => alert("Link kopiert!")}>
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          So sehen dich potenzielle Kunden
        </p>
      </div>

      {/* Profile Header */}
      <div className="bg-white px-4 py-6">
        <div className="flex gap-4 mb-4">
          <Avatar className="w-20 h-20">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=200"
              alt="Aisha Mensah"
              className="w-full h-full object-cover"
            />
          </Avatar>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3>Aisha&apos;s Braiding Studio</h3>
                <p className="text-sm text-gray-600">von Aisha Mensah</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-amber-400 text-white">Pro</Badge>
              <Badge variant="outline">Verifiziert</Badge>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.8</span>
              <span className="text-gray-600">(234 Bewertungen)</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Kantstraße 42, 10625 Berlin (2.3 km)</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-green-600">Geöffnet · Schließt um 20:00</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0A]">
            Jetzt buchen
          </Button>
          <Button variant="outline" size="icon">
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white mt-2">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger
              value="about"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B4513] data-[state=active]:bg-transparent"
            >
              Über
            </TabsTrigger>
            <TabsTrigger
              value="services"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B4513] data-[state=active]:bg-transparent"
            >
              Services
            </TabsTrigger>
            <TabsTrigger
              value="portfolio"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B4513] data-[state=active]:bg-transparent"
            >
              Portfolio
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B4513] data-[state=active]:bg-transparent"
            >
              Bewertungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about" className="p-4">
            <Card className="p-4 mb-4">
              <h4 className="mb-2">Über uns</h4>
              <p className="text-sm text-gray-700">
                Hallo! Ich bin Aisha und habe über 10 Jahre Erfahrung mit afrikanischen
                Flechtfrisuren. Meine Leidenschaft ist es, jedem Kunden einen
                individuellen Look zu kreieren, der perfekt zu ihm passt.
              </p>
            </Card>

            <Card className="p-4 mb-4">
              <h4 className="mb-2">Spezialisierungen</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Box Braids</Badge>
                <Badge variant="secondary">Cornrows</Badge>
                <Badge variant="secondary">Senegalese Twists</Badge>
                <Badge variant="secondary">Knotless Braids</Badge>
                <Badge variant="secondary">Passion Twists</Badge>
              </div>
            </Card>

            <Card className="p-4 mb-4">
              <h4 className="mb-2">Was uns auszeichnet</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Über 10 Jahre Erfahrung</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Nur hochwertige Produkte</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Entspannte Atmosphäre</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Kostenlose Nachbesserung innerhalb 7 Tagen</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="mb-2">Öffnungszeiten</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montag</span>
                  <span>9:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dienstag</span>
                  <span>9:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mittwoch</span>
                  <span>9:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Donnerstag</span>
                  <span>9:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Freitag</span>
                  <span>9:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Samstag</span>
                  <span>9:00 - 20:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sonntag</span>
                  <span className="text-red-600">Geschlossen</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="p-4">
            <div className="space-y-3">
              {services.map((service) => (
                <Card key={service.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h5>{service.name}</h5>
                        {service.popular && (
                          <Badge className="bg-[#FF6B6B] text-white text-xs">
                            Beliebt
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{service.duration}</p>
                    </div>
                    <span className="text-[#8B4513]">{service.price}</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-[#8B4513] hover:bg-[#5C2E0A]"
                  >
                    Buchen
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {portfolio.map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="p-4">
            <div className="space-y-3">
              {reviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5>{review.client}</h5>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs mb-2">
                    {review.service}
                  </Badge>
                  <p className="text-sm text-gray-700">{review.text}</p>
                </Card>
              ))}
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/provider/reviews")}
              >
                Alle Bewertungen anzeigen
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
