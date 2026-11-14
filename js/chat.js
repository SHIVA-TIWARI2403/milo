/**
 * Milo — Realtime Chat, Connections, Bots & Moderation
 * Handles peer connections, Supabase realtime messaging, bot simulator, and trust/safety
 * @author Shiva Tiwari
 */

// Fetch active user connections and blocked status
async function loadConns() {
  if (!sb) return;
  const [a, b] = await Promise.all([
    sb.rpc('get_connections'),
    sb.from('blocks').select('blocked_id')
  ]);
  conns = a.data || [];
  blocked = new Set((b.data || []).map(x => x.blocked_id));
  const inc = conns.filter(c => c.status === 'pending' && c.incoming);
  const badge = inc.length > 0 ? ` (${inc.length})` : '';
  if ($('inboxBtn')) $('inboxBtn').textContent = 'Chats' + badge;
  if ($('mInboxBtn')) $('mInboxBtn').textContent = '💬 Chats' + badge;
}

// Action button generator for user cards
function actBtn(p) {
  const c = conns.find(x => x.other_id === p.id);
  const b = el('button', 'btn');
  if (!c) {
    b.textContent = 'Send request';
    b.className = 'btn main';
    b.onclick = () => send(p.id);
  } else if (c.status === 'accepted') {
    b.textContent = 'Open chat';
    b.onclick = () => {
      openInbox().then(() => openChat(c));
    };
  } else if (c.status === 'pending' && c.incoming) {
    b.textContent = 'Accept request';
    b.onclick = () => respond(c.id, true);
  } else {
    b.textContent = c.status === 'pending' ? 'Request sent' : 'Declined';
    b.disabled = true;
  }
  return b;
}

// Send connection request
async function send(id) {
  const { error } = await sb.rpc('send_request', { p_to: id, p_mode: mode });
  if (error) {
    return toast(error.code === '23505' ? 'A request with this person already exists.' : error.message);
  }
  toast('Request sent.');
  if (typeof load === 'function') load();
}

// Accept or decline incoming connection request
async function respond(id, ok) {
  const { error } = await sb.rpc('respond_request', { p_id: id, p_accept: ok });
  if (error) return toast(error.message);
  toast(ok ? 'Accepted. You can chat now.' : 'Request declined.');
  if (typeof load === 'function') await load();
  if ($('inBg').classList.contains('show')) renderInbox();
}

// Open and render Inbox modal
async function openInbox() {
  await loadConns();
  renderInbox();
  $('inBg').classList.add('show');
}

function closeInbox() {
  $('inBg').classList.remove('show');
  leaveChat();
}

function renderInbox() {
  leaveChat();
  const b = $('inList');
  b.replaceChildren();
  const inc = conns.filter(c => c.status === 'pending' && c.incoming);
  const ch = conns.filter(c => c.status === 'accepted');

  b.append(el('h3', '', 'Requests'));
  if (!inc.length) b.append(el('p', '', 'No new requests.'));

  inc.forEach(c => {
    const r = el('div', 'rw2 glass');
    const lft = el('div', 'chh');
    lft.append(createAvatar(c.name, 'sm'), el('span', '', c.name + ' (' + c.mode + ')'));
    r.append(lft);

    const btns = el('div', 'chh');
    const a = el('button', 'btn main', 'Accept');
    a.onclick = () => respond(c.id, true);
    const d = el('button', 'btn', 'Decline');
    d.onclick = () => respond(c.id, false);
    btns.append(a, d);
    r.append(btns);
    b.append(r);
  });

  b.append(el('h3', '', 'Chats'));
  if (!ch.length) b.append(el('p', '', 'No chats yet. Accepted requests appear here.'));

  ch.forEach(c => {
    const r = el('button', 'btn rw2 glass');
    const lft = el('div', 'chh');
    lft.append(createAvatar(c.name, 'sm'), el('span', '', c.name + ' · ' + c.city));
    r.append(lft);
    r.onclick = () => openChat(c);
    b.append(r);
  });
}

// Format timestamp into clean 12-hr readable format
function formatTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
}

// Open 1-on-1 Realtime Chat Conversation
async function openChat(c) {
  chatReq = c;
  $('inList').hidden = true;
  $('chatView').hidden = false;

  const titleBox = $('chTitle');
  titleBox.replaceChildren();
  titleBox.append(createAvatar(c.name, 'sm'), document.createTextNode(' ' + c.name));

  const m = $('msgs');
  m.replaceChildren();

  const { data, error } = await sb
    .from('messages')
    .select('id,sender_id,body,created_at')
    .eq('request_id', c.id)
    .order('created_at')
    .limit(200);

  if (error) return toast(error.message);

  if (!data || !data.length) {
    const emp = el('div', 'empty', `Say hi to ${c.name}! Start a conversation about your shared hobbies 👋`);
    emp.style.padding = '20px 10px';
    m.append(emp);
  } else {
    data.forEach(addMsg);
  }

  if (chan) sb.removeChannel(chan);
  chan = sb
    .channel('chat-' + c.id)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: 'request_id=eq.' + c.id
    }, x => addMsg(x.new))
    .subscribe();
}

