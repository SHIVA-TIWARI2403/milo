# Milo Changelog 📝

All notable changes, bug fixes, and feature releases for **Milo** (`milosathi.netlify.app`).

---

## [v1.3.0] — 2026-11-14

### 📲 Progressive Web App (PWA) Support
* **App Manifest (`manifest.json`):** Full standalone PWA specification with high-res 192px and 512px icons.
* **Offline Service Worker (`sw.js`):** Lightweight caching for shell assets, styles, and vector graphics.
* **Install App Action:** In-app "📲 Install Milo App" trigger in navigation bar and mobile drawer.

### 🖼️ Social Sharing & Viral Growth
* **OpenGraph Banner (`og-image.png`):**
  * Generated 1200x630 rich preview card with brand logo, 18+ tag, and hobby pills.
  * WhatsApp, Telegram, Facebook, and Twitter/X now display full-bleed banner previews when sharing referral links.

### 🌟 Discovery & Cold-Start Improvements
* **Popular Hobby Circles:**
  * Quick filter chips (Cricket, Chai & Street Food, Tech & Code, Travel, Gaming, Music) for instant discovery.
* **Incomplete Profile Reminder:**
  * Added sticky warning banner for OAuth users to finish adding Date of Birth & City so they don't get hidden from matching suggestions.

---

## [v1.2.0] — 2026-11-14

### 🎨 Visual & UI Enhancements
* **Dynamic Initials & Gradient Avatars:**
  * Implemented a deterministic gradient avatar engine generating stylish vibrant initials on user discovery cards, active chat headers, and inbox lists.
* **Crisp SVG & ICO Favicon:**
  * Added branded modern gradient squircle `favicon.svg` and `favicon.ico`.

### 📱 Mobile Experience
* **Responsive Mobile Navigation Drawer:**
  * Added clean hamburger menu (`☰`) with slide-down glassmorphic drawer for screens under 760px.
  * Direct access to Friends, Dating, How It Works, Why Milo, Safety, FAQ, and Auth controls.

### 💬 Real-Time Chat & Requests
* **Message Timestamps:**
  * Every message bubble now displays clean, localized timestamps (e.g., `10:45 PM`).
* **Empty Chat Icebreakers:**
  * Uninitiated chats display helpful conversation starter prompts referencing shared hobbies.
* **Unread Requests Notification Badge:**
  * Added dynamic counter badge (`Chats (1)`) on the navigation bar.

### ⚡ Matching & Profiles
* **1-Click Mode Switcher:**
  * Seamless mode switching between Friends, Dating, and Both modes.
* **Short Bio / About Me:**
  * Added optional 120-character self-introduction field in user profile modal.

### 🛡️ Security & Guardrails
* Fixed bot sentence truncations in `SAFE_MSG` and `botReply`.
* Updated clean canonical tags on `legal.html` and refreshed `sitemap.xml`.

---

## [v1.1.0] — 2026-11-04
* Integrated Google OAuth 2.0 with Supabase GoTrue.
* Added server-side 18+ age verification triggers and onboarding modal.
* Implemented block and report safety RPCs.
* Added Cloudflare Turnstile CAPTCHA hook.
* Added Google Analytics 4 (GA4) tracking.

---

## [v1.0.0] — 2026-10-30
* Initial release of Milo — hobby-based social & dating platform for adults 18+.
* Dual modes: Friends & Dating.
* Supabase PostgreSQL database with Row Level Security (RLS).
* Glassmorphic CSS UI design.
