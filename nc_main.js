/* ===== NC PAINTING CO. — MAIN JS ===== */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Hamburger Menu ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    // animate hamburger to X
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
      // stagger siblings
      const siblings = [...(entry.target.parentNode?.children || [])];
      const idx = siblings.filter(el => el.classList.contains('reveal')).indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, Math.min(idx * 90, 400));
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Active Nav Link on Scroll ── */
  const sections  = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => sectionObserver.observe(s));

  /* ── Nav Scroll Style ── */
  const nav = document.querySelector('nav');
  const handleNavScroll = () => {
    if (window.scrollY > 60) {
      nav.style.height = '60px';
      nav.style.borderBottomColor = 'rgba(201,168,76,0.3)';
    } else {
      nav.style.height = '72px';
      nav.style.borderBottomColor = 'rgba(201,168,76,0.2)';
    }
  };
  window.addEventListener('scroll', handleNavScroll, { passive: true });

  /* ── Animated Stat Counters ── */
  const statNumbers = document.querySelectorAll('.stat-number');

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();

      // Parse: "7%" → target=7, suffix="%"
      const match = raw.match(/^(\d+)(.*)$/);
      if (!match) return;

      const target = parseInt(match[1]);
      const suffix = match[2] || '';
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => countObserver.observe(el));

  /* ── Smooth Scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Portfolio hover captions on touch ── */
  document.querySelectorAll('.portfolio-item').forEach(item => {
    item.addEventListener('touchstart', () => {
      item.querySelector('.portfolio-overlay')?.style.setProperty('opacity', '1');
    }, { passive: true });
    item.addEventListener('touchend', () => {
      setTimeout(() => {
        item.querySelector('.portfolio-overlay')?.style.setProperty('opacity', '');
      }, 1800);
    }, { passive: true });
  });

  /* ── Process step stagger on hover ── */
  document.querySelectorAll('.process-step').forEach((step, i) => {
    step.style.transitionDelay = `${i * 60}ms`;
  });

  /* ── Form submit feedback ── */
  const form = document.querySelector('.contact-form form');
  if (form) {
    form.addEventListener('submit', () => {
      const btn = form.querySelector('.form-submit');
      if (btn) {
        btn.textContent = 'Sending…';
        btn.style.opacity = '0.75';
        btn.disabled = true;
      }
    });
  }

  /* ── Parallax hero bg (subtle) ── */
  const heroBg = document.querySelector('.hero-bg-pattern');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroBg.style.transform = `translateY(${y * 0.15}px)`;
    }, { passive: true });
  }


  /* ── Hero Gallery ── */
  (function() {
    const slides   = document.querySelectorAll('.gallery-slide');
    const dots     = document.querySelectorAll('.gallery-dot');
    const prevBtn  = document.querySelector('.gallery-prev');
    const nextBtn  = document.querySelector('.gallery-next');
    if (!slides.length) return;

    let current = 0;
    let timer   = null;
    let startX  = null;

    function goTo(idx) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (idx + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function startAuto() {
      clearInterval(timer);
      timer = setInterval(next, 4500);
    }

    function resetAuto() {
      startAuto();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        goTo(parseInt(dot.dataset.idx));
        resetAuto();
      });
    });

    // Touch/swipe support
    const gallery = document.querySelector('.hero-gallery');
    if (gallery) {
      gallery.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
      }, { passive: true });

      gallery.addEventListener('touchend', e => {
        if (startX === null) return;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          diff > 0 ? next() : prev();
          resetAuto();
        }
        startX = null;
      }, { passive: true });

      // Pause on hover (desktop)
      gallery.addEventListener('mouseenter', () => clearInterval(timer));
      gallery.addEventListener('mouseleave', startAuto);
    }

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
      if (e.key === 'ArrowRight') { next(); resetAuto(); }
    });

    startAuto();
  })();

});