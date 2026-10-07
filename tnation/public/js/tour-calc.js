/*
 * T Nation — Tour Net-Cash Calculator and overseas lead-time model.
 * Shared by the browser (window.TourCalc) and the server (require).
 *
 * ILLUSTRATIVE ESTIMATES ONLY. Not tax advice. Withholding rates, relief
 * routes and visa timelines change; confirm with a chartered accountant or
 * lawyer before any booking.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TourCalc = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Effective Indian tax rate on the artist's net foreign income used for the
  // foreign-tax-credit top-up: 30% slab + 15% surcharge + 4% cess = 35.88%.
  // Illustrative; the actual rate depends on regime, income level and structure.
  var INDIA_RATE = 0.3588;

  var DESTINATIONS = {
    US: {
      name: 'United States', currency: 'USD',
      withholdingRate: 0.30,
      withholding: '30% federal withholding on gross fees paid to non-resident performers and athletes. Some states withhold on top.',
      reliefRoute: 'Central Withholding Agreement (CWA) with the IRS, so tax is withheld on estimated net income; then file a US non-resident return after the tour.',
      reliefRate: 0.24, reliefCost: 2500,
      reliefLead: { min: 45, max: 45, label: 'CWA application to the IRS' },
      reliefLeadText: 'About 45 days before the first show',
      entry: 'USCIS petition (P-1, P-3 or O-1 category, depending on the act) followed by a visa interview in India.',
      entryLead: { min: 365, max: 365, label: 'US work visa (petition + interview)' },
      entryLeadText: 'About 12 months',
    },
    UK: {
      name: 'United Kingdom', currency: 'GBP',
      withholdingRate: 0.20,
      withholding: '20% (basic rate) withheld by the payer under the foreign entertainers rules once payments pass the threshold.',
      reliefRoute: "Reduced tax payment application to HMRC's foreign entertainers unit, usually made by the UK promoter, so withholding is based on net profit.",
      reliefRate: 0.20, reliefCost: 1500,
      reliefLead: { min: 60, max: 90, label: 'HMRC reduced tax payment application' },
      reliefLeadText: 'About 60 to 90 days',
      entry: 'Creative Worker visa with a certificate of sponsorship, or Permitted Paid Engagement / visitor routes where eligible.',
      entryLead: { min: 60, max: 90, label: 'UK visa' },
      entryLeadText: 'About 2 to 3 months',
    },
    CA: {
      name: 'Canada', currency: 'CAD',
      withholdingRate: 0.15,
      withholding: '15% Regulation 105 withholding on fees for services performed in Canada.',
      reliefRoute: 'Regulation 105 waiver application to the CRA (treaty-based or income-and-expense waiver).',
      reliefRate: 0.15, reliefCost: 1500,
      reliefLead: { min: 30, max: 60, label: 'CRA Regulation 105 waiver' },
      reliefLeadText: 'At least 30 days; plan 30 to 60 days',
      entry: 'Temporary resident visa. Many performers are work-permit exempt; confirm for the specific engagement.',
      entryLead: { min: 90, max: 180, label: 'Canadian temporary resident visa' },
      entryLeadText: 'About 3 to 6 months',
    },
    AU: {
      name: 'Australia', currency: 'AUD',
      withholdingRate: 0.30,
      withholding: 'Foreign resident withholding on payments for entertainment and sports activities (about 30% for individuals).',
      reliefRoute: 'Withholding variation application to the ATO, supported by a budget of tour costs.',
      reliefRate: 0.30, reliefCost: 1500,
      reliefLead: { min: 30, max: 60, label: 'ATO withholding variation' },
      reliefLeadText: 'About 30 to 60 days',
      entry: 'Temporary Activity visa (subclass 408), entertainment stream, usually with an Australian sponsor.',
      entryLead: { min: 60, max: 120, label: 'Australian subclass 408 visa' },
      entryLeadText: 'About 2 to 4 months',
    },
    DE: {
      name: 'Germany / EU', currency: 'EUR',
      withholdingRate: 0.15825,
      withholding: 'Germany: 15% plus 5.5% solidarity surcharge (15.825%) on gross under §50a EStG. Other EU states run their own schemes.',
      reliefRoute: 'Exemption certificate or net-basis withholding through the Federal Central Tax Office (BZSt), or a refund claim after the tour.',
      reliefRate: 0.15825, reliefCost: 1500,
      reliefLead: { min: 60, max: 90, label: 'BZSt exemption / relief application' },
      reliefLeadText: 'About 60 to 90 days',
      entry: 'Schengen (type C) visa. Short engagements may be work-permit exempt; confirm per country.',
      entryLead: { min: 45, max: 90, label: 'Schengen visa' },
      entryLeadText: 'About 6 to 12 weeks',
    },
    AE: {
      name: 'UAE', currency: 'AED',
      withholdingRate: 0,
      withholding: 'Generally no withholding tax on performance fees paid to non-residents.',
      reliefRoute: 'Usually none needed. Confirm event-permit and entertainer-permit costs with the promoter.',
      reliefRate: 0, reliefCost: 0,
      reliefLead: { min: 0, max: 0, label: 'No withholding relief filing' },
      reliefLeadText: 'Not usually required',
      entry: 'Entertainer / visit permit and event permit arranged by a licensed UAE promoter.',
      entryLead: { min: 21, max: 42, label: 'UAE entertainer permit and event permit' },
      entryLeadText: 'About 3 to 6 weeks',
    },
  };

  // The worked example on the Overseas Desk page: US$180,000 gross over six US shows.
  var SAMPLE = {
    destination: 'US', shows: 6, feePerShow: 30000, commissionPct: 20,
    bandGroundCosts: 48000, visaTravelCosts: 24900,
  };

  function num(v, fallback) {
    var n = typeof v === 'number' ? v : parseFloat(String(v == null ? '' : v).replace(/,/g, ''));
    return isFinite(n) ? n : (fallback || 0);
  }

  function calculate(input) {
    var d = DESTINATIONS[input.destination] || DESTINATIONS.US;
    var shows = Math.max(0, Math.round(num(input.shows)));
    var fee = Math.max(0, num(input.feePerShow));
    var commissionPct = Math.min(100, Math.max(0, num(input.commissionPct)));
    var band = Math.max(0, num(input.bandGroundCosts));
    var visa = Math.max(0, num(input.visaTravelCosts));
    var indiaRate = input.indiaRatePct != null && input.indiaRatePct !== '' ? num(input.indiaRatePct) / 100 : INDIA_RATE;
    var reliefCost = input.reliefCost != null && input.reliefCost !== '' ? Math.max(0, num(input.reliefCost)) : d.reliefCost;

    var gross = shows * fee;
    var commission = gross * commissionPct / 100;
    var costs = band + visa;
    var netBeforeTax = gross - commission - costs;
    var taxableNet = Math.max(0, netBeforeTax);
    var indiaTax = taxableNet * indiaRate;

    function scenario(foreignTax, extraCost) {
      // India taxes the artist's net income but credits foreign tax only up to
      // the Indian tax on that income; anything withheld above that is lost.
      var indiaTopUp = Math.max(0, indiaTax - foreignTax);
      var unrelievedForeignTax = Math.max(0, foreignTax - indiaTax);
      var cash = netBeforeTax - foreignTax - indiaTopUp - extraCost;
      return {
        foreignTax: foreignTax, indiaTopUp: indiaTopUp, reliefCost: extraCost,
        unrelievedForeignTax: unrelievedForeignTax, cash: cash,
        cashPct: gross > 0 ? cash / gross * 100 : 0,
      };
    }

    var noPlanning = scenario(gross * d.withholdingRate, 0);
    var withRelief = scenario(taxableNet * d.reliefRate, reliefCost);

    return {
      destination: input.destination in DESTINATIONS ? input.destination : 'US',
      currency: d.currency,
      inputs: { shows: shows, feePerShow: fee, commissionPct: commissionPct, bandGroundCosts: band, visaTravelCosts: visa, indiaRatePct: indiaRate * 100, reliefCost: reliefCost },
      gross: gross, commission: commission, costs: costs, netBeforeTax: netBeforeTax, indiaTax: indiaTax,
      withholdingRate: d.withholdingRate,
      noPlanning: noPlanning, withRelief: withRelief,
      reliefGain: withRelief.cash - noPlanning.cash,
    };
  }

  var DAY = 86400000;
  function toDate(v) {
    if (v instanceof Date) return v;
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || ''));
    return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
  }
  function iso(d) { return d.toISOString().slice(0, 10); }

  // Lead-time plan for an overseas show: what has to start when.
  function leadTime(destination, showDate, today) {
    var d = DESTINATIONS[destination];
    var show = toDate(showDate);
    if (!d || !show) return null;
    var now = toDate(today || iso(new Date()));
    var daysAvailable = Math.round((show - now) / DAY);
    var items = [d.entryLead, d.reliefLead].filter(function (x) { return x.max > 0; }).map(function (x) {
      var startBy = new Date(show.getTime() - x.max * DAY);
      return {
        label: x.label, minDays: x.min, maxDays: x.max, startBy: iso(startBy),
        status: daysAvailable >= x.max ? 'ok' : daysAvailable >= x.min ? 'tight' : 'late',
      };
    });
    var needed = items.reduce(function (m, x) { return Math.max(m, x.maxDays); }, 0);
    var status = items.some(function (x) { return x.status === 'late'; }) ? 'late'
      : items.some(function (x) { return x.status === 'tight'; }) ? 'tight' : 'ok';
    return {
      destination: destination, showDate: iso(show), daysAvailable: daysAvailable,
      daysNeeded: needed, startBy: iso(new Date(show.getTime() - needed * DAY)),
      status: status, items: items,
    };
  }

  return { DESTINATIONS: DESTINATIONS, SAMPLE: SAMPLE, INDIA_RATE: INDIA_RATE, calculate: calculate, leadTime: leadTime };
});