// Append new message bubble to chat transcript
function addMsg(x) {
  if (document.getElementById('m' + x.id)) return;
  const emptyPlaceholder = $('msgs').querySelector('.empty');
  if (emptyPlaceholder) emptyPlaceholder.remove();

  const d = el('div', 'msg' + (x.sender_id === myId ? ' me' : ''));
  d.id = 'm' + x.id;
  d.append(el('div', 'msg-text', x.body));
  if (x.created_at) {
    d.append(el('small', 'msg-time', formatTime(x.created_at)));
  }
  const m = $('msgs');
  m.append(d);
  m.scrollTop = m.scrollHeight;
}

// Send a chat message
async function sendMsg(e) {
  e.preventDefault();
  const i = $('msgIn');
  const t = i.value.trim();
  if (!t || !chatReq) return;
  i.value = '';

  const { data, error } = await sb
    .from('messages')
    .insert({ request_id: chatReq.id, body: t })
    .select('id,sender_id,body,created_at')
    .single();

  if (error) {
    i.value = t;
    return toast(error.message);
  }
  addMsg(data);
}

// Leave active chat view back to inbox list
function leaveChat() {
  if (chan) {
    sb.removeChannel(chan);
    chan = null;
  }
  chatReq = null;
  $('chatView').hidden = true;
  $('inList').hidden = false;
}

// Block and Report user safety actions
async function blockU(id) {
  if (!confirm('Block this person? You will no longer see each other.')) return;
  const { error } = await sb.rpc('block_user', { p_id: id });
  if (error) return toast(error.message);
  toast('Blocked.');
  closeInbox();
  if (typeof load === 'function') load();
}

async function reportU(id) {
  const r = prompt('Why are you reporting this person? (3-500 characters)');
  if (!r) return;
  const { error } = await sb.rpc('report_user', { p_id: id, p_reason: r });
  if (error) return toast(error.message);
  toast('Reported and blocked. Thank you.');
  closeInbox();
  if (typeof load === 'function') load();
}

// ==========================================
// MILO BOT / ASSISTANT CONVERSATION SYSTEM
// ==========================================
let bp = 'Milo Help';
let bh = {};

const SAFE = /(give|tell|show|share|send|leak|reveal|dump|hack|bypass|steal).*(password|otp|email|phone|number|key|token|database|admin|account|data)|service.?role|api.?key|admin (panel|page|login)|\bsql\b/i;
const SAFE_MSG = 'I cannot help with passwords, OTPs, keys, admin access or anyone’s private details. For account help use “Forgot password?” on the login form, or contact support at tiwarisatendrapratap@gmail.com.';

const HELP = [
  [/\b18\b|age|adult/i, 'Milo is for adults 18+ only. Your age is verified when you sign up.'],
  [/free|price|cost|paid|premium|member/i, 'Milo is 100% free. There are no paid plans, subscriptions or VIP memberships.'],
  [/call|video|voice/i, 'Milo has no voice or video calls. You can chat freely once a request is accepted.'],
  [/chat|message|request/i, 'Send a request from Friends or Dating. When the other person accepts, open Chats to talk.'],
  [/block|report|fake|abuse|harass|scam/i, 'Open a chat and tap Block or Report. Reporting blocks the person and notifies moderation. Never share OTPs, passwords or money.'],
  [/delete|remove|privacy|data/i, 'My profile → Delete my account permanently removes your profile, messages and requests.'],
  [/hobb|suggest|match|search|username/i, 'Set hobbies and a username in My profile. Friends and Dating show people who share them, same city first. You can search by name or username.'],
  [/mode|friends|dating/i, 'Friends and Dating are separate modes. Choose Friends, Dating or Both in My profile.'],
  [/google|gmail|oauth/i, 'Aap "Continue with Google" se directly 1-click mein login/signup kar sakte hain. First time par 18+ DOB verify karna hoga.'],
  [/refer|invite|share/i, 'Set a username in My profile, then use Invite your friends on the home page for your link.'],
  [/contact|support|owner|who/i, 'Milo is founded and run by Shiva Tiwari, Ayodhya. Email: tiwarisatendrapratap@gmail.com.'],
  [/login|log in|signup|sign up|account|join/i, 'Use Join to sign up (18+, Google or Email) and Log in to return. Forgot your password? Use the link on the login form.']
];

