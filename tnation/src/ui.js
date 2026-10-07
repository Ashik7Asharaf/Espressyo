'use strict';
const { html, raw } = require('./html');
const config = require('./config');
const { formToken, HONEYPOT } = require('./security');

const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  if (!iso) return '';
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
};

const dateParts = (iso) => {
  const d = new Date(`${String(iso).slice(0, 10)}T00:00:00Z`);
  return {
    day: d.toLocaleDateString('en-GB', { day: '2-digit', timeZone: 'UTC' }),
    month: d.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' }).toUpperCase(),
    year: d.getUTCFullYear(),
  };
};

// Editorial photography placeholder (pure CSS, no network request).
const photo = (label, { tone = 0, className = '', initials = '' } = {}) => html`
  <div class="ph ph--t${tone % 4} ${className}" role="img" aria-label="${`Photo placeholder: ${label}`}">
    ${initials ? html`<span class="ph__initials" aria-hidden="true">${initials}</span>` : ''}
    <span class="ph__label">Photo placeholder · ${label}</span>
  </div>`;

const placeholderBadge = (row) => (row && row.is_placeholder ? html`<span class="badge badge--ph">Placeholder</span>` : '');

const talentInitials = (name) => name.split(/\s+/).map((w) => (/^\d+$/.test(w) ? w : w[0])).join('').slice(0, 4).toUpperCase();

let fieldSeq = 0;
function field({ name, label, type = 'text', required = false, options, placeholder = '', value = '', autocomplete, hint, rows = 5, full = false, attrs = '' }) {
  // Unique per render so two forms on one page never share label targets.
  const id = `f-${name}-${(fieldSeq = (fieldSeq + 1) % 1e6)}`;
  const req = required ? raw(' required') : '';
  const reqMark = required ? html`<span class="req" aria-hidden="true">*</span>` : '';
  let control;
  if (type === 'select') {
    control = html`<select id="${id}" name="${name}"${req} ${raw(attrs)}>
      ${options.map((o) => {
        const [v, l] = Array.isArray(o) ? o : [o, o];
        return html`<option value="${v}"${String(v) === String(value) ? raw(' selected') : ''}>${l}</option>`;
      })}
    </select>`;
  } else if (type === 'textarea') {
    control = html`<textarea id="${id}" name="${name}" rows="${rows}" placeholder="${placeholder}"${req} ${raw(attrs)}>${value}</textarea>`;
  } else {
    control = html`<input id="${id}" name="${name}" type="${type}" value="${value}" placeholder="${placeholder}"${autocomplete ? html` autocomplete="${autocomplete}"` : ''}${req} ${raw(attrs)}>`;
  }
  return html`<div class="field${full ? ' field--full' : ''}">
    <label for="${id}">${label}${reqMark}</label>
    ${control}
    ${hint ? html`<small class="hint">${hint}</small>` : ''}
  </div>`;
}

// Hidden anti-spam fields included in every public form.
const spamFields = () => html`
  <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="${HONEYPOT}" tabindex="-1" autocomplete="off"></label></div>
  <input type="hidden" name="_ft" value="${formToken()}">
  ${config.turnstile ? html`<div class="cf-turnstile" data-sitekey="${config.turnstile.siteKey}" data-theme="dark"></div>` : ''}`;

function form({ id, action, title, intro, multipart = false, submit = 'Send', children, note }) {
  return html`<form id="${id}" class="form js-form" method="post" action="${action}"${multipart ? raw(' enctype="multipart/form-data"') : ''} novalidate>
    ${title ? html`<h3 class="form__title">${title}</h3>` : ''}
    ${intro ? html`<p class="form__intro">${intro}</p>` : ''}
    <div class="form__grid">${children}</div>
    ${spamFields()}
    <div class="form__actions">
      <button class="btn btn--gold" type="submit">${submit}</button>
      ${note ? html`<small class="form__note">${note}</small>` : ''}
    </div>
    <div class="form__status" role="status" aria-live="polite"></div>
  </form>`;
}

const sectionHead = (eyebrow, title, intro) => html`
  <header class="section__head reveal">
    ${eyebrow ? html`<p class="eyebrow">${eyebrow}</p>` : ''}
    <h2 class="display">${title}</h2>
    ${intro ? html`<p class="lede">${intro}</p>` : ''}
  </header>`;

const CATEGORY_LABELS = { artist: 'Artist', athlete: 'Athlete', creator: 'Creator' };

module.exports = { fmtDate, dateParts, photo, placeholderBadge, talentInitials, field, form, spamFields, sectionHead, CATEGORY_LABELS };
