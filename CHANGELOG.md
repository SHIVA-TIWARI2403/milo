# Milo Changelog 📝

All notable changes, bug fixes, and feature releases for **Milo** (`milosathi.netlify.app`).

---

## [v1.4.0] — 2026-11-14

### 🏗️ Codebase Modularization & Architecture Refactor
* **Stylesheet Extraction (`css/style.css`):**
  * Separated ~12KB inline CSS styles from `index.html` into a clean, cached external stylesheet.
  * Added CSS variables, glassmorphic effects, responsive layout rules, and avatar styling.
* **Modular JavaScript Architecture (`js/`):**
  * **`js/config.js`:** Supabase client initialization, global reactive state, toast system, master hobby/vibe lists, and font switchers.
  * **`js/avatar.js`:** Deterministic gradient initials engine and image fallback handling.
  * **`js/auth.js`:** Google OAuth 2.0, email/password authentication, onboarding workflows, age verification, profile management, and account deletion.
  * **`js/chat.js`:** Real-time messaging with WebSockets, connection request workflows, chat timestamps, user moderation (block/report), and AI bot simulation.
  * **`js/pwa.js`:** Progressive Web App installation prompt lifecycle, Service Worker caching, WhatsApp/native share referral system, feedback, and cookie consent banner.
  * **`js/app.js`:** Core application lifecycle, mobile drawer controller, circle filters, mode switching, and discover feed matching algorithm.
* **Service Worker Update (`sw.js`):**
  * Updated asset cache to `milo-v1.4.0` including all new modular stylesheets and scripts for instant offline load performance.
* **HTML Optimization (`index.html`):**
  * Streamlined `index.html` size down by over 60%, drastically improving first contentful paint (FCP) and maintainability.

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
* **Bio Support:**
  * Added optional user bio with graceful DB fallback.
* **Google OAuth 2.0:**
  * Integrated Google sign-in with 18+ onboarding modal.
