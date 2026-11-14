/**
 * Milo — Authentication & User Onboarding
 * Handles email/password auth, Google OAuth, profile management, and account deletion
 * @author Shiva Tiwari
 */

// Optional Cloudflare Turnstile Human Check
const TURNSTILE_KEY = ''; // Leave empty if not using Cloudflare Turnstile
let capTok = null;
let capOn = false;

function capInit() {
  if (!TURNSTILE_KEY || capOn) return;
  capOn = true;
  const t = document.createElement('script');
  t.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  t.async = true;
  t.onload = () => turnstile.render('#cap', { sitekey: TURNSTILE_KEY, callback: x => (capTok = x) });
  document.head.append(t);
}

// Calculate age from YYYY-MM-DD
function age(v) {
  const d = new Date(v + 'T00:00:00');
  const t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
  return a;
}

// Setup DOB max date on page load
if ($('dob')) {
  $('dob').max = new Date().toISOString().slice(0, 10);
}

// Auth Modal Controls
function openAuth(m) {
  am = m;
  const c = AM[m];
  const h = i => c.f.includes(i);
  $('aTitle').textContent = c.t;
  $('aSub').textContent = c.s;
  AF.forEach(i => ($(i).hidden = !h(i)));
  $('oauthBox').hidden = m === 'reset' || m === 'newpass';
  $('email').required = h('fEmail');
  $('password').required = h('fPass');
  $('password2').required = h('fPass2');
  PI.forEach(i => ($(i).required = m === 'signup'));
  $('terms').required = $('age18').required = m === 'signup';
  $('aBtn').textContent = c.b;
  $('forgot').hidden = m !== 'login';
  $('password').autocomplete = m === 'login' ? 'current-password' : 'new-password';
  $('authBg').classList.add('show');
  capInit();
  setTimeout(() => $(h('fEmail') ? 'email' : 'password').focus(), 50);
}

const closeAuth = () => $('authBg').classList.remove('show');

// Google 1-Click OAuth
async function signInWithGoogle() {
  if (!ok) return toast('Pehle Supabase URL aur key paste karo.');
  try {
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: location.origin + location.pathname
      }
    });
    if (error) toast('Google login error: ' + error.message);
  } catch (e) {
    toast('Error: ' + e.message);
  }
}

// Onboarding Modal for First-time Google OAuth Users
function openOb(data, user) {
  $('obDob').max = new Date().toISOString().slice(0, 10);
  $('obName').value = data?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  $('obCity').value = data?.city || '';
  $('obGender').value = data?.gender || '';
  $('obLooking').value = data?.looking_for || 'Friends';
  $('obBg').classList.add('show');
}

async function submitOb(e) {
  e.preventDefault();
  const dob = $('obDob').value;
  if (age(dob) < 18) return toast('Milo is for adults 18+ only.');
  $('obBtn').disabled = true;
  try {
    const { error } = await sb.rpc('complete_oauth_profile', {
      p_name: $('obName').value.trim(),
      p_dob: dob,
      p_city: $('obCity').value.trim(),
      p_gender: $('obGender').value || 'Prefer not to say',
      p_looking_for: $('obLooking').value
    });
    if (error) return toast('Could not save: ' + error.message);
    $('obBg').classList.remove('show');
    if ($('incompleteBanner')) $('incompleteBanner').hidden = true;
    toast('Profile completed! Welcome to Milo.');
    refresh();
  } catch (x) {
    toast('Error: ' + x.message);
  } finally {
    $('obBtn').disabled = false;
  }
}

