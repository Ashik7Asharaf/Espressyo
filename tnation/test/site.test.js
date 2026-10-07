'use strict';
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tnation-test-'));
Object.assign(process.env, {
  DATA_DIR: tmp, FORM_MIN_SECONDS: '0', ADMIN_EMAIL: 'admin@test.local', ADMIN_PASSWORD: 'secret-pass',
  SESSION_SECRET: 'test-secret', SITE_URL: 'https://tnation.test',
});

const TourCalc = require('../public/js/tour-calc');
const { createApp } = require('../src/server');
const dbm = require('../src/db');

let base; let server; let db;
test.before(async () => {
  db = dbm.open(':memory:');
  server = createApp({ db }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => { server.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

const get = (p, opts) => fetch(base + p, { redirect: 'manual', ...opts });
async function formToken(page = '/contact') {
  const html = await (await get(page)).text();
  return html.match(/name="_ft" value="([^"]+)"/)[1];
}
async function post(p, fields, { json = true, cookie } = {}) {
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (json) headers['X-Requested-With'] = 'fetch';
  if (cookie) headers.Cookie = cookie;
  return fetch(base + p, { method: 'POST', redirect: 'manual', headers, body: new URLSearchParams(fields) });
}

// ---- Calculator --------------------------------------------------------------
test('sample case: ~9.5% with no planning, ~24% with planning', () => {
  const r = TourCalc.calculate(TourCalc.SAMPLE);
  assert.equal(r.gross, 180000);
  assert.equal(r.noPlanning.foreignTax, 54000);
  assert.ok(Math.abs(r.noPlanning.cashPct - 9.5) < 0.1, `no planning ${r.noPlanning.cashPct}`);
  assert.ok(Math.abs(r.withRelief.cashPct - 24) < 0.5, `with relief ${r.withRelief.cashPct}`);
  assert.ok(r.reliefGain > 0);
});

test('calculator handles zero/invalid input without NaN', () => {
  const r = TourCalc.calculate({ destination: 'XX', shows: 'abc', feePerShow: '' });
  assert.equal(r.destination, 'US');
  assert.equal(r.gross, 0);
  assert.equal(r.noPlanning.cashPct, 0);
  assert.ok(Number.isFinite(r.withRelief.cash));
});

test('UAE has no withholding so relief adds nothing', () => {
  const r = TourCalc.calculate({ ...TourCalc.SAMPLE, destination: 'AE' });
  assert.equal(r.noPlanning.foreignTax, 0);
  assert.equal(r.reliefGain, 0);
});

test('lead time: US needs ~12 months, CWA 45 days, UK relief 60-90 days', () => {
  const us = TourCalc.leadTime('US', '2027-10-01', '2026-10-01');
  assert.equal(us.daysNeeded, 365);
  assert.equal(us.status, 'ok');
  assert.ok(us.items.some((i) => /CWA/.test(i.label) && i.maxDays === 45));
  assert.equal(TourCalc.leadTime('US', '2027-03-01', '2026-10-01').status, 'late');
  const uk = TourCalc.leadTime('UK', '2026-12-15', '2026-10-01');
  const relief = uk.items.find((i) => /HMRC/.test(i.label));
  assert.deepEqual([relief.minDays, relief.maxDays], [60, 90]);
  assert.equal(relief.status, 'tight');
  assert.equal(TourCalc.DESTINATIONS.DE.reliefLead.max, 90);
});

// ---- Pages & SEO -------------------------------------------------------------
test('all public pages render with title, description and OG tags', async () => {
  for (const p of ['/', '/roster', '/roster/artist-01', '/live', '/overseas', '/brands', '/rights', '/about', '/join', '/contact', '/privacy']) {
    const res = await get(p);
    assert.equal(res.status, 200, p);
    const html = await res.text();
    assert.match(html, /<title>[^<]*T Nation/, p);
    assert.match(html, /<meta name="description" content="[^"]{40,}"/, p);
    assert.match(html, /property="og:image" content="https:\/\/tnation\.test\/img\/og\.png"/, p);
    assert.match(html, /data-ml="ഹോം"/, p);
    assert.match(html, /"@type":"Organization"/, p);
    assert.ok(res.headers.get('content-security-policy'));
  }
});

test('home has tagline, four business lines, carousel, live strip and join button', async () => {
  const html = await (await get('/')).text();
  assert.match(html, /Taking South India.s talent <em>to the world<\/em>/);
  for (const l of ['Management', 'Live &amp; Shows', 'Brand Partnerships', 'Rights &amp; Royalties']) assert.ok(html.includes(l), l);
  assert.match(html, /data-carousel/);
  assert.match(html, /data-endpoint="\/api\/shows\/upcoming"/);
  assert.match(html, /href="\/join">Join T Nation/);
});

test('overseas page shows the required disclaimer, guide table and forms', async () => {
  const html = await (await get('/overseas')).text();
  assert.ok(html.includes('Illustrative estimates. Tax, GST, FEMA and visa rules change; confirm with a chartered accountant or lawyer before any booking.'));
  for (const d of ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany / EU', 'UAE']) assert.ok(html.includes(`<th scope="row">${d}</th>`), d);
  assert.match(html, /\$17,100/);
  assert.match(html, /9\.5%/);
  assert.match(html, /23\.9%/);
  assert.match(html, /id="plan"/);
  assert.match(html, /T Nation signs as agent only/);
});

test('roster filters work server-side', async () => {
  const html = await (await get('/roster?category=athlete')).text();
  assert.equal((html.match(/class="card reveal"/g) || []).length, 3);
  const kn = await (await get('/roster?language=Kannada')).text();
  assert.ok((kn.match(/class="card reveal"/g) || []).length >= 3);
  assert.ok(!kn.includes('data-category="athlete" data-city="Kozhikode"'));
});

test('placeholder talent: badge, noindex, no Person schema; real talent gets schema', async () => {
  const ph = await (await get('/roster/artist-01')).text();
  assert.match(ph, /badge--ph/);
  assert.match(ph, /noindex/);
  assert.ok(!ph.includes('"@type":"Person"'));
  const id = dbm.insert(db, 'talent', { slug: 'real-artist', name: 'Real Artist', category: 'artist', city: 'Kochi', genre: 'Jazz', languages: 'Malayalam' });
  dbm.insert(db, 'shows', { title: 'Real Show', talent_id: id, starts_on: '2099-01-01', city: 'Kochi', country: 'India' });
  const real = await (await get('/roster/real-artist')).text();
  assert.match(real, /"@type":"Person"/);
  assert.match(real, /"@type":"Event"/);
  const sitemap = await (await get('/sitemap.xml')).text();
  assert.match(sitemap, /<loc>https:\/\/tnation\.test\/roster\/real-artist<\/loc>/);
  assert.ok(!sitemap.includes('/roster/artist-01'));
  assert.match(await (await get('/robots.txt')).text(), /Sitemap: https:\/\/tnation\.test\/sitemap\.xml/);
});

test('upcoming shows API returns future shows', async () => {
  const { shows } = await (await get('/api/shows/upcoming')).json();
  assert.ok(shows.length > 0);
  assert.ok(shows.every((s) => s.date >= new Date().toISOString().slice(0, 10)));
});

// ---- Forms & spam protection -------------------------------------------------
test('booking enquiry is stored and an email notification is written', async () => {
  const before = fs.existsSync(path.join(tmp, 'outbox')) ? fs.readdirSync(path.join(tmp, 'outbox')).length : 0;
  const res = await post('/forms/booking', { _ft: await formToken('/live'), name: 'Promoter', organisation: 'Promo Co', email: 'p@example.com', country: 'UAE', city: 'Dubai', event_date: '2027-02-01', talent: 'artist-01' });
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
  const row = db.prepare("SELECT * FROM enquiries WHERE type = 'booking' ORDER BY id DESC").get();
  assert.equal(row.email, 'p@example.com');
  assert.equal(row.status, 'new');
  assert.ok(row.talent_id);
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(fs.readdirSync(path.join(tmp, 'outbox')).length, before + 1);
});

test('spam: honeypot is silently dropped, missing token and bad email are rejected', async () => {
  const n = () => db.prepare('SELECT COUNT(*) n FROM enquiries').get().n;
  const start = n();
  const hp = await post('/forms/contact', { _ft: await formToken(), name: 'Bot', email: 'b@x.com', message: 'hi', website_url: 'http://spam' });
  assert.equal((await hp.json()).ok, true);
  assert.equal(n(), start);
  const noToken = await post('/forms/contact', { name: 'A', email: 'a@x.com', message: 'hi' });
  assert.equal(noToken.status, 400);
  const bad = await post('/forms/contact', { _ft: await formToken(), name: 'A', email: 'nope', message: 'hi' });
  assert.equal(bad.status, 400);
  assert.equal(n(), start);
});

test('non-JS form posts get a thank-you page', async () => {
  const res = await post('/forms/contact', { _ft: await formToken(), name: 'A', email: 'a@x.com', message: 'Hello' }, { json: false });
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Message received/);
});

test('talent application requires consent and stores the uploaded file', async () => {
  const ft = await formToken('/join');
  const fields = { _ft: ft, name: 'Singer', email: 's@example.com', phone: '9999999999', category: 'artist', city: 'Kochi', genre: 'Pop', message: 'Hi' };
  const fd = (withConsent, file) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(fields)) f.append(k, v);
    if (withConsent) f.append('consent', 'yes');
    if (file) f.append('file', new Blob(['%PDF-1.4 test']), file);
    return f;
  };
  const h = { 'X-Requested-With': 'fetch' };
  const no = await fetch(`${base}/forms/apply`, { method: 'POST', headers: h, body: fd(false, 'cv.pdf') });
  assert.equal(no.status, 400);
  const badType = await fetch(`${base}/forms/apply`, { method: 'POST', headers: h, body: fd(true, 'run.exe') });
  assert.equal(badType.status, 400);
  const ok = await fetch(`${base}/forms/apply`, { method: 'POST', headers: h, body: fd(true, 'portfolio.pdf') });
  assert.equal(ok.status, 200);
  const row = db.prepare('SELECT * FROM applications ORDER BY id DESC').get();
  assert.equal(row.consent, 1);
  assert.equal(row.file_name, 'portfolio.pdf');
  assert.ok(fs.existsSync(path.join(tmp, 'uploads', row.file_path)));
  assert.equal(fs.readdirSync(path.join(tmp, 'uploads')).length, 1, 'rejected uploads are cleaned up');
});

test('calculator and plan leads are saved with server-side results', async () => {
  const calc = await post('/forms/calculator', { _ft: await formToken('/overseas'), name: 'Mgr', email: 'm@example.com', inputs: JSON.stringify(TourCalc.SAMPLE) });
  assert.equal(calc.status, 200);
  const c = db.prepare("SELECT * FROM calculator_leads WHERE kind = 'calculator'").get();
  assert.equal(JSON.parse(c.result).noPlanning.cash, 17100);
  const plan = await post('/forms/plan', { _ft: await formToken('/overseas'), name: 'Mgr', email: 'm@example.com', destination: 'US', first_show_on: '2027-01-15', shows: '6', fee_per_show: '30000', currency: 'USD' });
  const body = await plan.json();
  assert.equal(body.ok, true);
  assert.equal(body.leadTime.daysNeeded, 365);
  assert.equal(db.prepare("SELECT COUNT(*) n FROM calculator_leads WHERE kind = 'plan'").get().n, 1);
});

// ---- Admin -------------------------------------------------------------------
async function login() {
  const res = await post('/admin/login', { email: 'admin@test.local', password: 'secret-pass' }, { json: false });
  assert.equal(res.status, 303);
  const cookie = res.headers.get('set-cookie').split(';')[0];
  const html = await (await get('/admin/enquiries', { headers: { Cookie: cookie } })).text();
  return { cookie, csrf: html.match(/name="_csrf" value="([^"]+)"/)[1] };
}

test('admin requires login and rejects wrong passwords', async () => {
  for (const p of ['/admin', '/admin/enquiries', '/admin/enquiries.csv', '/admin/talent']) {
    const res = await get(p);
    assert.equal(res.status, 302, p);
    assert.equal(res.headers.get('location'), '/admin/login');
  }
  const bad = await post('/admin/login', { email: 'admin@test.local', password: 'wrong' }, { json: false });
  assert.equal(bad.headers.get('location'), '/admin/login?e=1');
});

test('admin: status dropdown updates lead; CSRF enforced; CSV export', async () => {
  const { cookie, csrf } = await login();
  const id = db.prepare('SELECT id FROM enquiries ORDER BY id LIMIT 1').get().id;
  const forged = await post(`/admin/enquiries/${id}/status`, { status: 'signed' }, { json: false, cookie });
  assert.equal(forged.status, 403);
  const ok = await post(`/admin/enquiries/${id}/status`, { status: 'in_review', _csrf: csrf }, { json: false, cookie });
  assert.equal(ok.status, 303);
  assert.equal(db.prepare('SELECT status FROM enquiries WHERE id = ?').get(id).status, 'in_review');

  const csv = await get('/admin/enquiries.csv', { headers: { Cookie: cookie } });
  assert.match(csv.headers.get('content-type'), /text\/csv/);
  const text = await csv.text();
  assert.match(text, /^﻿?id,created_at,type,status/);
  assert.match(text, /In review/);
  for (const p of ['/admin/applications.csv', '/admin/leads.csv', '/admin/talent.csv', '/admin/shows.csv']) {
    assert.equal((await get(p, { headers: { Cookie: cookie } })).status, 200, p);
  }
  const appId = db.prepare('SELECT id FROM applications LIMIT 1').get().id;
  const file = await get(`/admin/applications/${appId}/file`, { headers: { Cookie: cookie } });
  assert.equal(file.status, 200);
});

test('admin: create, edit and delete talent and shows', async () => {
  const { cookie, csrf } = await login();
  const res = await post('/admin/talent/new', { _csrf: csrf, name: 'New Athlete', category: 'athlete', city: 'Mysuru', genre: 'Kabaddi', languages: 'Kannada', published: '1' }, { json: false, cookie });
  assert.equal(res.status, 303);
  const t = db.prepare("SELECT * FROM talent WHERE slug = 'new-athlete'").get();
  assert.equal(t.category, 'athlete');
  assert.equal((await get('/roster/new-athlete')).status, 200);
  await post(`/admin/talent/${t.id}`, { _csrf: csrf, name: 'New Athlete', slug: 'new-athlete', category: 'athlete', genre: 'Kabaddi' }, { json: false, cookie });
  assert.equal((await get('/roster/new-athlete')).status, 404, 'unpublished profile is hidden');

  const s = await post('/admin/shows/new', { _csrf: csrf, title: 'Admin Show', starts_on: '2099-05-05', city: 'Doha', country: 'Qatar', region: 'overseas', talent_id: String(t.id), published: '1' }, { json: false, cookie });
  assert.equal(s.status, 303);
  const showId = Number(s.headers.get('location').split('/').pop());
  assert.match(await (await get('/live')).text(), /Admin Show/);
  await post(`/admin/shows/${showId}/delete`, { _csrf: csrf }, { json: false, cookie });
  await post(`/admin/talent/${t.id}/delete`, { _csrf: csrf }, { json: false, cookie });
  assert.equal(db.prepare('SELECT COUNT(*) n FROM shows WHERE id = ?').get(showId).n, 0);
});

test('CSV export neutralises spreadsheet formulas', () => {
  const { toCsv } = require('../src/csv');
  const out = toCsv([{ a: '=HYPERLINK("x")', b: 'plain, text' }]);
  assert.match(out, /'=HYPERLINK/);
  assert.match(out, /"plain, text"/);
});

test('output is HTML-escaped', async () => {
  dbm.insert(db, 'talent', { slug: 'xss', name: '<script>alert(1)</script>', category: 'creator' });
  const html = await (await get('/roster/xss')).text();
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
});
