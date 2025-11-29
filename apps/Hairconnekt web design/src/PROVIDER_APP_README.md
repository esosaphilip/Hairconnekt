# HairConnekt Provider App Documentation

## Overview
Complete dual-purpose mobile marketplace application for the German market connecting hair braiding clients with providers (braiders, salons, and barbers).

**Key Feature:** Guests can browse the app freely without authentication. Sign-in is only required when attempting to book appointments.

## Features Implemented

### ✅ Authentication & Onboarding

#### **Client Authentication**
- **Browse as Guest**
  - Full app access without login
  - Can view providers, services, portfolios
  - Authentication required only for booking

- **Login Screen** (`/login`)
  - Email/phone and password authentication
  - Password show/hide toggle
  - Social login options (Google, Apple)
  - "Remember me" checkbox
  - "Forgot password?" link
  - Return URL support for deep linking

- **Register Screen** (`/register`)
  - **Fields:**
    - Vorname (First Name) *
    - Nachname (Last Name) *
    - E-Mail *
    - Telefonnummer (+49 DE default) *
    - Passwort (with strength indicator) *
    - Passwort wiederholen *
  - **Real-time Password Validation:**
    - Min. 8 characters
    - 1 uppercase letter
    - 1 number
    - Visual progress bar
    - Green checkmarks for met requirements
  - **Checkboxes:**
    - Terms acceptance (required, with links)
    - Newsletter opt-in (optional)
  - **Submit:** "Konto erstellen" (disabled until valid)
  - Social registration (Google, Apple)
  - Return URL support

- **Password Reset Flow** (`/forgot-password`)
  - **Step 1:** Email/phone input → Send code
  - **Step 2:** 6-digit OTP verification
    - Auto-focus input boxes
    - Auto-advance on digit entry
    - Resend timer (0:59 countdown)
    - "Code nicht erhalten? Erneut senden"
  - **Step 3:** New password with strength validation
  - **Step 4:** Success confirmation with animation
    - Animated green checkmark
    - "Passwort erfolgreich geändert!"
    - "Zur Anmeldung" button

- **Sign-In Prompt** (when booking as guest)
  - Lock icon and message
  - "Jetzt registrieren" primary button
  - "Ich habe bereits ein Konto" secondary
  - Social login options
  - "Als Gast weiterbrowsen" link

- **Welcome Screen** (`/`)
  - 3-slide onboarding carousel
  - Skip option
  - Quick test buttons (Client/Provider)

- **Account Type Selection** (`/account-type`)
  - Client or Provider selection
  - Routes to appropriate flow

### ✅ Client App

#### **Guest Browsing Mode**
- Browse without authentication
- View all providers and services
- Access search and filters
- See portfolios and reviews
- **Authentication required only for:**
  - Booking appointments
  - Saving favorites
  - Messaging providers
  - Accessing user profile

#### **Home Screen** (`/home`)
- **Guest Header:**
  - "Willkommen bei HairConnekt 👋"
  - "Anmelden" button (outline, brown)
- **Authenticated Header:**
  - User avatar and name
  - Notification bell with badge
- Location selector (Dortmund, NRW)
- Search bar with filters
- Quick actions (5 circular buttons)
- Popular styles carousel
- Nearby braiders list with:
  - Profile photos
  - Ratings and reviews
  - Specialties
  - Distance
  - Availability status
  - Verified badges
  - Favorite toggle

#### **Other Client Features**
- Search and filtering
- Provider profiles
- **Booking flow** with sign-in gate
- Appointments management
- Messaging
- User profile

### ✅ Provider App

#### **Provider Onboarding**
- **Provider Welcome** (`/provider-onboarding`)
  - Benefits presentation
  - Call-to-action for registration

- **Provider Type Selection** (`/provider-onboarding/type`)
  - Multi-select service types:
    - Individual/Freelancer
    - Salon/Barbershop
    - Mobile Service
  - Visual card selection with checkboxes

#### **Provider Dashboard** (`/provider/dashboard`)
- Welcome header with name and date
- Availability toggle (Available/Unavailable)
- **Quick Stats** (2x2 grid):
  - Today's appointments count with trend
  - Next appointment with countdown
  - Weekly earnings with comparison
  - Customer rating with review count
- **Today's Schedule**:
  - Timeline view of appointments
  - Client details with profile photos
  - Service information and pricing
  - Status badges (Confirmed, Pending)
  - Quick action buttons (Start, Message, More)
  - Free slot indicators
