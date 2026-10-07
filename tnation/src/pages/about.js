'use strict';
const { html } = require('../html');
const { layout } = require('../layout');
const { sectionHead, photo } = require('../ui');

module.exports = function about(req, res) {
  const body = html`
<section class="page-hero">
  <div class="wrap">
    <p class="eyebrow">About T Nation</p>
    <h1 class="display display--xl">From South India, for the world</h1>
    <p class="lede">T Nation is a talent management company for artists, athletes and creators from South India, headquartered in Bengaluru with a focus on Kerala and Karnataka.</p>
  </div>
</section>
<section class="section">
  <div class="wrap split split--top">
    <div>
      ${sectionHead('Our story', 'Why we exist')}
      <p>South India produces world-class musicians, athletes and creators. Too often, careers stall not for lack of talent but for lack of structure — contracts, bookings, brand deals, royalties and overseas paperwork handled piecemeal.</p>
      <p>T Nation brings those pieces under one roof: management, live and shows, brand partnerships, and rights and royalties, with an Overseas Desk for talent who perform or compete abroad.</p>
      <p class="muted small">Placeholder copy: replace with the founders' own story before launch.</p>
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
      <p class="eyebrow">Kerala office</p>
      <h2 class="h2">Kerala — coming soon</h2>
      <p>Location to be announced (placeholder). Until then, Kerala-based talent and partners can reach the team in Bengaluru.</p>
      ${photo('Kerala office', { tone: 3, className: 'office__ph' })}
    </article>
  </div>
</section>`;
  res.send(String(layout({
    title: 'About & team',
    description: 'About T Nation: a Bengaluru-headquartered talent management company for artists, athletes and creators from Kerala and Karnataka. Our story, team and offices.',
    path: '/about', active: 'about', body,
  })));
};
