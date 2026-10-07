'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const multer = require('multer');
const config = require('./config');
const db_ = require('./db');
const { checkSpam } = require('./security');
const { notify } = require('./mail');
const { thanks, errorPage } = require('./pages/misc');
const TourCalc = require('../public/js/tour-calc');
const { TOPICS } = require('./pages/contact');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v, max = 200) => String(v ?? '').replace(/\u0000/g, '').trim().slice(0, max);
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const wantsJson = (req) => req.get('X-Requested-With') === 'fetch';

function reply(req, res, { ok, status = 200, message, title, data }) {
  if (wantsJson(req)) return res.status(ok ? 200 : status).json({ ok, message, ...data });
  if (!ok) return errorPage(req, res, status, message);
  return thanks(req, res, { title, message });
}

function validate(body, required) {
  const missing = required.filter((k) => !clean(body[k]));
  if (missing.length) return `Please fill in: ${missing.join(', ').replace(/_/g, ' ')}.`;
  if (body.email !== undefined && !EMAIL_RE.test(clean(body.email))) return 'Please enter a valid email address.';
  return null;
}

// Wrap a handler with spam protection and validation.
const guarded = (required, handler) => async (req, res, next) => {
  try {
    const spam = await checkSpam(req);
    if (!spam.ok) {
      if (req.file) fs.rm(req.file.path, { force: true }, () => {});
      // Honeypot hits get a fake success so bots learn nothing.
      if (spam.silent) return reply(req, res, { ok: true, title: 'Thank you', message: 'Your message has been received.' });
      return reply(req, res, { ok: false, status: 400, message: spam.reason });
    }
    const err = validate(req.body, required);
    if (err) {
      if (req.file) fs.rm(req.file.path, { force: true }, () => {});
      return reply(req, res, { ok: false, status: 400, message: err });
    }
    await handler(req, res);
  } catch (e) { next(e); }
};

const ENQUIRY_LABELS = { booking: 'Booking enquiry', brand: 'Brand enquiry', rights: 'Rights review request', contact: 'Contact message' };

function saveEnquiry(req, type) {
  const db = req.app.locals.db;
  const b = req.body;
  const talent = b.talent ? db.prepare('SELECT id, name FROM talent WHERE slug = ?').get(clean(b.talent)) : null;
  const details = {};
  for (const k of ['city', 'venue', 'package', 'role', 'catalogue', 'societies', 'topic']) if (clean(b[k])) details[k] = clean(b[k]);
  if (details.topic && !TOPICS.some(([t]) => t === details.topic)) details.topic = 'other';
  const row = {
    type, name: clean(b.name), email: clean(b.email).toLowerCase(), phone: clean(b.phone, 40),
    organisation: clean(b.organisation), country: clean(b.country), talent_id: talent ? talent.id : null,
    event_date: isDate(clean(b.event_date)) ? clean(b.event_date) : '', budget: clean(b.budget),
    message: clean(b.message, 5000), details: JSON.stringify(details), source_page: clean(req.get('Referer') || '', 300),
  };
  const id = db_.insert(db, 'enquiries', row);
  notify(`${ENQUIRY_LABELS[type]} #${id} from ${row.name}`, { ...row, talent: talent && talent.name, details, talent_id: undefined });
  return id;
}

const enquiry = (type, required, title) => guarded(required, (req, res) => {
  saveEnquiry(req, type);
  reply(req, res, { ok: true, title, message: 'Thank you — we have your enquiry and will reply soon, usually within two working days.' });
});

// ---- File uploads for talent applications ----------------------------------
const ALLOWED = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.mp3', '.wav', '.m4a', '.csv', '.xlsx']);
fs.mkdirSync(config.uploadDir, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadDir,
    filename: (req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: config.maxUploadMb * 1024 * 1024, files: 1, fields: 40 },
  fileFilter: (req, file, cb) => {
    const ok = ALLOWED.has(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : Object.assign(new Error('That file type is not accepted. Use PDF, image, audio, video or spreadsheet.'), { status: 400 }), ok);
  },
});
const uploadOne = (req, res, next) => upload.single('file')(req, res, (err) => {
  if (!err) return next();
  const message = err.code === 'LIMIT_FILE_SIZE' ? `File is too large (max ${config.maxUploadMb} MB). Paste a link instead.` : err.message;
  return reply(req, res, { ok: false, status: 400, message });
});

