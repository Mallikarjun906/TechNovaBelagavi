/* ─────────── LOADER ─────────── */
let loadPct = 0;
const loaderFill = document.getElementById('loader-fill');
const loaderPct = document.getElementById('loader-pct');
const loaderEl = document.getElementById('loader');
const iv = setInterval(() => {
  loadPct += Math.random() * 12;
  if (loadPct >= 100) {
    loadPct = 100; clearInterval(iv);
    setTimeout(() => {
      loaderEl.style.transition = 'opacity .8s';
      loaderEl.style.opacity = '0';
      setTimeout(() => loaderEl.style.display = 'none', 800);
    }, 300);
  }
  loaderFill.style.width = loadPct + '%';
  loaderPct.textContent = Math.floor(loadPct) + '%';
}, 80);

/* ─────────── CURSOR ─────────── */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});
(function animCursor() {
  requestAnimationFrame(animCursor);
  rx += (mx - rx) * .12; ry += (my - ry) * .12;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
})();

/* ─────────── SCROLL REVEAL ─────────── */
const revealEls = document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .15 });
revealEls.forEach(el => obs.observe(el));

/* ─────────── STAT COUNTER ─────────── */
const statNums = document.querySelectorAll('.stat-num[data-target]');
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; const target = +el.getAttribute('data-target');
    const unit = el.querySelector('.stat-unit');
    let cur = 0; const step = target / 60;
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.childNodes[0].nodeValue = Math.floor(cur).toLocaleString();
      if (cur >= target) clearInterval(t);
    }, 16);
    statObs.unobserve(el);
  });
}, { threshold: .5 });
statNums.forEach(el => statObs.observe(el));

/* ─────────── 3D DRONE ─────────── */
import { initDroneScene } from './DroneScene.js';
initDroneScene();

/* ─────────── 3D WATCH ─────────── */
import { initWatchScene } from './WatchScene.js';
initWatchScene();

