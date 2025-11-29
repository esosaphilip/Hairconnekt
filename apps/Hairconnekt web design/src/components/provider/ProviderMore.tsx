import {
  User,
  Eye,
  DollarSign,
  BarChart,
  Gift,
  CreditCard,
  Star,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Camera,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { useAuth } from "@/contexts/AuthContext";

const menuSections = [
  {
    title: "Business Management",
    items: [
      {
        icon: User,
        label: "Mein Profil",
        path: "/provider/more/profile",
        badge: null,
      },
      {
        icon: Eye,
        label: "Öffentliches Profil anzeigen",
        path: "/provider/more/public-profile",
        badge: null,
      },
      {
        icon: DollarSign,
        label: "Services & Preise",
        path: "/provider/services",
        badge: "12",
      },
      {
        icon: Camera,
        label: "Portfolio verwalten",
        path: "/provider/portfolio",
        badge: "42",
      },
    ],
  },
  {
    title: "Finanzen",
    items: [
      {
        icon: DollarSign,
        label: "Einnahmen & Auszahlungen",
        path: "/provider/earnings",
        badge: "€1,245",
      },
      {
        icon: BarChart,
        label: "Statistiken & Berichte",
        path: "/provider/more/analytics",
        badge: null,
      },
      {
        icon: Gift,
        label: "Gutscheine & Angebote",
        path: "/provider/more/vouchers",
        badge: "3",
      },
      {
        icon: CreditCard,
        label: "Abonnement & Gebühren",
        path: "/provider/more/subscription",
        badge: "Pro",
      },
    ],
  },
  {
    title: "Feedback",
    items: [
      {
        icon: Star,
        label: "Bewertungen",
        path: "/provider/reviews",
        badge: "4.8 ★",
      },
    ],
  },
  {
    title: "Einstellungen",
    items: [
      {
        icon: Settings,
        label: "Einstellungen",
        path: "/provider/more/settings",
        badge: null,
      },
      {
        icon: HelpCircle,
        label: "Hilfe & Support",
        path: "/provider/more/help",
        badge: null,
      },
    ],
  },
];

export function ProviderMore() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header with Profile */}
      <div className="bg-white px-4 pt-6 pb-4">
        <h3 className="mb-4">Mehr</h3>

        {/* Profile Card */}
        <Link
          to="/provider/more/profile"
          className="block focus:outline-none focus:ring-2 focus:ring-[#8B4513] rounded-lg"
          aria-label="Profil öffnen"
        >
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <Avatar className="w-16 h-16">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?w=100"
                  alt="Aisha Mensah"
                  className="w-full h-full object-cover"
                />
              </Avatar>
              <div className="flex-1">
                <h4>Aisha Mensah</h4>
                <p className="text-sm text-gray-600">Aisha&apos;s Braiding Studio</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="bg-amber-400 text-white text-xs">Pro</Badge>
                  <Badge variant="outline" className="text-xs">Verifiziert</Badge>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Menu Sections */}
      <div className="px-4 py-4 space-y-6">
        {menuSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h5 className="mb-3 text-gray-500 uppercase text-xs tracking-wider">
              {section.title}
            </h5>
            <Card className="divide-y">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={() => navigate(item.path)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
            </Card>
          </div>
        ))}

        {/* Logout */}
        <Card>
          <button
            onClick={() => {
              if (confirm("Möchtest du dich wirklich abmelden?")) {
                logout();
                navigate("/");
              }
            }}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-red-600"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <span className="flex-1 text-left">Abmelden</span>
          </button>
        </Card>

        {/* App Version */}
        <div className="text-center text-xs text-gray-500 py-4">
          <p>HairConnekt Provider v1.0.0</p>
          <p className="mt-1">© 2025 HairConnekt GmbH</p>
        </div>
      </div>
    </div>
  );
}
