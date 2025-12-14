import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { providerNotificationsApi } from '@/api/providerNotifications';
import {
  Bell,
  Calendar,
  MessageSquare,
  Star,
  Euro,
  X,
  ChevronLeft,
  Filter,
  Check,
  Trash2, // Added for delete icon
  ChevronDown, // Used for filter dropdown
} from 'lucide-react-native';

const THEME_COLOR = '#8B4513';
const ACCENT_COLOR = '#FF6B6B';

// --- Type Definitions (moved to a separate types file in a real app) ---
interface Notification {
  id: string;
  type: 'booking' | 'reminder' | 'cancellation' | 'message' | 'review' | 'payout';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionData?: {
    bookingId?: string;
    clientName?: string;
    messageId?: string;
    reviewId?: string;
    amount?: number;
  };
}

type NotificationFilter = 'all' | 'booking' | 'reminder' | 'cancellation' | 'message' | 'review' | 'payout';

// --- Custom Components/Utilities (replace with your design system components) ---

// Placeholder Button Component for RN, replacing your web Button
type RNButtonProps = { onPress: () => void; title: string; style?: any; textStyle?: any; variant?: 'primary' | 'outline' };
const RNButton = ({ onPress, title, style = {}, textStyle = {}, variant = 'primary' }: RNButtonProps) => {
  const isPrimary = variant === 'primary';
  const buttonStyles = [
    styles.rnButton,
    isPrimary ? styles.rnButtonPrimary : styles.rnButtonOutline,
    style,
  ];
  const textStyles = [
    styles.rnButtonText,
    isPrimary ? styles.rnButtonTextPrimary : styles.rnButtonTextOutline,
    textStyle,
  ];
  return (
    <TouchableOpacity onPress={onPress} style={buttonStyles}>
      <Text style={textStyles}>{title}</Text>
    </TouchableOpacity>
  );
};

// --- Screen Component ---

