# HairConnekt Client Authentication Flow

## Overview
The client-side authentication is designed to allow users to browse the app freely without requiring login, but prompts for authentication when attempting to book appointments.

## Authentication Screens

### 1. Login Screen (`/login`)
**Route:** `/login`

**Features:**
- Email/Phone input field
- Password field with show/hide toggle
- "Remember me" checkbox
- "Forgot password?" link
- Social login options:
  - Google (white button with logo)
  - Apple (black button with logo)
- "Don't have an account? Register" link

**Flow:**
1. User enters credentials
2. On successful login, redirects to `returnUrl` (if provided) or `/home`
3. Passes `isAuthenticated: true` in navigation state

**German Text:**
- Header: "Willkommen zurück!"
- Subheader: "Melde dich an um fortzufahren"
- Button: "Anmelden"
- Divider: "Oder anmelden mit"
- Footer: "Noch kein Konto? Jetzt registrieren"

---

### 2. Registration Screen (`/register`)
**Route:** `/register`

**Features:**
- **Form Fields:**
  - Vorname (First Name) - required
  - Nachname (Last Name) - required
  - E-Mail - required, validated
  - Telefonnummer - required, with +49 DE country code (disabled)
  - Passwort - required, with strength indicator
  - Passwort wiederholen - required, with match validation

- **Password Strength Indicator:**
  - Visual progress bar
  - Requirements checklist:
    - ✓ Min. 8 Zeichen
    - ✓ 1 Großbuchstabe
    - ✓ 1 Zahl
  - Real-time validation with green checkmarks

- **Checkboxes:**
  - "Ich akzeptiere die AGB und Datenschutzerklärung" (required, with links)
  - "Newsletter und Angebote erhalten (optional)" (optional)

- **Submit Button:**
  - Disabled until all required fields valid
  - Text: "Konto erstellen"

- **Social Registration:**
  - Google option
  - Apple option

- **Footer Link:**
  - "Bereits registriert? Anmelden"

**Validation:**
- Password match validation
- Real-time password strength check
- Terms acceptance required before submission
- All fields validated on submit

**Flow:**
1. User fills out form
2. Password requirements shown in real-time
3. Button enabled only when all requirements met
4. On successful registration, redirects to `returnUrl` or `/home`
5. Passes `isAuthenticated: true` in navigation state

---

### 3. Password Reset Screen (`/forgot-password`)
**Route:** `/forgot-password`

**Multi-Step Flow:**

#### **Step 1: Request Code**
- Header: "Passwort zurücksetzen"
- Description: "Gib deine E-Mail oder Telefonnummer ein um einen Code zu erhalten"
- Input: Email or phone number
- Button: "Code senden"
- Back button to login

#### **Step 2: Verify OTP**
- Header: "Passwort zurücksetzen"
- Description: "Wir haben einen 6-stelligen Code an {email/phone} gesendet"
- 6 separate input boxes for OTP digits
- Auto-focus next box on input
- Auto-submit when all 6 digits entered
- **Resend Timer:**
  - "Erneut senden in 0:59" (countdown)
  - When timer reaches 0: "Code nicht erhalten? Erneut senden" (clickable)
- Back button to login

**OTP Features:**
- Numeric input only
- Auto-advance to next box
- Backspace moves to previous box
- Auto-verification when complete

#### **Step 3: Reset Password**
- Header: "Passwort zurücksetzen"
- Description: "Wähle ein neues sicheres Passwort"
- **Fields:**
  - Neues Passwort (with strength indicator)
  - Passwort bestätigen (with match validation)
- **Password Requirements:**
  - Min. 8 Zeichen
  - 1 Großbuchstabe
  - 1 Zahl
- Button: "Passwort ändern" (disabled until valid)
- Back button to login

#### **Step 4: Success Confirmation**
- Animated checkmark (green circle with scale-in animation)
- Header: "Passwort erfolgreich geändert!"
- Description: "Du kannst dich jetzt mit deinem neuen Passwort anmelden"
- Button: "Zur Anmeldung"
- NO back button (one-way flow)

**Animation:**
- Success checkmark uses `animate-[scale-in_0.3s_ease-out]`
- Defined in `globals.css`

---

### 4. Sign-In Prompt (`SignInPrompt` Component)
**Usage:** Shown when unauthenticated user tries to book

**Features:**
- Lock icon in branded color circle
- Header: "Anmeldung erforderlich"
- Custom message (prop: `message`)
- Default message: "Um einen Termin zu buchen, musst du dich anmelden oder registrieren"
- **Primary Action:** "Jetzt registrieren" (brown button)
- **Secondary Action:** "Ich habe bereits ein Konto" (outline button)
- **Divider:** "Oder fortfahren mit"
- **Social Options:**
  - Google
  - Apple
- **Browse Option:** "Als Gast weiterbrowsen" (returns to /home)

**Props:**
```typescript
interface SignInPromptProps {
  message?: string;
  returnUrl?: string;
}
```

---

## Authentication Flow in BookingFlow

### Current Implementation:

1. **Browse Without Login:**
   - User can view providers
   - User can select services
   - User can choose date/time
   - User can fill booking details

2. **Booking Requires Login:**
   - When user clicks "Jetzt buchen" on final step
   - App checks `isAuthenticated` state
   - If NOT authenticated:
     - Shows `SignInPrompt` component
     - Stores current booking URL as `returnUrl`
   - If authenticated:
     - Proceeds to confirmation

