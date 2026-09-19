# GritinAI Connect 2.0 — Volunteer Countdown Flyer Generator

## 1. Concept

A single-page, no-signup web app for GritinAI Connect 2.0 volunteers. A volunteer visits the site, uploads one photo of themselves, and the site generates a personalized countdown flyer showing how many days are left until the conference. The flyer uses their photo, is styled to match the GritinAI Connect brand, and can be downloaded as an image to share on WhatsApp status, Instagram, etc.

The next day, when they return to the site, their photo is remembered (no re-upload needed) and the flyer automatically updates to reflect the new day count. This repeats every day until the conference date, creating a running self-updating countdown campaign entirely driven by user-generated content.

**Reference/inspiration:** https://gritinaiconnect.gritinai.com/me — the official GritinAI Connect "Tell people you're coming" attendee card page. That page already implements the core mechanic we want (upload a photo client-side, add a name, generate a downloadable branded card, photo never leaves the browser). This project follows the same interaction pattern and visual language, but repurposes it into a recurring daily countdown flyer rather than a single static attendee card.

---

## 2. Core User Flow

1. **Landing** — Volunteer opens the site. No login, no signup, no form beyond what's described below.
2. **First visit:**
   - Upload/drop a photo (JPG or PNG, square-ish recommended, matching the reference site's guidance)
   - Enter their name
   - (Optional) enter their volunteer role, e.g. "Media Team", "Protocol", "Registration"
   - Click generate
   - Flyer preview renders showing their photo + name + role + today's countdown number (e.g. "9 Days to Go")
   - Download button saves the flyer as a PNG image
3. **Return visits (any day from day 8 down to day 0/event day):**
   - Site recognizes the same browser (via localStorage, see Section 4)
   - Photo, name, and role are pre-filled automatically, no re-upload needed
   - Flyer preview auto-renders with the new day's countdown number
   - Volunteer can just click download again
   - An "Change photo" or "Edit details" option should still be available in case someone wants to update their photo or fix a typo in their name
4. **On event day (Day 0):**
   - Countdown number changes to something celebratory, e.g. "Today's the Day!" or "It's Happening!" instead of a numeric countdown
5. **After the event date has passed:**
   - Site can either redirect to a thank-you message, or simply stop functioning as a countdown (this is a nice-to-have, not critical, since the campaign naturally ends after the conference)

---

## 3. Design System

Follow the CSS variables and component patterns below exactly, they are lifted directly from the existing GritinAI Connect codebase so this new page feels like a native part of the same product family.

### Important deviation from the base file: DARK BACKGROUND

The attached reference stylesheet uses a light background (`--accent2: #F4F4F2`) as the default page background. **This project should invert that and use a dark background as the primary theme**, similar to the `.host-body` / `.host-container` dark mode already defined in the stylesheet (see the "HOST BROADCASTER VIEW" section of the CSS). Reuse those dark tokens as the page-wide background rather than the light card-based screens:

```css
background-color: #0C0C0B;
background-image: radial-gradient(circle at 50% 10%, #1A2634 0%, #0C0C0B 75%);
color: #FFFFFF;
```

Cards, inputs, and buttons on top of this dark background should use the translucent dark glass treatment already established in `.host-stage-card` and `.host-sidebar-card`:

```css
background: rgba(24, 24, 27, 0.88);
border: 1px solid rgba(255, 255, 255, 0.12);
border-radius: var(--radius-lg);
backdrop-filter: blur(20px);
box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
```

The blue accent (`--blue: #0088FF`) remains the primary action/brand color throughout, exactly as in the base file, it just now sits on a dark canvas instead of a light one.

### Colors (from provided stylesheet)

```css
--blue: #0088FF;
--blue-dark: #0066CC;
--blue-light: #E6F3FF;
--blue-glow: rgba(0, 136, 255, 0.22);
--footer-dark: #111110;
--white: #ffffff;
--emerald: #10B981;
--emerald-bg: #ECFDF5;
--amber: #D97706;
--rose: #DC2626;
--text-muted: rgba(255, 255, 255, 0.7);   /* adapted for dark bg */
--text-grey: rgba(255, 255, 255, 0.55);   /* adapted for dark bg */
```

### Fonts

```css
--font-fancy: 'Cormorant Garamond', Georgia, serif;   /* headings, countdown number, titles */
--font-body: 'DM Sans', -apple-system, sans-serif;     /* body text, labels, buttons */
--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; /* not needed for this project, included for completeness */
```

Load `Cormorant Garamond` and `DM Sans` from Google Fonts.

### Border radius / shadow tokens

```css
--radius-sm: 8px;
--radius-md: 14px;
--radius-lg: 20px;
--radius-full: 9999px;
--shadow-md: 0 8px 24px rgba(0,0,0,0.07);
--shadow-lg: 0 16px 40px rgba(0,0,0,0.12);
```

### Component reuse from the provided stylesheet

Reuse these existing classes/patterns as-is (adapted to dark bg where noted):

- `.site-nav` / `.site-nav-logo` — top-left fixed GritinAI logo, same as base file
- `.btn`, `.btn-primary`, `.btn-large` — primary action buttons (Generate, Download)
- `.form-group`, `.input-label`, `input[type="text"]` — name/role input fields (adapt border/background to dark theme, keep the blue focus ring)
- `.card` pattern — but using the dark glass treatment described above instead of the light `.card` version
- `.host-timer-big` — repurpose this exact styling for the large countdown number display (Cormorant Garamond, large size, blue glow)

---

## 4. Technical Approach

### No sign-up / no backend requirement

- The photo, name, and role should be stored **entirely client-side** using `localStorage` (or `IndexedDB` if the photo needs to persist as a larger binary blob, `localStorage` has a ~5-10MB limit which is usually fine for a single compressed photo, but IndexedDB is safer for reliability).
- On page load, check localStorage for an existing saved profile (photo as a base64 string or blob URL, name, role). If found, skip the upload step and go straight to rendering that day's flyer.
- No user accounts, no server-side database, no authentication. This matches the reference site's own privacy note: *"Your photo stays in your browser; it's never uploaded anywhere."* Carry that same messaging into this project, it builds trust with volunteers uploading a personal photo.

### Countdown logic

- Hardcode the conference date: **September 26, 2026**.
- On each page load, calculate `daysRemaining = conferenceDate - today` (in whole days).
- Display logic:
  - `daysRemaining > 0` → show "`X` Days to Go"
  - `daysRemaining === 0` → show a special "Today's the Day!" variant of the flyer (different celebratory copy, same layout)
  - `daysRemaining < 0` → optional post-event state (thank you message, or simply stop showing a countdown)
- This calculation runs automatically on every visit, no manual update needed, which satisfies the requirement that the flyer "automatically updates" each day the volunteer returns.

### Flyer generation (image export)

- Render the flyer as an HTML element (photo + name + role + countdown number + GritinAI Connect branding) styled per Section 3.
- Use a client-side library to convert that HTML element into a downloadable PNG image. Recommended: **html-to-image** or **html2canvas**, both are lightweight, client-side only (no server needed), and widely supported.
- On "Download" click, trigger the image export and prompt a file download (e.g. `connect2-countdown-day9-[name].png`).

### Suggested stack

- Plain HTML/CSS/JS is sufficient given the scope (single page, no routing, no backend). React is optional if the AI IDE building this defaults to it, but is not required.
- If using React: a single component with local state for `photo`, `name`, `role`, and a `useEffect` on mount to check localStorage and calculate `daysRemaining`.
- No backend, no database, no API calls needed anywhere in this project.

---

## 5. Flyer Layout Spec

The generated flyer (both the on-screen preview and the downloaded PNG) should include, top to bottom:

1. GritinAI Connect 2.0 logo/wordmark (small, top of flyer)
2. Volunteer's uploaded photo (prominent, centered or framed distinctly, circular or rounded-square crop)
3. Volunteer's name (large, `--font-fancy`, white text)
4. Volunteer's role, if provided (smaller, muted white/grey text, directly under the name)
5. The countdown number itself as the dominant visual element, styled like `.host-timer-big`, large Cormorant Garamond numerals in blue with the glow effect, with "DAYS TO GO" or similar label beneath or beside it
6. Conference date and location as a small footer line: "September 26, 2026 · Benin City, Edo State"
7. A subtle GritinAI Connect branded background treatment (the dark radial gradient from Section 3, optionally with the blue glow accents used elsewhere in the reference stylesheet)

Suggested output dimensions: **1080x1080px** (square, ideal for WhatsApp status and Instagram) or offer both square and a 1080x1920 (story-ratio) export if time allows.

---

## 6. Page Structure (single page, no routing needed)

```
/
├── Top-left fixed nav: GritinAI logo (per .site-nav)
├── Main content (centered, max-width ~480px like .card)
│   ├── [If no saved profile] Upload zone + Name input + Role input (optional) + Generate button
│   ├── [If saved profile exists] Flyer preview auto-rendered immediately
│   ├── Flyer preview (the actual visual card described in Section 5)
│   ├── Download button (.btn-primary, .btn-large)
│   └── "Change photo" / "Edit details" ghost button (small, secondary) to reset/update saved profile
└── Footer: small text, GritinAI Connect 2.0 branding
```

---

## 7. Copy / Microcopy Reference

Match the tone of the reference site. Suggested copy:

- Page title: **"You're counting down with us"** or **"Show them you're ready"**
- Subtext: *"Upload a photo once, and come back each day for your updated countdown flyer. Your photo stays in your browser, it's never uploaded anywhere."*
- Upload zone placeholder: *"Click or drop a photo — JPG or PNG, square-ish works best"*
- Name field label: **"Your name"**
- Role field label: **"Volunteer role (optional)"**
- Generate button: **"Generate my flyer"**
- Download button: **"Download flyer"**
- Edit/reset link: **"Change photo"**
- Day 0 special copy: **"Today's the day! See you there."**

---

## 8. Out of Scope / Not Needed

- No user accounts or login
- No backend server or database
- No admin dashboard (not required for this version)
- No analytics beyond what the AI IDE includes by default
- No multi-language support

---

## 9. Deliverable

A single deployable static web page (or small React app if preferred) implementing everything above, ready to host and share as a link in the volunteer WhatsApp community for the remaining 9 days leading up to GritinAI Connect 2.0 on September 26, 2026.
