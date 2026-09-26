/* ============================================================
   Juvia — Menu digital & Juvia Pass
   Vanilla JavaScript edition (no build step required).
   Works directly with VS Code Live Server.
   ============================================================ */
(function () {
'use strict';

/* ------------------------------------------------------------
   Supabase credentials — HARDCODED for browser-native execution.
   No build step, no .env loader: Live Server reads these directly.

   → Paste your Supabase "anon public" key below (one line):
     Supabase Dashboard → Project Settings → API Keys
     → anon public  (starts with "eyJ…" or "sb_publishable_…")
   ------------------------------------------------------------ */
const SUPABASE_URL = "https://epikmapynijxwomhbydo.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PVzcih9toX1nlXzUabRLow_EmwNAQVF";

var supabase = null;
(function initSupabase() {
  try {
    var url = String(SUPABASE_URL || '').trim();
    var key = String(SUPABASE_ANON_KEY || '').trim();
    var hasValidUrl = /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url);
    var keyMissing = !key || /^PASTE_/i.test(key);
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      console.warn('Juvia Pass: SDK Supabase CDN non chargé.');
      return;
    }
    if (keyMissing) {
      console.warn('Juvia Pass: SUPABASE_ANON_KEY est vide — collez votre clé anon en haut de js/app.js pour activer la fidélité.');
      return;
    }
    if (!hasValidUrl) {
      console.warn('Juvia Pass: SUPABASE_URL invalide.');
      return;
    }
    supabase = window.supabase.createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { params: { eventsPerSecond: 5 } }
    });
    console.info('Juvia Pass: Supabase connecté ✔');
  } catch (error) {
    console.warn('Juvia Pass: Supabase could not be initialized.', error);
    supabase = null;
  }
})();

/* ------------------------------------------------------------
   Menu data — edit by hand, no build step needed
   ------------------------------------------------------------ */
var menu = [
  {id:'matin', short:'Matin', name:'Le matin', note:'Servi chaque jour jusqu’à 12h', dishes:[
    {n:'Toast Juvia',d:'Pain au levain, avocat citronné, œuf parfait, feta et graines torréfiées.',p:68},
    {n:'Croissant Bénédicte',d:'Croissant pur beurre, saumon fumé, œufs pochés et sauce hollandaise.',p:79},
    {n:'Granola Maison',d:'Yaourt grec, granola croustillant au miel et fruits frais de saison.',p:52},
    {n:'Shakshuka',d:'Œufs, tomates mijotées, poivrons, feta et pain toasté.',p:64},
    {n:'Pancakes Nuage',d:'Pancakes moelleux, fruits rouges, sirop d’érable et crème vanillée.',p:62},
    {n:'Petit-déjeuner Juvia',d:'Œufs au choix, viennoiserie, pain, fromage, jus frais et boisson chaude.',p:95}
  ]},
  {id:'entrees', short:'Entrées', name:'Entrées', note:'À picorer ou à partager', dishes:[
    {n:'Burrata solaire',d:'Burrata crémeuse, tomates confites, pesto basilic et focaccia grillée.',p:76},
    {n:'Tacos crevettes',d:'Crevettes croustillantes, mangue, chou frais et mayonnaise chili.',p:72},
    {n:'Croustillants feta',d:'Feta en feuille de brick, miel de thym et sésame torréfié.',p:58},
    {n:'Houmous Juvia',d:'Pois chiches, tahini, huile d’olive, herbes fraîches et pain chaud.',p:48},
    {n:'Calamars dorés',d:'Calamars croustillants, citron frais et aïoli maison.',p:74},
    {n:'Tartare de saumon',d:'Saumon frais, avocat, agrumes, sésame et chips de riz.',p:82}
  ]},
  {id:'salades', short:'Salades', name:'Salades & bowls', note:'Fraîches, colorées, généreuses', dishes:[
    {n:'César Juvia',d:'Poulet grillé, romaine, parmesan, croûtons et sauce César maison.',p:78},
    {n:'Green Bowl',d:'Quinoa, avocat, edamame, concombre, légumes croquants et sauce sésame.',p:74},
    {n:'Salade Riviera',d:'Thon mi-cuit, œuf, tomates, haricots verts et olives marinées.',p:86},
    {n:'Burrata Bowl',d:'Roquette, burrata, tomates cerises, pêches grillées et pistaches.',p:82},
    {n:'Chicken Crunch',d:'Poulet croustillant, chou, carotte, avocat et vinaigrette asiatique.',p:80},
    {n:'Falafel Bowl',d:'Falafels maison, houmous, boulgour, crudités et sauce yaourt menthe.',p:70}
  ]},
  {id:'plats', short:'Plats', name:'Plats signatures', note:'La cuisine solaire de Juvia', dishes:[
    {n:'Saumon laqué',d:'Pavé de saumon, laque miso douce, riz parfumé et légumes rôtis.',p:128},
    {n:'Suprême fermier',d:'Poulet fermier, purée fumée, champignons et jus réduit au thym.',p:112},
    {n:'Pasta verde',d:'Pappardelle, pesto de pistache, stracciatella et citron confit.',p:96},
    {n:'Filet de bœuf',d:'Filet grillé, pommes grenailles, légumes verts et sauce au poivre.',p:165},
    {n:'Risotto safrané',d:'Riz arborio, crevettes, parmesan, safran et huile d’herbes.',p:118},
    {n:'Linguine de la mer',d:'Linguine, calamars, crevettes, moules et sauce tomate relevée.',p:124}
  ]},
  {id:'burgers', short:'Burgers', name:'Burgers', note:'Servis avec frites maison', dishes:[
    {n:'Juvia Smash',d:'Double bœuf smashé, cheddar affiné, pickles et sauce secrète.',p:92},
    {n:'Crispy Chicken',d:'Poulet croustillant, coleslaw, cheddar et mayonnaise épicée.',p:86},
    {n:'Garden Burger',d:'Galette végétale, cheddar maturé, avocat et sauce aux herbes.',p:82},
    {n:'Truffle Burger',d:'Bœuf, comté, champignons, roquette et crème légère à la truffe.',p:108},
    {n:'Blue Cheese',d:'Bœuf grillé, fromage bleu, oignons confits et noix caramélisées.',p:99},
    {n:'Mini Smash',d:'Petit burger bœuf, cheddar et sauce maison, pour les petits appétits.',p:62}
  ]},
  {id:'desserts', short:'Douceurs', name:'Douceurs', note:'Gardez toujours une place', dishes:[
    {n:'Pistache Cloud',d:'Biscuit moelleux, crème légère pistache, framboise et praliné.',p:62},
    {n:'Pain perdu',d:'Brioche caramélisée, sauce caramel et glace vanille de Madagascar.',p:58},
    {n:'Choco Juvia',d:'Chocolat noir, cœur coulant, noisettes et fleur de sel.',p:64},
    {n:'Tiramisu minute',d:'Crème mascarpone, espresso, cacao et biscuit imbibé.',p:55},
    {n:'Cheesecake citron',d:'Cheesecake onctueux, citron frais et crumble aux amandes.',p:58},
    {n:'Fruits givrés',d:'Fruits de saison, granité citron-menthe et sirop léger.',p:48}
  ]},
  {id:'boissons', short:'Boissons', name:'Boissons', note:'Chaudes, fraîches & signatures', dishes:[
    {n:'Blue Matcha',d:'Matcha bleu, vanille, lait de coco et mousse légère.',p:48},
    {n:'Iced Pistachio',d:'Double espresso, lait frais et crème maison à la pistache.',p:46},
    {n:'Juvia Spritz',d:'Agrumes frais, fleur d’oranger, tonic et fines bulles sans alcool.',p:54},
    {n:'Espresso',d:'Café de spécialité, assemblage maison aux notes chocolatées.',p:22},
    {n:'Jus pressé minute',d:'Orange, citron, pomme ou mélange selon la saison.',p:38},
    {n:'Thé signature',d:'Thé vert, menthe fraîche, verveine et touche de fleur d’oranger.',p:32}
  ]}
];

/* ------------------------------------------------------------
   Lucide icon helper — renders <i data-lucide> placeholders,
   converted to inline SVGs by lucide.createIcons() after render.
   ------------------------------------------------------------ */
// Canonical lucide names for symbols renamed across versions
var ICON_ALIASES = { 'check-circle-2': 'circle-check-big', 'loader-2': 'loader-circle' };
function ic(name, size, attrs) {
  name = ICON_ALIASES[name] || name;
  return '<i data-lucide="' + name + '"' +
    (size ? ' width="' + size + '" height="' + size + '"' : '') +
    (attrs ? ' ' + attrs : '') + '></i>';
}
function refreshIcons() {
  try {
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
  } catch (e) { console.warn('Icons:', e); }
}

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function bump(el) { // restart CSS animation on a node (React "key" equivalent)
  if (!el) return el;
  var clone = el.cloneNode(true);
  el.replaceWith(clone);
  return clone;
}

/* ------------------------------------------------------------
   Safe storage
   ------------------------------------------------------------ */
var PASS_STORAGE_KEY = 'juvia_client_id';
var STAFF_SESSION_KEY = 'juvia_staff_verified_v2';
var safeStorage = {
  get: function (store, key) { try { return typeof window !== 'undefined' ? window[store] && window[store].getItem(key) : null; } catch (e) { return null; } },
  set: function (store, key, value) { try { if (typeof window !== 'undefined' && window[store]) window[store].setItem(key, value); } catch (e) {} },
  remove: function (store, key) { try { if (typeof window !== 'undefined' && window[store]) window[store].removeItem(key); } catch (e) {} }
};

function clientName(client) {
  var detailed = [client && client.first_name, client && client.last_name].filter(Boolean).join(' ').trim();
  return detailed || (client && (client.full_name || client.name)) || 'Client Juvia';
}
function clientPoints(client) { return Number((client && (client.points != null ? client.points : client.points_balance)) || 0); }

/* ------------------------------------------------------------
   Phone helpers (libphonenumber-js CDN global: window.libphonenumber)
   ------------------------------------------------------------ */
var LP = window.libphonenumber || {};
var getCountriesFn = LP.getCountries || function () { return ['MA']; };
var getCallingCodeFn = LP.getCountryCallingCode || function (c) { return c === 'PS' ? '970' : '212'; };

function callingCodeFor(country) { try { return getCallingCodeFn(country || 'MA'); } catch (e) { return '212'; } }
function cleanNationalPhone(value, country) {
  country = country || 'MA';
  var digits = String(value == null ? '' : value).replace(/\D/g, '');
  if (digits.indexOf('00') === 0) digits = digits.slice(2);
  var code = callingCodeFor(country);
  if (digits.indexOf(code) === 0 && digits.length > code.length + 5) digits = digits.slice(code.length);
  digits = digits.replace(/^0+/, '');
  return digits.slice(0, Math.max(6, 15 - code.length));
}
function normalizePhone(value, country) {
  country = country || 'MA';
  var national = cleanNationalPhone(value, country);
  return national ? '+' + callingCodeFor(country) + national : '';
}
function findClientByPhone(value, country) {
  country = country || 'MA';
  var national = cleanNationalPhone(value, country);
  if (!national) return Promise.resolve({ data: null, error: null });
  var code = callingCodeFor(country);
  var full = '+' + code + national;
  var raw = String(value == null ? '' : value).trim();
  var candidates = [full, code + national, '00' + code + national, '0' + national, national, raw];
  if (country === 'MA' && national.length === 9) {
    var spaced = national[0] + ' ' + national.slice(1, 3) + ' ' + national.slice(3, 5) + ' ' + national.slice(5, 7) + ' ' + national.slice(7, 9);
    candidates.push(spaced, '+212 ' + spaced);
  }
  var unique = candidates.filter(function (v, i) { return v && candidates.indexOf(v) === i; });
  return supabase.from('clients').select('*').in('phone', unique).limit(1)
    .then(function (res) { return { data: (res.data && res.data[0]) || null, error: res.error }; });
}

var parseBillAmount = function (value) { return parseFloat(String(value == null ? '' : value).replace(',', '.').replace(/[^0-9.]/g, '')); };
var missingColumn = function (error) { return (error && error.code === 'PGRST204') || /column .* does not exist|schema cache/i.test((error && error.message) || ''); };

function insertClientProfile(firstName, lastName, phone, email) {
  var name = (firstName + ' ' + lastName).trim();
  return supabase.from('clients')
    .insert({ first_name: firstName, last_name: lastName, name: name, phone: phone, email: email, points: 0 })
    .select().single();
}
function updatePointsBalance(id, balance) {
  var result = supabase.from('clients').update({ points: balance }).eq('id', id).select().single();
  return result.then(function (res) {
    if (res.error && missingColumn(res.error)) {
      return supabase.from('clients').update({ points_balance: balance }).eq('id', id).select().single();
    }
    return res;
  });
}
function logLoyaltyTransaction(clientId, amount, earned) {
  var safeClientId = String(clientId == null ? '' : clientId).trim();
  var isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(safeClientId);
  if (!isUuid) return Promise.resolve({ error: new Error('UUID client invalide pour l’historique') });
  return supabase.from('transactions').insert({ client_id: safeClientId, amount_spent: parseFloat(amount), points_added: Number(earned) });
}

