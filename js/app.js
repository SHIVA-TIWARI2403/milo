/**
 * Milo — Core Application Controller & Lifecycle
 * Orchestrates navigation, feed loading, matching algorithms, and auth state sync
 * @author Shiva Tiwari
 */

// ==========================================
// MOBILE DRAWER CONTROLLER
// ==========================================
function toggleMenu() {
  const d = $('mobileDrawer');
  if (!d) return;
  const willShow = d.hidden;
  d.hidden = !willShow;
  if ($('menuBtn')) $('menuBtn').setAttribute('aria-expanded', willShow);
}

function closeMenu() {
  const d = $('mobileDrawer');
  if (d) d.hidden = true;
  if ($('menuBtn')) $('menuBtn').setAttribute('aria-expanded', 'false');
}

// ==========================================
// POPULAR CIRCLES FILTER
// ==========================================
function filterCircle(hobby) {
  if (!$('q')) return;
  $('q').value = hobby;
  document.querySelectorAll('.circle-chip').forEach(c => {
    c.classList.toggle('active', c.textContent.includes(hobby) && hobby !== '');
  });
  load();
}

// ==========================================
// MODE SWITCHING & NAVIGATION
// ==========================================
async function quickSwitchMode(newMode) {
  try {
    const { data: { session } } = await sb.auth.getSession();
    const { error } = await sb.from('profiles').update({ looking_for: newMode }).eq('id', session.user.id);
    if (error) return toast('Could not switch: ' + error.message);
    me.looking_for = newMode;
    toast('Switched to ' + newMode + ' mode.');
    setTabs();
    load();
  } catch (e) {
    toast('Error: ' + e.message);
  }
}

function setTabs() {
  if (typeof refUI === 'function') refUI();
  if ($('tabF')) $('tabF').classList.toggle('on', mode === 'Friends');
  if ($('tabD')) $('tabD').classList.toggle('on', mode === 'Dating');
}

function showPeople(m) {
  if (!me) {
    toast('Log in to see people.');
    return openAuth('login');
  }
  mode = m;
  setTabs();
  $('people').hidden = false;
  $('people').scrollIntoView({ behavior: 'smooth' });
  load();
}

const empty = t => {
  const d = el('div', 'empty', t);
  $('cards').append(d);
};

// Global Keyboard Handler for Modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (typeof closeAuth === 'function') closeAuth();
    if (typeof closeProf === 'function') closeProf();
    if (typeof closeInbox === 'function') closeInbox();
    closeMenu();
    if ($('botPanel')) $('botPanel').hidden = true;
  }
});

// ==========================================
// DISCOVERY FEED & PEOPLE MATCHING
// ==========================================
async function load() {
  if (!me) return;
  if (typeof loadConns === 'function') await loadConns();
  const box = $('cards');
  box.replaceChildren();
  $('hint').hidden = !!(me.hobbies && me.hobbies.length && me.username);

  // Profile mode mismatch warning with quick switcher
  if (me.looking_for !== 'Both' && me.looking_for !== mode) {
    const d = el('div', 'empty');
    d.append(el('p', '', `Your profile is currently set to ${me.looking_for} mode.`));
    const swBtn = el('button', 'btn main', `Switch to Both & explore ${mode}`);
    swBtn.style.marginTop = '12px';
    swBtn.onclick = () => quickSwitchMode('Both');
    d.append(swBtn);
    box.append(d);
    return;
  }

  const { data: raw, error } = await sb.rpc('get_people', {
    p_mode: mode,
    p_q: $('q').value.trim() || null
  });
  const data = (raw || []).filter(p => !blocked.has(p.id));
  if (error) return toast('Could not load: ' + error.message);
  if (!data.length) {
    return empty('No people found matching this search. Try a different hobby or invite friends to join Milo.');
  }

  data.forEach(p => {
    const c = el('article', 'pc glass');
    const head = el('div', 'pc-header');
    head.append(createAvatar(p.name, 'md'));
    const titles = el('div', 'pc-titles');
    titles.append(el('h3', '', p.name));
    const metaText =
      (p.username ? '@' + p.username + ' · ' : '') +
      (p.age ? p.age + ' yrs · ' : '') +
      p.city +
      (p.same_city ? ' · 📍 same city' : '');
    titles.append(el('small', '', metaText));
    head.append(titles);
    c.append(head);

    if (p.bio) {
      const bioEl = el('div', 'pc-bio', p.bio);
      c.append(bioEl);
    }

    c.append(
      el(
        'div',
        'm',
        p.shared_count
          ? p.shared_count + (p.shared_count === 1 ? ' hobby' : ' hobbies') + ' in common'
          : 'No hobbies in common yet'
      )
    );
    const g = el('div', 'tg');
    p.shared_hobbies.forEach(h => g.append(el('span', 't hit', h)));
    p.hobbies.filter(h => !p.shared_hobbies.includes(h)).forEach(h => g.append(el('span', 't', h)));
    p.vibes.forEach(v => g.append(el('span', 't', v)));
    c.append(g);
    c.append(actBtn(p));
    const k = el('button', 'lnk', 'Block');
    k.onclick = () => blockU(p.id);
    c.append(k);
    box.append(c);
  });
}

