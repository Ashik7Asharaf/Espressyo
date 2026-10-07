'use strict';
const crypto = require('node:crypto');
const config = require('./config');

const hmac = (value) => crypto.createHmac('sha256', config.sessionSecret).update(value).digest('base64url');
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

// ---- Admin session: signed, expiring cookie --------------------------------
const SESSION_COOKIE = 'tn_admin';
const SESSION_HOURS = 12;

function createSession(res, email) {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + SESSION_HOURS * 3600e3, n: crypto.randomBytes(8).toString('hex') })).toString('base64url');
  res.cookie(SESSION_COOKIE, `${payload}.${hmac(payload)}`, {
    httpOnly: true, sameSite: 'lax', secure: config.isProd, path: '/', maxAge: SESSION_HOURS * 3600e3,
  });
}

function readSession(req) {
  const value = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!value) return null;
  const [payload, sig] = value.split('.');
  if (!payload || !sig || !safeEqual(sig, hmac(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp < Date.now()) return null;
    data.token = value;
    return data;
  } catch { return null; }
}

function clearSession(res) { res.clearCookie(SESSION_COOKIE, { path: '/' }); }

const csrfToken = (session) => hmac(`csrf:${session.token}`);
function verifyCsrf(req) {
  return Boolean(req.session && req.body && safeEqual(req.body._csrf || '', csrfToken(req.session)));
}

// Admin password: compare scrypt hashes so timing doesn't leak the password.
const ADMIN_HASH = crypto.scryptSync(config.adminPassword, 'tn-admin', 32);
function checkAdmin(email, password) {
  const emailOk = safeEqual(String(email || '').trim().toLowerCase(), config.adminEmail.toLowerCase());
  const passOk = crypto.timingSafeEqual(crypto.scryptSync(String(password || ''), 'tn-admin', 32), ADMIN_HASH);
  return emailOk && passOk;
}

// ---- Rate limiting (in-memory, per IP and bucket) ---------------------------
const buckets = new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) for (const [k, v] of buckets) if (now - v[v.length - 1] > windowMs) buckets.delete(k);
  return hits.length <= limit;
}

// ---- Spam protection for public forms --------------------------------------
// 1. Honeypot field that humans never see.  2. Signed render timestamp so
// instant bot posts are rejected.  3. Per-IP rate limit.  4. Link-stuffing
// check.  5. Optional Cloudflare Turnstile when keys are configured.
const HONEYPOT = 'website_url';
function formToken() {
  const ts = String(Date.now());
  return `${ts}.${hmac(`form:${ts}`)}`;
}

async function checkSpam(req) {
  const body = req.body || {};
  if (body[HONEYPOT]) return { ok: false, silent: true, reason: 'honeypot' };

  const [ts, sig] = String(body._ft || '').split('.');
  if (!ts || !sig || !safeEqual(sig, hmac(`form:${ts}`))) return { ok: false, reason: 'Your form session expired. Please reload the page and try again.' };
  const age = (Date.now() - Number(ts)) / 1000;
  if (age < config.formMinSeconds) return { ok: false, reason: 'That was quick! Please wait a moment and submit again.' };
  if (age > 60 * 60 * 24) return { ok: false, reason: 'Your form session expired. Please reload the page and try again.' };

  if (!rateLimit(`form:${req.ip}`, 8, 10 * 60e3)) return { ok: false, reason: 'Too many submissions. Please try again in a few minutes.' };

  const text = Object.values(body).filter((v) => typeof v === 'string').join(' ');
  if ((text.match(/https?:\/\//gi) || []).length > 8) return { ok: false, reason: 'Too many links in your message.' };

  if (config.turnstile) {
    const token = body['cf-turnstile-response'];
    if (!token) return { ok: false, reason: 'Please complete the verification check.' };
    try {
      const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: config.turnstile.secret, response: token, remoteip: req.ip }),
      });
      const data = await r.json();
      if (!data.success) return { ok: false, reason: 'Verification failed. Please try again.' };
    } catch {
      return { ok: false, reason: 'Verification service unavailable. Please try again shortly.' };
    }
  }
  return { ok: true };
}

module.exports = {
  parseCookies, createSession, readSession, clearSession, csrfToken, verifyCsrf, checkAdmin,
  rateLimit, formToken, checkSpam, HONEYPOT,
};
