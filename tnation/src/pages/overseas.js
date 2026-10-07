'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const { field, form, sectionHead, fmtDate } = require('../ui');
const TourCalc = require('../../public/js/tour-calc');

const DISCLAIMER = 'Illustrative estimates. Tax, GST, FEMA and visa rules change; confirm with a chartered accountant or lawyer before any booking.';

const money = (n, currency) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(n) + 0);
const pct = (n) => `${n.toFixed(1)}%`;

const STEPS = [
  ['Offer & due diligence', 'We check the promoter, venue, ticketing and funding before anything is signed.'],
  ['Contract', 'Deposit terms, a withholding clause, defined costs, cancellation and visa-failure terms. T Nation signs as agent only.'],
  ['Tax relief filing', 'Where the destination withholds tax on gross fees, we line up advisers to file for relief before the tour (CWA, waiver or exemption certificate).'],
  ['Visas & entry', 'Petitions, sponsorship and appointments started early enough — up to about 12 months ahead for the US.'],
  ['Logistics', 'Band and crew, flights, freight, ground transport, hospitality and insurance, budgeted against the deal.'],
  ['Show day & settlement', 'Advance, show-day management and settlement against the contract, with withholding documented.'],
  ['After the tour', 'Foreign tax paperwork, foreign tax credit claims in India and repatriation of fees under FEMA, with your CA.'],
];

const CHECKLIST = [
  ['Deposit before travel', 'A meaningful deposit (often 50%) received in cleared funds before visas are filed or flights are booked; balance before the artist goes on stage.'],
  ['Withholding clause', 'Who files for relief, who bears withholding, and a commitment to hand over withholding certificates so tax credit can be claimed in India.'],
  ['Defined costs', 'Flights, visas, accommodation, ground transport, backline, freight and per diems listed — and who pays each.'],
  ['Cancellation & visa-failure terms', 'What happens if the show is cancelled, or a visa is refused or delayed through no fault of the artist. Deposit should remain protected.'],
  ['Insurance', 'Public liability at the venue, travel and medical insurance for the touring party, and cancellation / non-appearance cover where available.'],
  ['Promoter due diligence', 'Company registration, track record, venue contract, ticketing account and references checked before signing.'],
  ['T Nation signs as agent only', 'The engagement contract is between the artist (or their company) and the promoter. T Nation signs as agent, not as principal.'],
];

