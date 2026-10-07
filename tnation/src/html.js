'use strict';
// Tiny auto-escaping template helper. Interpolated values are HTML-escaped
// unless wrapped with raw(); arrays are flattened.
class Safe {
  constructor(value) { this.value = String(value); }
  toString() { return this.value; }
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

function render(value) {
  if (value === null || value === undefined || value === false) return '';
  if (value instanceof Safe) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escape(value);
}

function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new Safe(out);
}

const raw = (s) => new Safe(s);

// JSON for <script type="application/ld+json"> blocks: escape "<" so the
// payload can never close the script element.
const jsonLd = (obj) => raw(`<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`);

module.exports = { html, raw, escape, jsonLd, Safe };
