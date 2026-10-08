'use strict';
// PLACEHOLDER CONTENT ONLY. These rows are not real clients or real shows.
// Every seeded row has is_placeholder = 1 and renders a visible "Placeholder"
// badge. Replace or delete them from the admin dashboard before launch.

const TALENT = [
  { slug: 'artist-01', name: 'Artist 01', category: 'artist', city: 'Kochi', state: 'Kerala', languages: 'Malayalam, English', genre: 'Hip-hop', featured: 1 },
  { slug: 'artist-02', name: 'Artist 02', category: 'artist', city: 'Bengaluru', state: 'Karnataka', languages: 'Kannada, Tulu, English', genre: 'Indie / Rock', featured: 1 },
  { slug: 'artist-03', name: 'Artist 03', category: 'artist', city: 'Thiruvananthapuram', state: 'Kerala', languages: 'Malayalam, Tamil', genre: 'Carnatic fusion', featured: 0 },
  { slug: 'artist-04', name: 'Artist 04', category: 'artist', city: 'Mysuru', state: 'Karnataka', languages: 'Kannada', genre: 'Playback / Film', featured: 1 },
  { slug: 'artist-05', name: 'Artist 05', category: 'artist', city: 'Chennai', state: 'Tamil Nadu', languages: 'Tamil, English', genre: 'Independent / Gaana', featured: 1 },
  { slug: 'artist-06', name: 'Artist 06', category: 'artist', city: 'Hyderabad', state: 'Telangana', languages: 'Telugu, Hindi, English', genre: 'Playback / Film', featured: 1 },
  { slug: 'athlete-01', name: 'Athlete 01', category: 'athlete', city: 'Kozhikode', state: 'Kerala', languages: 'Malayalam, English', genre: 'Football', featured: 1 },
  { slug: 'athlete-02', name: 'Athlete 02', category: 'athlete', city: 'Bengaluru', state: 'Karnataka', languages: 'Kannada, Hindi, English', genre: 'Cricket', featured: 0 },
  { slug: 'athlete-03', name: 'Athlete 03', category: 'athlete', city: 'Thrissur', state: 'Kerala', languages: 'Malayalam', genre: 'Athletics', featured: 1 },
  { slug: 'athlete-04', name: 'Athlete 04', category: 'athlete', city: 'Hyderabad', state: 'Telangana', languages: 'Telugu, English', genre: 'Badminton', featured: 0 },
  { slug: 'athlete-05', name: 'Athlete 05', category: 'athlete', city: 'Chennai', state: 'Tamil Nadu', languages: 'Tamil, English', genre: 'Chess', featured: 0 },
  { slug: 'creator-01', name: 'Creator 01', category: 'creator', city: 'Mangaluru', state: 'Karnataka', languages: 'Tulu, Kannada, Konkani', genre: 'Comedy', featured: 1 },
  { slug: 'creator-02', name: 'Creator 02', category: 'creator', city: 'Kochi', state: 'Kerala', languages: 'Malayalam, English', genre: 'Food & Travel', featured: 0 },
  { slug: 'creator-03', name: 'Creator 03', category: 'creator', city: 'Hyderabad', state: 'Telangana', languages: 'Telugu, English', genre: 'Tech & Lifestyle', featured: 1 },
];

const SHOWS = [
  { talent: 'artist-01', city: 'Kochi', country: 'India', region: 'india', days: 21 },
  { talent: 'artist-02', city: 'Bengaluru', country: 'India', region: 'india', days: 34 },
  { talent: 'creator-01', city: 'Mangaluru', country: 'India', region: 'india', days: 48 },
  { talent: 'artist-04', city: 'Mysuru', country: 'India', region: 'india', days: 63 },
  { talent: 'artist-05', city: 'Chennai', country: 'India', region: 'india', days: 28 },
  { talent: 'artist-06', city: 'Hyderabad', country: 'India', region: 'india', days: 42 },
  { talent: 'artist-01', city: 'Dubai', country: 'UAE', region: 'overseas', days: 55 },
  { talent: 'artist-03', city: 'London', country: 'United Kingdom', region: 'overseas', days: 120 },
  { talent: 'artist-06', city: 'Dallas', country: 'United States', region: 'overseas', days: 380 },
  { talent: 'artist-02', city: 'Toronto', country: 'Canada', region: 'overseas', days: 160 },
  { talent: 'artist-04', city: 'Melbourne', country: 'Australia', region: 'overseas', days: 200 },
];

function isoInDays(days) {
  return new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
}

function run(db) {
  const insertTalent = db.prepare(`INSERT INTO talent
    (slug, name, category, city, state, languages, genre, headline, bio, achievements, media, featured, is_placeholder, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`);
  const ids = {};
  TALENT.forEach((t, i) => {
    const kind = t.category === 'athlete' ? 'athlete' : t.category === 'creator' ? 'creator' : 'artist';
    const r = insertTalent.run(
      t.slug, t.name, t.category, t.city, t.state, t.languages, t.genre,
      `Placeholder ${kind} profile · ${t.genre} · ${t.city}`,
      `Placeholder biography. Replace this text with the ${kind}'s approved bio from the admin dashboard. ` +
        `Keep it factual: where they are from, what they do, and what they are building next.`,
      'Placeholder achievement — add verified achievements only\nPlaceholder achievement — link to a source where possible',
      'Placeholder: add a YouTube, Instagram or Spotify link\nPlaceholder: add a second media link',
      t.featured, i,
    );
    ids[t.slug] = Number(r.lastInsertRowid);
  });

  const insertShow = db.prepare(`INSERT INTO shows
    (title, talent_id, starts_on, venue, city, country, region, status, description, is_placeholder)
    VALUES (?, ?, ?, 'Venue TBC', ?, ?, ?, 'announced', ?, 1)`);
  for (const s of SHOWS) {
    insertShow.run(`Placeholder show — ${s.city}`, ids[s.talent], isoInDays(s.days), s.city, s.country, s.region,
      'Placeholder listing. Replace with a confirmed date, venue and ticket link from the admin dashboard.');
  }
}

module.exports = { run };
