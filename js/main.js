/* ============================================================
   VANTS V2 — Main JavaScript
   Custom cursor · Particles · Interactions · Form
   ============================================================ */
'use strict';

// ═══════════════════════════════════════
// THEME
// ═══════════════════════════════════════
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');

function getTheme() { return localStorage.getItem('vants-theme') || 'dark'; }

function applyTheme(t) {
  html.setAttribute('data-theme', t);
  if (themeBtn) themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
}

applyTheme(getTheme());

themeBtn?.addEventListener('click', () => {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem('vants-theme', next);
  applyTheme(next);
  initParticles();
});

// ═══════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;
let rafId = null;

function updateCursor() {
  ringX += (mouseX - ringX) * 0.14;
  ringY += (mouseY - ringY) * 0.14;

  if (dot) { dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`; }
  if (ring) { ring.style.transform = `translate(${ringX}px, ${ringY}px)`; }
  rafId = requestAnimationFrame(updateCursor);
}

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (!rafId) updateCursor();
}, { passive: true });

// Hover effect
document.addEventListener('mouseover', e => {
  const t = e.target;
  if (t.matches('a, button, .bento-cell, .pillar, .review-ed, .area-tile, .price-list-item, .faq-q, .menu-link')) {
    ring?.classList.add('hover');
  }
});

document.addEventListener('mouseout', e => {
  const t = e.target;
  if (t.matches('a, button, .bento-cell, .pillar, .review-ed, .area-tile, .price-list-item, .faq-q, .menu-link')) {
    ring?.classList.remove('hover');
  }
});

document.addEventListener('mousedown', () => ring?.classList.add('click'));
document.addEventListener('mouseup', () => ring?.classList.remove('click'));

document.addEventListener('mouseleave', () => {
  if (dot) dot.style.opacity = '0';
  if (ring) ring.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
  if (dot) dot.style.opacity = '1';
  if (ring) ring.style.opacity = '1';
});

// ═══════════════════════════════════════
// NAVBAR SCROLL
// ═══════════════════════════════════════
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('compact', window.scrollY > 60);
}, { passive: true });

// ═══════════════════════════════════════
// HAMBURGER / FULLSCREEN MENU
// ═══════════════════════════════════════
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('fullscreenMenu');
let menuOpen = false;

hamburger?.addEventListener('click', () => {
  menuOpen = !menuOpen;
  hamburger.classList.toggle('open', menuOpen);
  menu?.classList.toggle('open', menuOpen);
  document.body.style.overflow = menuOpen ? 'hidden' : '';
});

menu?.querySelectorAll('.menu-link').forEach(link => {
  link.addEventListener('click', () => {
    menuOpen = false;
    hamburger?.classList.remove('open');
    menu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// ═══════════════════════════════════════
// SMOOTH SCROLL
// ═══════════════════════════════════════
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 64,
        behavior: 'smooth'
      });
    }
  });
});

// ═══════════════════════════════════════
// COUNT UP ANIMATION
// ═══════════════════════════════════════
function countUp(el, target, duration = 1800) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target) + '+';
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const countEl = document.getElementById('heroCountUp');
if (countEl) {
  const target = parseInt(countEl.dataset.target || '500');
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      countUp(countEl, target);
      obs.disconnect();
    }
  }, { threshold: 0.5 });
  obs.observe(countEl);
}

// ═══════════════════════════════════════
// HERO PARTICLE CANVAS
// ═══════════════════════════════════════
const canvas = document.getElementById('heroCanvas');
let animFrame = null;

function initParticles() {
  if (!canvas) return;
  if (animFrame) cancelAnimationFrame(animFrame);

  const ctx = canvas.getContext('2d');
  const dark = getTheme() === 'dark';
  let W, H, particles = [];
  const N = 45;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  class P {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25;
      this.a = dark ? Math.random() * 0.3 + 0.05 : Math.random() * 0.2 + 0.05;
      // Random: gold or white
      this.gold = Math.random() > 0.5;
    }
    draw() {
      const color = this.gold
        ? `201,168,76`
        : dark ? `255,255,255` : `0,0,0`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${this.a})`;
      ctx.fill();
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -5 || this.x > W + 5 || this.y < -5 || this.y > H + 5) this.reset();
    }
  }

  particles = Array.from({ length: N }, () => new P());

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          const a = (1 - dist / 90) * (dark ? 0.06 : 0.04);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201,168,76,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    particles.forEach(p => { p.draw(); p.update(); });
    animFrame = requestAnimationFrame(draw);
  }

  draw();
}

initParticles();

// ═══════════════════════════════════════
// SCROLL REVEAL
// ═══════════════════════════════════════
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = e.target.dataset.delay;
      if (delay) e.target.style.transitionDelay = delay + 's';
      e.target.classList.add('in');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Fallback: reveal everything after 2s
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
}, 2000);

