import { useState, useRef, useEffect } from "react";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { api } from "@/services/http";
import { toast } from "sonner";

export function PasswordResetScreen() {
  const [step, setStep] = useState("request");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Timer for OTP resend
  useEffect(() => {
    if (step === "verify" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  // Deep link support: if token is present in URL, jump directly to reset step
  useEffect(() => {
    const token = searchParams.get("token");
    if (token && token.length >= 6) {
      const digits = token.slice(0, 6).split("");
      setOtp(digits);
      setStep("reset");
    }
  }, [searchParams]);

  const passwordStrength = () => {
    let strength = 0;
    if (newPassword.length >= 8) strength += 25;
    if (/[A-Z]/.test(newPassword)) strength += 25;
    if (/[0-9]/.test(newPassword)) strength += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 25;
    return strength;
  };

  const passwordRequirements = [
    { label: "Min. 8 Zeichen", met: newPassword.length >= 8 },
    { label: "1 Großbuchstabe", met: /[A-Z]/.test(newPassword) },
    { label: "1 Zahl", met: /[0-9]/.test(newPassword) },
  ];

  const handleSendCode = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post(`/auth/forgot-password`, { emailOrPhone });
      toast.success("Code gesendet");
      setOtp(["", "", "", "", "", ""]);
      setTimer(59);
      setCanResend(false);
      setStep("verify");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Versand fehlgeschlagen";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all filled
    if (newOtp.every((digit) => digit) && index === 5) {
      setTimeout(() => setStep("reset"), 500);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    setSending(true);
    try {
      await api.post(`/auth/forgot-password`, { emailOrPhone });
      toast.success("Code erneut gesendet");
      setTimer(59);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erneutes Senden fehlgeschlagen";
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwörter stimmen nicht überein");
      return;
    }
    const token = otp.join("");
    if (!token || token.length < 6) {
      toast.error("Bitte gültigen Code eingeben");
      return;
    }
    setResetting(true);
    try {
      await api.post(`/auth/reset-password`, { token, newPassword });
      toast.success("Passwort erfolgreich geändert");
      setStep("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Zurücksetzen fehlgeschlagen";
      toast.error(message);
    } finally {
      setResetting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col">
      {/* Back Button (except on success) */}
      {step !== "success" && (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Zurück</span>
        </button>
      )}

      {/* Logo */}
      <div className="text-center mt-6 mb-8">
        <h1 className="text-[#8B4513] mb-2">HairConnekt</h1>
        <h3 className="mb-2">Passwort zurücksetzen</h3>
        {step === "request" && (
          <p className="text-gray-600">
            Gib deine E-Mail oder Telefonnummer ein um einen Code zu erhalten
          </p>
        )}
        {step === "verify" && (
          <p className="text-gray-600">
            Wir haben einen 6-stelligen Code an {emailOrPhone} gesendet
          </p>
        )}
        {step === "reset" && (
          <p className="text-gray-600">Wähle ein neues sicheres Passwort</p>
        )}
      </div>

      <div className="flex-1">
        {/* Step 1: Request Code */}
        {step === "request" && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <Label htmlFor="emailOrPhone">E-Mail oder Telefonnummer</Label>
              <Input
                id="emailOrPhone"
                type="text"
                placeholder="max.mueller@email.com"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="mt-1"
                required
              />
            </div>

            <Button
              variant="default"
              size="lg"
              type="submit"
              className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
              disabled={sending}
            >
              {sending ? "Wird gesendet..." : "Code senden"}
            </Button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
        {step === "verify" && (
          <div className="space-y-6">
            <div>
              <h5 className="text-center mb-4">6-stelligen Code eingeben</h5>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl"
                  />
                ))}
              </div>
            </div>

            <div className="text-center space-y-2">
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  className="text-[#8B4513] hover:underline disabled:text-gray-400"
                  disabled={sending}
                >
                  {sending ? "Wird gesendet..." : "Code nicht erhalten? Erneut senden"}
                </button>
              ) : (
                <p className="text-gray-600">
                  Erneut senden in{" "}
                  <span className="text-[#8B4513]">
                    0:{timer.toString().padStart(2, "0")}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Reset Password */}
        {step === "reset" && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <Label htmlFor="newPassword">Neues Passwort</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
                required
              />
              {newPassword && (
                <>
                  <Progress value={passwordStrength()} className="mt-2 h-1" />
                  <div className="mt-2 space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-2 text-xs ${
                          req.met ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${
                            req.met ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Passwörter stimmen nicht überein
                </p>
              )}
            </div>

            <Button
              variant="default"
              size="lg"
              type="submit"
              className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
              disabled={
                resetting ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                passwordStrength() < 75
              }
            >
              {resetting ? "Wird geändert..." : "Passwort ändern"}
            </Button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === "success" && (
          <div className="text-center space-y-6">
            {/* Success Animation */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div>
              <h3 className="mb-2">Passwort erfolgreich geändert!</h3>
              <p className="text-gray-600">
                Du kannst dich jetzt mit deinem neuen Passwort anmelden
              </p>
            </div>

            <Button
              variant="default"
              size="lg"
              onClick={handleBackToLogin}
              className="w-full bg-[#8B4513] hover:bg-[#5C2E0A] h-12"
            >
              Zur Anmeldung
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