// ==========================================
// AUTH STATE SYNCHRONIZATION & APP BOOT
// ==========================================
try {
  const r = new URLSearchParams(location.search).get('ref');
  if (r && /^[a-z0-9_]{3,20}$/i.test(r)) {
    localStorage.setItem('milo_ref', r.toLowerCase());
  }
} catch (e) {}

async function refresh() {
  if (!ok) return;
  const { data: { session } } = await sb.auth.getSession();
  const on = !!session;

  ['loginBtn', 'joinBtn', 'mLoginBtn', 'mJoinBtn'].forEach(i => {
    if ($(i)) $(i).hidden = on;
  });
  myId = on ? session.user.id : null;
  ['logoutBtn', 'profBtn', 'inboxBtn', 'mLogoutBtn', 'mProfBtn', 'mInboxBtn'].forEach(i => {
    if ($(i)) $(i).hidden = !on;
  });
  $('userBox').hidden = !on;

  if (!on) {
    me = null;
    $('people').hidden = true;
    if ($('incompleteBanner')) $('incompleteBanner').hidden = true;
    if (typeof refUI === 'function') refUI();
    return;
  }

  const { data } = await sb
    .from('profiles')
    .select('name,city,username,looking_for,hobbies,vibes,date_of_birth,gender,is_banned,bio')
    .eq('id', session.user.id)
    .maybeSingle();

  if (data) {
    if (data.is_banned) {
      toast('Your account has been suspended for violating safety guidelines.');
      await sb.auth.signOut();
      return;
    }
    if (!data.date_of_birth || !data.city || !data.looking_for) {
      me = data;
      $('userBox').textContent = data.name || session.user.email;
      if ($('incompleteBanner')) $('incompleteBanner').hidden = false;
      if (typeof openOb === 'function') openOb(data, session.user);
      return;
    }
  }

  if ($('incompleteBanner')) $('incompleteBanner').hidden = true;
  me = data;
  if ($('userBox')) {
    $('userBox').replaceChildren();
    if (data) {
      $('userBox').append(createAvatar(data.name, 'sm'), document.createTextNode(' ' + (data.name || session.user.email)));
    } else {
      $('userBox').textContent = session.user.email;
    }
  }

  if (data) {
    $('people').hidden = false;
    setTabs();
    load();
  }
}

// Initial Boot Sequence
if (typeof refUI === 'function') refUI();

if (ok) {
  sb.auth.onAuthStateChange(ev => {
    if (ev === 'PASSWORD_RECOVERY' && typeof openAuth === 'function') {
      openAuth('newpass');
    }
    refresh();
  });
  refresh();
}