/* ------------------------------------------------------------
   Country list (dynamic calling codes, Palestine prioritized,
   Israel excluded) — same logic as the React version
   ------------------------------------------------------------ */
var countryNames = (typeof Intl !== 'undefined' && Intl.DisplayNames) ? new Intl.DisplayNames(['fr'], { type: 'region' }) : null;
var phoneCountries = [];
try {
  var allIso = getCountriesFn().concat(['PS']).filter(function (iso, i, arr) { return arr.indexOf(iso) === i; });
  phoneCountries = allIso.map(function (iso) {
    return { iso: iso, name: (countryNames && countryNames.of(iso)) || iso, code: callingCodeFor(iso) };
  }).filter(function (country) {
    return ('+' + country.code) !== '+972' && country.iso !== 'IL';
  }).sort(function (a, b) {
    if (a.iso === 'MA') return -1; if (b.iso === 'MA') return 1;
    if (a.iso === 'PS') return -1; if (b.iso === 'PS') return 1;
    return a.name.localeCompare(b.name, 'fr');
  });
} catch (e) {
  console.warn('Pays/indicatifs indisponibles, repli Maroc + Palestine:', e);
  phoneCountries = [
    { iso: 'MA', name: 'Maroc', code: '212' },
    { iso: 'PS', name: 'Palestine', code: '970' }
  ];
}

function parseInternationalInput(value, currentCountry) {
  var raw = String(value == null ? '' : value);
  if (/^\s*(\+|00)/.test(raw)) {
    var digits = raw.replace(/\D/g, '').replace(/^00/, '');
    var match = phoneCountries.slice().sort(function (a, b) { return b.code.length - a.code.length; })
      .find(function (item) { return digits.indexOf(item.code) === 0; });
    if (match) return { country: match.iso, national: cleanNationalPhone(digits, match.iso) };
  }
  return { country: currentCountry, national: cleanNationalPhone(raw, currentCountry) };
}
function countryFlag(iso) {
  return iso.replace(/./g, function (char) { return String.fromCodePoint(127397 + char.charCodeAt()); });
}

/* ------------------------------------------------------------
   FX helpers
   ------------------------------------------------------------ */
var safeVibrate = function (pattern) {
  try { if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') navigator.vibrate(pattern); } catch (e) {}
};

var party = function () {
  try {
    if (typeof window === 'undefined' || typeof requestAnimationFrame !== 'function' || typeof confetti !== 'function') return;
    var end = Date.now() + 950;
    var colors = ['#1069d5', '#21a7d5', '#f0bc61', '#176d68', '#ffffff'];
    (function frame() {
      try {
        confetti({ particleCount: 7, angle: 60, spread: 65, origin: { x: 0, y: 0.68 }, colors: colors });
        confetti({ particleCount: 7, angle: 120, spread: 65, origin: { x: 1, y: 0.68 }, colors: colors });
      } catch (e) { return; }
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  } catch (e) {}
};

/* ------------------------------------------------------------
   Arcade audio engine
   ------------------------------------------------------------ */
var arcadeAudio = (function () {
  var ctx = null;
  var lastTick = 0;
  function ensure() {
    try {
      if (!appState.sound || typeof window === 'undefined') return null;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume().catch(function () {});
      return ctx;
    } catch (e) { return null; }
  }
  function tick(pitch) {
    try {
      pitch = pitch || 720;
      var now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - lastTick < 45) return;
      lastTick = now;
      var c = ensure(); if (!c) return;
      var o = c.createOscillator(), g = c.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(pitch, c.currentTime);
      g.gain.setValueAtTime(0.035, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.035);
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + 0.04);
    } catch (e) {}
  }
  function win() {
    try {
      var c = ensure(); if (!c) return;
      [523, 659, 784, 1047].forEach(function (f, i) {
        var o = c.createOscillator(), g = c.createGain();
        var t = c.currentTime + i * 0.1;
        o.type = 'sine';
        o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.001, t);
        g.gain.exponentialRampToValueAtTime(0.11, t + 0.025);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        o.connect(g); g.connect(c.destination);
        o.start(t); o.stop(t + 0.34);
      });
    } catch (e) {}
  }
  return { tick: tick, win: win, ensure: ensure };
})();

function audioStaffWin() {
  try {
    if (typeof window === 'undefined') return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    var c = new AC();
    [523, 659, 784].forEach(function (f, i) {
      var o = c.createOscillator(), g = c.createGain();
      var t = c.currentTime + i * 0.1;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + 0.26);
    });
  } catch (e) {}
}

/* ------------------------------------------------------------
   Story card generation (canvas) — unchanged from React version
   ------------------------------------------------------------ */
var roundedRect = function (ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r); ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r); ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
};
var wrapCanvasText = function (ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  maxLines = maxLines || 10;
  var words = text.split(' ');
  var line = '', lines = [];
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; } else line = test;
  }
  if (line) lines.push(line);
  lines = lines.slice(0, maxLines);
  lines.forEach(function (value, i) { ctx.fillText(value, x, y + i * lineHeight); });
  return y + lines.length * lineHeight;
};

function generateStoryCard(data) {
  if (typeof document === 'undefined') return Promise.reject(new Error('Canvas indisponible'));
  return Promise.resolve().then(function () {
    try { return document.fonts && document.fonts.ready ? document.fonts.ready : null; } catch (e) { return null; }
  }).then(function () {
    var canvas = document.createElement('canvas');
    canvas.width = 1080; canvas.height = 1920;
    var ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponible');
    var ivory = '#f6f1e7', anthracite = '#202927', gold = '#c89c56', blue = '#1069d5', teal = '#176d68';
    ctx.fillStyle = ivory; ctx.fillRect(0, 0, 1080, 1920);
    // Soft procedural marble veins keep the generated file self-contained and share-safe.
    ctx.save(); ctx.globalAlpha = 0.12;
    for (var i = 0; i < 34; i++) {
      var y = (i * 173) % 1920 - 120;
      ctx.beginPath(); ctx.moveTo(-80, y);
      ctx.bezierCurveTo(250, y + 110 + (i % 3) * 35, 650, y - 90, 1160, y + 80);
      ctx.strokeStyle = i % 4 === 0 ? gold : '#7c8884';
      ctx.lineWidth = i % 5 === 0 ? 3 : 1.2;
      ctx.stroke();
    }
    ctx.restore();
    var glow = ctx.createRadialGradient(840, 220, 30, 840, 220, 650);
    glow.addColorStop(0, 'rgba(33,167,213,.15)'); glow.addColorStop(1, 'rgba(33,167,213,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 1080, 1000);
    ctx.strokeStyle = anthracite; ctx.lineWidth = 12; ctx.strokeRect(38, 38, 1004, 1844);
    ctx.strokeStyle = gold; ctx.lineWidth = 3; ctx.strokeRect(58, 58, 964, 1804);
    ctx.textAlign = 'center';
    ctx.fillStyle = anthracite; ctx.font = '600 88px Manrope, sans-serif';
    ctx.fillText('juvia', 540, 205);
    ctx.fillStyle = gold; ctx.fillText('.', 670, 205);
    ctx.font = '600 18px "DM Sans", sans-serif';
    try { ctx.letterSpacing = '7px'; } catch (e) {}
    ctx.fillStyle = teal; ctx.fillText('CAFÉ  ·  RESTAURANT', 540, 255);
    try { ctx.letterSpacing = '0px'; } catch (e) {}
    roundedRect(ctx, 115, 335, 850, 1040, 38);
    ctx.fillStyle = anthracite; ctx.fill();
    ctx.strokeStyle = gold; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = gold; ctx.font = '600 23px "DM Sans", sans-serif';
    ctx.fillText(data.type === 'payer' ? '—  QUI PAIE ?  —' : '—  COMBO IDÉAL  —', 540, 435);
    if (data.type === 'payer') {
      ctx.fillStyle = '#ffffff'; ctx.font = '500 54px "Playfair Display", Georgia, serif';
      ctx.fillText('C’EST', 540, 600);
      ctx.fillStyle = '#72c6eb'; ctx.font = 'italic 500 126px "Playfair Display", Georgia, serif';
      wrapCanvasText(ctx, data.winner.toUpperCase(), 540, 755, 700, 130, 2);
      ctx.fillStyle = '#ffffff'; ctx.font = '500 48px "Playfair Display", Georgia, serif';
      ctx.fillText('qui régale', 540, 1000);
      ctx.fillText('aujourd’hui !', 540, 1062);
      ctx.fillStyle = gold; ctx.font = '400 25px "DM Sans", sans-serif';
      ctx.fillText('Le hasard Juvia a parlé.', 540, 1195);
    } else {
      ctx.fillStyle = '#ffffff'; ctx.font = '500 53px "Playfair Display", Georgia, serif';
      ctx.fillText('LE MENU DU HASARD', 540, 545);
      var y2 = 660;
      data.items.forEach(function (item, idx) {
        ctx.fillStyle = '#72c6eb'; ctx.font = '600 18px "DM Sans", sans-serif';
        ctx.fillText(['LE PLAT', 'LA BOISSON', 'LA DOUCEUR'][idx], 540, y2);
        ctx.fillStyle = '#fff'; ctx.font = '500 40px "Playfair Display", Georgia, serif';
        y2 = wrapCanvasText(ctx, item.n, 540, y2 + 60, 700, 50, 2) + 45;
      });
      ctx.strokeStyle = 'rgba(200,156,86,.55)';
      ctx.beginPath(); ctx.moveTo(310, 1160); ctx.lineTo(770, 1160); ctx.stroke();
      ctx.fillStyle = gold; ctx.font = '600 52px "DM Sans", sans-serif';
      ctx.fillText(String(data.total) + ' DH', 540, 1250);
    }
    ctx.fillStyle = anthracite; ctx.font = 'italic 500 43px "Playfair Display", Georgia, serif';
    ctx.fillText('Des instants qui ont du goût.', 540, 1490);
    ctx.font = '400 29px "DM Sans", sans-serif';
    ctx.fillStyle = '#505956';
    wrapCanvasText(ctx, 'Rejoignez-nous pour une expérience gastronomique & élégante d’exception.', 540, 1605, 750, 45, 3);
    ctx.fillStyle = blue; roundedRect(ctx, 370, 1760, 340, 64, 32); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '600 18px "DM Sans", sans-serif';
    ctx.fillText('@ JUVIA', 540, 1801);
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) { blob ? resolve(blob) : reject(new Error('Image non générée')); }, 'image/png', 1);
    });
  });
}

/* ------------------------------------------------------------
   Share Story block (markup + behavior)
   ------------------------------------------------------------ */
var storyPreviewState = { url: null, blob: null };

function closeStoryPreview() {
  var host = document.getElementById('story-preview-root');
  if (host) host.innerHTML = '';
  if (storyPreviewState.url) { try { URL.revokeObjectURL(storyPreviewState.url); } catch (e) {} }
  storyPreviewState.url = null;
  storyPreviewState.blob = null;
}

function showStoryPreview(blob, message) {
  var url = URL.createObjectURL(blob);
  storyPreviewState.url = url;
  storyPreviewState.blob = blob;
  var host = document.getElementById('story-preview-root');
  if (!host) return;
  host.innerHTML =
    '<div class="story-preview" role="dialog" aria-modal="true" aria-label="Aperçu de la Story">' +
      '<button class="story-preview-bg" id="story-preview-bg"></button>' +
      '<div class="story-preview-card">' +
        '<button class="story-preview-close" id="story-preview-close">' + ic('x', 15) + '</button>' +
        '<span>Aperçu de votre Story</span>' +
        '<img src="' + url + '" alt="Story Juvia prête à partager"/>' +
        '<p>' + esc(message) + '</p>' +
        '<button class="story-copy" id="story-copy">' + ic('share-2', 16) + ' Copier / Partager</button>' +
      '</div>' +
    '</div>';
  refreshIcons();
  document.getElementById('story-preview-bg').addEventListener('click', closeStoryPreview);
  document.getElementById('story-preview-close').addEventListener('click', closeStoryPreview);
  document.getElementById('story-copy').addEventListener('click', function () {
    if (!storyPreviewState.blob) return;
    var msgEl = document.querySelector('.story-preview-card p');
    (async function () {
      try {
        if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': storyPreviewState.blob })]);
          if (msgEl) msgEl.textContent = 'Image copiée ! Collez-la dans votre application préférée.';
          return;
        }
        if (navigator.share) {
          await navigator.share({ title: 'Juvia Story', text: 'Mon résultat Juvia ✨', url: window.location.href });
          return;
        }
        if (msgEl) msgEl.textContent = 'Effectuez un clic droit ou un appui long sur l’image pour la copier et la partager.';
      } catch (error) {
        if (error && error.name !== 'AbortError' && msgEl) {
          msgEl.textContent = 'Effectuez un clic droit ou un appui long sur l’image pour la partager.';
        }
      }
    })();
  });
}

function shareStoryButtonHTML(id) {
  return '<div class="story-actions">' +
    '<button class="story-share" id="' + id + '">' + ic('instagram', 17) + '<span>Partager en Story</span></button>' +
    '<small>Format vertical 9:16 · Instagram, WhatsApp &amp; Facebook</small>' +
  '</div>';
}