export default function ProviderNotificationsScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [selectedFilter, setSelectedFilter] = useState<NotificationFilter>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Constants
  const THEME_COLOR_LOCAL = THEME_COLOR; // keep usage consistent
  const ACCENT_COLOR_LOCAL = ACCENT_COLOR;

  const getNotificationIcon = (type: Notification['type']) => {
    const size = 20;
    const color = '#FFFFFF';
    switch (type) {
      case 'booking':
        return <Calendar size={size} color={color} />;
      case 'reminder':
        return <Bell size={size} color={color} />;
      case 'cancellation':
        return <X size={size} color={color} />;
      case 'message':
        return <MessageSquare size={size} color={color} />;
      case 'review':
        return <Star size={size} color={color} />;
      case 'payout':
        return <Euro size={size} color={color} />;
    }
  };

  const getNotificationColor = (type: Notification['type']): string => {
    switch (type) {
      case 'booking':
        return ACCENT_COLOR; // #FF6B6B
      case 'reminder':
        return THEME_COLOR; // #8B4513
      case 'cancellation':
        return '#6B7280'; // gray-500
      case 'message':
        return '#3B82F6'; // blue-500
      case 'review':
        return '#F59E0B'; // yellow-500
      case 'payout':
        return '#10B981'; // green-500
      default:
        return '#000000';
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data: any = await providerNotificationsApi.list({ filter: 'all', page: 1, limit: 50 });
        const list: any[] = Array.isArray(data?.notifications) ? data.notifications : (Array.isArray(data) ? data : []);
        const mapType = (t: string): Notification['type'] => {
          switch (t) {
            case 'new_booking': return 'booking';
            case 'appointment_reminder': return 'reminder';
            case 'cancellation': return 'cancellation';
            case 'new_message': return 'message';
            case 'new_review': return 'review';
            case 'payout_completed': return 'payout';
            default: return 'message';
          }
        };
        const mapped: Notification[] = list.map((n: any) => ({
          id: String(n.id),
          type: mapType(String(n.type || 'message')),
          title: String(n.title || ''),
          message: String(n.body || n.message || ''),
          timestamp: n.timestamp ? new Date(n.timestamp) : new Date(),
          isRead: !!n.isRead,
          actionData: {
            bookingId: n.relatedData?.appointmentId,
            messageId: n.relatedData?.conversationId,
            reviewId: n.relatedData?.reviewId,
            amount: (n.relatedData?.amount ?? undefined),
          },
        }));
        if (!cancelled) setNotifications(mapped);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 1000 / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min.`;
    if (diffHours < 24) return `vor ${diffHours} Std.`;
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `vor ${diffDays} Tagen`;

    return timestamp.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const toggleReadStatus = async (id: string) => {
    try {
      await providerNotificationsApi.markRead(id);
      setNotifications((prev) => prev.map((notif) => notif.id === id ? { ...notif, isRead: true } : notif));
    } catch {
      setNotifications((prev) => prev.map((notif) => notif.id === id ? { ...notif, isRead: !notif.isRead } : notif));
    }
  };

  const markAllAsRead = async () => {
    try {
      await providerNotificationsApi.markAllRead();
    } catch {}
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const deleteNotification = async (id: string) => {
    try { await providerNotificationsApi.remove(id); } catch {}
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getFilterLabel = (filter: NotificationFilter) => {
    switch (filter) {
      case 'all':
        return 'Alle';
      case 'booking':
        return 'Buchungen';
      case 'reminder':
        return 'Erinnerungen';
      case 'cancellation':
        return 'Stornierungen';
      case 'message':
        return 'Nachrichten';
      case 'review':
        return 'Bewertungen';
      case 'payout':
        return 'Auszahlungen';
    }
  };

  const filteredNotifications = useMemo(() => {
    return selectedFilter === 'all'
      ? notifications
      : notifications.filter(n => n.type === selectedFilter);
  }, [notifications, selectedFilter]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // --- Render Item for FlatList ---
  const renderNotificationItem = ({ item: notification }: { item: Notification }) => (
    <View style={[
      styles.notificationItem,
      !notification.isRead ? styles.notificationItemUnread : styles.notificationItemRead,
    ]}>
      <View style={styles.notificationContentContainer}>
        {/* Icon */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(notification.type) }
        ]}>
          {getNotificationIcon(notification.type)}
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !notification.isRead && styles.titleUnread]} numberOfLines={1}>
              {notification.title}
            </Text>
            {!notification.isRead && (
              <View style={styles.unreadDot} />
            )}
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {notification.message}
          </Text>

          {/* Timestamp and Actions */}
          <View style={styles.footerRow}>
            <Text style={styles.timestamp}>
              {formatTimestamp(notification.timestamp)}
            </Text>
            <View style={styles.footerActions}>
              <TouchableOpacity
                onPress={() => toggleReadStatus(notification.id)}
                style={styles.smallActionButton}
              >
                <Text style={styles.smallActionButtonText}>
                  {notification.isRead ? 'Ungelesen' : 'Gelesen'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteNotification(notification.id)}
                style={styles.deleteButton}
              >
                <Trash2 size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Action Buttons (Primary) */}
          {notification.type === 'booking' && !notification.isRead && notification.title.includes('Neue Buchungsanfrage') && (
            <View style={styles.primaryActionsContainer}>
              <RNButton
                title="Akzeptieren"
                onPress={() => console.log('Accept booking:', notification.id)}
                style={styles.primaryActionBtn}
              />
              <RNButton
                title="Ablehnen"
                onPress={() => console.log('Decline booking:', notification.id)}
                variant="outline"
                style={styles.primaryActionBtn}
              />
            </View>
          )}

          {notification.type === 'message' && (
            <RNButton
              title="Nachricht anzeigen"
              onPress={() => console.log('View message:', notification.id)}
              style={styles.fullWidthActionBtn}
            />
          )}

          {notification.type === 'review' && (
            <RNButton
              title="Bewertung anzeigen"
              onPress={() => console.log('View review:', notification.id)}
              variant="outline"
              style={styles.fullWidthActionBtn}
            />
          )}

          {notification.type === 'reminder' && (
            <RNButton
              title="Termin anzeigen"
              onPress={() => console.log('View reminder:', notification.id)}
              variant="outline"
              style={styles.fullWidthActionBtn}
            />
          )}

          {notification.type === 'payout' && (
            <RNButton
              title="Details anzeigen"
              onPress={() => console.log('View payout details:', notification.id)}
              variant="outline"
              style={styles.fullWidthActionBtn}
            />
          )}
        </View>
      </View>
    </View>
  );

  const filterOptions: NotificationFilter[] = ['all', 'booking', 'reminder', 'cancellation', 'message', 'review', 'payout'];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => { try { navigation.goBack(); } catch {} }} style={styles.backButton}>
            <ChevronLeft size={24} color="#4B5563" />
          </TouchableOpacity>
          <View>
            <Text style={styles.mainTitle}>Benachrichtigungen</Text>
            {unreadCount > 0 && (
              <Text style={styles.subTitle}>{unreadCount} ungelesen</Text>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead} style={styles.markAllReadButton}>
              <Text style={styles.markAllReadText}>Alle als gelesen markieren</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity onPress={() => setShowFilterMenu(true)} style={styles.filterButton}>
            <Filter size={16} color="#4B5563" />
            <Text style={styles.filterText}>{getFilterLabel(selectedFilter)}</Text>
            <ChevronDown size={16} color="#4B5563" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          {selectedFilter !== 'all' && (
            <TouchableOpacity onPress={() => setSelectedFilter('all')} style={styles.resetFilterButton}>
              <Text style={styles.resetFilterText}>Filter zurücksetzen</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <View style={styles.emptyListIconContainer}>
              <Bell size={32} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyListTitle}>Keine Benachrichtigungen</Text>
            <Text style={styles.emptyListMessage}>
              {selectedFilter === 'all'
                ? 'Sie haben derzeit keine Benachrichtigungen.'
                : `Keine ${getFilterLabel(selectedFilter).toLowerCase()} vorhanden.`}
            </Text>
          </View>
        )}
      />

      {/* Filter Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showFilterMenu}
        onRequestClose={() => setShowFilterMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterMenu(false)}
        >
          <View style={styles.modalContent}>
            {filterOptions.map(filter => (
              <TouchableOpacity
                key={filter}
                onPress={() => {
                  setSelectedFilter(filter);
                  setShowFilterMenu(false);
                }}
                style={styles.filterOption}
              >
                <Text style={styles.filterOptionText}>{getFilterLabel(filter)}</Text>
                {selectedFilter === filter && (
                  <Check size={20} color={THEME_COLOR} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// --- StyleSheet ---
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // bg-gray-50
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // border-gray-200
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 10,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-900
  },
  subTitle: {
    fontSize: 14,
    color: '#4B5563', // text-gray-600
  },
  markAllReadButton: {
    padding: 4,
  },
  markAllReadText: {
    fontSize: 14,
    color: THEME_COLOR, // text-[#8B4513]
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#4B5563', // text-gray-700
    marginLeft: 4,
  },
  resetFilterButton: {
    padding: 4,
  },
  resetFilterText: {
    fontSize: 14,
    color: ACCENT_COLOR, // text-[#FF6B6B]
  },
  // --- List and Item Styles ---
  listContent: {
    paddingBottom: 20, // Add some bottom padding
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB', // divide-gray-200
  },
  notificationItem: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  notificationItemUnread: {
    backgroundColor: '#EFF6FF', // bg-blue-50/30 (a light blue tint)
  },
  notificationItemRead: {
    backgroundColor: '#FFFFFF',
  },
  notificationContentContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#4B5563', // text-gray-700
    flex: 1,
  },
  titleUnread: {
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-900
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ACCENT_COLOR, // bg-[#FF6B6B]
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    color: '#4B5563', // text-gray-600
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280', // text-gray-500
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallActionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  smallActionButtonText: {
    fontSize: 12,
    color: THEME_COLOR, // text-[#8B4513]
    textDecorationLine: 'underline',
  },
  deleteButton: {
    padding: 4,
    borderRadius: 4,
  },
  // --- Primary Action Buttons ---
  primaryActionsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  primaryActionBtn: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
  },
  fullWidthActionBtn: {
    marginTop: 12,
    height: 40,
    paddingHorizontal: 12,
  },
  // RNButton Styles (Placeholder)
  rnButton: {
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rnButtonPrimary: {
    backgroundColor: THEME_COLOR,
  },
  rnButtonOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB', // border-gray-300
  },
  rnButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rnButtonTextPrimary: {
    color: '#FFFFFF',
  },
  rnButtonTextOutline: {
    color: '#4B5563', // text-gray-700
  },
  // --- Empty List State ---
  emptyListContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  emptyListIconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#F3F4F6', // bg-gray-100
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-900
    marginBottom: 8,
  },
  emptyListMessage: {
    fontSize: 14,
    color: '#4B5563', // text-gray-600
    textAlign: 'center',
  },
  // --- Modal/Filter Menu Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay
    paddingHorizontal: 16,
    paddingTop: 100, // Position the modal below the header
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#1F2937',
  },
});
