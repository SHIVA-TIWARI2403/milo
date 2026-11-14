# Milo — Meet People Who Share Your Hobbies 💜✨

<p align="center">
  <a href="https://milosathi.netlify.app"><img src="https://img.shields.io/badge/Live_Demo-milosathi.netlify.app-8A2BE2?style=for-the-badge&logo=netlify&logoColor=white" alt="Live Demo"></a>
  <img src="https://img.shields.io/badge/PWA-Installable_App-FF6B6B?style=for-the-badge&logo=pwa" alt="PWA Ready">
  <img src="https://img.shields.io/badge/Security-A%2B_Rating-00C853?style=for-the-badge&logo=shield" alt="Security A+">
  <img src="https://img.shields.io/badge/Auth-Google_OAuth_2.0-4285F4?style=for-the-badge&logo=google" alt="Google OAuth">
  <img src="https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License">
</p>

---

## 🌟 Overview

**Milo** is a modern, privacy-first social and friendship web application built exclusively for adults (**18+**). Unlike traditional dating apps driven solely by superficial swiping, Milo matches people based on **shared hobbies, vibes, and genuine interests** — whether you're looking for activity partners, friends, or dating.

🚀 **Explore Live:** [https://milosathi.netlify.app](https://milosathi.netlify.app)

---

## 🚀 Key Features

* 🎯 **Hobby & Vibe Matching:** Connect over shared passions (Cricket, Coding, Travel, Music, Books, Gaming, Chai & Street food, and more).
* 📲 **Progressive Web App (PWA):** Install Milo directly on your mobile home screen with offline caching.
* 🖼️ **Rich WhatsApp & Social Previews:** High-resolution OpenGraph banners for seamless link sharing.
* 🎨 **Dynamic Avatars & Visual Identity:** Sleek deterministic gradient avatars with initials on cards, inbox, and active chats.
* 🔄 **Dual Connection Modes:** Seamlessly switch between **Friends** mode, **Dating** mode, or **Both** (includes 1-click mode switching).
* 💬 **Enhanced Real-time Messaging:** Fast bidirectional chat with formatted timestamps, empty-state icebreakers, unread request counter badges, and instant block & report controls.
* 📱 **Full Mobile Optimization:** Responsive glassmorphic mobile navigation drawer with hamburger menu.
* 📝 **Personal Bio Support:** Express your vibe with a short bio directly on your profile card.
* 🔐 **1-Click Google OAuth:** Fast, secure login with built-in server-side 18+ age verification.
* 🛡️ **Privacy by Design:**
  * Sensitive data (email, date of birth, gender) is **strictly private** and never shared with other users.
  * Only your chosen name, username, city, hobbies, vibe, and optional bio are displayed.
* 🤖 **AI Chat Companions:** Interactive bot companions (Aarav & Anaya) for safe platform onboarding with built-in prompt safety filters.
* 📊 **Google Analytics (GA4) Integrated:** Real-time visitor insights and analytics.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Vanilla JavaScript (ES6+), Glassmorphic CSS3, Semantic HTML5, PWA Service Worker |
| **Backend & Database** | [Supabase](https://supabase.com) (PostgreSQL 17, Row Level Security, Realtime WebSockets) |
| **Authentication** | Google Cloud OAuth 2.0 + Supabase GoTrue Auth |
| **Hosting & CDN** | [Netlify](https://www.netlify.com) Edge Network |
| **Analytics** | Google Analytics 4 (`gtag.js`) |

---

## 🔒 Enterprise-Grade Security

Milo implements rigorous defensive security practices:
* **Strict Content Security Policy (CSP):** Zero unauthorized script execution, whitelisted origins only.
* **HTTP Strict Transport Security (HSTS):** Enforced HTTPS with 1-year preload policy.
* **Clickjacking Protection:** `X-Frame-Options: DENY`.
* **Row-Level Security (RLS):** Database queries are isolated per user token directly inside PostgreSQL.
* **Anti-Spam Rate Limits:** Strict server-side rate limits on connection requests and report submissions.

---

## 💻 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SHIVA-TIWARI2403/milo.git
   cd milo
   ```

2. **Run locally:**
   Simply open `index.html` in any modern web browser or serve via Live Server:
   ```bash
   npx serve .
   ```

---

## 👨‍💻 Creator & Founder

Crafted with ❤️ by **Shiva Tiwari** (Ayodhya, India).

* 🌐 **Live Website:** [milosathi.netlify.app](https://milosathi.netlify.app)
* 🐙 **GitHub:** [@SHIVA-TIWARI2403](https://github.com/SHIVA-TIWARI2403)
* 📧 **Contact:** [tiwarisatendrapratap@gmail.com](mailto:tiwarisatendrapratap@gmail.com)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