function bindShareStoryButton(id, story) {
  var btn = document.getElementById(id);
  if (!btn) return;
  var busy = false;
  btn.addEventListener('click', function () {
    if (busy) return;
    busy = true;
    btn.disabled = true;
    var label = btn.querySelector('span');
    if (label) label.textContent = 'Création de votre Story…';
    (async function () {
      try {
        var blob = await generateStoryCard(story);
        var file = typeof File !== 'undefined' ? new File([blob], 'juvia-story-' + Date.now() + '.png', { type: 'image/png' }) : null;
        var canShareFile = !!(file && typeof navigator !== 'undefined' && typeof navigator.share === 'function' &&
          (!navigator.canShare || navigator.canShare({ files: [file] })));
        if (canShareFile) {
          await navigator.share({
            files: [file], title: 'Juvia Story',
            text: story.type === 'payer' ? 'C’est ' + story.winner + ' qui régale aujourd’hui chez Juvia !' : 'Mon Combo Idéal chez Juvia ✨'
          });
        } else {
          showStoryPreview(blob, 'Votre navigateur ne prend pas en charge le partage direct de fichiers. Copiez l’image ou effectuez un appui long pour la partager.');
        }
      } catch (error) {
        if (!error || error.name !== 'AbortError') {
          console.warn('Native file sharing unavailable:', error);
          try {
            var blob2 = await generateStoryCard(story);
            showStoryPreview(blob2, 'Votre navigateur ne prend pas en charge le partage direct de fichiers. Copiez l’image ou effectuez un appui long pour la partager.');
          } catch (cardError) { console.error('Story preview error:', cardError); }
        }
      } finally {
        busy = false;
        btn.disabled = false;
        if (label) label.textContent = 'Partager en Story';
      }
    })();
  });
}

/* ------------------------------------------------------------
   App state
   ------------------------------------------------------------ */
var appState = {
  activeCategory: menu[0].id,
  sound: true,
  gameTab: 'payer',
  passOpen: false,
  pass: {
    client: null,
    loading: false,
    error: '',
    mode: 'register',
    channel: null,
    form: { first_name: '', last_name: '', country: 'MA', phone: '', email: '' },
    recovery: { name: '', email: '' }
  },
  payer: { names: ['Lina', 'Yassine', 'Sarah'], display: 'Prêt ?', spinning: false, winner: '', timer: null },
  combo: {
    pools: [menu[3].dishes, menu[6].dishes, menu[5].dishes],
    labels: ['Plat', 'Boisson', 'Dessert'],
    emojis: ['🍽️', '🥤', '🍰'],
    values: [menu[3].dishes[0], menu[6].dishes[0], menu[5].dishes[0]],
    stopped: [true, true, true],
    spinning: false,
    revealed: false,
    timers: []
  },
  staff: {
    authenticated: false, pin: '', pinError: '', profile: null, amount: '',
    status: { type: '', text: '' }, loading: false, manualId: '',
    scanner: null, scannerRunning: false, starting: false, processingRead: false,
    fallbackStream: null, autoStartCam: false,
    camState: 'off', camError: null, readerSeq: 0, readerId: '',
    cameraSession: 0, scannerCleanup: Promise.resolve()
  }
};

var app = document.getElementById('app');
var isStaffRoute = /\/staff-scan(\.html)?[/?]?$/.test(window.location.pathname.replace(/\/$/, '')) ||
                   window.location.pathname.replace(/\/$/, '').endsWith('/staff-scan');

/* ============================================================
   MENU PAGE
   ============================================================ */
function logoHTML() {
  return '<a class="logo" href="#top" aria-label="Juvia, retour en haut">juvia<span>.</span></a>';
}

var TEST_VIDEO_POSTER_URL = 'https://pub-b1a7fa82e58941ab8f7a5cd45961105f.r2.dev/Screenshot%202026-09-26%20at%2016.36.44.png';
var TEST_VIDEO_URL = 'https://pub-b1a7fa82e58941ab8f7a5cd45961105f.r2.dev/%5B%40download_it_bot%201080p%5D%20Video%20by%20juvia%20oujda.mp4';

function videoCardHTML(dish, index, catIndex) {
  // The card is one native button, so every visible part of it keeps the
  // tap as a trusted user gesture for the modal video on mobile browsers.
  return '<button type="button" class="video-card crop-' + index + '" data-dish-cat="' + catIndex + '" data-dish-name="' + esc(dish.n) + '" aria-label="Voir la vidéo de ' + esc(dish.n) + '" aria-haspopup="dialog">' +
    '<video class="video-card-media" src="' + TEST_VIDEO_URL + '" poster="' + TEST_VIDEO_POSTER_URL + '" preload="none" playsinline muted loop aria-hidden="true" tabindex="-1"></video>' +
    '<span class="video-play">' + ic('play', 15, 'fill="currentColor"') + '</span>' +
    '<span class="video-duration">0:' + (12 + index * 3) + '</span>' +
    '<b>' + esc(dish.n) + '</b>' +
  '</button>';
}

function menuSectionHTML(category, index) {
  var html = '<section class="menu-category" id="' + category.id + '" data-category="' + category.id + '">' +
    '<div class="section-title"><div><span>0' + (index + 1) + '</span><h2>' + esc(category.name) + '</h2></div><p>' + esc(category.note) + '</p></div>' +
    '<div class="featured"><div class="featured-label">' + ic('play', 12, 'fill="currentColor"') + ' En vidéo</div>' +
      '<div class="video-row">';
  category.dishes.slice(0, 3).forEach(function (d, i) { html += videoCardHTML(d, i, index); });
  html += '</div></div><div class="dish-list">';
  category.dishes.forEach(function (d, i) {
    html += '<article class="dish"><div><h3>' + esc(d.n) +
      (i === 0 ? '<span class="chef">Favori</span>' : '') +
      '</h3><p>' + esc(d.d) + '</p></div><strong>' + d.p + '<small> dh</small></strong></article>';
  });
  html += '</div></section>';
  return html;
}

