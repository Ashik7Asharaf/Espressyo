'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const { field, form, sectionHead, photo } = require('../ui');
const repo = require('../repo');

const PACKAGES = [
  { name: 'Ambassador', text: 'Long-term face of a brand: campaign shoots, social content, appearances and usage rights over an agreed term.', items: ['6–12 month term', 'Campaign + social + appearances', 'Exclusivity options'] },
  { name: 'Content series', text: 'A run of native content made with the talent for their channels and yours — in Kannada, Tamil, Telugu, Malayalam, English or more.', items: ['Multi-post / multi-video', 'Whitelisting & paid usage', 'Regional language versions'] },
  { name: 'Live activation', text: 'Talent at your launch, store, campus, festival or corporate event — or a branded show built around them.', items: ['Appearances & performances', 'Meet-and-greets', 'India and overseas'] },
  { name: 'Sport partnership', text: 'Kit, equipment and performance brands working with athletes on and off the field, with clear image-rights terms.', items: ['Equipment & apparel', 'Image-rights licensing', 'Grassroots programmes'] },
];

module.exports = function brands(req, res) {
  const db = req.app.locals.db;
  const talent = repo.listTalent(db);
  const body = html`
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Brand Partnerships</p>
    <h1 class="display display--xl">Partnerships with real cultural reach</h1>
    <p class="lede">Connect with audiences across Karnataka, Tamil Nadu, Telangana, Andhra Pradesh, Kerala and the South Indian diaspora through artists, athletes and creators who speak their language — literally.</p>
    <div class="hero__actions"><a class="btn btn--gold" href="#enquiry">Start a brand enquiry</a></div>
  </div>
</section>
<section class="section">
  <div class="wrap">
    ${sectionHead('Packages', 'Ways to work together', 'Every package is scoped to the brief. Pricing on request.')}
    <div class="packages">
      ${PACKAGES.map((p) => html`<article class="package reveal"><h3>${p.name}</h3><p>${p.text}</p><ul class="ticks">${p.items.map((i) => html`<li>${i}</li>`)}</ul></article>`)}
    </div>
  </div>
</section>
<section class="section section--dark">
  <div class="wrap">
    ${sectionHead('Case studies', 'Selected work', 'Placeholders — real case studies will be published only with client approval.')}
    <div class="cases">
      ${[1, 2, 3].map((n) => html`<article class="case reveal">
        ${photo(`Case study ${n}`, { tone: n })}
        <p class="eyebrow">Placeholder case study ${n}</p>
        <h3>Brand × talent — campaign title</h3>
        <p class="muted">Brief, idea, execution and results go here once approved. No figures are shown until verified.</p>
      </article>`)}
    </div>
  </div>
</section>
<section class="section" id="enquiry">
  <div class="wrap split">
    <div>${sectionHead('Brand enquiry', "Tell us what you're building", 'Share the brief and budget range; we will propose talent and a package.')}</div>
    ${form({
      id: 'brand', action: '/forms/brand', submit: 'Send brand enquiry',
      children: [
        field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name' }),
        field({ name: 'organisation', label: 'Brand / agency', required: true, autocomplete: 'organization' }),
        field({ name: 'email', label: 'Work email', type: 'email', required: true, autocomplete: 'email' }),
        field({ name: 'phone', label: 'Phone / WhatsApp', type: 'tel', autocomplete: 'tel' }),
        field({ name: 'package', label: 'Package', type: 'select', options: [['', 'Not sure yet'], ...PACKAGES.map((p) => p.name)] }),
        field({ name: 'talent', label: 'Talent of interest', type: 'select', value: String(req.query.talent || ''), options: [['', 'Open to suggestions'], ...talent.map((t) => [t.slug, `${t.name} — ${t.genre}${t.is_placeholder ? ' (placeholder)' : ''}`])] }),
        field({ name: 'country', label: 'Markets', placeholder: 'e.g. Tamil Nadu, Kerala, UAE' }),
        field({ name: 'budget', label: 'Budget range', placeholder: 'e.g. ₹10–20 lakh' }),
        field({ name: 'event_date', label: 'Campaign start', type: 'date' }),
        field({ name: 'message', label: 'Brief', type: 'textarea', full: true, required: true }),
      ],
    })}
  </div>
</section>`;
  res.send(String(layout({
    title: 'Brand partnerships',
    description: 'Brand partnerships with South Indian artists, athletes and creators: ambassador deals, content series, live activations and sport partnerships. Send a brand enquiry to T Nation.',
    path: '/brands', active: 'brands', body,
  })));
};
