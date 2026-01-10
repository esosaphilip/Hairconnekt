import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export function SignInPrompt({ 
  message = "Um einen Termin zu buchen, musst du dich anmelden oder registrieren",
  returnUrl 
}) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login", { state: { returnUrl } });
  };

  const handleRegister = () => {
    navigate("/register", { state: { returnUrl } });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <Card className="p-6 max-w-md w-full">
        {/* Icon */}
        <div className="w-16 h-16 bg-[#8B4513]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-[#8B4513]" />
        </div>

        {/* Message */}
        <h3 className="text-center mb-2">Anmeldung erforderlich</h3>
        <p className="text-center text-gray-600 mb-6">{message}</p>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="default"
            size="lg"
            onClick={handleRegister}
            className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
          >
            Jetzt registrieren
          </Button>

          <Button
            onClick={handleLogin}
            variant="outline"
            size="lg"
            className="w-full h-12"
          >
            Ich habe bereits ein Konto
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Oder fortfahren mit</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-12"
            onClick={() => {}}
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Mit Google fortfahren
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-12 bg-black text-white hover:bg-gray-800"
            onClick={() => {}}
          >
            <span className="mr-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
            </span>
            Mit Apple fortfahren
          </Button>
        </div>

        {/* Browse as Guest */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/home")}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Als Gast weiterbrowsen
          </button>
        </div>
      </Card>
    </div>
  );
}
