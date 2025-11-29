# Testing Guide - New Screens

## Quick Test Routes

### Provider App - New Screens

#### 1. Availability Settings
**Route:** `/provider/availability`  
**Access from:** Provider More → "Services & Preise" (planned link)

**What to Test:**
- [ ] Toggle workday on/off for each day
- [ ] Add multiple time slots to a single day
- [ ] Remove time slots
- [ ] Copy schedule to other days
- [ ] Adjust buffer time slider (0-60 min)
- [ ] Change advance booking days
- [ ] Toggle same-day booking
- [ ] Save button shows success toast
- [ ] Navigate back to Provider More

**Expected Behavior:**
- Each day can have multiple time slots
- Time slots validate (end must be after start)
- Copy feature applies to all other days
- Save shows success and navigates back

---

#### 2. Block Time
**Route:** `/provider/calendar/block`  
**Access from:** Provider Calendar → FAB or Availability Settings

**What to Test:**
- [ ] Select different block reasons
- [ ] Custom reason when "Sonstiges" selected
- [ ] Pick start and end dates
- [ ] Toggle all-day vs specific times
- [ ] Enable repeat functionality
- [ ] Test weekly repeat with day selection
- [ ] Test repeat end conditions (never, date, count)
- [ ] Add private notes
- [ ] Review summary card
- [ ] Click "Zeit blockieren" button

**Expected Behavior:**
- Form validates required fields
- Time slots validate when not all-day
- Weekly repeat requires at least one day selected
- Summary shows all selected options
- Success toast on submit

---

#### 3. Client Detail
**Route:** `/provider/clients/1` (or any client ID)  
**Access from:** Provider Clients → Click a client card

**What to Test:**
- [ ] View client profile information
- [ ] Click phone to initiate call
- [ ] Click email to open email client
- [ ] Toggle favorite (heart icon)
- [ ] Click "Termin erstellen" → should route to create appointment with clientId
- [ ] Click "Nachricht senden" → should navigate to messages
- [ ] Click "Anrufen" → should initiate call
- [ ] Edit notes (click edit icon)
- [ ] Save notes
- [ ] Cancel notes editing
- [ ] View appointment history
- [ ] Check stats display correctly

**Expected Behavior:**
- All contact links work
- Notes save successfully with toast
- Cancel restores original notes
- Stats calculate correctly
- Quick actions navigate properly

---

#### 4. Create Appointment
**Route:** `/provider/appointments/create`  
**Also:** `/provider/appointments/create?clientId=1`  
**Access from:** Provider Dashboard FAB, Client Detail, Calendar

**What to Test:**
- [ ] Switch between "Bestehender Kunde" and "Neuer Kunde"
- [ ] Search for existing clients
- [ ] Select a client from search results
- [ ] Fill new client form
- [ ] Select date (should validate not in past)
- [ ] Select time
- [ ] Select multiple services
- [ ] Toggle between "Im Salon" and "Mobiler Service"
- [ ] Enter mobile address when mobile selected
- [ ] Select payment status (Vor Ort, Bezahlt, Rechnung)
- [ ] Add internal notes
- [ ] Submit form
- [ ] Test with pre-selected client (clientId query param)

**Expected Behavior:**
- Client search filters in real-time
- Form validates all required fields
- Mobile address required only when mobile service
- At least one service must be selected
- Success toast and navigation to calendar
- Pre-selected client shows in existing mode

---

### Client App - New Screens

#### 5. Edit Profile
**Route:** `/edit-profile`  
**Access from:** Profile Screen → "Profil bearbeiten" button

**What to Test:**
- [ ] View current profile data
- [ ] Click camera icon on avatar (mock action)
- [ ] Edit first name
- [ ] Edit last name
- [ ] Edit email
- [ ] Edit phone number
- [ ] Change birth date
- [ ] Select different gender
- [ ] Click "Speichern" (Save)
- [ ] Click "Abbrechen" (Cancel)

**Expected Behavior:**
- Form pre-fills with current data
- All fields editable
- Save shows success toast
- Cancel navigates back without saving
- Email shows verification note

---

#### 6. Address Management
**Route:** `/addresses`  
**Access from:** Profile Screen → "Meine Adressen"

**What to Test:**
- [ ] View all saved addresses
- [ ] See which address is default (badge)
- [ ] Click "Als Standard" on non-default address
- [ ] Click "Bearbeiten" on any address
- [ ] Click "Löschen" on any address
- [ ] Confirm deletion dialog
- [ ] Cancel deletion
- [ ] Click FAB (+ button) to add new address
- [ ] Icons display correctly based on label

**Expected Behavior:**
- Address count shows in header (3 addresses)
- Default badge only on one address
- Set default updates immediately with toast
- Delete requires confirmation
- Delete removes address with toast
- FAB navigates to add screen
- Different icons for Home, Work, default

---

#### 7. Add/Edit Address
**Route:** `/addresses/add` or `/addresses/edit/1`  
**Access from:** Address Management → FAB or Edit button

**What to Test:**
- [ ] Header shows "Neue Adresse" or "Adresse bearbeiten"
- [ ] Enter address label (e.g., "Zuhause")
- [ ] Enter street and house number
- [ ] Enter 5-digit postal code
- [ ] Enter city name
- [ ] Select German state from dropdown
- [ ] Toggle "Als Standardadresse festlegen"
- [ ] View live preview as you type
- [ ] Click "Speichern"
- [ ] Click "Abbrechen"
- [ ] Test form validation (empty required fields)

**Expected Behavior:**
- Form validates all required fields
- Postal code accepts only numbers (max 5 digits)
- Preview updates in real-time
- Save shows success toast
- Cancel navigates back
- Edit mode pre-fills data
- All 16 German states in dropdown

---

## Navigation Testing

