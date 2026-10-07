'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const { photo, sectionHead } = require('../ui');
const repo = require('../repo');
const { showRow, talentCard } = require('./shared');

const LINES = [
  { n: '01', title: 'Management', href: '/roster', text: 'Career strategy, scheduling, contracts and the team around the talent — built for artists, athletes and creators from Kerala and Karnataka.' },
  { n: '02', title: 'Live & Shows', href: '/live', text: 'Booking, touring and show delivery across India and overseas, from club dates to stadium nights and diaspora tours.' },
  { n: '03', title: 'Brand Partnerships', href: '/brands', text: 'Endorsements, campaigns and content partnerships that fit the talent — and land with South Indian audiences at home and abroad.' },
  { n: '04', title: 'Rights & Royalties', href: '/rights', text: 'Registrations, collections and statement reviews, so music, image and content rights earn what they should.' },
];

const AUDIENCES = [
  { title: 'Talent', text: 'Artists, athletes and creators looking for representation.', href: '/join', cta: 'Apply to join' },
  { title: 'Brands & promoters', text: 'Book a show or build a partnership with our roster.', href: '/brands', cta: 'Partner with us' },
  { title: 'Overseas promoters', text: 'Bring South Indian talent to your city, end to end.', href: '/overseas', cta: 'Visit the Overseas Desk' },
  { title: 'Investors & press', text: 'Company information, interviews and media requests.', href: '/contact?type=press', cta: 'Get in touch' },
];

module.exports = function home(req, res) {
  const db = req.app.locals.db;
  const featured = repo.listTalent(db, { featured: true });
  const shows = repo.upcomingShows(db, { limit: 12 });

  const body = html`
<section class="hero">
  <div class="hero__media" aria-hidden="true">${photo('Hero — full-bleed editorial portrait', { tone: 0, className: 'hero__ph' })}</div>
  <div class="wrap hero__content">
    <p class="eyebrow reveal">Artists · Athletes · Creators — Bengaluru · Kerala · Karnataka</p>
    <h1 class="hero__title reveal">Taking South India's talent <em>to the world</em></h1>
    <p class="lede reveal">T Nation manages talent from South India across four business lines — management, live and shows, brand partnerships, and rights and royalties — at home and on overseas stages.</p>
    <div class="hero__actions reveal">
      <a class="btn btn--gold btn--lg" href="/join">Join T Nation</a>
      <a class="btn btn--ghost btn--lg" href="/roster">Explore the roster</a>
    </div>
  </div>
</section>

<section class="ticker" aria-label="Upcoming shows">
  <div class="ticker__label"><span class="live-dot" aria-hidden="true"></span>Upcoming shows</div>
  <div class="ticker__viewport">
    <ul class="ticker__track" data-ticker data-endpoint="/api/shows/upcoming">
      ${shows.length ? shows.map((s) => html`<li><a href="/live"><strong>${s.starts_on}</strong> ${s.talent_name || s.title} — ${s.city}, ${s.country}${s.is_placeholder ? ' (placeholder)' : ''}</a></li>`) : html`<li>New dates coming soon</li>`}
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead('What we do', 'Four business lines. One team.', 'Everything a South Indian artist, athlete or creator needs to build a career that travels.')}
    <div class="lines">
      ${LINES.map((l) => html`<a class="line reveal" href="${l.href}">
        <span class="line__n">${l.n}</span>
        <h3 class="line__title">${l.title}</h3>
        <p>${l.text}</p>
        <span class="line__more" aria-hidden="true">→</span>
      </a>`)}
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap">
    <div class="carousel__head">
      ${sectionHead('Featured talent', 'The roster', 'Placeholder profiles shown until real roster entries are added in the admin dashboard.')}
      <div class="carousel__ctrl">
        <button class="icon-btn" type="button" data-carousel-prev aria-label="Previous">←</button>
        <button class="icon-btn" type="button" data-carousel-next aria-label="Next">→</button>
      </div>
    </div>
    <div class="carousel" data-carousel tabindex="0" aria-label="Featured talent">
      ${featured.map((t, i) => talentCard(t, i))}
    </div>
    <p class="center"><a class="btn btn--ghost" href="/roster">See the full roster</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead('On stage', 'Upcoming shows', 'India and overseas dates. Listings refresh automatically.')}
    <ul class="shows" data-shows-live>${shows.slice(0, 6).map(showRow)}</ul>
    <p class="center"><a class="btn btn--ghost" href="/live">All shows &amp; booking</a></p>
  </div>
</section>

<section class="section section--accent">
  <div class="wrap">
    ${sectionHead('Start here', 'Who are you?')}
    <div class="audiences">
      ${AUDIENCES.map((a) => html`<a class="audience reveal" href="${a.href}"><h3>${a.title}</h3><p>${a.text}</p><span class="audience__cta">${a.cta} →</span></a>`)}
    </div>
  </div>
</section>

<section class="section cta-band">
  <div class="wrap cta-band__inner reveal">
    <h2 class="display">Built in Bengaluru.<br>Made for the world stage.</h2>
    <a class="btn btn--gold btn--lg" href="/join">Join T Nation</a>
  </div>
</section>`;

  res.send(String(layout({ path: '/', active: 'home', body })));
};