function calculatorForm(sample) {
  const opt = Object.entries(TourCalc.DESTINATIONS).map(([k, d]) => [k, `${d.name} (${d.currency})`]);
  const r = TourCalc.calculate(sample);
  const c = r.currency;
  const rows = [
    ['Gross fees', 'gross', r.gross, r.gross],
    ['Withholding / foreign tax', 'foreignTax', -r.noPlanning.foreignTax, -r.withRelief.foreignTax],
    ['Commission', 'commission', -r.commission, -r.commission],
    ['Band & ground costs', 'band', -r.inputs.bandGroundCosts, -r.inputs.bandGroundCosts],
    ['Visa & travel costs', 'visa', -r.inputs.visaTravelCosts, -r.inputs.visaTravelCosts],
    ['Relief filing & adviser costs', 'reliefCost', -r.noPlanning.reliefCost, -r.withRelief.reliefCost],
    ['Indian tax top-up after foreign tax credit', 'indiaTopUp', -r.noPlanning.indiaTopUp, -r.withRelief.indiaTopUp],
  ];
  return html`
<div class="calc" data-calc>
  <form class="calc__inputs" data-calc-form>
    ${field({ name: 'destination', label: 'Destination country', type: 'select', options: opt, value: sample.destination })}
    <div class="calc__row">
      ${field({ name: 'shows', label: 'Number of shows', type: 'number', value: sample.shows, attrs: 'min="1" max="100" step="1" inputmode="numeric"' })}
      ${field({ name: 'feePerShow', label: 'Fee per show', type: 'number', value: sample.feePerShow, attrs: 'min="0" step="500" inputmode="decimal"' })}
    </div>
    ${field({ name: 'commissionPct', label: 'Commission %', type: 'number', value: sample.commissionPct, attrs: 'min="0" max="100" step="0.5" inputmode="decimal"', hint: 'Agency / management commission on gross fees.' })}
    ${field({ name: 'bandGroundCosts', label: 'Band & ground costs (total)', type: 'number', value: sample.bandGroundCosts, attrs: 'min="0" step="100" inputmode="decimal"', hint: 'Musicians, crew, backline, local transport, hotels, per diems.' })}
    ${field({ name: 'visaTravelCosts', label: 'Visa & travel costs (total)', type: 'number', value: sample.visaTravelCosts, attrs: 'min="0" step="100" inputmode="decimal"', hint: 'Petitions, visa fees, legal, flights, excess baggage, freight.' })}
    <details class="calc__adv">
      <summary>Advanced assumptions</summary>
      ${field({ name: 'indiaRatePct', label: 'Indian effective tax rate on net income %', type: 'number', value: (TourCalc.INDIA_RATE * 100).toFixed(2), attrs: 'min="0" max="60" step="0.01"', hint: 'Default 35.88% = 30% slab + 15% surcharge + 4% cess. Depends on regime and income.' })}
      ${field({ name: 'reliefCost', label: 'Relief filing & adviser costs', type: 'number', value: '', placeholder: 'Default for destination', attrs: 'min="0" step="100"' })}
    </details>
    <div class="calc__btns">
      <button type="button" class="btn btn--ghost btn--sm" data-calc-sample>Load sample case (US$180,000, six US shows)</button>
    </div>
    <p class="hint" data-calc-dest>${TourCalc.DESTINATIONS[sample.destination].withholding}</p>
  </form>

  <div class="calc__results" aria-live="polite">
    <table class="calc__table">
      <thead><tr><th scope="col"><span class="sr">Line item</span></th><th scope="col">No planning</th><th scope="col">With relief filed</th></tr></thead>
      <tbody>
        ${rows.map(([label, key, a, b]) => html`<tr><th scope="row">${label}</th><td data-out="no.${key}">${money(a, c)}</td><td data-out="yes.${key}">${money(b, c)}</td></tr>`)}
      </tbody>
      <tfoot>
        <tr class="calc__total"><th scope="row">Estimated cash to artist</th><td data-out="no.cash">${money(r.noPlanning.cash, c)}</td><td data-out="yes.cash">${money(r.withRelief.cash, c)}</td></tr>
        <tr><th scope="row">Share of gross</th><td data-out="no.pct">${pct(r.noPlanning.cashPct)}</td><td data-out="yes.pct">${pct(r.withRelief.cashPct)}</td></tr>
      </tfoot>
    </table>
    <div class="bars" aria-hidden="true">
      <div class="bars__row"><span>No planning</span><div class="bars__track"><div class="bars__fill bars__fill--no" data-bar="no"></div></div><b data-out="no.pct2">${pct(r.noPlanning.cashPct)}</b></div>
      <div class="bars__row"><span>With relief</span><div class="bars__track"><div class="bars__fill bars__fill--yes" data-bar="yes"></div></div><b data-out="yes.pct2">${pct(r.withRelief.cashPct)}</b></div>
    </div>
    <p class="calc__gain">Effect of filing for withholding relief: <strong data-out="gain">${money(r.reliefGain, c)}</strong> more to the artist.</p>
    <p class="hint" data-out="unrelieved-note">Without relief, about <strong data-out="no.unrelieved">${money(r.noPlanning.unrelievedForeignTax, c)}</strong> of foreign tax exceeds the Indian tax on this income and cannot be credited in India unless refunded abroad.</p>
    <p class="disclaimer disclaimer--sm">${DISCLAIMER} Not tax advice. GST and FEMA effects are not modelled.</p>
  </div>
</div>`;
}

