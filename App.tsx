import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, Text, Pressable, View, TextInput } from 'react-native';
import { http } from './src/api/http';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/auth/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AccountTypeSelectionScreen from './src/screens/AccountTypeSelection';
import { ProviderRegistrationFlow } from './src/screens/provider/ProviderRegistrationFlow';
import { PendingApprovalScreen } from './src/screens/provider/PendingApprovalScreen';
import BookingsListScreen from './src/screens/BookingsListScreen';
import AppointmentDetailScreen from './src/screens/AppointmentDetailScreen';
// Provider app screens
import { ProviderDashboard } from './src/screens/provider/ProviderDashboard';
import ProviderCalendar from './src/screens/provider/ProviderCalendar';
import ProviderClients from './src/screens/provider/ProviderClients';
import { ProviderMore } from './src/screens/provider/ProviderMore';
import { AvailabilitySettingsScreen } from './src/screens/provider/AvailabilitySettingsScreen';
import { BlockTimeScreen } from './src/screens/provider/BlockTimeScreen';
import { CreateAppointmentScreen } from './src/screens/provider/CreateAppointmentScreen';
import { ClientDetailScreen } from './src/screens/provider/ClientDetailScreen';
import { ProviderProfileScreen } from './src/screens/provider/ProviderProfileScreen';
import { ProviderPublicProfileScreen } from './src/screens/provider/ProviderPublicProfileScreen';
import { ServicesManagementScreen } from './src/screens/provider/ServicesManagementScreen';
import { PortfolioManagementScreen } from './src/screens/provider/PortfolioManagementScreen';
import { ProviderAnalyticsScreen } from './src/screens/provider/ProviderAnalyticsScreen';
import { ProviderVouchersScreen } from './src/screens/provider/ProviderVouchersScreen';
import { ProviderSubscriptionScreen } from './src/screens/provider/ProviderSubscriptionScreen';
import { ProviderSettingsScreen } from './src/screens/provider/ProviderSettingsScreen';
import { ProviderHelpScreen } from './src/screens/provider/ProviderHelpScreen';
import { ProviderReviews } from './src/screens/provider/ProviderReviews';
import { TransactionsScreen } from './src/screens/provider/TransactionsScreen';
// Shared client management screens
import { EditProfileScreen } from './src/screens/EditProfileScreen';
import { AddressManagementScreen } from './src/screens/AddressManagementScreen';
import { AddEditAddressScreen } from './src/screens/AddEditAddressScreen';
// Demo components
import { Checkbox } from './src/components/checkbox';
// Replaced Textarea with native TextInput to avoid JSX type resolution issues
import { Avatar, AvatarImage, AvatarFallback } from './src/components/avatar';
import { Badge } from './src/components/badge';
import { Switch } from './src/components/switch';
import { Separator } from './src/components/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './src/components/dialog';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const ProviderCalendarStack = createNativeStackNavigator();
const ProviderClientsStack = createNativeStackNavigator();
const ProviderMoreStack = createNativeStackNavigator();