function renderMenuPage() {
  var html =
    '<header class="topbar" id="top">' + logoHTML() +
      '<div class="brandline"><span>Café &amp; Restaurant</span><small>Menu digital</small></div>' +
      '<button class="top-game" id="btn-games-top">' + ic('gamepad-2', 18) + '<span>Jeux</span></button>' +
    '</header>' +
    '<div class="welcome"><div><span>À table !</span><h1>Que voulez-vous<br/><em>déguster ?</em></h1></div>' +
      '<div class="table-pill"><i></i> Menu disponible</div></div>' +
    '<nav id="category-navigation" class="category-nav" aria-label="Catégories du menu">' +
      '<button type="button" class="pass-nav-button" id="btn-open-pass">' + ic('crown', 17) + '<span>Juvia Pass</span></button>';
  menu.forEach(function (c, i) {
    html += '<button type="button" data-id="' + c.id + '"' +
      (appState.activeCategory === c.id ? ' aria-current="true" class="active"' : '') + '>' +
      '<span>0' + (i + 1) + '</span>' + esc(c.short) + '</button>';
  });
  html += '</nav><main class="menu-content">';
  menu.forEach(function (c, i) { html += menuSectionHTML(c, i); });
  html += '</main>' +
    '<footer>' + logoHTML() +
      '<p>Des instants qui ont du goût.</p>' +
      '<a class="location" href="https://maps.app.goo.gl/HbK9yQeZqMC5ZQQL7" target="_blank" rel="noreferrer">' +
        ic('map-pin', 17) + '<span>Ouvrir dans Google Maps</span>' + ic('chevron-right', 16) + '</a>' +
      '<div class="socials">' +
        '<a href="https://www.instagram.com/juvia_oujda/?hl=en" aria-label="Instagram">' + ic('instagram', 15) + '</a>' +
        '<a href="https://www.facebook.com/profile.php?id=61560561884629" aria-label="Facebook">' + ic('facebook', 15) + '</a>' +
        '<a href="https://www.tiktok.com/@juvia.restaurant.oujda?is_from_webapp=1&sender_device=pc" aria-label="TikTok">' + ic('music-2', 15) + '</a>' +
      '</div>' +
      '<a class="staff-footer-link" href="staff-scan.html">' + ic('lock-keyhole', 10) + ' Espace Staff</a>' +
      '<small>© 2026 Juvia Café &amp; Restaurant</small></footer>' +
    '<button class="floating-game" id="btn-games-float">' + ic('gamepad-2', 21) + '<span>Jeux<br/><small>à table</small></span></button>' +
    // persistent shells for drawer, pass modal, video modal, story preview
    '<div id="games-shell"></div>' +
    '<div id="pass-root"></div>' +
    '<div id="video-root"></div>' +
    '<div id="story-preview-root"></div>';

  app.innerHTML = html;
  refreshIcons();

  document.getElementById('btn-games-top').addEventListener('click', openGames);
  document.getElementById('btn-games-float').addEventListener('click', openGames);
  document.getElementById('btn-open-pass').addEventListener('click', openPass);

  // Category navigation clicks
  var nav = document.getElementById('category-navigation');
  nav.querySelectorAll('button[data-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-id');
      var section = document.getElementById(id);
      if (!section) return;
      selectCategory(id);
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Video cards are native buttons. Since their visual children do not receive
  // pointer events, a tap anywhere on a card reaches this trusted click handler.
  document.querySelectorAll('.video-card').forEach(function (card) {
    card.addEventListener('click', function (event) {
      event.preventDefault();
      var catIndex = parseInt(card.getAttribute('data-dish-cat'), 10);
      var name = card.getAttribute('data-dish-name');
      var dish = menu[catIndex] && menu[catIndex].dishes.find(function (d) { return d.n === name; });
      if (dish) openVideoModal(dish);
    });
  });

  // Scroll spy
  var isManualScrolling = { value: false };
  var manualScrollTimer = null;
  function selectCategory(id) {
    isManualScrolling.value = true;
    setActiveCategory(id);
    if (manualScrollTimer) clearTimeout(manualScrollTimer);
    manualScrollTimer = setTimeout(function () { isManualScrolling.value = false; }, 850);
  }
  if (typeof IntersectionObserver !== 'undefined') {
    var observer = new IntersectionObserver(function (entries) {
      if (isManualScrolling.value) return;
      var visible = entries.filter(function (entry) { return entry.isIntersecting; });
      if (!visible.length) return;
      var current = visible.sort(function (a, b) { return a.boundingClientRect.top - b.boundingClientRect.top; })[0];
      setActiveCategory(current.target.id);
    }, { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    menu.forEach(function (category) {
      var section = document.getElementById(category.id);
      if (section) observer.observe(section);
    });
  }

  renderGamesShell();

  // Open pass automatically from manifest start_url
  try {
    if (new URLSearchParams(window.location.search).get('pass') === 'open') openPass();
  } catch (e) {}
}

function setActiveCategory(id) {
  if (appState.activeCategory === id) return;
  appState.activeCategory = id;
  var nav = document.getElementById('category-navigation');
  if (!nav) return;
  nav.querySelectorAll('button[data-id]').forEach(function (btn) {
    var isActive = btn.getAttribute('data-id') === id;
    btn.classList.toggle('active', isActive);
    if (isActive) btn.setAttribute('aria-current', 'true'); else btn.removeAttribute('aria-current');
  });
  // Center the active tab in the horizontal strip
  var tab = nav.querySelector('[data-id="' + id + '"]');
  if (tab) {
    var left = tab.offsetLeft - (nav.clientWidth - tab.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }
}

/* ------------------------------------------------------------
   Video modal
   ------------------------------------------------------------ */
function openVideoModal(dish) {
  var host = document.getElementById('video-root');
  if (!host) return;
  host.innerHTML =
    '<div class="video-modal" role="dialog" aria-modal="true" aria-label="Vidéo de ' + esc(dish.n) + '">' +
      '<button type="button" class="modal-bg" id="video-bg" aria-label="Fermer la vidéo"></button>' +
      '<div class="modal-card">' +
        '<button type="button" class="modal-close" id="video-close" aria-label="Fermer la vidéo">' + ic('x', 18) + '</button>' +
        // These attributes must stay in the HTML: iOS Safari and Android use
        // them to permit immediate inline, muted autoplay after the card tap.
        '<div class="modal-image"><video class="modal-video" src="' + TEST_VIDEO_URL + '" poster="' + TEST_VIDEO_POSTER_URL + '" preload="auto" autoplay playsinline webkit-playsinline muted loop controls aria-label="Lire la vidéo de ' + esc(dish.n) + '"></video></div>' +
        '<span class="modal-kicker">Dans les coulisses</span>' +
        '<h2>' + esc(dish.n) + '</h2>' +
        '<p>' + esc(dish.d) + '</p>' +
        '<strong>' + dish.p + ' dh</strong>' +
      '</div>' +
    '</div>';
  refreshIcons();

  // Call play during the original click handler, rather than waiting for a
  // timeout or animation. This preserves mobile browsers' user activation.
  var video = host.querySelector('.modal-video');
  if (video) {
    video.muted = true;
    video.defaultMuted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.loop = true;
    video.setAttribute('muted', '');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('loop', '');
    try {
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') playAttempt.catch(function () {});
    } catch (e) { /* Native controls remain available if playback cannot start. */ }
  }

  function close() {
    if (video) {
      try { video.pause(); } catch (e) {}
    }
    host.innerHTML = '';
  }
  document.getElementById('video-bg').addEventListener('click', close);
  document.getElementById('video-close').addEventListener('click', close);
}

/* ------------------------------------------------------------
   Games drawer — shell, tabs, "Qui paie ?" & "Combo idéal"
   ------------------------------------------------------------ */
function renderGamesShell() {
  var host = document.getElementById('games-shell');
  if (!host) return;
  host.innerHTML =
    '<button class="backdrop" id="games-backdrop" aria-label="Fermer les jeux"></button>' +
    '<aside class="drawer arcade-drawer" id="games-drawer" aria-hidden="true">' +
      '<div class="drawer-head"><div><span>Juvia Arcade</span><h2>Les jeux à table</h2></div>' +
        '<div class="drawer-tools">' +
          '<button class="sound-toggle" id="btn-sound" aria-label="Couper le son"></button>' +
          '<button id="btn-games-close">' + ic('x', 18) + '</button>' +
        '</div></div>' +
      '<div class="game-tabs">' +
        '<button id="tab-payer" class="' + (appState.gameTab === 'payer' ? 'active' : '') + '">' + ic('wallet-cards', 17) + ' Qui paie ?</button>' +
        '<button id="tab-combo" class="' + (appState.gameTab === 'combo' ? 'active' : '') + '">' + ic('sparkles', 17) + ' Combo idéal</button>' +
      '</div>' +
      '<div id="game-body"></div>' +
      '<p class="fx-note">Son &amp; vibrations selon les réglages de votre appareil</p>' +
    '</aside>';
  refreshIcons();
  updateSoundToggle();
  document.getElementById('games-backdrop').addEventListener('click', closeGames);
  document.getElementById('btn-games-close').addEventListener('click', closeGames);
  document.getElementById('btn-sound').addEventListener('click', function () {
    appState.sound = !appState.sound;
    updateSoundToggle();
  });
  document.getElementById('tab-payer').addEventListener('click', function () { switchGameTab('payer'); });
  document.getElementById('tab-combo').addEventListener('click', function () { switchGameTab('combo'); });
  renderGameBody();
}

function updateSoundToggle() {
  var btn = document.getElementById('btn-sound');
  if (!btn) return;
  btn.innerHTML = appState.sound ? ic('volume-2', 17) : ic('volume-x', 17);
  btn.setAttribute('aria-label', appState.sound ? 'Couper le son' : 'Activer le son');
  refreshIcons();
}

function openGames() {
  var drawer = document.getElementById('games-drawer');
  var backdrop = document.getElementById('games-backdrop');
  if (!drawer || !backdrop) return;
  renderGameBody(); // sync UI with current state (e.g. after an interrupted spin)
  backdrop.classList.add('visible');
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeGames() {
  var drawer = document.getElementById('games-drawer');
  var backdrop = document.getElementById('games-backdrop');
  if (backdrop) backdrop.classList.remove('visible');
  if (drawer) { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); }
  document.body.style.overflow = '';
  stopPayerTimer();
  stopComboTimers();
}

function switchGameTab(tab) {
  if (appState.gameTab === tab) return;
  appState.gameTab = tab;
  stopPayerTimer();
  stopComboTimers();
  document.getElementById('tab-payer').classList.toggle('active', tab === 'payer');
  document.getElementById('tab-combo').classList.toggle('active', tab === 'combo');
  renderGameBody();
}

function renderGameBody() {
  if (appState.gameTab === 'payer') renderPayerBody();
  else renderComboBody();
}

/* ---------------- Qui paie ? ---------------- */
function stopPayerTimer() {
  if (appState.payer.timer) { clearTimeout(appState.payer.timer); appState.payer.timer = null; }
  appState.payer.spinning = false;
}

function renderPayerBody() {
  var host = document.getElementById('game-body');
  if (!host) return;
  var p = appState.payer;
  var lights = '';
  for (var i = 0; i < 10; i++) lights += '<i></i>';
  host.innerHTML =
    '<div class="arcade-body">' +
      '<div class="arcade-title"><span class="mini-icon">' + ic('users', 19) + '</span>' +
        '<div><h3>Qui paie ?</h3><p>Le hasard choisit le héros de l’addition.</p></div></div>' +
      '<div class="name-reel ' + (p.spinning ? 'spinning ' : '') + (p.winner ? 'won' : '') + '" id="name-reel">' +
        '<div class="reel-lights">' + lights + '</div>' +
        '<span class="reel-label">LA BANQUE DÉCIDE</span>' +
        '<div class="reel-window">' +
          '<div class="reel-blur">' + (p.spinning ? '••••••••' : '★ ★ ★') + '</div>' +
          '<strong id="reel-display">' + esc(p.display) + '</strong>' +
          '<div class="reel-blur">' + (p.spinning ? '••••••••' : '★ ★ ★') + '</div>' +
        '</div>' +
        '<div id="winner-slot">' + (p.winner ? '<div class="winner-line">' + ic('trophy', 14) + ' ' + esc(p.winner) + ' régale la table !</div>' : '') + '</div>' +
      '</div>' +
      '<div id="payer-story-slot">' + (p.winner ? shareStoryButtonHTML('btn-share-payer') : '') + '</div>' +
      '<div class="participant-head"><span>Joueurs · <span id="payer-count">' + p.names.length + '</span></span><small>Appuyez pour retirer</small></div>' +
      '<div class="name-chips" id="name-chips"></div>' +
      '<div class="add-name">' +
        '<input id="payer-input" ' + (p.spinning ? 'disabled' : '') + ' placeholder="Ajouter un prénom"/>' +
        '<button id="payer-add" ' + (p.spinning ? 'disabled' : '') + '>' + ic('plus', 18) + '</button>' +
      '</div>' +
      '<button class="spin-action ' + (p.spinning ? 'running' : '') + '" id="payer-spin" ' + (p.spinning || p.names.length < 2 ? 'disabled' : '') + '>' +
        '<span>' + ic('rotate-ccw', 16) + '</span>' +
        (p.spinning ? 'Ça tourne…' : p.winner ? 'Rejouer' : 'Lancer la roue') +
      '</button>' +
      (p.names.length < 2 ? '<p class="game-hint">Ajoutez au moins 2 personnes pour jouer.</p>' : '') +
    '</div>';
  refreshIcons();
  renderNameChips();

  var input = document.getElementById('payer-input');
  function addName() {
    var value = input.value.trim();
    if (value && !appState.payer.spinning) {
      appState.payer.names.push(value);
      input.value = '';
      renderNameChips();
      syncPayerSpinState();
    }
  }
  document.getElementById('payer-add').addEventListener('click', addName);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') addName(); });
  document.getElementById('payer-spin').addEventListener('click', spinPayer);
  if (p.winner) bindShareStoryButton('btn-share-payer', { type: 'payer', winner: p.winner });
}

function renderNameChips() {
  var host = document.getElementById('name-chips');
  if (!host) return;
  var p = appState.payer;
  host.innerHTML = p.names.map(function (n, i) {
    return '<button data-index="' + i + '" ' + (p.spinning ? 'disabled' : '') + '>' + esc(n) + ic('x', 11) + '</button>';
  }).join('');
  refreshIcons();
  host.querySelectorAll('button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (appState.payer.spinning) return;
      var i = parseInt(btn.getAttribute('data-index'), 10);
      appState.payer.names.splice(i, 1);
      renderNameChips();
      syncPayerSpinState();
    });
  });
}

function syncPayerSpinState() {
  var count = document.getElementById('payer-count');
  if (count) count.textContent = appState.payer.names.length;
  var spin = document.getElementById('payer-spin');
  if (spin && !appState.payer.spinning) spin.disabled = appState.payer.names.length < 2;
}

function spinPayer() {
  var p = appState.payer;
  if (p.names.length < 2 || p.spinning) return;
  arcadeAudio.ensure();
  p.spinning = true;
  p.winner = '';
  renderPayerBody();

  var step = 0;
  var total = 34 + Math.floor(Math.random() * 8);
  var chosen = p.names[Math.floor(Math.random() * p.names.length)];

  function roll() {
    step++;
    var isFinal = step >= total;
    var names = appState.payer.names;
    var value = isFinal ? chosen : names[step % names.length];
    appState.payer.display = value;
    var displayEl = bump(document.getElementById('reel-display'));
    if (displayEl) displayEl.textContent = value;
    arcadeAudio.tick(760 + (step % 4) * 55);
    safeVibrate(isFinal ? [35, 40, 90] : 7);
    if (isFinal) {
      appState.payer.spinning = false;
      appState.payer.winner = chosen;
      renderPayerBody();
      arcadeAudio.win();
      party();
      return;
    }
    var t = 0.018 + Math.pow(step / total, 3) * 0.19;
    appState.payer.timer = setTimeout(roll, t * 1000);
  }
  roll();
}

/* ---------------- Combo idéal ---------------- */
function stopComboTimers() {
  appState.combo.timers.forEach(function (t) { clearTimeout(t); });
  appState.combo.timers = [];
  appState.combo.spinning = false;
}

function renderComboBody() {
  var host = document.getElementById('game-body');
  if (!host) return;
  var c = appState.combo;
  var lights = '';
  for (var i = 0; i < 14; i++) lights += '<i></i>';
  var reels = c.values.map(function (v, i) {
    return '<div class="slot-reel ' + (c.stopped[i] ? 'stopped' : 'rolling') + '" data-reel="' + i + '">' +
      '<small>' + c.labels[i] + '</small>' +
      '<span class="slot-emoji">' + c.emojis[i] + '</span>' +
      '<strong>' + esc(v.n) + '</strong>' +
      '<em>' + v.p + ' dh</em>' +
    '</div>';
  }).join('');
  var total = c.values.reduce(function (n, v) { return n + v.p; }, 0);
  host.innerHTML =
    '<div class="arcade-body">' +
      '<div class="arcade-title"><span class="mini-icon purple">' + ic('sparkles', 19) + '</span>' +
        '<div><h3>Combo idéal</h3><p>Trois rouleaux. Un festin surprise.</p></div></div>' +
      '<div class="slot-machine ' + (c.spinning ? 'spinning' : '') + (c.revealed ? ' jackpot' : '') + '" id="slot-machine">' +
        '<div class="slot-top"><span>JUVIA</span><b>MEAL JACKPOT</b><span>★</span></div>' +
        '<div class="slot-reels" id="slot-reels">' + reels + '</div>' +
        '<div class="payline"></div>' +
        '<div class="slot-lights">' + lights + '</div>' +
      '</div>' +
      '<div id="combo-result">' +
      (c.revealed ?
        '<div class="combo-win"><span>✨ COMBO DÉBLOQUÉ</span><b>' + total + ' dh</b><small>pour le menu complet</small></div>' +
        shareStoryButtonHTML('btn-share-combo') : '') +
      '</div>' +
      '<button class="spin-action combo-spin ' + (c.spinning ? 'running' : '') + '" id="combo-spin" ' + (c.spinning ? 'disabled' : '') + '>' +
        '<span>' + ic('play', 16, 'fill="currentColor"') + '</span>' +
        (c.spinning ? 'Les rouleaux tournent…' : c.revealed ? 'Nouveau combo' : 'Jouer les rouleaux') +
      '</button>' +
    '</div>';
  refreshIcons();
  document.getElementById('combo-spin').addEventListener('click', spinCombo);
  if (c.revealed) bindShareStoryButton('btn-share-combo', { type: 'combo', items: c.values, total: total });
}

function spinComboReel(ri, duration) {
  return new Promise(function (resolve) {
    var c = appState.combo;
    var step = 0;
    var started = typeof performance !== 'undefined' ? performance.now() : Date.now();
    function move() {
      step++;
      var elapsed = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - started;
      var done = elapsed >= duration;
      var pool = c.pools[ri];
      var finalValue = pool[Math.floor(Math.random() * pool.length)];
      var value = done ? finalValue : pool[step % pool.length];
      c.values[ri] = value;
      // Update reel DOM in place
      var reel = document.querySelector('.slot-reel[data-reel="' + ri + '"]');
      if (reel) {
        var strong = bump(reel.querySelector('strong'));
        if (strong) strong.textContent = value.n;
        var em = reel.querySelector('em');
        if (em) em.textContent = value.p + ' dh';
      }
      arcadeAudio.tick(ri === 0 ? 620 : ri === 1 ? 740 : 860);
      safeVibrate(done ? 35 : 6);
      if (done) {
        c.stopped[ri] = true;
        if (reel) { reel.classList.remove('rolling'); reel.classList.add('stopped'); }
        resolve();
        return;
      }
      var progress = elapsed / duration;
      c.timers[ri] = setTimeout(move, 35 + Math.pow(progress, 3) * 150);
    }
    move();
  });
}

