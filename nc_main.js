/* ===== NC PAINTING CO. — MAIN JS ===== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Hamburger Menu ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    const spans = hamburger.querySelectorAll('span');
    if (open) {
      spans[0].style.cssText = 'transform:translateY(7px) rotate(45deg)';
      spans[1].style.cssText = 'opacity:0; transform:scaleX(0)';
      spans[2].style.cssText = 'transform:translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => s.style.cssText = '');
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
      hamburger.setAttribute('aria-expanded', false);
    });
  });

  /* ── Scroll Reveal ── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...(entry.target.parentNode?.children || [])].filter(el => el.classList.contains('reveal'));
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), Math.min(idx * 90, 450));
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Active Nav on Scroll ── */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const a = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => sectionObs.observe(s));

  /* ── Nav shrink on scroll ── */
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.style.height     = window.scrollY > 60 ? '60px' : '72px';
    nav.style.background = window.scrollY > 60 ? 'rgba(13,31,60,1)' : 'rgba(13,31,60,0.97)';
  }, { passive: true });

  /* ── Stat Counters ── */
  document.querySelectorAll('.stat-number').forEach(el => {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const raw   = el.textContent.trim();
      const match = raw.match(/^(\d+)(.*)$/);
      if (!match) return;
      const target = parseInt(match[1]), suffix = match[2] || '';
      const start  = performance.now();
      const tick   = now => {
        const p = Math.min((now - start) / 1400, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(e * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    }, { threshold: 0.6 });
    obs.observe(el);
  });

  /* ── Smooth Scroll ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 68, behavior: 'smooth' });
    });
  });

  /* ── Scroll to Top Button ── */
  const scrollTopBtn = document.getElementById('scroll-top');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ── Parallax hero bg ── */
  const heroBg = document.querySelector('.hero-bg-pattern');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      heroBg.style.transform = `translateY(${window.scrollY * 0.12}px)`;
    }, { passive: true });
  }

  /* ── Portfolio touch captions ── */
  document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('touchstart', () => {
      item.querySelector('.portfolio-overlay')?.style.setProperty('opacity','1');
    }, { passive: true });
    item.addEventListener('touchend', () => {
      setTimeout(() => item.querySelector('.portfolio-overlay')?.style.setProperty('opacity',''), 2000);
    }, { passive: true });
  });

  /* ── Form feedback ── */
  const form = document.querySelector('.contact-form form');
  if (form) {
    form.addEventListener('submit', () => {
      const btn = form.querySelector('.form-submit');
      if (btn) { btn.textContent = 'Sending…'; btn.style.opacity = '0.75'; btn.disabled = true; }
    });
  }

  /* ── Hero Gallery — Cinematic ── */
  (function() {
    const slides    = document.querySelectorAll('.gallery-slide');
    const dots      = document.querySelectorAll('.gallery-dot');
    const prevBtn   = document.querySelector('.gallery-prev');
    const nextBtn   = document.querySelector('.gallery-next');
    const counter   = document.querySelector('.gallery-counter .current');
    const progBar   = document.getElementById('galleryProgress');
    const gallery   = document.querySelector('.hero-gallery');
    const DURATION  = 4500;

    if (!slides.length) return;

    let current = 0;
    let timer   = null;
    let startX  = null;
    let paused  = false;

    function resetProgress() {
      if (!progBar) return;
      progBar.classList.remove('running');
      void progBar.offsetWidth; // force reflow
      progBar.style.transition = `width ${DURATION}ms linear`;
      progBar.classList.add('running');
    }

    function goTo(idx) {
      slides[current].classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current]?.classList.add('active');
      if (counter) counter.textContent = current + 1;
      resetProgress();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      clearInterval(timer);
      if (!paused) {
        timer = setInterval(next, DURATION);
        resetProgress();
      }
    }

    function stopAuto() {
      clearInterval(timer);
      if (progBar) { progBar.classList.remove('running'); progBar.style.transition = 'none'; progBar.style.width = '0%'; }
    }

    prevBtn?.addEventListener('click', () => { prev(); startAuto(); });
    nextBtn?.addEventListener('click', () => { next(); startAuto(); });

    dots.forEach(dot => {
      dot.addEventListener('click', () => { goTo(parseInt(dot.dataset.idx)); startAuto(); });
    });

    // Swipe support
    if (gallery) {
      gallery.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      gallery.addEventListener('touchend', e => {
        if (startX === null) return;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); startAuto(); }
        startX = null;
      }, { passive: true });

      // Pause on desktop hover
      gallery.addEventListener('mouseenter', () => { paused = true; stopAuto(); });
      gallery.addEventListener('mouseleave', () => { paused = false; startAuto(); });
    }

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
      if (e.key === 'ArrowRight') { next(); startAuto(); }
    });

    // Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAuto(); else startAuto();
    });

    startAuto();
  })();

  /* ── Magnetic button effect on desktop ── */
  document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r   = btn.getBoundingClientRect();
      const x   = e.clientX - r.left - r.width / 2;
      const y   = e.clientY - r.top  - r.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

});