function emailEstimateForm() {
  return form({
    id: 'calc-lead', action: '/forms/calculator', submit: 'Email me this estimate',
    title: 'Want us to review these numbers?',
    intro: 'We save the inputs above with your enquiry and a member of the Overseas Desk will follow up.',
    children: [
      field({ name: 'name', label: 'Name', required: true, autocomplete: 'name' }),
      field({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' }),
      field({ name: 'organisation', label: 'Artist / company', autocomplete: 'organization' }),
      field({ name: 'phone', label: 'Phone / WhatsApp', type: 'tel', autocomplete: 'tel' }),
      html`<input type="hidden" name="inputs" value="" data-calc-inputs>`,
    ],
  });
}

function planForm() {
  const opt = [['', 'Select'], ...Object.entries(TourCalc.DESTINATIONS).map(([k, d]) => [k, d.name])];
  return form({
    id: 'plan', action: '/forms/plan', submit: 'Send my overseas plan',
    title: 'Plan your overseas show',
    intro: 'Pick a destination and dates to see the lead time you need. Send it to us and we will build the timeline with you.',
    children: [
      field({ name: 'destination', label: 'Destination', type: 'select', required: true, options: opt, attrs: 'data-plan-dest' }),
      field({ name: 'first_show_on', label: 'First show date', type: 'date', required: true, attrs: 'data-plan-date' }),
      field({ name: 'last_show_on', label: 'Last show date', type: 'date' }),
      field({ name: 'shows', label: 'Number of shows', type: 'number', attrs: 'min="1" max="100"' }),
      field({ name: 'fee_per_show', label: 'Fee per show', type: 'number', attrs: 'min="0" step="100"' }),
      field({ name: 'currency', label: 'Currency', type: 'select', options: ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'AED', 'INR'] }),
      html`<div class="field field--full"><div class="leadtime" data-plan-out aria-live="polite"><p class="muted">Select a destination and first show date to see the lead time.</p></div></div>`,
      field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name' }),
      field({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' }),
      field({ name: 'organisation', label: 'Artist / promoter / company', autocomplete: 'organization' }),
      field({ name: 'phone', label: 'Phone / WhatsApp', type: 'tel', autocomplete: 'tel' }),
      field({ name: 'message', label: 'Notes', type: 'textarea', full: true, rows: 3, placeholder: 'Cities, venues, promoter, who is travelling…' }),
    ],
  });
}

module.exports = function overseas(req, res) {
  const sample = TourCalc.calculate(TourCalc.SAMPLE);
  const D = TourCalc.DESTINATIONS;

  const body = html`
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Overseas Desk</p>
    <h1 class="display display--xl">Overseas shows, handled end to end</h1>
    <p class="lede">For artists and athletes performing or competing abroad, and for overseas promoters booking Indian talent. Contracts, tax relief, visas, logistics and settlement — planned months ahead, not days.</p>
    <div class="disclaimer" role="note"><strong>Important:</strong> ${DISCLAIMER}</div>
  </div>
</section>

<section class="section section--tight">
  <div class="wrap">
    ${sectionHead('How it works', 'From offer to settlement')}
    <ol class="steps">${STEPS.map(([t, d], i) => html`<li class="step reveal"><span class="step__n">${String(i + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></li>`)}</ol>
  </div>
</section>

<section class="section section--dark" id="calculator">
  <div class="wrap">
    ${sectionHead('Tour Net-Cash Calculator', 'What actually reaches the artist?', 'Withholding is usually taken from gross fees, before any costs. Filing for relief moves it to a net basis. Change the inputs to see the difference.')}
    ${calculatorForm(TourCalc.SAMPLE)}
    <div class="calc__lead">${emailEstimateForm()}</div>
  </div>
</section>

<section class="section">
  <div class="wrap split split--top">
    <div>
      ${sectionHead('Sample case', 'US$180,000 over six US shows')}
      <p>Six shows at US$30,000 each, 20% commission, US$48,000 band and ground costs and US$24,900 visa and travel costs.</p>
      <ul class="ticks">
        <li><strong>No planning:</strong> 30% (${money(sample.noPlanning.foreignTax, 'USD')}) is withheld from the gross. After commission and costs the artist keeps about <strong>${money(sample.noPlanning.cash, 'USD')} — ${pct(sample.noPlanning.cashPct)} of gross</strong>.</li>
        <li><strong>With planning:</strong> a central withholding agreement moves US tax to a net basis. After Indian tax, foreign tax credit and adviser costs the artist keeps about <strong>${money(sample.withRelief.cash, 'USD')} — ${pct(sample.withRelief.cashPct)} of gross</strong>.</li>
      </ul>
      <p class="disclaimer disclaimer--sm">Illustrative estimates, not tax advice. ${DISCLAIMER}</p>
    </div>
    <div class="big-stats">
      <div class="big-stat"><span class="big-stat__n">≈9.5%</span><span>kept with no planning</span></div>
      <div class="big-stat big-stat--gold"><span class="big-stat__n">≈24%</span><span>kept with planning</span></div>
      <p class="muted small">Illustrative estimates for the sample case only.</p>
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap">
    ${sectionHead('Destination guide', 'Withholding, relief and entry at a glance', 'A starting point for planning. Rates, thresholds and processing times change; confirm each tour with qualified advisers.')}
    <div class="table-wrap" tabindex="0">
      <table class="guide">
        <thead><tr><th scope="col">Destination</th><th scope="col">Withholding on gross</th><th scope="col">Relief route</th><th scope="col">Relief lead time</th><th scope="col">Entry route</th><th scope="col">Entry lead time</th></tr></thead>
        <tbody>
          ${Object.values(D).map((d) => html`<tr>
            <th scope="row">${d.name}</th>
            <td><strong>${d.withholdingRate ? pct(d.withholdingRate * 100) : 'Generally none'}</strong><br><small>${d.withholding}</small></td>
            <td>${d.reliefRoute}</td>
            <td>${d.reliefLeadText}</td>
            <td>${d.entry}</td>
            <td>${d.entryLeadText}</td>
          </tr>`)}
        </tbody>
      </table>
    </div>
    <p class="disclaimer disclaimer--sm">${DISCLAIMER}</p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead('Pre-tour checklist', 'Seven things to settle before anyone flies')}
    <ol class="checklist">
      ${CHECKLIST.map(([t, d]) => html`<li class="reveal"><label><input type="checkbox" data-check> <span><strong>${t}</strong><br>${d}</span></label></li>`)}
    </ol>
  </div>
</section>

<section class="section section--accent" id="plan-section">
  <div class="wrap split">
    <div>
      ${sectionHead('Lead times', 'Start earlier than you think')}
      <ul class="ticks">
        <li><strong>US visa:</strong> about 12 months</li>
        <li><strong>US central withholding agreement:</strong> about 45 days before the first show</li>
        <li><strong>UK and Germany withholding relief:</strong> about 60 to 90 days</li>
      </ul>
      <p class="small">Planned for ${fmtDate(new Date().toISOString())}. ${DISCLAIMER}</p>
    </div>
    ${planForm()}
  </div>
</section>`;

  res.send(String(layout({
    title: 'Overseas Desk — tour net-cash calculator & destination guide',
    description: 'How T Nation runs overseas shows end to end: a tour net-cash calculator, withholding and visa guide for the US, UK, Canada, Australia, Germany/EU and UAE, a pre-tour checklist and lead-time planner.',
    path: '/overseas', active: 'overseas', body, scripts: ['/js/tour-calc.js', '/js/overseas.js'],
  })));
};
module.exports.DISCLAIMER = DISCLAIMER;
