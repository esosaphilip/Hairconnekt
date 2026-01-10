import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";
import { toast } from "sonner";
import { api } from "@/services/http";

export function VerificationScreen() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  const needsEmail = !!user?.email && !user?.emailVerified;
  const needsPhone = !!user?.phone && !user?.phoneVerified;
  const allVerified = user?.emailVerified && (user?.phoneVerified || !user?.phone);

  const canSubmitEmail = useMemo(() => needsEmail && emailCode.length >= 6, [needsEmail, emailCode]);
  const canSubmitPhone = useMemo(() => needsPhone && phoneCode.length >= 6, [needsPhone, phoneCode]);

  const handleVerifyEmail = async () => {
    if (!user?.email) return;
    setLoadingEmail(true);
    try {
      await api.post("/auth/verify-email", { email: user.email, code: emailCode });
      updateUser({ emailVerified: true });
      toast.success("E-Mail erfolgreich verifiziert");
      setEmailCode("");
    } catch (e) {
      toast.error(e?.message || "Verifizierung fehlgeschlagen");
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (!user?.phone) return;
    setLoadingPhone(true);
    try {
      await api.post("/auth/verify-phone", { phone: user.phone, code: phoneCode });
      updateUser({ phoneVerified: true });
      toast.success("Telefonnummer erfolgreich verifiziert");
      setPhoneCode("");
    } catch (e) {
      toast.error(e?.message || "Verifizierung fehlgeschlagen");
    } finally {
      setLoadingPhone(false);
    }
  };

  // Cooldown timers
  useEffect(() => {
    if (emailCooldown <= 0) return; const id = setInterval(() => setEmailCooldown((c) => Math.max(0, c - 1)), 1000); return () => clearInterval(id);
  }, [emailCooldown]);
  useEffect(() => {
    if (phoneCooldown <= 0) return; const id = setInterval(() => setPhoneCooldown((c) => Math.max(0, c - 1)), 1000); return () => clearInterval(id);
  }, [phoneCooldown]);

  const handleResendEmail = async () => {
    if (!user?.email || emailCooldown > 0) return;
    setLoadingEmail(true);
    try {
      await api.post("/auth/resend-verification", { email: user.email, channel: "email" });
      toast.success("Code erneut gesendet an deine E-Mail");
      setEmailCooldown(60);
    } catch (e) {
      toast.error(e?.message || "Erneutes Senden fehlgeschlagen");
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleResendPhone = async () => {
    if (!user?.phone || phoneCooldown > 0) return;
    setLoadingPhone(true);
    try {
      await api.post("/auth/resend-verification", { phone: user.phone, channel: "phone" });
      toast.success("Code erneut gesendet an deine Telefonnummer");
      setPhoneCooldown(60);
    } catch (e) {
      toast.error(e?.message || "Erneutes Senden fehlgeschlagen");
    } finally {
      setLoadingPhone(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3>Verifizierung</h3>
        <Button variant="ghost" onClick={() => navigate(-1)}>Zurück</Button>
      </div>

      {allVerified ? (
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-green-600" />
            <div>
              <h4>Alles verifiziert</h4>
              <p className="text-sm text-gray-600">Dein Konto ist vollständig verifiziert.</p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {needsEmail && (
            <Card className="p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-gray-700" />
                <h4>E-Mail verifizieren</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Bitte gib den 6-stelligen Code ein, der an {user?.email} gesendet wurde.</p>
              <Input value={user?.email || ""} readOnly className="mb-3" />
              <InputOTP maxLength={6} value={emailCode} onChange={setEmailCode} containerClassName="mb-4">
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <div className="flex gap-2">
                <Button disabled={!canSubmitEmail || loadingEmail} onClick={handleVerifyEmail} className="flex-1">
                  {loadingEmail ? "Wird verifiziert..." : "E-Mail bestätigen"}
                </Button>
                <Button type="button" variant="outline" disabled={loadingEmail || emailCooldown > 0} onClick={handleResendEmail}>
                  {emailCooldown > 0 ? `Erneut senden (${emailCooldown}s)` : "Code erneut senden"}
                </Button>
              </div>
            </Card>
          )}

          {needsPhone && (
            <Card className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-gray-700" />
                <h4>Telefonnummer verifizieren</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">Bitte gib den 6-stelligen Code ein, der an {user?.phone} gesendet wurde.</p>
              <Input value={user?.phone || ""} readOnly className="mb-3" />
              <InputOTP maxLength={6} value={phoneCode} onChange={setPhoneCode} containerClassName="mb-4">
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <div className="flex gap-2">
                <Button disabled={!canSubmitPhone || loadingPhone} onClick={handleVerifyPhone} className="flex-1">
                  {loadingPhone ? "Wird verifiziert..." : "Telefon bestätigen"}
                </Button>
                <Button type="button" variant="outline" disabled={loadingPhone || phoneCooldown > 0} onClick={handleResendPhone}>
                  {phoneCooldown > 0 ? `Erneut senden (${phoneCooldown}s)` : "Code erneut senden"}
                </Button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}