function spinCombo() {
  var c = appState.combo;
  if (c.spinning) return;
  arcadeAudio.ensure();
  c.spinning = true;
  c.revealed = false;
  c.stopped = [false, false, false];
  renderComboBody();
  Promise.all([spinComboReel(0, 1750), spinComboReel(1, 2350), spinComboReel(2, 2950)]).then(function () {
    c.spinning = false;
    c.revealed = true;
    renderComboBody();
    arcadeAudio.win();
    safeVibrate([40, 45, 40, 45, 110]);
    party();
  });
}

/* ------------------------------------------------------------
   Juvia Pass — loyalty modal
   ------------------------------------------------------------ */
function qrSvgFor(value) {
  try {
    if (typeof qrcode !== 'function') return '';
    var qr = qrcode(0, 'H');
    qr.addData(value);
    qr.make();
    var svg = qr.createSvgTag({ cellSize: 4, margin: 4, scalable: true });
    svg = svg.replace('<svg ', '<svg width="128" height="128" ');
    svg = svg.replace(/fill="#000000"/i, 'fill="#17302f"');
    return svg;
  } catch (e) {
    console.warn('QR generation failed:', e);
    return '';
  }
}

function selectedCountry() {
  return phoneCountries.find(function (item) { return item.iso === appState.pass.form.country; }) || phoneCountries[0];
}

function countryTriggerHTML() {
  var sel = selectedCountry();
  return '<span>' + countryFlag(sel.iso) + '</span><b>+' + esc(sel.code) + '</b>' + ic('chevron-right', 12);
}

function countryOptionsHTML(search) {
  var query = (search || '').trim().toLowerCase();
  var options = phoneCountries.filter(function (item) {
    return !query || item.name.toLowerCase().indexOf(query) !== -1 ||
      item.iso.toLowerCase().indexOf(query) !== -1 || ('+' + item.code).indexOf(query) !== -1;
  });
  if (!options.length) return '<p>Aucun pays trouvé</p>';
  return options.map(function (item) {
    return '<button type="button" data-iso="' + item.iso + '" class="' + (item.iso === appState.pass.form.country ? 'selected' : '') + '">' +
      '<span>' + countryFlag(item.iso) + '</span><b>' + esc(item.name) + '</b><small>+' + esc(item.code) + '</small></button>';
  }).join('');
}

function closeCountryDropdown() {
  var root = document.getElementById('country-select-root');
  if (!root) return;
  var dropdown = root.querySelector('.country-dropdown');
  if (dropdown) dropdown.remove();
  var trigger = root.querySelector('.country-trigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  document.removeEventListener('pointerdown', countryOutsideListener);
}

function countryOutsideListener(e) {
  var root = document.getElementById('country-select-root');
  if (root && !root.contains(e.target)) closeCountryDropdown();
}

function toggleCountryDropdown() {
  var root = document.getElementById('country-select-root');
  if (!root) return;
  var existing = root.querySelector('.country-dropdown');
  if (existing) { closeCountryDropdown(); return; }
  var trigger = root.querySelector('.country-trigger');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
  var wrap = document.createElement('div');
  wrap.className = 'country-dropdown';
  wrap.innerHTML =
    '<div class="country-search"><input id="country-search-input" placeholder="Rechercher un pays ou +code"/></div>' +
    '<div class="country-options" id="country-options-list">' + countryOptionsHTML('') + '</div>';
  root.appendChild(wrap);
  var searchInput = wrap.querySelector('#country-search-input');
  var list = wrap.querySelector('#country-options-list');
  searchInput.focus();
  searchInput.addEventListener('input', function () {
    list.innerHTML = countryOptionsHTML(searchInput.value);
  });
  list.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-iso]');
    if (!btn) return;
    var iso = btn.getAttribute('data-iso');
    appState.pass.form.country = iso;
    appState.pass.form.phone = cleanNationalPhone(appState.pass.form.phone, iso);
    var phoneInput = document.getElementById('pass-phone-input');
    if (phoneInput) phoneInput.value = appState.pass.form.phone;
    updateCountryTrigger();
    closeCountryDropdown();
  });
  document.addEventListener('pointerdown', countryOutsideListener);
}

function updateCountryTrigger() {
  var root = document.getElementById('country-select-root');
  if (!root) return;
  var trigger = root.querySelector('.country-trigger');
  if (trigger) { trigger.innerHTML = countryTriggerHTML(); refreshIcons(); }
}

function openPass() {
  appState.passOpen = true;
  document.body.style.overflow = 'hidden';
  appState.pass.error = '';
  renderPassModal();
  var storedId = safeStorage.get('localStorage', PASS_STORAGE_KEY);
  if (storedId && !appState.pass.client) fetchPassClient(storedId);
  else subscribePassRealtime();
}

function closePass() {
  appState.passOpen = false;
  document.body.style.overflow = '';
  if (appState.pass.channel && supabase) {
    try { supabase.removeChannel(appState.pass.channel); } catch (e) {}
    appState.pass.channel = null;
  }
  var host = document.getElementById('pass-root');
  if (host) host.innerHTML = '';
}

function fetchPassClient(id) {
  if (!supabase || !id) return;
  appState.pass.loading = true;
  appState.pass.error = '';
  renderPassModalBody();
  supabase.from('clients').select('*').eq('id', id).single()
    .then(function (res) {
      if (res.error) throw res.error;
      appState.pass.client = res.data;
    })
    .catch(function (err) {
      console.error('Juvia Pass fetch:', err);
      safeStorage.remove('localStorage', PASS_STORAGE_KEY);
      appState.pass.client = null;
      appState.pass.error = 'Carte introuvable. Veuillez vous inscrire à nouveau.';
    })
    .finally(function () {
      appState.pass.loading = false;
      renderPassModalBody();
      subscribePassRealtime();
    });
}

function subscribePassRealtime() {
  var clientId = appState.pass.client && appState.pass.client.id;
  if (!supabase || !clientId || appState.pass.channel) return;
  try {
    appState.pass.channel = supabase.channel('juvia-pass-' + clientId)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clients', filter: 'id=eq.' + clientId }, function (payload) {
        appState.pass.client = payload.new;
        renderPassModalBody();
      })
      .subscribe();
  } catch (e) { console.warn('Realtime:', e); }
}

function renderPassModal() {
  var host = document.getElementById('pass-root');
  if (!host) return;
  host.innerHTML =
    '<div class="pass-modal" role="dialog" aria-modal="true" aria-label="Juvia Pass">' +
      '<button class="pass-backdrop" id="pass-backdrop"></button>' +
      '<div class="pass-sheet">' +
        '<div class="pass-sheet-head"><div><span>Programme fidélité</span><h2>Juvia Pass</h2></div>' +
          '<button id="pass-close">' + ic('x', 17) + '</button></div>' +
        '<div id="pass-body"></div>' +
      '</div>' +
    '</div>';
  refreshIcons();
  document.getElementById('pass-backdrop').addEventListener('click', closePass);
  document.getElementById('pass-close').addEventListener('click', closePass);
  renderPassModalBody();
}

function passLoadingHTML() {
  return '<div class="pass-loading">' + ic('loader-circle', 30) + '<p>Votre carte se prépare…</p></div>';
}

function passViewHTML(client) {
  return '<div class="pass-view"><div class="loyalty-card">' +
      '<div class="pass-marble"></div><div class="pass-frame"></div>' +
      '<div class="pass-brand"><a class="logo" href="#top" aria-label="Juvia, retour en haut">juvia<span>.</span></a><span>MEMBER PASS</span></div>' +
      ic('crown', 25, 'class="pass-crown"') +
      '<div class="pass-holder"><small>MEMBRE</small><h3>' + esc(clientName(client)) + '</h3></div>' +
      '<div class="pass-points"><small>SOLDE ACTUEL</small><strong>' + clientPoints(client) + '</strong><span>points</span></div>' +
      '<div class="pass-qr"><div id="pass-qr-box">' + qrSvgFor(client.id) + '</div>' +
        '<span>Présentez ce code à la caisse</span></div>' +
      '<div class="pass-number">N° ' + esc(String(client.id).slice(0, 8).toUpperCase()) + '</div>' +
    '</div>' +
    '<button class="pass-forget" id="pass-forget" type="button">Ce n’est pas votre carte ?</button>' +
  '</div>';
}

function passFormHTML() {
  var f = appState.pass.form;
  return '<form class="pass-register" id="pass-form" novalidate>' +
    '<div class="register-icon">' + ic('credit-card', 25) + '</div>' +
    '<span>Bienvenue dans le cercle</span>' +
    '<h3>Votre fidélité<br/>mérite l’exception.</h3>' +
    '<p>Créez votre pass en quelques secondes. À chaque visite, vos moments Juvia vous récompensent.</p>' +
    '<div class="registration-name-grid">' +
      '<label><span>Prénom</span><div>' + ic('user-round', 16) +
        '<input id="pass-first-name" required value="' + esc(f.first_name) + '" placeholder="Votre prénom" autocomplete="given-name"/></div></label>' +
      '<label><span>Nom</span><div>' + ic('user-round', 16) +
        '<input id="pass-last-name" required value="' + esc(f.last_name) + '" placeholder="Votre nom" autocomplete="family-name"/></div></label>' +
    '</div>' +
    '<label class="international-phone-label"><span>Numéro de téléphone</span><div>' +
      '<div class="country-select" id="country-select-root">' +
        '<button type="button" class="country-trigger" id="country-trigger-btn" aria-expanded="false" aria-label="Choisir l’indicatif pays">' + countryTriggerHTML() + '</button>' +
      '</div>' +
      '<input id="pass-phone-input" required value="' + esc(f.phone) + '" placeholder="Numéro national" inputmode="tel" autocomplete="tel-national" aria-label="Numéro national"/>' +
    '</div></label>' +
    '<label><span>Adresse E-mail</span><div>' + ic('mail', 16) +
      '<input id="pass-email-input" required type="email" value="' + esc(f.email) + '" placeholder="vous@exemple.com" inputmode="email" autocomplete="email"/></div></label>' +
    (appState.pass.error ? '<div class="pass-error">' + esc(appState.pass.error) + '</div>' : '') +
    '<button class="create-pass" id="pass-submit" type="submit" ' + (appState.pass.loading ? 'disabled' : '') + '>' +
      (appState.pass.loading ? ic('loader-circle', 17) : ic('crown', 17)) +
      (appState.pass.loading ? 'Chargement…' : 'Créer mon Juvia Pass') +
    '</button>' +
    '<button type="button" class="recover-pass" id="pass-recover">Déjà un pass ? Retrouver ma carte avec mon nom ou e-mail</button>' +
    '<small>En continuant, vous acceptez de recevoir les avantages Juvia.</small>' +
  '</form>';
}

function passRecoveryHTML() {
  var recovery = appState.pass.recovery;
  return '<form class="pass-register pass-recovery" id="pass-recovery-form" novalidate>' +
    '<div class="register-icon">' + ic('search', 25) + '</div>' +
    '<span>Déjà un pass ?</span>' +
    '<h3>Retrouver ma carte.</h3>' +
    '<p>Utilisez le nom enregistré ou l’adresse e-mail de votre pass. Votre carte et son QR code s’afficheront immédiatement.</p>' +
    '<label><span>Nom complet</span><div>' + ic('user-round', 16) +
      '<input id="pass-recovery-name" value="' + esc(recovery.name) + '" placeholder="Prénom et nom" autocomplete="name"/></div></label>' +
    '<div class="pass-recovery-or"><span>ou</span></div>' +
    '<label><span>Adresse E-mail</span><div>' + ic('mail', 16) +
      '<input id="pass-recovery-email" type="email" value="' + esc(recovery.email) + '" placeholder="vous@exemple.com" autocomplete="email"/></div></label>' +
    (appState.pass.error ? '<div class="pass-error">' + esc(appState.pass.error) + '</div>' : '') +
    '<button class="create-pass" id="pass-recover-submit" type="submit" ' + (appState.pass.loading ? 'disabled' : '') + '>' +
      (appState.pass.loading ? ic('loader-circle', 17) : ic('search', 17)) +
      (appState.pass.loading ? 'Recherche…' : 'Retrouver mon Pass') +
    '</button>' +
    '<button type="button" class="recover-pass" id="pass-back-register">Créer un nouveau Pass</button>' +
  '</form>';
}