function HomeScreen() {
  const [status, setStatus] = useState('Checking backend...');
  const [agree, setAgree] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  useEffect(() => {
    http
      .get('/health')
      .then((res) => {
        if (res.data?.status === 'ok' || res.status === 200) setStatus('Backend OK');
        else setStatus('Backend responded');
      })
      .catch(() => setStatus('Backend unreachable'));
  }, []);
  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>HairConnekt Mobile</Text>
        <Text style={{ marginTop: 8 }}>{status}</Text>
      </View>
      <Separator />
      <View style={{ marginTop: 16 }}>
        <Text style={{ fontSize: 16, fontWeight: '600' }}>Components demo</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <Checkbox checked={agree} onCheckedChange={setAgree} />
          <Text style={{ marginLeft: 12 }}>Subscribe: {agree ? 'Yes' : 'No'}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <Switch value={enabled} onValueChange={setEnabled} />
          <Text style={{ marginLeft: 12 }}>Notifications: {enabled ? 'On' : 'Off'}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <Badge style={{ marginRight: 12 }}>New</Badge>
          <Badge variant="secondary" style={{ marginRight: 12 }}>Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
          <Avatar size={40} style={{ marginRight: 12 }}>
            <AvatarImage uri="https://i.pravatar.cc/100?img=1" />
          </Avatar>
          <Avatar size={40}>
            <AvatarFallback label="HK" />
          </Avatar>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={{ marginBottom: 6, fontWeight: '600' }}>Notes</Text>
          <TextInput
            multiline
            textAlignVertical="top"
            placeholder="Write something..."
            placeholderTextColor="#6b7280"
            value={notes}
            onChangeText={setNotes}
            style={{
              minHeight: 64,
              width: '100%',
              borderWidth: 1,
              borderColor:
                notes.length > 0 && notes.length < 3 ? '#ef4444' : '#d1d5db',
              backgroundColor: '#f9fafb',
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
              color: '#111827',
              fontSize: 16,
            }}
          />
        </View>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Pressable style={{ backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '600' }}>Open Dialog</Text>
            </Pressable>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dialog title</DialogTitle>
              <DialogDescription>This is a simple modal built with React Native.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose>
                <Pressable style={{ paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Text>Close</Text>
                </Pressable>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </View>
    </SafeAreaView>
  );
}

function ExploreScreen() {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Explore</Text>
      <Text style={{ marginTop: 8 }}>Search for salons and services</Text>
    </SafeAreaView>
  );
}

function BookingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Bookings</Text>
      <Text style={{ marginTop: 8 }}>Your appointments will appear here</Text>
    </SafeAreaView>
  );
}

function MessagesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Messages</Text>
      <Text style={{ marginTop: 8 }}>Conversations and chat</Text>
    </SafeAreaView>
  );
}

