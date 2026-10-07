'use strict';
const config = require('./config');

const today = () => new Date().toISOString().slice(0, 10);
const splitList = (s) => String(s || '').split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
const lines = (s) => String(s || '').split('\n').map((x) => x.trim()).filter(Boolean);

function listTalent(db, f = {}) {
  const where = ['published = 1'];
  const args = [];
  if (f.category) { where.push('category = ?'); args.push(f.category); }
  if (f.city) { where.push('city = ?'); args.push(f.city); }
  if (f.language) { where.push("(',' || REPLACE(languages, ', ', ',') || ',') LIKE ?"); args.push(`%,${f.language},%`); }
  if (f.genre) { where.push('genre = ?'); args.push(f.genre); }
  if (f.featured) where.push('featured = 1');
  return db.prepare(`SELECT * FROM talent WHERE ${where.join(' AND ')} ORDER BY sort_order, name`).all(...args);
}

function talentFacets(db) {
  const rows = db.prepare('SELECT city, languages, genre FROM talent WHERE published = 1').all();
  const uniq = (arr) => [...new Set(arr)].sort((a, b) => a.localeCompare(b));
  return {
    cities: uniq(rows.map((r) => r.city).filter(Boolean)),
    languages: uniq(rows.flatMap((r) => splitList(r.languages))),
    genres: uniq(rows.map((r) => r.genre).filter(Boolean)),
  };
}

const getTalent = (db, slug) => db.prepare('SELECT * FROM talent WHERE slug = ? AND published = 1').get(slug);

function upcomingShows(db, { region, talentId, limit = 50 } = {}) {
  const where = ['s.published = 1', 's.starts_on >= ?'];
  const args = [today()];
  if (region) { where.push('s.region = ?'); args.push(region); }
  if (talentId) { where.push('s.talent_id = ?'); args.push(talentId); }
  return db.prepare(`SELECT s.*, t.name AS talent_name, t.slug AS talent_slug, t.category AS talent_category
    FROM shows s LEFT JOIN talent t ON t.id = s.talent_id AND t.published = 1
    WHERE ${where.join(' AND ')} ORDER BY s.starts_on LIMIT ?`).all(...args, limit);
}

// ---- schema.org builders. Placeholder rows never emit structured data, so
// search engines are not fed fictional people or events.
function personLd(t) {
  if (t.is_placeholder) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: t.name,
    url: `${config.siteUrl}/roster/${t.slug}`,
    description: t.headline || undefined,
    image: t.image_url ? new URL(t.image_url, config.siteUrl).href : undefined,
    jobTitle: t.genre || undefined,
    homeLocation: t.city ? { '@type': 'Place', name: `${t.city}${t.state ? `, ${t.state}` : ''}` } : undefined,
    knowsLanguage: splitList(t.languages),
    sameAs: lines(t.media).filter((u) => /^https?:\/\//.test(u)),
    affiliation: { '@type': 'Organization', name: 'T Nation', url: config.siteUrl },
  };
}

function eventLd(s) {
  if (s.is_placeholder) return null;
  const performerType = s.talent_category === 'athlete' ? 'Person' : 'PerformingGroup';
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: s.title,
    startDate: s.starts_on,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    description: s.description || undefined,
    location: { '@type': 'Place', name: s.venue || s.city, address: { '@type': 'PostalAddress', addressLocality: s.city, addressCountry: s.country } },
    performer: s.talent_name ? { '@type': performerType, name: s.talent_name, url: `${config.siteUrl}/roster/${s.talent_slug}` } : undefined,
    organizer: { '@type': 'Organization', name: 'T Nation', url: config.siteUrl },
    offers: s.ticket_url ? { '@type': 'Offer', url: s.ticket_url, availability: s.status === 'sold-out' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock' } : undefined,
  };
}

module.exports = { listTalent, talentFacets, getTalent, upcomingShows, personLd, eventLd, splitList, lines, today };
