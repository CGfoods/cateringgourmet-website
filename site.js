(function(){
  // Mobile menu
  var mb = document.querySelector('.menu-btn'), nav = document.getElementById('nav');
  if (mb) {
    mb.addEventListener('click', function(){
      var open = mb.getAttribute('aria-expanded') === 'true';
      mb.setAttribute('aria-expanded', open ? 'false' : 'true');
      nav.classList.toggle('open', !open);
    });
    nav.addEventListener('click', function(e){ if (e.target.closest('a')) { mb.setAttribute('aria-expanded','false'); nav.classList.remove('open'); } });
  }

  // Menu tabs
  var tabs = document.querySelectorAll('.tab');
  function show(tab){
    tabs.forEach(function(t){
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function(t, i){
    t.addEventListener('click', function(){ show(t); });
    t.addEventListener('keydown', function(e){
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (n) { var next = tabs[(i + n + tabs.length) % tabs.length]; show(next); next.focus(); }
    });
  });
  if (tabs.length) show(tabs[0]);
  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();

  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conn = navigator.connection || {};
  var slow = conn.saveData || /2g|3g/.test(conn.effectiveType || '');

  // Hero slideshow
  var slides = document.querySelectorAll('.hero .slide');
  var dots = document.querySelectorAll('.hero .dots button');
  var cur = 0, timer = null;
  function prep(img){ if (img && img.dataset.srcset) { img.srcset = img.dataset.srcset; img.src = img.dataset.srcset.split(' ')[0]; img.removeAttribute('data-srcset'); } }
  function go(n){
    n = (n + slides.length) % slides.length;
    prep(slides[n]); prep(slides[(n + 1) % slides.length]);
    slides[cur].classList.remove('is-on'); dots[cur].removeAttribute('aria-current');
    cur = n;
    slides[cur].classList.add('is-on'); dots[cur].setAttribute('aria-current', 'true');
  }
  function play(){ if (!calm && slides.length > 1) { clearInterval(timer); timer = setInterval(function(){ go(cur + 1); }, 5000); } }
  dots.forEach(function(d, i){ d.addEventListener('click', function(){ go(i); play(); }); });
  window.addEventListener('load', function(){ prep(slides[1]); play(); });
  document.addEventListener('visibilitychange', function(){ if (document.hidden) clearInterval(timer); else play(); });

  // Gallery lightbox
  var lb = document.querySelector('.lightbox');
  var pics = Array.prototype.slice.call(document.querySelectorAll('.gallery .photo'));
  var at = 0;
  function openPic(i){
    at = (i + pics.length) % pics.length;
    var im = lb.querySelector('img');
    im.src = pics[at].dataset.full;
    im.alt = pics[at].querySelector('img').alt;
    if (!lb.open) { if (lb.showModal) lb.showModal(); else lb.setAttribute('open', ''); }
  }
  function closePic(){ if (lb.close) lb.close(); else lb.removeAttribute('open'); }
  if (lb) {
    pics.forEach(function(p, i){ p.addEventListener('click', function(){ openPic(i); }); });
    lb.querySelector('.lb-close').addEventListener('click', closePic);
    lb.querySelector('.lb-prev').addEventListener('click', function(){ openPic(at - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function(){ openPic(at + 1); });
    lb.addEventListener('click', function(e){ if (e.target === lb) closePic(); });
    lb.addEventListener('keydown', function(e){
      if (e.key === 'ArrowRight') openPic(at + 1);
      if (e.key === 'ArrowLeft') openPic(at - 1);
    });
    var x0 = null;
    lb.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function(e){
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) openPic(at + (dx < 0 ? 1 : -1));
    });
  }

  // Dish strip: duplicate for seamless scroll
  var track = document.querySelector('.strip-track');
  if (track && !calm) { track.innerHTML += track.innerHTML; track.querySelectorAll('img').forEach(function(im, i){ if (i >= track.children.length / 2) im.alt = ''; }); track.classList.add('moving'); }

  function whenNear(el, margin, fn){
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(); return; }
    new IntersectionObserver(function(entries, obs){
      if (entries[0].isIntersecting) { fn(); obs.disconnect(); }
    }, { rootMargin: margin }).observe(el);
  }

  // Event video
  document.querySelectorAll('.reel video').forEach(function(v){
    whenNear(v, '600px 0px', function(){ if (!v.poster) v.poster = v.dataset.poster; });
    if (!calm && !slow) whenNear(v, '0px', function(){ v.src = v.dataset.src; v.play().catch(function(){}); });
  });

  // Instagram
  var ig = document.getElementById('instagram');
  whenNear(ig, '300px 0px', function(){ ig.querySelectorAll('iframe[data-src]').forEach(function(f){ f.src = f.dataset.src; }); });
})();
