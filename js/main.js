/* =========================================
   KEYO Tattoo Studio — main JS
   ========================================= */
(function () {
  "use strict";

  /* -------- Loader -------- */
  // Lock scroll IMMEDIATELY (before window 'load') so any early wheel/touch
  // input during the intro animation does not move the page off the hero.
  // Only lock if a loader is actually present in the DOM, otherwise a page
  // without a loader would stay locked forever.
  const _hasLoader = !!document.getElementById("loader");
  if (_hasLoader) {
    document.documentElement.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
  }
  // Force the page back to the top in case the browser restored a scroll
  // position from a previous visit.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  // Belt-and-braces: also swallow any scroll/touch/key input while locked.
  const blockScroll = (e) => {
    if (document.body.classList.contains("no-scroll")) {
      e.preventDefault();
    }
  };
  const blockKeys = (e) => {
    if (!document.body.classList.contains("no-scroll")) return;
    const blocked = [" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"];
    if (blocked.includes(e.key)) e.preventDefault();
  };
  window.addEventListener("wheel", blockScroll, { passive: false });
  window.addEventListener("touchmove", blockScroll, { passive: false });
  window.addEventListener("keydown", blockKeys);

  window.addEventListener("load", function () {
    const loader = document.getElementById("loader");
    if (!loader) return;
    // Hold the intro long enough for the bracket-slide, letter blur-in,
    // line-draw and meta-fade animations to play through.
    setTimeout(() => {
      loader.classList.add("hide");
      // Release scroll just before the curtain lifts so the hero is
      // immediately interactive when the user sees it.
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
      window.scrollTo(0, 0);
    }, 2400);
    setTimeout(() => loader.remove(), 3400);
  });

  /* -------- Year -------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -------- Nav: scrolled state -------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 30) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* -------- Mobile menu toggle -------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(a =>
      a.addEventListener("click", () => {
        navToggle.classList.remove("open");
        navLinks.classList.remove("open");
      })
    );
  }

  /* -------- Side text: rotating phrases -------- */
  const stacks = document.querySelectorAll(".phrase-stack");
  stacks.forEach((stack, sIdx) => {
    const phrases = Array.from(stack.querySelectorAll(".phrase"));
    if (phrases.length <= 1) return;
    let i = 0;
    // Stagger so each side rotates out of sync
    const interval = 4800 + sIdx * 800;
    setInterval(() => {
      phrases[i].classList.remove("active");
      i = (i + 1) % phrases.length;
      phrases[i].classList.add("active");
    }, interval);
  });

  /* -------- Hero slider (auto crossfade) -------- */
  const slides = document.querySelectorAll(".hero-slide");
  if (slides.length > 1) {
    let idx = 0;
    setInterval(() => {
      slides[idx].classList.remove("active");
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add("active");
    }, 5500);
  }

  /* -------- Reveal on scroll -------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("in"));
  }

  /* -------- Lightbox -------- */
  const items = Array.from(document.querySelectorAll(".g-item"));
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  let lbIdx = 0;

  const openLb = (i) => {
    lbIdx = i;
    lbImg.src = items[i].getAttribute("data-src");
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };
  const closeLb = () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };
  const nav_ = (dir) => {
    lbIdx = (lbIdx + dir + items.length) % items.length;
    lbImg.src = items[lbIdx].getAttribute("data-src");
  };

  items.forEach((it, i) => it.addEventListener("click", () => openLb(i)));
  if (lbClose) lbClose.addEventListener("click", closeLb);
  if (lbPrev) lbPrev.addEventListener("click", () => nav_(-1));
  if (lbNext) lbNext.addEventListener("click", () => nav_(1));
  if (lb) lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowLeft") nav_(-1);
    else if (e.key === "ArrowRight") nav_(1);
  });

  /* -------- FAQ: only one open at a time -------- */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((d) => {
    d.addEventListener("toggle", () => {
      if (d.open) {
        faqItems.forEach((o) => { if (o !== d) o.open = false; });
      }
    });
  });

  /* -------- Lang switcher -------- */
  const STORAGE_KEY = "keyo_lang";
  const supported = ["it", "en", "de", "fr"];
  const dict = window.KEYO_I18N || {};
  const langSwitch = document.getElementById("langSwitch");
  const langCurrent = document.getElementById("langCurrent");
  const langLabel = document.getElementById("langLabel");
  const langList = langSwitch ? langSwitch.querySelector(".lang-list") : null;

  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && supported.includes(stored)) return stored;
    const nav_l = (navigator.language || "it").slice(0, 2).toLowerCase();
    return supported.includes(nav_l) ? nav_l : "it";
  }

  function applyLang(lang) {
    if (!supported.includes(lang)) lang = "it";
    const d = dict[lang] || {};
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const val = d[key];
      if (val == null) return;
      const attr = el.getAttribute("data-i18n-attr");
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    });

    if (langLabel) langLabel.textContent = lang.toUpperCase();
    localStorage.setItem(STORAGE_KEY, lang);
  }

  if (langCurrent && langSwitch) {
    langCurrent.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = langSwitch.classList.toggle("open");
      langCurrent.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", () => {
      langSwitch.classList.remove("open");
      langCurrent.setAttribute("aria-expanded", "false");
    });
  }
  if (langList) {
    langList.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => {
        applyLang(li.getAttribute("data-lang"));
        langSwitch.classList.remove("open");
      });
    });
  }

  applyLang(detectLang());

  /* -------- Smooth anchor scroll with offset for fixed nav -------- */
  // Per-section landing offsets (px ABOVE the section's first pixel in the
  // viewport once scrolled). Larger value = section appears further DOWN on
  // screen; smaller value = section appears HIGHER (closer to the top nav).
  const ANCHOR_OFFSETS = {
    "#filosofia": 0,    // centered full-bleed: scroll to its true top
    "#studio":   0,   // land slightly above the title so it sits comfortably below the nav
    "#artisti":  0,
    "#galleria": 0,
    "#faq":      0,
    "#contatti": 0
  };

  let anchorScrollFrame = null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const scrollToAnchor = (targetTop) => {
    if (anchorScrollFrame) cancelAnimationFrame(anchorScrollFrame);

    const startTop = window.pageYOffset;
    const maxTop = document.documentElement.scrollHeight - window.innerHeight;
    const endTop = Math.max(0, Math.min(targetTop, maxTop));
    const distance = endTop - startTop;

    if (prefersReducedMotion || Math.abs(distance) < 1) {
      window.scrollTo({ top: endTop, left: 0, behavior: "auto" });
      return;
    }

    const duration = Math.min(1300, Math.max(850, Math.abs(distance) * 0.55));
    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      window.scrollTo({ top: startTop + distance * easeInOutCubic(progress), left: 0, behavior: "auto" });
      if (progress < 1) anchorScrollFrame = requestAnimationFrame(tick);
      else anchorScrollFrame = null;
    };

    anchorScrollFrame = requestAnimationFrame(tick);
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = nav ? nav.getBoundingClientRect().height : 60;
      const custom = ANCHOR_OFFSETS[href];
      const offset = custom != null ? custom : (navH + 12);
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      scrollToAnchor(top);
    });
  });

  /* -------- Contact form: Formspree async -------- */
  const cf = document.getElementById("contactForm");
  const cfStatus = document.getElementById("formStatus");
  const cfBtn = document.getElementById("cfSubmit");
  if (cf && cfStatus) {
    const msgFor = (key, fallback) => {
      const lang = document.documentElement.lang || "it";
      const d = (window.KEYO_I18N && window.KEYO_I18N[lang]) || {};
      return d[key] || fallback;
    };
    cf.addEventListener("submit", async (e) => {
      e.preventDefault();
      cfStatus.classList.remove("show", "ok", "err");
      const data = new FormData(cf);
      if (cfBtn) { cfBtn.disabled = true; cfBtn.style.opacity = .6; }
      try {
        const res = await fetch(cf.action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" }
        });
        if (res.ok) {
          const redirect = cf.getAttribute("data-redirect");
          const successKey = redirect ? "lottery.f.success" : "contact.f.success";
          cfStatus.textContent = msgFor(successKey, "Richiesta inviata. Ti risponderemo a breve.");
          cfStatus.classList.add("show", "ok");
          cf.reset();
          if (redirect && /^https?:\/\//.test(redirect) && !/REPLACE_WITH/i.test(redirect)) {
            // Give the user a beat to read the success message before
            // bouncing them to the secure payment page (Stripe Payment Link).
            setTimeout(() => { window.location.href = redirect; }, 900);
          }
        } else {
          cfStatus.textContent = msgFor("contact.f.error", "Si è verificato un errore. Riprova o scrivici su Instagram.");
          cfStatus.classList.add("show", "err");
        }
      } catch {
        cfStatus.textContent = msgFor("contact.f.error", "Si è verificato un errore. Riprova o scrivici su Instagram.");
        cfStatus.classList.add("show", "err");
      } finally {
        if (cfBtn) { cfBtn.disabled = false; cfBtn.style.opacity = 1; }
      }
    });
  }

  /* -------- Hero parallax (subtle) -------- */
  const hero = document.querySelector(".hero-slider");
  if (hero && window.matchMedia("(min-width: 769px)").matches) {
    let heroParallaxFrame = null;
    const updateHeroParallax = () => {
      heroParallaxFrame = null;
      const y = window.scrollY;
      if (y < window.innerHeight) {
        hero.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
      }
    };

    window.addEventListener("scroll", () => {
      if (!heroParallaxFrame) heroParallaxFrame = requestAnimationFrame(updateHeroParallax);
    }, { passive: true });
  }
})();
