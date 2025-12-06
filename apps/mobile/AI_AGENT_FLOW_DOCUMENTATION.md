# HairConnekt - Complete Flow Documentation for AI Agents

## 📋 Document Purpose
This document provides step-by-step flows for both CLIENT and PROVIDER sides of HairConnekt. Use this as a reference when implementing features in React Native to ensure bug-free, complete user experiences.

---

# 🙋‍♀️ CLIENT SIDE FLOWS (Briader/Customer)

---

## FLOW 1: App Launch & First-Time User Onboarding

### Steps:
1. **App Opens → SplashScreen**
   - Display HairConnekt logo with brown (#8B4513) background
   - Show loading animation for 2.5 seconds
   - Check localStorage for `hasCompletedOnboarding`
   - If true → go to Step 5
   - If false → continue to Step 2

2. **Client Onboarding (4 Slides)**
   - Slide 1: "Finde deinen Braider" - Show search illustration
   - Slide 2: "Buche deinen Termin" - Show calendar illustration  
   - Slide 3: "Chatte direkt" - Show messaging illustration
   - Slide 4: "Bewerte & teile" - Show review illustration
   - Include progress dots at bottom
   - "Weiter" button on slides 1-3, "Los geht's" on slide 4
   - "Überspringen" text button in top-right
   - Save `hasCompletedOnboarding = true` to localStorage when completed

3. **Location Selection**
   - Show header: "Wähle deinen Standort"
   - Display list of 15 German cities (Berlin, Hamburg, München, etc.)
   - Each city shows: City name, State, Population
   - Include search bar at top to filter cities
   - Include "Aktuellen Standort verwenden" button with location icon
   - When city selected: Save to localStorage as `selectedCity`
   - Navigate to Welcome Screen

4. **Welcome Screen (Landing Page)**
   - Show HairConnekt logo
   - Tagline: "Ihr Friseur, Ihre Zeit"
   - Two main buttons:
     - "Anmelden" (Login) - Outline button
     - "Jetzt registrieren" (Register) - Primary brown button
   - Link at bottom: "Als Anbieter registrieren"
   - User can skip login and browse as guest

5. **Home Screen (Main App)**
   - If user skipped login, show "Guest Mode" indicator
   - Load app content (see FLOW 2)

### Implementation Notes:
- Use AsyncStorage/localStorage for persistence
- Onboarding should only show once
- Allow users to browse as guest without login
- Location can be changed later in settings

---

## FLOW 2: Browse & Discover Braiders

### Steps:
1. **Home Screen Display**
   - **Header Section:**
     - If logged in: Avatar + "Hallo, {FirstName}! 👋" + Notification bell icon
     - If guest: "Willkommen bei HairConnekt 👋" + "Anmelden" button
     - Location pill: "{City}" with MapPin icon (clickable to change)
   
   - **Search Bar:**
     - Placeholder: "Suche nach Styles, Braider..."
     - Search icon on left
     - Tapping navigates to Search Screen
   
   - **Popular Styles Section:**
     - Horizontal scrollable carousel
     - 8-10 style cards with images
     - Examples: Box Braids, Cornrows, Twists, etc.
     - Each card: Image + Style name + Service count
     - Tapping style card navigates to filtered search
   
   - **Nearby Braiders Section:**
     - "Braider in deiner Nähe" header with "Alle anzeigen" link
     - List of 3-4 provider cards
     - Each card shows:
       - Provider photo (circular avatar)
       - Name + verification badge (if verified)
       - Business name (if applicable)
       - Star rating + review count
       - Distance from user
       - 1-2 specialty tags
       - Price starting from
       - "Verfügbar heute" green badge OR "Nächster Termin: {date}" gray badge
       - Heart icon for favoriting (right corner)
     - Tapping card navigates to Provider Profile
   
   - **Featured Providers Section:**
     - "Empfohlene Anbieter" header
     - Similar cards as Nearby section
     - Providers marked as featured/promoted

   - **Bottom Navigation:**
     - 5 tabs: Home, Search, Appointments, Messages, Profile
     - Active tab highlighted in brown (#8B4513)

2. **Interactions:**
   - Pull-to-refresh reloads nearby braiders
   - Heart icon toggles favorite (requires login if guest)
   - Search bar tap → Navigate to Search Screen
   - Style card tap → Navigate to Search Screen with filter applied
   - Provider card tap → Navigate to Provider Profile
   - "Alle anzeigen" link → Navigate to Search Screen

### Implementation Notes:
- Use geolocation to calculate distances
- Cache provider data for offline browsing
- Lazy load images for performance
- Show skeleton loaders while data loads

---

## FLOW 3: Search & Filter Braiders

### Steps:
1. **Search Screen Opens**
   - Sticky header with search input (auto-focused)
   - Search icon on left, X icon on right (to clear)
   - Show "Recent Searches" if no search term entered
   - Show filter chips below search bar

2. **Search Input:**
   - User types search term
   - Debounce search by 300ms (don't search on every keystroke)
   - Search across: Provider names, business names, specialties, styles
   - Display matching results in real-time

3. **Filter System:**
   - **Filter Chips (Quick Filters):**
     - Horizontal scrollable row
     - Chips: "Salon", "Einzelperson", "Mobil", "€", "€€", "€€€", "4★+", "Heute verfügbar", "< 5km"
     - Tapping chip toggles it on/off (brown background when active)
     - Multiple chips can be active simultaneously
   
   - **Advanced Filters Button:**
     - "Alle Filter" button with SlidersHorizontal icon
     - Opens bottom sheet with full filter options:
       - **Anbieter-Typ:** Radio buttons (Alle, Salon, Einzelperson, Mobiler Service)
       - **Preisspanne:** Dual range slider (€0 - €200)
       - **Entfernung:** Range slider (0 - 25km)
       - **Bewertung:** Star rating selector (Any, 3★+, 4★+, 4.5★+)
       - **Verfügbarkeit:** Checkboxes (Heute, Diese Woche, Nächsten Monat)
       - **Spezialitäten:** Multi-select checkboxes (Box Braids, Cornrows, Twists, Locs, etc.)
       - **Zusatzleistungen:** Checkboxes (Mobiler Service, Kinderfreundlich, Parkmöglichkeiten, etc.)
     - Bottom buttons: "Filter zurücksetzen" | "Anwenden ({count} Anbieter)"

4. **Results Display:**
   - **View Mode Switcher:**
     - Three buttons: List view | Grid view | Map view
     - Located in top-right of results header
   
   - **List View (Default):**
     - Full provider cards (same as Home screen)
     - Sorted by: Distance (default), Rating, Price, or Availability
     - Sort dropdown in top-left
   
   - **Grid View:**
     - 2 columns
     - Compact cards: Image, Name, Rating, Price
     - Less information, more visual
   
   - **Map View:**
     - Full-screen map with provider pins
     - Tapping pin shows mini card
     - "List anzeigen" button to switch back

5. **Results Count:**
   - Show "{count} Ergebnisse" below filters
   - If no results: Show empty state with suggestions
   - "Keine Ergebnisse. Versuche andere Filter"

6. **Infinite Scroll:**
   - Load 20 results initially
   - Load more when user scrolls to bottom
   - Show loading spinner at bottom

### Implementation Notes:
- Debounce search to prevent excessive API calls
- Cache search results for 5 minutes
- Apply filters client-side if results already loaded
- Use map library compatible with React Native (react-native-maps)
- Save recent searches to localStorage (max 10)

---

## FLOW 4: View Provider Profile

### Steps:
1. **Profile Header:**
   - Large cover photo (blurred background)
   - Provider photo (circular, centered)
   - Provider name + verification badge
   - Business name (if applicable)
   - Star rating + total reviews count
   - "Jetzt buchen" primary button (sticky on scroll)
   - Icons row: Message | Share | Favorite (heart)

2. **Quick Info Section:**
   - **Badges:** Mobile service, Kid-friendly, Parking available, etc.
   - **Details:**
     - Location: "{Address}, {City}" with MapPin icon
     - Distance: "{X} km von dir" with Navigation icon
     - Response time: "Antwortet in ~2 Std." with Clock icon
     - Member since: "Dabei seit {Month Year}" with Calendar icon

3. **Tabs Section:**
   - Horizontal scrollable tabs: Übersicht | Portfolio | Bewertungen | Über mich
   
   - **Tab 1: Übersicht (Overview)**
     - **Dienstleistungen (Services):**
       - List of services offered
       - Each service shows: Name, Duration, Price, Description
       - "Mehr laden" if more than 5 services
       - Tapping service highlights it for booking
     
     - **Verfügbarkeit (Availability):**
       - Calendar showing next 14 days
       - Green dots = available, Gray = booked, Red = unavailable
       - Shows available time slots for selected date
     
     - **Spezialitäten (Specialties):**
       - Chips showing expertise areas
   
   - **Tab 2: Portfolio**
     - Grid of before/after photos
       - 2 columns on mobile, 3 on tablet
     - Tapping photo opens full-screen gallery
     - Swipe to navigate through photos
     - Each photo shows: Style name, Date added
   
   - **Tab 3: Bewertungen (Reviews)**
     - **Summary Header:**
       - Large rating number (e.g., 4.8)
       - Star visualization
       - Total review count
       - Rating breakdown bars (5★: 70%, 4★: 20%, etc.)
     
     - **Review List:**
       - Each review shows:
         - Client avatar + name
         - Star rating
         - Date posted
         - Review text (truncated, "Mehr lesen" to expand)
         - Photos (if any) - horizontal scroll
         - Helpful count: "23 fanden das hilfreich"
         - Response from provider (if any)
       - Sort: Neueste | Höchste Bewertung | Niedrigste Bewertung
       - Filter: Alle | Mit Fotos | Verifizierter Kunde
   
   - **Tab 4: Über mich (About)**
     - Bio/description text
     - Years of experience
     - Languages spoken
     - Certifications/training
     - Business hours table (Mon-Sun)
     - Cancellation policy
     - Payment methods accepted

4. **Booking Section (Sticky Footer):**
   - Shows when user scrolls
   - "Jetzt buchen" button always visible
   - Tapping button scrolls to services OR navigates to booking flow

5. **Interactions:**
   - **Message Icon:** Opens chat with provider (requires login)
   - **Share Icon:** Opens native share sheet
   - **Heart Icon:** Toggles favorite (requires login, saves to favorites list)
   - **Photo Gallery:** Swipeable, pinch-to-zoom
   - **Service Selection:** Tap to select, visual highlight, auto-scroll to booking button

### Implementation Notes:
- Use tabs component with lazy loading for each tab
- Cache profile data to allow offline viewing
- Implement image lazy loading for portfolio
- Use React Native Share API for sharing
- Track profile views for analytics

---

## FLOW 5: Book an Appointment (Complete Booking Flow)

### Overview:
Multi-step booking wizard with validation at each step. User can navigate back/forward through steps.

### Steps:

#### **STEP 1: Select Services**

1. **Display:**
   - Header: "Wähle deine Dienstleistung(en)"
   - Progress indicator: "Schritt 1 von 4"
   - List of provider's services
   - Each service card shows:
     - Service name
     - Duration (e.g., "3-4 Std.")
     - Price (e.g., "€55")
     - Short description
     - Checkbox for selection

2. **Interaction:**
   - User can select multiple services (checkboxes)
   - Show running total at bottom: "Gesamt: €{total}"
   - Mobile service option: "Mobiler Service (+€15)" - Toggle switch
   - "Weiter" button enabled only when at least 1 service selected

3. **Validation:**
   - Must select at least 1 service
   - Show error toast if user tries to proceed without selection
   - Calculate total duration and price

4. **Bottom Summary Card:**
   - Selected services count
   - Total duration
   - Total price
   - "Weiter zu Datum & Uhrzeit" button

---

#### **STEP 2: Select Date & Time**

1. **Display:**
   - Header: "Wähle Datum & Uhrzeit"
   - Progress indicator: "Schritt 2 von 4"
   - Calendar component (next 60 days)
   - Time slots grid below calendar

2. **Calendar Interaction:**
   - Dates in past: Disabled (grayed out)
   - Sundays: Disabled (example business rule)
   - Unavailable dates: Red indicator
   - Available dates: Green indicator
   - Selected date: Brown highlight (#8B4513)
   - Tapping date loads time slots for that day

3. **Time Slots Display:**
   - Grouped by time of day: "Morgen", "Nachmittag", "Abend"
   - Each slot shows time (e.g., "09:00")
   - States:
     - Available: White background, brown border
     - Selected: Brown background, white text
     - Booked: Gray, disabled
   - Grid layout (3 columns on mobile)

4. **Validation:**
   - Must select both date AND time
   - "Weiter" button disabled until both selected
   - If date has no available slots, show message: "Keine Termine verfügbar"

5. **Bottom Summary Card:**
   - Selected date in German format (e.g., "Freitag, 06. Dez 2025")
   - Selected time
   - "Weiter zu Details" button

---

#### **STEP 3: Enter Booking Details**

1. **Display:**
   - Header: "Buchungsdetails"
   - Progress indicator: "Schritt 3 von 4"
   - Form fields:
     - **Name:** Pre-filled if logged in, otherwise required input
     - **E-Mail:** Pre-filled if logged in, otherwise required input
     - **Telefonnummer:** Pre-filled if logged in, otherwise required input
     - **Notizen (Optional):** Textarea
       - Placeholder: "Besondere Wünsche oder Anmerkungen..."
       - Character limit: 500 characters
       - Counter: "{X}/500" in gray

2. **Mobile Service Section (if selected in Step 1):**
   - **Address Fields:**
     - Straße und Hausnummer: Required
     - PLZ (Postal Code): Required, 5 digits
     - Stadt: Pre-filled from user location
   - **Saved Addresses (if logged in):**
     - Dropdown: "Gespeicherte Adressen verwenden"
     - List user's saved addresses
     - Option to add new address

3. **Validation:**
   - Name: Required, min 2 characters
   - Email: Required, valid email format
   - Phone: Required, valid German phone format
   - If mobile service: Address fields required
   - Show inline validation errors in red

4. **Bottom Summary Card:**
   - Review all selections: Services, Date, Time, Address (if mobile)
   - Total price shown
   - "Weiter zur Zahlung" button

---

#### **STEP 4: Payment & Confirmation**

1. **Booking Summary Section:**
   - Provider info: Name, Photo, Business
   - Selected services list
   - Date and time
   - Address (if mobile service)
   - Subtotal
   - Mobile service fee (if applicable)
   - **Total amount**

2. **Payment Method Selection:**
   - Header: "Zahlungsmethode wählen"
   - Options (Radio buttons):
     - **Vor Ort bezahlen:**
       - "Bargeld" option
       - "Kartenzahlung vor Ort" option
     - **Online bezahlen (empfohlen):**
       - Saved credit cards list (if any)
       - "+ Neue Karte hinzufügen" button
   
   - If "Neue Karte hinzufügen":
     - Inline form OR navigate to Add Payment Method screen
     - Fields: Card number, Cardholder name, Expiry, CVV
     - "Diese Karte speichern" checkbox

3. **Policies Section:**
   - **Checkboxes (Required):**
     - "Ich akzeptiere die Stornierungsbedingungen" (required)
       - Link opens modal with full policy
       - Policy summary: Free cancellation up to 48h before, 25% fee 24-48h, 50% fee <24h
     - "Ich akzeptiere die AGB" (required)

4. **Final Button:**
   - Large primary button: "Jetzt buchen" or "Zahlungspflichtig buchen (€{total})"
   - Disabled until all validations pass:
     - Payment method selected
     - Policies accepted

5. **Authentication Check:**
   - **If user is NOT logged in:**
     - Show SignInPrompt component
     - Message: "Um einen Termin zu buchen, musst du dich anmelden"
     - Options:
       - "Jetzt registrieren" - Navigate to register with returnUrl
       - "Ich habe bereits ein Konto" - Navigate to login with returnUrl
       - Social login options: Google, Apple
       - "Als Gast weiterbrowsen" - Return to home
     - Save booking data to localStorage to restore after login
   
   - **If user is logged in:**
     - Proceed to confirmation

6. **Processing:**
   - Show loading overlay: "Buchung wird verarbeitet..."
   - API calls:
     - Create booking record
     - Process payment (if online payment)
     - Send confirmation email
     - Create notification for provider
     - Create chat thread

7. **Success Screen:**
   - Green checkmark animation (bounce effect)
   - Header: "Termin bestätigt! 🎉"
   - Message: "Dein Termin wurde erfolgreich gebucht"
   - **Confirmation Card:**
     - Booking number (e.g., "#BK-20251206-0042")
     - Provider name and photo
     - Date and time
     - Duration
     - Total price
     - Payment method used
   - **Action Buttons:**
     - "Termin in Kalender speichern" (Export to native calendar)
     - "Nachricht senden" (Open chat with provider)
     - "Zur Startseite" (Navigate to home)
   - **Next Steps Card:**
     - "Du erhältst eine Bestätigungs-E-Mail"
     - "Der Anbieter wird benachrichtigt"
     - "Du kannst deinen Termin unter 'Termine' verwalten"

### Implementation Notes:
- Save booking draft at each step to prevent data loss
- Implement step navigation (back button should preserve data)
- Use form validation library (react-hook-form)
- Integrate payment gateway (Stripe recommended)
- Handle payment errors gracefully with retry option
- Send booking confirmation via email and push notification
- Update provider's calendar in real-time
- Create chat thread automatically for post-booking communication

---

## FLOW 6: Manage Appointments

### Overview:
Users can view, manage, reschedule, and cancel their appointments.

### Appointments Screen (Main View):

1. **Tab System:**
   - Three tabs: "Anstehend" | "Vergangen" | "Storniert"
   - Active tab highlighted in brown

2. **Tab: Anstehend (Upcoming Appointments):**
   
   **Display:**
   - List of upcoming appointments, sorted by date (earliest first)
   - Each appointment card shows:
     - Date banner: "Heute" / "Morgen" / "Freitag, 06. Dez" (in brown)
     - Provider photo (circular avatar)
     - Provider name + business name
     - Service name(s)
     - Time: "14:00 - 16:30 Uhr"
     - Location: "{Address}" with MapPin icon OR "Mobiler Service" badge
     - Status badge:
       - "Bestätigt" - Green
       - "Ausstehend" - Orange (waiting provider confirmation)
       - "In Bearbeitung" - Blue (service in progress)
     - Price: "€{total}"
   
   **Interactions:**
   - Tapping card → Navigate to Appointment Detail Screen
   - Swipe left → Reveal quick actions: "Nachricht" | "Stornieren"
   - Pull to refresh

3. **Tab: Vergangen (Past Appointments):**
   
   **Display:**
   - List of completed appointments, sorted by date (most recent first)
   - Same card layout as upcoming
   - Status badges:
     - "Abgeschlossen" - Green
     - "Nicht erschienen" - Red
   - "Bewertung abgeben" button if not yet reviewed
   - "Erneut buchen" button for quick rebooking
   
   **Interactions:**
   - Tapping card → Appointment Detail
   - "Bewertung abgeben" → Navigate to Write Review Screen
   - "Erneut buchen" → Navigate to Booking Flow with pre-selected service

4. **Tab: Storniert (Cancelled Appointments):**
   
   **Display:**
   - List of cancelled appointments
   - Shows who cancelled: "Von dir storniert" / "Vom Anbieter storniert"
   - Cancellation reason (if provided)
   - Refund amount (if applicable): "Rückerstattung: €{amount}"
   
   **Interactions:**
   - Tapping card → Appointment Detail
   - "Erneut buchen" option

5. **Empty States:**
   - Upcoming: "Keine anstehenden Termine. Zeit für einen neuen Style! 💇‍♀️" + "Braider finden" button
   - Past: "Noch keine vergangenen Termine"
   - Cancelled: "Keine stornierten Termine"

---

### Appointment Detail Screen:

1. **Header:**
   - Provider photo and name
   - Status badge (large)
   - Booking number: "#BK-XXXXXXX"

2. **Details Section:**
   - **Date & Time:**
     - Full date: "Freitag, 6. Dezember 2025"
     - Time: "14:00 - 16:30 Uhr"
     - Duration: "2 Stunden 30 Minuten"
   
   - **Location:**
     - If salon: Full address + "Route anzeigen" link (opens maps app)
     - If mobile: Client's address
   
   - **Services:**
     - List of all services with individual prices
     - Subtotal
     - Mobile service fee (if applicable)
     - **Total**

3. **Provider Info Card:**
   - Provider photo, name, rating
   - "Profil anzeigen" link
   - "Nachricht senden" button

4. **Payment Info:**
   - Payment method used
   - Payment status: "Bezahlt" / "Vor Ort zu zahlen"
   - If refunded: Refund amount and date

5. **Action Buttons (for upcoming appointments):**
   - **Primary Actions:**
     - "In Kalender speichern" - Export to native calendar app
     - "Route anzeigen" - Open in Google Maps / Apple Maps
     - "Nachricht senden" - Open chat
   
   - **Secondary Actions (in menu):**
     - "Termin verschieben" - Navigate to Reschedule Screen
     - "Termin stornieren" - Navigate to Cancel Screen
     - "Hilfe" - Open support

6. **Timeline (for past appointments):**
   - Booking created: Date/time
   - Confirmed: Date/time
   - Completed: Date/time
   - Reviewed: Date/time (if reviewed)

---

### Reschedule Flow:

**Step 1: Select New Date**
- Calendar showing next 60 days
- Unavailable dates grayed out
- Selected date highlighted
- "Weiter" button

**Step 2: Select New Time**
- Time slots grid for selected date
- Available slots shown
- Selected time highlighted
- "Weiter" button

**Step 3: Confirmation**
- **Current Appointment:**
  - Date and time
- **New Appointment:**
  - New date and time
- **Rescheduling Policy:**
  - Display policy (e.g., "Kostenlos bis 24h vorher")
  - If fee applies: Show fee amount
- **Reason (Optional):**
  - Dropdown with predefined reasons
  - Text area for additional notes
- **Buttons:**
  - "Verschiebung bestätigen" - Primary button
  - "Abbrechen" - Cancel and return

**Step 4: Success**
- Green checkmark animation
- "Termin erfolgreich verschoben!"
- New appointment details
- "Fertig" button

**Implementation Notes:**
- Check with provider's calendar for availability
- Send notification to provider
- Update booking record in database
- Send confirmation email
- If within fee period, process fee or adjust refund

---

### Cancel Appointment Flow:

1. **Cancel Screen Display:**
   - **Appointment Summary:**
     - Provider, service, date, time
   
   - **Cancellation Fee Calculator:**
     - Time until appointment
     - Fee calculation based on policy:
       - \>48h: 0% fee (free cancellation)
       - 24-48h: 25% fee
       - <24h: 50% fee
       - After start: 100% fee (no refund)
     - **Fee amount displayed prominently**
     - **Refund amount** (Total - Fee)
   
   - **Cancellation Policy Box:**
     - Full policy displayed
     - Link to full terms
   
   - **Reason Selection (Required):**
     - Radio buttons with predefined reasons:
       - "Terminkonflikt"
       - "Krankheit"
       - "Wetter"
       - "Entfernung zu weit"
       - "Falscher Service gebucht"
       - "Preisbedenken"
       - "Andere" (opens text field)

2. **Alternative Option:**
   - "Lieber verschieben?" button
   - Navigate to Reschedule Flow instead

3. **Confirmation Dialog:**
   - Warning message: "Bist du sicher?"
   - Fee reminder (if applicable)
   - Two buttons:
     - "Ja, stornieren" - Destructive (red)
     - "Zurück" - Cancel action

4. **Processing:**
   - Show loading: "Stornierung wird bearbeitet..."
   - API calls:
     - Update booking status to cancelled
     - Process refund (if applicable)
     - Free up time slot in provider's calendar
     - Send notification to provider
     - Send confirmation email to client

5. **Success:**
   - Checkmark animation
   - "Termin storniert"
   - Refund details (if applicable): "€{amount} wird in 3-5 Werktagen erstattet"
   - "Zur Übersicht" button

**Implementation Notes:**
- Real-time fee calculation based on current time
- Handle refunds through payment gateway
- Update all related records (bookings, notifications, calendar)
- Send cancellation email with refund details
- Allow provider to contest cancellations if necessary

---

## FLOW 7: Messaging System

### Messages Screen (Main View):

1. **Header:**
   - Title: "Nachrichten"
   - Search icon (search conversations)
   - Filter icon (filter by unread, archived, etc.)

2. **Conversation List:**
   - Each conversation card shows:
     - Provider photo (circular avatar)
     - Provider name
     - Last message preview (truncated)
     - Timestamp (e.g., "vor 5 Min." / "Gestern" / "06.12.")
     - Unread badge (count) in coral (#FF6B6B)
     - Online status indicator (green dot if online)
   
   - Sort order: Most recent first
   - Unread conversations at top
   
   - Swipe actions:
     - Left swipe: "Archivieren" / "Löschen"
     - Right swipe: "Als ungelesen markieren"

3. **Empty State:**
   - Illustration
   - "Noch keine Nachrichten"
   - "Starte ein Gespräch mit einem Anbieter"

4. **Interaction:**
   - Tap conversation → Open Chat Screen

---

### Chat Screen (Individual Conversation):

1. **Header:**
   - Back button
   - Provider photo + name
   - Online status: "Online" (green) / "Zuletzt aktiv: {time}" (gray)
   - Actions menu (three dots):
     - "Profil anzeigen"
     - "Termin buchen"
     - "Unterhaltung löschen"
     - "Blockieren & melden"

2. **Message Display Area:**
   - Messages displayed chronologically (oldest at top, newest at bottom)
   - Auto-scroll to newest message on load
   
   - **Message Bubbles:**
     - **Sent by me (right side):**
       - Brown background (#8B4513)
       - White text
       - Timestamp below
       - Status icon: Sent (checkmark) / Delivered (double checkmark) / Read (blue double checkmark)
     
     - **Received (left side):**
       - Light gray background
       - Black text
       - Provider avatar on left
       - Timestamp below
   
   - **Message Types:**
     - **Text:** Regular message bubble
     - **Image:** Thumbnail in bubble, tap to view full size
     - **System messages:** Centered, gray text (e.g., "Termin wurde gebucht")
     - **Booking cards:** Special card showing appointment details with "Details anzeigen" button

3. **Date Separators:**
   - "Heute" / "Gestern" / "06. Dezember 2025"
   - Centered between messages
   - Gray background pill

4. **Input Section (Fixed at Bottom):**
   - Text input field:
     - Placeholder: "Nachricht eingeben..."
     - Auto-expanding (max 5 lines)
     - Emoji keyboard support
   
   - **Left side buttons:**
     - "+" icon - Opens attachment menu:
       - "Foto aufnehmen" (camera)
       - "Foto aus Galerie" (photo library)
       - "Dokument senden" (file picker)
   
   - **Right side button:**
     - Send button (paper plane icon)
     - Brown background when text entered
     - Disabled (gray) when input empty

5. **Quick Actions (above input, for appointment-related chats):**
   - "Termin verschieben"
   - "Termin stornieren"
   - "Termin buchen"
   - Horizontal scrollable chips

6. **Typing Indicator:**
   - Show "{Provider name} schreibt..." with animated dots
   - Appears above input when provider is typing

7. **Interactions:**
   - **Tap message bubble:** Select message (show copy/delete options)
   - **Long press:** Quick action menu:
     - "Kopieren"
     - "Nachricht löschen" (for own messages)
     - "Antworten" (quote message)
   - **Tap image:** Full-screen view with zoom
   - **Tap booking card:** Navigate to Appointment Detail
   - **Pull down:** Load older messages (pagination)

8. **Message Sending Flow:**
   - User types message and taps send
   - Message appears immediately with "sending" status
   - Optimistic UI update
   - If send fails: Show error icon, allow retry
   - When delivered: Update status icon
   - When read by provider: Update to "read" status

9. **Push Notifications:**
   - When app in background: Push notification for new message
   - When in app but different screen: Toast notification
   - When on chat screen: No notification, just append message

### Implementation Notes:
- Use WebSocket or Firebase for real-time messaging
- Implement message pagination (load 50 at a time)
- Cache messages locally for offline viewing
- Encrypt messages for privacy
- Support media upload with compression
- Track read receipts
- Handle typing indicators with debouncing

---

## FLOW 8: Review & Rating System

### Write Review Flow:

1. **Access Points:**
   - From past appointment in Appointments screen
   - From appointment detail screen (if completed)
   - From notification prompt after appointment

2. **Write Review Screen:**
   
   **Provider Info Card:**
   - Provider photo and name
   - Service(s) received
   - Appointment date
   
   **Rating Section:**
   - **Overall Rating (Required):**
     - Large 5-star display
     - Stars interactive (tap or drag)
     - Hover effect on desktop
     - Label: "Gesamtbewertung"
   
   - **Category Ratings (Optional but encouraged):**
     - Quality (Qualität): 5 stars
     - Professionalism (Professionalität): 5 stars
     - Timeliness (Pünktlichkeit): 5 stars
     - Each category shows star selector
   
   **Review Text:**
   - Textarea: "Teile deine Erfahrung..."
   - Character limit: 10-1000 characters
   - Counter: "{X}/1000" below textarea
   - Minimum 10 characters required
   
   **Photo Upload (Optional):**
   - "Fotos hinzufügen" button
   - Opens photo picker (camera or gallery)
   - Max 5 photos
   - Max 5MB per photo
   - Show thumbnails with remove (X) button
   - Grid layout
   
   **Review Guidelines:**
   - Info box with tips:
     - "Sei ehrlich und konstruktiv"
     - "Beschreibe was dir gefallen hat"
     - "Erwähne spezifische Details"
   - Link to full review guidelines
   
   **Privacy Options:**
   - Checkbox: "Anonym bewerten" (post without name)
   
   **Submit Button:**
   - "Bewertung veröffentlichen"
   - Disabled until:
     - Overall rating given
     - Text meets minimum length

3. **Validation:**
   - Overall rating: Required
   - Text: Min 10, max 1000 characters
   - Photos: Valid format (JPG, PNG), under size limit
   - Show inline errors if validation fails

4. **Submission:**
   - Show loading: "Wird veröffentlicht..."
   - Upload photos to cloud storage
   - Create review record in database
   - Update provider's average rating
   - Send notification to provider
   - Mark appointment as reviewed

5. **Success:**
   - Checkmark animation
   - "Danke für deine Bewertung! 🌟"
   - "Deine Bewertung hilft anderen Nutzern"
   - "Fertig" button → Navigate back to appointments

6. **Post-Submission:**
   - Review appears on provider's profile
   - User can see review in "My Reviews" section
   - User can edit/delete review within 7 days

---

### My Reviews Screen:

1. **Display:**
   - List of all reviews user has written
   - Sorted by date (newest first)
   
   - Each review card shows:
     - Provider photo and name
     - Star rating given
     - Review text (truncated)
     - Photos (if any)
     - Date posted
     - "Bearbeiten" and "Löschen" buttons (if within 7 days)
     - Provider's response (if any)

2. **Edit Review:**
   - Opens same form as Write Review
   - Pre-filled with existing data
   - Can change rating, text, photos
   - "Änderungen speichern" button
   - Shows "Bearbeitet am {date}" label after save

3. **Delete Review:**
   - Confirmation dialog: "Bewertung wirklich löschen?"
   - "Ja, löschen" / "Abbrechen"
   - Permanent deletion (can't be undone)
   - Updates provider's average rating

4. **Empty State:**
   - "Du hast noch keine Bewertungen geschrieben"
   - "Nach einem Termin kannst du eine Bewertung abgeben"

### Implementation Notes:
- Allow review editing for 7 days only
- Moderate reviews for inappropriate content
- Allow providers to respond to reviews
- Calculate average ratings efficiently
- Display reviews prominently on provider profiles
- Send review notifications to providers

---

## FLOW 9: User Profile Management

### Profile Screen (Main):

1. **Header Section:**
   - Large profile photo (circular, centered)
   - Camera icon overlay to change photo
   - User name
   - Member since date
   - Edit button (top right)

2. **Quick Stats (if enough data):**
   - Total appointments
   - Total reviews given
   - Favorite providers count

3. **Menu Sections:**
   
   **Section: Mein Konto**
   - **Persönliche Informationen** → PersonalInfoScreen
     - Icon: User
   - **Haarpräferenzen** → HairPreferencesScreen
     - Icon: Sparkles
   - **Adressen verwalten** → AddressManagementScreen
     - Icon: MapPin
   
   **Section: Zahlungen**
   - **Zahlungsmethoden** → PaymentMethodsScreen
     - Icon: CreditCard
   - **Gutscheine** → VouchersScreen
     - Icon: Tag
   - **Transaktionsverlauf** → TransactionHistoryScreen
     - Icon: Receipt
   
   **Section: Aktivität**
   - **Meine Bewertungen** → MyReviewsScreen
     - Icon: Star
   - **Favoriten** → FavoritesScreen
     - Icon: Heart
   - **Buchungsverlauf** → BookingHistoryScreen
     - Icon: History
   
   **Section: Einstellungen**
   - **Benachrichtigungen** → NotificationSettingsScreen
     - Icon: Bell
     - Badge showing if notifications disabled
   - **Datenschutz & Sicherheit** → PrivacySecurityScreen
     - Icon: Shield
   - **Sprache** → LanguageScreen
     - Icon: Globe
     - Shows current: "Deutsch"
   
   **Section: Support**
   - **Hilfe & Support** → SupportScreen
     - Icon: HelpCircle
   - **Benutzerhandbuch** → UserManualScreen
     - Icon: Book
   - **Rechtliches**
     - AGB → TermsScreen
     - Datenschutz → PrivacyPolicyScreen
     - Impressum → ImprintScreen
     - Cookie-Richtlinie → CookiePolicyScreen
     - Widerrufsbelehrung → CancellationPolicyScreen
     - Community-Richtlinien → CommunityGuidelinesScreen
   
   **Section: Account**
   - **Konto löschen** → DeleteAccountScreen
     - Icon: Trash (red)
   - **Abmelden** → Confirmation dialog → Logout
     - Icon: LogOut

### Edit Profile Flow:

1. **Edit Profile Screen:**
   - **Profile Photo:**
     - Current photo displayed
     - "Foto ändern" button
     - Opens camera or gallery
     - Crop functionality
   
   - **Form Fields:**
     - Vorname: Text input
     - Nachname: Text input
     - E-Mail: Email input (verification required if changed)
     - Telefonnummer: Phone input (verification required if changed)
     - Geburtsdatum: Date picker (optional)
     - Geschlecht: Dropdown (optional): Weiblich, Männlich, Divers, Keine Angabe
   
   - **Save Button:**
     - "Änderungen speichern"
     - Disabled if no changes made
     - Validation before save

2. **Validation:**
   - Email must be valid format
   - Phone must be valid German format
   - Names minimum 2 characters
   - If email/phone changed: Send verification code

3. **Success:**
   - Toast: "Profil aktualisiert"
   - Return to Profile screen

---

### Personal Info Screen:

- **Contact Information:**
  - Email (with "Verifiziert" badge)
  - Phone (with "Verifiziert" badge)
  - Edit buttons for each

- **Basic Information:**
  - Birthday
  - Gender
  - Edit buttons

- **Account Security:**
  - "Passwort ändern" button
  - "Zwei-Faktor-Authentifizierung" toggle

---

### Hair Preferences Screen:

Purpose: Help providers understand client preferences.

1. **Hair Type:**
   - Checkboxes: 1A-4C curl pattern selector
   - Visual guide showing curl types

2. **Hair Length:**
   - Radio buttons: Kurz, Mittel, Lang

3. **Preferred Styles:**
   - Multi-select chips:
     - Box Braids
     - Cornrows
     - Twists
     - Locs
     - Senegalese
     - Etc.

4. **Hair Allergies/Sensitivities:**
   - Textarea for notes

5. **Preferred Products:**
   - Text inputs for product brands

6. **Save Button:**
   - Saves preferences to profile
   - Used to recommend providers and services

---

### Address Management Screen:

1. **Display:**
   - List of saved addresses
   - Each address card shows:
     - Address nickname (e.g., "Zuhause", "Arbeit")
     - Full address
     - "Standard" badge if default
     - Edit and Delete icons

2. **Add Address Button:**
   - "Neue Adresse hinzufügen"
   - Navigate to AddEditAddressScreen

3. **Interactions:**
   - Tap address → Set as default
   - Edit icon → AddEditAddressScreen (edit mode)
   - Delete icon → Confirmation → Delete

---

### Add/Edit Address Screen:

1. **Form Fields:**
   - **Adressbezeichnung:** Text input (e.g., "Zuhause")
   - **Straße und Hausnummer:** Required
   - **Adresszusatz:** Optional (e.g., apartment number)
   - **PLZ:** Required, 5 digits
   - **Stadt:** Required
   - **Bundesland:** Dropdown
   - **Land:** Fixed to "Deutschland"

2. **Options:**
   - Checkbox: "Als Standardadresse festlegen"

3. **Buttons:**
   - "Adresse speichern" - Primary
   - "Abbrechen" - Cancel

4. **Validation:**
   - All required fields must be filled
   - PLZ must be 5 digits
   - Show inline errors

5. **Success:**
   - Toast: "Adresse gespeichert"
   - Return to Address Management screen

---

### Payment Methods Screen:

1. **Display:**
   - List of saved payment methods
   - Each card shows:
     - Card brand logo (Visa, Mastercard, Amex)
     - Last 4 digits: "•••• 1234"
     - Cardholder name
     - Expiry date
     - "Standard" badge if default
     - Edit and Delete icons

2. **Add Payment Method Button:**
   - "+ Neue Zahlungsmethode hinzufügen"
   - Navigate to AddPaymentMethodScreen

3. **Interactions:**
   - Tap card → Set as default
   - Edit icon → Edit card details
   - Delete icon → Confirmation → Delete

4. **Empty State:**
   - "Keine Zahlungsmethode gespeichert"
   - "Füge eine Karte hinzu für schnelleres Buchen"

---

### Add Payment Method Screen:

1. **Visual Card Preview:**
   - Animated credit card graphic
   - Shows entered details in real-time
   - Card brand auto-detected

2. **Form Fields:**
   - **Kartennummer:** 16-19 digits
     - Auto-formatting: "1234 5678 9012 3456"
     - Card brand icon on right
   - **Karteninhaber:** Full name as on card
   - **Ablaufdatum:** MM/YY format
   - **CVV:** 3-4 digits
     - Help icon explaining CVV

3. **Options:**
   - Checkbox: "Karte speichern"
   - Checkbox: "Als Standardzahlungsmethode festlegen"

4. **Security Notice:**
   - Info box with lock icon
   - "Alle Zahlungsdaten werden sicher verschlüsselt"
   - "Wir speichern keine Kartendaten direkt"

5. **Validation:**
   - Card number: Valid Luhn algorithm
   - Expiry: Not expired, valid month
   - CVV: 3-4 digits
   - Name: Min 3 characters

6. **Submit:**
   - "Karte hinzufügen"
   - Show loading
   - Process through payment gateway (Stripe)
   - Save tokenized card info

7. **Success:**
   - Toast: "Zahlungsmethode hinzugefügt"
   - Return to Payment Methods screen

---

### Notification Settings Screen:

Detailed in FLOW 11 (see below).

---

### Delete Account Flow:

1. **Delete Account Screen:**
   - **Warning Section:**
     - Red alert box
     - "Dein Konto unwiderruflich löschen"
     - Explanation of what will be deleted:
       - All personal data
       - Appointment history
       - Messages
       - Reviews
       - Saved payment methods
   
   - **What Happens:**
     - List of consequences
     - "Aktive Termine werden storniert"
     - "Zahlungen werden gemäß Stornierungsbedingungen erstattet"
   
   - **Reason (Optional):**
     - Dropdown: "Warum möchtest du gehen?"
     - Reasons: Privacy concerns, Not using anymore, Found alternative, etc.
     - Textarea for feedback
   
   - **Final Confirmation:**
     - Text input: "Gib '{Username}' ein um zu bestätigen"
     - Must type exact username
   
   - **Delete Button:**
     - Red, destructive
     - "Konto unwiderruflich löschen"
     - Disabled until confirmation text matches

2. **Confirmation Dialog:**
   - "Bist du absolut sicher?"
   - "Diese Aktion kann nicht rückgängig gemacht werden"
   - "Ja, Konto löschen" / "Abbrechen"

3. **Processing:**
   - Show loading: "Konto wird gelöscht..."
   - Cancel active appointments
   - Process refunds
   - Anonymize or delete data per GDPR
   - Delete user account

4. **Success:**
   - "Dein Konto wurde gelöscht"
   - "Wir bedauern, dich gehen zu sehen"
   - Logout
   - Navigate to Welcome screen

### Implementation Notes:
- Require re-authentication before account deletion
- Follow GDPR right to erasure
- Keep minimal data for legal/financial records
- Send account deletion confirmation email
- Allow data export before deletion

---

## FLOW 10: Favorites System

### Adding to Favorites:

1. **Access Points:**
   - Provider Profile: Heart icon in header
   - Provider Card (Search, Home): Heart icon in top-right corner

2. **Interaction:**
   - Tap heart icon to favorite/unfavorite
   - Icon fills with coral color when favorited
   - Haptic feedback (vibration) on tap
   - Toast notification: "Zu Favoriten hinzugefügt" / "Aus Favoriten entfernt"

3. **Authentication:**
   - If not logged in: Show SignInPrompt
   - If logged in: Save to database immediately

---

### Favorites Screen:

1. **Display:**
   - Grid or list of favorited providers
   - Same cards as Search screen
   - Sorted by: Date added (default), Rating, Distance

2. **Interactions:**
   - Tap card → Provider Profile
   - Heart icon → Unfavorite (with confirmation)
   - Filter/sort options at top

3. **Empty State:**
   - Heart icon illustration
   - "Noch keine Favoriten"
   - "Speichere deine Lieblings-Braider hier"
   - "Braider entdecken" button

4. **Sync:**
   - Favorites sync across devices
   - Real-time updates

### Implementation Notes:
- Store favorites in user profile
- Allow quick booking from favorites
- Send notifications for favorite providers' promotions
- Show favorite badge on provider profiles

---

## FLOW 11: Notification System

### Notification Types:

1. **Booking Confirmations:**
   - Title: "Termin bestätigt"
   - Body: "{Provider} hat deinen Termin am {date} bestätigt"
   - Action: Open Appointment Detail

2. **Appointment Reminders:**
   - 24h before: "Erinnerung: Termin morgen um {time}"
   - 1h before: "Dein Termin beginnt in 1 Stunde"
   - Action: Open Appointment Detail

3. **Cancellations:**
   - Title: "Termin storniert"
   - Body: "{Provider} hat deinen Termin am {date} storniert"
   - Action: Open Appointment Detail

4. **Rescheduling:**
   - Title: "Terminänderung bestätigt"
   - Body: "Dein Termin wurde auf {new date} verschoben"
   - Action: Open Appointment Detail

5. **New Messages:**
   - Title: "{Provider name}"
   - Body: Message preview
   - Action: Open Chat

6. **Payment Confirmations:**
   - Title: "Zahlung bestätigt"
   - Body: "€{amount} wurde erfolgreich bezahlt"
   - Action: Open Transaction Detail

7. **Review Requests:**
   - Title: "Wie war dein Termin?"
   - Body: "Bewerte deinen Termin mit {Provider}"
   - Action: Open Write Review

8. **Promotions:**
   - Title: "Neues Angebot!"
   - Body: Promotion details
   - Action: Open Provider Profile or specific offer

9. **New Nearby Providers:**
   - Title: "Neuer Braider in deiner Nähe"
   - Body: "{Provider} bietet jetzt Dienste in {City}"
   - Action: Open Provider Profile

---

### Notifications Screen:

1. **Display:**
   - List of all notifications
   - Sorted by date (newest first)
   
   - Each notification shows:
     - Icon representing type
     - Title
     - Message
     - Time stamp ("vor 5 Min.", "Gestern", etc.)
     - Unread indicator (dot or background color)

2. **Tabs:**
   - "Alle" - All notifications
   - "Ungelesen" - Only unread

3. **Interactions:**
   - Tap notification → Mark as read → Navigate to relevant screen
   - Swipe left → Delete
   - Long press → Mark as read/unread
   - "Alle als gelesen markieren" button at top

4. **Empty States:**
   - All: "Keine Benachrichtigungen"
   - Unread: "Alles gelesen! 👍"

5. **Settings Link:**
   - Gear icon in header
   - Opens Notification Settings

---

### Notification Settings Screen:

1. **Master Controls:**
   - **Push-Benachrichtigungen:** Toggle
   - **E-Mail-Benachrichtigungen:** Toggle
   - **SMS-Benachrichtigungen:** Toggle

2. **Sound & Vibration:**
   - **Ton:** Toggle
   - **Benachrichtigungston:** Dropdown (select sound)
   - **Vibration:** Toggle

3. **Quiet Hours:**
   - **Ruhezeiten aktivieren:** Toggle
   - **Start:** Time picker (e.g., 22:00)
   - **Ende:** Time picker (e.g., 08:00)

4. **Notification Categories:**
   
   Each category has three toggles: Push | Email | SMS
   
   - **Buchungsbestätigungen**
   - **Terminerinnerungen**
   - **Stornierungen**
   - **Terminänderungen**
   - **Neue Nachrichten**
   - **Zahlungsbestätigungen**
   - **Bewertungsanfragen**
   - **Angebote & Aktionen**
   - **Neue Anbieter in der Nähe**

5. **Test Notification:**
   - "Testbenachrichtigung senden" button
   - Sends sample notification

6. **Save:**
   - Changes saved automatically
   - Toast: "Einstellungen gespeichert"

### Implementation Notes:
- Use Firebase Cloud Messaging (FCM) for push notifications
- Request notification permissions on first app launch
- Handle notification permissions per iOS/Android guidelines
- Store preferences in user profile
- Implement quiet hours logic server-side
- Badge icon with unread count
- Deep linking from notifications to specific screens

---

## FLOW 12: Support & Help

### Support Screen:

1. **Quick Actions:**
   - **Live Chat:** "Chat mit Support-Team"
     - Opens in-app chat widget
   - **E-Mail:** "E-Mail senden"
     - Opens email client with pre-filled support email
   - **Telefon:** "Anrufen"
     - Shows phone number, tap to call

2. **FAQs:**
   - Accordion list of common questions
   - Categories:
     - Buchungen
     - Zahlungen
     - Konto
     - Sicherheit
   - Each FAQ expandable
   - Search bar to filter FAQs

3. **Contact Form:**
   - **Betreff:** Dropdown (e.g., "Buchungsproblem", "Zahlung", "Technisch", "Anderes")
   - **Nachricht:** Textarea
   - **Anhänge:** File upload (screenshots)
   - **Submit:** "Anfrage senden"

4. **Help Articles:**
   - Link to knowledge base
   - Categories: Getting Started, Bookings, Payments, Account, etc.

5. **Social Media:**
   - Links to Instagram, Facebook, Twitter

6. **Emergency:**
   - Red button: "Notfall während Termin"
   - Opens emergency contact options

### User Manual Screen:

1. **Contents:**
   - Getting Started
   - How to Book
   - Managing Appointments
   - Payments
   - Messaging
   - Reviews
   - Account Settings

2. **Format:**
   - Scrollable document with sections
   - Images/screenshots for guidance
   - Step-by-step instructions

3. **Search:**
   - Search bar to find specific topics

### Implementation Notes:
- Integrate customer support platform (Zendesk, Intercom)
- Track support ticket status
- Send email confirmations for support requests
- Auto-reply with ticket number
- FAQ content updatable via CMS

---

# 💼 PROVIDER SIDE FLOWS (Anbieter)

---

## FLOW 1: Provider Registration & Onboarding

### Steps:

#### **1. Account Type Selection**
   - User taps "Als Anbieter registrieren" on Welcome Screen
   - Navigate to AccountTypeSelection
   - Options: "Als Kunde" | "Als Anbieter"
   - Select "Als Anbieter"
   - Navigate to Provider Welcome

---

#### **2. Provider Welcome Screen**
   - **Hero Section:**
     - Welcome message: "Wachse dein Business mit HairConnekt"
     - Subtext: "Erreiche mehr Kunden, verwalte Termine, steigere deinen Umsatz"
   
   - **Benefits List:**
     - ✓ "Tausende potenzielle Kunden erreichen"
     - ✓ "Einfache Terminverwaltung"
     - ✓ "Sichere Online-Zahlungen"
     - ✓ "Detaillierte Geschäftsanalysen"
   
   - **Button:** "Loslegen"
   - Navigate to Provider Type Selection

---

#### **3. Provider Type Selection**
   - **Header:** "Wähle deinen Anbietertyp"
   
   - **Three Options (Radio Cards):**
     - **Einzelperson (Independant Braider):**
       - Icon: User
       - Description: "Ich arbeite selbstständig"
     
     - **Salon:**
       - Icon: Store
       - Description: "Ich besitze oder verwalte einen Salon"
     
     - **Barbershop:**
       - Icon: Scissors
       - Description: "Ich besitze oder verwalte einen Barbershop"
   
   - **Button:** "Weiter"
   - Navigate to Registration Flow

---

#### **4. Provider Registration Flow (Multi-Step Form)**

**Step 1: Business Information**
   - **Business Name:** Text input (required)
   - **Provider Type:** Pre-selected from previous step (displayed, not editable)
   - **Business Address:**
     - Straße und Hausnummer
     - PLZ (5 digits)
     - Stadt
     - Bundesland (dropdown)
   - **Telefonnummer:** Phone input with +49 prefix
   - **Website (Optional):** URL input
   - **Button:** "Weiter"

**Step 2: Personal Information**
   - **Vorname:** Text input (required)
   - **Nachname:** Text input (required)
   - **E-Mail:** Email input (required)
   - **Telefonnummer (mobil):** Phone input
   - **Geburtsdatum:** Date picker (must be 18+)
   - **Button:** "Weiter"

**Step 3: Professional Details**
   - **Years of Experience:** Number input
   - **Specialties:** Multi-select checkboxes
     - Box Braids, Cornrows, Twists, Locs, Senegalese, Faux Locs, etc.
   - **Languages Spoken:** Multi-select
     - Deutsch, English, Français, Español, etc.
   - **Certifications (Optional):** Text area
   - **Button:** "Weiter"

**Step 4: Business Verification**
   - **Tax ID (Steuernummer):** Text input (required)
   - **Business License:** File upload
     - Accept: PDF, JPG, PNG
     - Max 5MB
   - **ID Verification:** File upload (ID card or passport)
   - **Info Box:**
     - "Diese Informationen werden nur zur Verifizierung verwendet"
     - "Deine Daten sind sicher und verschlüsselt"
   - **Button:** "Weiter"

**Step 5: Account Setup**
   - **Passwort erstellen:**
     - Password input with strength indicator
     - Requirements: Min 8 chars, 1 uppercase, 1 number
   - **Passwort bestätigen:**
     - Must match password
   - **Checkboxes:**
     - ✓ "Ich akzeptiere die AGB für Anbieter" (required)
     - ✓ "Ich akzeptiere die Datenschutzerklärung" (required)
     - ☐ "Marketing-E-Mails erhalten" (optional)
   - **Button:** "Registrierung abschließen"

---

#### **5. Pending Approval Screen**
   - **Status:** "Verifizierung läuft"
   - **Icon:** Clock with animation
   - **Message:**
     - "Vielen Dank für deine Registrierung!"
     - "Wir überprüfen deine Unterlagen und melden uns innerhalb von 1-2 Werktagen"
   - **What's Next:**
     - "Du erhältst eine E-Mail wenn dein Konto aktiviert wurde"
     - "In der Zwischenzeit kannst du dein Profil vorbereiten"
   - **Button:** "Profil vorbereiten" (disabled/grayed)
   - **Email Sent:** Confirmation email with tracking number

**Admin Approval Process (Backend):**
   - Admin reviews submitted documents
   - Checks business license validity
   - Verifies ID
   - Approves or rejects with reason
   - Sends email notification

---

#### **6. Account Approved (Email & Push Notification)**
   - User receives email: "Dein HairConnekt-Konto wurde aktiviert!"
   - Push notification if app installed
   - Email contains login link

---

#### **7. First Login → Provider Onboarding Tutorial**

**Tutorial (4 Steps):**

**Step 1: Dashboard Tour**
   - Highlights dashboard features
   - "Hier siehst du deine heutigen Termine und Einnahmen"
   - Screenshot/illustration
   - "Weiter" button

**Step 2: Calendar Management**
   - "Verwalte deine Verfügbarkeit im Kalender"
   - "Kunden können nur zu deinen verfügbaren Zeiten buchen"
   - Screenshot
   - "Weiter"

**Step 3: Services Setup**
   - "Füge deine Dienstleistungen hinzu"
   - "Preise, Dauer und Beschreibungen festlegen"
   - Screenshot
   - "Weiter"

**Step 4: Portfolio Upload**
   - "Zeige deine Arbeit"
   - "Fotos hochladen um mehr Kunden anzuziehen"
   - Screenshot
   - "Los geht's" button

**Completion:**
   - Save `hasCompletedProviderTutorial = true` to localStorage
   - Navigate to Provider Dashboard

---

### Implementation Notes:
- Multi-step form with progress indicator
- Validate each step before proceeding
- Save draft data if user exits mid-registration
- Email verification for provided email
- Phone verification via SMS OTP
- Secure file upload for documents
- Admin dashboard for approval workflow
- Automated background checks (optional, using third-party API)
- Notify user of approval/rejection
- Welcome email with getting started guide

---

## FLOW 2: Provider Dashboard (Main Screen)

### Dashboard Layout:

1. **Header Section:**
   - **Greeting:** "Guten Morgen, {FirstName}!"
   - **Date:** "Freitag, 6. Dezember 2025"
   - **Online/Offline Toggle:**
     - Large toggle switch
     - "Jetzt verfügbar" (green) / "Nicht verfügbar" (gray)
     - When online: Visible in client search results
     - When offline: Hidden from search, existing bookings still visible

2. **Today's Summary Cards (4 Cards in Grid):**
   
   **Card 1: Heutige Termine**
   - Icon: Calendar
   - Large number: "5"
   - Label: "Termine heute"
   - Tapping opens Calendar screen filtered to today
   
   **Card 2: Tageseinnahmen**
   - Icon: DollarSign
   - Large number: "€280"
   - Label: "Heutige Einnahmen"
   - Tapping opens Earnings screen
   
   **Card 3: Neue Buchungen**
   - Icon: Bell
   - Large number: "3"
   - Label: "Neue Anfragen"
   - Badge with count if unread
   - Tapping opens Appointment Requests
   
   **Card 4: Bewertungen**
   - Icon: Star
   - Large number: "4.8"
   - Label: "Durchschnittsbewertung"
   - Tapping opens Reviews screen

3. **Next Appointment Section:**
   - **Header:** "Nächster Termin"
   - **Card showing:**
     - Time: "14:00 - 16:30"
     - Client photo + name
     - Service(s): "Classic Box Braids"
     - Location: Address or "Mobiler Service"
     - **Quick Actions:**
       - "Route anzeigen" (if mobile service)
       - "Nachricht" (open chat)
       - "Details" (open appointment detail)
   
   - If no appointments today:
     - "Keine Termine heute"
     - "Zeit für eine Pause! ☕"

4. **Quick Actions Section:**
   - **Header:** "Schnellzugriff"
   - **Action Buttons (Grid of 6):**
     - **Termin hinzufügen:** Opens CreateAppointmentScreen
     - **Zeit blockieren:** Opens BlockTimeScreen
     - **Dienst hinzufügen:** Opens AddEditServiceScreen
     - **Portfolio aktualisieren:** Opens PortfolioManagementScreen
     - **Verfügbarkeit ändern:** Opens AvailabilitySettingsScreen
     - **Auszahlung anfordern:** Opens PayoutRequestScreen

5. **This Week Overview:**
   - **Mini Calendar:** 7-day horizontal scroll
   - Each day shows:
     - Date (e.g., "Mo 2")
     - Appointment count badge
     - Tapping day opens Calendar filtered to that date
   - Current day highlighted

6. **Statistics Section:**
   - **Header:** "Diese Woche"
   - **Two Charts (Tabs):**
     - **Termine:** Bar chart showing appointments per day
     - **Einnahmen:** Line chart showing earnings per day
   - Link: "Detaillierte Analysen" → Opens AnalyticsDashboardScreen

7. **Recent Activity Feed:**
   - **Header:** "Letzte Aktivitäten"
   - List of recent events (max 5):
     - "Julia K. hat einen Termin gebucht" - 5 Min. ago
     - "Neue Bewertung von Sarah M." - 1 Std. ago
     - "Zahlung erhalten: €55" - 2 Std. ago
     - etc.
   - "Alle anzeigen" link

8. **Bottom Navigation:**
   - Dashboard | Calendar | Clients | Messages | More
   - Active tab highlighted in brown

---

### Online/Offline Toggle Logic:

**When Toggled ON (Online):**
- Provider visible in client search results
- Marked as "Verfügbar heute" on profile
- Can receive new booking requests
- Notification: "Du bist jetzt online und für Kunden sichtbar"

**When Toggled OFF (Offline):**
- Hidden from client search results
- Existing appointments unaffected
- Cannot receive new bookings
- Notification: "Du bist jetzt offline"
- Alert: "Deine bestehenden Termine bleiben aktiv"

**Use Cases:**
- On vacation: Toggle off
- Sick day: Toggle off
- After hours: Toggle off
- Back from break: Toggle on

---

### Implementation Notes:
- Dashboard data refreshed on pull-to-refresh
- Real-time updates for new bookings (WebSocket)
- Cache dashboard data for offline viewing
- Use charts library (Recharts or Victory Native)
- Lazy load activity feed
- Show skeleton loaders while data loads
- Auto-refresh dashboard every 5 minutes when app in foreground

---

## FLOW 3: Provider Calendar Management

### Calendar Screen:

1. **Header:**
   - **Month Selector:** Dropdown to select month/year
   - **View Switcher:** Day | Week | Month views
   - **Add Button:** + icon to create appointment or block time

2. **Month View (Default):**
   - **Calendar Grid:**
     - Each date cell shows:
       - Date number
       - Dot indicators for appointments (color-coded)
       - Count badge if multiple appointments
   
   - **Color Coding:**
     - Green dot: Available slots
     - Blue dot: Confirmed appointments
     - Orange dot: Pending appointments
     - Red dot: Blocked time
     - Gray: Past dates
   
   - **Tapping Date:**
     - Opens Day View for that date
     - Shows all appointments for that day

3. **Week View:**
   - Horizontal scroll through weeks
   - Time slots (7am - 9pm) on Y-axis
   - Days of week on X-axis
   - Appointments shown as blocks
   - Tapping appointment opens detail
   - Empty slots: Can tap to create appointment

4. **Day View:**
   - Selected date header: "Freitag, 6. Dezember 2025"
   - Timeline from 7am to 9pm
   - Each hour has slot
   - Appointments shown as cards:
     - Time range
     - Client name + photo
     - Service(s)
     - Status badge
     - Quick actions: Message | Complete | Cancel
   
   - **Available Slots:**
     - Light green background
     - "Verfügbar" label
     - Tap to create appointment
   
   - **Blocked Slots:**
     - Red background
     - Reason (e.g., "Mittagspause", "Urlaub")
     - Tap to edit or remove block

5. **Floating Action Button:**
   - + icon (bottom right)
   - Opens menu:
     - "Termin hinzufügen"
     - "Zeit blockieren"

---

### Create Appointment Flow (Provider-Initiated):

**Step 1: Select Client**
   - Search bar: "Kunde suchen..."
   - List of existing clients (from past bookings)
   - Or: "Neuer Kunde" → Enter name, phone, email
   - Select client

**Step 2: Select Service(s)**
   - List of provider's services
   - Multi-select checkboxes
   - Shows duration and price for each
   - Total duration calculated

**Step 3: Select Date & Time**
   - Calendar component
   - Available dates only
   - Time slot picker
   - Must accommodate service duration

**Step 4: Confirmation**
   - Review all details
   - Notes field (optional)
   - **Button:** "Termin erstellen"
   - Sends notification to client (if client exists in system)
   - If new client: Send invitation SMS/email

**Step 5: Success**
   - "Termin erstellt!"
   - Options:
     - "Zur Kalenderansicht"
     - "Weitere Termine hinzufügen"

---

### Block Time Flow:

**Purpose:** Block calendar slots for breaks, meetings, vacations, etc.

**Step 1: Select Date Range**
   - **Start Date:** Date picker
   - **End Date:** Date picker (optional, for multi-day blocks)
   - **All Day:** Toggle
     - If off: Show time pickers

**Step 2: Select Time (if not all-day)**
   - **Start Time:** Time picker
   - **End Time:** Time picker

**Step 3: Details**
   - **Reason:** Dropdown
     - Mittagspause
     - Urlaub
     - Krankheit
     - Persönlicher Termin
     - Fortbildung
     - Sonstiges (opens text field)
   - **Notes (Optional):** Text area

**Step 4: Recurring (Optional)**
   - **Repeat:** Dropdown
     - Nie (default)
     - Täglich
     - Wöchentlich
     - Monatlich
   - **Ends:** Date picker (if recurring)

**Step 5: Confirmation**
   - Review details
   - **Button:** "Zeit blockieren"
   - Calendar updated
   - Slots unavailable for client bookings

**Step 6: Success**
   - "Zeit erfolgreich blockiert"
   - View in calendar

---

### Availability Settings Screen:

**Purpose:** Set general weekly availability (recurring schedule).

1. **Weekly Schedule:**
   - **Each Day of Week (Mon-Sun):**
     - Toggle: "Verfügbar" / "Nicht verfügbar"
     - If available:
       - **Start Time:** Time picker (e.g., 09:00)
       - **End Time:** Time picker (e.g., 18:00)
       - **+ Add Break:** Add break times (e.g., 12:00-13:00 lunch)
   
   - Example:
     - **Montag:**
       - Verfügbar: ON
       - 09:00 - 18:00
       - Break: 12:30 - 13:30
     - **Sonntag:**
       - Verfügbar: OFF

2. **Appointment Duration:**
   - **Buffer Time:** Between appointments (e.g., 15 minutes)
     - Prevents back-to-back bookings
     - Allows time for cleanup, break, etc.

3. **Advance Booking:**
   - **Minimum Notice:** How far in advance clients must book
     - Options: Same day, 1 day, 2 days, 1 week
   - **Maximum Booking Window:** How far ahead clients can book
     - Options: 1 week, 2 weeks, 1 month, 3 months

4. **Special Dates:**
   - **Holidays:** Auto-block German public holidays
   - **Custom Dates:** Add specific dates to block

5. **Save Button:**
   - "Verfügbarkeit speichern"
   - Updates calendar
   - Affects client booking flow

---

### Implementation Notes:
- Use calendar library (React Big Calendar adapted for RN or custom)
- Sync availability with booking system in real-time
- Validate appointments don't overlap
- Handle recurring blocks efficiently
- Allow drag-and-drop to reschedule (if desktop)
- Color-code different appointment types
- Export calendar to iCal/Google Calendar
- Push notifications for upcoming appointments

---

## FLOW 4: Appointment Management (Provider Side)

### Appointment Requests Screen:

**Purpose:** Providers review and approve/decline booking requests.

1. **Display:**
   - List of pending appointment requests
   - Sorted by: Date requested (newest first)
   
   - Each request card shows:
     - Client photo + name
     - "Neue Anfrage" badge (orange)
     - Requested date and time
     - Service(s) requested
     - Duration
     - Price
     - Client's booking notes (if any)
     - Time remaining to respond (e.g., "Antworten bis: 23:45 Uhr")
   
   - **Action Buttons:**
     - "Annehmen" - Green button
     - "Ablehnen" - Red outline button
     - "Details anzeigen" - View full request

2. **Accept Flow:**
   - Tap "Annehmen"
   - Confirmation: "Termin bestätigen?"
   - "Ja, bestätigen" / "Abbrechen"
   - If confirmed:
     - Update appointment status to "confirmed"
     - Send push notification to client
     - Send confirmation email
     - Add to provider's calendar
     - Toast: "Termin bestätigt"

3. **Decline Flow:**
   - Tap "Ablehnen"
   - **Reason Selection (Required):**
     - Nicht verfügbar
     - Zeitslot bereits gebucht
     - Dienst wird nicht angeboten
     - Zu kurze Vorlaufzeit
     - Sonstiges (text field)
   - **Optional Message to Client:** Text area
   - "Ablehnung bestätigen" button
   - If confirmed:
     - Update status to "declined"
     - Send notification to client with reason
     - Refund payment (if paid online)
     - Suggest alternative providers (optional)
     - Toast: "Anfrage abgelehnt"

4. **Auto-Decline:**
   - If provider doesn't respond within 24 hours:
     - System auto-declines
     - Notification sent to client
     - Provider notified of auto-decline

---

### Appointment Detail Screen (Provider View):

1. **Header:**
   - Client photo and name
   - Status badge
   - Appointment date and time

2. **Client Information:**
   - Name
   - Phone number (tap to call)
   - Email (tap to email)
   - "Kunden-Profil anzeigen" link → ClientDetailScreen
   - Booking notes from client

3. **Appointment Details:**
   - Service(s) with prices
   - Duration
   - Total price
   - Payment status
   - Payment method

4. **Location:**
   - If at salon: Business address
   - If mobile service: Client's address + "Route anzeigen" button

5. **Actions (for upcoming appointments):**
   - **Primary:**
     - "Nachricht senden" - Open chat
     - "Anrufen" - Dial client
   
   - **Secondary (Menu):**
     - "Termin abschließen" (Mark as completed)
     - "Verschieben"
     - "Stornieren"

6. **For Completed Appointments:**
   - Completion date/time
   - Final price (if different from original)
   - Client's review (if submitted)
     - Link to "Auf Bewertung antworten"

---

### Complete Appointment Flow:

1. **Trigger:**
   - Provider taps "Termin abschließen"
   - Or: Automatic at scheduled end time

2. **Completion Screen:**
   - **Appointment Summary**
   - **Final Price:**
     - Editable (in case of additional services)
     - Original: €55
     - Adjust if needed
   - **Payment Confirmation:**
     - If paid online: Already paid
     - If cash: "Bargeld erhalten bestätigen" checkbox
   - **Notes:** Optional text area (e.g., products used, recommendations)

3. **Submit:**
   - "Termin abschließen" button
   - Update status to "completed"
   - Trigger review request to client (after 1 hour)
   - Update earnings
   - Toast: "Termin abgeschlossen"

4. **Post-Completion:**
   - Appointment moves to "Past" tab
   - Earnings added to total
   - Client can now review

---

### Reschedule Appointment (Provider-Initiated):

**Similar to client flow but provider-initiated:**

1. **Reason:** Why reschedule?
   - Emergency
   - Running late
   - Double booking
   - Sonstiges
2. **Select new date/time**
3. **Notify client**
4. **Client must accept or decline**
   - If declined: Offer alternative times or cancel with full refund

---

### Cancel Appointment (Provider-Initiated):

1. **Cancel Screen:**
   - Appointment summary
   - **Warning:** "Stornierungen können deine Bewertung beeinträchtigen"
   - **Reason (Required):**
     - Notfall
     - Krankheit
     - Doppelbuchung
     - Kunde nicht erreichbar
     - Sonstiges
   - **Message to Client:** Text area

2. **Refund:**
   - Full refund automatically processed
   - Provider may incur penalty fee (per platform policy)

3. **Confirmation:**
   - "Wirklich stornieren?"
   - "Ja, stornieren" / "Abbrechen"

4. **Processing:**
   - Update status
   - Process refund
   - Notify client
   - Free up calendar slot
   - Record cancellation for analytics

5. **Success:**
   - "Termin storniert"
   - "Kunde wurde benachrichtigt"

**Note:** Frequent cancellations may result in:
- Lower search ranking
- Warning from platform
- Account suspension (if excessive)

---

### Implementation Notes:
- Track response times for appointment requests
- Auto-decline if no response within 24h
- Send reminders to provider for pending requests
- Allow bulk accept/decline (if multiple requests)
- Show calendar availability when reviewing requests
- Prevent double-booking with real-time checks
- Log all appointment changes for dispute resolution

---

## FLOW 5: Client Management (Provider Side)

### Clients Screen:

1. **Header:**
   - Search bar: "Kunde suchen..."
   - Filter button (filters by: All, Repeat Clients, New Clients, VIP)

2. **Client List:**
   - Sorted by: Recent activity (default), Name (A-Z), Total spent
   
   - Each client card shows:
     - Client photo
     - Name
     - **Quick Stats:**
       - Total appointments: "12 Termine"
       - Total spent: "€660"
       - Last visit: "vor 2 Wochen"
       - Member since: "Dabei seit März 2024"
     - VIP badge (if repeat customer, e.g., >10 bookings)
     - Star rating (if client rated you)
   
   - Tapping card → ClientDetailScreen

3. **Tabs:**
   - "Alle" - All clients
   - "Stammkunden" - Repeat clients (≥3 bookings)
   - "Neu" - Clients with 1 booking only

4. **Empty State:**
   - "Noch keine Kunden"
   - "Sobald jemand bucht, erscheint er hier"

---

### Client Detail Screen:

1. **Header:**
   - Client photo (large)
   - Name
   - "Stammkunde seit {date}" or "Neukunde"
   - VIP badge (if applicable)

2. **Quick Actions:**
   - "Nachricht senden"
   - "Anrufen"
   - "Termin erstellen"

3. **Client Stats:**
   - **Total Appointments:** 12
   - **Total Spent:** €660
   - **Average Rating Given:** 4.9★ (how client rates you)
   - **Last Visit:** 15.11.2025

4. **Appointment History:**
   - List of past appointments
   - Sorted by date (newest first)
   - Each shows:
     - Date
     - Service(s)
     - Price
     - Status
   - Tapping opens AppointmentDetailScreen

5. **Client Preferences (if available):**
   - Hair type
   - Preferred styles
   - Allergies/sensitivities
   - Product preferences
   - Special requests/notes

6. **Contact Information:**
   - Phone (tap to call)
   - Email (tap to email)
   - Address (if mobile service used)

7. **Notes Section:**
   - Provider's private notes about client
   - Text area to add/edit notes
   - "Notizen speichern" button
   - Example notes: "Bevorzugt dünnere Braids", "Allergisch gegen Produkt X"

8. **Actions Menu:**
   - "Rabatt anbieten"
   - "Als VIP markieren"
   - "Kunde blockieren" (if problematic)

---

### Implementation Notes:
- Track client lifetime value (CLV)
- Highlight high-value clients
- Allow tagging clients (e.g., "VIP", "Requires deposit")
- Export client list to CSV
- Send personalized promotions to clients
- Reminder system for follow-up bookings

---

## FLOW 6: Services Management

### Services Management Screen:

1. **Header:**
   - Title: "Meine Dienstleistungen"
   - "+ Dienst hinzufügen" button

2. **Service List:**
   - All services offered by provider
   - Each service card shows:
     - Service name
     - Duration (e.g., "3-4 Std.")
     - Price (e.g., "€55")
     - Description (truncated)
     - Active/Inactive toggle
     - Edit icon
     - Delete icon (confirmation required)

3. **Active/Inactive Toggle:**
   - Active (green): Visible to clients, bookable
   - Inactive (gray): Hidden from clients
   - Use case: Seasonal services, temporarily unavailable

4. **Add Service Button:**
   - Navigate to AddEditServiceScreen (create mode)

5. **Edit Service:**
   - Tap edit icon
   - Navigate to AddEditServiceScreen (edit mode)

---

### Add/Edit Service Screen:

1. **Form Fields:**
   
   **Service Name:**
   - Text input
   - Required
   - Example: "Classic Box Braids"
   
   **Category:**
   - Dropdown
   - Options: Box Braids, Cornrows, Twists, Locs, Senegalese, Faux Locs, Crochet, Weaves, Natural Hair, Kinderbraids, Sonstiges
   
   **Duration:**
   - Number input + Unit dropdown (Hours/Minutes)
   - Required
   - Example: "3 Std. 30 Min." or "3-4 Std." (range slider)
   
   **Price:**
   - Number input (€)
   - Required
   - Option: "ab €X" (starting from) - checkbox
   - Example: "€55" or "ab €50"
   
   **Description:**
   - Textarea
   - Optional but recommended
   - Max 500 characters
   - Example: "Klassische Box Braids in verschiedenen Größen..."
   
   **Photo:**
   - Image upload
   - Optional
   - Shows preview
   - Max 5MB
   
   **Add-Ons (Optional):**
   - "+ Add-On hinzufügen" button
   - Each add-on:
     - Name (e.g., "Extra lange Braids")
     - Additional price (e.g., "+€10")
     - Remove button
   
   **Options:**
   - Checkbox: "Mobiler Service verfügbar" (+€ fee)
   - Checkbox: "Kinderfreundlich"
   - Checkbox: "Produkte inbegriffen"

2. **Active Status:**
   - Toggle: "Dienst aktiv"
   - Default: ON for new services

3. **Buttons:**
   - "Dienst speichern" - Primary
   - "Abbrechen" - Cancel and return

4. **Validation:**
   - Name: Required
   - Duration: Required, must be > 0
   - Price: Required, must be > 0
   - Description: Max 500 chars

5. **Success:**
   - Toast: "Dienst gespeichert"
   - Return to Services Management Screen
   - Service appears in list

---

### Delete Service Flow:

1. **Trigger:** Tap delete icon on service card
2. **Confirmation Dialog:**
   - "Dienst wirklich löschen?"
   - Warning: "Dieser Dienst kann nicht mehr gebucht werden"
   - "Ja, löschen" / "Abbrechen"
3. **If Confirmed:**
   - Soft delete (mark as inactive, don't actually delete)
   - Toast: "Dienst gelöscht"
   - Remove from active list
4. **Note:** Keep record for past appointments referencing this service

---

### Implementation Notes:
- Allow service categories for organization
- Support service bundles/packages
- Implement pricing tiers (e.g., small/medium/large braids)
- Allow seasonal pricing
- Track which services are most popular
- Suggest popular services based on market data

---

## FLOW 7: Portfolio Management

### Portfolio Management Screen:

1. **Header:**
   - "Mein Portfolio"
   - "+ Fotos hochladen" button

2. **Portfolio Grid:**
   - Grid layout (2-3 columns)
   - Each photo card shows:
     - Image thumbnail
     - Service tag (e.g., "Box Braids")
     - Date added
     - Edit icon
     - Delete icon

3. **Upload Photos Button:**
   - Opens photo picker
   - Multi-select (up to 10 at once)
   - Navigate to UploadPortfolioScreen

4. **Photo Detail:**
   - Tap photo → Full screen view
   - Swipe to navigate
   - Options: Edit caption, Delete

---

### Upload Portfolio Screen:

1. **Photo Selection:**
   - "Fotos auswählen" button
   - Opens native photo picker
   - Multi-select enabled
   - Max 10 photos per upload batch

2. **Photo Preview:**
   - Grid of selected photos
   - Each photo has:
     - Remove (X) button
     - Reorder handles (drag to reorder)

3. **Details for Each Photo:**
   - **Service Category:** Dropdown
     - Box Braids, Cornrows, Twists, etc.
   - **Caption (Optional):** Text input
     - Example: "Knotless box braids with curly ends"
   - **Before/After:** Toggle
     - If enabled: Upload companion photo

4. **Validation:**
   - File format: JPG, PNG
   - Max size: 5MB per photo
   - Compression applied automatically

5. **Upload:**
   - "Hochladen" button
   - Progress bar for each photo
   - "X Fotos werden hochgeladen..."

6. **Success:**
   - "Portfolio aktualisiert!"
   - Return to Portfolio Management
   - Photos appear in grid

---

### Implementation Notes:
- Compress images before upload
- Use cloud storage (AWS S3, Cloudinary)
- Support before/after photos side-by-side
- Allow tagging photos with services
- Auto-detect image quality (warn if low-res)
- Showcase top photos on provider profile
- Allow reordering portfolio photos (drag-and-drop)

---

## FLOW 8: Earnings & Payouts

### Earnings Screen:

1. **Header:**
   - "Einnahmen"
   - Date range selector: "Diese Woche" | "Dieser Monat" | "Dieses Jahr" | "Benutzerdefiniert"

2. **Summary Cards:**
   
   **Card 1: Gesamteinnahmen**
   - Large amount: "€1,250"
   - Period: "Dieser Monat"
   - Change indicator: "+12% vs. letzter Monat" (green)
   
   **Card 2: Ausstehender Betrag**
   - Amount: "€340"
   - Label: "Verfügbar für Auszahlung"
   - "Auszahlung anfordern" button
   
   **Card 3: Bereits ausgezahlt**
   - Amount: "€910"
   - Label: "Ausgezahlt in {month}"
   - Link: "Auszahlungsverlauf"

3. **Earnings Chart:**
   - Line or bar chart
   - X-axis: Time (days, weeks, months)
   - Y-axis: Earnings (€)
   - Toggle: "Termine" | "Einnahmen"
   - Tooltip on hover/tap

4. **Breakdown Section:**
   - **By Service:**
     - List of services with earnings
     - Box Braids: €650 (52%)
     - Cornrows: €400 (32%)
     - Twists: €200 (16%)
   
   - **By Payment Method:**
     - Online: €800 (64%)
     - Cash: €450 (36%)

5. **Transaction List:**
   - Recent transactions
   - Each shows:
     - Date
     - Client name
     - Service
     - Amount
     - Payment method
     - Status (Paid, Pending, Refunded)
   - "Alle Transaktionen" link → TransactionHistoryScreen

---

### Payout Request Screen:

1. **Available Balance:**
   - Large amount: "€340"
   - "Verfügbar für Auszahlung"

2. **Payout Amount:**
   - Input field (€)
   - Default: Full available balance
   - Can request partial amount
   - Minimum: €20

3. **Payout Method:**
   - **Bank Account:**
     - List of saved bank accounts
     - Radio button to select
     - "+ Bankkonto hinzufügen" button
   
   - **PayPal (if supported):**
     - Radio button
     - PayPal email

4. **Payout Details:**
   - **Amount Requested:** €340
   - **Platform Fee:** €10 (3%)
   - **Net Amount:** €330
   - **Estimated Arrival:** 3-5 Werktage

5. **Confirmation:**
   - Checkbox: "Ich bestätige die Auszahlungsbedingungen"
   - Link to terms

6. **Submit:**
   - "Auszahlung anfordern" button
   - Show loading
   - API call to payment processor

7. **Success:**
   - Checkmark animation
   - "Auszahlung angefordert!"
   - "Du erhältst eine Bestätigung per E-Mail"
   - "Fertig" button

8. **Post-Request:**
   - Email confirmation sent
   - Status: "In Bearbeitung"
   - Track in Payout History

---

### Payout History Screen:

1. **Display:**
   - List of all payout requests
   - Sorted by date (newest first)
   
   - Each payout shows:
     - Date requested
     - Amount
     - Status:
       - "In Bearbeitung" (orange)
       - "Abgeschlossen" (green)
       - "Fehlgeschlagen" (red)
     - Destination (bank account last 4 digits)
     - Arrival date (if completed)
     - Reference number

2. **Filters:**
   - All | Completed | Pending | Failed

3. **Details:**
   - Tap payout → Full details
   - Breakdown (amount, fees, net)
   - Transaction ID
   - Support contact if issues

---

### Bank Accounts Screen:

1. **Display:**
   - List of saved bank accounts
   - Each shows:
     - Bank name
     - Account holder
     - IBAN (masked, e.g., "DE** **** **** **3456")
     - "Standard" badge if default
     - Edit and Delete icons

2. **Add Bank Account Button:**
   - "+ Bankkonto hinzufügen"
   - Navigate to AddBankAccountScreen

---

### Add Bank Account Screen:

1. **Form Fields:**
   - **Kontoinhaber:** Text input (required)
   - **IBAN:** IBAN input (required)
     - Auto-formatting
     - Validation (Luhn check)
   - **BIC/SWIFT (Optional):** Text input
   - **Bankname:** Auto-filled from IBAN or manual input

2. **Verification:**
   - **Micro-Deposit Verification (Optional):**
     - Platform sends small test deposit
     - User confirms amount to verify ownership

3. **Options:**
   - Checkbox: "Als Standardkonto festlegen"

4. **Security Notice:**
   - "Deine Bankdaten sind sicher verschlüsselt"
   - Lock icon

5. **Submit:**
   - "Bankkonto hinzufügen"
   - Validation
   - Save to database (encrypted)

6. **Success:**
   - Toast: "Bankkonto hinzugefügt"
   - Return to Bank Accounts screen

---

### Implementation Notes:
- Integrate with payment processor (Stripe Connect, Mangopay)
- Implement payout schedule (weekly, bi-weekly, monthly)
- Track all financial transactions for tax reporting
- Provide earnings analytics (trends, projections)
- Support multiple currencies (future)
- Generate tax documents (annual summary)
- Allow exporting transaction history to CSV

---

## FLOW 9: Reviews Management (Provider Side)

### Reviews Screen:

1. **Summary Header:**
   - **Overall Rating:** Large "4.8" with stars
   - **Total Reviews:** "234 Bewertungen"
   - **Rating Distribution:**
     - 5★: Progress bar (70%)
     - 4★: Progress bar (20%)
     - 3★: Progress bar (7%)
     - 2★: Progress bar (2%)
     - 1★: Progress bar (1%)

2. **Filters:**
   - Tabs: "Alle" | "Unbeantwortet" | "Positiv" | "Negativ"
   - Sort: Neueste | Älteste | Höchste | Niedrigste

3. **Review List:**
   - Each review card shows:
     - Client photo + name
     - Star rating
     - Date posted
     - Review text
     - Photos (if any)
     - Provider's response (if any)
     - "Antworten" button (if not responded)
     - "Bearbeiten" button (if already responded)

4. **Respond to Review:**
   - Tap "Antworten"
   - Modal opens:
     - Review displayed at top
     - Textarea: "Deine Antwort..."
     - Max 500 characters
     - "Antwort veröffentlichen" button
   - Best practices shown:
     - "Danke dem Kunden"
     - "Adressiere Bedenken professionell"
     - "Bleibe höflich"

5. **Edit Response:**
   - Can edit within 24 hours
   - After 24h: Permanent

6. **Empty State:**
   - "Noch keine Bewertungen"
   - "Ermutige Kunden, eine Bewertung zu hinterlassen"

---

### Implementation Notes:
- Notify provider of new reviews (push + email)
- Highlight unresponded reviews
- Allow reporting inappropriate reviews
- Track response rate and response time
- Incentivize responses (higher ranking if responsive)
- Show responses on public profile

---

## FLOW 10: Analytics Dashboard (Provider)

### Analytics Screen:

1. **Date Range Selector:**
   - Last 7 days | Last 30 days | Last 90 days | This year | Custom

2. **Key Metrics (Cards):**
   
   **Total Earnings:**
   - Amount
   - Change vs. previous period
   
   **Total Appointments:**
   - Count
   - Change vs. previous period
   
   **New Clients:**
   - Count
   - Change
   
   **Average Rating:**
   - Rating
   - Change
   
   **Cancellation Rate:**
   - Percentage
   - Change

3. **Charts:**
   
   **Earnings Over Time:**
   - Line chart
   - Daily/Weekly/Monthly granularity
   
   **Appointments Over Time:**
   - Bar chart
   
   **Service Popularity:**
   - Pie chart or bar chart
   - Which services most booked
   
   **Client Acquisition:**
   - Line chart
   - New vs. repeat clients

4. **Top Services:**
   - List of services ranked by:
     - Revenue
     - Bookings
     - Average rating

5. **Peak Times:**
   - Heatmap showing:
     - Busiest days of week
     - Busiest hours of day
   - Helps optimize scheduling

6. **Client Retention:**
   - **Repeat Client Rate:** Percentage
   - **Average Visits per Client:** Number
   - **Client Lifetime Value:** Average spend

7. **Booking Sources:**
   - Where bookings came from:
     - Direct search
     - Repeat bookings
     - Referrals
     - Promotions

8. **Export Options:**
   - "Bericht exportieren" button
   - Formats: PDF, CSV, Excel

---

### Implementation Notes:
- Use charting library (Recharts, Victory)
- Cache analytics data for performance
- Update analytics daily (not real-time for performance)
- Provide actionable insights (e.g., "Your Fridays are busiest - consider raising prices")
- Compare to market averages (if available)

---

## FLOW 11: Promotions & Vouchers (Provider)

### Vouchers Management Screen:

1. **Header:**
   - "Gutscheine & Aktionen"
   - "+ Neuen Gutschein erstellen" button

2. **Active Vouchers:**
   - List of currently active vouchers
   - Each card shows:
     - Voucher code (e.g., "SUMMER20")
     - Description
     - Discount (€ or %)
     - Valid dates
     - Usage: "12 / 50 verwendet"
     - Active toggle
     - Edit and Delete icons

3. **Inactive/Expired Vouchers:**
   - Separate section or tab
   - Past promotions

4. **Create Voucher:**
   - Navigate to CreateEditVoucherScreen

---

### Create/Edit Voucher Screen:

1. **Voucher Type:**
   - Radio buttons:
     - "Prozentrabatt" (e.g., 20% off)
     - "Festbetrag" (e.g., €10 off)
     - "Kostenloser Dienst"

2. **Discount Details:**
   - **If Prozentrabatt:**
     - Percentage input (1-100%)
     - Max discount amount (optional, e.g., "Max €50 Rabatt")
   
   - **If Festbetrag:**
     - Amount input (€)
   
   - **If Kostenloser Dienst:**
     - Dropdown: Select which service is free

3. **Voucher Code:**
   - Text input (auto-generate button)
   - Example: "NEUKUNDE", "SOMMER2025"
   - Unique validation

4. **Valid Dates:**
   - Start date (date picker)
   - End date (date picker)

5. **Usage Limits:**
   - **Total Uses:** Number (e.g., 50)
   - **Uses per Client:** Number (e.g., 1)

6. **Conditions:**
   - **Minimum Purchase:** € amount (optional)
   - **Applicable Services:** Multi-select (optional - all or specific services)
   - **New Clients Only:** Checkbox

7. **Description:**
   - Textarea
   - Visible to clients when applying

8. **Submit:**
   - "Gutschein erstellen" button
   - Validation
   - Save to database

9. **Success:**
   - "Gutschein erstellt!"
   - Option to share code via:
     - Social media
     - Email to clients
     - SMS

---

### Implementation Notes:
- Track voucher usage and ROI
- Allow scheduling vouchers (auto-activate/deactivate)
- Notify clients of promotions via push/email
- Prevent abuse (limit per user, device tracking)
- Provide voucher templates (e.g., "First-time client", "Birthday special")

---

## FLOW 12: Provider Settings & Profile

### Provider Settings Screen:

Similar to client settings but with provider-specific options:

1. **Business Settings:**
   - Business Information
   - Services
   - Availability
   - Location

2. **Financial:**
   - Bank Accounts
   - Payout Settings
   - Tax Information

3. **Subscription:**
   - Current plan (Free, Basic, Pro)
   - Upgrade/Downgrade
   - Billing history

4. **Notifications:**
   - New bookings
   - Appointment reminders
   - Messages
   - Reviews
   - Payouts

5. **Privacy & Security:**
   - Password
   - Two-factor authentication
   - Login history

6. **Support:**
   - Help center
   - Contact support
   - Report an issue

7. **Legal:**
   - Provider Terms
   - Privacy Policy
   - Imprint

---

### Provider Public Profile Screen:

**Preview of what clients see:**

1. **Header:**
   - Cover photo
   - Profile photo
   - Name, business name
   - Verification badge
   - Rating and reviews count

2. **Editable Sections:**
   - Bio/About
   - Specialties
   - Portfolio photos
   - Services
   - Availability
   - Location

3. **Edit Button:**
   - Opens edit mode
   - Save changes
   - Preview changes before publishing

---

## FLOW 13: Messaging (Provider Side)

**Identical to client-side messaging but from provider perspective.**

Key differences:
- Provider sees all client conversations
- Can initiate messages to past clients
- Can send promotional messages (with client consent)
- Quick replies/templates for common questions

---

## FLOW 14: Subscription Plans (Provider)

### Subscription Screen:

1. **Current Plan:**
   - Plan name (e.g., "Basic")
   - Features included
   - Price (€/month)
   - Billing cycle
   - Next billing date

2. **Available Plans:**
   
   **Free Plan:**
   - €0/month
   - 5 bookings/month max
   - Basic profile
   - 5% platform fee
   
   **Basic Plan:**
   - €29/month
   - 50 bookings/month
   - Enhanced profile
   - Analytics
   - 3% platform fee
   
   **Pro Plan:**
   - €59/month
   - Unlimited bookings
   - Premium profile placement
   - Advanced analytics
   - Promotion tools
   - 2% platform fee
   - Priority support

3. **Upgrade/Downgrade:**
   - "Plan ändern" button
   - Confirm change
   - Pro-rated billing

4. **Billing History:**
   - List of past invoices
   - Download PDF

---

# 🔄 CROSS-PLATFORM FLOWS (Both Sides)

---

## Universal Features:

1. **Authentication:**
   - Login, Register, Password Reset (same for both)

2. **Messaging:**
   - Real-time chat (same implementation, different perspectives)

3. **Notifications:**
   - Push, email, SMS (configured per user type)

4. **Profile Management:**
   - Edit personal info, change password, etc.

5. **Support:**
   - Help center, contact support

6. **Legal:**
   - Terms, Privacy, Imprint, etc.

---

# 🛠️ TECHNICAL IMPLEMENTATION NOTES FOR AI AGENTS

---

## Critical Implementation Points:

### 1. **State Management:**
- Use React Context or Redux for global state
- Store: Authentication, User profile, Cart/Booking draft, Notifications
- Persist auth token in SecureStore (React Native) or localStorage (Web)

### 2. **Navigation:**
- React Navigation for React Native
- Stack, Tab, Drawer navigators as needed
- Deep linking for notifications → specific screens

### 3. **API Integration:**
- RESTful API or GraphQL
- Base URL from environment config
- JWT tokens for authentication
- Axios or Fetch for requests
- Request/response interceptors for auth

### 4. **Real-Time Features:**
- WebSocket (Socket.io) for:
  - Messaging
  - Booking updates
  - Online status
- Fallback to polling if WebSocket unavailable

### 5. **Offline Support:**
- Cache critical data (profiles, appointments)
- Queue actions when offline (send message, book appointment)
- Sync when back online

### 6. **Image Handling:**
- Compress images before upload (react-native-image-picker)
- Use CDN for serving images (Cloudinary, AWS S3)
- Lazy loading for galleries

### 7. **Forms:**
- Use react-hook-form for validation
- Yup for schema validation
- Show inline errors
- Disable submit until valid

### 8. **Payments:**
- Stripe SDK for React Native
- PCI compliance (never store card details)
- 3D Secure for EU payments (SCA requirement)

### 9. **Notifications:**
- Firebase Cloud Messaging (FCM)
- Request permissions on app install
- Handle notification taps (deep linking)
- Badge count for unread

### 10. **Analytics:**
- Track user actions (Firebase Analytics, Mixpanel)
- Track errors (Sentry)
- Track business metrics (bookings, revenue)

### 11. **Localization:**
- i18n library (react-i18next)
- German as primary language
- Support English as secondary
- Date/time formatting (date-fns with locale)

### 12. **Accessibility:**
- Screen reader support (accessibilityLabel)
- Sufficient color contrast
- Touch targets ≥44px
- Keyboard navigation

### 13. **Performance:**
- Lazy load screens (React.lazy)
- Virtualize long lists (FlatList, SectionList)
- Optimize re-renders (React.memo, useMemo)
- Image optimization

### 14. **Security:**
- Encrypt sensitive data
- HTTPS only
- Secure API tokens
- Input validation (prevent SQL injection, XSS)
- Rate limiting on API

### 15. **Testing:**
- Unit tests (Jest)
- Integration tests
- E2E tests (Detox for RN)
- Manual QA checklist

---

## Data Models (Simplified):

```typescript
User {
  id: string
  type: 'client' | 'provider'
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar: string
  createdAt: Date
  // ... other fields
}

Provider extends User {
  businessName: string
  businessType: 'independent' | 'salon' | 'barbershop'
  address: Address
  verificationStatus: 'pending' | 'approved' | 'rejected'
  rating: number
  reviewCount: number
  isOnline: boolean
  // ... other fields
}

Service {
  id: string
  providerId: string
  name: string
  category: string
  duration: number // minutes
  price: number
  description: string
  isActive: boolean
  photo: string
  // ... other fields
}

Appointment {
  id: string
  clientId: string
  providerId: string
  serviceIds: string[]
  date: Date
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  totalPrice: number
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  notes: string
  // ... other fields
}

Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  timestamp: Date
  status: 'sent' | 'delivered' | 'read'
  attachments: string[]
  // ... other fields
}

Review {
  id: string
  appointmentId: string
  clientId: string
  providerId: string
  rating: number
  qualityRating: number
  professionalismRating: number
  timelinessRating: number
  comment: string
  photos: string[]
  response: string // provider's response
  createdAt: Date
  // ... other fields
}
```

---

## API Endpoints (Examples):

```
AUTH:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

USERS:
GET    /api/users/me
PUT    /api/users/me
DELETE /api/users/me

PROVIDERS:
GET    /api/providers
GET    /api/providers/:id
PUT    /api/providers/:id
GET    /api/providers/:id/services
GET    /api/providers/:id/reviews
GET    /api/providers/:id/availability

SERVICES:
GET    /api/services
POST   /api/services
PUT    /api/services/:id
DELETE /api/services/:id

APPOINTMENTS:
GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id
POST   /api/appointments/:id/complete
POST   /api/appointments/:id/cancel

MESSAGES:
GET    /api/conversations
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/messages
PUT    /api/messages/:id/read

REVIEWS:
GET    /api/reviews
POST   /api/reviews
PUT    /api/reviews/:id
DELETE /api/reviews/:id
POST   /api/reviews/:id/respond

PAYMENTS:
POST   /api/payments/create-intent
POST   /api/payments/confirm
GET    /api/payments/methods
POST   /api/payments/methods
DELETE /api/payments/methods/:id

PAYOUTS:
POST   /api/payouts/request
GET    /api/payouts
GET    /api/payouts/:id

// ... etc.
```

---

## Common Error Handling:

```typescript
// API Error Response Format
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: [
      { field: 'email', message: 'Email ist ungültig' }
    ]
  }
}

// Common Error Codes
- VALIDATION_ERROR
- AUTHENTICATION_REQUIRED
- PERMISSION_DENIED
- RESOURCE_NOT_FOUND
- CONFLICT (e.g., double booking)
- PAYMENT_FAILED
- SERVER_ERROR
```

---

## Validation Rules:

**Email:**
- Required
- Valid email format
- Max 255 characters

**Password:**
- Min 8 characters
- At least 1 uppercase letter
- At least 1 number
- Max 128 characters

**Phone:**
- German format: +49 followed by 10-11 digits
- Or allow international with country code

**Name:**
- Min 2 characters
- Max 50 characters
- Letters, spaces, hyphens only

**Price:**
- Min €0.01
- Max €9999.99
- Two decimal places

**Rating:**
- Integer 1-5

---

## Push Notification Payloads:

```json
{
  "notification": {
    "title": "Termin bestätigt",
    "body": "Sarah Mueller hat deinen Termin am 06.12. bestätigt"
  },
  "data": {
    "type": "APPOINTMENT_CONFIRMED",
    "appointmentId": "123",
    "screen": "AppointmentDetail",
    "params": { "id": "123" }
  }
}
```

Handle in app:
- If app closed: Tap opens to AppointmentDetail screen
- If app open: Show in-app notification, update data

---

## Conclusion:

This document provides comprehensive flow documentation for implementing HairConnekt in React Native. Each flow is broken down step-by-step with:

- User actions
- Screen transitions
- Data validations
- Success/error states
- API calls
- UI feedback
- Edge cases

Follow these flows carefully to ensure:
- ✅ Bug-free implementation
- ✅ Consistent user experience
- ✅ Complete feature coverage
- ✅ Proper error handling
- ✅ Accessibility compliance
- ✅ Performance optimization

**For AI Agents:** Use this as your primary reference. Each flow is self-contained with all necessary details. Implement flows one at a time, test thoroughly, then move to the next.

**Questions to ask before implementing each flow:**
1. What data do I need from the API?
2. What validations are required?
3. What error states can occur?
4. What happens on success/failure?
5. Are there authentication requirements?
6. What notifications should be sent?
7. What analytics events to track?

**Happy coding! 🚀**
