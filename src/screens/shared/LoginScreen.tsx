// @ts-nocheck
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  
  // Get return URL and user type from location state
  const locationState = (location && location.state) || {};
  const returnUrl = locationState?.returnUrl || "/home";
  const userType = locationState?.userType || "client";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Erfolgreich angemeldet");
      if (userType === "provider") {
        navigate("/provider/dashboard");
      } else {
        navigate(returnUrl);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Anmeldung fehlgeschlagen";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      {/* Logo */}
      <div className="text-center mt-12 mb-8">
        <h1 className="text-[#8B4513] mb-2">HairConnekt</h1>
        <h3 className="mb-2">Willkommen zurück!</h3>
        <p className="text-gray-600">Melde dich an um fortzufahren</p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="flex-1 space-y-4">
        <div>
          <Label htmlFor="email">E-Mail oder Telefonnummer</Label>
          <Input
            id="email"
            type="text"
            placeholder="max.mueller@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Passwort</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex justify-end mt-2">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-[#8B4513] hover:underline"
            >
              Passwort vergessen?
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
            Angemeldet bleiben
          </Label>
        </div>

        <Button type="submit" className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12" disabled={loading}>
          {loading ? "Wird angemeldet..." : "Anmelden"}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Oder anmelden mit</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
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
      </form>

      {/* Sign Up Link */}
      <div className="text-center py-4">
        <p className="text-gray-600">
          Noch kein Konto?{" "}
          <button
            onClick={() => navigate("/register", { state: { userType, returnUrl } })}
            className="text-[#8B4513] hover:underline"
          >
            Jetzt registrieren
          </button>
        </p>
      </div>
    </div>
  );
}
