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

(function standardizeAuthFields() {
  document.addEventListener('DOMContentLoaded', function () {
    const configs = [
      { mode: '#gamesAuthMode', input: '#gamesUser', email: '#gamesEmail', loginTab: '#gamesLoginTab', registerTab: '#gamesRegisterTab' },
      { mode: '#courseAuthMode', input: '#courseUsername', email: '#courseEmail', loginTab: '#courseTabLogin', registerTab: '#courseTabRegister' },
      { mode: '#genAuthMode', input: '#genLogin', email: '#genEmail', loginTab: '[data-mode="login"]', registerTab: '[data-mode="register"]' }
    ];

    function apply(c) {
      const modeEl = document.querySelector(c.mode);
      const input = document.querySelector(c.input);
      if (!modeEl || !input) return;
      const label = input.closest('.field')?.querySelector('label');
      const email = document.querySelector(c.email);
      const isRegister = modeEl.value === 'register';

      if (label) label.textContent = isRegister ? 'Nome de Usuário' : 'Usuário ou E-mail';
      input.placeholder = isRegister ? 'Escolha seu nome de usuário' : 'Digite seu usuário ou e-mail';
      input.autocomplete = 'username';
      if (email) {
        email.placeholder = 'Digite seu e-mail';
        email.autocomplete = 'email';
      }
    }

    configs.forEach(function (c) {
      apply(c);
      const login = document.querySelector(c.loginTab);
      const register = document.querySelector(c.registerTab);
      if (login) login.addEventListener('click', function () { setTimeout(function () { apply(c); }, 0); });
      if (register) register.addEventListener('click', function () { setTimeout(function () { apply(c); }, 0); });
    });
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
    style.textContent = '.dom-global{background:#fff;border-bottom:1px solid #e3e9ef;position:relative;z-index:45}.dom-global .dg-in{max-width:1180px;margin:auto;padding:10px 16px;display:flex;align-items:center;gap:18px}.dg-brand{font-weight:900;font-size:20px;color:#111;text-decoration:none}.dg-brand span{color:#2563eb}.dg-links{display:flex;gap:14px;align-items:center;flex:1}.dg-links a{color:#26384d;text-decoration:none;font-weight:700;font-size:14px;position:relative}.dg-links a:hover{color:#2563eb}.dg-toggle{display:none;border:1px solid #d9e2ec;background:#fff;border-radius:10px;padding:9px 11px;font-size:20px}.dg-safe{font-size:12px;font-weight:800;color:#16803b}@media(max-width:760px){.dg-toggle{display:block;margin-left:auto}.dg-links{display:none;position:absolute;left:12px;right:12px;top:58px;background:#fff;border:1px solid #dce5ee;border-radius:15px;padding:12px;box-shadow:0 14px 35px #26384d24;flex-direction:column;align-items:stretch}.dg-links.open{display:flex}.dg-links a{padding:10px;border-radius:9px}.dg-safe{display:none}}';
    document.head.appendChild(style);

    const nav = document.createElement('div');
    nav.id = 'dominaelGlobalMenu';
    nav.className = 'dom-global';
    nav.innerHTML = '<div class="dg-in"><a class="dg-brand" href="/">Domina<span>el</span></a><button class="dg-toggle" type="button" aria-label="Abrir menu" aria-expanded="false">☰</button><nav class="dg-links"><a href="/">Página inicial</a><a href="/#catalogo">Produtos</a><a href="/cursos.html">Cursos</a><a href="/geradores.html">Geradores</a><a href="/jogos.html">Jogos</a><a href="/ranking.html">Ranking</a><a href="/postagens.html" data-dom-post-link>Postagens</a><a href="/autores.html">Autores / Idealizadores</a></nav><span class="dg-safe">● Site seguro</span></div>';
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

(function universalPublicNavigationAndPostAlerts() {
  const C = window.DOMINAEL_CONFIG || {};
  const SEEN_KEY = 'dominael_last_seen_post_v1';
  let latestPostKey = '';

  function installStyles() {
    if (document.querySelector('#domUniversalNavStyles')) return;
    const style = document.createElement('style');
    style.id = 'domUniversalNavStyles';
    style.textContent = '.dom-universal-footer{border-top:1px solid #e3e9ef;background:#fff;padding:18px 16px}.dom-universal-footer .duf-in{max-width:1180px;margin:auto;display:flex;gap:10px;flex-wrap:wrap;align-items:center}.dom-universal-footer a{position:relative;text-decoration:none}.dom-post-badge{position:absolute;right:-5px;top:-6px;width:11px;height:11px;border-radius:50%;background:#e11d48;border:2px solid #fff;box-shadow:0 0 0 1px rgba(225,29,72,.18);display:none}.dom-has-new-post .dom-post-badge{display:block}.dg-links a[data-dom-post-link]{position:relative}.dg-links a[data-dom-post-link] .dom-post-badge{right:2px;top:2px}@media(min-width:761px){.dg-links a[data-dom-post-link] .dom-post-badge{right:-8px;top:-7px}}';
    document.head.appendChild(style);
  }

  function postLinkHtml(label, classes) {
    return '<a class="' + classes + '" href="/postagens.html" data-dom-post-link>📰 ' + label + '<span class="dom-post-badge" aria-label="Nova postagem"></span></a>';
  }

  function ensureBadge(link) {
    if (!link.querySelector('.dom-post-badge')) {
      const badge = document.createElement('span');
      badge.className = 'dom-post-badge';
      badge.setAttribute('aria-label', 'Nova postagem');
      link.appendChild(badge);
    }
  }

  function ensureUniversalFooter() {
    if (location.pathname.indexOf('admin') !== -1) return;
    installStyles();
    let footer = document.querySelector('#domUniversalFooterLinks');
    if (!footer) {
      footer = document.createElement('div');
      footer.id = 'domUniversalFooterLinks';
      footer.className = 'dom-universal-footer';
      footer.innerHTML = '<div class="duf-in"><a class="btn btn-light" href="/jogos.html">🎮 Jogos</a><a class="btn btn-light" href="/cursos.html">🎓 Cursos</a><a class="btn btn-light" href="/geradores.html">🛠 Geradores</a>' + postLinkHtml('Postagens','btn btn-light') + '<a class="btn btn-light" href="/informacoes.html">Informações · Segurança · Privacidade</a></div>';
      const praise = document.querySelector('#domPraise');
      if (praise && praise.parentNode) praise.parentNode.insertBefore(footer, praise);
      else document.body.appendChild(footer);
    }

    document.querySelectorAll('footer').forEach(function (existingFooter) {
      const container = existingFooter.querySelector('.container') || existingFooter;
      let actions = container.querySelector('.course-footer-actions') || container.querySelector('div[style*="flex"]');
      if (!actions) {
        actions = document.createElement('div');
        actions.className = 'course-footer-actions';
        actions.style.cssText = 'display:flex;gap:10px;flex-wrap:wrap';
        container.appendChild(actions);
      }
      const defs = [
        ['/jogos.html','🎮 Jogos'],
        ['/cursos.html','🎓 Cursos'],
        ['/geradores.html','🛠 Geradores'],
        ['/postagens.html','📰 Postagens'],
        ['/informacoes.html','Informações · Segurança · Privacidade']
      ];
      defs.forEach(function (def) {
        const exists = Array.from(actions.querySelectorAll('a')).some(function (a) {
          return (a.getAttribute('href') || '').split('?')[0] === def[0];
        });
        if (!exists) {
          const a = document.createElement('a');
          a.className = 'btn btn-light';
          a.href = def[0];
          a.textContent = def[1];
          if (def[0] === '/postagens.html') a.setAttribute('data-dom-post-link','');
          actions.appendChild(a);
        }
      });
    });

    document.querySelectorAll('a[href="/postagens.html"],a[href^="/postagens.html?"]').forEach(function (a) {
      a.setAttribute('data-dom-post-link','');
      ensureBadge(a);
    });
  }

  function setAlert(show) {
    document.querySelectorAll('[data-dom-post-link]').forEach(function (link) {
      ensureBadge(link);
      link.classList.toggle('dom-has-new-post', !!show);
      if (show) link.setAttribute('title','Há uma nova postagem');
      else link.removeAttribute('title');
    });
  }

  async function checkPosts() {
    if (!C.functionsBase || location.pathname.indexOf('admin') !== -1) return;
    try {
      const r = await fetch(C.functionsBase + '/blog-public?page=1', { cache: 'no-store' });
      if (!r.ok) return;
      const d = await r.json();
      const p = Array.isArray(d.posts) && d.posts.length ? d.posts[0] : null;
      if (!p) { setAlert(false); return; }
      latestPostKey = String(p.id || p.slug || '') + '|' + String(p.published_at || p.created_at || '');
      const onPosts = /\/postagens\.html$|\/postagem\.html$/.test(location.pathname);
      if (onPosts) {
        localStorage.setItem(SEEN_KEY, latestPostKey);
        setAlert(false);
        return;
      }
      const seen = localStorage.getItem(SEEN_KEY) || '';
      setAlert(seen !== latestPostKey);
    } catch (_) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    ensureUniversalFooter();
    checkPosts();
    setInterval(checkPosts, 300000);
  });
})();