function renderPassModalBody() {
  var body = document.getElementById('pass-body');
  if (!body) return;
  // Clean up any country dropdown outside-click listener before rebuilding
  if (typeof countryOutsideListener === 'function') document.removeEventListener('pointerdown', countryOutsideListener);
  var p = appState.pass;
  if (p.loading && !p.client) body.innerHTML = passLoadingHTML();
  else if (p.client) body.innerHTML = passViewHTML(p.client);
  else if (p.mode === 'recover') body.innerHTML = passRecoveryHTML();
  else body.innerHTML = passFormHTML();
  refreshIcons();

  if (p.client) {
    var forgetBtn = document.getElementById('pass-forget');
    if (forgetBtn) forgetBtn.addEventListener('click', function () {
      safeStorage.remove('localStorage', PASS_STORAGE_KEY);
      appState.pass.client = null;
      appState.pass.error = '';
      appState.pass.mode = 'register';
      appState.pass.form = { first_name: '', last_name: '', country: 'MA', phone: '', email: '' };
      appState.pass.recovery = { name: '', email: '' };
      if (appState.pass.channel && supabase) {
        try { supabase.removeChannel(appState.pass.channel); } catch (e) {}
        appState.pass.channel = null;
      }
      renderPassModalBody();
    });
  } else if (!(p.loading && !p.client)) {
    var recoveryForm = document.getElementById('pass-recovery-form');
    if (recoveryForm) {
      recoveryForm.addEventListener('submit', recoverPass);
      var recoveryName = document.getElementById('pass-recovery-name');
      var recoveryEmail = document.getElementById('pass-recovery-email');
      recoveryName.addEventListener('input', function () { appState.pass.recovery.name = recoveryName.value; });
      recoveryEmail.addEventListener('input', function () { appState.pass.recovery.email = recoveryEmail.value; });
      document.getElementById('pass-back-register').addEventListener('click', function () {
        appState.pass.mode = 'register';
        appState.pass.error = '';
        renderPassModalBody();
      });
      return;
    }

    var form = document.getElementById('pass-form');
    if (form) {
      form.addEventListener('submit', registerPass);
      ['first', 'last'].forEach(function (kind, i) {
        var el = document.getElementById(i === 0 ? 'pass-first-name' : 'pass-last-name');
        el.addEventListener('input', function () {
          if (kind === 'first') appState.pass.form.first_name = el.value;
          else appState.pass.form.last_name = el.value;
        });
      });
      var email = document.getElementById('pass-email-input');
      email.addEventListener('input', function () { appState.pass.form.email = email.value; });
      var phone = document.getElementById('pass-phone-input');
      phone.addEventListener('input', function () {
        var parsed = parseInternationalInput(phone.value, appState.pass.form.country);
        appState.pass.form.country = parsed.country;
        appState.pass.form.phone = parsed.national;
        if (phone.value !== parsed.national) phone.value = parsed.national;
        updateCountryTrigger();
      });
      document.getElementById('country-trigger-btn').addEventListener('click', toggleCountryDropdown);
      document.getElementById('pass-recover').addEventListener('click', function () {
        appState.pass.mode = 'recover';
        appState.pass.error = '';
        renderPassModalBody();
      });
    }
  }
}

function setPassError(message) {
  appState.pass.error = message;
  // Patch the visible view in place so validation does not steal input focus.
  var form = document.getElementById('pass-form') || document.getElementById('pass-recovery-form');
  if (form) {
    var err = form.querySelector('.pass-error');
    if (err) err.textContent = message;
    else {
      var div = document.createElement('div');
      div.className = 'pass-error';
      div.textContent = message;
      form.insertBefore(div, document.getElementById('pass-submit') || document.getElementById('pass-recover-submit'));
    }
    return;
  }
  var passView = document.querySelector('.pass-view');
  if (passView) {
    var viewError = passView.querySelector('.pass-error');
    if (viewError) viewError.textContent = message;
    else {
      viewError = document.createElement('div');
      viewError.className = 'pass-error';
      viewError.textContent = message;
      passView.insertBefore(viewError, document.getElementById('pass-forget'));
    }
  }
}

function registerPass(event) {
  event.preventDefault();
  var f = appState.pass.form;
  var firstName = f.first_name.trim();
  var lastName = f.last_name.trim();
  var phone = normalizePhone(f.phone, f.country);
  var national = cleanNationalPhone(f.phone, f.country);
  var email = f.email.trim().toLowerCase();
  if (!firstName || !lastName || national.length < 4 || !/^\S+@\S+\.\S+$/.test(email)) {
    return setPassError('Veuillez compléter correctement tous les champs.');
  }
  if (!supabase) return setPassError('Le service fidélité est momentanément indisponible.');
  appState.pass.loading = true;
  appState.pass.error = '';
  var submitBtn = document.getElementById('pass-submit');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = ic('loader-circle', 17) + 'Chargement…'; refreshIcons(); }

  (async function () {
    try {
      var lookup = await findClientByPhone(phone, f.country);
      if (lookup.error) throw lookup.error;
      var profile = lookup.data;
      if (!profile) {
        var res = await insertClientProfile(firstName, lastName, phone, email);
        if (res.error) throw res.error;
        profile = res.data;
      }
      safeStorage.set('localStorage', PASS_STORAGE_KEY, profile.id);
      appState.pass.client = profile;
    } catch (err) {
      console.error('Juvia Pass registration:', err);
      appState.pass.error = (err && err.message) || 'Inscription impossible. Réessayez dans un instant.';
    } finally {
      appState.pass.loading = false;
      renderPassModalBody();
      subscribePassRealtime();
    }
  })();
}

function findClientByNameOrEmail(name, email) {
  var normalizedName = String(name || '').trim().replace(/\s+/g, ' ');
  var normalizedEmail = String(email || '').trim().toLowerCase();

  function resultFrom(response) {
    return { data: (response.data && response.data[0]) || null, error: response.error };
  }
  function lookupByEmail() {
    return supabase.from('clients').select('*').ilike('email', normalizedEmail).limit(1).then(resultFrom);
  }
  function lookupByNameParts() {
    var parts = normalizedName.split(' ').filter(Boolean);
    if (!parts.length) return Promise.resolve({ data: null, error: null });
    var first = parts.shift();
    var last = parts.join(' ');
    if (last) {
      return supabase.from('clients').select('*')
        .ilike('first_name', first).ilike('last_name', last).limit(1).then(function (response) {
          var result = resultFrom(response);
          if (result.data || result.error) return result;
          return supabase.from('clients').select('*')
            .ilike('first_name', last).ilike('last_name', first).limit(1).then(resultFrom);
        });
    }
    return supabase.from('clients').select('*').ilike('first_name', first).limit(1).then(function (response) {
      var result = resultFrom(response);
      if (result.data || result.error) return result;
      return supabase.from('clients').select('*').ilike('last_name', first).limit(1).then(resultFrom);
    });
  }
  function lookupByName() {
    if (!normalizedName) return Promise.resolve({ data: null, error: null });
    // The name column is written for new passes; the first/last fallback also
    // supports existing records created before that column was introduced.
    return supabase.from('clients').select('*').ilike('name', normalizedName).limit(1).then(function (response) {
      var result = resultFrom(response);
      if (result.data) return result;
      return lookupByNameParts();
    });
  }

  if (normalizedEmail) {
    return lookupByEmail().then(function (result) {
      return result.data || !normalizedName ? result : lookupByName();
    });
  }
  return lookupByName();
}

function recoverPass(event) {
  event.preventDefault();
  var recovery = appState.pass.recovery;
  var name = recovery.name.trim();
  var email = recovery.email.trim().toLowerCase();
  if (!name && !email) return setPassError('Saisissez votre nom ou votre adresse e-mail pour retrouver votre carte.');
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return setPassError('Vérifiez votre adresse e-mail.');
  if (!supabase) return setPassError('Le service fidélité est momentanément indisponible.');

  appState.pass.loading = true;
  appState.pass.error = '';
  var recoverBtn = document.getElementById('pass-recover-submit');
  if (recoverBtn) {
    recoverBtn.disabled = true;
    recoverBtn.innerHTML = ic('loader-circle', 17) + ' Recherche…';
    refreshIcons();
  }
  (async function () {
    try {
      var lookup = await findClientByNameOrEmail(name, email);
      if (lookup.error) throw lookup.error;
      if (!lookup.data) {
        appState.pass.error = 'Aucune carte trouvée avec ces informations. Vérifiez votre nom ou e-mail.';
        return;
      }
      safeStorage.set('localStorage', PASS_STORAGE_KEY, lookup.data.id);
      appState.pass.client = lookup.data;
    } catch (err) {
      console.error('Juvia Pass recovery:', err);
      appState.pass.error = 'Impossible de retrouver votre carte. Réessayez.';
    } finally {
      appState.pass.loading = false;
      renderPassModalBody();
      subscribePassRealtime();
    }
  })();
}

/* ============================================================
   STAFF PAGE (/staff-scan or staff-scan.html)
   ============================================================ */
function setStaffStatus(type, text) {
  appState.staff.status = { type: type, text: text };
  var host = document.getElementById('staff-status-slot');
  if (!host) return;
  host.innerHTML = text ?
    '<div class="staff-status ' + type + '">' +
      (type === 'success' ? ic('check-circle-2', 16) : ic('x', 16)) + esc(text) + '</div>' : '';
  refreshIcons();
}

/* ------------------------------------------------------------
   Staff scanner — robust camera pipeline
   ------------------------------------------------------------
   1. Gate on a secure context + WebRTC support BEFORE touching
      the QR engine: getUserMedia only exists on HTTPS (Vercel)
      and on http://localhost / 127.0.0.1 (Live Server).
   2. Pre-flight getUserMedia() so permission errors surface with
      a precise, human message instead of "indisponible".
   3. Hand the session to Html5Qrcode, which injects its <video>
      into our square stage, preserving the native video aspect ratio.
   4. Fallback: if the local decoding asset failed to load, still show
      the raw live feed and point the user at the manual UUID entry.
   ------------------------------------------------------------ */

/* Every scanner render gets a UNIQUE reader id: a stale Html5Qrcode
   instance's async stop()→clear() looks its element up by id, and an
   id reuse would let it wipe the fresh session's <video> node. */
var SCANNER_HOST_PREFIX = 'staff-qr-reader';

