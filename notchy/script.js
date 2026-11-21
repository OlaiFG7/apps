// Interactive "Pruébala" demo: a simulated notch/island on a virtual 1600x760 canvas
// (2x the app's points). No dependencies.
(() => {
  const sim = document.getElementById('sim');
  if (!sim) return;
  const $ = id => document.getElementById(id);
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const view = $('sim-view'), world = $('sim-world'), island = $('sim-island'), notch = $('sim-notch');
  const body = $('sim-body'), pager = $('sim-pager'), hint = $('sim-hint');
  island.querySelector('.n-surface').append(body); // clip the content to the animated surface
  const HINT = hint.textContent;
  let hintTimer = 0;
  const say = msg => { hint.textContent = msg; clearTimeout(hintTimer); hintTimer = setTimeout(() => { hint.textContent = HINT; }, 3500); };
  const store = {
    get(k, d) { try { const v = localStorage.getItem('notchy-sim-' + k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('notchy-sim-' + k, v); } catch (e) { /* ignore */ } }
  };

  // ---- Scale the 1600x760 canvas to the container (never below 0.5: narrower screens scroll sideways) ----
  const fit = () => {
    const k = Math.max(0.5, view.clientWidth / 1600 || 1);
    world.style.transform = `scale(${k})`;
    view.style.height = Math.round(760 * k) + 'px';
    const sizer = view.firstElementChild; // world; reserve scroll width
    sizer.style.marginRight = (1600 * k - 1600) + 'px';
    sizer.style.marginBottom = (760 * k - 760) + 'px';
    return k;
  };
  let K = fit();
  if ('ResizeObserver' in window) new ResizeObserver(() => { K = fit(); }).observe(view); else addEventListener('resize', () => { K = fit(); });
  const centerView = () => { view.scrollLeft = (view.scrollWidth - view.clientWidth) / 2; };
  centerView();

  // ---- SVG icon set (equivalents of the SF Symbols the app uses) ----
  const P = {
    shuffle: '<path d="M3 7h3c2.5 0 3.7 1.2 5 3.2l2 3.2c1.3 2 2.500 3.200 5 3.200h3M3 17h3c1.700 0 2.800-.7 3.800-2M14 8.500c1-1 2-1.500 3.500-1.500H21M18 4l3 3-3 3M18 14l3 3-3 3"/>',
    repeat: '<path d="M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4"/>',
    back: '<path class="f" d="M11 5.500v13L2 12zM22 5.500v13L13 12z" fill="currentColor" stroke="none"/>',
    fwd: '<path d="M13 5.500v13l9-6.500zM2 5.500v13L11 12z" fill="currentColor" stroke="none"/>',
    play: '<path d="M7 4v16l13-8z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" stroke="none"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    pencil: '<path d="M4 20l1-4L16 5l3 3L8 19zM14 7l3 3"/>',
    laptop: '<rect x="4" y="5" width="16" height="11" rx="1.500"/><path d="M2 19.500h20"/>',
    bubble: '<path d="M4 5h16v11H10l-5 4v-4H4z" fill="currentColor"/>',
    term: '<rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor"/><path d="M7 10l3 2-3 2M12 15h5" stroke="#000"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.500-5.800M20 4v5h-5"/>',
    filedown: '<path d="M6 3h8l5 5v13H6zM14 3v5h5M12 11v6M9.500 14.500 12 17l2.500-2.500" fill="currentColor" stroke="#000" stroke-width="1.600"/>',
    tray: '<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5" fill="currentColor" stroke="none"/>',
    clip: '<rect x="5" y="4" width="14" height="17" rx="2" fill="currentColor"/><path d="M9 3h6v3H9z" stroke="#000"/>',
    dl: '<circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M12 7v7M9 11.500l3 3 3-3" stroke="#000"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.500" y="9.500" width="5" height="5" fill="currentColor"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
    batt: '<rect x="2" y="7" width="18" height="10" rx="2.500" fill="currentColor"/><path d="M22 10.500v3"/>',
    spk: '<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.500 6.500a8 8 0 0 1 0 11"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-3 14"/>',
    spark: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="currentColor"/>',
    note: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 17h4"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6"/>',
    check: '<circle cx="12" cy="12" r="9" fill="currentColor"/><path d="M8 12l3 3 5-6" stroke="#000"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    bolt: '<path d="M13 2L5 14h6l-1 8 8-12h-6z" fill="currentColor"/>',
    house: '<path d="M3 11l9-8 9 8v10H4V11" fill="currentColor"/>',
    cam: '<rect x="3" y="7" width="18" height="13" rx="3" fill="currentColor"/><circle cx="12" cy="13.500" r="3.500" stroke="#000"/>',
    cloud: '<path d="M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 11a3.500 3.500 0 0 1-.5 7z" fill="currentColor"/>',
    music: '<path d="M9 18V5l11-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z"/>',
    lamp: '<path d="M6 21h8M10 21v-6M7 4l8 3-3 7-8-3zM15 7l4-1"/>'
  };
  const ic = n => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;

  // ---- Theme picker ----
  const themeBtns = [...sim.querySelectorAll('.sim-theme')];
  themeBtns.forEach(b => b.addEventListener('click', () => {
    sim.dataset.simTheme = b.dataset.simTheme;
    themeBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  }));

  // ---- Shared media state (Música tab and Media Player widget) ----
  const tracks = [['Cinderella', 'Future, Metro Boomin y Travis Scott · WE DON\'T…', 'Future, Metro Boomin y Travis Scott', 170], ['Amanecer en el puerto', 'Marea Baja', 'Marea Baja', 200], ['Luz de neón', 'Paso Lento', 'Paso Lento', 226]];
  const media = { i: 0, pos: 11, playing: false, timer: 0 };
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const syncMedia = () => {
    const t = tracks[media.i], pct = Math.min(100, media.pos / t[3] * 100);
    sim.classList.toggle('is-playing', media.playing);
    body.querySelectorAll('[data-m="fill"]').forEach(e => { e.style.width = pct + '%'; });
    body.querySelectorAll('[data-m="cur"]').forEach(e => { e.textContent = fmt(media.pos); });
    body.querySelectorAll('[data-m="rem"]').forEach(e => { e.textContent = '-' + fmt(t[3] - media.pos); });
    body.querySelectorAll('[data-m="dur"]').forEach(e => { e.textContent = fmt(t[3]); });
    body.querySelectorAll('[data-m="title"]').forEach(e => { e.textContent = t[0]; });
    body.querySelectorAll('[data-m="artist"]').forEach(e => { e.textContent = t[2]; });
    body.querySelectorAll('[data-m="sub"]').forEach(e => { e.textContent = t[1]; });
    body.querySelectorAll('[data-m="play"]').forEach(e => { e.innerHTML = ic(media.playing ? 'pause' : 'play'); e.setAttribute('aria-label', media.playing ? 'Pausar' : 'Reproducir'); });
    body.querySelectorAll('[data-m="bar"]').forEach(e => e.setAttribute('aria-valuenow', String(Math.round(pct))));
  };
  const stopMedia = () => { media.playing = false; clearInterval(media.timer); syncMedia(); };
  const nextTrack = d => { media.i = (media.i + d + tracks.length) % tracks.length; media.pos = 0; syncMedia(); };
  const togglePlay = () => {
    if (media.playing) { stopMedia(); return; }
    media.playing = true;
    media.timer = setInterval(() => { media.pos += 0.25; if (media.pos >= tracks[media.i][3]) nextTrack(1); else syncMedia(); }, 250);
    syncMedia();
  };
  const art = (px, rb) => `<div class="art" style="width:${px}px;height:${px}px" aria-hidden="true">${rb ? '<span class="rb">' + ic('play') + '</span>' : ''}</div>`;
  const mctl = big => `<div class="ctl"><button type="button" aria-label="Aleatorio" aria-pressed="false" data-tg>${ic('shuffle')}</button><button type="button" data-m="back" aria-label="Anterior">${ic('back')}</button><button type="button" class="big" data-m="play" aria-label="Reproducir">${ic('play')}</button><button type="button" data-m="fwd" aria-label="Siguiente">${ic('fwd')}</button><button type="button" aria-label="Repetir" aria-pressed="false" data-tg>${ic('repeat')}</button></div>`;
  const dotsViz = `<span class="dots-viz" aria-hidden="true">${'<i></i>'.repeat(16)}</span>`;

  // ---- Tab definitions: virtual size (px at 2x points, measured from the real captures) + renderer ----
  const TABS = [
    { id: 'notchy', name: 'Notchy', w: 1387, h: 628 },
    { id: 'musica', name: 'Música', w: 944, h: 428 },
    { id: 'bandeja', name: 'Bandeja', w: 1224, h: 495 },
    { id: 'agentes', name: 'Agentes', w: 1264, h: 556 },
    { id: 'prompter', name: 'Prompter', w: 1104, h: 532 }
  ];
  const panels = {};
  let cur = 0, open = false;

  // ---- Notchy board ----
  const WIDGETS = {
    mediaPlayer: ['Media Player', 'music', 'Reproductor compacto o expandido con espectro'],
    cpuBattery: ['CPU & Battery', 'cpu', 'Tarjetas verticales de CPU y batería'],
    pomodoro: ['Pomodoro Timer', 'timer', 'Focus/Break con dial deslizable'],
    todos: ['To-dos', 'check', 'Lista rápida de tareas persistentes'],
    calendar: ['Calendar', 'cal', 'Próximos eventos con botón Join'],
    shortcuts: ['Shortcuts', 'bolt', 'Ejecuta tus Atajos favoritos'],
    home: ['Apple Home', 'house', 'Controla luces, escenas y accesorios de Casa'],
    mirror: ['Mirror', 'cam', 'Cámara espejo rápida antes de reuniones'],
    notes: ['Notes', 'note', 'Bloc de notas rápido con autoguardado'],
    aiUsage: ['AI Usage', 'spark', 'Sesiones y límites de Claude, Codex y Gemini'],
    clipboard: ['Clipboard', 'clip', 'Últimos elementos del portapapeles'],
    weather: ['Weather', 'cloud', 'Tiempo actual, máximas/mínimas e icono'],
    tray: ['Tray', 'tray', 'Acceso rápido a archivos de la bandeja'],
    volume: ['Volume', 'spk', 'Mezclador de volumen maestro y por app']
  };
  const DEFAULT_ORDER = ['mediaPlayer', 'notes', 'pomodoro', 'cpuBattery', 'volume'];
  let order = DEFAULT_ORDER.slice();
  const pomo = { mode: 'long', mins: { focus: 25, brk: 5, long: 15 }, left: 15 * 60, running: false, timer: 0, snd: true };
  let vol = 25;
  let notesText = store.get('notes', '');

  const cardHTML = id => {
    const w = WIDGETS[id];
    const cls = { mediaPlayer: 'nk-media span2', notes: 'nk-notes', pomodoro: 'nk-pomo', cpuBattery: 'nk-cpu', volume: 'nk-vol' }[id] || 'nk-gen';
    let inner;
    if (id === 'mediaPlayer') inner = `<div class="top">${art(98, true)}<div style="min-width:0"><strong data-m="title"></strong><div class="ar" data-m="artist"></div><div style="margin-top:6px">${dotsViz}</div></div></div><div class="bar" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="100" data-m="bar"><i data-m="fill"></i></div><div class="times"><span data-m="cur"></span><span data-m="rem"></span></div>${mctl()}`;
    else if (id === 'notes') inner = `<h4>${ic('note')}Notes<span class="auto">Auto</span></h4><textarea aria-label="Notas rápidas, se guardan solas" placeholder="" data-notes></textarea>`;
    else if (id === 'pomodoro') inner = `<div class="seg" role="group" aria-label="Modo"><button type="button" data-pm="focus" aria-pressed="false">Focus</button><button type="button" data-pm="brk" aria-pressed="false">Break</button><button type="button" data-pm="long" aria-pressed="true">Long</button><span class="sp"></span><button type="button" class="snd" data-pm="snd" aria-pressed="true" aria-label="Sonido del temporizador">${ic('spk')}</button></div><div class="tm" data-pm-t aria-live="off">15:00<small data-pm-s>15m</small></div><div class="ruler"><input type="range" min="1" max="60" value="15" aria-label="Minutos del temporizador" data-pm-r><i class="mk"></i></div><div class="row"><button type="button" class="go" data-pm="go">${ic('play')}<span>Start</span></button><button type="button" class="circ" data-pm="reset" aria-label="Reiniciar">${ic('refresh')}</button></div>`;
    else if (id === 'cpuBattery') inner = `<div class="col"><div class="lb cpuc">${ic('cpu')}CPU</div><div class="val" data-cpu>17%</div><svg class="sp" viewBox="0 0 100 50" aria-hidden="true"><path data-cpu-l d="M0 8 L100 28" stroke="#2fb8d6" stroke-width="3" fill="none"/></svg><div class="ft">RAM 77%</div></div><div class="col"><div class="lb batc">${ic('batt')}Bat</div><div class="val">80%</div><div class="bt" aria-hidden="true"><i></i></div><div class="ft">Corriente</div></div>`;
    else if (id === 'volume') inner = `<div class="row">${ic('spk')}Volumen<b data-vol-t>${vol}%</b></div><input type="range" min="0" max="100" value="${vol}" aria-label="Volumen" data-vol>`;
    else inner = `<h4>${ic(w[1])}${w[0]}</h4><div class="big-ic">${ic(w[1])}</div><div class="ds">${w[2]}</div>`;
    return `<div class="nk-card ${cls}" data-w="${id}" tabindex="0" role="group" aria-label="${w[0]}. Arrastra o pulsa Alt y flechas para reordenar" ${id === 'cpuBattery' ? 'style="padding:14px"' : ''}>${inner}</div>`;
  };
  const dispPomo = () => {
    const t = panels.notchy && panels.notchy.querySelector('[data-pm-t]');
    if (!t) return;
    const s = pomo.left, m = pomo.mins[pomo.mode];
    t.firstChild.nodeValue = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    t.querySelector('[data-pm-s]').textContent = m + 'm';
    const r = panels.notchy.querySelector('[data-pm-r]');
    if (r) { r.value = m; r.parentNode.style.setProperty('--p', String((m - 1) / 59)); }
    panels.notchy.querySelectorAll('[data-pm="focus"],[data-pm="brk"],[data-pm="long"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pm === pomo.mode)));
    const g = panels.notchy.querySelector('[data-pm="go"]');
    if (g) { g.innerHTML = ic(pomo.running ? 'pause' : 'play') + '<span>' + (pomo.running ? 'Pause' : 'Start') + '</span>'; }
  };
  const stopPomo = () => { pomo.running = false; clearInterval(pomo.timer); dispPomo(); };
  const beep = () => {
    if (!pomo.snd) return;
    try { const a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination); g.gain.value = .05; o.frequency.value = 880; o.start(); o.stop(a.currentTime + .25); } catch (e) { /* ignore */ }
  };
  const resetPomo = () => { stopPomo(); pomo.left = pomo.mins[pomo.mode] * 60; dispPomo(); };
  const renderBoard = focusId => {
    const p = panels.notchy, grid = p.querySelector('.nk');
    grid.innerHTML = order.map(cardHTML).join('');
    const ta = grid.querySelector('[data-notes]'); if (ta) ta.value = notesText;
    dispPomo(); syncMedia();
    const f = focusId && grid.querySelector(`[data-w="${focusId}"]`); if (f) f.focus({ preventScroll: true });
    p.querySelector('.nk-count').textContent = '· ' + order.length;
  };
  const buildNotchy = () => {
    const p = panels.notchy;
    p.innerHTML = `<div class="hd"><span style="display:inline-flex;align-items:center;gap:12px;font-weight:700;font-size:23px">${ic('lamp')}Notchy <span class="dim nk-count" style="font-weight:500"></span></span><span class="sp"></span><button type="button" class="pill" id="sim-add" aria-expanded="false" aria-controls="sim-addp">${ic('plus')}Add widgets</button><button type="button" class="circ" id="sim-reset" aria-label="Restablecer el orden del tablero">${ic('sliders')}</button></div><div class="nk" id="sim-nk"></div><div class="add-panel" id="sim-addp" role="group" aria-label="Widgets disponibles" hidden></div>`;
    const grid = p.querySelector('.nk'), addp = p.querySelector('#sim-addp'), addb = p.querySelector('#sim-add');
    const drawAdd = () => {
      addp.innerHTML = Object.keys(WIDGETS).map(id => `<div class="it">${ic(WIDGETS[id][1])}<div class="t">${WIDGETS[id][0]}<small>${WIDGETS[id][2]}</small></div><button type="button" class="sw" role="switch" aria-checked="${order.includes(id)}" aria-label="Mostrar ${WIDGETS[id][0]}" data-add="${id}"></button></div>`).join('');
    };
    addb.addEventListener('click', () => { const o = addp.hidden; addp.hidden = !o; addb.setAttribute('aria-expanded', String(o)); if (o) drawAdd(); });
    addp.addEventListener('click', e => {
      const b = e.target.closest('[data-add]'); if (!b) return;
      const id = b.dataset.add, i = order.indexOf(id);
      if (i >= 0) order.splice(i, 1); else order.push(id);
      drawAdd(); renderBoard(); const nb = addp.querySelector(`[data-add="${id}"]`); if (nb) nb.focus({ preventScroll: true });
    });
    p.querySelector('#sim-reset').addEventListener('click', () => { order = DEFAULT_ORDER.slice(); renderBoard(); say('Tablero restablecido'); });
    // Delegated card controls
    grid.addEventListener('click', e => {
      const m = e.target.closest('[data-m]'), pm = e.target.closest('[data-pm]'), tg = e.target.closest('[data-tg]');
      if (m) { const a = m.dataset.m; if (a === 'play') togglePlay(); else if (a === 'fwd') nextTrack(1); else if (a === 'back') nextTrack(-1); }
      else if (tg) tg.setAttribute('aria-pressed', String(tg.getAttribute('aria-pressed') !== 'true'));
      else if (pm) {
        const a = pm.dataset.pm;
        if (a === 'go') { if (pomo.running) stopPomo(); else { pomo.running = true; pomo.timer = setInterval(() => { pomo.left--; if (pomo.left <= 0) { pomo.left = 0; stopPomo(); beep(); say('Pomodoro terminado'); } dispPomo(); }, 1000); dispPomo(); } }
        else if (a === 'reset') resetPomo();
        else if (a === 'snd') { pomo.snd = !pomo.snd; pm.setAttribute('aria-pressed', String(pomo.snd)); }
        else { pomo.mode = a; resetPomo(); }
      }
    });
    grid.addEventListener('input', e => {
      if (e.target.matches('[data-pm-r]')) { pomo.mins[pomo.mode] = +e.target.value; if (!pomo.running) pomo.left = pomo.mins[pomo.mode] * 60; dispPomo(); }
      else if (e.target.matches('[data-vol]')) { vol = +e.target.value; grid.querySelector('[data-vol-t]').textContent = vol + '%'; }
      else if (e.target.matches('[data-notes]')) { notesText = e.target.value; store.set('notes', notesText); }
    });
    // Keyboard reorder: Alt + arrows
    grid.addEventListener('keydown', e => {
      const c = e.target.closest('.nk-card');
      if (!c || e.target !== c || !e.altKey || !/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
      e.preventDefault(); e.stopPropagation();
      const i = order.indexOf(c.dataset.w), j = i + (/Left|Up/.test(e.key) ? -1 : 1);
      if (j < 0 || j >= order.length) return;
      order.splice(j, 0, order.splice(i, 1)[0]); renderBoard(c.dataset.w); say('Tarjeta movida');
    });
    // Pointer drag reorder (mouse / pen). Touch keeps swipe for changing space.
    let d = null;
    grid.addEventListener('pointerdown', e => {
      const c = e.target.closest('.nk-card');
      if (!c || e.pointerType === 'touch' || (e.button && e.button !== 0) || e.target.closest('button,input,textarea')) return;
      d = { c, id: e.pointerId, x: e.clientX, y: e.clientY, on: false };
    });
    grid.addEventListener('pointermove', e => {
      if (!d || e.pointerId !== d.id) return;
      if (!d.on) { if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) return; d.on = true; d.c.classList.add('is-drag'); d.c.setPointerCapture(e.pointerId); }
      d.c.style.pointerEvents = 'none';
      const t = document.elementFromPoint(e.clientX, e.clientY);
      d.c.style.pointerEvents = '';
      const over = t && t.closest && t.closest('.nk-card');
      if (over && over !== d.c && over.parentNode === grid) {
        const kids = [...grid.children];
        if (kids.indexOf(d.c) < kids.indexOf(over)) over.after(d.c); else over.before(d.c);
      }
    });
    const endCard = () => {
      if (!d) return;
      if (d.on) { order = [...grid.children].map(x => x.dataset.w); d.c.classList.remove('is-drag'); say('Orden del tablero actualizado'); }
      d = null;
    };
    grid.addEventListener('pointerup', endCard); grid.addEventListener('pointercancel', endCard);
    // Live CPU figure
    setInterval(() => {
      if (!open || cur !== 0 || document.hidden) return;
      const v = 12 + Math.round(Math.random() * 22), e = panels.notchy.querySelector('[data-cpu]');
      if (e) { e.textContent = v + '%'; const l = panels.notchy.querySelector('[data-cpu-l]'); if (l) l.setAttribute('d', `M0 ${8 + (v % 9)} L100 ${22 + (v % 13)}`); }
    }, 2000);
    renderBoard();
  };

  // ---- Música ----
  const buildMusic = () => {
    panels.musica.innerHTML = `<div class="hd"><span class="pill src"><b></b>YouTube Music</span><span class="sp"></span>${dotsViz}<button type="button" class="circ" aria-label="Letras" aria-pressed="false" data-tg style="color:var(--cy)">${ic('bubble')}</button><button type="button" class="pill" style="background:transparent;padding:0 8px" aria-label="Salida de audio: este Mac">${ic('laptop')}${ic('chev')}</button></div>
<div class="mu">${art(258, true)}<div class="mid"><h3 data-m="title"></h3><div class="ar" data-m="sub"></div><div class="ly">YouTube Music · Letras no disponibles</div><div class="bar" role="progressbar" aria-label="Progreso de la canción" aria-valuemin="0" aria-valuemax="100" data-m="bar"><i data-m="fill"></i></div><div class="times"><span data-m="cur"></span><span data-m="dur"></span></div>${mctl()}</div></div>`;
    panels.musica.addEventListener('click', e => {
      const m = e.target.closest('[data-m]'), tg = e.target.closest('[data-tg]');
      if (m) { const a = m.dataset.m; if (a === 'play') togglePlay(); else if (a === 'fwd') nextTrack(1); else if (a === 'back') nextTrack(-1); }
      else if (tg) tg.setAttribute('aria-pressed', String(tg.getAttribute('aria-pressed') !== 'true'));
    });
  };

  // ---- Bandeja ----
  const files = ['informe.pdf', 'foto-playa.png', 'notas.txt'];
  const tray = [];
  let traySub = 'drop', traySize = 'M';
  const TRAY_H = { S: 420, M: 495, L: 580 };
  const clipItems = ['https://notchy.app', '#7C5CFF', 'Reunión a las 16:00'];
  const renderTray = () => {
    const p = panels.bandeja;
    let main;
    if (traySub === 'drop') main = `<div class="tr" id="sim-tray">${tray.length ? `<ul class="tr-list">${tray.map(f => `<li>${ic('filedown')}<span>${f}</span><button type="button" class="circ" style="width:34px;height:34px;font-size:18px" data-out="${f}" aria-label="Sacar ${f} de la Bandeja">${ic('minus')}</button></li>`).join('')}</ul>` : `<span class="big-ic">${ic('filedown')}</span><strong>Arrastra archivos aquí o sobre el notch</strong><p>Comparte por AirDrop, arrastra a otras apps o convierte formatos (WebP, PNG, MP4, MP3…)</p>`}</div>`;
    else if (traySub === 'clip') main = `<div class="tr-alt">${clipItems.map(c => `<div>${c}</div>`).join('')}</div>`;
    else main = `<div class="tr-alt"><div>Pega un enlace de vídeo para descargarlo (requiere yt-dlp y ffmpeg).</div></div>`;
    p.innerHTML = `<div class="hd"><button type="button" class="pill" data-sub="drop" aria-pressed="${traySub === 'drop'}">${ic('tray')}Drop</button><button type="button" class="pill" data-sub="clip" aria-pressed="${traySub === 'clip'}">${ic('clip')}Clipboard</button><button type="button" class="pill" data-sub="vid" aria-pressed="${traySub === 'vid'}">${ic('dl')}Videos</button><span class="sp"></span><div class="seg3" role="group" aria-label="Tamaño">${['S', 'M', 'L'].map(s => `<button type="button" data-size="${s}" aria-pressed="${traySize === s}">${s}</button>`).join('')}</div></div>${main}`;
  };
  const buildTray = () => {
    renderTray();
    panels.bandeja.addEventListener('click', e => {
      const s = e.target.closest('[data-sub]'), z = e.target.closest('[data-size]'), o = e.target.closest('[data-out]');
      if (s) { traySub = s.dataset.sub; renderTray(); const n = panels.bandeja.querySelector(`[data-sub="${traySub}"]`); if (n) n.focus({ preventScroll: true }); }
      else if (z) { traySize = z.dataset.size; TABS[2].h = TRAY_H[traySize]; renderTray(); layout(); const n = panels.bandeja.querySelector(`[data-size="${traySize}"]`); if (n) n.focus({ preventScroll: true }); }
      else if (o) { tray.splice(tray.indexOf(o.dataset.out), 1); renderDesk(); renderTray(); say(o.dataset.out + ' devuelto al escritorio'); }
    });
  };

  // ---- Agentes ----
  const CLIS = { claude: ['Claude', 'cpu', '#ff8a3d'], gemini: ['Gemini', 'spark', '#6ea8ff'], codex: ['Codex', 'code', '#34c759'], term: ['Terminal', 'term', '#fff'] };
  let agSub = 'agents', cli = 'codex';
  const termLog = { claude: '', gemini: '', codex: '', term: '' };
  const renderAgents = () => {
    const p = panels.agentes;
    let main;
    if (agSub === 'agents') main = `<div class="ag"><div><h5>SESIONES EN VIVO</h5><div class="ses"><div style="--c:#ff8a3d"><b>Claude</b> Proyectos-Notchy<br>Tool: Bash</div><div style="--c:#34c759"><b>Codex</b> Codex CLI<br>Listo</div></div><h5 style="margin-top:34px">USO HOY</h5><div class="use"><div>${ic('cpu')}Claude<span>3 proceso(s) activ…</span></div><div style="color:#34c759">${ic('code')}<b style="color:#fff">Codex</b><span>Uso ventana: 36%</span></div><div style="color:#6ea8ff">${ic('spark')}<b style="color:#fff">Gemini</b><span>1 activo(s)</span></div></div></div>
<div><div class="cli" role="group" aria-label="CLI">${Object.keys(CLIS).map(k => `<button type="button" class="pill" data-cli="${k}" aria-pressed="${k === cli}">${ic(CLIS[k][1])}${CLIS[k][0]}</button>`).join('')}<span class="st">Listo</span></div><div class="term" tabindex="0" aria-label="Salida de la terminal" id="sim-term">${termLog[cli] || 'Escribe un prompt o comando para ejecutarlo en la terminal del notch.'}</div><form class="pr-in" id="sim-form"><label for="sim-prompt">olaifg7</label><input id="sim-prompt" type="text" autocomplete="off" placeholder="Prompt o comando (${cli})…"><button type="submit" aria-label="Enviar">${ic('up')}</button></form></div></div>`;
    else main = `<div class="sys"><div>CPU<b>17%</b></div><div>Memoria<b>77%</b></div><div>Red<b>1,2 MB/s</b></div></div>`;
    p.innerHTML = `<div class="hd"><button type="button" class="pill" data-ag="agents" aria-pressed="${agSub === 'agents'}">${ic('term')}Agents</button><button type="button" class="pill" data-ag="sys" aria-pressed="${agSub === 'sys'}">${ic('cpu')}System</button><span class="sp"></span><button type="button" class="circ" aria-label="Actualizar">${ic('refresh')}</button><button type="button" class="pill">${ic('term')}Terminal.app</button></div>${main}`;
  };
  const buildAgents = () => {
    renderAgents();
    panels.agentes.addEventListener('click', e => {
      const a = e.target.closest('[data-ag]'), c = e.target.closest('[data-cli]');
      if (a) { agSub = a.dataset.ag; renderAgents(); const n = panels.agentes.querySelector(`[data-ag="${agSub}"]`); if (n) n.focus({ preventScroll: true }); }
      else if (c) { cli = c.dataset.cli; renderAgents(); const n = panels.agentes.querySelector(`[data-cli="${cli}"]`); if (n) n.focus({ preventScroll: true }); }
    });
    panels.agentes.addEventListener('submit', e => {
      e.preventDefault();
      const i = $('sim-prompt'), v = i.value.trim(); if (!v) return;
      termLog[cli] = (termLog[cli] ? termLog[cli] + '\n' : '') + `$ ${v}\n(demo) ${CLIS[cli][0]}: sin conexión en la maqueta.`;
      renderAgents(); const t = $('sim-term'); t.scrollTop = t.scrollHeight; $('sim-prompt').focus({ preventScroll: true });
    });
  };

  // ---- Prompter ----
  const pt = { run: false, timer: 0, speed: 4, fs: 15, voice: false, edit: false, text: store.get('prompter', 'Buenas tardes a todos.\n\nHoy quiero enseñaros cómo un pequeño espacio junto a la cámara puede ahorrarnos mucho tiempo.\n\nEl guion avanza solo, a tu ritmo, mientras miras a la cámara y no a las notas.\n\nCuando termines, la isla vuelve a su sitio y sigues trabajando.\n\nGracias por vuestra atención.') };
  const esc = s => s.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const stopPrompter = () => { pt.run = false; clearInterval(pt.timer); const b = panels.prompter.querySelector('[data-pt="play"]'); if (b) b.innerHTML = ic('play') + 'Play'; };
  const renderPrompter = () => {
    const p = panels.prompter;
    p.innerHTML = `<div class="hd"><button type="button" class="pill" style="background:transparent;padding:0 8px" aria-label="Elegir guion">${ic('note')}${ic('chev')}</button><button type="button" class="circ" aria-label="Nuevo guion" data-pt="new">${ic('plus')}</button><span class="sp"></span><button type="button" class="pill" data-pt="edit" aria-pressed="${pt.edit}">${ic('pencil')}${pt.edit ? 'Hecho' : 'Editar'}</button></div>
<div class="pt"><div class="band" aria-hidden="true"><span>▶</span><span>◀</span></div><div class="txt" id="sim-txt" tabindex="0" aria-label="Guion" style="--fs:${pt.fs * 2}px">${pt.text.split(/\n\s*\n/).map(x => '<p>' + esc(x).replace(/\n/g, '<br>') + '</p>').join('')}</div><textarea id="sim-ta" aria-label="Editar guion" ${pt.edit ? '' : 'hidden'}>${esc(pt.text)}</textarea></div>
<div class="pt-ft"><button type="button" class="play" data-pt="play">${ic(pt.run ? 'pause' : 'play')}${pt.run ? 'Pause' : 'Play'}</button><button type="button" class="circ" data-pt="reset" aria-label="Volver al inicio">${ic('refresh')}</button><span class="sp"></span><div class="grp"><button type="button" data-pt="slow" aria-label="Más lento">${ic('minus')}</button><output>${(pt.speed / 10).toFixed(1)}x</output><button type="button" data-pt="fast" aria-label="Más rápido">${ic('plus')}</button></div><div class="grp"><button type="button" data-pt="fsm" aria-label="Letra más pequeña" style="font-size:18px">A</button><output>${pt.fs}</output><button type="button" data-pt="fbg" aria-label="Letra más grande" style="font-size:26px">A</button></div><button type="button" class="pill" data-pt="voice" aria-pressed="${pt.voice}" style="height:48px;border-radius:24px">${ic('mic')}Voice</button></div>`;
  };
  const buildPrompter = () => {
    renderPrompter();
    panels.prompter.addEventListener('click', e => {
      const b = e.target.closest('[data-pt]'); if (!b) return;
      const a = b.dataset.pt, txt = $('sim-txt');
      if (a === 'play') {
        if (pt.run) { stopPrompter(); return; }
        pt.run = true; b.innerHTML = ic('pause') + 'Pause';
        pt.timer = setInterval(() => { txt.scrollTop += pt.speed / 4; if (txt.scrollTop + txt.clientHeight >= txt.scrollHeight - 1) stopPrompter(); }, 40);
      } else if (a === 'reset') { txt.scrollTop = 0; }
      else if (a === 'slow' || a === 'fast') { pt.speed = Math.min(30, Math.max(1, pt.speed + (a === 'fast' ? 1 : -1))); b.parentNode.querySelector('output').textContent = (pt.speed / 10).toFixed(1) + 'x'; }
      else if (a === 'fsm' || a === 'fbg') { pt.fs = Math.min(30, Math.max(10, pt.fs + (a === 'fbg' ? 1 : -1))); b.parentNode.querySelector('output').textContent = pt.fs; txt.style.setProperty('--fs', pt.fs * 2 + 'px'); }
      else if (a === 'voice') { pt.voice = !pt.voice; b.setAttribute('aria-pressed', String(pt.voice)); say(pt.voice ? 'Modo Voz (demo): en la app sigue tu lectura' : 'Modo Voz desactivado'); }
      else if (a === 'edit') { if (pt.edit) { pt.text = $('sim-ta').value; store.set('prompter', pt.text); } pt.edit = !pt.edit; stopPrompter(); renderPrompter(); const n = panels.prompter.querySelector('[data-pt="edit"]'); if (n) n.focus({ preventScroll: true }); }
      else if (a === 'new') { pt.text = 'Nuevo guion. Pulsa Editar para escribir tu texto.'; pt.edit = false; stopPrompter(); renderPrompter(); }
    });
  };

  // ---- Island open/close, sizing and tabs ----
  TABS.forEach((t, i) => {
    const p = document.createElement('div');
    p.className = 'n-panel'; p.id = 'sim-panel-' + t.id; p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', 'sim-tab-' + t.id); p.hidden = i !== 0;
    body.append(p); panels[t.id] = p;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'n-dot'; b.id = 'sim-tab-' + t.id; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', t.name); b.setAttribute('aria-controls', p.id);
    b.addEventListener('click', () => select(i, false));
    pager.append(b);
  });
  buildNotchy(); buildMusic(); buildTray(); buildAgents(); buildPrompter();

  function layout() {
    const t = TABS[cur];
    island.style.setProperty('--w', open ? t.w + 'px' : '');
    island.style.setProperty('--h', open ? t.h + 'px' : '');
    body.style.width = t.w + 'px'; body.style.height = t.h + 'px';
    body.style.left = '50%'; body.style.right = 'auto'; body.style.transform = 'translateX(-50%)'; body.style.inset = '0 auto auto 50%';
    pager.style.setProperty('--ph', t.h + 'px');
    [...pager.children].forEach((d, i) => { d.setAttribute('aria-selected', String(i === cur)); d.tabIndex = i === cur ? 0 : -1; });
  }
  function select(i, focus) {
    cur = (i + TABS.length) % TABS.length;
    TABS.forEach((t, j) => {
      const p = panels[t.id], on = j === cur;
      if (on && p.hidden) { p.hidden = false; p.classList.remove('is-in'); void p.offsetWidth; p.classList.add('is-in'); }
      else if (!on) p.hidden = true;
    });
    if (cur !== 4) stopPrompter();
    layout();
    if (focus) pager.children[cur].focus({ preventScroll: true });
  }
  function setOpen(on, focusNotch) {
    open = on;
    island.dataset.state = on ? 'open' : 'closed';
    notch.setAttribute('aria-expanded', String(on));
    pager.hidden = !on;
    layout();
    if (on) {
      pager.children[cur].focus({ preventScroll: true });
    } else {
      stopPrompter();
      if (focusNotch) notch.focus({ preventScroll: true });
    }
  }
  notch.addEventListener('click', () => setOpen(true));
  world.addEventListener('click', e => { if (open && (e.target.closest('.sim-wall') || e.target === world)) setOpen(false, true); });
  island.addEventListener('pointermove', e => {
    const r = island.getBoundingClientRect();
    island.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
  });
  notch.addEventListener('focus', () => { if (!open && notch.matches(':focus-visible')) island.classList.add('is-peek'); });
  notch.addEventListener('blur', () => island.classList.remove('is-peek'));

  sim.addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) { e.preventDefault(); setOpen(false, true); return; }
    if (!open || e.altKey || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    const t = e.target;
    if (t.matches('input,textarea,[contenteditable]') || t.closest('.nk-card') && t !== t.closest('.nk-card') && t.matches('input')) return;
    e.preventDefault();
    select(cur + (e.key === 'ArrowRight' ? 1 : -1), true);
  });

  // Swipe gestures: trackpad horizontal scroll + touch swipe change space
  let cool = 0;
  const go = d => { const n = Date.now(); if (n < cool) return; cool = n + 450; select(cur + d, false); };
  island.addEventListener('wheel', e => {
    if (!open || Math.abs(e.deltaX) < Math.abs(e.deltaY) || Math.abs(e.deltaX) < 24) return;
    e.preventDefault(); go(e.deltaX > 0 ? 1 : -1);
  }, { passive: false });
  let sw = null;
  island.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && open && !e.target.closest('input,textarea')) sw = { x: e.clientX, y: e.clientY }; });
  island.addEventListener('pointerup', e => {
    if (!sw) return;
    const dx = e.clientX - sw.x, dy = e.clientY - sw.y; sw = null;
    if (Math.abs(dx) > 60 * K && Math.abs(dy) < 50 * K) go(dx < 0 ? 1 : -1);
  });
  island.addEventListener('pointercancel', () => { sw = null; });

  // ---- Desk files + Tray drag & drop (pointer-based, mouse and touch; click/keyboard fallback) ----
  const desk = $('sim-files');
  function renderDesk() {
    desk.replaceChildren();
    files.filter(f => !tray.includes(f)).forEach(f => {
      const c = document.createElement('button');
      c.type = 'button'; c.className = 'sim-chip'; c.dataset.file = f; c.textContent = '📄 ' + f;
      c.setAttribute('aria-label', `${f}: arrastra al notch o pulsa para guardarlo en la Bandeja`);
      desk.append(c);
    });
  }
  const stash = f => {
    if (tray.includes(f)) return;
    tray.push(f); renderDesk(); traySub = 'drop'; renderTray();
    setOpen(true); select(2, false);
    say(`${f} guardado en la Bandeja`);
  };
  const inRect = (r, x, y) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  const overTarget = (x, y) => inRect(notch.getBoundingClientRect(), x, y) || inRect(island.getBoundingClientRect(), x, y);
  let drag = null, justDragged = false;
  desk.addEventListener('pointerdown', e => {
    const c = e.target.closest('.sim-chip');
    if (!c || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { c, id: e.pointerId, x: e.clientX, y: e.clientY, ghost: null };
    c.setPointerCapture(e.pointerId);
  });
  desk.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.ghost) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
      const g = drag.c.cloneNode(true); g.classList.add('is-drag'); g.removeAttribute('aria-label');
      sim.append(g); drag.ghost = g; drag.c.style.opacity = '.35'; sim.classList.add('is-dragging');
    }
    drag.ghost.style.left = (e.clientX - 40) + 'px'; drag.ghost.style.top = (e.clientY - 18) + 'px';
    sim.classList.toggle('is-over', overTarget(e.clientX, e.clientY));
    island.classList.toggle('is-peek', !open && overTarget(e.clientX, e.clientY));
  });
  const endDrag = (e, cancel) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null;
    sim.classList.remove('is-dragging', 'is-over'); island.classList.remove('is-peek');
    if (d.ghost) {
      justDragged = true; setTimeout(() => { justDragged = false; }, 0);
      d.ghost.remove(); d.c.style.opacity = '';
      if (!cancel && overTarget(e.clientX, e.clientY)) stash(d.c.dataset.file);
      else say('Suéltalo sobre el notch para guardarlo');
    }
  };
  desk.addEventListener('pointerup', e => endDrag(e, false));
  desk.addEventListener('pointercancel', e => endDrag(e, true));
  desk.addEventListener('click', e => { const c = e.target.closest('.sim-chip'); if (c && !justDragged) stash(c.dataset.file); });
  renderDesk(); layout();
})();
