// Payerkart shared site script: mobile menu + Book a Demo modal (Web3Forms)
(function(){
  var menuBtn = document.getElementById('menuBtn');
  if (menuBtn) {
    menuBtn.addEventListener('click', function(){
      var nav = document.getElementById('mobileNav');
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var overlay = document.getElementById('demoModalOverlay');
  function openDemo(e){
    if (e) e.preventDefault();
    overlay.style.display = 'flex';
    document.getElementById('demoFormWrap').style.display = 'block';
    document.getElementById('demoFormSuccess').style.display = 'none';
    document.getElementById('demoFormError').style.display = 'none';
    document.body.style.overflow = 'hidden';
    var first = overlay.querySelector('input[name="name"]');
    if (first) first.focus();
    if (typeof gtag === 'function') { gtag('event', 'demo_modal_open', { page_path: location.pathname }); }
  }
  function closeDemo(){
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
  window.openDemoModal = openDemo;
  window.closeDemoModal = closeDemo;

  document.querySelectorAll('[data-demo]').forEach(function(el){ el.addEventListener('click', openDemo); });
  if (overlay) {
    overlay.addEventListener('click', function(e){ if (e.target === overlay) closeDemo(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeDemo(); });
  }
  if (location.hash === '#demo') openDemo();

  var form = document.getElementById('demoForm');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = document.getElementById('demoSubmitBtn');
      var errBox = document.getElementById('demoFormError');
      errBox.style.display = 'none';
      btn.disabled = true; btn.textContent = 'Sending…';
      var data = Object.fromEntries(new FormData(form).entries());
      data.page = location.pathname;
      var fail = function(msg){
        errBox.textContent = msg || 'Something went wrong. Please try again or email founders@payerkart.com.';
        errBox.style.display = 'block';
        btn.disabled = false; btn.textContent = 'Send request →';
      };
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function(r){ return r.json(); }).then(function(json){
        if (json.success) {
          document.getElementById('demoFormWrap').style.display = 'none';
          document.getElementById('demoFormSuccess').style.display = 'block';
          if (typeof gtag === 'function') { gtag('event', 'demo_request_submitted', { page_path: location.pathname }); }
          form.reset();
          btn.disabled = false; btn.textContent = 'Send request →';
        } else { fail(json.message); }
      }).catch(function(){ fail(); });
    });
  }
})();
