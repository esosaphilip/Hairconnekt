import {
  User,
  MapPin,
  Heart,
  Star,
  Calendar,
  CreditCard,
  Gift,
  Receipt,
  Bell,
  Globe,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  ChevronRight,
  Camera,
  Settings,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { api } from "@/services/http";
import { usersApi } from "@/services/users";
import { toast } from "sonner";

// ProfileScreen renders user profile information and settings

export function ProfileScreen() {
  const [notifications, setNotifications] = useState({
    push: true,
    email: true,
    sms: false,
  });
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const initials = useMemo(() => {
    const fn = me?.firstName || user?.firstName || "";
    const ln = me?.lastName || user?.lastName || "";
    return [fn[0], ln[0]].filter(Boolean).join("").toUpperCase() || "U";
  }, [me, user]);

  const formattedMemberSince = useMemo(() => {
    if (!me?.memberSince) return "";
    try {
      const d = new Date(me.memberSince);
      return new Intl.DateTimeFormat("de-DE", { month: "long", year: "numeric" }).format(d);
    } catch {
      return "";
    }
  }, [me?.memberSince]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    api
      .get("/users/me")
      .then((res) => {
        if (!isMounted) return;
        setMe(res);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load profile:", err);
        const msg = err instanceof Error ? err.message : "Fehler beim Laden des Profils";
        setError(msg);
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="p-6 max-w-md mx-auto">
          <h3 className="mb-2">Profil konnte nicht geladen werden</h3>
          <p className="text-gray-600 mb-4">{String(error)}</p>
          <Button variant="default" size="default" onClick={() => window.location.reload()}>Erneut versuchen</Button>
        </Card>
      </div>
    );
  }

  const MenuItem = ({ icon: Icon, label, value, badge, onClick, danger = false }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          danger ? "bg-red-50" : "bg-gray-100"
        }`}>
          <Icon className={`w-5 h-5 ${danger ? "text-red-600" : "text-gray-600"}`} />
        </div>
        <span className={danger ? "text-red-600" : ""}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge variant="secondary">{badge}</Badge>
        )}
        {value && (
          <span className="text-sm text-gray-500">{value}</span>
        )}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </button>
  );

  const SectionHeader = ({ title }) => (
    <div className="px-4 py-3 bg-gray-100">
      <p className="text-xs text-gray-600 uppercase tracking-wider">{title}</p>
    </div>
  );

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 pt-6 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h2>Profil</h2>
          <button onClick={() => navigate("/settings")}>
            <Settings className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar className="w-24 h-24 bg-[#8B4513] text-white">
              {me?.avatarUrl ? (
                <img src={me.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-3xl">{initials}</span>
              )}
            </Avatar>
            {/* Hidden file input for avatar upload */}
            <input
              id="profile-avatar-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingAvatar(true);
                try {
                  const res = await usersApi.uploadAvatar(file);
                  setMe((prev) => (prev ? { ...prev, avatarUrl: res.url } : prev));
                  toast.success("Profilbild aktualisiert");
                } catch (err) {
                  console.error("Avatar upload failed:", err);
                  const msg = err instanceof Error ? err.message : "Upload fehlgeschlagen";
                  toast.error(msg);
                } finally {
                  setUploadingAvatar(false);
                  // reset file input to allow re-selecting the same file
                  e.currentTarget.value = "";
                }
              }}
            />
            <button
              className={`absolute bottom-0 right-0 w-8 h-8 bg-[#8B4513] rounded-full flex items-center justify-center border-2 border-white ${uploadingAvatar ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (uploadingAvatar) return;
                const el = document.getElementById("profile-avatar-input");
                if (el instanceof HTMLInputElement) {
                  el.click();
                }
              }}
              disabled={uploadingAvatar}
              aria-label="Profilbild ändern"
              title="Profilbild ändern"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>

          {loading ? (
            <div className="animate-pulse w-40 h-6 bg-gray-200 rounded mb-2" />
          ) : (
            <>
              <h3 className="mb-1">{me?.name || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`}</h3>
              <p className="text-gray-600 mb-2">{me?.email || user?.email}</p>
              <p className="text-gray-600 mb-3">{me?.phone || user?.phone}</p>
            </>
          )}

          <div className="flex gap-2 mb-3">
            {me?.verified?.email && (
              <Badge className="bg-green-500 text-white">
                ✓ E-Mail verifiziert
              </Badge>
            )}
            {me?.verified?.phone && (
              <Badge className="bg-green-500 text-white">
                ✓ Telefon verifiziert
              </Badge>
            )}
          </div>

          <p className="text-sm text-gray-500">
            {me?.memberSince ? (
              <>Mitglied seit {formattedMemberSince}</>
            ) : (
              <></>
            )}
          </p>

          <Button
            variant="outline"
            size="default"
            className="mt-4"
            onClick={() => navigate("/edit-profile")}
          >
            Profil bearbeiten
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white px-4 py-4 mt-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl text-[#8B4513] mb-1">
              {loading ? (
                <span className="inline-block w-10 h-6 bg-gray-200 rounded animate-pulse" />
              ) : (
                me?.stats?.appointments ?? 0
              )}
            </div>
            <div className="text-xs text-gray-600">Termine</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-[#8B4513] mb-1">
              {loading ? (
                <span className="inline-block w-10 h-6 bg-gray-200 rounded animate-pulse" />
              ) : (
                me?.stats?.favorites ?? 0
              )}
            </div>
            <div className="text-xs text-gray-600">Favoriten</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-[#8B4513] mb-1">
              {loading ? (
                <span className="inline-block w-10 h-6 bg-gray-200 rounded animate-pulse" />
              ) : (
                me?.stats?.reviews ?? 0
              )}
            </div>
            <div className="text-xs text-gray-600">Bewertungen</div>
          </div>
        </div>
      </div>

      {/* Mein Profil Section */}
      <SectionHeader title="Mein Profil" />
  <Card className="mt-0">
        <MenuItem
          icon={Bell}
          label="Benachrichtigungen"
          onClick={() => navigate("/notifications")}
        />
        <Separator />
        <MenuItem
          icon={User}
          label="Persönliche Informationen"
          onClick={() => navigate("/personal-info")}
        />
        <Separator />
        <MenuItem
          icon={MapPin}
          label="Meine Adressen"
          badge={me?.addressesCount ?? 0}
          onClick={() => navigate("/addresses")}
        />
        <Separator />
        <MenuItem
          icon={User}
          label="Haartyp & Präferenzen"
          onClick={() => navigate("/hair-preferences")}
        />
      </Card>

      {/* Meine Aktivitäten Section */}
      <SectionHeader title="Meine Aktivitäten" />
      <Card className="mt-0">
        <MenuItem
          icon={Heart}
          label="Favoriten"
          badge={me?.stats?.favorites ?? 0}
          onClick={() => navigate("/favorites")}
        />
        <Separator />
        <MenuItem
          icon={Star}
          label="Meine Bewertungen"
          badge={me?.stats?.reviews ?? 0}
          onClick={() => navigate("/my-reviews")}
        />
        <Separator />
        <MenuItem
          icon={Calendar}
          label="Buchungshistorie"
          onClick={() => navigate("/booking-history")}
        />
      </Card>

      {/* Zahlungen Section */}
      <SectionHeader title="Zahlungen" />
      <Card className="mt-0">
        <MenuItem
          icon={CreditCard}
          label="Zahlungsmethoden"
          onClick={() => navigate("/payment-methods")}
        />
        <Separator />
        <MenuItem
          icon={Gift}
          label="Gutscheine & Rabatte"
          badge={0}
          onClick={() => navigate("/vouchers")}
        />
        <Separator />
        <MenuItem
          icon={Receipt}
          label="Transaktionshistorie"
          onClick={() => navigate("/transactions")}
        />
      </Card>

      {/* Einstellungen Section */}
      <SectionHeader title="Einstellungen" />
      <Card className="mt-0">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
              <span>Push-Benachrichtigungen</span>
            </div>
            <Switch
              checked={notifications.push}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, push: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
              <span>E-Mail-Benachrichtigungen</span>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, email: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
              <span>SMS-Benachrichtigungen</span>
            </div>
            <Switch
              checked={notifications.sms}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, sms: checked })
              }
            />
          </div>
        </div>
        <Separator />
        <MenuItem
          icon={Globe}
          label="Sprache"
          value="Deutsch"
          onClick={() => navigate("/language")}
        />
        <Separator />
        <MenuItem
          icon={Shield}
          label="Datenschutz & Sicherheit"
          onClick={() => navigate("/privacy")}
        />
        <Separator />
        <MenuItem
          icon={HelpCircle}
          label="Hilfe & Support"
          onClick={() => navigate("/support")}
        />
      </Card>

      {/* Rechtliches Section */}
      <SectionHeader title="Rechtliches" />
      <Card className="mt-0">
        <MenuItem
          icon={FileText}
          label="Allgemeine Geschäftsbedingungen"
          onClick={() => navigate("/terms")}
        />
        <Separator />
        <MenuItem
          icon={FileText}
          label="Datenschutzerklärung"
          onClick={() => navigate("/privacy-policy")}
        />
        <Separator />
        <MenuItem
          icon={FileText}
          label="Impressum"
          onClick={() => navigate("/imprint")}
        />
      </Card>

      {/* Account Actions */}
      <SectionHeader title="Account" />
      <Card className="mt-0">
        <MenuItem
          icon={LogOut}
          label="Abmelden"
          danger
          onClick={() => {
            if (confirm("Möchtest du dich wirklich abmelden?")) {
              logout();
              navigate("/");
            }
          }}
        />
        <Separator />
        <MenuItem
          icon={Trash2}
          label="Account löschen"
          danger
          onClick={() => navigate("/delete-account")}
        />
      </Card>

      {/* App Version */}
      <div className="text-center py-6 text-sm text-gray-500">
        <p>HairConnekt v1.0.0</p>
        <button className="text-[#8B4513] mt-2">Über HairConnekt</button>
      </div>
    </div>
  );
}
