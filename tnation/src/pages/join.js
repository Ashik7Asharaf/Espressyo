'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const { field, form, sectionHead } = require('../ui');
const config = require('../config');

const ACCEPT = '.pdf,.jpg,.jpeg,.png,.webp,.mp4,.mov,.mp3,.wav,.m4a,.csv,.xlsx';

module.exports = function join(req, res) {
  const body = html`
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">Join T Nation</p>
    <h1 class="display display--xl">Ready for the next stage?</h1>
    <p class="lede">Artists, athletes and creators from South India — tell us about yourself. We review every application and reply to those we can take forward.</p>
  </div>
</section>
<section class="section">
  <div class="wrap split split--top">
    <div>
      ${sectionHead('What we look for', 'Talent, work ethic, ambition')}
      <ul class="ticks">
        <li><strong>Artists:</strong> a reel or recent live performance, released music, and where your audience is.</li>
        <li><strong>Athletes:</strong> current level, key stats or results, and your next competitive goals.</li>
        <li><strong>Creators:</strong> your channels, audience languages and best-performing content.</li>
      </ul>
      <p class="muted small">Under 18? A parent or guardian must submit this form on your behalf.</p>
    </div>
    ${form({
      id: 'apply', action: '/forms/apply', submit: 'Send application', multipart: true,
      children: [
        field({ name: 'name', label: 'Full name', required: true, autocomplete: 'name' }),
        field({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email' }),
        field({ name: 'phone', label: 'Phone / WhatsApp', type: 'tel', required: true, autocomplete: 'tel' }),
        field({ name: 'category', label: 'I am a…', type: 'select', required: true, options: [['', 'Select'], ['artist', 'Artist'], ['athlete', 'Athlete'], ['creator', 'Creator']] }),
        field({ name: 'city', label: 'City', required: true, autocomplete: 'address-level2' }),
        field({ name: 'languages', label: 'Languages', placeholder: 'e.g. Malayalam, English' }),
        field({ name: 'genre', label: 'Sport or genre', required: true }),
        field({ name: 'links', label: 'Links (reel, socials, stats)', type: 'textarea', rows: 3, placeholder: 'One link per line' }),
        field({ name: 'file', label: 'Upload reel, portfolio or stats', type: 'file', full: true, attrs: `accept="${ACCEPT}"`, hint: `Optional. PDF, image, audio, video or spreadsheet, up to ${config.maxUploadMb} MB. For larger reels, paste a link above.` }),
        field({ name: 'message', label: 'Tell us about you', type: 'textarea', full: true, required: true }),
        html`<div class="field field--full consent">
          <label><input type="checkbox" name="consent" value="yes" required>
          <span>I consent to T Nation storing and processing the information and files I submit to assess my application, as described in the <a href="/privacy" target="_blank">privacy policy</a>. I can ask for them to be deleted at any time.<span class="req">*</span></span></label>
        </div>`,
      ],
    })}
  </div>
</section>`;
  res.send(String(layout({
    title: 'Join T Nation — talent application',
    description: 'Artists, athletes and creators from South India: apply for representation with T Nation. Upload your reel, portfolio or stats.',
    path: '/join', active: 'join', body,
  })));
};
module.exports.ACCEPT = ACCEPT;
