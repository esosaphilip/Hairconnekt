import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  FlatList,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ArrowLeft, Calendar, Clock, MapPin, Star, ChevronRight } from "lucide-react-native";

// Assuming these custom RN components exist
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Avatar } from "../ui/Avatar";
// Replacing ImageWithFallback with standard Image component (or your custom RN wrapper)

// Mock data (remains the same)
type Booking = {
  id: number;
  providerName: string;
  providerBusiness: string | null;
  providerImage: string;
  service: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  location: string;
  status: 'completed' | 'cancelled';
  reviewed?: boolean;
  rating?: number;
  cancelledBy?: 'client' | 'provider';
  cancelReason?: string;
};

const bookings: Record<'completed' | 'cancelled', Booking[]> = {
  completed: [
    {
      id: 1,
      providerName: "Aisha Mohammed",
      providerBusiness: "Aisha's Braiding Studio",
      providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      service: "Box Braids",
      date: "15. Okt 2025",
      time: "14:00 Uhr",
      duration: "4 Std.",
      price: "€95",
      location: "Dortmund",
      status: "completed",
      reviewed: true,
      rating: 5,
    },
    {
      id: 2,
      providerName: "Fatima Hassan",
      providerBusiness: "Natural Hair Lounge",
      providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      service: "Cornrows",
      date: "8. Okt 2025",
      time: "10:00 Uhr",
      duration: "3 Std.",
      price: "€65",
      location: "Dortmund",
      status: "completed",
      reviewed: true,
      rating: 5,
    },
    {
      id: 3,
      providerName: "Lina Okafor",
      providerBusiness: null,
      providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      service: "Senegalese Twists",
      date: "1. Okt 2025",
      time: "15:00 Uhr",
      duration: "5 Std.",
      price: "€110",
      location: "Dortmund",
      status: "completed",
      reviewed: true,
      rating: 4,
    },
  ],
  cancelled: [
    {
      id: 4,
      providerName: "Sarah Williams",
      providerBusiness: "Braids & Beauty",
      providerImage: "https://images.unsplash.com/photo-1647462742033-f4e39fa481b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
      service: "Knotless Braids",
      date: "20. Sep 2025",
      time: "13:00 Uhr",
      duration: "4 Std.",
      price: "€105",
      location: "Dortmund",
      status: "cancelled",
      cancelledBy: "client",
      cancelReason: "Terminkonflikt",
    },
  ],
};

// --- Custom Tab Component (Manual replacement for TabsList/TabsTrigger) ---
const CustomTabs = ({ activeTab, setActiveTab }: { activeTab: 'completed' | 'cancelled'; setActiveTab: (tab: 'completed' | 'cancelled') => void }) => (
  <View style={styles.tabsContainer}>
    <TouchableOpacity
      style={[styles.tabButton, activeTab === 'completed' && styles.tabButtonActive]}
      onPress={() => setActiveTab('completed')}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
        Abgeschlossen ({bookings.completed.length})
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.tabButton, activeTab === 'cancelled' && styles.tabButtonActive]}
      onPress={() => setActiveTab('cancelled')}
      activeOpacity={0.7}
    >
      <Text style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>
        Storniert ({bookings.cancelled.length})
      </Text>
    </TouchableOpacity>
  </View>
);


// --- Booking Card Component ---
const BookingCard = React.memo(({ booking, navigate }: { booking: Booking; navigate: (screen: string, params?: any) => void }) => {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge style={styles.badgeCompleted} textStyle={styles.badgeTextWhite}>Abgeschlossen</Badge>;
      case "cancelled":
        return <Badge style={styles.badgeCancelled} textStyle={styles.badgeTextWhite}>Storniert</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card style={styles.bookingCard}>
      <TouchableOpacity
        onPress={() => navigate("AppointmentDetail", { id: booking.id })} // Adjust route name
        activeOpacity={0.8}
      >
        <View style={styles.providerInfo}>
          <Avatar size={64} style={styles.providerAvatar}>
            <Image
              source={{ uri: booking.providerImage }}
              style={styles.providerImage}
            />
          </Avatar>
          <View style={styles.detailsWrapper}>
            <View style={styles.nameStatusRow}>
              <View style={styles.nameBusinessWrapper}>
                <Text style={styles.providerName} numberOfLines={1}>{booking.providerName}</Text>
                {booking.providerBusiness && (
                  <Text style={styles.providerBusiness} numberOfLines={1}>
                    {booking.providerBusiness}
                  </Text>
                )}
              </View>
              {getStatusBadge(booking.status)}
            </View>
            <Badge variant="secondary" style={styles.serviceBadge}>
              {booking.service}
            </Badge>
          </View>
        </View>

        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#4B5563" />
            <Text style={styles.detailText}>{booking.date}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={16} color="#4B5563" />
            <Text style={styles.detailText}>
              {booking.time} • {booking.duration}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color="#4B5563" />
            <Text style={styles.detailText}>{booking.location}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.priceText}>{booking.price}</Text>
          {booking.status === "completed" && booking.reviewed && (
            <View style={styles.reviewStatus}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.reviewText}>Bewertet ({booking.rating})</Text>
            </View>
          )}
          {booking.status === "cancelled" && (
            <View style={styles.cancelStatus}>
              <Text style={styles.cancelText}>
                {booking.cancelledBy === "client" ? "Von dir storniert" : "Vom Anbieter storniert"}
              </Text>
            </View>
          )}
          <ChevronRight size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    </Card>
  );
});

