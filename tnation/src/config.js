'use strict';
const path = require('node:path');
const crypto = require('node:crypto');

const env = process.env;
const isProd = env.NODE_ENV === 'production';
const dataDir = path.resolve(env.DATA_DIR || path.join(__dirname, '..', 'data'));

function required(name, devDefault) {
  if (env[name]) return env[name];
  if (isProd) throw new Error(`Missing required environment variable ${name}`);
  return typeof devDefault === 'function' ? devDefault() : devDefault;
}

module.exports = {
  isProd,
  port: Number(env.PORT || 3000),
  siteUrl: (env.SITE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  dataDir,
  dbFile: env.DB_FILE || path.join(dataDir, 'tnation.db'),
  uploadDir: path.join(dataDir, 'uploads'),
  outboxDir: path.join(dataDir, 'outbox'),
  sessionSecret: required('SESSION_SECRET', () => crypto.randomBytes(32).toString('hex')),
  adminEmail: required('ADMIN_EMAIL', 'admin@tnation.local'),
  adminPassword: required('ADMIN_PASSWORD', 'change-me-now'),
  // Placeholder contact details — replace before launch.
  contactEmail: env.CONTACT_EMAIL || 'hello@tnation.example',
  whatsappNumber: env.WHATSAPP_NUMBER || '910000000000',
  notifyEmail: env.NOTIFY_EMAIL || env.CONTACT_EMAIL || 'hello@tnation.example',
  smtp: env.SMTP_HOST
    ? {
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT || 587),
        secure: env.SMTP_SECURE === 'true',
        auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      }
    : null,
  mailFrom: env.MAIL_FROM || 'T Nation website <no-reply@tnation.example>',
  turnstile: env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY
    ? { siteKey: env.TURNSTILE_SITE_KEY, secret: env.TURNSTILE_SECRET_KEY }
    : null,
  // Minimum seconds between a form being rendered and submitted (bot check).
  formMinSeconds: Number(env.FORM_MIN_SECONDS ?? 3),
  maxUploadMb: Number(env.MAX_UPLOAD_MB || 25),
};