3. **Return After Login:**
   - After successful login/registration
   - User is redirected back to booking flow
   - Booking state is preserved (in real app)
   - User can complete booking

### Mock Authentication State:
```typescript
// Check authentication from location state (mock)
const isAuthenticated = location.state?.isAuthenticated || false;
```

**For Production:**
- Replace with Context API / Redux / Zustand
- Use JWT tokens / session management
- Persist auth state in localStorage/cookies
- Implement proper backend authentication

---

## Home Screen Authentication UX

### Authenticated User:
```
┌─────────────────────────────┐
│ [Avatar] Hallo,             │
│          Max! 👋        [🔔]│
└─────────────────────────────┘
```

### Guest User:
```
┌─────────────────────────────┐
│ Willkommen bei              │
│ HairConnekt 👋  [Anmelden]  │
└─────────────────────────────┘
```

**Sign-In Button (Guest):**
- Small outline button
- Brown border and text
- User icon + "Anmelden"
- Navigates to `/login`

---

## Navigation Patterns

### Return URL Pattern:
```typescript
// When navigating to login/register from booking:
navigate("/login", { state: { returnUrl: "/booking/123" } });

// After successful auth:
navigate(returnUrl, { state: { isAuthenticated: true } });
```

### Routes:
- `/login` - Login screen
- `/register` - Registration screen  
- `/forgot-password` - Password reset flow
- `/home` - Home screen (browseable as guest)
- `/booking/:id` - Booking flow (auth required at final step)

---

## German Localization

All authentication screens use proper German:
- **Login:** "Anmelden"
- **Register:** "Konto erstellen", "Jetzt registrieren"
- **Password:** "Passwort", "Passwort vergessen?"
- **Email:** "E-Mail"
- **Phone:** "Telefonnummer"
- **Remember me:** "Angemeldet bleiben"
- **Terms:** "Ich akzeptiere die AGB und Datenschutzerklärung"
- **Newsletter:** "Newsletter und Angebote erhalten"
- **Social login:** "Mit Google fortfahren", "Mit Apple fortfahren"
- **Reset password:** "Passwort zurücksetzen"
- **Success:** "Passwort erfolgreich geändert!"

---

## Testing the Flow

### Test Guest Browsing:
1. Navigate to `/home`
2. Browse providers without logging in
3. Click on a provider
4. Start booking flow
5. Select service and time
6. On final step, click "Jetzt buchen"
7. See sign-in prompt

### Test Registration:
1. Navigate to `/register`
2. Fill in all fields
3. Watch password strength indicator
4. Try mismatched passwords
5. Submit valid form
6. Redirected to home (authenticated)

### Test Login:
1. Navigate to `/login`
2. Enter credentials
3. Submit
4. Redirected to home (authenticated)

### Test Password Reset:
1. Navigate to `/forgot-password`
2. Enter email/phone
3. Enter 6-digit OTP
4. Set new password
5. See success animation
6. Return to login

### Test Return URL:
1. Start booking as guest
2. Proceed to sign-in prompt
3. Click "Jetzt registrieren"
4. Complete registration
5. Should return to booking flow (in production)

---

## Design System

### Colors:
- Primary: `#8B4513` (Brown)
- Primary Hover: `#5C2E0A` (Dark brown)
- Accent: `#FF6B6B` (Coral)
- Success: `#4CAF50` (Green)
- Error: `#F44336` (Red)

### Components Used:
- `Button` - Primary actions
- `Input` - Form fields
- `Label` - Field labels
- `Checkbox` - Terms/Newsletter
- `Progress` - Password strength
- `Card` - Sign-in prompt
- `Avatar` - User profile

### Accessibility:
- Proper label associations
- Keyboard navigation
- Password visibility toggle
- Form validation messages
- Error states
- Focus management

---

## Future Enhancements

### Phase 1 (Current):
- ✅ Guest browsing
- ✅ Sign-in prompt on booking
- ✅ Full registration flow
- ✅ Login screen
- ✅ Password reset (3 steps)
- ✅ Mock authentication state

### Phase 2 (Recommended):
- [ ] Context API for global auth state
- [ ] Persistent authentication (localStorage)
- [ ] Email verification flow
- [ ] Phone verification (SMS OTP)
- [ ] Social login integration (Google/Apple OAuth)
- [ ] Profile completion after registration
- [ ] Remember me functionality
- [ ] Session timeout handling

### Phase 3 (Advanced):
- [ ] Biometric authentication
- [ ] Two-factor authentication (2FA)
- [ ] Account recovery options
- [ ] Security settings
- [ ] Login history
- [ ] Device management
- [ ] Single sign-on (SSO)

---

## Security Considerations

### Current (Mock):
- No actual password hashing
- No API calls
- State passed in navigation
- No token management

### Production Requirements:
- ✓ Hash passwords (bcrypt/argon2)
- ✓ Use HTTPS only
- ✓ Implement CSRF protection
- ✓ Use JWT or session tokens
- ✓ Implement rate limiting
- ✓ Add CAPTCHA for registration
- ✓ Secure OTP delivery
- ✓ Validate all inputs server-side
- ✓ Implement account lockout
- ✓ Log security events

---

Built for HairConnekt - Secure, user-friendly authentication
