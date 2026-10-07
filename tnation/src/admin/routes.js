'use strict';
const path = require('node:path');
const fs = require('node:fs');
const express = require('express');
const { html } = require('../html');
const config = require('../config');
const dbm = require('../db');
const sec = require('../security');
const { toCsv } = require('../csv');
const { shell, statusSelect, statusFilter, input, textarea, select, check } = require('./views');
const TourCalc = require('../../public/js/tour-calc');

const { STATUSES, STATUS_LABELS } = dbm;
const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-').slice(0, 80) || `talent-${Date.now()}`;
const fmt = (d) => (d ? String(d).replace('T', ' ').slice(0, 16) : '');
const trunc = (s, n = 80) => (String(s || '').length > n ? `${String(s).slice(0, n)}…` : String(s || ''));

function router() {
  const r = express.Router();
  r.use(express.urlencoded({ extended: false, limit: '200kb' }));
  r.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.set('X-Robots-Tag', 'noindex, nofollow');
    req.session = sec.readSession(req);
    res.locals.csrf = req.session ? sec.csrfToken(req.session) : '';
    next();
  });
  const page = (req, res, title, body, active) => res.send(String(shell({ title, body, session: req.session, csrf: res.locals.csrf, active })));

  // ---- Auth -----------------------------------------------------------------
  r.get('/login', (req, res) => {
    if (req.session) return res.redirect('/admin');
    page(req, res, 'Sign in', html`<form class="a-card a-login" method="post" action="/admin/login">
      <h1>Sign in</h1>
      ${req.query.e ? html`<p class="a-err">Incorrect email or password, or too many attempts.</p>` : ''}
      ${input('Email', 'email', '', 'email', 'required autocomplete="username"')}
      ${input('Password', 'password', '', 'password', 'required autocomplete="current-password"')}
      <button class="a-btn">Sign in</button></form>`);
  });
  r.post('/login', (req, res) => {
    const allowed = sec.rateLimit(`login:${req.ip}`, 10, 15 * 60e3);
    if (!allowed || !sec.checkAdmin(req.body.email, req.body.password)) return res.redirect(303, '/admin/login?e=1');
    sec.createSession(res, config.adminEmail);
    res.redirect(303, '/admin');
  });

  r.use((req, res, next) => (req.session ? next() : res.redirect('/admin/login')));
  // Every state-changing admin request must carry the CSRF token.
  r.use((req, res, next) => (req.method !== 'POST' || sec.verifyCsrf(req) ? next() : res.status(403).send('Invalid CSRF token. Reload the page and try again.')));

  r.post('/logout', (req, res) => { sec.clearSession(res); res.redirect(303, '/admin/login'); });

  // ---- Dashboard ------------------------------------------------------------
  r.get('/', (req, res) => {
    const db = req.app.locals.db;
    const count = (sql) => db.prepare(sql).get().n;
    const tiles = [
      ['Roster', count('SELECT COUNT(*) n FROM talent'), '/admin/talent'],
      ['Upcoming shows', count("SELECT COUNT(*) n FROM shows WHERE starts_on >= date('now')"), '/admin/shows'],
      ['New enquiries', count("SELECT COUNT(*) n FROM enquiries WHERE status='new'"), '/admin/enquiries?status=new'],
      ['New applications', count("SELECT COUNT(*) n FROM applications WHERE status='new'"), '/admin/applications?status=new'],
      ['New calculator & plan leads', count("SELECT COUNT(*) n FROM calculator_leads WHERE status='new'"), '/admin/leads?status=new'],
      ['Placeholder rows left', count('SELECT (SELECT COUNT(*) FROM talent WHERE is_placeholder=1)+(SELECT COUNT(*) FROM shows WHERE is_placeholder=1) n'), '/admin/talent'],
    ];
    const recent = db.prepare(`SELECT 'enquiries' t, id, type AS kind, name, email, status, created_at FROM enquiries
      UNION ALL SELECT 'applications', id, category, name, email, status, created_at FROM applications
      UNION ALL SELECT 'leads', id, kind, name, email, status, created_at FROM calculator_leads
      ORDER BY created_at DESC LIMIT 10`).all();
    page(req, res, 'Dashboard', html`<h1>Dashboard</h1>
      <div class="a-tiles">${tiles.map(([l, n, h]) => html`<a class="a-tile" href="${h}"><b>${n}</b><span>${l}</span></a>`)}</div>
      <h2>Latest leads</h2>
      <table class="a-table"><thead><tr><th>When</th><th>Type</th><th>Name</th><th>Email</th><th>Status</th></tr></thead><tbody>
      ${recent.map((x) => html`<tr><td>${fmt(x.created_at)}</td><td><a href="/admin/${x.t}/${x.id}">${x.t} · ${x.kind}</a></td><td>${x.name}</td><td>${x.email}</td><td><span class="st st--${x.status}">${STATUS_LABELS[x.status]}</span></td></tr>`)}
      </tbody></table>`, 'dash');
  });

  // ---- Generic lead lists (enquiries, applications, calculator_leads) -------
  const LEADS = {
    enquiries: { table: 'enquiries', title: 'Enquiries', typeCol: 'type', types: ['booking', 'brand', 'rights', 'contact'],
      cols: ['id', 'created_at', 'type', 'status', 'name', 'email', 'phone', 'organisation', 'country', 'talent', 'event_date', 'budget', 'message', 'details', 'source_page'],
      list: (x) => [x.type, x.name, x.email, x.organisation, x.talent || '', trunc(x.message, 60)], heads: ['Type', 'Name', 'Email', 'Organisation', 'Talent', 'Message'] },
    applications: { table: 'applications', title: 'Talent applications', typeCol: 'category', types: ['artist', 'athlete', 'creator'],
      cols: ['id', 'created_at', 'status', 'name', 'email', 'phone', 'category', 'city', 'languages', 'genre', 'links', 'message', 'file_name', 'consent', 'consent_at'],
      list: (x) => [x.category, x.name, x.email, x.city, x.genre, x.file_name ? 'File ✓' : ''], heads: ['Type', 'Name', 'Email', 'City', 'Genre / sport', 'Upload'] },
    leads: { table: 'calculator_leads', title: 'Calculator & overseas plan leads', typeCol: 'kind', types: ['calculator', 'plan'],
      cols: ['id', 'created_at', 'kind', 'status', 'name', 'email', 'phone', 'organisation', 'destination', 'first_show_on', 'last_show_on', 'shows', 'fee_per_show', 'currency', 'inputs', 'result', 'message'],
      list: (x) => [x.kind, x.name, x.email, x.destination, x.first_show_on || '', x.shows ? `${x.shows} × ${x.fee_per_show ?? '?'} ${x.currency}` : ''], heads: ['Kind', 'Name', 'Email', 'Destination', 'First show', 'Shows × fee'] },
  };

  const query = (db, cfg, q) => {
    const where = []; const args = [];
    if (STATUSES.includes(q.status)) { where.push('x.status = ?'); args.push(q.status); }
    if (cfg.types.includes(q.type)) { where.push(`x.${cfg.typeCol} = ?`); args.push(q.type); }
    if (q.id) { where.push('x.id = ?'); args.push(Number(q.id)); }
    const join = cfg.table === 'enquiries' ? 'LEFT JOIN talent t ON t.id = x.talent_id' : '';
    const sel = cfg.table === 'enquiries' ? 'x.*, t.name AS talent' : 'x.*';
    return db.prepare(`SELECT ${sel} FROM ${cfg.table} x ${join} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY x.created_at DESC, x.id DESC`).all(...args);
  };

  for (const [key, cfg] of Object.entries(LEADS)) {
    const base = `/admin/${key}`; // link prefix
    const route = `/${key}`; // path inside this router (mounted at /admin)
    r.get(route, (req, res) => {
      const rows = query(req.app.locals.db, cfg, req.query);
      const qs = new URLSearchParams(Object.entries({ status: req.query.status, type: req.query.type }).filter(([, v]) => v)).toString();
      page(req, res, cfg.title, html`<div class="a-head"><h1>${cfg.title}</h1><a class="a-btn" href="${base}.csv${qs ? `?${qs}` : ''}">Export CSV</a></div>
        ${statusFilter(base, req.query.status)}
        <div class="a-filters">${cfg.types.map((t) => html`<a href="${base}?type=${t}"${req.query.type === t ? html` class="on"` : ''}>${t}</a>`)}</div>
        <div class="a-scroll"><table class="a-table"><thead><tr><th>#</th><th>Received</th>${cfg.heads.map((h) => html`<th>${h}</th>`)}<th>Status</th></tr></thead><tbody>
        ${rows.length ? rows.map((x) => html`<tr><td><a href="${base}/${x.id}">${x.id}</a></td><td>${fmt(x.created_at)}</td>${cfg.list(x).map((c, i) => html`<td>${i === 1 ? html`<a href="${base}/${x.id}">${c}</a>` : c}</td>`)}<td>${statusSelect(base, x, res.locals.csrf)}</td></tr>`) : html`<tr><td colspan="9">Nothing here yet.</td></tr>`}
        </tbody></table></div>`, key);
    });
    r.get(`${route}.csv`, (req, res) => {
      const rows = query(req.app.locals.db, cfg, req.query).map((x) => ({ ...x, status: STATUS_LABELS[x.status] || x.status }));
      res.set('Content-Type', 'text/csv; charset=utf-8');
      res.set('Content-Disposition', `attachment; filename="tnation-${key}-${new Date().toISOString().slice(0, 10)}.csv"`);
      res.send(toCsv(rows, cfg.cols));
    });
    r.get(`${route}/:id`, (req, res, next) => {
      const db = req.app.locals.db;
      const [x] = query(db, cfg, { id: req.params.id });
      if (!x) return next();
      const pretty = (v) => { try { const o = JSON.parse(v); return typeof o === 'object' ? JSON.stringify(o, null, 2) : v; } catch { return v; } };
      page(req, res, `${cfg.title} #${x.id}`, html`<p><a href="${base}">← ${cfg.title}</a></p>
        <div class="a-head"><h1>#${x.id} · ${x.name}</h1>${statusSelect(base, x, res.locals.csrf)}</div>
        <dl class="a-dl">${cfg.cols.filter((c) => x[c] !== '' && x[c] !== null && x[c] !== undefined).map((c) => html`<dt>${c.replace(/_/g, ' ')}</dt><dd>${['inputs', 'result', 'details'].includes(c) ? html`<pre>${pretty(x[c])}</pre>` : c === 'status' ? STATUS_LABELS[x[c]] : String(x[c])}</dd>`)}</dl>
        ${key === 'applications' && x.file_path ? html`<p><a class="a-btn" href="${base}/${x.id}/file">Download ${x.file_name}</a></p>` : ''}
        ${key === 'leads' && x.kind === 'plan' && TourCalc.DESTINATIONS[x.destination] ? html`<p>Destination guide: ${TourCalc.DESTINATIONS[x.destination].reliefRoute}</p>` : ''}
        <p><a class="a-btn a-btn--ghost" href="mailto:${x.email}">Reply by email</a></p>`, key);
    });
    r.post(`${route}/:id/status`, (req, res) => {
      if (STATUSES.includes(req.body.status)) dbm.update(req.app.locals.db, cfg.table, Number(req.params.id), { status: req.body.status });
      res.redirect(303, req.get('Referer') && new URL(req.get('Referer'), config.siteUrl).pathname.startsWith('/admin') ? req.get('Referer') : base);
    });
  }

  r.get('/applications/:id/file', (req, res, next) => {
    const x = req.app.locals.db.prepare('SELECT file_path, file_name FROM applications WHERE id = ?').get(Number(req.params.id));
    if (!x || !x.file_path) return next();
    const file = path.join(config.uploadDir, path.basename(x.file_path));
    if (!fs.existsSync(file)) return next();
    res.download(file, x.file_name || x.file_path);
  });

  // ---- Roster CRUD -----------------------------------------------------------
  const TALENT_FIELDS = ['name', 'slug', 'category', 'city', 'state', 'languages', 'genre', 'headline', 'bio', 'achievements', 'media', 'image_url', 'sort_order'];
  const talentForm = (t, csrf) => html`<form class="a-card a-form" method="post" action="/admin/talent/${t.id || 'new'}">
    <input type="hidden" name="_csrf" value="${csrf}">
    ${input('Name', 'name', t.name, 'text', 'required')}
    ${input('URL slug', 'slug', t.slug, 'text', 'placeholder="auto from name"')}
    ${select('Type', 'category', [['artist', 'Artist'], ['athlete', 'Athlete'], ['creator', 'Creator']], t.category)}
    ${input('Sport / genre', 'genre', t.genre)}
    ${input('City', 'city', t.city)}
    ${input('State', 'state', t.state)}
    ${input('Languages (comma-separated)', 'languages', t.languages)}
    ${input('Image URL', 'image_url', t.image_url, 'text', 'placeholder="/img/talent/name.jpg or https://…"')}
    ${input('Sort order', 'sort_order', t.sort_order ?? 0, 'number')}
    ${input('Headline', 'headline', t.headline)}
    ${textarea('Bio', 'bio', t.bio, 'Blank line between paragraphs.')}
    ${textarea('Achievements', 'achievements', t.achievements, 'One per line. Verified facts only.')}
    ${textarea('Media links', 'media', t.media, 'One URL per line. YouTube links embed automatically.')}
    <div class="a-checks">${check('Published', 'published', t.published ?? 1)} ${check('Featured on home page', 'featured', t.featured)} ${check('Placeholder (shows badge, hides schema, noindex)', 'is_placeholder', t.is_placeholder)}</div>
    <button class="a-btn">Save</button>
  </form>`;

  r.get('/talent', (req, res) => {
    const rows = req.app.locals.db.prepare('SELECT * FROM talent ORDER BY sort_order, name').all();
    page(req, res, 'Roster', html`<div class="a-head"><h1>Roster</h1><span><a class="a-btn a-btn--ghost" href="/admin/talent.csv">Export CSV</a> <a class="a-btn" href="/admin/talent/new">Add talent</a></span></div>
      <div class="a-scroll"><table class="a-table"><thead><tr><th>Name</th><th>Type</th><th>Genre / sport</th><th>City</th><th>Flags</th><th></th></tr></thead><tbody>
      ${rows.map((t) => html`<tr><td><a href="/admin/talent/${t.id}">${t.name}</a></td><td>${t.category}</td><td>${t.genre}</td><td>${t.city}</td>
        <td>${t.published ? '' : html`<span class="st">Hidden</span> `}${t.featured ? html`<span class="st st--signed">Featured</span> ` : ''}${t.is_placeholder ? html`<span class="st st--in_review">Placeholder</span>` : ''}</td>
        <td><a href="/roster/${t.slug}" target="_blank">View ↗</a></td></tr>`)}
      </tbody></table></div>`, 'talent');
  });
  r.get('/talent.csv', (req, res) => {
    res.set('Content-Type', 'text/csv; charset=utf-8').set('Content-Disposition', 'attachment; filename="tnation-roster.csv"');
    res.send(toCsv(req.app.locals.db.prepare('SELECT * FROM talent ORDER BY sort_order, name').all()));
  });
  r.get('/talent/new', (req, res) => page(req, res, 'Add talent', html`<p><a href="/admin/talent">← Roster</a></p><h1>Add talent</h1>${talentForm({ category: 'artist', published: 1 }, res.locals.csrf)}`, 'talent'));
  r.get('/talent/:id', (req, res, next) => {
    const t = req.app.locals.db.prepare('SELECT * FROM talent WHERE id = ?').get(Number(req.params.id));
    if (!t) return next();
    page(req, res, t.name, html`<p><a href="/admin/talent">← Roster</a></p><h1>${t.name}</h1>${talentForm(t, res.locals.csrf)}
      <form method="post" action="/admin/talent/${t.id}/delete" data-confirm="Delete ${t.name}? This cannot be undone."><input type="hidden" name="_csrf" value="${res.locals.csrf}"><button class="a-btn a-btn--danger">Delete</button></form>`, 'talent');
  });
  r.post('/talent/:id', (req, res) => {
    const db = req.app.locals.db;
    const b = req.body;
    const row = {};
    for (const f of TALENT_FIELDS) row[f] = String(b[f] ?? '').trim();
    row.slug = slugify(row.slug || row.name);
    row.category = ['artist', 'athlete', 'creator'].includes(row.category) ? row.category : 'artist';
    row.sort_order = Number(row.sort_order) || 0;
    if (row.image_url && !/^(https?:\/\/|\/)/.test(row.image_url)) row.image_url = '';
    for (const f of ['published', 'featured', 'is_placeholder']) row[f] = b[f] ? 1 : 0;
    if (!row.name) return res.status(400).send('Name is required.');
    try {
      if (req.params.id === 'new') {
        const id = dbm.insert(db, 'talent', row);
        return res.redirect(303, `/admin/talent/${id}`);
      }
      dbm.update(db, 'talent', Number(req.params.id), row);
      res.redirect(303, `/admin/talent/${req.params.id}`);
    } catch (e) {
      if (/UNIQUE/.test(e.message)) return res.status(400).send('That URL slug is already used by another profile. Go back and change it.');
      throw e;
    }
  });
  r.post('/talent/:id/delete', (req, res) => {
    req.app.locals.db.prepare('DELETE FROM talent WHERE id = ?').run(Number(req.params.id));
    res.redirect(303, '/admin/talent');
  });

  // ---- Shows CRUD -----------------------------------------------------------
  const SHOW_FIELDS = ['title', 'talent_id', 'starts_on', 'venue', 'city', 'country', 'region', 'status', 'ticket_url', 'description'];
  const showForm = (s, talent, csrf) => html`<form class="a-card a-form" method="post" action="/admin/shows/${s.id || 'new'}">
    <input type="hidden" name="_csrf" value="${csrf}">
    ${input('Title', 'title', s.title, 'text', 'required')}
    ${select('Talent', 'talent_id', [['', '—'], ...talent.map((t) => [t.id, t.name])], s.talent_id)}
    ${input('Date', 'starts_on', s.starts_on, 'date', 'required')}
    ${input('Venue', 'venue', s.venue)}
    ${input('City', 'city', s.city)}
    ${input('Country', 'country', s.country ?? 'India')}
    ${select('Region', 'region', [['india', 'India'], ['overseas', 'Overseas']], s.region)}
    ${select('Status', 'status', [['announced', 'Announced'], ['on-sale', 'On sale'], ['sold-out', 'Sold out'], ['tbc', 'TBC']], s.status)}
    ${input('Ticket URL', 'ticket_url', s.ticket_url, 'url')}
    ${textarea('Description', 'description', s.description)}
    <div class="a-checks">${check('Published', 'published', s.published ?? 1)} ${check('Placeholder (badge, no schema)', 'is_placeholder', s.is_placeholder)}</div>
    <button class="a-btn">Save</button>
  </form>`;

  r.get('/shows', (req, res) => {
    const rows = req.app.locals.db.prepare('SELECT s.*, t.name talent FROM shows s LEFT JOIN talent t ON t.id = s.talent_id ORDER BY s.starts_on DESC').all();
    page(req, res, 'Shows', html`<div class="a-head"><h1>Shows</h1><span><a class="a-btn a-btn--ghost" href="/admin/shows.csv">Export CSV</a> <a class="a-btn" href="/admin/shows/new">Add show</a></span></div>
      <div class="a-scroll"><table class="a-table"><thead><tr><th>Date</th><th>Title</th><th>Talent</th><th>City</th><th>Region</th><th>Status</th><th>Flags</th></tr></thead><tbody>
      ${rows.map((s) => html`<tr><td>${s.starts_on}</td><td><a href="/admin/shows/${s.id}">${s.title}</a></td><td>${s.talent || ''}</td><td>${s.city}, ${s.country}</td><td>${s.region}</td><td>${s.status}</td>
        <td>${s.published ? '' : html`<span class="st">Hidden</span> `}${s.is_placeholder ? html`<span class="st st--in_review">Placeholder</span>` : ''}</td></tr>`)}
      </tbody></table></div>`, 'shows');
  });
  r.get('/shows.csv', (req, res) => {
    res.set('Content-Type', 'text/csv; charset=utf-8').set('Content-Disposition', 'attachment; filename="tnation-shows.csv"');
    res.send(toCsv(req.app.locals.db.prepare('SELECT s.*, t.name talent FROM shows s LEFT JOIN talent t ON t.id = s.talent_id ORDER BY s.starts_on').all()));
  });
  const talentOptions = (db) => db.prepare('SELECT id, name FROM talent ORDER BY name').all();
  r.get('/shows/new', (req, res) => page(req, res, 'Add show', html`<p><a href="/admin/shows">← Shows</a></p><h1>Add show</h1>${showForm({ region: 'india', status: 'announced', published: 1 }, talentOptions(req.app.locals.db), res.locals.csrf)}`, 'shows'));
  r.get('/shows/:id', (req, res, next) => {
    const db = req.app.locals.db;
    const s = db.prepare('SELECT * FROM shows WHERE id = ?').get(Number(req.params.id));
    if (!s) return next();
    page(req, res, s.title, html`<p><a href="/admin/shows">← Shows</a></p><h1>${s.title}</h1>${showForm(s, talentOptions(db), res.locals.csrf)}
      <form method="post" action="/admin/shows/${s.id}/delete" data-confirm="Delete this show?"><input type="hidden" name="_csrf" value="${res.locals.csrf}"><button class="a-btn a-btn--danger">Delete</button></form>`, 'shows');
  });
  r.post('/shows/:id', (req, res) => {
    const db = req.app.locals.db;
    const row = {};
    for (const f of SHOW_FIELDS) row[f] = String(req.body[f] ?? '').trim();
    row.talent_id = row.talent_id ? Number(row.talent_id) : null;
    row.region = row.region === 'overseas' ? 'overseas' : 'india';
    if (!['announced', 'on-sale', 'sold-out', 'tbc'].includes(row.status)) row.status = 'announced';
    if (row.ticket_url && !/^https?:\/\//.test(row.ticket_url)) row.ticket_url = '';
    for (const f of ['published', 'is_placeholder']) row[f] = req.body[f] ? 1 : 0;
    if (!row.title || !/^\d{4}-\d{2}-\d{2}$/.test(row.starts_on)) return res.status(400).send('Title and a valid date are required.');
    if (req.params.id === 'new') return res.redirect(303, `/admin/shows/${dbm.insert(db, 'shows', row)}`);
    dbm.update(db, 'shows', Number(req.params.id), row);
    res.redirect(303, `/admin/shows/${req.params.id}`);
  });
  r.post('/shows/:id/delete', (req, res) => {
    req.app.locals.db.prepare('DELETE FROM shows WHERE id = ?').run(Number(req.params.id));
    res.redirect(303, '/admin/shows');
  });

  return r;
}

module.exports = { router };
