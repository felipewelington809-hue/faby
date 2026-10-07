(() => {
  const d = document, $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  d.documentElement.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header e menu
  const header = $('.site-header'), nav = $('#nav'), btn = $('#menuBtn');
  const onScroll = () => header.classList.toggle('solid', scrollY > 50);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  const setMenu = open => {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    btn.firstElementChild.firstElementChild.setAttribute('href', open ? '#i-x' : '#i-menu');
    d.body.style.overflow = open ? 'hidden' : '';
  };
  btn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) setMenu(false); });

  // Reveal
  const rvs = $$('.rv');
  $$('.g').forEach((g, i) => g.classList.add('rv'));
  const io = new IntersectionObserver((es, o) => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); }
  }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.rv').forEach((el, i) => { if (el.classList.contains('g')) el.style.setProperty('--d', (i % 4) * .08 + 's'); io.observe(el); });

  // Contador
  const c = $('#count');
  if (c) new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting) return;
    o.disconnect();
    const to = parseFloat(c.dataset.to), fmt = v => v.toFixed(1).replace('.', ',');
    if (reduce) return (c.textContent = fmt(to));
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1);
      c.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    c.textContent = fmt(0); requestAnimationFrame(step);
  }, { threshold: .5 }).observe(c);

  // FAQ
  $$('.qa button').forEach(b => b.addEventListener('click', () => {
    const open = b.getAttribute('aria-expanded') === 'true';
    $$('.qa button').forEach(x => { x.setAttribute('aria-expanded', 'false'); d.getElementById(x.getAttribute('aria-controls')).classList.remove('open'); });
    if (!open) { b.setAttribute('aria-expanded', 'true'); d.getElementById(b.getAttribute('aria-controls')).classList.add('open'); }
  }));

  // Galeria e filtros
  const gal = $('#gal'), items = $$('.g', gal);
  $$('.filters button').forEach(b => b.addEventListener('click', () => {
    $$('.filters button').forEach(x => x.classList.toggle('on', x === b));
    const f = b.dataset.f;
    gal.classList.toggle('f', f !== 'all');
    items.forEach(g => { g.hidden = f !== 'all' && g.dataset.c !== f; });
    gal.scrollLeft = 0;
  }));

  // Arrastar o trilho com o mouse (toque usa o scroll nativo)
  let drag = false, moved = false, sx = 0, sl = 0;
  gal.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    drag = true; moved = false; sx = e.clientX; sl = gal.scrollLeft; gal.style.scrollSnapType = 'none';
  });
  addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - sx;
    if (Math.abs(dx) > 5) moved = true;
    gal.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => {
    if (!drag) return;
    drag = false; gal.style.scrollSnapType = '';
  });
  gal.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  gal.addEventListener('dragstart', e => e.preventDefault());

  // Lightbox
  const lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap');
  let list = [], idx = 0, last = null;
  const show = i => {
    idx = (i + list.length) % list.length;
    const g = list[idx], im = $('img', g);
    img.src = im.currentSrc || im.src; img.alt = im.alt; cap.textContent = g.dataset.l;
  };
  const open = g => {
    list = items.filter(x => !x.hidden); last = g;
    show(list.indexOf(g)); lb.hidden = false; d.body.style.overflow = 'hidden'; $('.lb-x', lb).focus();
  };
  const close = () => { lb.hidden = true; d.body.style.overflow = ''; if (last) last.focus(); };
  items.forEach(g => g.addEventListener('click', () => open(g)));
  $('.lb-x', lb).addEventListener('click', close);
  $('.lb-p', lb).addEventListener('click', () => show(idx - 1));
  $('.lb-nx', lb).addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let x0 = 0;
  lb.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
})();