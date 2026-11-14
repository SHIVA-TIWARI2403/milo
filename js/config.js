/**
 * Milo — Core Configuration & Shared State
 * @author Shiva Tiwari
 */

// Supabase Connection Settings
// NOTE: Only publishable anon key belongs here. Never paste service_role secret key.
const SUPABASE_URL = 'https://aljlnisvrveuwlishgyv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_fHpR8DkYG6XGbnUs8djC0g_gyQn0Kwm';
const ok = !SUPABASE_URL.startsWith('PASTE');
const sb = ok && window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// DOM Helpers
const $ = id => document.getElementById(id);
const el = (t, c, x) => {
  const e = document.createElement(t);
  if (c) e.className = c;
  if (x !== undefined) e.textContent = x;
  return e;
};

// Global App State
let tt = null;
let st = null;
let me = null;
let mode = 'Friends';
let am = 'signup';
let myId = null;
let conns = [];
let blocked = new Set();
let chatReq = null;
let chan = null;

// Toast Notification
const toast = m => {
  const t = $('toast');
  if (!t) return;
  t.textContent = m;
  t.classList.add('show');
  clearTimeout(tt);
  tt = setTimeout(() => t.classList.remove('show'), 4500);
};

// Platform Master Lists
const HOBBIES = [
  'Cricket', 'Football', 'Badminton', 'Gym & fitness', 'Yoga', 'Trekking',
  'Music', 'Singing', 'Dancing', 'Movies & series', 'Anime', 'Gaming',
  'Reading', 'Writing', 'Art & drawing', 'Photography', 'Coding', 'Travel',
  'Cooking', 'Chai & street food'
];

const VIBES = [
  'Calm', 'Funny', 'Adventurous', 'Bookworm', 'Creative', 'Ambitious',
  'Homebody', 'Social butterfly'
];

// Font Families & Customizer
const FONTS = {
  'Sans-serif': ['Segoe UI', 'Segoe UI', 'sans-serif'],
  'Serif': ['Georgia', 'Georgia', 'serif'],
  'Monospace': ['Consolas', 'Consolas', 'monospace']
};

function setFont(k) {
  const f = FONTS[k] || FONTS['Sans-serif'];
  const r = document.documentElement.style;
  r.setProperty('--display', `'${f[0]}',${f[2]}`);
  r.setProperty('--body', `'${f[1]}',${f[2]}`);
  try {
    localStorage.setItem('milo_font', k);
  } catch (e) {}
}

if ($('fontSel')) {
  Object.keys(FONTS).forEach(k => $('fontSel').append(new Option(k, k)));
  try {
    const k = localStorage.getItem('milo_font');
    if (k && FONTS[k]) {
      $('fontSel').value = k;
      setFont(k);
    }
  } catch (e) {}
}

// Authentication Modal Configuration
const AM = {
  login: { t: 'Log in', s: 'Welcome back.', f: ['fEmail', 'fPass'], b: 'Log in' },
  signup: { t: 'Join Milo', s: 'Create your account. Adults 18+ only.', f: ['fEmail', 'fPass', 'fPass2', 'profileFields', 'termsRow'], b: 'Create account' },
  reset: { t: 'Reset password', s: 'We will email you a reset link.', f: ['fEmail'], b: 'Send reset link' },
  newpass: { t: 'Set a new password', s: 'Choose a new password.', f: ['fPass', 'fPass2'], b: 'Save password' }
};

const AF = ['fEmail', 'fPass', 'fPass2', 'profileFields', 'termsRow'];
const PI = ['name', 'dob', 'city', 'looking'];