function delay(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function staffIsSecureContext() {
  var secure = false;
  try { secure = !!window.isSecureContext; } catch (e) {}
  if (!secure) {
    var host = String(window.location.hostname || '');
    secure = host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '';
  }
  return secure;
}

function staffCameraApiAvailable() {
  return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
}

function describeCameraError(err) {
  var name = String((err && err.name) || err || '').toLowerCase().replace(/[^a-z]/g, '');
  var message = String((err && err.message) || '').toLowerCase();
  var blob = name + '|' + message;
  if (name === 'insecurecontexterror' || blob.indexOf('secure') !== -1 || blob.indexOf('https') !== -1) {
    return {
      title: 'Connexion non sécurisée',
      text: 'La caméra exige un contexte sécurisé (WebRTC) : ouvrez cette page en HTTPS (lien Vercel) ou sur http://localhost avec Live Server, puis réessayez.'
    };
  }
  if (name === 'unsupportedapierror') {
    return {
      title: 'Caméra non prise en charge',
      text: 'Ce navigateur n’expose pas l’API caméra (getUserMedia). Mettez-le à jour ou réessayez avec Chrome, Safari ou Firefox récent.'
    };
  }
  if (name === 'permissiondeniederror' || blob.indexOf('notallowed') !== -1 || blob.indexOf('permission') !== -1) {
    return {
      title: 'Permission caméra refusée',
      text: 'Touchez l’icône cadenas / caméra dans la barre d’adresse, autorisez la caméra pour ce site, puis « Réessayer ». La saisie manuelle reste disponible ci-dessous.'
    };
  }
  if (blob.indexOf('notreadable') !== -1 || name === 'trackstarterror' ||
      blob.indexOf('in use') !== -1 || blob.indexOf('could not start') !== -1 || blob.indexOf('monopolis') !== -1) {
    return {
      title: 'Caméra déjà utilisée',
      text: 'Une autre application ou un autre onglet monopolise la caméra. Fermez-les, puis touchez « Réessayer ».'
    };
  }
  if (blob.indexOf('notfound') !== -1 || blob.indexOf('not found') !== -1 || blob.indexOf('overconstrained') !== -1 || blob.indexOf('no camera') !== -1) {
    return {
      title: 'Aucune caméra détectée',
      text: 'Aucune caméra exploitable n’a été trouvée sur cet appareil. Utilisez la saisie manuelle ci-dessous.'
    };
  }
  return {
    title: 'Erreur caméra',
    text: (err && err.message) || 'Une erreur inattendue est survenue avec la caméra. Réessayez ou utilisez la saisie manuelle ci-dessous.'
  };
}

function stopMediaStreamTracks(stream) {
  if (!stream) return;
  try {
    stream.getTracks().forEach(function (track) { try { track.stop(); } catch (e) {} });
  } catch (e) {}
}

function stopStaffFallbackStream() {
  var st = appState.staff;
  var stream = st.fallbackStream;
  if (!stream) return; // The decoder owns its video; do not abort it before stop().
  stopMediaStreamTracks(stream);
  st.fallbackStream = null;
  var host = st.readerId ? document.getElementById(st.readerId) : null;
  var video = host ? host.querySelector('video') : null;
  if (video && video.srcObject === stream) {
    try { video.srcObject = null; } catch (e) {}
  }
}

function destroyStaffScanner() {
  var st = appState.staff;
  ++st.cameraSession; // invalidate pending permissions, starts and decode callbacks
  st.starting = false;
  var scanner = st.scanner;
  var running = st.scannerRunning;
  st.scanner = null;
  st.scannerRunning = false;
  stopStaffFallbackStream();
  if (scanner && running) {
    st.scannerCleanup = releaseStaffScanner(scanner);
  }
  // A pending start owns its cleanup once start() settles.
  return st.scannerCleanup;
}

function releaseStaffScanner(scanner) {
  return Promise.resolve().then(function () {
    if (scanner.isScanning) return scanner.stop();
  }).catch(function (error) {
    console.warn('Juvia scanner cleanup:', error);
  }).then(function () {
    try { scanner.clear(); } catch (e) {}
  });
}

/* Pre-flight: prove the permission + a real camera BEFORE the QR
   engine starts, so failure reasons are never generic. */
function staffCameraPreflight() {
  if (!staffIsSecureContext()) return Promise.reject({ name: 'InsecureContextError' });
  if (!staffCameraApiAvailable()) return Promise.reject({ name: 'UnsupportedApiError' });
  return navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' } } })
    .catch(function (err) {
      var name = String((err && err.name) || '');
      if (name === 'OverconstrainedError' || name === 'NotFoundError') {
        // Many desktops only expose a generic webcam — retry leniently.
        return navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      }
      throw err;
    });
}

/* Build an ordered list of camera constraints to try. Prefer a
   detected back camera, then generic facingMode fallbacks.
   (html5-qrcode only accepts facingMode: "user"|"environment"
   or deviceId — no "ideal" objects.) */
function pickScannerCameraCandidates() {
  var fallbacks = [
    { facingMode: 'environment' },
    { facingMode: 'user' }
  ];
  try {
    if (!window.Html5Qrcode || typeof window.Html5Qrcode.getCameras !== 'function') return Promise.resolve(fallbacks);
    return window.Html5Qrcode.getCameras().then(function (cameras) {
      if (!cameras || !cameras.length) return fallbacks;
      var seen = {};
      var ordered = cameras.filter(function (cam) { return /back|rear|arri[eè]re|environment|wide|traseira|trasera/i.test(String(cam && (cam.label || cam.id))); })
        .concat(cameras)
        .filter(function (cam) {
          var id = String(cam && cam.id);
          if (!id || seen[id]) return false;
          seen[id] = true;
          return true;
        });
      return ordered.map(function (cam) { return { deviceId: { exact: String(cam.id) } }; }).concat(fallbacks);
    }).catch(function () { return fallbacks; });
  } catch (e) {
    return Promise.resolve(fallbacks);
  }
}

function tryScannerStart(scanner, candidates, index, session, lastErr) {
  if (session !== appState.staff.cameraSession) return Promise.reject({ name: 'AbortError' });
  if (index >= candidates.length) return Promise.reject(lastErr || { name: 'NotFoundError' });
  var config = {
    fps: 10,
    qrbox: function (w, h) {
      // Never exceed the actual video surface (including narrow mobile views).
      var edge = Math.floor(Math.min(300, Math.min(w, h) * 0.7));
      var host = document.getElementById(appState.staff.readerId);
      if (host) host.parentElement.style.setProperty('--scan-box', edge + 'px');
      return { width: edge, height: edge };
    },
    // videoConstraints replaces the first start argument: include camera selection.
    videoConstraints: Object.assign({}, candidates[index], {
      width: { ideal: 1280 }, height: { ideal: 720 }
    }),
    disableFlip: false
  };
  return scanner.start(candidates[index], config, function (decodedText) {
    if (session === appState.staff.cameraSession) onStaffScanSuccess(decodedText);
  }, function () { /* No QR in this frame is normal, not a camera error. */ }).catch(function (err) {
    var name = String((err && err.name) || err || '').toLowerCase().replace(/[^a-z]/g, '');
    if (name.indexOf('notallowed') !== -1 || name.indexOf('notreadable') !== -1 ||
        name.indexOf('security') !== -1 || name.indexOf('abort') !== -1) throw err;
    return tryScannerStart(scanner, candidates, index + 1, session, err);
  });
}

function enableStaffAutofocus(scanner) {
  // Unsupported focus constraints must never prevent decoding on a webcam/iPhone.
  try {
    var capabilities = scanner.getRunningTrackCapabilities();
    if (capabilities.focusMode && capabilities.focusMode.indexOf('continuous') !== -1) {
      scanner.applyVideoConstraints({ advanced: [{ focusMode: 'continuous' }] }).catch(function () {});
    }
  } catch (e) {}
}

function onStaffScanSuccess(decodedText) {
  var st = appState.staff;
  if (st.camState !== 'live' || st.processingRead || st.loading) return;
  decodedText = String(decodedText || '').trim();
  if (!decodedText) return;
  st.processingRead = true; // synchronously latch before another frame can decode
  safeVibrate(50);
  arcadeAudio.tick(940);
  st.camState = 'processing';
  // Render success immediately, but wait for camera shutdown before lookup.
  var stopped = destroyStaffScanner();
  renderScannerSlot();
  var session = st.cameraSession;
  stopped.then(function () {
    if (session === st.cameraSession) findClientByStaff(decodedText, 'scan');
  });
}

function startStaffScanner() {
  var st = appState.staff;
  if (st.starting || st.loading) return;
  arcadeAudio.ensure(); // unlock optional sound from the user's camera-button gesture
  st.processingRead = false;
  st.camState = 'starting';
  st.camError = null;
  renderScannerSlot();
  st.starting = true;
  var session = st.cameraSession;
  var scanner = null;

  st.scannerCleanup.then(function () {
    if (session !== st.cameraSession) throw { name: 'AbortError' };
    return staffCameraPreflight();
  }).then(function (preStream) {
    if (session !== st.cameraSession) {
      stopMediaStreamTracks(preStream);
      throw { name: 'AbortError' };
    }
    if (typeof window.Html5Qrcode !== 'function') {
      st.fallbackStream = preStream;
      return 'fallback';
    }
    stopMediaStreamTracks(preStream);
    return delay(150).then(function () {
      if (session !== st.cameraSession) throw { name: 'AbortError' };
      scanner = new window.Html5Qrcode(st.readerId, {
        formatsToSupport: [window.Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false
      });
      st.scanner = scanner;
      return pickScannerCameraCandidates();
    }).then(function (candidates) {
      // Keep teardown awaitable even if the page closes during start().
      var pending = tryScannerStart(scanner, candidates, 0, session);
      st.scannerCleanup = pending.catch(function () {}).then(function () {
        if (session !== st.cameraSession) return releaseStaffScanner(scanner);
      });
      return pending;
    }).then(function () {
      if (session !== st.cameraSession) throw { name: 'AbortError' };
      st.scannerRunning = true;
      enableStaffAutofocus(scanner);
      return 'live';
    });
  }).then(function (mode) {
    if (session !== st.cameraSession) return;
    st.starting = false;
    st.camState = mode;
    revealScannerLiveUI(mode);
    if (mode === 'fallback') attachStaffFallbackStream();
  }).catch(function (err) {
    if (session !== st.cameraSession) return;
    console.error('Juvia staff camera:', err);
    if (scanner) st.scannerCleanup = releaseStaffScanner(scanner);
    st.camState = 'error';
    st.camError = describeCameraError(err);
    renderScannerSlot();
  });
}

function stopStaffCameraSession() {
  var st = appState.staff;
  destroyStaffScanner();
  st.starting = false;
  st.processingRead = false;
  st.camState = 'off';
  st.camError = null;
  renderScannerSlot();
}

/* Patch the already-rendered shell when the camera goes live, WITHOUT
   rebuilding #staff-qr-reader (the engine holds a reference to it). */
function revealScannerLiveUI(mode) {
  var slot = document.getElementById('staff-scan-slot');
  if (!slot) return;
  var stage = slot.querySelector('.scan-stage');
  if (stage) stage.classList.add('is-live');
  var cover = slot.querySelector('.scan-cover');
  if (cover) cover.remove();
  var overlay = slot.querySelector('.scan-overlay');
  if (overlay) overlay.removeAttribute('hidden');
  var actions = slot.querySelector('.scanner-actions');
  if (actions) {
    actions.innerHTML =
      '<button class="scan-ghost" id="staff-stop-cam" type="button">' + ic('camera-off', 13) + ' Fermer la caméra</button>' +
      (mode === 'fallback'
        ? '<p class="scan-note warn">Lecture QR automatique indisponible — utilisez la saisie manuelle ci-dessous.</p>'
        : '<p class="scan-note">Le flux n’est jamais enregistré · décodage 100% sur l’appareil.</p>');
    refreshIcons();
    document.getElementById('staff-stop-cam').addEventListener('click', stopStaffCameraSession);
  }
}

function attachStaffFallbackStream() {
  var st = appState.staff;
  var host = st.readerId ? document.getElementById(st.readerId) : null;
  if (!host || !st.fallbackStream) return;
  host.innerHTML = '';
  var video = document.createElement('video');
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  host.appendChild(video);
  video.srcObject = st.fallbackStream;
  try {
    var playing = video.play();
    if (playing && typeof playing.catch === 'function') playing.catch(function () {});
  } catch (e) {}
}

function renderStaffPage() {
  appState.staff.authenticated = safeStorage.get('sessionStorage', STAFF_SESSION_KEY) === '1';
  var host = document.createElement('div');
  host.id = 'staff-shell';
  app.innerHTML = '';
  app.appendChild(host);
  renderStaffView();
}

function renderStaffView() {
  var shell = document.getElementById('staff-shell');
  if (!shell) return;
  var st = appState.staff;
  if (!st.authenticated) {
    shell.innerHTML =
      '<main class="staff-page staff-lock">' +
        '<a href="/" class="staff-back">' + ic('arrow-left', 15) + ' Menu Juvia</a>' +
        '<div class="staff-login">' +
          '<a class="logo" href="/">juvia<span>.</span></a>' +
          '<div class="staff-lock-icon">' + ic('lock-keyhole', 30) + '</div>' +
          '<span>Espace sécurisé</span><h1>Accès équipe</h1>' +
          '<p>Entrez le code personnel pour accéder au scanner fidélité.</p>' +
          '<form id="staff-pin-form">' +
            '<input type="password" inputmode="numeric" maxlength="8" id="staff-pin-input" value="' + esc(st.pin) + '" placeholder="••••" autocomplete="off" ' + (st.loading ? 'disabled' : '') + '/>' +
            '<button type="submit" ' + (st.loading ? 'disabled' : '') + '>' +
              (st.loading ? ic('loader-circle', 14) + ' Vérification…' : 'Déverrouiller') + '</button>' +
          '</form>' +
          '<small id="staff-pin-error">' + (st.pinError ? esc(st.pinError) : '') + '</small>' +
        '</div>' +
      '</main>';
    refreshIcons();
    var input = document.getElementById('staff-pin-input');
    if (!st.loading) input.focus();
    input.addEventListener('input', function () {
      st.pin = input.value.replace(/\D/g, '');
      input.value = st.pin;
    });
    document.getElementById('staff-pin-form').addEventListener('submit', unlockStaff);
    return;
  }

  shell.innerHTML =
    '<main class="staff-page">' +
      '<header class="staff-header">' +
        '<a href="/" class="logo">juvia<span>.</span></a>' +
        '<div><span>Juvia Pass</span><b>Scanner équipe</b></div>' +
        '<button id="staff-lock-btn">' + ic('lock-keyhole', 15) + '</button>' +
      '</header>' +
      '<div class="staff-content" id="staff-content"></div>' +
    '</main>';
  refreshIcons();
  document.getElementById('staff-lock-btn').addEventListener('click', function () {
    destroyStaffScanner();
    appState.staff.camState = 'off';
    appState.staff.camError = null;
    safeStorage.remove('sessionStorage', STAFF_SESSION_KEY);
    appState.staff.authenticated = false;
    appState.staff.profile = null;
    renderStaffView();
  });
  if (st.profile) renderStaffProfileView();
  else renderStaffScanView();
}

function renderStaffScanView() {
  var host = document.getElementById('staff-content');
  if (!host) return;
  host.innerHTML =
    '<div class="staff-intro"><span>' + ic('camera', 20) + '</span>' +
      '<div><h1>Scanner un pass</h1><p>Cadrez le QR code du client.</p></div></div>' +
    // Two-column layout on desktop (grid), stacked single column on mobile.
    '<div class="staff-grid">' +
      '<div class="staff-grid-main"><div id="staff-scan-slot"></div></div>' +
      '<aside class="staff-grid-side staff-side-card">' +
        '<div class="staff-side-head">' +
          '<span>Sans caméra ?</span>' +
          '<h2>Saisie manuelle</h2>' +
          '<p>Collez l’identifiant UUID du membre si le scan est impossible.</p>' +
        '</div>' +
        '<div class="manual-divider"><span>ou saisir l’identifiant</span></div>' +
        '<form class="manual-client" id="staff-manual-form">' +
          '<input id="staff-manual-input" value="' + esc(appState.staff.manualId) + '" placeholder="UUID du client"/>' +
          '<button type="submit" id="staff-manual-btn">' + ic('chevron-right', 17) + '</button>' +
        '</form>' +
        '<ul class="staff-tips">' +
          '<li>' + ic('scan-line', 12) + ' Cadrez le QR code dans le carré doré</li>' +
          '<li>' + ic('zap', 12) + ' 1 point gagné par tranche de 10 DH dépensés</li>' +
          '<li>' + ic('shield-check', 12) + ' Aucun enregistrement — décodage 100% local</li>' +
        '</ul>' +
        '<div id="staff-status-slot" role="status" aria-live="polite"></div>' +
      '</aside>' +
    '</div>';
  refreshIcons();
  renderScannerSlot();
  setStaffStatus(appState.staff.status.type, appState.staff.status.text);
  var manualInput = document.getElementById('staff-manual-input');
  manualInput.addEventListener('input', function () { appState.staff.manualId = manualInput.value; });
  document.getElementById('staff-manual-form').addEventListener('submit', function (e) {
    e.preventDefault();
    findClientByStaff(appState.staff.manualId, 'manual');
  });
  // "Scanner un autre pass" restarts the camera straight away.
  if (appState.staff.autoStartCam) {
    appState.staff.autoStartCam = false;
    startStaffScanner();
  }
}

function renderScannerSlot() {
  var slot = document.getElementById('staff-scan-slot');
  if (!slot) return;
  var st = appState.staff;
  // A full rebuild always tears down any camera session first, so the
  // html5-qrcode <video> node is never orphaned above the new markup.
  destroyStaffScanner();
  st.readerId = SCANNER_HOST_PREFIX + '-' + (++st.readerSeq);
  var state = st.camState;
  var cover = '';

  if (state === 'off') {
    cover =
      '<div class="scan-cover">' +
        '<span class="scan-idle-icon">' + ic('qr-code', 30) + '</span>' +
        '<h3>Scanner prêt</h3>' +
        '<p>Autorisez l’accès à la caméra pour lire le QR code du Juvia Pass client.</p>' +
        '<button class="scan-primary" id="staff-start-cam" type="button">' + ic('camera', 15) + ' Activer la caméra</button>' +
        (staffIsSecureContext() ? '' :
          '<small class="scan-cover-warn">' + ic('triangle-alert', 11) + ' Hors HTTPS / localhost, le navigateur bloquera la caméra.</small>') +
      '</div>';
  } else if (state === 'starting') {
    cover =
      '<div class="scan-cover">' +
        '<span class="scan-loader"></span>' +
        '<h3>Activation de la caméra…</h3>' +
        '<p>Validez la demande d’autorisation affichée par votre navigateur.</p>' +
      '</div>';
  } else if (state === 'processing') {
    cover =
      '<div class="scan-cover scan-success" role="status" aria-live="polite">' +
        '<span class="scan-success-icon">' + ic('check-circle-2', 40) + '</span>' +
        '<h3>QR code détecté !</h3>' +
        '<p>Vérification du membre auprès du Juvia Pass.</p>' +
      '</div>';
  } else if (state === 'error') {
    var camError = st.camError || { title: 'Erreur caméra', text: 'Réessayez ou utilisez la saisie manuelle ci-dessous.' };
    cover =
      '<div class="scan-cover">' +
        '<span class="scan-error-icon">' + ic('camera-off', 26) + '</span>' +
        '<h3>' + esc(camError.title) + '</h3>' +
        '<p>' + esc(camError.text) + '</p>' +
        '<button class="scan-primary" id="staff-retry-cam" type="button">' + ic('rotate-ccw', 14) + ' Réessayer</button>' +
      '</div>';
  }

  slot.innerHTML =
    '<div class="scanner-shell">' +
      '<div class="scan-stage">' +
        '<div class="scan-reader" id="' + st.readerId + '"></div>' +
        '<div class="scan-overlay" hidden>' +
          '<i class="scan-corner tl"></i><i class="scan-corner tr"></i>' +
          '<i class="scan-corner bl"></i><i class="scan-corner br"></i>' +
          '<i class="scan-laser"></i>' +
          '<span class="scan-hint">' + ic('scan-line', 12) + ' Alignez le QR code du pass</span>' +
        '</div>' +
        cover +
      '</div>' +
      '<div class="scanner-actions"></div>' +
    '</div>';
  refreshIcons();

  var startBtn = document.getElementById('staff-start-cam');
  if (startBtn) startBtn.addEventListener('click', startStaffScanner);
  var retryBtn = document.getElementById('staff-retry-cam');
  if (retryBtn) retryBtn.addEventListener('click', startStaffScanner);
}

function unlockStaff(event) {
  event.preventDefault();
  var st = appState.staff;
  if (!st.pin.trim() || st.loading) return;
  st.loading = true;
  st.pinError = '';
  renderStaffView();
  (async function () {
    try {
      if (!supabase) throw new Error('Service indisponible');
      var res = await supabase.from('staff_pins').select('*').eq('pin_code', st.pin.trim()).limit(1);
      if (res.error) throw res.error;
      if (res.data && res.data.length) {
        safeStorage.set('sessionStorage', STAFF_SESSION_KEY, '1');
        st.authenticated = true;
        st.pin = '';
      } else {
        st.pinError = 'Code PIN incorrect';
        safeVibrate([40, 40, 40]);
      }
    } catch (error) {
      console.error('Staff PIN verification failed:', error);
      st.pinError = (error && error.message === 'Service indisponible') ?
        'Service de vérification indisponible' : 'Impossible de vérifier le code. Réessayez.';
    } finally {
      st.loading = false;
      renderStaffView();
    }
  })();
}

function findClientByStaff(rawId, source) {
  // QR content is the member UUID (optionally "juvia:<uuid>") — sanitize it.
  var id = String(rawId || '').trim().replace(/\s+/g, '').replace(/^juvia:/i, '');
  var st = appState.staff;
  if (!id) {
    if (source === 'scan') {
      st.processingRead = false;
      st.camState = 'error';
      st.camError = { title: 'Pass invalide', text: 'Ce QR code ne contient pas d’identifiant membre. Réessayez avec un Juvia Pass.' };
      renderScannerSlot();
    }
    return;
  }
  if (st.loading) return;
  if (source === 'manual' && st.camState !== 'off') stopStaffCameraSession();
  st.loading = true;
  setStaffStatus('', '');
  var goBtn = document.getElementById('staff-manual-btn');
  if (goBtn) { goBtn.disabled = true; goBtn.innerHTML = ic('loader-circle', 17); refreshIcons(); }
  (async function () {
    try {
      if (!supabase) throw new Error('Supabase non configuré');
      var res = await supabase.from('clients').select('*').eq('id', id).single();
      if (res.error) throw res.error;
      st.profile = res.data;
      st.camState = 'off';
      st.camError = null;
      st.processingRead = false;
      destroyStaffScanner();
      safeVibrate(60);
      renderStaffProfileView();
    } catch (error) {
      console.error('Staff client lookup:', error);
      st.profile = null;
      if (source === 'scan') {
        // The QR decoded fine, but Supabase matched no member:
        // surface it as a scan-square state with an explicit retry.
        st.processingRead = false;
        st.camState = 'error';
        st.camError = {
          title: 'Pass introuvable',
          text: 'Le QR code a bien été lu, mais aucun Juvia Pass ne correspond à cet identifiant. Vérifiez le pass du client, puis relancez un scan.'
        };
        renderScannerSlot();
      } else {
        setStaffStatus('error', 'Client introuvable. Vérifiez l’identifiant saisi.');
      }
      var btn2 = document.getElementById('staff-manual-btn');
      if (btn2) { btn2.disabled = false; btn2.innerHTML = ic('chevron-right', 17); refreshIcons(); }
    } finally {
      st.loading = false;
    }
  })();
}

function renderStaffProfileView() {
  var host = document.getElementById('staff-content');
  if (!host) return;
  var profile = appState.staff.profile;
  var amount = appState.staff.amount;
  var bill = parseBillAmount(amount);
  var points = Math.floor((bill || 0) / 10);
  host.innerHTML =
    // Two-column layout on desktop: member card left, billing side-card right.
    '<div class="staff-grid">' +
      '<div class="staff-grid-main"><div class="client-found">' +
        '<div class="client-avatar">' + esc(clientName(profile).charAt(0).toUpperCase()) + '</div>' +
        '<span>PASS IDENTIFIÉ</span>' +
        '<h1>' + esc(clientName(profile)) + '</h1>' +
        '<small>N° ' + esc(String(profile.id).slice(0, 8).toUpperCase()) + '</small>' +
        '<div class="staff-balance"><b>' + clientPoints(profile) + '</b><span>points disponibles</span></div>' +
      '</div></div>' +
      '<aside class="staff-grid-side staff-side-card">' +
        '<div class="staff-side-head">' +
          '<span>Transaction fidélité</span>' +
          '<h2>Créditer la visite</h2>' +
          '<p>Saisissez le montant de l’addition pour créditer les points.</p>' +
        '</div>' +
        '<form class="bill-form" id="staff-bill-form">' +
          '<label>Montant de l’addition</label>' +
          '<div>' + ic('receipt-text', 18) +
            '<input id="staff-bill-input" type="number" min="1" step="any" value="' + esc(amount) + '" inputmode="decimal" placeholder="0.00"/><span>DH</span></div>' +
          '<p>Le client gagne <b id="staff-points-preview">' + points + ' point(s)</b> · 10 DH = 1 point</p>' +
          '<button type="submit" id="staff-bill-submit">' + ic('plus', 16) + ' Créditer les points</button>' +
        '</form>' +
        '<button class="scan-another" id="staff-scan-another">' + ic('qr-code', 14) + ' Scanner un autre pass</button>' +
        '<div id="staff-status-slot" role="status" aria-live="polite"></div>' +
      '</aside>' +
    '</div>';
  refreshIcons();
  var input = document.getElementById('staff-bill-input');
  input.addEventListener('input', function () {
    appState.staff.amount = input.value;
    if (appState.staff.status.type === 'error') setStaffStatus('', '');
    var b = parseBillAmount(input.value);
    var prev = document.getElementById('staff-points-preview');
    if (prev) prev.textContent = Math.floor((b || 0) / 10) + ' point(s)';
  });
  document.getElementById('staff-bill-form').addEventListener('submit', addStaffPoints);
  document.getElementById('staff-scan-another').addEventListener('click', function () {
    appState.staff.profile = null;
    appState.staff.amount = '';
    appState.staff.manualId = '';
    appState.staff.camState = 'off';
    appState.staff.camError = null;
    appState.staff.autoStartCam = true;
    setStaffStatus('', '');
    renderStaffView();
  });
  setStaffStatus(appState.staff.status.type, appState.staff.status.text);
  requestAnimationFrame(function () { try { input.focus(); } catch (e) {} });
}

function addStaffPoints(event) {
  event.preventDefault();
  var st = appState.staff;
  if (st.loading) return;
  var bill = parseBillAmount(st.amount);
  if (isNaN(bill) || bill <= 0) {
    setStaffStatus('error', 'Saisissez un montant numérique supérieur à 0.');
    return;
  }
  if (!st.profile) return;
  var earned = Math.floor(bill / 10);
  var newBalance = clientPoints(st.profile) + earned;
  st.loading = true;
  setStaffStatus('', '');
  var submitBtn = document.getElementById('staff-bill-submit');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = ic('loader-circle', 16) + ' Créditer les points'; refreshIcons(); }
  (async function () {
    try {
      var res = await updatePointsBalance(st.profile.id, newBalance);
      if (res.error) throw res.error;
      st.profile = res.data;
      st.amount = '';
      st.status = { type: 'success', text: earned + ' points crédités avec succès !' };
      renderStaffProfileView();
      audioStaffWin();
      safeVibrate([35, 35, 80]);
      party();
      logLoyaltyTransaction(res.data.id, bill, earned)
        .then(function (r) { if (r && r.error) console.error('Non-critical transaction history error:', r.error); })
        .catch(function (historyError) { console.error('Non-critical transaction history error:', historyError); });
    } catch (error) {
      console.error('Staff client balance update failed:', error);
      setStaffStatus('error', 'Impossible de créditer les points. Réessayez.');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = ic('plus', 16) + ' Créditer les points'; refreshIcons(); }
    } finally {
      st.loading = false;
    }
  })();
}