// Submit Authentication Form (Signup, Login, Password Reset)
async function submitAuth(e) {
  e.preventDefault();
  if (!ok) return toast('Pehle Supabase URL aur key paste karo.');
  const email = $('email').value.trim();
  const pw = $('password').value;

  if ((am === 'signup' || am === 'newpass') && pw !== $('password2').value) {
    return toast('Passwords do not match.');
  }
  if (TURNSTILE_KEY && !capTok && am !== 'newpass') {
    return toast('Please complete the human check.');
  }

  $('aBtn').disabled = true;
  try {
    if (am === 'login') {
      const { error } = await sb.auth.signInWithPassword({
        email,
        password: pw,
        options: { captchaToken: capTok || undefined }
      });
      if (error) return toast('Login failed: ' + error.message);
      closeAuth();
      toast('Logged in.');
    } else if (am === 'reset') {
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: location.origin + location.pathname,
        captchaToken: capTok || undefined
      });
      if (error) return toast(error.message);
      closeAuth();
      toast('If this email has an account, a reset link is on its way.');
    } else if (am === 'newpass') {
      const { error } = await sb.auth.updateUser({ password: pw });
      if (error) return toast(error.message);
      closeAuth();
      toast('Password updated.');
    } else {
      const dob = $('dob').value;
      if (age(dob) < 18) return toast('Milo is for adults 18+ only.');
      const { data, error } = await sb.auth.signUp({
        email,
        password: pw,
        options: {
          captchaToken: capTok || undefined,
          data: {
            name: $('name').value.trim(),
            dob,
            city: $('city').value.trim(),
            gender: $('gender').value || 'Prefer not to say',
            looking_for: $('looking').value,
            ref: (() => {
              try {
                return localStorage.getItem('milo_ref') || '';
              } catch (e) {
                return '';
              }
            })()
          }
        }
      });
      if (error) return toast('Signup failed: ' + error.message);
      closeAuth();
      toast(data.session ? 'Account created.' : 'Account created. Confirm your email, then log in.');
    }
  } catch (x) {
    toast('Error: ' + x.message);
  } finally {
    $('aBtn').disabled = false;
    if (window.turnstile && TURNSTILE_KEY) {
      turnstile.reset();
      capTok = null;
    }
  }
}

// Multi-select Chips Generator
function picks(id, list, sel, max, cid) {
  const b = $(id);
  b.replaceChildren();
  const u = () => ($(cid).textContent = b.querySelectorAll('input:checked').length + ' / ' + max);
  list.forEach(v => {
    const l = el('label', 'pk');
    const i = document.createElement('input');
    i.type = 'checkbox';
    i.value = v;
    i.checked = sel.includes(v);
    i.onchange = () => {
      if (b.querySelectorAll('input:checked').length > max) {
        i.checked = false;
        toast('Pick up to ' + max + '.');
      }
      u();
    };
    l.append(i, el('span', '', v));
    b.append(l);
  });
  u();
}

// Profile Modal Controls
function openProf() {
  $('uname').value = me?.username || '';
  if ($('ubio')) $('ubio').value = me?.bio || '';
  $('mymode').value = me?.looking_for || 'Friends';
  picks('hobbyPicks', HOBBIES, me?.hobbies || [], 10, 'hc');
  picks('vibePicks', VIBES, me?.vibes || [], 3, 'vc');
  $('profBg').classList.add('show');
}

const closeProf = () => $('profBg').classList.remove('show');

async function saveProf() {
  const pk = id => [...$(id).querySelectorAll('input:checked')].map(i => i.value);
  const un = $('uname').value.trim().toLowerCase();
  if (un && !/^[a-z0-9_]{3,20}$/.test(un)) {
    return toast('Username: 3-20 letters, numbers or _ only.');
  }
  const u = {
    looking_for: $('mymode').value,
    hobbies: pk('hobbyPicks'),
    vibes: pk('vibePicks')
  };
  if (un) u.username = un;
  const bio = $('ubio') ? $('ubio').value.trim() : '';
  if (bio) u.bio = bio;

  $('sBtn').disabled = true;
  try {
    const { data: { session } } = await sb.auth.getSession();
    let res = await sb.from('profiles').update(u).eq('id', session.user.id);
    // If 'bio' column does not exist yet in DB, retry update without it gracefully
    if (res.error && res.error.message && res.error.message.includes('bio')) {
      delete u.bio;
      res = await sb.from('profiles').update(u).eq('id', session.user.id);
    }
    if (res.error) {
      return toast(res.error.code === '23505' ? 'That username is taken.' : 'Could not save: ' + res.error.message);
    }
    me = { ...me, ...u };
    closeProf();
    toast('Profile saved.');
    if (typeof setTabs === 'function') setTabs();
    if (typeof load === 'function') load();
  } finally {
    $('sBtn').disabled = false;
  }
}

// Permanently Delete Account
async function delAcc() {
  if (!confirm('Delete your account and profile permanently? This cannot be undone.')) return;
  const { error } = await sb.rpc('delete_my_account');
  if (error) return toast('Could not delete: ' + error.message);
  closeProf();
  await sb.auth.signOut({ scope: 'local' });
  toast('Your account was deleted.');
}
