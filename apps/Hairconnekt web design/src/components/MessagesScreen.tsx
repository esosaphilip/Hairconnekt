import { Search, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { useAuth } from "@/contexts/AuthContext";

export function MessagesScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { user, tokens } = useAuth();
  const isVerified = !!tokens?.accessToken && !!(user?.emailVerified || user?.phoneVerified);

  if (!isVerified) {
    return (
      <div className="pb-20 bg-gray-50 min-h-screen">
        <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
          <h2 className="mb-4">Nachrichten</h2>
        </div>
        <div className="p-4">
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h5 className="mb-1">Verifizierung erforderlich</h5>
                <p className="text-sm text-amber-900">
                  Bitte verifiziere deine E-Mail oder Telefonnummer, um Nachrichten zu verwenden.
                </p>
                <div className="mt-3">
                  <button
                    onClick={() => navigate('/verify')}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
                  >
                    Jetzt verifizieren
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      <div className="bg-white px-4 pt-6 pb-4 sticky top-0 z-10 shadow-sm">
        <h2 className="mb-4">Nachrichten</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Suche nach Namen..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="p-4">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="mb-2">Keine Unterhaltungen</h4>
          <p className="text-gray-500">
            Chats werden hier erscheinen, sobald unsere Messaging-Funktion live ist.
          </p>
        </div>
      </div>
    </div>
  );
}