/* ------------------------------------------------------------
   Error fallback (ErrorBoundary equivalent)
   ------------------------------------------------------------ */
function showErrorFallback() {
  try {
    app.innerHTML =
      '<div class="error-fallback">' +
        '<div class="fallback-wordmark">juvia<span>.</span></div>' +
        '<div><span>Une petite pause…</span>' +
          '<h1>Le menu revient<br/>dans un instant.</h1>' +
          '<p>Une fonction de votre navigateur n’a pas répondu.</p>' +
          '<button id="error-reload">Recharger le menu</button>' +
        '</div>' +
      '</div>';
    document.getElementById('error-reload').addEventListener('click', function () {
      window.location.reload();
    });
  } catch (e) { console.error('Fallback render failed:', e); }
}

/* ------------------------------------------------------------
   Boot
   ------------------------------------------------------------ */
// Always release the camera when leaving or hiding the staff page.
window.addEventListener('pagehide', destroyStaffScanner);
window.addEventListener('beforeunload', destroyStaffScanner);
document.addEventListener('visibilitychange', function () {
  try {
    if (document.visibilityState === 'hidden' &&
        (appState.staff.starting || appState.staff.scannerRunning || appState.staff.fallbackStream)) {
      stopStaffCameraSession();
    }
  } catch (e) {}
});

try {
  if (isStaffRoute) renderStaffPage();
  else renderMenuPage();
} catch (error) {
  console.error('Juvia UI error:', error);
  showErrorFallback();
}

})();
