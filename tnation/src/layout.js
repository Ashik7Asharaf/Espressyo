'use strict';
const { html, raw, jsonLd } = require('./html');
const config = require('./config');
const { NAV, JOIN, LANGS } = require('./i18n');

const SITE_NAME = 'T Nation';
const DEFAULT_DESC = "T Nation manages artists, athletes and creators from across South India — management, live shows, brand partnerships and rights & royalties. Headquartered in Bengaluru, working across Chennai, Hyderabad and Kochi.";

const navLabel = (item) => html`<span data-i18n data-en="${item.en}" data-kn="${item.kn}" data-ta="${item.ta}" data-te="${item.te}" data-ml="${item.ml}">${item.en}</span>`;

const organizationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: config.siteUrl,
  logo: `${config.siteUrl}/img/logo.png`,
  description: DEFAULT_DESC,
  email: config.contactEmail,
  address: { '@type': 'PostalAddress', addressLocality: 'Bengaluru', addressRegion: 'Karnataka', addressCountry: 'IN' },
  foundingDate: '2026',
  foundingLocation: { '@type': 'Place', name: 'Bengaluru, Karnataka, India' },
  areaServed: ['Karnataka', 'Tamil Nadu', 'Telangana', 'Andhra Pradesh', 'Kerala', 'India', 'Worldwide'],
});

function layout({ title, description = DEFAULT_DESC, path = '/', body, schema = [], ogImage = '/img/og.png', ogType = 'website', active, noindex = false, scripts = [], bodyClass = '' }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Taking South India's talent to the world`;
  const url = `${config.siteUrl}${path}`;
  const image = ogImage.startsWith('http') ? ogImage : `${config.siteUrl}${ogImage}`;
  return html`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${fullTitle}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">
${noindex ? raw('<meta name="robots" content="noindex, nofollow">') : ''}
<meta name="theme-color" content="#0a0a0a">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${fullTitle}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${fullTitle}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/img/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..900&family=Noto+Sans+Kannada:wght@500;700&family=Noto+Sans+Malayalam:wght@500;700&family=Noto+Sans+Tamil:wght@500;700&family=Noto+Sans+Telugu:wght@500;700&display=swap">
<link rel="stylesheet" href="/css/site.css">
${jsonLd(organizationLd())}
${schema.map((s) => jsonLd(s))}
<script src="/js/site.js" defer></script>
${scripts.map((s) => html`<script src="${s}" defer></script>`)}
${config.turnstile ? raw('<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>') : ''}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header" data-header>
  <div class="site-header__inner">
    <a class="logo" href="/" aria-label="T Nation home"><span class="logo__t">T</span><span class="logo__word">NATION</span></a>
    <nav class="nav" id="site-nav" aria-label="Main">
      <ul class="nav__list">
        ${NAV.map((item) => html`<li><a href="${item.href}"${active === item.key ? raw(' aria-current="page"') : ''}>${navLabel(item)}</a></li>`)}
      </ul>
      <a class="btn btn--gold nav__cta" href="${JOIN.href}">${navLabel(JOIN)}</a>
    </nav>
    <label class="lang"><span class="sr">Navigation language</span>
      <select data-lang-select>
        ${LANGS.map((l) => html`<option value="${l.code}" lang="${l.code}">${l.label}</option>`)}
      </select>
    </label>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" data-menu><span></span><span></span><span class="sr">Menu</span></button>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer__grid">
    <div>
      <a class="logo logo--lg" href="/"><span class="logo__t">T</span><span class="logo__word">NATION</span></a>
      <p class="footer__tag">Taking South India's talent to the world.</p>
      <p class="muted small">Headquartered in Bengaluru · Working across Chennai, Hyderabad and Kochi · Founded 2026</p>
    </div>
    <div>
      <h4>Company</h4>
      <ul><li><a href="/about">About &amp; team</a></li><li><a href="/join">Join T Nation</a></li><li><a href="/contact?type=press">Investors &amp; press</a></li><li><a href="/contact">Contact</a></li></ul>
    </div>
    <div>
      <h4>Business</h4>
      <ul><li><a href="/roster">Roster</a></li><li><a href="/live">Live &amp; shows</a></li><li><a href="/overseas">Overseas desk</a></li><li><a href="/brands">Brand partnerships</a></li><li><a href="/rights">Rights &amp; royalties</a></li></ul>
    </div>
    <div>
      <h4>Talk to us</h4>
      <ul><li><a href="mailto:${config.contactEmail}">${config.contactEmail}</a></li><li><a href="https://wa.me/${config.whatsappNumber}" rel="noopener" target="_blank">WhatsApp</a></li><li><a href="/privacy">Privacy policy</a></li><li><button type="button" class="linklike" data-cookie-settings>Cookie settings</button></li></ul>
    </div>
  </div>
  <div class="wrap footer__legal small muted">
    <p>© ${new Date().getFullYear()} T Nation. Content marked “placeholder” is illustrative and does not represent real clients, shows or results.</p>
  </div>
</footer>
<div class="cookie" data-cookie hidden>
  <div class="cookie__inner">
    <p><strong>Cookies.</strong> We use strictly necessary cookies to run this site (spam protection, admin sign-in, your language choice). With your consent we may also use analytics cookies to improve it. <a href="/privacy#cookies">Read more</a>.</p>
    <div class="cookie__actions">
      <button class="btn btn--ghost" type="button" data-cookie-choice="necessary">Necessary only</button>
      <button class="btn btn--gold" type="button" data-cookie-choice="all">Accept all</button>
    </div>
  </div>
</div>
</body>
</html>`;
}

module.exports = { layout, SITE_NAME, DEFAULT_DESC };
