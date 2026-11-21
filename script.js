(() => {
  'use strict';

  // Single place to change the brand and contact details.
  const CONFIG = {
    brand: 'OlaiFG7',
    github: 'https://github.com/OlaiFG7',
    // Provisional pricing (one-time, lifetime license). Change here only.
    prices: { notchy: '7,99 €', docky: '7,99 €', suite: '12 €' },
    maxDevices: 3, // provisional: Macs per license
    trialDays: 21,
    // SHA-256 of each published download (lowercase hex). TODO: fill in with the real hashes; empty = not published yet.
    hashes: { Notchy: '', Docky: '' },
    // TODO: replace with the real VirusTotal report/upload URL once the real files exist.
    virustotal: { notchy: 'https://www.virustotal.com/gui/home/upload', docky: 'https://www.virustotal.com/gui/home/upload' },
  };

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---- Brand / contact / year ----
  document.title = `${CONFIG.brand} · Apps y herramientas`;
  $$('[data-brand]').forEach((el) => { el.textContent = CONFIG.brand; });
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  $$('[data-github]').forEach((el) => { el.href = CONFIG.github; });

  // ---- Pricing values ----
  $$('[data-price]').forEach((el) => { el.textContent = CONFIG.prices[el.dataset.price]; });
  $$('[data-devices]').forEach((el) => { el.textContent = String(CONFIG.maxDevices); });
  $$('[data-trial]').forEach((el) => { el.textContent = String(CONFIG.trialDays); });
  const buyNote = $('#buyNote');
  $$('[data-buy]').forEach((a) => a.addEventListener('click', (e) => {
    if (a.getAttribute('href') === '#') {
      e.preventDefault();
      if (buyNote) buyNote.textContent = `La compra de ${a.dataset.buy} aún no está disponible. Mientras tanto, puedes probarla gratis.`;
    }
  }));

  // ---- Reveal on scroll ----
  const revealTargets = $$('.section-head, .app-card, .suite-diagram, .card');
  if (revealTargets.length && 'IntersectionObserver' in window && !motionQuery.matches) {
    document.documentElement.classList.add('has-reveal');
    revealTargets.forEach((el, i) => {
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--reveal-delay', `${(i % 4) * 60}ms`);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealTargets.forEach((el) => io.observe(el));
  }

  // ---- Embedded demos: fit each iframe to the height its page reports (embed mode posts it) ----
  const frames = $$('iframe.demo-frame');
  window.addEventListener('message', (e) => {
    const h = e.data && e.data.embedHeight;
    if (typeof h !== 'number' || h < 200) return;
    frames.forEach((f) => { if (f.contentWindow === e.source) f.style.height = `${Math.ceil(h) + 2}px`; });
  });

  // ---- Shared helper: copy text with a clipboard fallback ----
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-100px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (_) { /* ignore */ }
      ta.remove();
      return ok;
    }
  };

  // ---- First-run guide ----
  const firstRun = $('#primera-vez');
  if (firstRun) {
    if ('IntersectionObserver' in window && !motionQuery.matches) {
      const fio = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) { firstRun.classList.add('in-view'); fio.disconnect(); }
      }, { threshold: 0.2 });
      fio.observe(firstRun);
    } else {
      firstRun.classList.add('in-view');
    }
    const cmd = $('#frCmd');
    const chips = $$('[data-fr-app]', firstRun);
    const frNote = $('#frNote');
    chips.forEach((chip) => chip.addEventListener('click', () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      cmd.textContent = `xattr -dr com.apple.quarantine /Applications/${chip.dataset.frApp}.app`;
    }));
    $('#frCopy').addEventListener('click', async () => {
      const ok = await copyText(cmd.textContent);
      frNote.textContent = ok ? 'Comando copiado. Pégalo en Terminal y pulsa Intro.' : 'No pude copiarlo: selecciónalo y cópialo a mano.';
    });
  }

  // ---- Download verifier: SHA-256 computed locally, nothing is uploaded ----
  // Incremental SHA-256 (WebCrypto has no streaming API), used for large files.
  const K256 = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  class Sha256 {
    constructor() {
      this.h = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
      this.w = new Uint32Array(64);
      this.buf = new Uint8Array(64);
      this.bufLen = 0;
      this.total = 0;
    }
    block(b, o) {
      const w = this.w;
      for (let i = 0; i < 16; i++) {
        const j = o + i * 4;
        w[i] = ((b[j] << 24) | (b[j + 1] << 16) | (b[j + 2] << 8) | b[j + 3]) >>> 0;
      }
      for (let i = 16; i < 64; i++) {
        const x = w[i - 15], y = w[i - 2];
        const s0 = ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
        const s1 = ((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
      }
      let [a, b2, c, d, e, f, g, h] = this.h;
      for (let i = 0; i < 64; i++) {
        const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
        const ch = (e & f) ^ (~e & g);
        const t1 = (h + S1 + ch + K256[i] + w[i]) >>> 0;
        const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
        const maj = (a & b2) ^ (a & c) ^ (b2 & c);
        const t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b2; b2 = a; a = (t1 + t2) >>> 0;
      }
      const H = this.h;
      H[0] += a; H[1] += b2; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
    }
    update(data) {
      let i = 0;
      this.total += data.length;
      if (this.bufLen) {
        while (i < data.length && this.bufLen < 64) this.buf[this.bufLen++] = data[i++];
        if (this.bufLen < 64) return;
        this.block(this.buf, 0);
        this.bufLen = 0;
      }
      for (; i + 64 <= data.length; i += 64) this.block(data, i);
      while (i < data.length) this.buf[this.bufLen++] = data[i++];
    }
    hex() {
      const bits = this.total * 8;
      const pad = new Uint8Array(((this.bufLen < 56 ? 56 : 120) - this.bufLen) + 8);
      pad[0] = 0x80;
      const dv = new DataView(pad.buffer);
      dv.setUint32(pad.length - 8, Math.floor(bits / 4294967296));
      dv.setUint32(pad.length - 4, bits >>> 0);
      const total = this.total;
      this.update(pad);
      this.total = total;
      return Array.from(this.h, (x) => x.toString(16).padStart(8, '0')).join('');
    }
  }
  const toHex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  const SUBTLE_LIMIT = 128 * 1024 * 1024; // above this, hash in chunks to keep memory low
  const CHUNK = 4 * 1024 * 1024;
  const sha256File = async (file, onProgress) => {
    if (file.size <= SUBTLE_LIMIT && window.crypto && crypto.subtle) {
      onProgress(0.5);
      const hex = toHex(await crypto.subtle.digest('SHA-256', await file.arrayBuffer()));
      onProgress(1);
      return hex;
    }
    const sha = new Sha256();
    for (let off = 0; off < file.size; off += CHUNK) {
      sha.update(new Uint8Array(await file.slice(off, off + CHUNK).arrayBuffer()));
      onProgress(Math.min(1, (off + CHUNK) / file.size));
    }
    return sha.hex();
  };

  const vfDrop = $('#vfDrop');
  if (vfDrop) {
    const vfFile = $('#vfFile'), vfBar = $('#vfBar'), vfFill = $('#vfBarFill');
    const vfStatus = $('#vfStatus'), vfHash = $('#vfHash'), vfCopy = $('#vfCopy');
    let currentHash = '';
    const setStatus = (msg) => { vfStatus.textContent = msg; };

    const verify = async (file) => {
      if (!file) return;
      currentHash = '';
      vfCopy.disabled = true;
      vfHash.textContent = '—';
      vfBar.hidden = false;
      vfFill.style.width = '0%';
      setStatus(`Calculando la huella de ${file.name}…`);
      try {
        const hex = await sha256File(file, (p) => { vfFill.style.width = `${Math.round(p * 100)}%`; });
        currentHash = hex;
        vfHash.textContent = hex;
        vfCopy.disabled = false;
        const published = Object.entries(CONFIG.hashes).filter(([, h]) => h);
        const match = published.find(([, h]) => h.trim().toLowerCase() === hex);
        if (match) setStatus(`✅ Coincide con la huella publicada de ${match[0]}. Es el archivo original.`);
        else if (published.length) setStatus('⚠️ No coincide con ninguna huella publicada. Vuelve a descargarlo desde esta web antes de abrirlo.');
        else setStatus('ℹ️ Aún no hay huella publicada para comparar. Aquí tienes la tuya.');
      } catch (_) {
        setStatus('No pude leer el archivo. Prueba con otro.');
      } finally {
        vfBar.hidden = true;
      }
    };

    vfFile.addEventListener('change', () => verify(vfFile.files[0]));
    ['dragenter', 'dragover'].forEach((ev) => vfDrop.addEventListener(ev, (e) => { e.preventDefault(); vfDrop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach((ev) => vfDrop.addEventListener(ev, (e) => { e.preventDefault(); vfDrop.classList.remove('is-over'); }));
    vfDrop.addEventListener('drop', (e) => verify(e.dataTransfer && e.dataTransfer.files[0]));
    vfCopy.addEventListener('click', async () => {
      if (!currentHash) return;
      setStatus((await copyText(currentHash)) ? 'Hash copiado.' : 'No pude copiarlo: selecciónalo a mano.');
    });
    $$('[data-vt]').forEach((a) => { a.href = CONFIG.virustotal[a.dataset.vt] || a.href; });
  }

  // ---- Download placeholders: explain instead of jumping to the top ----
  const note = $('#dlNote');
  $$('[data-download]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (a.getAttribute('href') === '#') {
        e.preventDefault();
        if (note) note.textContent = `La descarga de ${a.dataset.download} aún no está disponible. Escríbeme y te aviso.`;
      }
    });
  });
})();
