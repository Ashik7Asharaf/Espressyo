'use strict';
const { html } = require('../html');
const { fmtDate, dateParts, placeholderBadge, photo, talentInitials, CATEGORY_LABELS } = require('../ui');

const showRow = (s) => {
  const d = dateParts(s.starts_on);
  return html`<li class="show reveal" data-region="${s.region}">
    <time class="show__date" datetime="${s.starts_on}"><span class="show__day">${d.day}</span><span class="show__month">${d.month} ${d.year}</span></time>
    <div class="show__body">
      <p class="show__title">${s.title} ${placeholderBadge(s)}</p>
      <p class="show__meta">${s.talent_name ? html`<a href="/roster/${s.talent_slug}">${s.talent_name}</a> · ` : ''}${s.venue} · ${s.city}, ${s.country}</p>
    </div>
    <span class="tag tag--${s.region}">${s.region === 'overseas' ? 'Overseas' : 'India'}</span>
    ${s.ticket_url ? html`<a class="btn btn--sm btn--gold" href="${s.ticket_url}" rel="noopener" target="_blank">Tickets</a>` : html`<span class="show__status">${s.status === 'sold-out' ? 'Sold out' : s.status === 'tbc' ? 'TBC' : 'Announced'}</span>`}
  </li>`;
};

const talentCard = (t, i = 0) => html`<article class="card reveal" data-category="${t.category}" data-city="${t.city}" data-languages="${t.languages}" data-genre="${t.genre}">
  <a class="card__link" href="/roster/${t.slug}">
    ${t.image_url
      ? html`<img class="card__img" src="${t.image_url}" alt="${t.name}" loading="lazy" width="600" height="750">`
      : photo(t.name, { tone: i, className: 'card__img', initials: talentInitials(t.name) })}
    <div class="card__body">
      <p class="eyebrow">${CATEGORY_LABELS[t.category]} · ${t.genre}</p>
      <h3 class="card__title">${t.name} ${placeholderBadge(t)}</h3>
      <p class="card__meta">${t.city} · ${t.languages}</p>
    </div>
  </a>
</article>`;

module.exports = { showRow, talentCard, fmtDate };
