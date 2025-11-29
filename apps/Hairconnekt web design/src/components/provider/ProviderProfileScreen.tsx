import {
  ArrowLeft,
  Camera,
  Star,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Edit2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";

export function ProviderProfileScreen() {
  const navigate = useNavigate();

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Mein Profil</h3>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => alert("Profil bearbeiten - Funktion in Entwicklung")}
          >
            <Edit2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-4 py-4">
        <Card className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <Avatar className="w-24 h-24">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=200"
                  alt="Aisha Mensah"
                  className="w-full h-full object-cover"
                />
              </Avatar>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#8B4513] text-white rounded-full flex items-center justify-center shadow-lg">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="mb-1">Aisha Mensah</h3>
            <p className="text-gray-600 mb-2">Aisha&apos;s Braiding Studio</p>
            
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-amber-400 text-white">Pro</Badge>
              <Badge variant="outline">Verifiziert</Badge>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Geöffnet
              </Badge>
            </div>

            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.8 (234 Bewertungen)</span>
            </div>

            <p className="text-sm text-gray-600">
              Mitglied seit Januar 2023 · 847 Termine
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>Kantstraße 42, 10625 Berlin</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>+49 30 1234567</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-5 h-5 text-gray-400" />
              <span>aisha@braiding-studio.de</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>Mo-Sa: 9:00 - 20:00, So: Geschlossen</span>
            </div>
          </div>

          <Button
            className="w-full mt-4 bg-[#8B4513] hover:bg-[#5C2E0A]"
            onClick={() => navigate("/provider/more/public-profile")}
          >
            Öffentliches Profil anzeigen
          </Button>
        </Card>

        {/* Bio Section */}
        <Card className="p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4>Über mich</h4>
            <Button size="sm" variant="ghost">
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-700">
            Hallo! Ich bin Aisha und habe über 10 Jahre Erfahrung mit afrikanischen
            Flechtfrisuren. Meine Leidenschaft ist es, jedem Kunden einen individuellen
            Look zu kreieren, der perfekt zu ihm passt. Ich verwende nur hochwertige
            Produkte und lege großen Wert auf die Gesundheit deiner Haare.
          </p>
        </Card>

        {/* Specialties */}
        <Card className="p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4>Spezialisierungen</h4>
            <Button size="sm" variant="ghost">
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Box Braids</Badge>
            <Badge variant="secondary">Cornrows</Badge>
            <Badge variant="secondary">Senegalese Twists</Badge>
            <Badge variant="secondary">Knotless Braids</Badge>
            <Badge variant="secondary">Passion Twists</Badge>
            <Badge variant="secondary">Faux Locs</Badge>
          </div>
        </Card>

        {/* Languages */}
        <Card className="p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4>Sprachen</h4>
            <Button size="sm" variant="ghost">
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Deutsch</Badge>
            <Badge variant="outline">Englisch</Badge>
            <Badge variant="outline">Französisch</Badge>
            <Badge variant="outline">Twi</Badge>
          </div>
        </Card>

        {/* Social Media */}
        <Card className="p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4>Social Media</h4>
            <Button size="sm" variant="ghost">
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Globe className="w-5 h-5 text-gray-400" />
              <span>www.aishas-braiding.de</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Instagram className="w-5 h-5 text-gray-400" />
              <span>@aishas_braiding_studio</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Facebook className="w-5 h-5 text-gray-400" />
              <span>Aisha&apos;s Braiding Studio Berlin</span>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="p-4 mt-4">
          <h4 className="mb-3">Statistiken</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl text-[#8B4513] mb-1">847</div>
              <p className="text-sm text-gray-600">Termine</p>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#8B4513] mb-1">234</div>
              <p className="text-sm text-gray-600">Bewertungen</p>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#8B4513] mb-1">98%</div>
              <p className="text-sm text-gray-600">Annahmerate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl text-[#8B4513] mb-1">2 Std.</div>
              <p className="text-sm text-gray-600">Ø Reaktionszeit</p>
            </div>
          </div>
        </Card>

        {/* Certifications */}
        <Card className="p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4>Zertifikate & Ausbildungen</h4>
            <Button size="sm" variant="ghost">
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="text-sm">
              <h5>Professionelle Flechtfrisuren Ausbildung</h5>
              <p className="text-gray-600">Braiding Academy Berlin, 2019</p>
            </div>
            <div className="text-sm">
              <h5>Natürliche Haarpflege Spezialist</h5>
              <p className="text-gray-600">Natural Hair Institute, 2020</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
