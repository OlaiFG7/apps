/* Simulador de Docky — réplica fiel de la app (workspaces, widgets, temas, Notchy) */
(function () {
  'use strict';
  const root = document.querySelector('#simulador');
  if (!root) return;

  const $ = (s, r = root) => r.querySelector(s);
  const screen = $('#dk-screen');
  const stack = $('#dk-stack');
  const dock = $('#dk-dock');
  const upper = $('#dk-upper');
  const lights = $('#dk-lights');
  const notch = $('#dk-notch');
  const notchHud = $('#dk-notch-hud');
  const statusEl = $('#dk-status');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── Iconos de interfaz (SF Symbols aproximados) ───────── */
  const S = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
  const F = (d) => `<svg viewBox="0 0 24 24" fill="currentColor">${d}</svg>`;
  const ui = {
    x: S('<path d="M6 6l12 12M18 6L6 18"/>'),
    play: F('<path d="M8 5v14l11-7z"/>'),
    pause: F('<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>'),
    prev: F('<path d="M6 5h2v14H6zM20 5v14L9 12z"/>'),
    next: F('<path d="M16 5h2v14h-2zM4 5v14l11-7z"/>'),
    rew: F('<path d="M11 6v12L2 12zM22 6v12l-9-6z"/>'),
    ff: F('<path d="M13 6v12l9-6zM2 6v12l9-6z"/>'),
    wifi: S('<path d="M2 9a15 15 0 0120 0M5 12.5a10 10 0 0114 0M8.5 16a5 5 0 017 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/>'),
    bt: S('<path d="M7 7l10 10-5 4V3l5 4L7 17"/>'),
    moon: F('<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>'),
    cup: S('<path d="M4 9h13v5a5 5 0 01-5 5H9a5 5 0 01-5-5zM17 10h2a2 2 0 010 4h-2M8 3v3M12 3v3"/>'),
    gear: S('<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.2-1.6l2-1.5-2-3.4-2.3 1a7 7 0 00-2.7-1.6L13.4 2h-2.8l-.4 2.9a7 7 0 00-2.7 1.6l-2.3-1-2 3.4 2 1.5a7 7 0 000 3.2l-2 1.5 2 3.4 2.3-1a7 7 0 002.7 1.6l.4 2.9h2.8l.4-2.9a7 7 0 002.7-1.6l2.3 1 2-3.4-2-1.5c.1-.5.2-1 .2-1.6z"/>'),
    cal: S('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    ext: S('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M10 14l5-5M10 9h5v5"/>'),
    drop: F('<path d="M12 2.5s6.5 7 6.5 11.5a6.5 6.5 0 01-13 0C5.5 9.5 12 2.5 12 2.5z"/>'),
    trash: S('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>'),
    chevL: S('<path d="M15 5l-7 7 7 7"/>'),
    chevR: S('<path d="M9 5l7 7-7 7"/>'),
    chevD: S('<path d="M5 9l7 7 7-7"/>'),
    vol: S('<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/>'),
    volLow: S('<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 010 7"/>'),
    mute: S('<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/>'),
    sun: S('<circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
    cloud: F('<path d="M7 19a5 5 0 01-.6-9.96A6 6 0 0118 10.5 4.25 4.25 0 0117.5 19z"/>'),
    sunF: F('<circle cx="12" cy="12" r="5" fill="#ffc83d"/>'),
    partly: '<svg viewBox="0 0 24 24"><circle cx="9" cy="9" r="4.2" fill="#ffc83d"/><path fill="#e6ecf5" d="M8 20a4.5 4.5 0 01-.5-8.97A5.5 5.5 0 0118 13a3.5 3.5 0 01-.5 7z"/></svg>',
    pulse: S('<path d="M2 12h4l3-8 4 16 3-8h6"/>'),
    grid: F('<g><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></g>'),
    note: S('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 10h10M7 14h6"/>'),
    copy: S('<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/>'),
    clip: S('<rect x="6" y="4" width="12" height="17" rx="2.5"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>'),
    folder: F('<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a3 3 0 01-3 3H6a3 3 0 01-3-3z"/>'),
    toggles: S('<rect x="3" y="4" width="18" height="7" rx="3.5"/><rect x="3" y="13" width="18" height="7" rx="3.5"/><circle cx="16.5" cy="7.5" r="1.8" fill="currentColor"/><circle cx="7.5" cy="16.5" r="1.8" fill="currentColor"/>'),
    music: F('<path d="M9 17V6l11-2v11"/><circle cx="6.5" cy="17.5" r="3"/><circle cx="17.5" cy="15.5" r="3"/>'),
    palette: S('<path d="M12 3a9 9 0 100 18c1.5 0 2-1 1.5-2.2-.5-1.3.3-2.3 1.7-2.3H18a3 3 0 003-3A9 9 0 0012 3z"/><circle cx="7.5" cy="11" r="1" fill="currentColor"/><circle cx="11" cy="7" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/>'),
    inbox: S('<path d="M4 13l2-8h12l2 8v6H4zM4 13h5l1 2h4l1-2h5M12 3v6M9.5 6.5L12 9l2.5-2.5"/>'),
    spark: F('<path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/>'),
    grid2: S('<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/>'),
    code: S('<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>'),
    gamepad: S('<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="16" cy="11.5" r="1" fill="currentColor"/><circle cx="18" cy="14" r="1" fill="currentColor"/>')
  };

  /* ───────── Glifos de aplicaciones (icono temático monocromo + color nativo) ───────── */
  const g = (d, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const gf = (d) => `<svg viewBox="0 0 24 24" fill="currentColor">${d}</svg>`;
  const txt = (t, size = 11, extra = '') => `<svg viewBox="0 0 24 24"><text x="12" y="16.3" text-anchor="middle" font-family="-apple-system,Helvetica,Arial" font-weight="800" font-size="${size}" fill="currentColor" ${extra}>${t}</text></svg>`;
  const spokes = (n, r1, r2) => Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return `<path d="M${(12 + Math.cos(a) * r1).toFixed(2)} ${(12 + Math.sin(a) * r1).toFixed(2)}L${(12 + Math.cos(a) * r2).toFixed(2)} ${(12 + Math.sin(a) * r2).toFixed(2)}"/>`;
  }).join('');
  const apps = {
    finder: { n: 'Finder', c: 'linear-gradient(160deg,#4ac3ff,#1d6bff)', i: g('<rect x="3.500" y="3.500" width="17" height="17" rx="4.500"/><path d="M12 3.500v6M8.500 9.500v2M15.500 9.500v2M7.500 15c2.700 2.200 6.300 2.200 9 0M12 9.500c0 3-1 4.500-2 5.500" stroke-width="1.600"/>') },
    safari: { n: 'Safari', c: 'linear-gradient(160deg,#58c6ff,#1274e6)', i: g('<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z" fill="currentColor"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke-width="1.2"/>') },
    chrome: { n: 'Google Chrome', c: 'linear-gradient(160deg,#ea4335,#fbbc05)', i: g('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.6"/><path d="M12 8.4h8M8.9 13.8L4.9 7M15.1 13.8L11 20.7" stroke-width="1.5"/>') },
    whatsapp: { n: 'WhatsApp', c: 'linear-gradient(160deg,#4fdc7a,#17a34a)', i: g('<path d="M4 20l1.2-4A8.5 8.5 0 1112 20.5a8.4 8.4 0 01-4-1z"/><path d="M9 8.5c0 3 3.5 6.5 6.5 6.5l1-1.4-2-1-1 .8c-1-.5-1.8-1.3-2.3-2.3l.8-1-1-2z" fill="currentColor" stroke-width="1"/>') },
    telegram: { n: 'Telegram', c: 'linear-gradient(160deg,#41b8f0,#1c8fd0)', i: g('<path d="M21 4L3 11l6 2.2L18 7l-7 8v5l3-3.5 4.5 3.5z" fill="currentColor" stroke-width="1.2"/>') },
    spark: { n: 'Spark', c: 'linear-gradient(160deg,#4aa8ff,#1b64d6)', i: gf('<path d="M12 2l2 7 7 3-7 3-2 7-2-7-7-3 7-3z"/>') },
    mail: { n: 'Mail', c: 'linear-gradient(160deg,#52b6ff,#1a6bf0)', i: g('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>') },
    ticktick: { n: 'TickTick', c: 'linear-gradient(160deg,#5aa0ff,#2a62d6)', i: g('<circle cx="12" cy="12" r="9"/><path d="M7.5 12.3l3 3 6-6.3" stroke-width="2.2"/>') },
    notes: { n: 'Notas', c: 'linear-gradient(160deg,#ffd84a,#f2a900)', i: g('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>') },
    drive: { n: 'Google Drive', c: 'linear-gradient(160deg,#4ea4ff,#1faa59)', i: g('<path d="M8 3h8l6 10.5-4 6.5H6l-4-6.5zM8 3l6 10.5M16 3L10 13.5M6 20l4-6.5h12"/>', 1.5) },
    steam: { n: 'Steam', c: 'linear-gradient(160deg,#2a475e,#0f1c2b)', i: g('<circle cx="15" cy="9" r="4.2"/><circle cx="15" cy="9" r="1.6" fill="currentColor"/><path d="M3 15l5.5 2.2M10.5 14.3a2.7 2.7 0 11-1.9 3.4"/>', 1.6) },
    balatro: { n: 'Balatro', c: 'linear-gradient(160deg,#d6335c,#7a1e8c)', i: gf('<path d="M12 3c2 4 7 5.5 7 10a4 4 0 01-6 3.4c.2 1.6.8 2.8 1.6 3.6h-5.2c.8-.8 1.4-2 1.6-3.6A4 4 0 015 13c0-4.5 5-6 7-10z"/>') },
    fm: { n: 'Football Manager 27', c: 'linear-gradient(160deg,#233a6a,#0f1c3d)', i: txt('FM', 10) },
    rl: { n: 'Rocket League', c: 'linear-gradient(160deg,#2a8cff,#143a9c)', i: g('<path d="M3 15h18l-1.5-5h-5l-2-3H8L6 10H4z"/><circle cx="7.5" cy="16.5" r="2" fill="currentColor"/><circle cx="16.5" cy="16.5" r="2" fill="currentColor"/>', 1.5) },
    music: { n: 'Música', c: 'linear-gradient(160deg,#ff5e7a,#e01f4a)', i: gf('<path d="M9 17V6.5l11-2V15"/><circle cx="6.5" cy="17.5" r="3"/><circle cx="17.5" cy="15.5" r="3"/>') },
    tv: { n: 'TV', c: 'linear-gradient(160deg,#3c3c44,#0e0e12)', i: g('<rect x="3" y="5" width="18" height="12" rx="2.5"/><path d="M9 21h6M10.5 8.5l4 2.5-4 2.5z" fill="currentColor"/>') },
    iptv: { n: 'Prime IPTV', c: 'linear-gradient(160deg,#5a5f7a,#22243a)', i: g('<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M8 4l4 4 4-4"/><text x="12" y="16.3" text-anchor="middle" font-size="5" font-weight="800" fill="currentColor" stroke="none" font-family="Helvetica">prime</text>', 1.4) },
    t3: { n: 'T3 Code', c: 'linear-gradient(160deg,#2b2b34,#0f0f14)', i: txt('T3', 13, 'letter-spacing="-.5"') },
    vscode: { n: 'Visual Studio Code', c: 'linear-gradient(160deg,#3aa0ff,#0b5fcf)', i: g('<path d="M17 3l4 2v14l-4 2L7 12zM17 3L3 15.5l2.2 2L17 8M17 21L3 8.5 5.2 6.5 17 16"/>', 1.5) },
    jcode: { n: 'jcode', c: 'linear-gradient(160deg,#35c79a,#1b7a63)', i: txt('{ }', 10) },
    terminal: { n: 'Terminal', c: 'linear-gradient(160deg,#3a3a42,#0b0b0e)', i: g('<path d="M5 8l5 4-5 4M12 17h7" stroke-width="2.1"/>') },
    claude: { n: 'Claude', c: 'linear-gradient(160deg,#e8855a,#c4562a)', i: g(spokes(12, 3, 9.5) + spokes(12, 3, 9.5).replace(/M/g, 'M'), 1.7) },
    codex: { n: 'Codex', c: 'linear-gradient(160deg,#4a4a55,#1a1a20)', i: g('<path d="M12 3.5a4 4 0 013.5 2l1.6 2.8M20.2 9.5a4 4 0 010 4l-1.6 2.8M16.8 19a4 4 0 01-3.5 1.5H10M7.2 18.5a4 4 0 01-3.5-2l-.3-.6M3.8 14.5a4 4 0 010-4L5.400 7.700M8 5a4 4 0 013.4-1.5"/><circle cx="12" cy="12" r="2.4"/>', 1.5) },
    gemini: { n: 'Gemini', c: 'linear-gradient(160deg,#6a8cff,#a45cf0)', i: gf('<path d="M12 2c.8 5.3 4.7 9.2 10 10-5.3.8-9.2 4.7-10 10-.8-5.3-4.7-9.2-10-10 5.300-.8 9.200-4.700 10-10z"/>') },
    xcode: { n: 'Xcode', c: 'linear-gradient(160deg,#4fb2ff,#1a5fd1)', i: g('<path d="M14.500 4.500l5 5-2 2-5-5zM12 9L4.500 16.500a1.800 1.800 0 002.500 2.500L14.500 11.500M16 14l4 4"/>', 1.6) },
    godot: { n: 'Godot', c: 'linear-gradient(160deg,#5c9fd8,#2f6aa3)', i: g('<path d="M4 6l3 1.500L12 6l5 1.500L20 6v8c0 4-3.500 6-8 6s-8-2-8-6z"/><circle cx="8.500" cy="13" r="1.600" fill="currentColor"/><circle cx="15.500" cy="13" r="1.600" fill="currentColor"/>', 1.5) },
    postman: { n: 'Postman', c: 'linear-gradient(160deg,#ff8a3d,#e0501a)', i: g('<circle cx="12" cy="12" r="8.500"/><path d="M8 16l5-5m0 0l-.5-3.500 3.500.5z" stroke-width="2"/>') },
    orbstack: { n: 'OrbStack', c: 'linear-gradient(160deg,#9a6bff,#5b3fd1)', i: g('<path d="M12 3l8 4.500v9L12 21l-8-4.500v-9zM12 12l8-4.500M12 12v9M12 12L4 7.500"/>', 1.5) },
    actmon: { n: 'Monitor de Actividad', c: 'linear-gradient(160deg,#4a4a52,#18181c)', i: g('<path d="M2 12h4l2.500-7 4 15 3-8h6.500"/>', 1.6) }
  };
  const folderGlyph = gf('<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a3 3 0 01-3 3H6a3 3 0 01-3-3z"/>');

  /* ───────── Workspaces reales de la app ───────── */
  const running = new Set(['finder', 'safari', 'whatsapp', 'actmon', 't3', 'claude', 'music', 'terminal']);
  const workspaces = [
    {
      id: 'comunes', name: 'Comunes', icon: ui.grid2,
      items: ['app:finder', 'app:safari', 'app:chrome', 'app:whatsapp', 'app:telegram', 'app:spark', 'app:mail', 'app:ticktick', 'app:notes', 'app:drive',
        'sep', 'tray', 'sep', 'w:calendar', 'w:weather', 'w:toggles', 'sep', 'w:trash']
    },
    {
      id: 'ocio', name: 'Ocio & Chill', icon: ui.gamepad,
      items: ['app:steam', 'app:balatro', 'app:fm', 'app:rl', 'app:music', 'app:tv', 'app:iptv', 'app:chrome',
        'sep', 'tray', 'sep', 'w:music', 'w:water', 'w:note', 'sep', 'w:trash']
    },
    {
      id: 'prog', name: 'Programación', icon: ui.code,
      items: ['app:t3', 'app:vscode', 'app:jcode', 'app:terminal', 'app:claude', 'app:codex', 'app:gemini', 'app:xcode', 'app:godot', 'app:postman', 'app:orbstack',
        'sep', 'tray', 'sep', 'w:github', 'w:cpu', 'w:color', 'sep', 'folder:Proyectos']
    }
  ];

  const themes = [
    ['systemDefault', 'macOS Default'], ['liquidGlass', 'Liquid Glass'], ['notchyGlass', 'Notchy Glass'], ['clearGlass', 'Clear Glass'],
    ['obsidianBlack', 'Black'], ['midnightMinimal', 'Midnight Minimal'], ['cyberNeon', 'Cyber Neon'], ['sunsetWarm', 'Sunset Warm'],
    ['pixelRetro', 'Pixel Retro'], ['bento', 'Bento'], ['lofiCozy', 'Lo-fi'], ['christmas', 'Christmas'], ['pixelNight', 'Pixel Night'], ['neonRain', 'Neon Rain']
  ];
  const lightThemes = new Set(['lofiCozy', 'christmas']);

  /* ───────── Estado ───────── */
  const now = new Date();
  const state = {
    ws: 0, theme: 'notchyGlass', full: false, icons: true, pet: true,
    vol: 0.55, bri: 0.7, playing: false, track: 0, app: 'ytm',
    toggles: { wifi: true, bt: true, focus: false, awake: false },
    water: 3, color: '#8A5CF6', note: '',
    cal: { y: now.getFullYear(), m: now.getMonth(), sel: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
    panel: null, launched: new Set(), cpu: [8, 14, 11, 6, 6, 12, 28, 22, 8, 16, 6, 18]
  };
  const tracks = [{ t: 'Cinderella', a: 'Future' }, { t: 'Midnight City', a: 'M83' }, { t: 'Nightcall', a: 'Kavinsky' }];
  const musicApps = [['music', 'Music', 'Apple Music'], ['spotify', 'Spotify', 'Spotify'], ['ytm', 'YT Music', 'YouTube Music'], ['yt', 'YouTube', 'YouTube']];

  /* ───────── Toolbar ───────── */
  const wsChips = $('#dk-ws-chips');
  const themeChips = $('#dk-theme-chips');
  workspaces.forEach((w, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'dk-chip'; b.textContent = `${w.name}`; b.dataset.i = i;
    b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
    b.addEventListener('click', () => switchWorkspace(i));
    wsChips.appendChild(b);
  });
  themes.forEach(([id, name]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'dk-chip'; b.textContent = name; b.dataset.t = id;
    b.setAttribute('aria-pressed', id === state.theme ? 'true' : 'false');
    b.addEventListener('click', () => setTheme(id));
    themeChips.appendChild(b);
  });

  function setTheme(id) {
    state.theme = id;
    screen.dataset.theme = id;
    themeChips.querySelectorAll('.dk-chip').forEach((c) => c.setAttribute('aria-pressed', c.dataset.t === id ? 'true' : 'false'));
    const sys = id === 'systemDefault';
    screen.dataset.icons = (state.icons && !sys) ? 'glass' : 'native';
    lights.classList.toggle('on', id === 'christmas' || id === 'lofiCozy');
    const clr = { christmas: 16, lofiCozy: 15, sunsetWarm: 14, pixelNight: 14, neonRain: 13, cyberNeon: 12, pixelRetro: 12, bento: 9 }[id] || 0;
    stack.style.paddingTop = '0';
    upper.style.bottom = `calc(100% + ${clr}px)`;
    fit();
  }
  $('#dk-icons').addEventListener('click', (e) => {
    state.icons = !state.icons;
    e.currentTarget.setAttribute('aria-pressed', String(state.icons));
    setTheme(state.theme);
  });
  $('#dk-pet').addEventListener('click', (e) => {
    state.pet = !state.pet;
    e.currentTarget.setAttribute('aria-pressed', String(state.pet));
    renderDock(0, true);
  });
  $('#dk-full').addEventListener('click', (e) => {
    state.full = !state.full;
    e.currentTarget.setAttribute('aria-pressed', String(state.full));
    screen.classList.toggle('is-full', state.full);
    closePanel(true);
    clearBanner();
    statusEl.innerHTML = state.full
      ? 'HUD de volumen y brillo: <b>Notchy</b> (pantalla completa, Dock oculto)'
      : 'HUD de volumen y brillo: <b>Docky</b> (Dock visible)';
  });
  root.querySelectorAll('[data-dk-hud]').forEach((b) => b.addEventListener('click', () => {
    const k = b.dataset.dkHud;
    if (k.startsWith('vol')) adjust('vol', k.endsWith('+') ? 0.1 : -0.1);
    else adjust('bri', k.endsWith('+') ? 0.1 : -0.1);
  }));

  /* ───────── Barra de menús ───────── */
  const wsMenu = $('#dk-ws-menu');
  const wsDrop = $('#dk-ws-drop');
  function paintMenu() {
    const w = workspaces[state.ws];
    wsMenu.innerHTML = `${w.icon}<span>${w.name}</span>`;
    wsMenu.querySelector('svg').style.cssText = 'width:13px;height:13px';
    wsDrop.innerHTML = workspaces.map((x, i) => `<button type="button" data-i="${i}">${x.icon}<span>${x.name}${i === state.ws ? ' ✓' : ''}</span><em>⌃⌥${i + 1}</em></button>`).join('');
    wsChips.querySelectorAll('.dk-chip').forEach((c, i) => c.setAttribute('aria-pressed', i === state.ws ? 'true' : 'false'));
  }
  wsMenu.addEventListener('click', (e) => { e.stopPropagation(); const open = wsDrop.hidden; wsDrop.hidden = !open; wsMenu.setAttribute('aria-expanded', String(open)); });
  wsDrop.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { switchWorkspace(+b.dataset.i); wsDrop.hidden = true; } });
  document.addEventListener('click', () => { wsDrop.hidden = true; });
  const clock = $('#dk-clock');
  const tick = () => { const d = new Date(); clock.textContent = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); };
  tick(); setInterval(tick, 20000);

  /* ───────── Construcción del Dock ───────── */
  const fox = (() => {
    const map = ['..o......o..', '.ooo....ooo.', '.ooooooooo..'.padEnd(12, '.'), 'ooowoooowooo', 'ooKooooooKoo', 'oooooKKooooo', '.ooowwwwooo.', '..owwwwwwo..'];
    const pal = { o: '#f97316', w: '#fff3e0', K: '#2a1305' };
    let r = '';
    map.forEach((row, y) => [...row].forEach((c, x) => { if (pal[c]) r += `<rect x="${x}" y="${y + 2}" width="1" height="1" fill="${pal[c]}"/>`; }));
    return `<svg viewBox="0 0 12 12">${r}</svg>`;
  })();

  function appItem(id, opts = {}) {
    const a = apps[id];
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'dk-item' + (running.has(id) || state.launched.has(id) ? ' is-running' : '') + (opts.tray ? ' is-tray' : '');
    el.dataset.app = id;
    el.dataset.title = a.n;
    el.setAttribute('aria-label', a.n);
    el.innerHTML = `<div class="dk-tile"><div class="dk-icon" style="--nat:${a.c}">${a.i}</div><span class="dk-tip">${a.n}</span></div><span class="dk-dot"></span>`;
    el.addEventListener('click', () => launch(el, id));
    return el;
  }
  function folderItem(name) {
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'dk-item is-folder'; el.dataset.folder = name; el.dataset.title = name;
    el.setAttribute('aria-label', 'Carpeta ' + name);
    el.innerHTML = `<div class="dk-tile"><div class="dk-icon" style="--nat:linear-gradient(160deg,#5fb8ff,#2a76e0)"><span class="dk-folder-ico" style="display:grid;place-items:center;width:100%;height:100%;color:#8ec5ff">${folderGlyph}</span></div><span class="dk-tip">${name}</span></div><span class="dk-dot"></span>`;
    el.querySelector('.dk-icon svg').style.cssText = 'width:60%;height:60%;color:#8ec5ff';
    el.addEventListener('click', () => { bounce(el); togglePanel('folder', el); });
    return el;
  }
  const monthDay = () => now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }).split(' ');
  function widgetEl(kind) {
    const el = document.createElement('button');
    el.type = 'button'; el.className = 'dk-wid dk-w-' + kind; el.dataset.w = kind;
    const nowT = new Date();
    const cal = `${nowT.getDate()}`;
    const dow = nowT.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    const trk = tracks[state.track];
    const map = {
      music: () => `<div class="dk-art"><span class="dk-yt">${ui.play}</span></div><div class="dk-meta"><b>${trk.t}</b><small>${trk.a}</small></div><div class="dk-mini"><span data-act="prev">${ui.prev}</span><span data-act="play">${state.playing ? ui.pause : ui.play}</span><span data-act="next">${ui.next}</span></div>`,
      note: () => `${ui.note}<div><b>Quick Note</b><small>${state.note ? state.note.slice(0, 14) : 'Write something'}</small></div>`,
      calendar: () => `<div class="dk-datetile"><em>${dow}</em><strong>${cal}</strong></div><div class="dk-meta"><b>Ingeniería de Servicios - Grupo…</b><small>${nowT.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at 15:00</small></div>`,
      weather: () => `<div class="dk-wtop">${ui.cloud}18°</div><small>Gijón</small>`,
      toggles: () => `<span class="dk-circ ${state.toggles.wifi ? 'on' : ''}" data-t="wifi">${ui.wifi}</span><span class="dk-circ ${state.toggles.bt ? 'on' : ''}" data-t="bt">${ui.bt}</span><span class="dk-circ ${state.toggles.focus ? 'on' : ''}" data-t="focus">${ui.moon}</span><span class="dk-circ ${state.toggles.awake ? 'on' : ''}" data-t="awake">${ui.cup}</span><span class="dk-chev">${ui.chevD}</span>`,
      trash: () => ui.trash,
      water: () => `${ui.drop}<div><b>Agua</b><small>${state.water} / 8 vasos</small></div>`,
      github: () => `<div class="dk-gh-t"><b>3</b> today <b>18</b> week <b>4</b> streak</div><div class="dk-mgrid">${ghCells(48).map((l) => `<i class="${l ? 'l' + l : ''}"></i>`).join('')}</div>`,
      cpu: () => `<div class="dk-cpuh"><span>CPU</span><b>${cpuNow()}%</b></div><div class="dk-spark">${state.cpu.slice(-10).map((v) => `<i style="height:${Math.max(3, v / 2)}px"></i>`).join('')}</div>`,
      color: () => `<span class="dk-swatch" style="background:${state.color}"></span><div><b>Color</b><small>${state.color}</small></div>`
    };
    el.innerHTML = map[kind]();
    el.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (act) { e.stopPropagation(); musicAct(act.dataset.act); return; }
      const t = e.target.closest('[data-t]');
      if (t && kind === 'toggles') { e.stopPropagation(); state.toggles[t.dataset.t] = !state.toggles[t.dataset.t]; refreshWidgets(); return; }
      togglePanel(kind, el);
    });
    return el;
  }
  const cpuNow = () => state.cpu[state.cpu.length - 1];
  function ghCells(n) {
    const out = []; let s = 7;
    for (let i = 0; i < n; i++) { s = (s * 9301 + 49297) % 233280; const r = s / 233280; out.push(r < 0.3 ? 0 : r < 0.55 ? 1 : r < 0.8 ? 2 : 3); }
    return out;
  }

  function buildRow(wsIndex) {
    const w = workspaces[wsIndex];
    const row = document.createElement('div');
    row.className = 'dk-row';
    const pinned = new Set(w.items.filter((i) => i.startsWith('app:')).map((i) => i.slice(4)));
    const trayApps = ['finder', 'safari', 'actmon', 't3', 'claude', 'terminal', 'music', 'whatsapp'].filter((a) => running.has(a) && !pinned.has(a)).slice(0, 3);
    const seq = [];
    w.items.forEach((it, idx) => {
      if (it === 'tray' && !trayApps.length) { if (w.items[idx + 1] === 'sep') w._skipNextSep = true; return; }
      seq.push(it);
    });
    // evita separadores dobles si no hay bandeja
    const clean = [];
    seq.forEach((it) => { if (it === 'sep' && clean[clean.length - 1] === 'sep') return; clean.push(it); });
    clean.forEach((it) => {
      if (it === 'sep') { const s = document.createElement('div'); s.className = 'dk-sep'; row.appendChild(s); return; }
      if (it === 'tray') {
        const t = document.createElement('div'); t.className = 'dk-trayrow'; t.setAttribute('aria-label', 'Apps abiertas');
        trayApps.forEach((a) => t.appendChild(appItem(a, { tray: true }))); row.appendChild(t); return;
      }
      if (it.startsWith('app:')) { row.appendChild(appItem(it.slice(4))); return; }
      if (it.startsWith('folder:')) { row.appendChild(folderItem(it.slice(7))); return; }
      if (it.startsWith('w:')) { row.appendChild(widgetEl(it.slice(2))); }
    });
    if (state.pet) {
      const s = document.createElement('div'); s.className = 'dk-sep'; row.appendChild(s);
      const p = document.createElement('div'); p.className = 'dk-pet'; p.setAttribute('aria-hidden', 'true'); p.innerHTML = fox; row.appendChild(p);
    }
    return row;
  }

  let currentRow = null;
  let inner = null;
  function renderDock(dir = 0, instant = false) {
    const next = buildRow(state.ws);
    if (!inner) { inner = document.createElement('div'); inner.className = 'dk-dock-inner'; dock.appendChild(inner); }
    const old = currentRow;
    // medir el nuevo
    next.style.visibility = 'hidden'; next.style.position = 'absolute';
    inner.appendChild(next);
    const w = Math.ceil(next.getBoundingClientRect().width / currentScale());
    next.style.visibility = ''; next.style.position = '';
    const pad = 24;
    dock.style.width = (w + pad) + 'px';
    inner.style.width = w + 'px';
    inner.style.height = Math.round(next.getBoundingClientRect().height / currentScale()) + 'px';
    if (old && !instant && !reduceMotion && dir) {
      const side = dir;
      old.classList.add('is-leaving');
      old.style.cssText = 'position:absolute;left:50%;top:50%;transition:transform .34s cubic-bezier(.3,1.1,.5,1),opacity .24s;pointer-events:none;transform:translate(-50%,-50%)';
      next.style.cssText = `transform:translateX(${side * 26}px) scale(.97);opacity:0`;
      next.style.position = 'absolute'; next.style.left = '50%'; next.style.top = '50%'; next.style.marginLeft = '0';
      // centrar el nuevo con translate
      next.style.transform = `translate(calc(-50% + ${side * 26}px), -50%) scale(.97)`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        old.style.transform = `translate(calc(-50% + ${-side * 26}px), -50%) scale(.97)`; old.style.opacity = '0';
        next.style.transition = 'transform .34s cubic-bezier(.3,1.1,.5,1),opacity .3s';
        next.style.transform = 'translate(-50%,-50%)'; next.style.opacity = '1';
      }));
      setTimeout(() => { old.remove(); next.style.cssText = ''; }, 380);
    } else if (old) {
      old.remove();
    }
    currentRow = next;
    bindMagnify(next);
    fit();
  }

  function refreshWidgets() {
    if (!currentRow) return;
    currentRow.querySelectorAll('.dk-wid').forEach((el) => {
      const fresh = widgetEl(el.dataset.w);
      if (state.panel && state.panel.kind === el.dataset.w) fresh.classList.add('is-open');
      el.replaceWith(fresh);
    });
    if (state.panel) { const w = currentRow.querySelector(`.dk-wid[data-w="${state.panel.kind}"]`); if (w) state.panel.anchor = w; }
  }

  /* ───────── Magnificación (misma curva que la app: 1, .48, .16) ───────── */
  const MAG = 1.28;
  function bindMagnify(row) {
    const apply = (hov) => {
      const flat = Array.from(row.querySelectorAll('.dk-item, .dk-wid, .dk-sep, .dk-pet'));
      const hi = hov ? flat.indexOf(hov) : -1;
      flat.forEach((el, i) => {
        if (!el.classList.contains('dk-item')) return;
        const d = hi < 0 ? 99 : Math.abs(i - hi);
        const boost = MAG - 1;
        const sc = d === 0 ? 1 + boost : d === 1 ? 1 + boost * 0.48 : d === 2 ? 1 + boost * 0.16 : 1;
        const tile = el.querySelector('.dk-tile');
        tile.style.setProperty('--sc', reduceMotion ? 1 : sc.toFixed(3));
        tile.style.setProperty('--ly', reduceMotion ? '0px' : `${(-(sc - 1) * 44 * 0.22).toFixed(1)}px`);
      });
    };
    row.addEventListener('mouseover', (e) => { const it = e.target.closest('.dk-item, .dk-wid'); apply(it && row.contains(it) ? it : null); });
    row.addEventListener('mouseleave', () => apply(null));
  }
  function bounce(el) { el.classList.add('is-launch'); setTimeout(() => el.classList.remove('is-launch'), 220); }
  function launch(el, id) {
    bounce(el);
    if (!running.has(id)) { state.launched.add(id); setTimeout(() => el.classList.add('is-running'), 260); }
    closePanel();
  }

  /* ───────── Escala para que el Dock quepa (como el ajuste automático de la app) ───────── */
  function currentScale() { return parseFloat(getComputedStyle(screen).getPropertyValue('--k')) || 1; }
  function fit() {
    const need = (parseFloat(dock.style.width) || dock.offsetWidth) + 12 + 24;
    const avail = screen.clientWidth - 12;
    const k = Math.min(1, avail / need);
    screen.style.setProperty('--k', k.toFixed(4));
  }
  window.addEventListener('resize', fit);

  /* ───────── Workspaces ───────── */
  let lastSwitch = 0;
  function switchWorkspace(i, dirHint) {
    if (i === state.ws) return;
    const n = workspaces.length;
    let d = i - state.ws; if (Math.abs(d) * 2 > n) d += d > 0 ? -n : n;
    const dir = dirHint || (d >= 0 ? 1 : -1);
    state.ws = i;
    closePanel(true);
    paintMenu();
    renderDock(dir);
    if (!state.full) showBanner(`<span style="display:flex">${workspaces[i].icon}</span><span>${workspaces[i].name}</span>`, 1400);
    lastSwitch = Date.now();
  }
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && /^Digit[1-9]$/.test(e.code)) {
      const i = +e.code.slice(5) - 1;
      if (workspaces[i]) { e.preventDefault(); switchWorkspace(i); }
    }
  });
  let wheelAcc = 0;
  dock.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
    wheelAcc += e.deltaX;
    if (Math.abs(wheelAcc) > 90) {
      const n = workspaces.length; const dir = wheelAcc > 0 ? 1 : -1; wheelAcc = 0;
      e.preventDefault(); switchWorkspace((state.ws + dir + n) % n, dir);
    }
  }, { passive: false });

  /* ───────── Panel de widgets ───────── */
  function clearUpper() { upper.innerHTML = ''; }
  function closePanel(instant) {
    if (!state.panel) return;
    const p = upper.querySelector('.dk-panel');
    currentRow && currentRow.querySelectorAll('.dk-wid.is-open').forEach((w) => w.classList.remove('is-open'));
    state.panel = null;
    if (p) { if (instant || reduceMotion) p.remove(); else { p.classList.add('is-out'); setTimeout(() => p.remove(), 170); } }
  }
  function togglePanel(kind, anchor) {
    if (state.panel && state.panel.kind === kind) { closePanel(); return; }
    clearBanner();
    upper.querySelectorAll('.dk-panel').forEach((p) => p.remove());
    currentRow && currentRow.querySelectorAll('.dk-wid.is-open').forEach((w) => w.classList.remove('is-open'));
    state.panel = { kind, anchor };
    if (anchor.classList.contains('dk-wid')) anchor.classList.add('is-open');
    renderPanel();
  }
  const defs = {
    music: { title: 'Music Player', icon: ui.music, bc: '#ff2d6a', w: 286 },
    calendar: { title: 'Calendar & Next Event', icon: ui.cal, bc: '#ff3b52', w: 286 },
    weather: { title: 'Weather', icon: ui.cloud, bc: '#5ac8fa', w: 286 },
    toggles: { title: 'Control Toggles', icon: ui.toggles, bc: '#2ad4e8', w: 286 },
    trash: { title: 'Trash', icon: ui.trash, bc: '#9aa3b2', w: 300 },
    water: { title: 'Water Tracker', icon: ui.drop, bc: '#4fb3ff', w: 286 },
    note: { title: 'Quick Note', icon: ui.note, bc: '#3b8bff', w: 300 },
    github: { title: 'GitHub Contributions', icon: ui.grid, bc: '#3fe05a', w: 286 },
    cpu: { title: 'CPU & Memory', icon: ui.pulse, bc: '#3fe05a', w: 286 },
    color: { title: 'Color Picker', icon: ui.palette, bc: '#c58cff', w: 286 },
    folder: { title: 'Proyectos', icon: ui.folder, bc: '#8ec5ff', w: 300 }
  };
  function renderPanel() {
    const { kind, anchor } = state.panel;
    const d = defs[kind];
    upper.querySelectorAll('.dk-panel').forEach((p) => p.remove());
    const p = document.createElement('div');
    p.className = 'dk-panel' + (d.w === 300 ? ' w300' : '');
    p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', d.title);
    p.style.setProperty('--bc', d.bc);
    p.innerHTML = `<div class="dk-ph"><span class="dk-badge">${d.icon}</span><h4>${d.title}</h4><button type="button" class="dk-x" aria-label="Cerrar">${ui.x}</button></div><div class="dk-panel-body">${bodies[kind]()}</div>`;
    upper.appendChild(p);
    const sc = currentScale();
    const sr = stack.getBoundingClientRect();
    const ar = anchor.getBoundingClientRect();
    const pw = d.w + 28;
    let left = (ar.left + ar.width / 2 - sr.left) / sc - pw / 2;
    const maxLeft = (sr.width / sc) - pw;
    left = Math.max(0, Math.min(left, maxLeft));
    p.style.left = left + 'px';
    p.style.width = pw + 'px';
    p.querySelector('.dk-x').addEventListener('click', () => closePanel());
    bindPanel(kind, p);
  }
  function rerender() { if (!state.panel) return; const keep = upper.querySelector('.dk-panel'); if (!keep) return; const kind = state.panel.kind; const body = keep.querySelector('.dk-panel-body'); body.innerHTML = bodies[kind](); bindPanel(kind, keep); }

  const monthName = (y, m) => new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const evs = [
    { t: 'Prácticas', h: '08:00 – 14:00', wd: [1, 3, 5] },
    { t: 'Ingeniería de Servicios - Grupo: Clases Expo…', h: '15:00 – 16:00', wd: [2, 5] },
    { t: 'Estudio · Redes', h: '17:00 – 18:30', wd: [1, 4] }
  ];
  const eventsFor = (d) => evs.filter((e) => e.wd.includes(d.getDay()));
  const lerp = (a, b, t) => a + (b - a) * t;

  const bodies = {
    music() {
      const t = tracks[state.track];
      return `<div class="${state.playing ? 'is-playing' : ''}">
        <div class="dk-m-top"><span class="dk-m-art">${ui.play}</span><div><b>${t.t}</b><small>${t.a}</small></div><span class="dk-eq"><i></i><i></i><i></i><i></i></span></div>
        <div class="dk-m-ctl"><button class="dk-btn round" data-act="prev" aria-label="Anterior">${ui.rew}</button><button class="dk-btn round big sel" data-act="play" aria-label="Reproducir/Pausa">${state.playing ? ui.pause : ui.play}</button><button class="dk-btn round" data-act="next" aria-label="Siguiente">${ui.ff}</button><button class="dk-btn pill accent" data-act="open">${ui.ext}Open ${musicApps.find((m) => m[0] === state.app)[2]}</button></div>
        <div class="dk-vol">${state.vol === 0 ? ui.mute : ui.vol}<input type="range" min="0" max="100" value="${Math.round(state.vol * 100)}" aria-label="Volumen" data-vol></div>
        <div class="dk-seg">${musicApps.map((m) => `<button class="dk-btn ${m[0] === state.app ? 'sel' : ''}" data-app="${m[0]}">${m[1]}</button>`).join('')}</div></div>`;
    },
    calendar() {
      const { y, m, sel } = state.cal;
      const first = new Date(y, m, 1);
      const lead = (first.getDay() + 6) % 7;
      const cells = [];
      for (let i = 0; i < 42; i++) {
        const d = new Date(y, m, 1 - lead + i);
        cells.push(d);
      }
      const today = new Date();
      const isThisMonth = today.getFullYear() === y && today.getMonth() === m;
      const list = eventsFor(sel);
      return `<div class="dk-cal-h"><h5>${monthName(y, m)}</h5><button class="dk-btn" data-cal="today" ${isThisMonth ? 'disabled' : ''}>Today</button><button class="dk-btn sq" data-cal="-1" aria-label="Mes anterior">${ui.chevL}</button><button class="dk-btn sq" data-cal="1" aria-label="Mes siguiente">${ui.chevR}</button></div>
        <div class="dk-cal-g">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x) => `<span class="dow">${x}</span>`).join('')}${cells.map((d) => {
          const cls = [d.getMonth() !== m ? 'dim' : '', sameDay(d, today) ? 'today' : '', sameDay(d, sel) ? 'selected' : '', eventsFor(d).length ? '' : 'no'].join(' ');
          return `<button class="${cls}" data-day="${d.getTime()}">${d.getDate()}<i></i></button>`; }).join('')}</div>
        <div class="dk-card"><div class="dk-ev-h"><span>${sel.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span><span>${list.length} event${list.length === 1 ? '' : 's'}</span></div>
        ${list.length ? list.map((e) => `<div class="dk-ev"><div><b>${e.t}</b><small>${e.h}</small></div></div>`).join('') : '<div class="dk-ev-empty">Sin eventos este día</div>'}</div>
        <div class="dk-foot"><button class="dk-btn accent" data-link>${ui.cal}Open Calendar</button></div>`;
    },
    weather() {
      const hrs = [['Now', '18°', 'partly'], ['16h', '19°', 'sunF'], ['17h', '19°', 'partly'], ['18h', '17°', 'cloud'], ['19h', '15°', 'cloud'], ['20h', '14°', 'moon']];
      return `<div class="dk-wx-now">${ui.partly}<div><b>18°</b><small>Gijón · Parcialmente nublado<br>Máx 20° · Mín 12°</small></div></div>
        <div class="dk-hours">${hrs.map((h) => `<div><small>${h[0]}</small>${h[2] === 'partly' ? ui.partly : `<span style="color:${h[2] === 'sunF' ? '#ffc83d' : '#dbe3ee'}">${ui[h[2]]}</span>`}${h[1]}</div>`).join('')}</div>
        <div class="dk-foot"><span>Open-Meteo</span><button class="dk-btn accent" data-link>${ui.ext}Forecast</button></div>`;
    },
    toggles() {
      const t = state.toggles;
      const it = (k, ic, name, sub) => `<button data-t="${k}" class="${t[k] ? 'on' : ''}"><span class="dk-circ ${t[k] ? 'on' : ''}">${ic}</span><span><b>${name}</b><small>${sub}</small></span></button>`;
      return `<div class="dk-tg">${it('wifi', ui.wifi, 'Wi-Fi', t.wifi ? 'Settings' : 'Off')}${it('bt', ui.bt, 'Bluetooth', t.bt ? 'Settings' : 'Off')}${it('focus', ui.moon, 'Focus', t.focus ? 'On' : 'Off')}${it('awake', ui.cup, 'Keep Awake', t.awake ? 'Awake' : 'Normal sleep')}</div>
        <div class="dk-foot"><button class="dk-btn accent" data-link>${ui.gear}System Settings</button><span>${t.awake ? 'Idle blocked' : 'Idle normal'}</span></div>`;
    },
    trash() { return `<div class="dk-card" style="text-align:center;padding:16px"><span style="display:inline-block;width:34px;height:34px;opacity:.7">${ui.trash}</span><div style="font:600 13px var(--font);margin-top:8px">Trash is empty</div></div><div class="dk-foot"><button class="dk-btn accent" data-link>${ui.ext}Open Trash</button><span>0 items</span></div>`; },
    water() {
      return `<div class="dk-water">${Array.from({ length: 8 }, (_, i) => ui.drop.replace('<svg', `<svg class="${i < state.water ? 'on' : ''}"`)).join('')}</div>
        <div class="dk-row2" style="justify-content:center"><button class="dk-btn round" data-w="-1" aria-label="Quitar vaso">${S('<path d="M6 12h12"/>')}</button><b style="font:700 18px var(--font);min-width:96px;text-align:center">${state.water} / 8 vasos</b><button class="dk-btn round sel" style="--bc:#4fb3ff" data-w="1" aria-label="Añadir vaso">${S('<path d="M12 6v12M6 12h12"/>')}</button></div>
        <div class="dk-foot"><span>${state.water >= 8 ? '¡Objetivo cumplido!' : `Faltan ${8 - state.water}`}</span><button class="dk-btn" data-w="reset">Reset</button></div>`;
    },
    note() {
      return `<textarea class="dk-note" placeholder="Write something…" aria-label="Nota rápida" rows="4">${state.note.replace(/</g, '&lt;')}</textarea>
        <div class="dk-note-foot"><button class="dk-btn" data-n="copy">${ui.copy}Copy</button><button class="dk-btn sel" style="--bc:#3b8bff" data-n="paste">${ui.clip}Paste</button><button class="dk-btn" data-n="append">Append</button><button class="dk-btn" data-n="clear">Clear</button></div>`;
    },
    github() {
      return `<div class="dk-stats"><div><b>3</b><small>Today</small></div><div><b>18</b><small>This Week</small></div><div><b>4d</b><small>Streak</small></div></div>
        <div class="dk-ggrid">${ghCells(48).map((l) => `<i class="${l ? 'l' + l : ''}"></i>`).join('')}</div>
        <div class="dk-foot"><button class="dk-btn accent" style="--bc:#3fe05a" data-link>${ui.ext}@OlaiFG7</button><span>48-day activity</span></div>`;
    },
    cpu() {
      const mem = 6.1;
      return `<div class="dk-cpu-top"><div><small>CPU Usage</small><span class="big">${cpuNow()}%</span></div><div class="mem"><small>Memory (76%)</small>${mem} / 8 GB</div></div>
        <div class="dk-cpu-chart">${state.cpu.map((v) => `<i style="height:${Math.max(4, v * 1.5)}px"></i>`).join('')}</div>
        <div class="dk-prog"><i style="width:76%"></i></div>
        <div class="dk-foot"><button class="dk-btn accent" style="--bc:#3fe05a" data-link>${ui.pulse}Activity Monitor</button><span>Live 3s sampling</span></div>`;
    },
    color() {
      const cols = ['#FF3B30', '#FF9500', '#FFD60A', '#34C759', '#2AD4E8', '#0A84FF', '#8A5CF6', '#FF2D92', '#FFFFFF', '#8E8E93', '#3A3A3C', '#000000'];
      return `<div class="dk-colors">${cols.map((c) => `<button style="background:${c}" class="${c.toLowerCase() === state.color.toLowerCase() ? 'sel' : ''}" data-c="${c}" aria-label="${c}"></button>`).join('')}</div>
        <div class="dk-foot" style="margin-top:0"><span class="dk-hex">${state.color.toUpperCase()}</span><button class="dk-btn accent" style="--bc:#c58cff" data-copyhex>${ui.copy}Copy HEX</button></div>`;
    },
    folder() {
      const f = [['Docky', 'Hoy'], ['Diseño', 'Hoy'], ['Proyectos', 'Ayer'], ['Documentos', '2 días'], ['Notchy', '1 sem']];
      return `<div class="dk-files">${f.map((x) => `<button>${ui.folder}${x[0]}<em>${x[1]}</em></button>`).join('')}</div>`;
    }
  };

  function bindPanel(kind, p) {
    const on = (sel, ev, fn) => p.querySelectorAll(sel).forEach((el) => el.addEventListener(ev, fn));
    if (kind === 'music') {
      on('[data-act]', 'click', (e) => { musicAct(e.currentTarget.dataset.act); });
      on('[data-app]', 'click', (e) => { state.app = e.currentTarget.dataset.app; rerender(); });
      on('[data-vol]', 'input', (e) => { state.vol = e.target.value / 100; flashVol(false); });
    }
    if (kind === 'calendar') {
      on('[data-cal]', 'click', (e) => {
        const v = e.currentTarget.dataset.cal;
        if (v === 'today') { const t = new Date(); state.cal = { y: t.getFullYear(), m: t.getMonth(), sel: new Date(t.getFullYear(), t.getMonth(), t.getDate()) }; }
        else { const d = new Date(state.cal.y, state.cal.m + +v, 1); state.cal.y = d.getFullYear(); state.cal.m = d.getMonth(); }
        rerender();
      });
      on('[data-day]', 'click', (e) => { const d = new Date(+e.currentTarget.dataset.day); state.cal.sel = d; state.cal.y = d.getFullYear(); state.cal.m = d.getMonth(); rerender(); });
    }
    if (kind === 'toggles') on('[data-t]', 'click', (e) => { const k = e.currentTarget.dataset.t; state.toggles[k] = !state.toggles[k]; rerender(); refreshWidgets(); });
    if (kind === 'water') on('[data-w]', 'click', (e) => {
      const v = e.currentTarget.dataset.w;
      state.water = v === 'reset' ? 0 : Math.max(0, Math.min(8, state.water + +v)); rerender(); refreshWidgets();
    });
    if (kind === 'note') {
      const ta = p.querySelector('textarea');
      ta.addEventListener('input', () => { state.note = ta.value; });
      ta.addEventListener('blur', refreshWidgets);
      on('[data-n]', 'click', async (e) => {
        const a = e.currentTarget.dataset.n;
        try {
          if (a === 'copy') await navigator.clipboard.writeText(state.note);
          if (a === 'paste') { state.note = (await navigator.clipboard.readText()) || state.note; }
          if (a === 'append') { state.note += (state.note ? '\n' : '') + 'Docky · ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }); }
        } catch (err) { if (a === 'append') state.note += ''; }
        if (a === 'clear') state.note = '';
        ta.value = state.note; refreshWidgets();
      });
    }
    if (kind === 'color') {
      on('[data-c]', 'click', (e) => { state.color = e.currentTarget.dataset.c; rerender(); refreshWidgets(); });
      on('[data-copyhex]', 'click', (e) => { try { navigator.clipboard.writeText(state.color); } catch (err) { /* sin permisos */ } e.currentTarget.innerHTML = ui.copy + 'Copied'; });
    }
    on('[data-link]', 'click', (e) => e.preventDefault());
  }

  /* ───────── Música ───────── */
  function musicAct(a) {
    if (a === 'play') state.playing = !state.playing;
    if (a === 'next') state.track = (state.track + 1) % tracks.length;
    if (a === 'prev') state.track = (state.track - 1 + tracks.length) % tracks.length;
    if (a === 'open') return;
    refreshWidgets();
    if (state.panel && state.panel.kind === 'music') rerender();
    if ((a === 'play' && state.playing) || a === 'next' || a === 'prev') nowPlayingBanner();
  }
  function nowPlayingBanner() {
    if (state.full || state.panel) return;
    const t = tracks[state.track];
    showBanner(`<span style="display:flex;color:#ff2d6a">${ui.music}</span><span>${t.t}</span><span class="dk-mu">${t.a}</span>`, 2600);
  }

  /* ───────── Banner de Live Activities y HUD (Docky vs Notchy) ───────── */
  let bannerTimer = null; let notchTimer = null;
  function clearBanner() {
    clearTimeout(bannerTimer);
    upper.querySelectorAll('.dk-banner').forEach((b) => b.remove());
  }
  function showBanner(html, ms) {
    if (state.full || state.panel) return;
    clearBanner();
    const b = document.createElement('div'); b.className = 'dk-banner'; b.setAttribute('role', 'status'); b.innerHTML = html;
    upper.appendChild(b);
    bannerTimer = setTimeout(() => { b.classList.add('is-out'); setTimeout(() => b.remove(), 190); }, ms);
    return b;
  }
  const hudIcon = (kind) => kind === 'bri' ? ui.sun : state.vol === 0 ? ui.mute : state.vol < 0.4 ? ui.volLow : ui.vol;
  function hudMarkup(kind) {
    const lvl = kind === 'bri' ? state.bri : state.vol;
    const pct = Math.round(lvl * 100);
    return `<span style="display:flex;${kind === 'vol' && state.vol === 0 ? 'color:#ff453a' : ''}">${hudIcon(kind)}</span><span>${kind === 'bri' ? 'Bright' : 'Vol'}</span><span class="dk-bar ${kind === 'bri' ? 'is-bri' : ''}"><i style="width:${pct}%"></i></span><span class="dk-pct">${state.vol === 0 && kind === 'vol' ? 'Mute' : pct + '%'}</span>`;
  }
  function flashVol(show = true) { if (show) hud('vol'); else if (state.full) hud('vol'); }
  function adjust(kind, delta) {
    state[kind] = Math.max(0, Math.min(1, +(state[kind] + delta).toFixed(2)));
    hud(kind);
    if (state.panel && state.panel.kind === 'music') { const r = upper.querySelector('[data-vol]'); if (r) r.value = Math.round(state.vol * 100); }
  }
  function hud(kind) {
    if (state.full) {
      // Notchy toma el relevo: el Dock está oculto en pantalla completa.
      notchHud.innerHTML = hudMarkup(kind);
      notch.classList.add('is-hud');
      clearTimeout(notchTimer);
      notchTimer = setTimeout(() => notch.classList.remove('is-hud'), 1900);
      return;
    }
    // Dock visible: lo muestra Docky sobre el Dock.
    const existing = upper.querySelector('.dk-banner[data-hud]');
    if (existing && existing.dataset.hud === kind) {
      existing.innerHTML = hudMarkup(kind);
      clearTimeout(bannerTimer);
      bannerTimer = setTimeout(() => { existing.classList.add('is-out'); setTimeout(() => existing.remove(), 190); }, 1900);
      return;
    }
    if (state.panel) closePanel(true);
    const b = showBanner(hudMarkup(kind), 1900);
    if (b) b.dataset.hud = kind;
  }

  /* ───────── CPU en vivo ───────── */
  setInterval(() => {
    const last = state.cpu[state.cpu.length - 1];
    const v = Math.max(4, Math.min(72, Math.round(last + (Math.random() - 0.45) * 16)));
    state.cpu.push(v); if (state.cpu.length > 12) state.cpu.shift();
    if (!currentRow) return;
    const w = currentRow.querySelector('.dk-w-cpu');
    if (w) { const fresh = widgetEl('cpu'); if (w.classList.contains('is-open')) fresh.classList.add('is-open'); w.replaceWith(fresh); }
    if (state.panel && state.panel.kind === 'cpu') rerender();
  }, 3000);

  /* ───────── Cierre al pulsar fuera del panel ───────── */
  screen.addEventListener('click', (e) => {
    if (!state.panel) return;
    if (e.target.closest('.dk-panel') || e.target.closest('.dk-wid') || e.target.closest('.dk-item')) return;
    closePanel();
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });

  /* ───────── Inicio ───────── */
  paintMenu();
  renderDock(0, true);
  setTheme(state.theme);
  // Reajusta tras cargar tipografías
  setTimeout(() => renderDock(0, true), 80);
})();
