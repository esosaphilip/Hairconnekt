import { ArrowLeft, Share2, Heart, MapPin, Star, Clock, CheckCircle2, MessageCircle, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { addFavorite, removeFavorite, favoriteStatus } from "@/services/favorites";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const providerData = {
  id: 1,
  name: "Aisha Mohammed",
  business: "Aisha's Braiding Studio",
  rating: 4.8,
  reviews: 234,
  address: "Westenhellweg 102-106, 44137 Dortmund",
  distance: "1.2 km",
  verified: true,
  coverImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  profileImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
  badges: ["Salon", "Mobil verfügbar", "Verifiziert"],
  stats: [
    { label: "Termine", value: "234" },
    { label: "Jahre", value: "8" },
    { label: "Response", value: "< 1 Std." },
    { label: "Empfehlung", value: "98%" },
  ],
  bio: "Willkommen bei Aisha's Braiding Studio! Mit über 8 Jahren Erfahrung im Haar-Flechten spezialisiere ich mich auf traditionelle und moderne Flechtechniken. Ich arbeite mit natürlichen Haarprodukten und lege großen Wert auf die Gesundheit Ihrer Haare.",
  specialties: ["Box Braids Expertin", "Kinderfreundlich", "Natürliche Haarpflege"],
  languages: ["Deutsch", "Englisch", "Französisch"],
  hours: [
    { day: "Montag", hours: "09:00 - 18:00" },
    { day: "Dienstag", hours: "09:00 - 18:00" },
    { day: "Mittwoch", hours: "09:00 - 18:00" },
    { day: "Donnerstag", hours: "09:00 - 20:00" },
    { day: "Freitag", hours: "09:00 - 20:00" },
    { day: "Samstag", hours: "10:00 - 16:00" },
    { day: "Sonntag", hours: "Geschlossen" },
  ],
};

const services = [
  {
    category: "Box Braids",
    items: [
      { name: "Classic Box Braids", duration: "3-4 Std.", price: "€45 - €65", description: "Traditionelle Box Braids in verschiedenen Größen" },
      { name: "Knotless Box Braids", duration: "4-5 Std.", price: "€55 - €75", description: "Schonende Knotless-Technik für natürlichen Look" },
    ],
  },
  {
    category: "Cornrows",
    items: [
      { name: "Simple Cornrows", duration: "2-3 Std.", price: "€35 - €50", description: "Klassische Cornrows in geraden Linien" },
      { name: "Design Cornrows", duration: "3-4 Std.", price: "€50 - €70", description: "Kreative Muster und Designs" },
    ],
  },
];

const portfolioImages = [
  "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "https://images.unsplash.com/photo-1733532915163-02915638c793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "https://images.unsplash.com/photo-1718931202052-2996aac5ed85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  "https://images.unsplash.com/photo-1702236240794-58dc4c6895e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
];

const reviews = [
  {
    id: 1,
    name: "Sarah M.",
    rating: 5,
    date: "vor 2 Wochen",
    text: "Aisha ist fantastisch! Meine Box Braids sehen perfekt aus und sie war super schnell. Absolut empfehlenswert!",
    verified: true,
    style: "Box Braids",
  },
  {
    id: 2,
    name: "Lisa K.",
    rating: 5,
    date: "vor 1 Monat",
    text: "Beste Braids ever! Super professionell, saubere Arbeit und sehr freundlich. Komme auf jeden Fall wieder!",
    verified: true,
    style: "Knotless Braids",
  },
];

export function ProviderProfile() {
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const { tokens } = useAuth();
  const isAuthenticated = !!tokens?.accessToken;

  // Initialize favorite status for this provider when authenticated
  useEffect(() => {
    let cancelled = false;
    async function initFav() {
      if (!isAuthenticated || !id) return;
      try {
        const res = await favoriteStatus([id]);
        if (!cancelled) setIsFavorite((res.favorites || []).includes(id));
      } catch {
        // ignore silently
      }
    }
    initFav();
    return () => { cancelled = true; };
  }, [isAuthenticated, id]);

  const onToggleFavorite = async () => {
    if (!id) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      if (next) await addFavorite(id);
      else await removeFavorite(id);
    } catch (err) {
      setIsFavorite(!next); // revert
      const msg = err instanceof Error ? err.message : "Aktion fehlgeschlagen";
      toast.error(msg);
    }
  };

  const toggleService = (serviceName) => {
    setSelectedServices(prev =>
      prev.includes(serviceName)
        ? prev.filter(s => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative">
        <ImageWithFallback
          src={providerData.coverImage}
          alt={providerData.business}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
        
        {/* Header Buttons */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleFavorite}
            className="w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-pink-500 text-pink-500" : "text-gray-700"
              }`}
            />
          </button>
        </div>

        {/* Profile Picture */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <Avatar className="w-24 h-24 border-4 border-white">
            <ImageWithFallback
              src={providerData.profileImage}
              alt={providerData.name}
              className="w-full h-full object-cover"
            />
          </Avatar>
          {providerData.verified && (
            <div className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Provider Info */}
      <div className="mt-14 px-4">
        <div className="text-center mb-4">
          <h2 className="mb-1">{providerData.business}</h2>
          <p className="text-gray-600">von {providerData.name}</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(providerData.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span>{providerData.rating}</span>
            <button className="text-gray-500">({providerData.reviews} Bewertungen)</button>
          </div>
          <p className="text-gray-600 flex items-center justify-center gap-1 mt-2">
            <MapPin className="w-4 h-4" />
            {providerData.distance} entfernt
            <button className="text-[#8B4513] ml-1">Route</button>
          </p>
        </div>

        {/* Badges */}
        <div className="flex justify-center flex-wrap gap-2 mb-4">
          {providerData.badges.map((badge, index) => (
            <Badge key={index} variant="secondary">
              {badge}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {providerData.stats.map((stat, index) => (
            <Card key={index} className="p-3 text-center">
              <div className="text-[#8B4513] mb-1">{stat.value}</div>
              <div className="text-xs text-gray-600">{stat.label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="px-4">
        <TabsList className="w-full grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Überblick</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="gallery">Galerie</TabsTrigger>
          <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="p-4">
            <h4 className="mb-2">Über mich</h4>
            <p className="text-gray-600 text-sm">{providerData.bio}</p>
          </Card>

          <Card className="p-4">
            <h4 className="mb-3">Spezialisierungen</h4>
            <div className="space-y-2">
              {providerData.specialties.map((specialty, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{specialty}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="mb-3">Sprachen</h4>
            <div className="flex flex-wrap gap-2">
              {providerData.languages.map((lang, index) => (
                <Badge key={index} variant="outline">
                  {lang}
                </Badge>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="mb-3">Öffnungszeiten</h4>
            <div className="space-y-2">
              {providerData.hours.map((schedule, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className={schedule.day === "Montag" ? "" : "text-gray-600"}>
                    {schedule.day}
                  </span>
                  <span className={schedule.hours === "Geschlossen" ? "text-gray-400" : ""}>
                    {schedule.hours}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          {services.map((category, catIndex) => (
            <Card key={catIndex} className="p-4">
              <h4 className="mb-3">{category.category}</h4>
              <div className="space-y-3">
                {category.items.map((service, serviceIndex) => (
                  <button
                    type="button"
                    key={serviceIndex}
                    className={`w-full text-left p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedServices.includes(service.name)
                        ? "border-[#8B4513] bg-[#8B4513]/5"
                        : "border-gray-200"
                    }`}
                    onClick={() => toggleService(service.name)}
                    aria-pressed={selectedServices.includes(service.name)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5>{service.name}</h5>
                      <span className="text-[#8B4513]">{service.price}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {service.duration}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="gallery">
          <div className="mb-2 flex justify-between items-center">
            <p className="text-sm text-gray-600">Galerie ({portfolioImages.length})</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {portfolioImages.map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={image}
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform cursor-pointer"
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <div className="text-4xl mb-1">{providerData.rating}</div>
                <div className="flex mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(providerData.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600">{providerData.reviews} Bewertungen</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center gap-2 text-sm">
                    <span className="w-3">{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-amber-400 h-2 rounded-full"
                        style={{ width: stars === 5 ? "80%" : "15%" }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {reviews.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex items-start gap-3 mb-2">
                <Avatar className="w-10 h-10 bg-gray-200">
                  <span>{review.name[0]}</span>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{review.name}</span>
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verifizierter Kunde
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">{review.date}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{review.text}</p>
              <Badge variant="outline" className="text-xs">
                {review.style}
              </Badge>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 max-w-[428px] mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600">ab</span>
          <span className="text-xl text-[#8B4513]">€35</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate("/messages")}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Nachricht
          </Button>
          <Button
            className="flex-1 bg-[#8B4513] hover:bg-[#5C2E0A]"
            onClick={() => navigate("/booking/1")}
          >
            Termin buchen
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
