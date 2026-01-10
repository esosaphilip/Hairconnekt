# Splash & Onboarding Screens - Testing Guide

## Quick Start

### Access the Screen Navigator
Navigate to `/navigator` to see all screens and easily jump between them.

**Features:**
- Browse all 63 screens organized by category
- One-click navigation to any screen
- Reset app state button (clears localStorage)
- Shows total screen and component count

---

## Testing Checklist

### 1. SplashScreen (`/splash`)

#### Visual Tests
- [ ] Logo appears with scale animation
- [ ] HairConnekt branding displays correctly
- [ ] Gradient background (#8B4513 to #A0522D) renders properly
- [ ] Three loading dots animate in sequence
- [ ] Bottom tagline visible and readable

#### Functional Tests
- [ ] Screen displays for exactly 2.5 seconds
- [ ] Routes to `/onboarding` for first-time users
- [ ] Routes to `/` for returning users (not logged in)
- [ ] Routes to `/home` for logged-in clients
- [ ] Routes to `/provider/dashboard` for logged-in providers

#### Test Scenarios

**First-Time User:**
```bash
1. Clear localStorage (use /navigator reset button)
2. Navigate to /splash
3. Expected: Routes to /onboarding after 2.5s
```

**Returning User (Not Logged In):**
```bash
1. Set localStorage: hasCompletedOnboarding = 'true'
2. Navigate to /splash
3. Expected: Routes to / after 2.5s
```

**Logged-In Client:**
```bash
1. Set localStorage: 
   - isLoggedIn = 'true'
   - userType = 'client'
2. Navigate to /splash
3. Expected: Routes to /home after 2.5s
```

**Logged-In Provider:**
```bash
1. Set localStorage:
   - isLoggedIn = 'true'
   - userType = 'provider'
2. Navigate to /splash
3. Expected: Routes to /provider/dashboard after 2.5s
```

---

### 2. ClientOnboardingScreen (`/onboarding`)

#### Visual Tests
- [ ] Progress bars at top (4 bars)
- [ ] Skip button in top-right corner
- [ ] Back button in top-left (hidden on step 1)
- [ ] Circular icon background with proper colors
- [ ] Step counter at bottom (1 von 4, etc.)
- [ ] Large "Weiter" button at bottom

#### Step 1: Find Your Perfect Hairdresser
- [ ] Search icon displays (magnifying glass)
- [ ] Color: #FF6B6B (coral)
- [ ] Title: "Finde deinen perfekten Friseur"
- [ ] Description mentions browsing hundreds of professionals

#### Step 2: Book Instantly
- [ ] Calendar icon displays
- [ ] Color: #8B4513 (brown)
- [ ] Title: "Buche sofort einen Termin"
- [ ] Description mentions booking in seconds

#### Step 3: Stay Connected
- [ ] Message icon displays
- [ ] Color: #FF6B6B (coral)
- [ ] Title: "Bleib in Kontakt"
- [ ] Description mentions direct chat

#### Step 4: Share Experiences
- [ ] Star icon displays
- [ ] Color: #8B4513 (brown)
- [ ] Title: "Teile deine Erfahrungen"
- [ ] Button text changes to "Loslegen"

#### Functional Tests
- [ ] "Weiter" button advances to next step
- [ ] Progress bars update correctly
- [ ] Back button works (disabled on step 1)
- [ ] Skip button routes to `/location`
- [ ] "Loslegen" on final step routes to `/location`
- [ ] Saves `hasCompletedOnboarding = 'true'` to localStorage

#### Animation Tests
- [ ] Smooth slide transitions between steps
- [ ] Icon scale animation on step change
- [ ] No janky animations or flickers

---

### 3. LocationSelectionScreen (`/location`)

#### Visual Tests
- [ ] Header with gradient background and MapPin icon
- [ ] Title: "Wo möchten Sie einen Friseur finden?"
- [ ] "Aktuellen Standort verwenden" button with Navigation icon
- [ ] Search input with magnifying glass icon
- [ ] List of 15 German cities
- [ ] Each city shows: name, state, population

#### City List
Verify all 15 cities display:
- [ ] Berlin (Berlin, 3.7M)
- [ ] Hamburg (Hamburg, 1.9M)
- [ ] München (Bayern, 1.5M)
- [ ] Köln (Nordrhein-Westfalen, 1.1M)
- [ ] Frankfurt (Hessen, 760K)
- [ ] Stuttgart (Baden-Württemberg, 630K)
- [ ] Düsseldorf (Nordrhein-Westfalen, 620K)
- [ ] Dortmund (Nordrhein-Westfalen, 590K)
- [ ] Essen (Nordrhein-Westfalen, 580K)
- [ ] Leipzig (Sachsen, 600K)
- [ ] Bremen (Bremen, 570K)
- [ ] Dresden (Sachsen, 560K)
- [ ] Hannover (Niedersachsen, 540K)
- [ ] Nürnberg (Bayern, 520K)
- [ ] Duisburg (Nordrhein-Westfalen, 500K)

#### Search Functionality
- [ ] Search filters cities by name
- [ ] Search filters cities by state
- [ ] Search is case-insensitive
- [ ] Shows "Keine Städte gefunden" when no results
- [ ] Clear search shows all cities again

**Test Cases:**
```
Search "ber" → Should show: Berlin
Search "bayern" → Should show: München, Nürnberg
Search "xyz" → Should show: "Keine Städte gefunden"
```

#### Geolocation Tests
- [ ] Click "Aktuellen Standort verwenden"
- [ ] Browser requests location permission
- [ ] Toast notification: "Standort wird ermittelt..."
- [ ] Success toast: "Standort erfolgreich ermittelt"
- [ ] Routes to `/` on success
- [ ] Error toast if geolocation denied
- [ ] Saves location to localStorage

#### City Selection
- [ ] Click any city
- [ ] Saves city name to localStorage (`selectedCity`)
- [ ] Routes to `/` after brief delay
- [ ] Hover effect on city cards

---

### 4. ProviderOnboardingTutorial (`/provider-onboarding/tutorial`)

#### Visual Tests
- [ ] Welcome badge on first step (celebration emoji)
- [ ] Progress bars at top (4 bars)
- [ ] Skip button in top-right
- [ ] Back button in top-left (hidden on step 1)
- [ ] Step counter at bottom

#### Step 1: Manage Your Calendar
- [ ] Calendar icon displays
- [ ] Color: #8B4513 (brown)
- [ ] Welcome badge: "Willkommen bei HairConnekt!"
- [ ] Badge subtitle: "Ihr Geschäft wurde genehmigt"
- [ ] Title: "Verwalten Sie Ihren Kalender"

#### Step 2: Connect with Clients
- [ ] Users icon displays
- [ ] Color: #FF6B6B (coral)
- [ ] No welcome badge (only on step 1)
- [ ] Title: "Verbinden Sie sich mit Kunden"

#### Step 3: Track Your Earnings
- [ ] Euro icon displays
- [ ] Color: #8B4513 (brown)
- [ ] Title: "Verfolgen Sie Ihre Einnahmen"

#### Step 4: Grow Your Business
- [ ] BarChart icon displays
- [ ] Color: #FF6B6B (coral)
- [ ] Button text changes to "Zum Dashboard"

#### Functional Tests
- [ ] "Weiter" button advances to next step
- [ ] "Zum Dashboard" routes to `/provider/dashboard`
- [ ] Skip button routes to `/provider/dashboard`
- [ ] Back button works correctly
- [ ] Saves `hasCompletedProviderTutorial = 'true'` to localStorage

---

### 5. Updated WelcomeScreen (`/`)

#### Visual Tests
- [ ] Full-screen gradient background
- [ ] Large app icon (white rounded square)
- [ ] HairConnekt logo with hair braiding SVG
- [ ] Title: "HairConnekt"
- [ ] Subtitle: "Ihr Friseur, Ihre Zeit"
- [ ] Description text below
- [ ] Two prominent buttons
- [ ] Provider link at bottom
- [ ] Copyright footer

#### Button Tests
- [ ] "Anmelden" button (white with Login icon)
- [ ] Routes to `/login` on click
- [ ] "Konto erstellen" button (transparent with border)
- [ ] Routes to `/register` on click
- [ ] "Als Anbieter registrieren" link
- [ ] Routes to `/account-type` on click

#### Animation Tests
- [ ] Logo scales in smoothly
- [ ] Title fades in after logo
- [ ] Buttons fade in with slide-up
- [ ] All animations smooth, no lag

---

## Integration Tests

### Complete First-Time User Flow
```
1. Clear localStorage via /navigator
2. Navigate to /splash
3. Wait for splash (2.5s)
4. Should see /onboarding
5. Go through all 4 onboarding steps
6. Click "Loslegen"
7. Should see /location
8. Select a city (e.g., Berlin)
9. Should see /
10. Verify: localStorage has hasCompletedOnboarding and selectedCity
```

### Complete Provider Approval Flow
```
1. Navigate to /provider-onboarding/tutorial
2. Go through all 4 tutorial steps
3. Verify welcome badge on step 1
4. Click "Zum Dashboard"
5. Should see /provider/dashboard
6. Verify: localStorage has hasCompletedProviderTutorial
```

### Returning User Simulation
```
1. Set localStorage:
   - hasCompletedOnboarding = 'true'
   - selectedCity = 'München'
2. Navigate to /splash
3. Should skip onboarding and go to /
4. Login flow should work normally
```

---

## Browser Compatibility Tests

Test on:
- [ ] Chrome Desktop
- [ ] Chrome Mobile (iOS)
- [ ] Chrome Mobile (Android)
- [ ] Safari Desktop
- [ ] Safari Mobile (iOS)
- [ ] Firefox Desktop
- [ ] Edge Desktop

Check:
- [ ] Animations work smoothly
- [ ] localStorage persists
- [ ] Geolocation API works (with permissions)
- [ ] Touch interactions feel responsive
- [ ] No layout shifts or flickers

---

## Performance Tests

### Load Times
- [ ] Splash screen loads in < 1s
- [ ] Onboarding steps transition in < 300ms
- [ ] City list renders without lag
- [ ] No frame drops during animations

### Memory Usage
- [ ] No memory leaks when navigating between screens
- [ ] Cleanup happens on component unmount
- [ ] Animation timers are cleared properly

---

## Accessibility Tests

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape key to go back (if applicable)
- [ ] Focus indicators visible

### Screen Reader
- [ ] Images have proper alt text
- [ ] Buttons have descriptive labels
- [ ] Headings hierarchy is logical
- [ ] Status messages are announced

### Color Contrast
- [ ] White text on brown background (4.5:1 minimum)
- [ ] Button text readable
- [ ] Progress bars distinguishable
- [ ] Icons clearly visible

---

## Edge Cases & Error Handling

### Network Issues
- [ ] Splash screen handles no network gracefully
- [ ] Geolocation timeout handled
- [ ] API failures don't break UI

### localStorage Errors
- [ ] App works if localStorage is disabled
- [ ] Fallback behavior for quota exceeded
- [ ] Corrupt data handled gracefully

### Browser Back Button
- [ ] Back button works on each screen
- [ ] State is preserved correctly
- [ ] No infinite loops

### Small Screens
- [ ] Works on 320px width (iPhone SE)
- [ ] No horizontal scroll
- [ ] Touch targets not too small
- [ ] Text is readable

---

## Common Issues & Solutions

### Issue: Splash screen doesn't route
**Solution:** Check localStorage keys and values. Clear and try again.

### Issue: Animations are janky
**Solution:** Check browser performance, reduce motion if needed.

### Issue: Geolocation doesn't work
**Solution:** Check browser permissions, use HTTPS, provide fallback.

### Issue: Cities not filtering
**Solution:** Check search input state and filter logic.

### Issue: Progress bars not updating
**Solution:** Verify currentStep state changes correctly.

---

## Regression Testing

Before each release, verify:
- [ ] All 4 new screens load correctly
- [ ] Updated WelcomeScreen works as expected
- [ ] User flows complete without errors
- [ ] localStorage is managed properly
- [ ] No console errors
- [ ] Animations are smooth
- [ ] German text is correct
- [ ] Colors match brand palette

---

## Testing Tools

### Manual Testing
- Use `/navigator` for quick screen access
- Chrome DevTools for localStorage inspection
- React DevTools for component state

### Automated Testing (Future)
```javascript
// Example test
describe('SplashScreen', () => {
  it('routes to onboarding for first-time users', () => {
    localStorage.clear();
    render(<SplashScreen />);
    // Wait 2.5s and check navigation
  });
});
```

---

## Sign-Off Checklist

Before marking complete:
- [ ] All visual tests pass
- [ ] All functional tests pass
- [ ] Integration flows work end-to-end
- [ ] Animations are smooth
- [ ] German text is accurate
- [ ] localStorage works correctly
- [ ] No console errors
- [ ] Responsive on all screen sizes
- [ ] Accessible to screen readers
- [ ] Performance is acceptable

---

**Tested By:** _________________
**Date:** _________________
**Status:** ☐ Pass  ☐ Fail  ☐ Needs Review

**Notes:**
_________________________________
_________________________________
_________________________________
