'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const config = require('../config');

function privacy(req, res) {
  const body = html`
<section class="page-hero"><div class="wrap">
  <p class="eyebrow">Legal</p>
  <h1 class="display">Privacy policy</h1>
  <p class="muted">Draft for review — have counsel confirm this policy against the Digital Personal Data Protection Act, 2023 and any rules in force before launch.</p>
</div></section>
<section class="section section--tight"><div class="wrap prose">
  <h2>Who we are</h2>
  <p>T Nation (“we”) is a talent management company headquartered in Bengaluru, Karnataka, India. Contact: <a href="mailto:${config.contactEmail}">${config.contactEmail}</a>.</p>
  <h2>What we collect</h2>
  <ul>
    <li><strong>Enquiries</strong> (booking, brand, rights, contact): name, email, phone, organisation, event details and your message.</li>
    <li><strong>Talent applications</strong>: contact details, discipline, city, languages, links and any reel, portfolio or stats you upload.</li>
    <li><strong>Overseas Desk</strong>: calculator inputs and tour plans you choose to send us, with your contact details.</li>
    <li><strong>Technical data</strong>: your IP address is used briefly in memory for spam and abuse protection. We do not store it with your submission.</li>
  </ul>
  <h2>Why we use it</h2>
  <p>To respond to you, assess applications, prepare quotes and plan shows, and to keep this site secure. We rely on your consent and on steps you ask us to take before entering a contract.</p>
  <h2>Who we share it with</h2>
  <p>Only with people who need it to act on your request — for example promoters, brands or advisers (such as chartered accountants and lawyers) for a booking you have asked us to progress — and with service providers who host this site and deliver our email. We do not sell personal data.</p>
  <h2>How long we keep it</h2>
  <p>Enquiries and applications are kept for up to 24 months after our last contact, unless a contract requires longer. Uploaded files for unsuccessful applications are deleted sooner on request.</p>
  <h2>Your rights</h2>
  <p>You can ask to access, correct or erase your personal data, withdraw consent, or raise a grievance by writing to <a href="mailto:${config.contactEmail}">${config.contactEmail}</a>.</p>
  <h2 id="cookies">Cookies</h2>
  <p><strong>Strictly necessary</strong>: your cookie choice (<code>tn_consent</code>) and, for staff only, an admin sign-in cookie (<code>tn_admin</code>). Your navigation-language choice is stored in your browser's local storage.</p>
  <p><strong>Analytics</strong>: none are currently loaded. If added, they will run only after you choose “Accept all”. You can change your choice at any time via “Cookie settings” in the footer.</p>
  <h2>Changes</h2>
  <p>We will post any changes on this page with a new effective date. Effective date: to be set at launch.</p>
</div></section>`;
  res.send(String(layout({ title: 'Privacy policy', description: 'How T Nation collects, uses and protects personal data, and how we use cookies.', path: '/privacy', body })));
}

function thanks(req, res, { title = 'Thank you', message = 'Your message has been received. We will be in touch soon.', extra = '' } = {}) {
  const body = html`<section class="page-hero page-hero--center"><div class="wrap">
    <p class="eyebrow">Received</p><h1 class="display">${title}</h1><p class="lede">${message}</p>${extra}
    <p><a class="btn btn--gold" href="/">Back to home</a></p></div></section>`;
  res.send(String(layout({ title, body, noindex: true, path: req.path })));
}

function errorPage(req, res, status, message) {
  const body = html`<section class="page-hero page-hero--center"><div class="wrap">
    <p class="eyebrow">${status}</p><h1 class="display">${status === 404 ? 'Page not found' : 'Something went wrong'}</h1>
    <p class="lede">${message || (status === 404 ? 'That page does not exist or has moved.' : 'Please try again.')}</p>
    <p><a class="btn btn--ghost" href="/">Home</a></p></div></section>`;
  res.status(status).send(String(layout({ title: status === 404 ? 'Not found' : 'Error', body, noindex: true, path: req.path })));
}

module.exports = { privacy, thanks, errorPage };
