import { ArrowLeft, Check, Globe } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { toast } from "sonner";

const languages = [
  { code: "de", name: "Deutsch", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
];

export function LanguageScreen() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("de");

  const handleLanguageChange = (code) => {
    setSelectedLanguage(code);
    // In a real app, this would update the app's locale
    toast.success(`Sprache wurde auf ${languages.find(l => l.code === code)?.nativeName} geändert`);
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h3>Sprache</h3>
          <div className="w-6"></div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Info */}
        <Card className="p-4 mb-4 bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="mb-1 text-blue-900">App-Sprache</h5>
              <p className="text-sm text-blue-800">
                Wähle die Sprache, in der die App angezeigt werden soll.
              </p>
            </div>
          </div>
        </Card>

        {/* Languages List */}
        <Card className="overflow-hidden">
          {languages.map((language, index) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                index !== 0 ? "border-t" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{language.flag}</span>
                <div className="text-left">
                  <h5>{language.nativeName}</h5>
                  {language.name !== language.nativeName && (
                    <p className="text-sm text-gray-500">{language.name}</p>
                  )}
                </div>
              </div>
              {selectedLanguage === language.code && (
                <Check className="w-5 h-5 text-[#8B4513]" />
              )}
            </button>
          ))}
        </Card>

        {/* Additional Info */}
        <Card className="p-4 mt-4 bg-gray-50">
          <h5 className="mb-2">Hinweis</h5>
          <p className="text-sm text-gray-600">
            Die Spracheinstellung betrifft nur die Benutzeroberfläche der App.
            Profile und Inhalte von Anbietern können in verschiedenen Sprachen
            sein.
          </p>
        </Card>
      </div>
    </div>
  );
}
