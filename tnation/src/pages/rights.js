'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const { field, form, sectionHead } = require('../ui');

const STREAMS = [
  ['Music publishing', 'Songwriters and composers earn when their works are performed, broadcast, streamed or synced. In India, performing rights in musical works are administered through a registered copyright society; overseas income flows through partner societies.'],
  ['Sound recordings', 'Owners of recordings earn from public performance and broadcast licensing, as well as streaming and download income through distributors and labels.'],
  ['Performer rights', 'Singers and musicians have performer rights under the Copyright Act, 1957, and may be entitled to royalties when their performances are commercially exploited.'],
  ['Name, image & likeness', 'Athletes and creators license their name, image and likeness to brands. Clear terms on usage, territory, duration and exclusivity protect future value.'],
  ['Digital & content', 'Platform claims, content ID, licensing of clips and catalogue on video and social platforms — and making sure the right owner is paid.'],
];

module.exports = function rights(req, res) {
  const body = html`
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Rights &amp; Royalties</p>
    <h1 class="display display--xl">Make sure your work pays you</h1>
    <p class="lede">Music, images and content earn across many channels — at home and abroad. Unregistered works, missing splits and unchecked statements mean money left uncollected. We help talent find it.</p>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${sectionHead('Explainer', 'Where the money comes from')}
    <div class="packages">${STREAMS.map(([t, d]) => html`<article class="package reveal"><h3>${t}</h3><p>${d}</p></article>`)}</div>
    <div class="steps-inline">
      <div><span class="step__n">01</span><h3>Audit</h3><p>We map your works, recordings, contracts and registrations.</p></div>
      <div><span class="step__n">02</span><h3>Register</h3><p>Fix gaps with societies, distributors and platforms, at home and abroad.</p></div>
      <div><span class="step__n">03</span><h3>Collect &amp; review</h3><p>Track statements, query discrepancies and chase unpaid income.</p></div>
    </div>
    <p class="disclaimer disclaimer--sm">General information, not legal advice. Rights depend on your contracts and the law in each country; confirm with a qualified rights lawyer.</p>
  </div>
</section>
<section class="section section--dark" id="review">
  <div class="wrap split">
    <div>${sectionHead('Request a review', 'Free first look at your rights', 'Tell us what you have released or created and how you are currently paid. We will tell you what to check first.')}</div>
    ${form({
      id: 'rights', action: '/forms/rights', submit: 'Request a review',
      children: [
        field({ name: 'name', label: 'Name', required: true, autocomplete: 'name' }),
        field({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' }),
        field({ name: 'phone', label: 'Phone / WhatsApp', type: 'tel', autocomplete: 'tel' }),
        field({ name: 'role', label: 'I am a…', type: 'select', required: true, options: [['', 'Select'], 'Songwriter / composer', 'Singer / musician', 'Producer / label', 'Athlete', 'Creator', 'Other'] }),
        field({ name: 'catalogue', label: 'Catalogue size', type: 'select', options: [['', 'Select'], '1–10 works', '11–50 works', '51–200 works', '200+ works', 'Not applicable'] }),
        field({ name: 'societies', label: 'Current registrations / distributor', placeholder: 'e.g. none, a society, a distributor…' }),
        field({ name: 'message', label: 'What would you like reviewed?', type: 'textarea', full: true, required: true }),
      ],
    })}
  </div>
</section>`;
  res.send(String(layout({
    title: 'Rights & royalties',
    description: 'T Nation helps South Indian artists, athletes and creators register, collect and review music, performer, image and content royalties. Request a rights review.',
    path: '/rights', active: 'rights', body,
  })));
};
