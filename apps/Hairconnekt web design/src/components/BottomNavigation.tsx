import { Home, Search, Calendar, MessageCircle, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function BottomNavigation() {
  const location = useLocation();
  
  const navItems = [
    { path: "/home", icon: Home, label: "Startseite" },
    { path: "/search", icon: Search, label: "Suchen" },
    { path: "/appointments", icon: Calendar, label: "Termine", badge: 2 },
    { path: "/messages", icon: MessageCircle, label: "Nachrichten", badge: 3 },
    { path: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 max-w-[428px] mx-auto">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-[#8B4513] fill-current" : "text-gray-400"
                  }`}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-[#FF6B6B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-xs mt-1 transition-colors ${
                  isActive ? "text-[#8B4513]" : "text-gray-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
