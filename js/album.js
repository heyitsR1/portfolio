/* r1 — the album lightbox. reads everything off the grid, holds no second copy. */
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.album');
  if (!grid) return;

  const shots = [...grid.querySelectorAll('.shot')];
  if (!shots.length) return;

  const frames = shots.map(btn => {
    const img = btn.querySelector('img');
    const cap = btn.querySelector('.cap');
    return {
      src: img.dataset.full || img.src,
      alt: img.alt,
      cap: cap ? cap.textContent : '',
      when: btn.querySelector('.when').textContent
    };
  });

  const lb = build();
  document.body.appendChild(lb.root);

  let at = -1;
  let from = null;

  shots.forEach((btn, i) => btn.addEventListener('click', () => open(i, btn)));

  function open(i, btn) {
    from = btn || null;
    lb.root.classList.add('on');
    document.body.classList.add('lb-open');
    show(i);
    lb.close.focus();
  }

  function shut() {
    lb.root.classList.remove('on', 'ready');
    document.body.classList.remove('lb-open');
    at = -1;
    if (from) from.focus();
  }

  function show(i) {
    at = (i + frames.length) % frames.length;
    const f = frames[at];
    lb.root.classList.remove('ready');
    lb.img.src = f.src;
    lb.img.alt = f.alt;
    lb.cap.textContent = f.cap;
    lb.when.textContent = f.when;
    lb.count.textContent = `${at + 1} / ${frames.length}`;
    if (lb.img.complete) ready(); else lb.img.onload = ready;
    warm(at + 1);
    warm(at - 1);
  }

  function ready() { lb.root.classList.add('ready'); }

  /* the next one is usually the one you want — have it in cache already */
  function warm(i) {
    const f = frames[(i + frames.length) % frames.length];
    const pre = new Image();
    pre.src = f.src;
  }

  const step = d => show(at + d);

  lb.close.addEventListener('click', shut);
  lb.prev.addEventListener('click', () => step(-1));
  lb.next.addEventListener('click', () => step(1));
  lb.root.addEventListener('click', e => { if (e.target === lb.root) shut(); });

  document.addEventListener('keydown', e => {
    if (at < 0) return;
    if (e.key === 'Escape') shut();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  /* swipe */
  let x0 = null;
  lb.root.addEventListener('touchstart', e => { x0 = e.changedTouches[0].clientX; }, { passive: true });
  lb.root.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });

  function build() {
    const root = document.createElement('div');
    root.className = 'lb';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'photo');
    root.innerHTML = `
      <button class="lb-btn lb-close" type="button" aria-label="close">✕</button>
      <button class="lb-btn lb-prev" type="button" aria-label="previous photo">←</button>
      <button class="lb-btn lb-next" type="button" aria-label="next photo">→</button>
      <figure>
        <img alt="">
        <figcaption><span class="cap"></span><span class="when"></span></figcaption>
      </figure>
      <span class="lb-count" aria-hidden="true"></span>`;
    return {
      root,
      img: root.querySelector('img'),
      cap: root.querySelector('.cap'),
      when: root.querySelector('.when'),
      count: root.querySelector('.lb-count'),
      close: root.querySelector('.lb-close'),
      prev: root.querySelector('.lb-prev'),
      next: root.querySelector('.lb-next')
    };
  }
});
