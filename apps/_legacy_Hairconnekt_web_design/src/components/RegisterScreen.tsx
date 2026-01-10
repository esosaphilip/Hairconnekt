import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    newsletter: false,
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, loading } = useAuth();
  
  // Get return URL and user type from location state
  const locState = (location && location.state) || {};
  const returnUrl = locState?.returnUrl || "/home";
  const userType = locState?.userType || "client";

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const passwordRequirements = [
    { label: "Min. 8 Zeichen", met: formData.password.length >= 8 },
    { label: "1 Großbuchstabe", met: /[A-Z]/.test(formData.password) },
    { label: "1 Zahl", met: /[0-9]/.test(formData.password) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }
    if (!formData.acceptTerms) {
      toast.error("Bitte akzeptiere die AGB");
      return;
    }
    try {
      await registerUser({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        // Backend expects enum values: CLIENT | PROVIDER | BOTH
        userType: userType === "provider" ? "PROVIDER" : "CLIENT",
      });
      toast.success("Registrierung erfolgreich");
      if (userType === "provider") {
        navigate("/provider/dashboard");
      } else {
        navigate(returnUrl);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registrierung fehlgeschlagen";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Header */}
      <div className="text-center mt-12 mb-8">
        <h1 className="text-[#8B4513] mb-2">HairConnekt</h1>
        <h3 className="mb-2">Willkommen bei HairConnekt</h3>
        <p className="text-gray-600">Erstelle dein Konto</p>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName">Vorname *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Nachname *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">E-Mail *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1"
            required
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefonnummer *</Label>
          <div className="flex gap-2 mt-1">
            <Input value="+49" className="w-16" disabled />
            <Input
              id="phone"
              type="tel"
              placeholder="151 1234 5678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="flex-1"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password">Passwort *</Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
          {formData.password && (
            <>
              <Progress value={passwordStrength()} className="mt-2 h-1" />
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {req.met ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-gray-300" />
                    )}
                    <span className={req.met ? "text-green-600" : "text-gray-400"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Passwort wiederholen *</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {formData.confirmPassword && formData.password !== formData.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">Passwörter stimmen nicht überein</p>
          )}
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, acceptTerms: checked === true })
              }
            />
            <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
              Ich akzeptiere die{" "}
              <button type="button" className="text-[#8B4513] hover:underline">
                AGB
              </button>{" "}
              und{" "}
              <button type="button" className="text-[#8B4513] hover:underline">
                Datenschutzerklärung
              </button>
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="newsletter"
              checked={formData.newsletter}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, newsletter: checked === true })
              }
            />
            <Label htmlFor="newsletter" className="text-sm text-gray-600 cursor-pointer">
              Newsletter und Angebote erhalten (optional)
            </Label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12 mt-6"
          disabled={!formData.acceptTerms || loading}
        >
          {loading ? "Wird erstellt..." : "Konto erstellen"}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Oder registrieren mit</span>
          </div>
        </div>

        {/* Social Registration */}
        <div className="space-y-3">
          <Button type="button" variant="outline" className="w-full h-12">
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

      {/* Login Link */}
      <div className="text-center py-6">
        <p className="text-gray-600">
          Bereits registriert?{" "}
          <button
            onClick={() => navigate("/login", { state: { userType, returnUrl } })}
            className="text-[#8B4513] hover:underline"
          >
            Anmelden
          </button>
        </p>
      </div>
    </div>
  );
}