### Test All Back Buttons
- [ ] Each screen has back arrow in header
- [ ] Back navigation works correctly
- [ ] No accidental routing to onboarding

### Test Logout Flow
- [ ] Provider More → Abmelden → Confirmation → Navigate to "/"
- [ ] Profile Screen → Abmelden → Confirmation → Navigate to "/"
- [ ] Both show Welcome screen (not AccountTypeSelection)

### Test Deep Linking
- [ ] Direct navigation to `/provider/availability` works
- [ ] Direct navigation to `/addresses` works
- [ ] Direct navigation to `/provider/clients/1` works
- [ ] Query params work: `/provider/appointments/create?clientId=1`

---

## Form Validation Testing

### Test Required Fields
For each form, submit without filling required fields:
- [ ] AvailabilitySettings → Error if workday enabled with no time slots
- [ ] BlockTime → Error if no start date
- [ ] CreateAppointment → Error if no client, date, time, or service
- [ ] EditProfile → All fields required
- [ ] AddAddress → Error if missing label, street, postal code, or city

### Test Invalid Data
- [ ] BlockTime: End time before start time
- [ ] Address: Postal code with letters or >5 digits
- [ ] CreateAppointment: Past dates
- [ ] AvailabilitySettings: End time before start time

---

## Mobile Responsiveness

### Test on 428px Width (iPhone 14 Pro Max)
- [ ] All screens fit within max-width
- [ ] Bottom navigation doesn't overlap content
- [ ] Buttons are tappable (min 48x48dp)
- [ ] Text is readable (min 16sp)
- [ ] Forms don't overflow
- [ ] Sticky headers work correctly

---

## Accessibility Testing

### Screen Reader Testing
- [ ] All buttons have labels
- [ ] Form fields have labels
- [ ] Icons have alt text where needed
- [ ] Headings properly structured (h1, h2, h3)

### Keyboard Navigation
- [ ] Tab through all form fields
- [ ] Enter key submits forms
- [ ] Escape key closes modals
- [ ] Focus indicators visible

### Color Contrast
- [ ] Text meets 4.5:1 contrast ratio
- [ ] Buttons have sufficient contrast
- [ ] Error messages are visible
- [ ] Success toasts are readable

---

## Performance Testing

### Load Times
- [ ] Screens load instantly (local state)
- [ ] No lag when typing in forms
- [ ] Smooth transitions between screens
- [ ] Toast notifications don't block UI

### State Management
- [ ] Form data persists when navigating
- [ ] Selections remain when going back
- [ ] No memory leaks on repeated navigation

---

## Edge Cases

### Empty States
- [ ] Address Management with 0 addresses shows empty state
- [ ] Client search with no results
- [ ] Calendar with no availability set

### Long Content
- [ ] Long client notes display correctly
- [ ] Long address text doesn't overflow
- [ ] Many time slots scroll properly
- [ ] Long service names truncate

### Extreme Values
- [ ] 52+ repeat count in block time
- [ ] 10+ time slots in one day
- [ ] Very long custom block reason
- [ ] Address with very long street name

---

## German Localization Check

### Verify All Text is German
- [ ] All buttons in German
- [ ] All labels in German
- [ ] All placeholders in German
- [ ] All error messages in German
- [ ] All success toasts in German
- [ ] Proper umlauts (ä, ö, ü, ß)
- [ ] Formal "Sie" form used (or informal "du" consistently)

### Date/Time Formats
- [ ] Dates in DD.MM.YYYY format
- [ ] Times in 24-hour format (HH:MM)
- [ ] Days of week in German (Mo, Di, Mi, etc.)
- [ ] Months in German

---

## Integration Points

### Routes That Should Link Together
- [ ] Provider More → Availability Settings
- [ ] Availability Settings → Block Time
- [ ] Block Time → Calendar
- [ ] Provider Clients → Client Detail
- [ ] Client Detail → Create Appointment (with clientId)
- [ ] Profile → Edit Profile
- [ ] Profile → Addresses
- [ ] Addresses → Add/Edit Address

### Expected Navigation Flow
```
Provider:
Dashboard → More → Availability → Save → Back to More ✓

Calendar → Block Time → Save → Back to Calendar ✓

Clients → Client Detail → Create Appointment → Save → Calendar ✓

Client:
Profile → Edit Profile → Save → Back to Profile ✓

Profile → Addresses → Add → Save → Back to Addresses ✓
```

---

## Bug Report Template

If you find issues, report using this format:

```
**Screen:** [Screen name and route]
**Issue:** [Brief description]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Browser/Device:**
[Chrome 120 / iPhone 14 Pro Max, etc.]

**Screenshots:**
[If applicable]
```

---

## Success Criteria

All tests pass when:
- ✅ All forms validate correctly
- ✅ All navigation works as expected
- ✅ No console errors
- ✅ All German text is correct
- ✅ Mobile responsive design works
- ✅ Toast notifications show appropriately
- ✅ Back buttons function correctly
- ✅ No routing to onboarding unexpectedly

---

## Quick Test Script

Run through this in 10 minutes:

1. **Provider Flow:**
   - Go to `/provider/more`
   - Navigate to availability (when linked)
   - Set Mon-Fri 9-18, Sat 10-16
   - Save ✓
   - Go to calendar, block next weekend
   - Save ✓
   - Go to clients, view client #1
   - Create appointment for client
   - Save ✓

2. **Client Flow:**
   - Go to `/profile`
   - Edit profile, change name
   - Save ✓
   - Go to addresses
   - Add new address "Home"
   - Save ✓
   - Set as default ✓
   - Delete old address ✓

3. **Logout:**
   - Click logout
   - Confirm
   - Verify on Welcome screen ✓

**All working? Ship it! 🚀**

---

End of Testing Guide
