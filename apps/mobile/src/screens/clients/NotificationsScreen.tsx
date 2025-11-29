import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../components/Icon';

// Custom Components (assumed to be available)
import Text from '../../components/Text';
import Button from '../../components/Button';
import Avatar from '../../components/avatar'; // Custom Avatar component
import { spacing } from '../../theme/tokens';
import { notificationsApi, type BackendNotification } from '@/services/notifications'; // Assuming API service is available

// --- Brand Color Constant ---
const PRIMARY_COLOR = '#8B4513';
const GRAY_TEXT = '#6B7280';

// --- Type Definitions (kept identical) ---
type NotificationItem = {
  id: string;
  type: "booking" | "message" | "review" | "promo" | "reminder";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  actionUrl?: string;
};

// --- Utility Functions (Refactored for RN) ---

function normalizeType(t: BackendNotification["type"]): NotificationItem["type"] {
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

function formatRelativeTime(iso: string) {
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

const getNotificationIcon = (type: string, color: string) => {
  const size = 20; // Default icon size for list
  switch (type) {
    case "booking":
      return <Icon name="calendar" size={size} color={color} />;
    case "message":
      return <Icon name="message-circle" size={size} color={color} />;
    case "review":
      return <Icon name="star" size={size} color={color} />;
    case "promo":
      return <Icon name="gift" size={size} color={color} />;
    case "reminder":
      return <Icon name="calendar" size={size} color={color} />;
    default:
      return <Icon name="calendar" size={size} color={color} />;
  }
};

const getNotificationColorStyle = (type: string) => {
  switch (type) {
    case "booking":
      return { backgroundColor: `${PRIMARY_COLOR}1A`, textColor: PRIMARY_COLOR };
    case "message":
      return { backgroundColor: '#DBEAFE', textColor: '#2563EB' }; // bg-blue-100 text-blue-600
    case "review":
      return { backgroundColor: '#FEF3C7', textColor: '#D97706' }; // bg-yellow-100 text-yellow-600
    case "promo":
      return { backgroundColor: '#FF6B6B1A', textColor: '#FF6B6B' }; // bg-[#FF6B6B]/10 text-[#FF6B6B]
    case "reminder":
      return { backgroundColor: '#EDE9FE', textColor: '#7C3AED' }; // bg-purple-100 text-purple-600
    default:
      return { backgroundColor: '#F3F4F6', textColor: '#4B5563' }; // bg-gray-100 text-gray-600
  }
};

// --- NotificationsScreen Component ---

export function NotificationsScreen() {
  const navigate = useNavigation();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const goBack = () => {
    // @ts-ignore
    navigate.goBack();
  };

  // --- Data Fetching Effect ---
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    notificationsApi
      .list(50)
      .then((res) => {
        if (!mounted) return;
        const mapped: NotificationItem[] = res.items.map((n: any) => ({
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
        setUnreadCount(res.unreadCount ?? 0);
      })
      .catch((err) => {
        if (!mounted) return;
        const msg = (err as Error)?.message || 'Fehler beim Laden der Benachrichtigungen';
        setError(msg);
        Alert.alert('Fehler', msg); // Replace toast.error with native Alert
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
  const notificationsToDisplay = activeTab === 'all' ? items : unreadNotifications;

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      Alert.alert('Erfolg', 'Alle Benachrichtigungen als gelesen markiert'); // Replace toast
    } catch (err) {
      Alert.alert('Fehler', (err as Error)?.message || "Konnte nicht markieren");
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Alle löschen?',
      'Bist du sicher, dass du alle Benachrichtigungen löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationsApi.clearAll();
              setItems([]);
              setUnreadCount(0);
              Alert.alert('Erfolg', 'Alle Benachrichtigungen gelöscht'); // Replace toast
            } catch (err) {
              Alert.alert('Fehler', (err as Error)?.message || "Konnte nicht löschen");
            }
          },
        },
      ]
    );
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    if (notification.actionUrl) {
      // @ts-ignore - Assuming actionUrl maps to a screen name
      navigate.navigate(notification.actionUrl);
    }
    if (!notification.isRead) {
      // Optimistic update
      setItems((prev) => prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await notificationsApi.markRead(notification.id);
      } catch {
        // ignore errors for now
      }
    }
  };

  // --- Utility Tab Components (Simulating TabsList/Trigger) ---
  const TabsList = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.tabsList}>{children}</View>
  );

  const TabsTrigger = ({ value, label, count }: { value: 'all' | 'unread', label: string, count: number }) => (
    <Pressable
      onPress={() => setActiveTab(value)}
      style={({ pressed }) => [
        styles.tabsTrigger,
        activeTab === value ? styles.tabsTriggerActive : styles.tabsTriggerInactive,
        { opacity: pressed ? 0.7 : 1 }
      ]}
    >
      <Text style={[styles.tabsTriggerText, activeTab === value ? styles.tabsTriggerTextActive : styles.tabsTriggerTextInactive]}>
        {label} ({count})
      </Text>
    </Pressable>
  );

  const NotificationListContent = ({ list }: { list: NotificationItem[] }) => {
    if (loading) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
                <Text style={styles.loadingText}>Lädt Benachrichtigungen...</Text>
            </View>
        );
    }

    if (list.length === 0) {
      const isUnreadTab = activeTab === 'unread';
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            {isUnreadTab ? (
              <Icon name="checkmark-done" size={40} color="#9CA3AF" />
            ) : (
              <Icon name="calendar" size={40} color="#9CA3AF" />
            )}
          </View>
          <Text style={styles.emptyTitle}>
            {isUnreadTab ? 'Alles erledigt!' : 'Keine Benachrichtigungen'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {isUnreadTab
              ? 'Du hast alle Benachrichtigungen gelesen'
              : 'Du hast aktuell keine neuen Benachrichtigungen'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listDivide}>
        {list.map((notification) => {
          const isUnread = !notification.isRead;
          const iconColorStyle = getNotificationColorStyle(notification.type);
          
          return (
            <Pressable
              key={notification.id}
              onPress={() => handleNotificationClick(notification)}
              style={({ pressed }) => [
                styles.notificationItem,
                { backgroundColor: pressed ? '#F9FAFB' : '#fff' },
                isUnread ? styles.notificationUnread : null,
              ]}
            >
              <View style={styles.notificationInner}>
                {notification.avatar ? (
                  // Custom Avatar/Image component
                  <Avatar style={styles.avatarContainer}>
                    <Image source={{ uri: notification.avatar }} style={styles.avatarImage} />
                  </Avatar>
                ) : (
                  <View
                    style={[
                      styles.iconWrapper,
                      { backgroundColor: iconColorStyle.backgroundColor },
                    ]}
                  >
                    {getNotificationIcon(notification.type, iconColorStyle.textColor)}
                  </View>
                )}
                <View style={styles.notificationTextContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    {isUnread && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Pressable onPress={goBack} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#1F2937" />
            </Pressable>
            <Text style={styles.screenTitle}>Benachrichtigungen</Text>
          </View>
          <Button
            title="Alle gelesen"
            variant="ghost"
            size="sm"
            icon={<Icon name="checkmark-done" size={16} color={PRIMARY_COLOR} style={styles.iconMargin} />}
            onPress={handleMarkAllAsRead}
            style={styles.markAllButton}
            textStyle={styles.markAllButtonText}
          />
        </View>
      </View>

      <View style={styles.tabsWrapper}>
        <TabsList>
          <TabsTrigger value="all" label="Alle" count={items.length} />
          <TabsTrigger value="unread" label="Ungelesen" count={unreadNotifications.length} />
        </TabsList>
      </View>

      <ScrollView style={styles.scrollView}>
        <NotificationListContent list={notificationsToDisplay} />

        {/* Clear All Button */}
        {items.length > 0 && (
          <View style={styles.clearAllContainer}>
            <Button
              title="Alle Benachrichtigungen löschen"
              variant="outline"
              icon={<Icon name="trash-outline" size={16} color="#DC2626" style={styles.iconMargin} />}
              onPress={handleClearAll}
              style={styles.clearAllButton}
              textStyle={styles.clearAllButtonText}
            />
          </View>
        )}
        <View style={{ height: spacing.lg }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for RN ---
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1, // bg-gray-50
  },
  scrollView: {
    flex: 1,
  },
  // Header
  header: {
    backgroundColor: '#fff',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1, // border-b
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  headerBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  backButton: {
    marginLeft: -spacing.xs,
    padding: spacing.xs,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    // Replace unsupported gap in headerLeft with margin
    marginLeft: spacing.sm,
  },
  markAllButton: {
    // Styling for Button variant="ghost" - usually no background/border
  },
  markAllButtonText: {
    color: PRIMARY_COLOR,
    fontWeight: '600',
  },
  iconMargin: {
    marginRight: spacing.xs / 2,
  },

  // Tabs
  tabsWrapper: {
    backgroundColor: '#fff',
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    paddingHorizontal: spacing.md,
  },
  tabsList: {
    alignSelf: 'flex-start',
    flexDirection: 'row', // justify-start
  },
  tabsTrigger: {
    borderBottomWidth: 2,
    marginRight: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tabsTriggerActive: {
    borderBottomColor: PRIMARY_COLOR,
  },
  tabsTriggerInactive: {
    borderBottomColor: 'transparent',
  },
  tabsTriggerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabsTriggerTextActive: {
    color: PRIMARY_COLOR,
  },
  tabsTriggerTextInactive: {
    color: GRAY_TEXT,
  },

  // List Content
  listDivide: {
    // Simulates divide-y by having a border on each item, except the last one
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notificationItem: {
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    padding: spacing.md,
  },
  notificationUnread: {
    borderLeftColor: PRIMARY_COLOR,
    borderLeftWidth: 4,
    paddingLeft: spacing.md - 4, // Adjust padding for border
  },
  notificationInner: {
    flexDirection: 'row',
    // Replace unsupported gap with explicit margins on children
  },
  avatarContainer: {
    width: 48, // w-12 h-12
    height: 48,
    borderRadius: 24,
    flexShrink: 0,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  avatarImage: {
    height: '100%',
    resizeMode: 'cover',
    width: '100%',
  },
  iconWrapper: {
    alignItems: 'center',
    borderRadius: 24,
    flexShrink: 0,
    height: 48,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 48,
  },
  notificationTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs / 2,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  unreadDot: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 4,
    flexShrink: 0,
    height: 8,
    marginTop: 2,
    width: 8,
  },
  notificationMessage: {
    color: GRAY_TEXT,
    fontSize: 14,
    marginBottom: spacing.xs / 2,
  },
  notificationTime: {
    color: '#9CA3AF',
    fontSize: 12, // text-gray-500
  },

  // Empty/Loading
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64, // py-16
    paddingHorizontal: spacing.md,
  },
  emptyIconContainer: {
    width: 80, // w-20 h-20
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6', // bg-gray-100
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: GRAY_TEXT,
    fontSize: 14,
    textAlign: 'center',
  },
  loadingText: {
      color: GRAY_TEXT,
      marginTop: spacing.sm
  },

  // Footer
  clearAllContainer: {
    backgroundColor: '#fff',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md, // mt-4
  },
  clearAllButton: {
    width: '100%',
    borderColor: '#FCA5A5', // Adjusted for visual danger outline
    backgroundColor: '#FEF2F2', // hover:bg-red-50
    borderWidth: 1,
  },
  clearAllButtonText: {
    color: '#DC2626', // text-red-600
    fontWeight: '600',
  },
});