- **Quick Actions** (4-button grid):
  - Block time
  - Create appointment
  - Edit services
  - Set availability
- **Recent Reviews**:
  - Latest 2-3 reviews
  - Star ratings
  - Response status
  - Quick "Answer" button

#### **Provider Calendar** (`/provider/calendar`)
- View toggle (Day/Week/Month)
- Month view calendar grid
- Date navigation
- Appointment indicators (colored dots)
- Status colors:
  - Green: Confirmed
  - Yellow: Pending
  - Blue: In progress
  - Gray: Blocked
- Selected day details panel
- Appointment list with client info
- Free slot display
- Quick appointment creation

#### **Provider Clients** (`/provider/clients`)
- Client search functionality
- **Stats overview**:
  - Total clients
  - Regular customers (Stammkunden)
  - New clients this week
- Sort/Filter options
- **Client cards** with:
  - Profile photo
  - Name and phone (clickable)
  - Appointment count
  - Total spent
  - Last visit date
  - VIP/favorite badge
- Alphabet quick scroll

#### **Provider Earnings** (`/provider/earnings`)
- **Balance cards**:
  - Available balance (large display)
  - Payout request button
  - Pending payments
- **Earnings chart**:
  - Week/Month toggle
  - Interactive bar chart
  - Hover tooltips showing amount and appointments
  - Total and growth percentage
- **Recent transactions**:
  - Client name and service
  - Gross amount
  - Platform fee (10%)
  - Net earnings
  - Status badges (Paid/Pending)
  - Date and time
- **Service performance**:
  - Top services by revenue
  - Booking counts
  - Growth trends

#### **Provider Reviews** (`/provider/reviews`)
- **Overall rating summary**:
  - Large rating display (4.8)
  - Star visualization
  - Total review count
  - Rating distribution bars (5★ to 1★)
  - Trend indicator
- **Filter chips**:
  - All reviews
  - Unresponded (with badge count)
  - 5 stars only
  - With photos
- **Review cards**:
  - Client profile and verification badge
  - Star rating and date
  - Service tag
  - Review text
  - Helpful count
  - Provider response (if exists)
  - Inline response form
- **Response functionality**:
  - Textarea for response
  - Submit/Cancel buttons
  - Response display with timestamp

#### **Provider More/Settings** (`/provider/more`)
- Profile header card with:
  - Profile photo
  - Name and business name
  - Pro badge and verification status
- **Menu sections**:
  - **Business Management**:
    - My Profile
    - Public Profile Preview
    - Services & Pricing (with count badge)
    - Portfolio Management (with count)
  - **Finances**:
    - Earnings & Payouts (with balance)
    - Statistics & Reports
    - Vouchers & Offers (with active count)
    - Subscription & Fees (with plan badge)
  - **Feedback**:
    - Reviews (with rating)
  - **Settings**:
    - Settings
    - Help & Support
- Logout button
- App version footer

#### **Provider Bottom Navigation**
- 5 navigation items:
  - Dashboard (chart icon)
  - Termine/Calendar (with appointment count badge)
  - Kunden/Clients (users icon)
  - Nachrichten/Messages (with unread badge)
  - Mehr/More (menu icon)
- Active state highlighting
- Badge notifications

## Design System

### Colors (HairConnekt Brand)
- **Primary**: `#8B4513` (Rich brown)
- **Primary Dark**: `#5C2E0A`
- **Accent**: `#FF6B6B` (Coral)
- **Success**: Green shades
- **Warning**: Amber/Yellow shades

### Typography
- Default font: System fonts (San Francisco, Segoe UI, Roboto)
- Headings: h1-h5 with proper hierarchy
- Body text: 16px base size

### Layout
- Mobile-first design
- Max width: 428px (centered)
- Consistent padding: 16px (1rem)
- Bottom navigation: 64px height
- Content padding-bottom: 80px (to clear nav)

### Components
All screens use shadcn/ui components:
- Cards, Buttons, Badges
- Input, Textarea, Select
- Switch, Checkbox
- Avatar, Progress
- Tabs, Accordion

## Navigation Flow

```
┌─────────────────────────────────────────────────┐
│                  Welcome Screen                 │
│                        ↓                        │
│             Account Type Selection              │
├─────────────────────┬───────────────────────────┤
│   Client Path       │      Provider Path        │
│        ↓            │           ↓               │
│   Login/Register    │   Provider Onboarding     │
│        ↓            │           ↓               │
│   Client Home       │   Provider Dashboard      │
└─────────────────────┴───────────────────────────┘
```

