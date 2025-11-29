import { ArrowLeft, Calendar, MessageCircle, Gift, Star, CheckCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";
import { notificationsApi } from "@/services/notifications";
// Map backend notification type to UI category for icon/color
function normalizeType(t) {
  switch (t) {
    case "BOOKING_REQUEST":
    case "BOOKING_CONFIRMED":
    case "BOOKING_CANCELLED":
      return "booking";
    case "MESSAGE_RECEIVED":
      return "message";
    case "REVIEW_RECEIVED":
      return "review";
    case "PAYMENT_RECEIVED":
    case "PAYOUT_COMPLETED":
      return "promo"; // reuse styling
    case "SYSTEM":
    default:
      return "reminder";
  }
}
function formatRelativeTime(iso) {
  try {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const minutes = Math.round(diffMs / 60000);
    if (minutes < 1) return "Gerade eben";
    if (minutes < 60) return `Vor ${minutes} Min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `Vor ${hours} Std`;
    const days = Math.round(hours / 24);
    if (days === 1) return "Gestern";
    return `Vor ${days} Tagen`;
  } catch {
    return "";
  }
}

const getNotificationIcon = (type) => {
  switch (type) {
    case "booking":
      return <Calendar className="w-5 h-5" />;
    case "message":
      return <MessageCircle className="w-5 h-5" />;
    case "review":
      return <Star className="w-5 h-5" />;
    case "promo":
      return <Gift className="w-5 h-5" />;
    case "reminder":
      return <Calendar className="w-5 h-5" />;
    default:
      return <Calendar className="w-5 h-5" />;
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case "booking":
      return "bg-[#8B4513]/10 text-[#8B4513]";
    case "message":
      return "bg-blue-100 text-blue-600";
    case "review":
      return "bg-yellow-100 text-yellow-600";
    case "promo":
      return "bg-[#FF6B6B]/10 text-[#FF6B6B]";
    case "reminder":
      return "bg-purple-100 text-purple-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export function NotificationsScreen() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // Removed unused error and unreadCount state to satisfy ESLint

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    notificationsApi
      .list(50)
      .then((res) => {
        if (!mounted) return;
        const mapped = res.items.map((n) => ({
          id: n.id,
          type: normalizeType(n.type),
          title: n.title,
          message: n.message,
          time: formatRelativeTime(n.createdAt),
          isRead: n.isRead,
          avatar: n.data?.avatar,
          actionUrl: n.data?.actionUrl,
        }));
        setItems(mapped);
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = err && typeof err.message === "string" ? err.message : 'Fehler beim Laden der Benachrichtigungen';
        toast.error(msg);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const unreadNotifications = useMemo(() => items.filter((n) => !n.isRead), [items]);
  // Removed unused readNotifications memo

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success("Alle Benachrichtigungen als gelesen markiert");
    } catch (err) {
      const msg = err && typeof err.message === "string" ? err.message : "Konnte nicht markieren";
      toast.error(msg);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationsApi.clearAll();
      setItems([]);
      toast.success("Alle Benachrichtigungen gelöscht");
    } catch (err) {
      const msg = err && typeof err.message === "string" ? err.message : "Konnte nicht löschen";
      toast.error(msg);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    if (!notification.isRead) {
      // Fire and forget; update local state optimistically
      setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
      try {
        await notificationsApi.markRead(notification.id);
      } catch {
        // ignore errors for now
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h3>Benachrichtigungen</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-[#8B4513]"
          >
            <CheckCheck className="w-4 h-4 mr-1" />
            Alle gelesen
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="bg-white border-b px-4">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">
              Alle ({items.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Ungelesen ({unreadNotifications.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-0">
          <div className="divide-y">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="mb-2">Lädt...</h4>
                <p className="text-gray-600 text-center text-sm">Bitte warten</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="mb-2">Keine Benachrichtigungen</h4>
                <p className="text-gray-600 text-center text-sm">
                  Du hast aktuell keine neuen Benachrichtigungen
                </p>
              </div>
            ) : (
              items.map((notification) => (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  aria-label="Benachrichtigung öffnen"
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleNotificationClick(notification);
                    }
                  }}
                  className={`p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.isRead ? "border-l-4 border-[#8B4513]" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {notification.avatar ? (
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <img src={notification.avatar} alt="" className="object-cover" />
                      </Avatar>
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h5 className="text-sm">{notification.title}</h5>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#8B4513] rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="mt-0">
          <div className="divide-y">
            {unreadNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <CheckCheck className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="mb-2">Alles erledigt!</h4>
                <p className="text-gray-600 text-center text-sm">
                  Du hast alle Benachrichtigungen gelesen
                </p>
              </div>
            ) : (
              unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  role="button"
                  tabIndex={0}
                  aria-label="Benachrichtigung öffnen"
                  onClick={() => handleNotificationClick(notification)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleNotificationClick(notification);
                    }
                  }}
                  className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-[#8B4513]"
                >
                  <div className="flex gap-3">
                    {notification.avatar ? (
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        <img src={notification.avatar} alt="" className="object-cover" />
                      </Avatar>
                    ) : (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h5 className="text-sm">{notification.title}</h5>
                        <div className="w-2 h-2 bg-[#8B4513] rounded-full flex-shrink-0 mt-1"></div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Clear All Button */}
      {items.length > 0 && (
        <div className="p-4 bg-white border-t mt-4">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Alle Benachrichtigungen löschen
          </Button>
        </div>
      )}
    </div>
  );
}