// --- Refactored Component ---

export function BookingHistoryScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'completed' | 'cancelled'>("completed");
  
  // Choose the data array based on the active tab
  const activeBookings: Booking[] = bookings[activeTab];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buchungshistorie</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {bookings.completed.length}
            </Text>
            <Text style={styles.statLabel}>Abgeschlossen</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {bookings.cancelled.length}
            </Text>
            <Text style={styles.statLabel}>Storniert</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statItemTotal}>
              <Text style={styles.statValue}>
                {bookings.completed.length + bookings.cancelled.length}
              </Text>
              <Text style={styles.statLabel}>Gesamt</Text>
            </View>
          </View>
        </View>

        {/* Tabs and Content */}
        <View style={styles.tabsSection}>
          <CustomTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <View style={styles.tabsContent}>
            {activeBookings.length > 0 ? (
              // Use FlatList inside ScrollView for efficient scrolling of list items
              // Note: When placing FlatList inside ScrollView, you often need to manage scrolling manually,
              // but here we are using a simple map/View to maintain the web structure simplicity.
              <View style={styles.listContainer}>
                {activeBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} navigate={navigation.navigate} />
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>
                {activeTab === 'completed' ? 'Keine abgeschlossenen Buchungen gefunden.' : 'Keine stornierten Buchungen gefunden.'}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Stylesheet for React Native ---

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    marginBottom: 8, // Separator from stats (mt-2)
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  spacer: {
    width: 24,
  },
  // --- Stats ---
  statsContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemTotal: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513', // brown
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#4B5563', // gray-600
  },
  // Row for stats (grid grid-cols-3)
  statsRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },

  // --- Tabs ---
  tabsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // gray-100 (for TabsList background)
    borderRadius: 8,
    marginBottom: 16,
    padding: 4, // Padding to create inner margin for tabs
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff', // White background for active tab
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280', // Inactive text
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1F2937', // Active text
    fontWeight: '600',
  },
  tabsContent: {
    // mt-0 from TabsContent is implicitly handled by listContainer margin
  },
  listContainer: {
    // spacing handled by margins on cards
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6B7280',
    marginTop: 20,
  },

  // --- Booking Card ---
  bookingCard: {
    padding: 16,
    marginBottom: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    marginBottom: 12, // mb-3
  },
  providerAvatar: {
    width: 64,
    height: 64,
    flexShrink: 0,
    marginRight: 12,
  },
  providerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailsWrapper: {
    flex: 1,
    minWidth: 0,
  },
  nameStatusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameBusinessWrapper: {
    flex: 1,
    minWidth: 0,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  providerBusiness: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  badgeCompleted: {
    backgroundColor: '#10B981', // green-500
  },
  badgeCancelled: {
    backgroundColor: '#EF4444', // red-500
  },
  badgeTextWhite: {
    color: '#fff',
    fontSize: 12,
  },
  serviceBadge: {
    alignSelf: 'flex-start', // Align left
    marginTop: 4,
  },
  bookingDetails: {
    // Container for detail rows; avoid text-only styles on View
    // Text styles are applied on detailText
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16, // mt-4
    paddingTop: 16, // pt-4
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB', // border-t
  },
  priceText: {
    color: '#8B4513',
    fontWeight: '600',
  },
  reviewStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewText: {
    fontSize: 14,
    marginLeft: 4,
  },
  cancelStatus: {
    // No specific style needed, just a container
  },
  cancelText: {
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
});