import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const { mapRemoteEvent, mapRemoteSpace, mapRemoteArtist } = await import('../frontend/src/services/content.service.js');
const fixtureArtists = JSON.parse(readFileSync(new URL('../frontend/src/data/artists.json', import.meta.url), 'utf8'));

const eventRow = (overrides = {}) => ({
  event_id: 'e-uuid', event_slug: 'fandango-demo', title: 'Fandango', description: 'Baile', starts_at: '2026-10-20T20:00:00Z', ends_at: null,
  cover_image_url: '', occurrence_id: 'o1', price_label: 'Libre', space_id: 's-uuid', space_name: 'Foro Sur', borough: 'Coyoacán',
  neighborhood: 'Del Carmen', latitude: 19.35, longitude: -99.16, space_slug: 'foro-sur', address: 'Calle 1', audience_label: 'Familias',
  is_demo: false, category_slugs: ['fandango', 'danza'], ...overrides,
});

test('un evento remoto marcado como demo se muestra como demostración y su audiencia viene de audience_label', () => {
  const demo = mapRemoteEvent(eventRow({ is_demo: true }));
  assert.equal(demo.isDemo, true);
  assert.equal(demo.contentStatus, 'demo');
  assert.equal(demo.audience, 'Familias');
  assert.equal(demo.venueId, 's-uuid');
  assert.equal(demo.venue.id, 's-uuid');
  assert.equal(demo.venue.slug, 'foro-sur');
  assert.deepEqual(demo.categorySlugs, ['fandango', 'danza']);
});

test('un evento remoto sin is_demo verdadero queda aprobado y no demo', () => {
  for (const row of [eventRow({ is_demo: false }), eventRow({ is_demo: undefined }), eventRow({ is_demo: 'true' })]) {
    const item = mapRemoteEvent(row);
    assert.equal(item.isDemo, false);
    assert.equal(item.contentStatus, 'approved');
  }
});

test('un espacio remoto usa description, category_slugs e is_demo', () => {
  const space = mapRemoteSpace({ id: 's-uuid', slug: 'foro-sur', name: 'Foro Sur', description: 'Sala chica', category_slugs: ['teatro'], is_demo: true, latitude: 19.3, longitude: -99.1, neighborhood: 'Coyoacán' });
  assert.equal(space.description, 'Sala chica');
  assert.deepEqual(space.categories, ['teatro']);
  assert.equal(space.isDemo, true);
  assert.equal(space.contentStatus, 'demo');
  assert.deepEqual(space.coordinates, [-99.1, 19.3]);
  const approved = mapRemoteSpace({ id: 's2', slug: 'x', name: 'X', is_demo: false });
  assert.equal(approved.contentStatus, 'approved');
  assert.equal(approved.isDemo, false);
});

test('un artista remoto tiene la misma forma que los fixtures de artists.json', () => {
  const artist = mapRemoteArtist({ id: 'a-uuid', kind: 'artist', slug: 'luna', display_name: 'Luna', description: 'Cantautora', tagline: 'Voz', discipline: 'Música', is_demo: true, next_event_id: 'e-uuid', category_slugs: ['musica'] });
  assert.deepEqual(Object.keys(artist).sort(), Object.keys(fixtureArtists[0]).sort());
  assert.equal(artist.name, 'Luna');
  assert.equal(artist.bio, 'Cantautora');
  assert.equal(artist.nextEventId, 'e-uuid');
  assert.deepEqual(artist.categorySlugs, ['musica']);
  assert.equal(artist.contentStatus, 'demo');
  assert.equal(artist.isDemo, true);
  assert.equal(artist.source, 'cuicoyan-database');
  assert.ok(fixtureArtists.some((item) => item.tone === artist.tone), 'tone debe existir en artists.json');
});

test('un artista remoto sin próximo evento queda con nextEventId vacío', () => {
  const artist = mapRemoteArtist({ id: 'a2', slug: 'sin-fecha', display_name: 'Sin fecha', next_event_id: null, category_slugs: [] });
  assert.equal(artist.nextEventId, '');
  assert.equal(artist.contentStatus, 'approved');
});
