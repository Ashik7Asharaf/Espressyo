'use strict';
const fs = require('node:fs');
const path = require('node:path');
const nodemailer = require('nodemailer');
const config = require('./config');

const transport = config.smtp ? nodemailer.createTransport(config.smtp) : null;

// Notify the team about a form submission. Never throws: a mail outage must
// not lose the lead (it is already saved in the database). Without SMTP
// configured, the message is written to data/outbox for local development.
async function notify(subject, fields) {
  const lines = Object.entries(fields)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
  const text = `${lines.join('\n')}\n\nReview it in the admin dashboard: ${config.siteUrl}/admin`;
  const message = { from: config.mailFrom, to: config.notifyEmail, subject: `[T Nation] ${subject}`, text };
  try {
    if (transport) {
      await transport.sendMail(message);
    } else {
      fs.mkdirSync(config.outboxDir, { recursive: true });
      const file = path.join(config.outboxDir, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`);
      fs.writeFileSync(file, JSON.stringify(message, null, 2));
    }
    return true;
  } catch (err) {
    console.error('Email notification failed:', err.message);
    return false;
  }
}

module.exports = { notify };
