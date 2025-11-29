import { Search, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "./ui/card";

export function AccountTypeSelection() {
  return (
    <div className="h-screen flex flex-col bg-white p-6">
      {/* Logo */}
      <div className="text-center mt-12 mb-16">
        <h1 className="text-[#8B4513] mb-2">HairConnekt</h1>
        <p className="text-gray-600">Verbinde dich mit deinem perfekten Style</p>
      </div>

      {/* Account Type Cards */}
      <div className="flex-1 flex flex-col gap-4">
        <Link to="/home" className="block" aria-label="Ich suche einen Braider">
          <Card className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-[#8B4513] active:scale-[0.98]">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#8B4513]/10 flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-[#8B4513]" />
              </div>
              <h3 className="mb-2">Ich suche einen Braider</h3>
              <p className="text-gray-600">
                Finde und buche talentierte Braider in deiner Nähe
              </p>
            </div>
          </Card>
        </Link>

        <Link to="/provider-onboarding" className="block" aria-label="Ich biete Friseur-Services an">
          <Card className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-[#8B4513] active:scale-[0.98]">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#8B4513]/10 flex items-center justify-center mb-4">
                <Briefcase className="w-10 h-10 text-[#8B4513]" />
              </div>
              <h3 className="mb-2">Ich biete Friseur-Services an</h3>
              <p className="text-gray-600">
                Erreiche mehr Kunden und verwalte deine Termine
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Skip Option */}
      <Link
        to="/home"
        className="text-center text-gray-500 py-4 hover:text-gray-700 transition-colors"
      >
        Später entscheiden
      </Link>
    </div>
  );
}
