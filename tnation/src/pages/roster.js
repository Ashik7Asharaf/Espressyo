'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const { photo, placeholderBadge, talentInitials, CATEGORY_LABELS } = require('../ui');
const repo = require('../repo');
const { showRow, talentCard } = require('./shared');

const select = (name, label, options, value) => html`<label class="filter">
  <span>${label}</span>
  <select name="${name}" data-filter="${name}">
    <option value="">All</option>
    ${options.map(([v, l]) => html`<option value="${v}"${v === value ? html` selected` : ''}>${l}</option>`)}
  </select>
</label>`;

function list(req, res) {
  const db = req.app.locals.db;
  const q = {
    category: ['artist', 'athlete', 'creator'].includes(req.query.category) ? req.query.category : '',
    city: String(req.query.city || ''),
    language: String(req.query.language || ''),
    genre: String(req.query.genre || ''),
  };
  const talent = repo.listTalent(db, q);
  const facets = repo.talentFacets(db);

  const body = html`
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Roster</p>
    <h1 class="display display--xl">Artists, athletes &amp; creators</h1>
    <p class="lede">Filter by discipline, city, language, sport or genre. All profiles shown are placeholders until real roster entries are published.</p>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap">
    <form class="filters" method="get" action="/roster" data-filters>
      ${select('category', 'Type', Object.entries(CATEGORY_LABELS), q.category)}
      ${select('city', 'City', facets.cities.map((c) => [c, c]), q.city)}
      ${select('language', 'Language', facets.languages.map((c) => [c, c]), q.language)}
      ${select('genre', 'Sport / genre', facets.genres.map((c) => [c, c]), q.genre)}
      <noscript><button class="btn btn--gold" type="submit">Filter</button></noscript>
      <a class="btn btn--ghost btn--sm" href="/roster" data-filter-reset>Reset</a>
    </form>
    <p class="muted small" data-filter-count aria-live="polite">${talent.length} ${talent.length === 1 ? 'profile' : 'profiles'}</p>
    <div class="grid" data-grid>
      ${talent.map((t, i) => talentCard(t, i))}
    </div>
    <p class="empty" data-empty ${talent.length ? html`hidden` : ''}>No talent matches those filters yet.</p>
  </div>
</section>`;

  res.send(String(layout({
    title: 'Roster — artists, athletes and creators',
    description: 'Browse the T Nation roster of artists, athletes and creators from Kerala and Karnataka. Filter by type, city, language, sport or genre.',
    path: '/roster', active: 'roster', body,
  })));
}

const embed = (url) => {
  const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/.exec(url);
  if (yt) return html`<div class="media__frame"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}" title="Video" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
  if (/^https?:\/\//.test(url)) return html`<a class="media__link" href="${url}" rel="noopener" target="_blank">${url.replace(/^https?:\/\/(www\.)?/, '')} ↗</a>`;
  return html`<div class="media__placeholder">${url}</div>`;
};

function profile(req, res, next) {
  const db = req.app.locals.db;
  const t = repo.getTalent(db, req.params.slug);
  if (!t) return next();
  const shows = repo.upcomingShows(db, { talentId: t.id });
  const achievements = repo.lines(t.achievements);
  const media = repo.lines(t.media);
  const schema = [repo.personLd(t), ...shows.map(repo.eventLd)].filter(Boolean);

  const body = html`
<section class="profile-hero">
  <div class="profile-hero__media">
    ${t.image_url ? html`<img src="${t.image_url}" alt="${t.name}" width="1200" height="1500">` : photo(`${t.name} portrait`, { tone: t.id, initials: talentInitials(t.name) })}
  </div>
  <div class="profile-hero__content wrap">
    <p class="eyebrow">${CATEGORY_LABELS[t.category]} · ${t.genre}</p>
    <h1 class="display display--xl">${t.name}</h1>
    ${placeholderBadge(t)}
    <p class="lede">${t.headline}</p>
    <dl class="facts">
      <div><dt>Based in</dt><dd>${t.city}${t.state ? `, ${t.state}` : ''}</dd></div>
      <div><dt>Languages</dt><dd>${t.languages}</dd></div>
      <div><dt>${t.category === 'athlete' ? 'Sport' : 'Genre'}</dt><dd>${t.genre}</dd></div>
    </dl>
    <div class="hero__actions">
      <a class="btn btn--gold btn--lg" href="/live?talent=${t.slug}#booking">Book ${t.name}</a>
      <a class="btn btn--ghost btn--lg" href="/brands?talent=${t.slug}#enquiry">Brand partnership</a>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap profile-grid">
    <div>
      <h2 class="h2">Bio</h2>
      ${t.bio.split(/\n{2,}/).map((p) => html`<p>${p}</p>`)}
      <h2 class="h2">Achievements</h2>
      ${achievements.length ? html`<ul class="ticks">${achievements.map((a) => html`<li>${a}</li>`)}</ul>` : html`<p class="muted">To be added.</p>`}
    </div>
    <div>
      <h2 class="h2">Media</h2>
      <div class="media">${media.length ? media.map(embed) : html`<p class="muted">To be added.</p>`}</div>
    </div>
  </div>
</section>
<section class="section section--dark">
  <div class="wrap">
    <h2 class="h2">Upcoming dates</h2>
    ${shows.length ? html`<ul class="shows">${shows.map(showRow)}</ul>` : html`<p class="muted">No dates announced. <a href="/live?talent=${t.slug}#booking">Send a booking enquiry</a>.</p>`}
    <p><a class="btn btn--gold" href="/live?talent=${t.slug}#booking">Book</a></p>
  </div>
</section>`;

  res.send(String(layout({
    title: `${t.name} — ${CATEGORY_LABELS[t.category]}, ${t.genre}`,
    description: `${t.name}: ${t.headline}. Represented by T Nation. Bookings, brand partnerships and upcoming dates.`.slice(0, 300),
    path: `/roster/${t.slug}`, active: 'roster', body, schema, ogType: 'profile',
    ogImage: t.image_url || '/img/og.png', noindex: Boolean(t.is_placeholder),
  })));
}

module.exports = { list, profile };
