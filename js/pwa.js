/**
 * Milo — PWA, Sharing, Referrals, Feedback & Cookies
 * Handles progressive web app lifecycle, web share, WhatsApp invites, and cookie banner
 * @author Shiva Tiwari
 */

// ==========================================
// PWA INSTALLATION & SERVICE WORKER
// ==========================================
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  if ($('installAppBtn')) $('installAppBtn').style.display = 'inline-flex';
  if ($('mInstallBtn')) $('mInstallBtn').style.display = 'block';
});

window.addEventListener('appinstalled', () => {
  toast('Milo installed successfully!');
  deferredPrompt = null;
  if ($('installAppBtn')) $('installAppBtn').style.display = 'none';
  if ($('mInstallBtn')) $('mInstallBtn').style.display = 'none';
});

async function installPWA() {
  if (!deferredPrompt) {
    return toast('To install: tap Share or Browser Menu → "Add to Home Screen"');
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') toast('Installing Milo...');
  deferredPrompt = null;
  if ($('installAppBtn')) $('installAppBtn').style.display = 'none';
  if ($('mInstallBtn')) $('mInstallBtn').style.display = 'none';
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration error:', err));
  });
}

// ==========================================
// SHARING & INVITATION SYSTEM
// ==========================================
const SHARE_TXT = 'Join me on Milo and meet people who share your hobbies.';
const shareUrl = () => location.origin + (me && me.username ? '/?ref=' + me.username : '/');

function refUI() {
  if (!$('refLine')) return;
  $('refLine').textContent =
    me && me.username
      ? shareUrl()
      : me
      ? 'Set a username in My profile to get your personal invite link.'
      : 'Log in to get your personal invite link, or share the main link: ' + location.origin;

  if ($('refCount')) $('refCount').textContent = '';
  if (ok && me && me.username) {
    sb.rpc('my_referral_count').then(r => {
      if (!r.error && $('refCount')) {
        $('refCount').textContent = r.data + (r.data === 1 ? ' person has' : ' people have') + ' joined with your link.';
      }
    });
  }
}

async function shareMilo() {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Milo', text: SHARE_TXT, url: shareUrl() });
    } catch (e) {}
  } else {
    copyMilo();
  }
}

function waMilo() {
  window.open('https://wa.me/?text=' + encodeURIComponent(SHARE_TXT + ' ' + shareUrl()), '_blank', 'noopener');
}

async function copyMilo() {
  try {
    await navigator.clipboard.writeText(shareUrl());
    toast('Link copied.');
  } catch (e) {
    toast(shareUrl());
  }
}

// ==========================================
// FEEDBACK & COOKIE BANNER
// ==========================================
async function sendFb(e) {
  e.preventDefault();
  if (!me) {
    toast('Log in to send feedback.');
    return openAuth('login');
  }
  const { error } = await sb.from('feedback').insert({
    rating: +$('fbR').value,
    message: $('fbM').value.trim()
  });
  if (error) return toast(error.message);
  $('fbM').value = '';
  $('fbR').value = '';
  toast('Thank you for your feedback!');
}

// Cookie Consent Notice
try {
  if (!localStorage.getItem('milo_ck') && $('ck')) $('ck').hidden = false;
} catch (e) {}

function ckOk() {
  try {
    localStorage.setItem('milo_ck', '1');
  } catch (e) {}
  if ($('ck')) $('ck').hidden = true;
}
