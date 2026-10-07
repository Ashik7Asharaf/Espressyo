'use strict';
const { html, raw } = require('../html');
const { STATUSES, STATUS_LABELS } = require('../db');

function shell({ title, body, session, csrf, active }) {
  const nav = [['/admin', 'Dashboard', 'dash'], ['/admin/talent', 'Roster', 'talent'], ['/admin/shows', 'Shows', 'shows'], ['/admin/enquiries', 'Enquiries', 'enquiries'], ['/admin/applications', 'Applications', 'applications'], ['/admin/leads', 'Calculator & plans', 'leads']];
  return html`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>${title} · T Nation admin</title>
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/css/admin.css"><script src="/js/admin.js" defer></script></head>
<body class="admin">
<header class="a-header">
  <a class="a-logo" href="/admin"><b>T</b> NATION <span>admin</span></a>
  ${session ? html`<nav class="a-nav">${nav.map(([h, l, k]) => html`<a href="${h}"${k === active ? raw(' aria-current="page"') : ''}>${l}</a>`)}</nav>
  <form method="post" action="/admin/logout" class="a-logout"><input type="hidden" name="_csrf" value="${csrf}"><span>${session.email}</span> <button>Sign out</button></form>` : ''}
</header>
<main class="a-main">${body}</main>
</body></html>`;
}

const statusSelect = (base, row, csrf) => html`<form method="post" action="${base}/${row.id}/status" class="a-status" data-autosubmit>
  <input type="hidden" name="_csrf" value="${csrf}">
  <select name="status" aria-label="Status" class="st st--${row.status}">
    ${STATUSES.map((s) => html`<option value="${s}"${s === row.status ? raw(' selected') : ''}>${STATUS_LABELS[s]}</option>`)}
  </select>
  <noscript><button>Save</button></noscript>
</form>`;

const statusFilter = (base, current, extra = '') => html`<div class="a-filters">
  <a href="${base}${extra}"${!current ? raw(' class="on"') : ''}>All</a>
  ${STATUSES.map((s) => html`<a href="${base}?status=${s}${extra.replace('?', '&')}"${s === current ? raw(' class="on"') : ''}>${STATUS_LABELS[s]}</a>`)}
</div>`;

const input = (label, name, value = '', type = 'text', attrs = '') => html`<label class="a-field"><span>${label}</span><input type="${type}" name="${name}" value="${value ?? ''}" ${raw(attrs)}></label>`;
const textarea = (label, name, value = '', hint = '') => html`<label class="a-field a-field--full"><span>${label}</span><textarea name="${name}" rows="5">${value ?? ''}</textarea>${hint ? html`<small>${hint}</small>` : ''}</label>`;
const select = (label, name, options, value) => html`<label class="a-field"><span>${label}</span><select name="${name}">${options.map(([v, l]) => html`<option value="${v}"${String(v) === String(value ?? '') ? raw(' selected') : ''}>${l}</option>`)}</select></label>`;
const check = (label, name, on) => html`<label class="a-check"><input type="checkbox" name="${name}" value="1"${on ? raw(' checked') : ''}> ${label}</label>`;

module.exports = { shell, statusSelect, statusFilter, input, textarea, select, check };