const SMALL = [
  [/^(hi+|hello|hey|namaste|salaam|kem cho|kya haal)\b/i, ['Hey! Milo par kya explore kar rahe ho?', 'Namaste! Milo par kaisa lag raha hai?', 'Hello! How is your day going?']],
  [/how are you|kaise ho|kya haal|kya kar rahe/i, ['Main ekdam badiya! Aap batao, aaj ka din kaisa raha?', 'Doing great, thanks! Naye doston se baat hui?']],
  [/\b(real|human|robot|bot|ai|insan)\b/i, ['Main ek automated chat bot hoon, real person nahi. Milo par safe conversation practice ke liye yahan hoon!']],
  [/dating|match|date|ladki|ladka/i, ['Dating mode select karke same hobbies wale logon ko request bhejo. Chat tabhi khulegi jab dono accept karein!']],
  [/friend|dost|dosti/i, ['Friends mode mein apne shahar aur pasand ke doston ko dhundo. Chai, cricket ya gaming buddy milna asaan hai!']],
  [/hobb|free time|shauk/i, (h) => h.length ? 'Aapne hobbies mein ' + h.slice(0, 3).join(', ') + ' chuna hai. Inke baare mein aur batao!' : 'My profile mein jaake hobbies select karo, phir baat karne ka maza aayega.'],
  [/cricket/i, ['Cricket! Khelna pasand hai ya match dekhna? Fav cricketer kaun hai?']],
  [/music|song|sing|gana/i, ['Sangeet to har mood ki dawa hai! Aaj kal kaunsa gaana loop par sun rahe ho?']],
  [/movie|series|anime|cinema/i, ['Waah! Last movie ya series kaunsi dekhi jo sabse zabardast lagi?']],
  [/food|chai|eat|biryani|khana/i, ['Ab to bhook lag gayi! Street food pasand hai ya ghar ka khana? Chai ya coffee?']],
  [/travel|trip|ghoomna/i, ['Ghoomne ka plan kab ban raha hai? Dream destination kaunsi hai?']],
  [/joke|funny|hansi/i, ['Teacher: "Homework kyu nahi kiya?" Student: "Sir, light chali gayi thi." Teacher: "To mombatti jala lete!" Student: "Sir, maachis mandir mein rakhi thi, naha ke nahi gaya tha!" 😂']],
  [/thank|shukriya|dhanyawad/i, ['Arey anytime! Milo enjoy karo!']],
  [/bye|good night|\bgn\b|alvida/i, ['Alvida! Take care aur jald milte hain.']]
];

const pick = a => a[Math.floor(Math.random() * a.length)];

function botReply(n, m) {
  if (n === 'Milo Help') {
    if (/forgot|reset|change.*pass/i.test(m)) {
      return 'On the Log in form, tap “Forgot password?”, enter your email and open the link we send.';
    }
    if (SAFE.test(m)) return SAFE_MSG;
    for (const [r, a] of HELP) {
      if (r.test(m)) return a;
    }
    return 'I can help with signup, Google login, modes, chat, safety and privacy. Feel free to ask me anything about how Milo works!';
  }
  if (SAFE.test(m)) return SAFE_MSG;
  const h = (me && me.hobbies) || [];
  for (const [r, a] of SMALL) {
    if (r.test(m)) return typeof a === 'function' ? a(h) : pick(a);
  }
  return pick([
    'Interesting! Aur batao iske baare mein.',
    'Sahi baat hai! Aapko yeh kab se pasand hai?',
    'Haha, bilkul! Aur kya enjoy karte ho?',
    'Awesome! What is your favourite part about that?'
  ]);
}

function botToggle() {
  const p = $('botPanel');
  const o = p.hidden;
  p.hidden = !o;
  $('botFab').setAttribute('aria-expanded', o);
  if (o) {
    botSel(bp);
    $('bi').focus();
  }
}

function botSel(n) {
  bp = n;
  ['Milo Help', 'Aarav', 'Anaya'].forEach((x, i) => $('t' + i).classList.toggle('on', x === n));
  $('bl').replaceChildren();
  (bh[n] = bh[n] || [
    {
      r: 'b',
      t: n === 'Milo Help'
        ? 'Hi! Ask me about signup, Google login, modes, chat or safety. I am an automated helper.'
        : 'Hi, I am ' + n + ', a Milo chat bot (not a real person). Say hi!'
    }
  ]).forEach(m => bAdd(m.r, m.t, false));
}

function bAdd(r, t, save = true) {
  const l = $('bl');
  const d = el('div', 'bm' + (r === 'u' ? ' u' : ''));
  if (r === 'b') {
    const badge = el('span', 'tag', 'BOT');
    badge.style.cssText = 'font-size:9px;padding:1px 5px;margin-right:6px;vertical-align:middle;display:inline-block';
    d.append(badge);
  }
  d.append(document.createTextNode(t));
  l.append(d);
  l.scrollTop = l.scrollHeight;
  if (save) bh[bp].push({ r, t });
}

function botSend(e) {
  e.preventDefault();
  const i = $('bi');
  const t = i.value.trim();
  if (!t) return;
  i.value = '';
  bAdd('u', t);
  const n = bp;
  setTimeout(() => {
    if (bp === n) bAdd('b', botReply(n, t));
    else bh[n].push({ r: 'b', t: botReply(n, t) });
  }, 400);
}