// ═══════════════════════════════════════
// FAQ ACCORDION
// ═══════════════════════════════════════
function toggleFaq(id) {
  const item = document.getElementById(id);
  if (!item) return;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

window.toggleFaq = toggleFaq;

// ═══════════════════════════════════════
// TOAST
// ═══════════════════════════════════════
function showToast(msg, icon = '✅') {
  const t = document.getElementById('toast');
  const m = document.getElementById('toastMsg');
  const i = document.getElementById('toastIcon');
  if (!t) return;
  if (i) i.textContent = icon;
  if (m) m.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

// ═══════════════════════════════════════
// BOOKING FORM
// ═══════════════════════════════════════
function saveBooking(data) {
  try {
    const all = JSON.parse(localStorage.getItem('vants-bookings') || '[]');
    all.unshift(data);
    localStorage.setItem('vants-bookings', JSON.stringify(all));
  } catch (_) {}
}

function buildWAMessage(d) {
  return encodeURIComponent([
    '🔧 *VANTS PC Repair — Booking Request*',
    '',
    `👤 *Name:* ${d.name}`,
    `📱 *Phone:* ${d.phone}`,
    `💻 *Device:* ${d.device}`,
    `📍 *Area:* ${d.location}`,
    `⏰ *Preferred Slot:* ${d.slot}`,
    '',
    `🛠 *Issue:*`,
    `${d.issue}`,
    '',
    `📅 *Submitted:* ${d.date}`,
  ].join('\n'));
}

const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', e => {
    e.preventDefault();

    const required = [
      ['clientName', 'Full Name'],
      ['clientPhone', 'Phone Number'],
      ['deviceType', 'Device Type'],
      ['preferredTime', 'Preferred Time'],
      ['location', 'Area / Address'],
      ['issueDesc', 'Issue Description'],
    ];

    for (const [id, label] of required) {
      const el = document.getElementById(id);
      if (!el?.value?.trim()) {
        showToast(`Please fill in: ${label}`, '⚠️');
        el?.focus();
        return;
      }
    }

    const phone = document.getElementById('clientPhone').value.trim();
    if (!/^[\d\s+\-().]{7,16}$/.test(phone)) {
      showToast('Enter a valid phone number', '⚠️');
      return;
    }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Saving…';

    const now = new Date();
    const data = {
      id: `BK-${Date.now()}`,
      name: document.getElementById('clientName').value.trim(),
      phone,
      device: document.getElementById('deviceType').value,
      slot: document.getElementById('preferredTime').value,
      location: document.getElementById('location').value.trim(),
      issue: document.getElementById('issueDesc').value.trim(),
      date: now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      timestamp: now.toISOString(),
      status: 'pending',
    };

    saveBooking(data);

    setTimeout(() => {
      window.open(`https://wa.me/919495709045?text=${buildWAMessage(data)}`, '_blank');
      showToast('Booking confirmed! Opening WhatsApp…', '✅');
      bookingForm.reset();
      btn.disabled = false;
      btn.textContent = 'Confirm Booking via WhatsApp →';
    }, 600);
  });
}

// ═══════════════════════════════════════
// BENTO HOVER (subtle parallax on icon)
// ═══════════════════════════════════════
document.querySelectorAll('.bento-cell').forEach(cell => {
  cell.addEventListener('mousemove', e => {
    if (window.innerWidth < 768) return;
    const rect = cell.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
    const icon = cell.querySelector('.bento-icon');
    if (icon) icon.style.transform = `translate(${dx * 8}px, ${dy * 8}px)`;
    cell.style.transform = `perspective(600px) rotateX(${(-dy * 2).toFixed(2)}deg) rotateY(${(dx * 2).toFixed(2)}deg)`;
    cell.style.transition = 'transform 0.08s ease-out';
  });

  cell.addEventListener('mouseleave', () => {
    cell.style.transform = '';
    cell.style.transition = 'transform 0.5s ease, background 0.2s';
    const icon = cell.querySelector('.bento-icon');
    if (icon) { icon.style.transform = ''; }
  });
});

 // ═══════════════════════════════════════
 // ANIME.JS ENTRY ANIMATIONS
 // ═══════════════════════════════════════
 // Hero headline animation
 anime({
   targets: '.hero-hl',
   translateY: [-50, 0],
   opacity: [0, 1],
   duration: 1200,
   easing: 'easeOutExpo'
 });
 // Hero CTA buttons animation
 anime({
   targets: '.hero-ctas .btn',
   translateY: [20, 0],
   opacity: [0, 1],
   delay: anime.stagger(100, { start: 300 }),
   duration: 800,
   easing: 'easeOutExpo'
 });
 // BENTO cells scroll reveal animation
 const bentoObserver = new IntersectionObserver((entries) => {
   entries.forEach(entry => {
     if (entry.isIntersecting) {
       anime({
         targets: entry.target,
         translateY: [20, 0],
         opacity: [0, 1],
         duration: 800,
         easing: 'easeOutExpo'
       });
       bentoObserver.unobserve(entry.target);
     }
   });
 }, { threshold: 0.1 });
 document.querySelectorAll('.bento-cell').forEach(cell => {
   cell.style.opacity = 0;
   bentoObserver.observe(cell);
 });
 // Existing price list hover indicator
 document.querySelectorAll('.price-list-item').forEach(item => {
   item.addEventListener('mouseenter', () => item.style.transition = 'all 0.2s ease');
 });
