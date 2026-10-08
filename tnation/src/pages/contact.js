'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const { field, form, sectionHead } = require('../ui');
const config = require('../config');

const TOPICS = [['general', 'General'], ['booking', 'Booking a show'], ['brand', 'Brand partnership'], ['press', 'Press & media'], ['investor', 'Investors'], ['talent', 'Talent / representation'], ['other', 'Other']];

module.exports = function contact(req, res) {
  const topic = TOPICS.some(([k]) => k === req.query.type) ? req.query.type : 'general';
  const waText = encodeURIComponent('Hi T Nation, I would like to get in touch about…');
  const body = html`
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Contact</p>
    <h1 class="display display--xl">Let's talk</h1>
    <p class="lede">Bookings, brands, press, investors or representation — send a message and the right person will reply.</p>
  </div>
</section>
<section class="section">
  <div class="wrap split split--top">
    <div>
      ${sectionHead('Direct', 'Email or WhatsApp')}
      <p><a class="contact-line" href="mailto:${config.contactEmail}">${config.contactEmail}</a></p>
      <p><a class="btn btn--whatsapp btn--lg" href="https://wa.me/${config.whatsappNumber}?text=${waText}" rel="noopener" target="_blank">Message us on WhatsApp</a></p>
      <p class="muted small">Contact details shown are placeholders until the launch addresses are configured.</p>
      <p>Headquarters: Bengaluru, Karnataka. We also work across Chennai, Hyderabad and Kochi. <a href="/about">Find us</a>.</p>
    </div>
    ${form({
      id: 'contact', action: '/forms/contact', submit: 'Send message',
      children: [
        field({ name: 'topic', label: 'Topic', type: 'select', options: TOPICS, value: topic }),
        field({ name: 'name', label: 'Name', required: true, autocomplete: 'name' }),
        field({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' }),
        field({ name: 'phone', label: 'Phone / WhatsApp', type: 'tel', autocomplete: 'tel' }),
        field({ name: 'organisation', label: 'Organisation', autocomplete: 'organization' }),
        field({ name: 'message', label: 'Message', type: 'textarea', full: true, required: true }),
      ],
    })}
  </div>
</section>`;
  res.send(String(layout({
    title: 'Contact',
    description: 'Contact T Nation in Bengaluru by email, WhatsApp or enquiry form — bookings, brand partnerships, press, investors and talent.',
    path: '/contact', active: 'contact', body,
  })));
};
module.exports.TOPICS = TOPICS;
