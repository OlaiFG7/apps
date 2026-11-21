(() => {
  'use strict';

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const allVideos = Array.from(document.querySelectorAll('video'));

  const safePlay = (video) => {
    if (!video || motionQuery.matches) return;
    const rect = video.getBoundingClientRect();
    if (rect.height === 0 || rect.bottom < 0 || rect.top > window.innerHeight) return;
    const p = video.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {});
    }
  };

  // Reproducción automática respetuosa con viewport y prefers-reduced-motion
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !motionQuery.matches) {
            entry.target.play().catch(() => {});
          } else {
            entry.target.pause();
          }
        });
      },
      { threshold: 0.25 }
    );

    allVideos.forEach((video) => observer.observe(video));

    const handleMotionChange = () => {
      allVideos.forEach((video) => {
        if (motionQuery.matches) {
          video.pause();
        } else {
          safePlay(video);
        }
      });
    };

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleMotionChange);
    }
  } else if (!motionQuery.matches) {
    allVideos.forEach((video) => video.play().catch(() => {}));
  }

  const bindArrowNavigation = (buttons, onSelect) => {
    buttons.forEach((btn, idx) => {
      btn.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 1 : -1;
        const nextBtn = buttons[(idx + delta + buttons.length) % buttons.length];
        if (!nextBtn) return;
        nextBtn.focus();
        onSelect(nextBtn);
      });
    });
  };

  // Selector de vídeos reales de Workspaces (#workspaces-live)
  const wsSection = document.querySelector('#workspaces-live');
  if (wsSection) {
    const wsVideo = wsSection.querySelector('.story-video');
    const wsButtons = Array.from(wsSection.querySelectorAll('.ws-video-btn'));
    const wsCaption = wsSection.querySelector('#ws-video-caption');

    const wsLabels = {
      workspaces: 'Cambio entre workspaces · grabación real con Liquid Glass',
      'workspaces-notchy': 'Cambio entre workspaces · grabación real con Notchy Glass',
      'workspaces-christmas': 'Cambio entre workspaces · grabación real con Christmas',
      'workspaces-pro': 'Cambio entre workspaces · vista completa en escritorio'
    };

    const setWorkspaceVideo = (key) => {
      if (!wsVideo || !wsLabels[key]) return;
      const source = wsVideo.querySelector('source');
      const nextSrc = `assets/video/${key}.mp4`;
      const nextPoster = `assets/video/${key}-poster.png`;

      wsVideo.muted = true;
      wsVideo.poster = nextPoster;
      wsVideo.classList.toggle('is-tall', key === 'workspaces-pro');
      if (source) {
        source.src = nextSrc;
      } else {
        wsVideo.src = nextSrc;
      }
      wsVideo.load();
      safePlay(wsVideo);

      if (wsCaption) {
        wsCaption.textContent = wsLabels[key];
      }

      wsButtons.forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.wsVideo === key));
      });
    };

    wsButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.wsVideo;
        if (key) setWorkspaceVideo(key);
      });
    });

    bindArrowNavigation(wsButtons, (btn) => {
      const key = btn.dataset.wsVideo;
      if (key) setWorkspaceVideo(key);
    });
  }

  // Selector de temas grabados (#temas)
  const themesSection = document.querySelector('#temas');
  if (themesSection) {
    const themeVideo = themesSection.querySelector('.theme-video');
    const themeTabs = Array.from(themesSection.querySelectorAll('.theme-tab'));
    const themePicks = Array.from(themesSection.querySelectorAll('.space-card'));
    const themeCaption = themesSection.querySelector('#theme-caption');

    const themeDescriptions = {
      liquidGlass: {
        name: 'Liquid Glass',
        desc: 'superficie cristalina translúcida (API macOS 26 con respaldo en versiones previas).'
      },
      notchyGlass: {
        name: 'Notchy Glass',
        desc: 'cristal oscuro de alto contraste alineado con Notchy.'
      },
      cyberNeon: {
        name: 'Cyber Neon',
        desc: 'estética neón cian/magenta de alto contraste.'
      },
      sunsetWarm: {
        name: 'Sunset Warm',
        desc: 'tonos cálidos de atardecer en ámbar y coral.'
      },
      pixelRetro: {
        name: 'Pixel Retro',
        desc: 'bordes definidos y estética retro.'
      },
      christmas: {
        name: 'Christmas',
        desc: 'capa animada invernal (modulada por Reducir movimiento).'
      },
      neonRain: {
        name: 'Neon Rain',
        desc: 'lluvia diagonal neón animada sobre superficie oscura.'
      }
    };

    const setTheme = (themeKey) => {
      const info = themeDescriptions[themeKey];
      if (!themeVideo || !info) return;

      const source = themeVideo.querySelector('source');
      const nextSrc = `assets/temas/${themeKey}.mp4`;
      const nextPoster = `assets/temas/${themeKey}.png`;

      themeVideo.muted = true;
      themeVideo.poster = nextPoster;
      if (source) {
        source.src = nextSrc;
      } else {
        themeVideo.src = nextSrc;
      }
      themeVideo.load();
      safePlay(themeVideo);

      if (themeCaption) {
        themeCaption.textContent = '';
        const strong = document.createElement('strong');
        strong.textContent = `${info.name}: `;
        themeCaption.appendChild(strong);
        themeCaption.appendChild(document.createTextNode(info.desc));
      }

      themeTabs.forEach((tab) => {
        tab.setAttribute('aria-pressed', String(tab.dataset.theme === themeKey));
      });
      themePicks.forEach((card) => {
        card.setAttribute('aria-pressed', String(card.dataset.themePick === themeKey));
      });
    };

    themeTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.theme;
        if (key) setTheme(key);
      });
    });

    themePicks.forEach((card) => {
      card.addEventListener('click', () => {
        const key = card.dataset.themePick;
        if (key) setTheme(key);
      });
    });

    bindArrowNavigation(themeTabs, (tab) => {
      const key = tab.dataset.theme;
      if (key) setTheme(key);
    });
  }

  // Escaparate interactivo de los 9 widgets en vídeo (#capturas)
  const widgetStage = document.querySelector('#widget-stage');
  if (widgetStage) {
    const widgetSection = widgetStage.closest('#capturas') || document;
    const widgetVideo = widgetStage.querySelector('.widget-stage-video');
    const widgetTabs = Array.from(widgetStage.querySelectorAll('.widget-tab'));
    const widgetCards = Array.from(widgetSection.querySelectorAll('.widget-video-card'));
    const widgetCaption = widgetStage.querySelector('#widget-stage-caption');
    const widgetCounter = widgetStage.querySelector('#widget-stage-counter');
    const prevBtn = widgetStage.querySelector('#widget-prev');
    const nextBtn = widgetStage.querySelector('#widget-next');

    const widgetCatalog = [
      {
        key: 'calendario',
        name: 'Calendario',
        desc: 'Eventos próximos, cuadrícula mensual y agenda del día con EventKit.',
        square: true
      },
      {
        key: 'nota-rapida',
        name: 'Nota rápida',
        desc: 'Anota ideas al instante en un panel flotante anclado al Dock.',
        square: false
      },
      {
        key: 'file-shelf',
        name: 'Bandeja de archivos',
        desc: 'Arrastra archivos temporalmente y recupéralos desde cualquier workspace.',
        square: false
      },
      {
        key: 'musica',
        name: 'Música',
        desc: 'Controles de reproducción, carátula y estado en vivo desde el Dock.',
        square: false
      },
      {
        key: 'clima',
        name: 'Previsión del tiempo',
        desc: 'Consulta la previsión local con Open-Meteo sin GPS ni clave API.',
        square: false
      },
      {
        key: 'reloj-mundial',
        name: 'Reloj mundial',
        desc: 'Comprueba varias zonas horarias de un vistazo sobre el Dock.',
        square: false
      },
      {
        key: 'ajustes-rapidos',
        name: 'Ajustes rápidos',
        desc: 'Accesos directos a controles frecuentes de macOS sin abrir Ajustes.',
        square: false
      },
      {
        key: 'cpu-memoria',
        name: 'CPU y memoria',
        desc: 'Lectura en tiempo real del uso de procesador y memoria del equipo.',
        square: false
      },
      {
        key: 'github',
        name: 'GitHub',
        desc: 'Cuadrícula de contribuciones integrada en el Dock (datos de muestra).',
        square: false
      }
    ];

    let currentIndex = 0;

    const setWidget = (key, scrollToStage = false) => {
      const idx = widgetCatalog.findIndex((item) => item.key === key);
      if (!widgetVideo || idx === -1) return;
      currentIndex = idx;
      const info = widgetCatalog[idx];

      const source = widgetVideo.querySelector('source');
      const nextSrc = `assets/widgets/${info.key}.mp4`;
      const nextPoster = `assets/widgets/${info.key}-poster.png`;

      widgetVideo.muted = true;
      widgetVideo.poster = nextPoster;
      widgetVideo.classList.toggle('is-square', Boolean(info.square));
      if (source) {
        source.src = nextSrc;
      } else {
        widgetVideo.src = nextSrc;
      }
      widgetVideo.load();
      safePlay(widgetVideo);

      if (widgetCaption) {
        widgetCaption.textContent = '';
        const strong = document.createElement('strong');
        strong.textContent = `${info.name}: `;
        widgetCaption.appendChild(strong);
        widgetCaption.appendChild(document.createTextNode(info.desc));
      }

      if (widgetCounter) {
        widgetCounter.textContent = `${idx + 1} / ${widgetCatalog.length}`;
      }

      widgetTabs.forEach((tab) => {
        tab.setAttribute('aria-pressed', String(tab.dataset.widget === info.key));
      });
      widgetCards.forEach((card) => {
        card.setAttribute('aria-pressed', String(card.dataset.widgetPick === info.key));
      });

      if (scrollToStage) {
        const rect = widgetStage.getBoundingClientRect();
        if (rect.top < 0 || rect.top > window.innerHeight * 0.55) {
          widgetStage.scrollIntoView({
            behavior: motionQuery.matches ? 'auto' : 'smooth',
            block: 'nearest'
          });
        }
      }
    };

    widgetTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.dataset.widget;
        if (key) setWidget(key, false);
      });
    });

    widgetCards.forEach((card) => {
      card.addEventListener('click', () => {
        const key = card.dataset.widgetPick;
        if (key) setWidget(key, true);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const prev = widgetCatalog[(currentIndex - 1 + widgetCatalog.length) % widgetCatalog.length];
        setWidget(prev.key, false);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const next = widgetCatalog[(currentIndex + 1) % widgetCatalog.length];
        setWidget(next.key, false);
      });
    }

    bindArrowNavigation(widgetTabs, (tab) => {
      const key = tab.dataset.widget;
      if (key) setWidget(key, false);
    });
  }

  // Botones desplegables "Y más…"
  const drawerButtons = Array.from(document.querySelectorAll('[aria-controls][aria-expanded]'));
  drawerButtons.forEach((btn) => {
    const targetId = btn.getAttribute('aria-controls');
    const panel = targetId ? document.getElementById(targetId) : null;
    if (!panel) return;

    btn.addEventListener('click', () => {
      const nextOpen = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(nextOpen));
      panel.hidden = !nextOpen;
    });
  });

  // Barra de progreso de scroll y animaciones suaves al bajar
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar && !motionQuery.matches) {
    let ticking = false;
    const updateProgress = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
      ticking = false;
    };
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateProgress);
        }
      },
      { passive: true }
    );
    updateProgress();
  }

  const revealTargets = Array.from(
    document.querySelectorAll(
      '.section-head, .real-story, .theme-stage, .space-strip, .widget-stage, .widget-video-grid, .shot-grid-wide, .feature-card, .widget-grid, .metric, .step, .faq details'
    )
  );

  if (revealTargets.length > 0 && 'IntersectionObserver' in window && !motionQuery.matches) {
    document.documentElement.classList.add('has-reveal');
    revealTargets.forEach((el, idx) => {
      el.setAttribute('data-reveal', '');
      const parent = el.parentElement;
      const siblingIndex = parent ? Array.from(parent.children).indexOf(el) : idx;
      const delay = Math.min(Math.max(siblingIndex, 0) * 55, 220);
      el.style.setProperty('--reveal-delay', `${delay}ms`);
    });

    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -36px 0px' }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
  }
})();
