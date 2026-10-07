'use strict';
const path = require('node:path');
const express = require('express');
const config = require('./config');
const dbm = require('./db');
const repo = require('./repo');
const forms = require('./forms');
const admin = require('./admin/routes');
const { errorPage, privacy } = require('./pages/misc');
const roster = require('./pages/roster');

const CSP = [
  "default-src 'self'",
  `script-src 'self'${config.turnstile ? ' https://challenges.cloudflare.com' : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  'frame-src https://www.openstreetmap.org https://www.youtube-nocookie.com https://challenges.cloudflare.com',
  "connect-src 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
].join('; ');

function createApp({ db = dbm.open() } = {}) {
  const app = express();
  app.locals.db = db;
  app.disable('x-powered-by');
  const trust = process.env.TRUST_PROXY ?? 'loopback';
  // A number means "hops"; Express would read the string "1" as an IP address.
  app.set('trust proxy', /^\d+$/.test(trust) ? Number(trust) : trust);

  app.use((req, res, next) => {
    res.set({
      'Content-Security-Policy': CSP,
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'X-Frame-Options': 'DENY',
    });
    if (config.isProd) res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  app.use(express.static(path.join(__dirname, '..', 'public'), {
    maxAge: config.isProd ? '7d' : 0,
    setHeaders: (res, file) => { if (/\.(png|jpe?g|webp|svg|woff2?)$/.test(file)) res.set('Cache-Control', 'public, max-age=2592000'); },
  }));

  // ---- Public pages ---------------------------------------------------------
  app.get('/', require('./pages/home'));
  app.get('/roster', roster.list);
  app.get('/roster/:slug', roster.profile);
  app.get('/live', require('./pages/live'));
  app.get('/overseas', require('./pages/overseas'));
  app.get('/brands', require('./pages/brands'));
  app.get('/rights', require('./pages/rights'));
  app.get('/about', require('./pages/about'));
  app.get('/join', require('./pages/join'));
  app.get('/contact', require('./pages/contact'));
  app.get('/privacy', privacy);

  // ---- Forms, admin, API ----------------------------------------------------
  app.use('/forms', forms.router());
  app.use('/admin', admin.router());

  app.get('/api/shows/upcoming', (req, res) => {
    const shows = repo.upcomingShows(db, { limit: 12 }).map((s) => ({
      title: s.title, date: s.starts_on, city: s.city, country: s.country, region: s.region,
      talent: s.talent_name, talentUrl: s.talent_slug ? `/roster/${s.talent_slug}` : null, placeholder: Boolean(s.is_placeholder),
    }));
    res.set('Cache-Control', 'public, max-age=60').json({ shows });
  });

  // ---- SEO ------------------------------------------------------------------
  app.get('/robots.txt', (req, res) => res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /forms\nSitemap: ${config.siteUrl}/sitemap.xml\n`));
  app.get('/sitemap.xml', (req, res) => {
    const pages = ['/', '/roster', '/live', '/overseas', '/brands', '/rights', '/about', '/join', '/contact', '/privacy'];
    const talent = db.prepare('SELECT slug, updated_at FROM talent WHERE published = 1 AND is_placeholder = 0').all();
    const urls = [
      ...pages.map((p) => ({ loc: p, priority: p === '/' ? '1.0' : '0.8' })),
      ...talent.map((t) => ({ loc: `/roster/${t.slug}`, lastmod: t.updated_at.slice(0, 10), priority: '0.6' })),
    ];
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${esc(config.siteUrl + u.loc)}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}<priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>\n`);
  });

  app.use((req, res) => errorPage(req, res, 404));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || err.statusCode || 500;
    if (req.get('X-Requested-With') === 'fetch') return res.status(status).json({ ok: false, message: status < 500 ? err.message : 'Something went wrong. Please try again.' });
    errorPage(req, res, status, status < 500 ? err.message : undefined);
  });
  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`T Nation website on ${config.siteUrl} (port ${config.port})`);
    if (!process.env.ADMIN_PASSWORD) console.warn('ADMIN_PASSWORD not set — using the development default. Set it before deploying.');
  });
}

module.exports = { createApp };
