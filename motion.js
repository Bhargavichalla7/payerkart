// Payerkart motion layer. Progressive enhancement: content is fully visible without it.
(function(){
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var vh = window.innerHeight;
  var $$ = function(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); };
  var inside = function(el, sel){ return !!(el.closest && el.closest(sel)); };

  // ---------- header + progress bar ----------
  var header = document.querySelector('.site-header');
  if (!header) {
    var navLink = document.querySelector('a.nav-desktop');
    header = navLink ? navLink.parentElement.parentElement.parentElement : null;
    if (header) header.classList.add('pk-header');
  }
  var bar = document.createElement('div'); bar.className = 'pk-progress'; document.body.appendChild(bar);
  var rails = $$('ol.steps');
  var ticking = false;
  function onScroll(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(function(){
      var y = window.scrollY, max = document.documentElement.scrollHeight - vh;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
      if (header) header.classList.toggle('pk-scrolled', y > 8);
      rails.forEach(function(r){
        var b = r.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (vh * 0.75 - b.top) / b.height));
        r.style.setProperty('--pk-rail', p.toFixed(3));
      });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function(){ vh = window.innerHeight; onScroll(); });
  onScroll();

  // ---------- arrows that nudge on hover ----------
  $$('a, button').forEach(function(el){
    if (el.children.length === 0 && /→\s*$/.test(el.textContent)) {
      el.innerHTML = el.innerHTML.replace(/→\s*$/, '<span class="pk-arr">→</span>');
      if (!el.classList.contains('btn') && /background:var\(--accent-strong\)|background:var\(--paper\)/.test(el.getAttribute('style') || '')) el.classList.add('pk-btn');
    }
  });
  $$('a[href="#api"], a[href="#demo"]').forEach(function(el){ if ((el.getAttribute('style')||'').indexOf('border-radius:8px') > -1) el.classList.add('pk-btn'); });

  // ---------- inline-styled cards (homepage, blog) get the card treatment ----------
  $$('div[style*="border-radius:12px"], a[style*="border-radius:12px"]').forEach(function(el){
    var s = el.getAttribute('style') || '';
    if (inside(el, '#top') || inside(el, '#demoModalOverlay') || inside(el, '.modal-overlay')) return;
    if (/background:var\(--surface\)/.test(s) && el.offsetHeight < 420) el.classList.add('pk-card');
  });
  // cursor spotlight
  $$('.card, .pk-card').forEach(function(c){
    c.addEventListener('pointermove', function(e){
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  if (reduce || !('IntersectionObserver' in window)) return;

  // ---------- scroll reveal (below the fold only, so nothing flashes) ----------
  var targets = $$([
    '.section h2', '.section .sub', '.section .card', '.stats', '.table-wrap', 'ol.steps li', '.cta-band',
    '.faq details', '.prose > *', '.callout', '.trust', '.grid > a.card',
    'h2', 'h3', '.pk-card', 'pre', '.faq-item', 'article > *', '.site-footer .foot-grid > div'
  ].join(','));
  var seen = [];
  targets.forEach(function(el){
    if (inside(el, '#demoModalOverlay') || inside(el, '.modal-overlay') || inside(el, '.site-header') || inside(el, '.pk-header')) return;
    if (inside(el, '.page-hero') || inside(el, '#top')) return;
    for (var i = 0; i < seen.length; i++) if (seen[i].contains(el)) return;
    if (el.getBoundingClientRect().top < vh * 0.95) return;
    seen.push(el);
    el.classList.add('pk-reveal');
    if (el.matches('.cta-band, pre, .table-wrap')) el.classList.add('pk-reveal-scale');
  });
  // stagger siblings
  seen.forEach(function(el){
    var p = el.parentElement; if (!p) return;
    var sibs = Array.prototype.filter.call(p.children, function(c){ return c.classList.contains('pk-reveal'); });
    var i = sibs.indexOf(el);
    if (sibs.length > 1 && i > 0) el.style.setProperty('--pk-d', Math.min(i * 0.07, 0.42) + 's');
  });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('pk-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  seen.forEach(function(el){ io.observe(el); });

  // ---------- "15 min → <1 sec" ----------
  $$('b, span').forEach(function(el){
    if (el.children.length) return;
    var t = el.textContent.trim();
    if (t === '15 min → <1 sec') {
      el.innerHTML = '<span class="pk-old">15 min</span> → <span class="pk-new">&lt;1 sec</span>';
      var o = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting) { el.classList.add('pk-fast-go'); o.disconnect(); } }); }, { threshold: 0.6 });
      o.observe(el);
    }
  });

  // ---------- code blocks type in ----------
  $$('pre').forEach(function(pre){
    if (inside(pre, '.pk-noanim')) return;
    var lines = pre.innerHTML.split('\n');
    var balanced = lines.every(function(l){ return (l.match(/<span/g)||[]).length === (l.match(/<\/span>/g)||[]).length; });
    if (!balanced || lines.length < 2) return;
    pre.innerHTML = lines.map(function(l, i){ return '<span class="pk-line" style="--pk-d:' + (i * 0.06).toFixed(2) + 's">' + l + '</span>'; }).join('\n') + '<span class="pk-caret"></span>';
    var o = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting) { pre.classList.add('pk-code-go'); o.disconnect(); } }); }, { threshold: 0.3 });
    o.observe(pre);
  });

  // ---------- homepage: live check-in queue ----------
  var queueTitle = $$('span').filter(function(s){ return s.textContent.trim() === "Today's check-in queue"; })[0];
  if (queueTitle) {
    var card = queueTitle.closest('div[style*="border-radius:12px"]');
    var auto = $$('span', card).filter(function(s){ return s.textContent.trim() === 'eligibility checked automatically'; })[0];
    if (auto) auto.insertAdjacentHTML('afterbegin', '<span class="pk-live" aria-hidden="true"></span>');
    var rows = $$('div[style*="grid-template-columns:44px"]', card);
    var chips = rows.map(function(r){ var c = r.lastElementChild; c.classList.add('pk-chip'); return { row: r, chip: c, text: c.textContent, style: c.getAttribute('style') }; });
    var running = false, visible = true;
    function cycle(){
      if (running || !visible || document.hidden) return; running = true;
      chips.forEach(function(c){ c.chip.textContent = 'checking…'; c.chip.classList.add('pk-checking'); });
      chips.forEach(function(c, i){
        setTimeout(function(){
          c.chip.classList.remove('pk-checking'); c.chip.textContent = c.text;
          c.chip.classList.remove('pk-pop'); void c.chip.offsetWidth; c.chip.classList.add('pk-pop');
          c.row.classList.remove('pk-row-flash'); void c.row.offsetWidth; c.row.classList.add('pk-row-flash');
          if (i === chips.length - 1) running = false;
        }, 900 + i * 650);
      });
    }
    if (chips.length) {
      new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(card);
      setTimeout(cycle, 1200);
      setInterval(cycle, 9000);
    }
  }

  // ---------- smooth <details> FAQ ----------
  $$('.faq details').forEach(function(d){
    var s = d.querySelector('summary'), body = d.querySelector('p');
    if (!s || !body || !body.animate) return;
    s.addEventListener('click', function(e){
      e.preventDefault();
      if (d.open) {
        var a = body.animate([{ height: body.offsetHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 300, easing: 'cubic-bezier(.22,1,.36,1)' });
        a.onfinish = function(){ d.open = false; };
      } else {
        d.open = true;
        var h = body.offsetHeight;
        body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    });
  });
})();
