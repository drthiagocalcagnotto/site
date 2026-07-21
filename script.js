(() => {
  'use strict';

  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  // ── Lenis ──
  const lenis = new Lenis({
    duration: 0.6,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.8,
    touchMultiplier: 1.2,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // ── Loading Screen ──
  (function loading() {
    const loading = document.getElementById('loading');
    const counter = document.getElementById('loadingCounter');
    if (!loading) return;
    // Lock scroll during loading
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    lenis.stop();

    // Animate loading lines
    gsap.to('.loading-line[data-side="left"]', {
      x: 0, opacity: 1, duration: 0.6, delay: 0.1, ease: EASE,
    });
    gsap.to('.loading-line[data-side="right"]', {
      x: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: EASE,
    });

    // Counter 0→100
    const obj = { val: 0 };
    gsap.to(obj, {
      val: 100,
      duration: 1.2,
      delay: 0.2,
      ease: 'power2.out',
      onUpdate: () => { counter.textContent = Math.floor(obj.val) + '%'; },
      onComplete: () => {
        // Reveal
        loading.classList.add('reveal');
        // Show nav + cta after reveal
        setTimeout(() => {
          document.getElementById('nav').classList.add('visible');
          document.getElementById('ctaFloat').classList.add('visible');
        }, 300);
        // Remove loading from DOM after transition
        setTimeout(() => {
          loading.style.display = 'none';
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
          lenis.start();
        }, 1200);
      },
    });
  })();

  // ── Nav active state ──
  (function navActive() {
    const items = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('[data-section-name]');

    const updateNav = () => {
      let current = 0;
      sections.forEach((sec, i) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) current = i;
      });

      items.forEach((item, i) => {
        item.classList.toggle('active', i === current);
      });
    };

    lenis.on('scroll', updateNav);
    updateNav();
  })();

  // ── Hamburger + Drawer (mobile) ──
  (function hamburgerToggle() {
    const hamburger = document.getElementById('hamburger');
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('drawerOverlay');
    const links = drawer ? drawer.querySelectorAll('.drawer-link') : [];
    if (!hamburger || !drawer) return;

    hamburger.addEventListener('click', () => {
      const open = drawer.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    }

    links.forEach((link) => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        hamburger.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  })();

  // ── Hero entrance ──
  gsap.from('.hero-title-line', {
    y: 20, opacity: 0, duration: 0.4, ease: EASE,
    stagger: 0.08, delay: 0.2,
  });
  gsap.from('.hero-subtitle', {
    y: 15, opacity: 0, duration: 0.3, ease: EASE, delay: 0.4,
  });
  gsap.from('.hero-cta', {
    y: 10, opacity: 0, duration: 0.3, ease: EASE, delay: 0.5,
  });

  // ── Reveal sections on scroll ──
  const revealEls = document.querySelectorAll('.section-header, .sobre-text, .sobre-image, .proposito-card, .case-card, .diff-card, .faq-item, .cta-content');

  revealEls.forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
      y: 30, opacity: 0, duration: 0.7, ease: EASE,
    });
  });

  // ── Spec cards staggered ──
  gsap.from('.espec-card', {
    scrollTrigger: { trigger: '.especialidades-grid', start: 'top 85%' },
    y: 20, opacity: 0, duration: 0.5, ease: EASE, stagger: 0.06,
  });

  // ── Count up ──
  gsap.utils.toArray('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count);
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target, duration: 2.5, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onUpdate: () => { el.textContent = target >= 10 ? Math.floor(obj.val) : obj.val.toFixed(0); },
    });
  });

  // ── Testimonial slider + touch swipe ──
  (() => {
    const slider = document.getElementById('depoSlider');
    const track = document.getElementById('depoTrack');
    const dots = document.querySelectorAll('.depo-dot');
    const cards = track ? track.querySelectorAll('.depo-card') : [];
    if (!track || !dots.length || !cards.length) return;

    let current = 0;
    let interval;
    let startX = 0;
    let isDragging = false;

    const goTo = (index) => {
      current = Math.max(0, Math.min(index, cards.length - 1));
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    };

    const next = () => goTo((current + 1) % cards.length);

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        clearInterval(interval);
        goTo(parseInt(dot.dataset.index));
        interval = setInterval(next, 5000);
      });
    });

    // Touch swipe
    if (slider) {
      slider.addEventListener('touchstart', (e) => {
        startX = e.changedTouches[0].screenX;
        isDragging = true;
        clearInterval(interval);
      }, { passive: true });

      slider.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        const diff = startX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
          goTo(diff > 0 ? current + 1 : current - 1);
        }
        interval = setInterval(next, 5000);
      }, { passive: true });
    }

    interval = setInterval(next, 5000);
    document.addEventListener('visibilitychange', () => {
      clearInterval(interval);
      if (!document.hidden) interval = setInterval(next, 5000);
    });
  })();

  // ── FAQ ──
  document.querySelectorAll('.faq-q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
      item.classList.toggle('open', !isOpen);
    });
  });

  // ── Smooth anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) lenis.scrollTo(target);
    });
  });

  // ── Refresh ──
  window.addEventListener('resize', () => ScrollTrigger.refresh());

  // ── RAF ──
  const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
})();