### Provider App Routes
- `/provider-onboarding` - Welcome screen
- `/provider-onboarding/type` - Service type selection
- `/provider/dashboard` - Main dashboard
- `/provider/calendar` - Calendar view
- `/provider/clients` - Client management
- `/provider/messages` - Messaging
- `/provider/more` - Settings/menu
- `/provider/earnings` - Earnings & payouts
- `/provider/reviews` - Reviews management

### Client App Routes
- `/` - Welcome screen (onboarding)
- `/account-type` - Account type selection
- `/login` - Login screen (with returnUrl support)
- `/register` - Registration screen (with returnUrl support)
- `/forgot-password` - Password reset flow (3 steps)
- `/home` - Home screen (guest browsing enabled)
- `/search` - Search & filters
- `/appointments` - Appointments (auth required)
- `/messages` - Messaging (auth required)
- `/profile` - User profile (auth required)
- `/provider/:id` - Provider profile (guest accessible)
- `/booking/:id` - Booking flow (auth required at final step)

## Quick Start Testing

### Test Provider App
1. Navigate to `/` (Welcome screen)
2. Click "Test Provider App" button (on final slide)
3. Or navigate directly to `/provider/dashboard`

### Test Client App
1. Navigate to `/` (Welcome screen)
2. Click "Test Client App" button (on final slide)
3. Or navigate directly to `/home`

### Test Full Onboarding
1. Start at `/`
2. Go through welcome slides
3. Select "Ich biete Friseur-Services an"
4. Complete provider type selection
5. (Registration flow would follow)

## Mock Data

All screens use realistic mock data:
- Appointments with German names and realistic services
- Earnings data with proper calculations (gross, fee, net)
- Reviews with German text and ratings
- Clients with complete information

## German Localization

All text is in German:
- "Willkommen zurück" (Welcome back)
- "Termine" (Appointments)
- "Kunden" (Clients)
- "Einnahmen" (Earnings)
- "Bewertungen" (Reviews)
- Dates formatted German style: "28. Oktober 2025"
- Currency: € (Euro)
- Phone format: +49 prefix

## Responsive Design

- All screens adapt to mobile viewport
- Touch-optimized (min 48x48dp tap targets)
- Bottom navigation sticky and accessible
- Scrollable content areas
- Card-based layouts for easy scanning

## Accessibility

- Semantic HTML elements
- Proper heading hierarchy
- Alt text for images (via ImageWithFallback)
- Color contrast compliance
- Keyboard navigation support (via shadcn components)

## State Management

Currently using React component state. For production:
- Consider implementing Context API or Zustand
- Persist authentication state
- Cache user preferences
- Sync data across tabs

## Next Steps for Production

1. **Backend Integration**:
   - Connect to real authentication API
   - Implement booking system
   - Set up payment processing
   - Real-time messaging backend

2. **Additional Screens**:
   - Full registration flow (5 steps as per PRD)
   - Appointment detail screens
   - Client detail screens
   - Service management
   - Portfolio upload and management
   - Payout request flow
   - Settings screens

3. **Features**:
   - Push notifications
   - Real-time updates
   - Image upload and cropping
   - Calendar synchronization
   - PDF invoice generation
   - Analytics integration

4. **Optimization**:
   - Image lazy loading
   - Route-based code splitting
   - Performance monitoring
   - Error tracking
   - Analytics

## File Structure

```
/components
  /provider
    - ProviderWelcome.tsx
    - ProviderTypeSelection.tsx
    - ProviderDashboard.tsx
    - ProviderCalendar.tsx
    - ProviderClients.tsx
    - ProviderEarnings.tsx
    - ProviderReviews.tsx
    - ProviderMore.tsx
    - ProviderBottomNav.tsx
  /ui (shadcn components)
  - LoginScreen.tsx
  - RegisterScreen.tsx
  - WelcomeScreen.tsx
  - AccountTypeSelection.tsx
  - [Client app components...]
/styles
  - globals.css
- App.tsx (main routing)
```

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons
- **Radix UI** - Primitive components

## Browser Support

- Chrome/Edge (latest)
- Safari (iOS 12+)
- Firefox (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

Built for HairConnekt - Connecting Hair Artists with Clients
