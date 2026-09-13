window.DOMINAEL_CONFIG = {
  supabaseUrl: 'https://lzhgwhrlpydwbcglcjrj.supabase.co',
  supabasePublishableKey: 'sb_publishable_ejIeqJWG0QIktJ_kG9hfxw_womJRMwa',
  functionsBase: 'https://lzhgwhrlpydwbcglcjrj.supabase.co/functions/v1'
};

(function syncPersistentSession() {
  const KEY = 'ovo_feliz_token';
  const persistent = localStorage.getItem(KEY);
  const session = sessionStorage.getItem(KEY);
  if (persistent && !session) sessionStorage.setItem(KEY, persistent);
  if (session && !persistent) localStorage.setItem(KEY, session);
})();

(function fixAdminDescriptionField() {
  document.addEventListener('DOMContentLoaded', function () {
    const field = document.querySelector('#pDescription');
    if (!field || field.closest('.field')) return;
    const wrap = document.createElement('div');
    wrap.className = 'field';
    field.parentNode.insertBefore(wrap, field);
    wrap.appendChild(field);
  });
})();

(function userActivity() {
  const C = window.DOMINAEL_CONFIG;
  const KEY = 'ovo_feliz_token';
  let last = 0;

  async function ping(force) {
    const token = localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || '';
    if (!token) return;
    const now = Date.now();
    if (!force && now - last < 240000) return;
    last = now;
    try {
      await fetch(C.functionsBase + '/user-activity', {
        method: 'POST',
        headers: { 'x-egg-token': token },
        keepalive: true,
        cache: 'no-store'
      });
    } catch (_) {}
  }

  document.addEventListener('DOMContentLoaded', function () { ping(true); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') ping(false);
  });
  window.addEventListener('focus', function () { ping(false); });
  setInterval(function () {
    if (document.visibilityState === 'visible') ping(false);
  }, 300000);
})();

(function footerEnhancements() {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('footer .container').forEach(function (container) {
      const links = Array.from(container.querySelectorAll('a'));
      const hasGames = links.some(function (a) { return /jogos/i.test(a.textContent || ''); });
      const hasCourses = links.some(function (a) { return /cursos/i.test(a.textContent || ''); });
      const hasGenerators = links.some(function (a) { return /geradores/i.test(a.textContent || ''); });

      if (hasGames && hasCourses && !hasGenerators) {
        const generatorLink = document.createElement('a');
        generatorLink.className = 'btn btn-light';
        generatorLink.href = '/geradores.html';
        generatorLink.textContent = '🛠 Geradores';
        const info = links.find(function (a) {
          return /informaç|segurança|privacidade/i.test(a.textContent || '');
        });
        if (info && info.parentNode) info.parentNode.insertBefore(generatorLink, info);
        else container.appendChild(generatorLink);
      }
    });

    if (!document.querySelector('#domPraise')) {
      const praise = document.createElement('div');
      praise.id = 'domPraise';
      praise.textContent = 'Deus Seja Louvado Sempre!';
      praise.style.cssText = 'background:#050505;color:#fff;text-align:center;font-weight:900;padding:16px 12px;font-size:15px;letter-spacing:.02em';
      const footers = Array.from(document.querySelectorAll('footer'));
      const footer = footers.length ? footers[footers.length - 1] : null;
      if (footer && footer.parentNode) footer.parentNode.insertBefore(praise, footer.nextSibling);
      else document.body.appendChild(praise);
    }
  });
})();

(function globalMenu() {
  function install() {
    if (location.pathname.indexOf('admin') !== -1 || document.querySelector('#dominaelGlobalMenu')) return;

    const style = document.createElement('style');
    style.textContent = '.dom-global{background:#fff;border-bottom:1px solid #e3e9ef;position:relative;z-index:45}.dom-global .dg-in{max-width:1180px;margin:auto;padding:10px 16px;display:flex;align-items:center;gap:18px}.dg-brand{font-weight:900;font-size:20px;color:#111;text-decoration:none}.dg-brand span{color:#2563eb}.dg-links{display:flex;gap:14px;align-items:center;flex:1}.dg-links a{color:#26384d;text-decoration:none;font-weight:700;font-size:14px}.dg-links a:hover{color:#2563eb}.dg-toggle{display:none;border:1px solid #d9e2ec;background:#fff;border-radius:10px;padding:9px 11px;font-size:20px}.dg-safe{font-size:12px;font-weight:800;color:#16803b}@media(max-width:760px){.dg-toggle{display:block;margin-left:auto}.dg-links{display:none;position:absolute;left:12px;right:12px;top:58px;background:#fff;border:1px solid #dce5ee;border-radius:15px;padding:12px;box-shadow:0 14px 35px #26384d24;flex-direction:column;align-items:stretch}.dg-links.open{display:flex}.dg-links a{padding:10px;border-radius:9px}.dg-safe{display:none}}';
    document.head.appendChild(style);

    const nav = document.createElement('div');
    nav.id = 'dominaelGlobalMenu';
    nav.className = 'dom-global';
    nav.innerHTML = '<div class="dg-in"><a class="dg-brand" href="/">Domina<span>el</span></a><button class="dg-toggle" type="button" aria-label="Abrir menu" aria-expanded="false">☰</button><nav class="dg-links"><a href="/">Página inicial</a><a href="/#catalogo">Produtos</a><a href="/cursos.html">Cursos</a><a href="/geradores.html">Geradores</a><a href="/jogos.html">Jogos</a><a href="/ranking.html">Ranking</a><a href="/postagens.html">Postagens</a><a href="/autores.html">Autores / Idealizadores</a></nav><span class="dg-safe">● Site seguro</span></div>';
    document.body.prepend(nav);

    const toggle = nav.querySelector('.dg-toggle');
    const links = nav.querySelector('.dg-links');
    toggle.addEventListener('click', function () {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '✕' : '☰';
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });

    const categoryMenu = document.querySelector('#categoryMenu');
    if (categoryMenu) {
      const addHome = function () {
        if (!categoryMenu.querySelector('[data-home-category]')) {
          categoryMenu.insertAdjacentHTML('afterbegin', '<a data-home-category href="/">Página inicial</a>');
        }
      };
      addHome();
      new MutationObserver(addHome).observe(categoryMenu, { childList: true });
    }
  }

  document.addEventListener('DOMContentLoaded', install);
})();