function ProfileScreen() {
  const { logout, user } = useAuth();
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Profile</Text>
      <Text style={{ marginTop: 8 }}>Angemeldet als: {user?.email || user?.phone || user?.id}</Text>
      <Pressable
        onPress={logout}
        style={{ marginTop: 16, backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Abmelden</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Home' ? 'home' :
            route.name === 'Explore' ? 'search' :
            route.name === 'Bookings' ? 'calendar' :
            route.name === 'Messages' ? 'chatbubble' :
            'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Bookings" component={BookingsStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function BookingsStackScreen() {
  return (
    <BookingsStack.Navigator>
      <BookingsStack.Screen name="BookingsList" component={BookingsListScreen} options={{ title: 'Bookings' }} />
      <BookingsStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment' }} />
    </BookingsStack.Navigator>
  );
}

// Provider app navigators
function ProviderCalendarStackScreen() {
  return (
    <ProviderCalendarStack.Navigator>
      <ProviderCalendarStack.Screen name="ProviderCalendar" component={ProviderCalendar} options={{ title: 'Kalender' }} />
      <ProviderCalendarStack.Screen name="CreateAppointmentScreen" component={CreateAppointmentScreen} options={{ title: 'Termin erstellen' }} />
      <ProviderCalendarStack.Screen name="BlockTimeScreen" component={BlockTimeScreen} options={{ title: 'Zeit blockieren' }} />
    </ProviderCalendarStack.Navigator>
  );
}

function ProviderClientsStackScreen() {
  return (
    <ProviderClientsStack.Navigator>
      <ProviderClientsStack.Screen name="ProviderClients" component={ProviderClients} options={{ title: 'Kunden' }} />
      <ProviderClientsStack.Screen name="ProviderClientDetail" component={ClientDetailScreen} options={{ title: 'Kunde' }} />
    </ProviderClientsStack.Navigator>
  );
}

function ProviderMoreStackScreen() {
  return (
    <ProviderMoreStack.Navigator>
      <ProviderMoreStack.Screen name="ProviderMore" component={ProviderMore} options={{ title: 'Mehr' }} />
      {/* Business Management */}
      <ProviderMoreStack.Screen name="ProviderProfileScreen" component={ProviderProfileScreen} options={{ title: 'Mein Profil' }} />
      <ProviderMoreStack.Screen name="ProviderPublicProfileScreen" component={ProviderPublicProfileScreen} options={{ title: 'Öffentliches Profil' }} />
      <ProviderMoreStack.Screen name="ProviderServicesScreen" component={ServicesManagementScreen} options={{ title: 'Services & Preise' }} />
      <ProviderMoreStack.Screen name="ProviderPortfolioScreen" component={PortfolioManagementScreen} options={{ title: 'Portfolio verwalten' }} />
      {/* Finanzen */}
      <ProviderMoreStack.Screen name="TransactionsScreen" component={TransactionsScreen} options={{ title: 'Transaktionen' }} />
      <ProviderMoreStack.Screen name="ProviderAnalyticsScreen" component={ProviderAnalyticsScreen} options={{ title: 'Statistiken & Berichte' }} />
      <ProviderMoreStack.Screen name="ProviderVouchersScreen" component={ProviderVouchersScreen} options={{ title: 'Gutscheine & Angebote' }} />
      <ProviderMoreStack.Screen name="ProviderSubscriptionScreen" component={ProviderSubscriptionScreen} options={{ title: 'Abonnement & Gebühren' }} />
      {/* Feedback */}
      <ProviderMoreStack.Screen name="ProviderReviewsScreen" component={ProviderReviews} options={{ title: 'Bewertungen' }} />
      {/* Einstellungen */}
      <ProviderMoreStack.Screen name="ProviderSettingsScreen" component={ProviderSettingsScreen} options={{ title: 'Einstellungen' }} />
      <ProviderMoreStack.Screen name="ProviderHelpScreen" component={ProviderHelpScreen} options={{ title: 'Hilfe & Support' }} />
      {/* Shared/edit screens */}
      <ProviderMoreStack.Screen name="AvailabilitySettingsScreen" component={AvailabilitySettingsScreen} options={{ title: 'Verfügbarkeitszeiten' }} />
      <ProviderMoreStack.Screen name="EditProfileScreen" component={EditProfileScreen} options={{ title: 'Profil bearbeiten' }} />
      <ProviderMoreStack.Screen name="AddressManagementScreen" component={AddressManagementScreen} options={{ title: 'Meine Adressen' }} />
      <ProviderMoreStack.Screen name="AddEditAddressScreen" component={AddEditAddressScreen} options={{ title: 'Adresse' }} />
    </ProviderMoreStack.Navigator>
  );
}

function ProviderTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Dashboard' ? 'grid-outline' :
            route.name === 'Kalender' ? 'calendar-outline' :
            route.name === 'Kunden' ? 'people-outline' :
            route.name === 'Nachrichten' ? 'chatbubble-ellipses-outline' :
            'menu-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={ProviderDashboard} />
      <Tab.Screen name="Kalender" component={ProviderCalendarStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Kunden" component={ProviderClientsStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Nachrichten" component={MessagesScreen} />
      <Tab.Screen name="Mehr" component={ProviderMoreStackScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>Laden…</Text>
      </SafeAreaView>
    );
  }
  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Route to provider vs client app based on userType */}
          {String(user?.userType || '').toLowerCase() === 'provider' ? (
            <Stack.Screen name="ProviderTabs" component={ProviderTabs} />
          ) : (
            <Stack.Screen name="Tabs" component={Tabs} />
          )}
        </Stack.Navigator>
      ) : (
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Anmelden' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registrieren' }} />
          <Stack.Screen name="AccountType" component={AccountTypeSelectionScreen} options={{ title: 'Kontotyp' }} />
          <Stack.Screen name="ProviderRegistration" component={ProviderRegistrationFlow} options={{ title: 'Anbieter-Registrierung' }} />
          <Stack.Screen name="ProviderPendingApproval" component={PendingApprovalScreen} options={{ title: 'Prüfung ausstehend' }} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

// Styles are kept inline for brevity
