'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const { field, form, sectionHead } = require('../ui');
const repo = require('../repo');
const { showRow } = require('./shared');

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Other EU country', 'UAE', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain', 'Singapore', 'Malaysia', 'New Zealand', 'Other'];

function bookingForm(db, selectedSlug = '') {
  const talent = repo.listTalent(db);
  return form({
    id: 'booking', action: '/forms/booking', submit: 'Send booking enquiry',
    title: 'Booking enquiry for promoters',
    intro: 'Tell us about your event. We reply to every complete enquiry, usually within two working days.',
    note: 'By submitting you agree to our privacy policy.',
    children: [
      field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name' }),
      field({ name: 'organisation', label: 'Promoter / company', required: true, autocomplete: 'organization' }),
      field({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' }),
      field({ name: 'phone', label: 'Phone / WhatsApp', type: 'tel', autocomplete: 'tel' }),
      field({ name: 'talent', label: 'Talent requested', type: 'select', value: selectedSlug, options: [['', 'Not sure yet'], ...talent.map((t) => [t.slug, `${t.name} — ${t.genre}${t.is_placeholder ? ' (placeholder)' : ''}`])] }),
      field({ name: 'country', label: 'Event country', type: 'select', required: true, options: [['', 'Select'], ...COUNTRIES] }),
      field({ name: 'city', label: 'City', required: true }),
      field({ name: 'event_date', label: 'Proposed date', type: 'date', required: true }),
      field({ name: 'venue', label: 'Venue & capacity', placeholder: 'e.g. Indoor arena, 3,000' }),
      field({ name: 'budget', label: 'Fee budget & currency', placeholder: 'e.g. USD 25,000 all-in' }),
      field({ name: 'message', label: 'Anything else?', type: 'textarea', full: true, placeholder: 'Event format, set length, other artists, travel and hospitality offered…' }),
    ],
  });
}

module.exports = function live(req, res) {
  const db = req.app.locals.db;
  const india = repo.upcomingShows(db, { region: 'india' });
  const overseas = repo.upcomingShows(db, { region: 'overseas' });
  const schema = [...india, ...overseas].map(repo.eventLd).filter(Boolean);

  const body = html`
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Live &amp; Shows</p>
    <h1 class="display display--xl">On stage, at home and overseas</h1>
    <p class="lede">Concerts, club nights, festivals, appearances and diaspora tours. Promoters can enquire about any talent on the roster below.</p>
    <div class="hero__actions"><a class="btn btn--gold" href="#booking">Booking enquiry</a><a class="btn btn--ghost" href="/overseas">Booking from overseas?</a></div>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap">
    <div class="tabs" role="tablist" data-tabs>
      <button role="tab" aria-selected="true" data-tab="all">All dates</button>
      <button role="tab" aria-selected="false" data-tab="india">India (${india.length})</button>
      <button role="tab" aria-selected="false" data-tab="overseas">Overseas (${overseas.length})</button>
    </div>
    <h2 class="h2">India</h2>
    <ul class="shows" data-tab-panel="india">${india.length ? india.map(showRow) : html`<li class="muted">No India dates announced yet.</li>`}</ul>
    <h2 class="h2">Overseas</h2>
    <ul class="shows" data-tab-panel="overseas">${overseas.length ? overseas.map(showRow) : html`<li class="muted">No overseas dates announced yet.</li>`}</ul>
  </div>
</section>
<section class="section section--dark" id="booking-section">
  <div class="wrap split">
    <div>
      ${sectionHead('Promoters', 'Book T Nation talent', 'Club nights to festivals, campus shows to diaspora tours. Share the basics and we will come back with availability and a quote.')}
      <ul class="ticks">
        <li>One contract, one point of contact</li>
        <li>Clear riders, hospitality and technical requirements</li>
        <li>Overseas bookings handled end to end by our <a href="/overseas">Overseas Desk</a></li>
      </ul>
    </div>
    ${bookingForm(db, String(req.query.talent || ''))}
  </div>
</section>`;

  res.send(String(layout({
    title: 'Live & Shows — upcoming dates and bookings',
    description: 'Upcoming T Nation shows in India and overseas, and a booking enquiry form for promoters who want to book South Indian artists, athletes and creators.',
    path: '/live', active: 'live', body, schema,
  })));
};
module.exports.COUNTRIES = COUNTRIES;
