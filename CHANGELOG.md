# Milo Changelog 📝

All notable changes, bug fixes, and feature releases for **Milo** (`milosathi.netlify.app`).

---

## [v1.2.0] — 2026-11-14

### 🎨 Visual & UI Enhancements
* **Dynamic Initials & Gradient Avatars:**
  * Implemented a deterministic gradient avatar engine generating stylish vibrant initials (e.g., "ST" for Shiva Tiwari) on user discovery cards, active chat headers, and inbox lists.
* **Crisp SVG & ICO Favicon:**
  * Added branded modern gradient squircle `favicon.svg` and `favicon.ico` to eliminate 404 missing icon warnings across modern browsers.

### 📱 Mobile Experience
* **Responsive Mobile Navigation Drawer:**
  * Added clean hamburger menu (`☰`) with slide-down glassmorphic drawer for screens under 760px.
  * Direct access to Friends, Dating, How It Works, Why Milo, Safety, FAQ, and Auth controls.
  * Auto-collapses sticky navbar controls on small devices to prevent overflow.

### 💬 Real-Time Chat & Requests
* **Message Timestamps:**
  * Every incoming and outgoing message bubble now displays clean, localized timestamps (e.g., `10:45 PM`).
* **Empty Chat Icebreakers:**
  * Uninitiated chats display helpful conversation starter prompts referencing shared hobbies.
* **Unread Requests Notification Badge:**
  * Added dynamic counter badge (`Chats (1)`) on the navigation bar when incoming connection requests arrive.

### ⚡ Matching & Profiles
* **1-Click Mode Switcher:**
  * When viewing people across different modes, users can instantly switch their profile to "Both" with a single click.
* **Short Bio / About Me:**
  * Added optional 120-character self-introduction field in user profile modal.

### 🛡️ Security & Guardrails
* **Bot Guardrail Fixes:**
  * Fixed sentence truncations in `SAFE_MSG` and `botReply` automated assistant responses.
* **SEO & Routing:**
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
