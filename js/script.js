/* r1 — the few things that move */
document.addEventListener('DOMContentLoaded', () => {
  kathmandu();
  reveal();
  peek();
  form();
  lit();
});

/* live time where I am */
function kathmandu() {
  const el = document.getElementById('ktm');
  if (!el) return;
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', hour12: false
  });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 15000);
}

/* fade things in as they arrive */
function reveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
}

/* a screenshot that follows the cursor over project rows */
function peek() {
  const box = document.getElementById('peek');
  if (!box || !window.matchMedia('(hover: hover)').matches) return;
  const img = box.querySelector('img');
  const rows = document.querySelectorAll('[data-peek]');
  let tx = 0, ty = 0, x = 0, y = 0, raf = null, on = false;

  const loop = () => {
    x += (tx - x) * 0.14;
    y += (ty - y) * 0.14;
    box.style.transform = `translate(${x + 24}px, ${y + 16}px) scale(${on ? 1 : 0.96})`;
    if (on || Math.abs(tx - x) > 0.5 || Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(loop);
    else raf = null;
  };

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });

  rows.forEach(row => {
    row.addEventListener('mouseenter', (e) => {
      img.src = row.dataset.peek;
      tx = e.clientX; ty = e.clientY;
      if (!on) { x = tx; y = ty; }
      on = true;
      box.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    row.addEventListener('mouseleave', () => {
      on = false;
      box.classList.remove('on');
    });
  });

  // the page moved under the cursor; don't leave the preview hanging
  window.addEventListener('scroll', () => { on = false; box.classList.remove('on'); }, { passive: true });

  box.style.transform = 'translate(-9999px,-9999px)';
}

/* the note on the desk */
function form() {
  const f = document.getElementById('contact-form');
  if (!f) return;
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = f.querySelector('.send');
    btn.disabled = true;
    btn.textContent = 'sending…';
    const data = new FormData(f);
    const who = (data.get('alias') || 'stranger').toString().trim();
    try {
      const r = await fetch(f.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error('bad response');
      const done = document.createElement('p');
      done.className = 'sent';
      done.innerHTML = `Got it. Thanks, <b>${escapeHtml(who)}</b>. I'll write back.`;
      f.replaceWith(done);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'didn\'t send, try again →';
    }
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* highlight a project when arriving from a #hash */
function lit() {
  if (!location.hash) return;
  const el = document.querySelector(location.hash);
  if (!el || !el.classList.contains('entry')) return;
  el.classList.add('in', 'lit');
  setTimeout(() => el.classList.remove('lit'), 2600);
}
