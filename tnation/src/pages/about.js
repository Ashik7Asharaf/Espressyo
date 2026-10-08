'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const { sectionHead, photo } = require('../ui');
const { cities } = require('./shared');

module.exports = function about(req, res) {
  const body = html`
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">About T Nation</p>
    <h1 class="display display--xl">From South India, for the world</h1>
    <p class="lede">T Nation is a talent management company for artists, athletes and creators from across South India. Founded in 2026 and headquartered in Bengaluru, we work across Chennai, Hyderabad and Kochi.</p>
  </div>
</section>
<section class="section">
  <div class="wrap split split--top">
    <div>
      ${sectionHead('Our story', 'We have been where our talent is')}
      <p>T Nation was founded in Bengaluru in 2026 by people who were artists and athletes themselves. We know from experience how often careers stall — not for lack of talent, but because of the hurdles around it: unclear contracts, missed bookings, brand deals that undersell, royalties nobody collects, and the paperwork that comes with performing abroad.</p>
      <p>We started T Nation to clear those hurdles, so that artists, athletes and creators can focus on their craft and go after their dreams. Management, live and shows, brand partnerships, and rights and royalties sit under one roof, with an Overseas Desk for talent who perform or compete abroad.</p>
      <p>We are passionate about South India's talent, and we work across its four biggest markets — Karnataka, Tamil Nadu, Telangana and Andhra Pradesh, and Kerala — from our home in Bengaluru.</p>
    </div>
    ${photo('Team at work, Bengaluru', { tone: 2 })}
  </div>
</section>
<section class="section section--dark">
  <div class="wrap">
    ${sectionHead('Team', 'The people behind the roster', 'Placeholders — team profiles will be added with each person\'s approval.')}
    <div class="team">
      ${['Founder & CEO', 'Head of Talent', 'Head of Live & Overseas', 'Head of Brand Partnerships', 'Rights & Royalties Lead', 'Operations'].map((role, i) => html`<article class="member reveal">
        ${photo(role, { tone: i, className: 'member__ph' })}
        <h3>Name to be confirmed</h3><p class="muted">${role} · Placeholder</p>
      </article>`)}
    </div>
  </div>
</section>
<section class="section section--tight">
  <div class="wrap">
    ${sectionHead('Where we work', 'Bengaluru HQ, working across South India')}
    ${cities()}
  </div>
</section>
<section class="section">
  <div class="wrap offices">
    <article class="office reveal">
      <p class="eyebrow">Headquarters</p>
      <h2 class="h2">Bengaluru, Karnataka</h2>
      <p>Street address to be confirmed (placeholder)<br>Bengaluru, Karnataka, India</p>
      <p><a href="/contact">Book a meeting</a></p>
      <div class="map" data-map>
        <iframe title="Map of Bengaluru" loading="lazy" referrerpolicy="no-referrer"
          src="https://www.openstreetmap.org/export/embed.html?bbox=77.5446%2C12.9216%2C77.6646%2C13.0116&amp;layer=mapnik&amp;marker=12.9716%2C77.5946"></iframe>
        <a class="small" href="https://www.openstreetmap.org/?mlat=12.9716&amp;mlon=77.5946#map=13/12.9716/77.5946" rel="noopener" target="_blank">View larger map</a>
      </div>
    </article>
    <article class="office reveal">
      <p class="eyebrow">Chennai · Hyderabad · Kochi</p>
      <h2 class="h2">Working across South India</h2>
      <p>We work with talent, promoters and brands in Chennai, Hyderabad and Kochi from our Bengaluru headquarters. To meet us in any of these cities, <a href="/contact">get in touch</a> and we will arrange it.</p>
      ${photo('On the road in South India', { tone: 3, className: 'office__ph' })}
    </article>
  </div>
</section>`;
  res.send(String(layout({
    title: 'About & team',
    description: 'About T Nation: founded in 2026 by former artists and athletes. A Bengaluru-headquartered talent management company working across Chennai, Hyderabad and Kochi. Our story and team.',
    path: '/about', active: 'about', body,
  })));
};
