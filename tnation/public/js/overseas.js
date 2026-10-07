/* Overseas Desk: Tour Net-Cash Calculator, lead-time planner, checklist. */
(function () {
  'use strict';
  var TC = window.TourCalc; if (!TC) return;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var form = $('[data-calc-form]');
  if (form) {
    var money = function (n, c) {
      try { return new Intl.NumberFormat('en-US', { style: 'currency', currency: c, maximumFractionDigits: 0 }).format(Math.round(n) + 0); }
      catch (e) { return c + ' ' + Math.round(n).toLocaleString(); }
    };
    var pct = function (n) { return n.toFixed(1) + '%'; };
    var out = function (k, v) { var el = $('[data-out="' + k + '"]'); if (el) el.textContent = v; };
    var hidden = $('[data-calc-inputs]');

    var read = function () {
      var v = {}; $$('input, select', form).forEach(function (el) { v[el.name] = el.value; });
      return v;
    };
    var render = function () {
      var input = read();
      var r = TC.calculate(input);
      var c = r.currency;
      [['no', r.noPlanning], ['yes', r.withRelief]].forEach(function (pair) {
        var k = pair[0]; var s = pair[1];
        out(k + '.gross', money(r.gross, c));
        out(k + '.foreignTax', money(-s.foreignTax, c));
        out(k + '.commission', money(-r.commission, c));
        out(k + '.band', money(-r.inputs.bandGroundCosts, c));
        out(k + '.visa', money(-r.inputs.visaTravelCosts, c));
        out(k + '.reliefCost', money(-s.reliefCost, c));
        out(k + '.indiaTopUp', money(-s.indiaTopUp, c));
        out(k + '.cash', money(s.cash, c));
        out(k + '.pct', pct(s.cashPct)); out(k + '.pct2', pct(s.cashPct));
        var bar = $('[data-bar="' + k + '"]'); if (bar) bar.style.width = Math.max(0, Math.min(100, s.cashPct)) + '%';
      });
      out('gain', money(r.reliefGain, c));
      out('no.unrelieved', money(r.noPlanning.unrelievedForeignTax, c));
      var note = $('[data-out="unrelieved-note"]'); if (note) note.hidden = r.noPlanning.unrelievedForeignTax < 1;
      var d = TC.DESTINATIONS[r.destination];
      var hint = $('[data-calc-dest]'); if (hint) hint.textContent = d.withholding;
      var rc = form.elements.reliefCost; if (rc) rc.placeholder = 'Default ' + money(d.reliefCost, c);
      if (hidden) hidden.value = JSON.stringify(r.inputs && Object.assign({ destination: r.destination }, r.inputs));
    };
    form.addEventListener('input', render);
    form.addEventListener('change', render);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    var sampleBtn = $('[data-calc-sample]');
    sampleBtn && sampleBtn.addEventListener('click', function () {
      Object.keys(TC.SAMPLE).forEach(function (k) { if (form.elements[k]) form.elements[k].value = TC.SAMPLE[k]; });
      form.elements.indiaRatePct.value = (TC.INDIA_RATE * 100).toFixed(2);
      form.elements.reliefCost.value = '';
      render();
    });
    var leadForm = $('#calc-lead');
    leadForm && leadForm.addEventListener('tn:before-submit', render);
    render();
  }

  // ---- Lead-time planner ----------------------------------------------------
  var dest = $('[data-plan-dest]'); var date = $('[data-plan-date]'); var outEl = $('[data-plan-out]');
  var fmt = function (iso) { return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); };
  var LABEL = { ok: 'On track', tight: 'Tight', late: 'Not enough time' };
  function renderPlan(lt) {
    if (!outEl) return;
    if (!lt) { outEl.innerHTML = '<p class="muted">Select a destination and first show date to see the lead time.</p>'; return; }
    var d = TC.DESTINATIONS[lt.destination];
    var html = '<h4>' + d.name + ' · first show ' + fmt(lt.showDate) + ' <span class="lt lt--' + lt.status + '">' + LABEL[lt.status] + '</span></h4>';
    html += '<p class="small muted">' + lt.daysAvailable + ' days from today. Start by <strong>' + fmt(lt.startBy) + '</strong> (' + lt.daysNeeded + ' days needed).</p><ul>';
    lt.items.forEach(function (it) {
      var span = it.minDays === it.maxDays ? it.maxDays + ' days' : it.minDays + '–' + it.maxDays + ' days';
      html += '<li><span>' + it.label + ' · ' + span + '</span><span>start by ' + fmt(it.startBy) + ' <span class="lt lt--' + it.status + '">' + LABEL[it.status] + '</span></span></li>';
    });
    if (!lt.items.length) html += '<li>No relief filing or long visa lead time usually needed.</li>';
    outEl.innerHTML = html + '</ul><p class="small muted">Illustrative estimates. Tax, GST, FEMA and visa rules change; confirm with a chartered accountant or lawyer before any booking.</p>';
  }
  var plan = function () { renderPlan(dest && date && dest.value && date.value ? TC.leadTime(dest.value, date.value) : null); };
  dest && dest.addEventListener('change', plan);
  date && date.addEventListener('input', plan);
  var planForm = $('#plan');
  planForm && planForm.addEventListener('tn:sent', function () { plan(); });

  // ---- Checklist remembers ticks on this device ------------------------------
  var KEY = 'tn_pretour_checklist';
  var saved = []; try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { saved = []; }
  $$('[data-check]').forEach(function (cb, i) {
    cb.checked = saved.indexOf(i) >= 0;
    cb.addEventListener('change', function () {
      var ticked = $$('[data-check]').map(function (c, j) { return c.checked ? j : -1; }).filter(function (j) { return j >= 0; });
      try { localStorage.setItem(KEY, JSON.stringify(ticked)); } catch (e) { /* ignore */ }
    });
  });
})();