function router() {
  const r = express.Router();
  r.use(express.urlencoded({ extended: false, limit: '100kb' }));

  r.post('/booking', enquiry('booking', ['name', 'organisation', 'email', 'country', 'city', 'event_date'], 'Booking enquiry received'));
  r.post('/brand', enquiry('brand', ['name', 'organisation', 'email', 'message'], 'Brand enquiry received'));
  r.post('/rights', enquiry('rights', ['name', 'email', 'role', 'message'], 'Review request received'));
  r.post('/contact', enquiry('contact', ['name', 'email', 'message'], 'Message received'));

  r.post('/apply', uploadOne, guarded(['name', 'email', 'phone', 'category', 'city', 'genre', 'message'], (req, res) => {
    const b = req.body;
    if (b.consent !== 'yes') {
      if (req.file) fs.rm(req.file.path, { force: true }, () => {});
      return reply(req, res, { ok: false, status: 400, message: 'Please tick the consent box so we can process your application.' });
    }
    const category = ['artist', 'athlete', 'creator'].includes(b.category) ? b.category : '';
    const row = {
      name: clean(b.name), email: clean(b.email).toLowerCase(), phone: clean(b.phone, 40), category,
      city: clean(b.city), languages: clean(b.languages), genre: clean(b.genre), links: clean(b.links, 2000),
      message: clean(b.message, 5000), consent: 1, consent_at: new Date().toISOString(),
      file_path: req.file ? path.basename(req.file.path) : '', file_name: req.file ? clean(req.file.originalname, 200) : '',
      file_type: req.file ? clean(req.file.mimetype, 100) : '',
    };
    const id = db_.insert(req.app.locals.db, 'applications', row);
    notify(`Talent application #${id} — ${row.name} (${category})`, { ...row, file_path: undefined, file: row.file_name || 'none' });
    reply(req, res, { ok: true, title: 'Application received', message: 'Thank you for applying to T Nation. We review every application and will contact you if we can take it forward.' });
  }));

  r.post('/calculator', guarded(['name', 'email'], (req, res) => {
    let inputs = {};
    try { inputs = JSON.parse(String(req.body.inputs || '{}')); } catch { inputs = {}; }
    if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) inputs = {};
    const merged = { ...TourCalc.SAMPLE, ...inputs };
    const result = TourCalc.calculate(merged);
    const row = {
      kind: 'calculator', name: clean(req.body.name), email: clean(req.body.email).toLowerCase(), phone: clean(req.body.phone, 40),
      organisation: clean(req.body.organisation), destination: result.destination, shows: result.inputs.shows,
      fee_per_show: result.inputs.feePerShow, currency: result.currency, inputs: JSON.stringify(result.inputs),
      result: JSON.stringify({ gross: result.gross, noPlanning: result.noPlanning, withRelief: result.withRelief }),
    };
    const id = db_.insert(req.app.locals.db, 'calculator_leads', row);
    notify(`Calculator lead #${id} — ${row.name} (${row.destination})`, {
      name: row.name, email: row.email, phone: row.phone, organisation: row.organisation, destination: row.destination,
      gross: `${result.currency} ${result.gross}`, cash_no_planning: Math.round(result.noPlanning.cash), cash_with_relief: Math.round(result.withRelief.cash),
    });
    reply(req, res, { ok: true, title: 'Estimate saved', message: 'Thanks — we have saved your estimate and the Overseas Desk will be in touch.' });
  }));

  r.post('/plan', guarded(['destination', 'first_show_on', 'name', 'email'], (req, res) => {
    const b = req.body;
    const destination = clean(b.destination);
    const first = clean(b.first_show_on);
    if (!TourCalc.DESTINATIONS[destination] || !isDate(first)) return reply(req, res, { ok: false, status: 400, message: 'Please choose a destination and a valid first show date.' });
    const lead = TourCalc.leadTime(destination, first);
    const shows = parseInt(b.shows, 10);
    const fee = parseFloat(b.fee_per_show);
    const row = {
      kind: 'plan', name: clean(b.name), email: clean(b.email).toLowerCase(), phone: clean(b.phone, 40), organisation: clean(b.organisation),
      destination, first_show_on: first, last_show_on: isDate(clean(b.last_show_on)) ? clean(b.last_show_on) : '',
      shows: Number.isFinite(shows) && shows > 0 ? shows : null, fee_per_show: Number.isFinite(fee) && fee >= 0 ? fee : null,
      currency: clean(b.currency, 3).toUpperCase(), inputs: JSON.stringify({}), result: JSON.stringify(lead), message: clean(b.message, 3000),
    };
    const id = db_.insert(req.app.locals.db, 'calculator_leads', row);
    notify(`Overseas plan #${id} — ${row.name} → ${TourCalc.DESTINATIONS[destination].name} on ${first}`, {
      ...row, inputs: undefined, result: undefined, lead_time_status: lead.status, start_by: lead.startBy, days_available: lead.daysAvailable,
    });
    const statusText = { ok: 'You have enough lead time on current estimates.', tight: 'Your timeline is tight — start now.', late: 'There may not be enough lead time for every step — talk to us urgently.' }[lead.status];
    reply(req, res, { ok: true, title: 'Plan received', message: `Thanks — we have your overseas plan. ${statusText} Recommended start: ${lead.startBy}.`, data: { leadTime: lead } });
  }));

  return r;
}

module.exports = { router, clean };
