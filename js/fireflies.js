/* r1 — fireflies. a few, slow, mostly dark. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const c = document.createElement('canvas');
  c.id = 'fireflies';
  c.setAttribute('aria-hidden', 'true');
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:-1;';
  document.body.prepend(c);
  const ctx = c.getContext('2d');

  let W = 0, H = 0, dpr = 1, flies = [], raf = null, last = 0;

  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = W < 720 ? 9 : 18;
    flies = Array.from({ length: n }, spawn);
  }

  function spawn() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      a: Math.random() * Math.PI * 2,     // heading
      turn: (Math.random() - 0.5) * 0.02, // how much it wanders
      v: 0.08 + Math.random() * 0.14,     // px per frame, slow
      r: 1 + Math.random() * 1.1,
      t: Math.random() * 1000,            // blink clock
      period: 2.6 + Math.random() * 4.2,  // seconds per blink
      duty: 0.18 + Math.random() * 0.18   // fraction of period spent lit
    };
  }

  function glow(f, k) {
    // k in 0..1 — brightness of this frame
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 7);
    g.addColorStop(0, `rgba(244,221,23,${0.55 * k})`);
    g.addColorStop(0.35, `rgba(244,221,23,${0.16 * k})`);
    g.addColorStop(1, 'rgba(244,221,23,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `rgba(255,245,170,${0.85 * k})`;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 0.55, 0, Math.PI * 2); ctx.fill();
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    ctx.clearRect(0, 0, W, H);
    for (const f of flies) {
      f.a += f.turn + (Math.random() - 0.5) * 0.04;
      f.x += Math.cos(f.a) * f.v;
      f.y += Math.sin(f.a) * f.v * 0.6;
      if (f.x < -20) f.x = W + 20; else if (f.x > W + 20) f.x = -20;
      if (f.y < -20) f.y = H + 20; else if (f.y > H + 20) f.y = -20;

      f.t += dt;
      const phase = (f.t % f.period) / f.period;
      let k = 0;
      if (phase < f.duty) {
        const p = phase / f.duty;            // 0..1 across the lit window
        k = Math.sin(p * Math.PI);           // soft in, soft out
        k = k * k * (3 - 2 * k);
      }
      if (k > 0.01) glow(f, k);
    }
    raf = requestAnimationFrame(frame);
  }

  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = null; } }

  window.addEventListener('resize', size, { passive: true });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
  size();
  start();
})();
