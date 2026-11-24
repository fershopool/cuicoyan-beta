import assert from 'node:assert/strict';
import test from 'node:test';

const { cleanText, safeHttpUrl, safeMediaPath, artistFromRow, venueFromRow, coordinatesFromMap } = await import('../frontend/src/services/published-logic.js');

const media = (path) => `https://proyecto.supabase.co/storage/v1/object/public/profile-media/${path}`;

const hostileName = '<img src=x onerror=alert(1)>Luna\u0000\u0007 Mestiza';

test('texto hostil se limpia: sin < >, sin controles, recortado', () => {
  assert.equal(cleanText('<script>x</script>hola'), 'scriptx/scripthola');
  assert.equal(cleanText('  a\u0000b\u001fc  '), 'a b c');
  assert.equal(cleanText('x'.repeat(50), 10).length, 10);
  assert.equal(cleanText(42), '');
  assert.equal(cleanText(null), '');
});

test('solo http y https en URLs', () => {
  assert.equal(safeHttpUrl('https://ejemplo.mx/perfil'), 'https://ejemplo.mx/perfil');
  assert.equal(safeHttpUrl('http://ejemplo.mx'), 'http://ejemplo.mx/');
  assert.equal(safeHttpUrl('javascript:alert(1)'), '');
  assert.equal(safeHttpUrl('data:text/html,<b>x</b>'), '');
  assert.equal(safeHttpUrl('no es url'), '');
  assert.equal(safeHttpUrl(undefined), '');
});

test('rutas de medios: sin traversal ni barra inicial', () => {
  assert.equal(safeMediaPath('artist/1/avatar.png'), 'artist/1/avatar.png');
  assert.equal(safeMediaPath('../secreto.png'), '');
  assert.equal(safeMediaPath('/etc/passwd'), '');
  assert.equal(safeMediaPath('a/../../b.png'), '');
  assert.equal(safeMediaPath(12), '');
});

test('fila de artista válida con texto hostil se convierte al formato de la página', () => {
  const item = artistFromRow({
    id: 'a1b2c3d4-0000-4000-8000-000000000001',
    slug: 'luna-mestiza',
    name: hostileName,
    status: 'published',
    avatar_path: 'artist/a1/avatar.png',
    cover_path: '../nope.png',
    data: {
      discipline: 'Música',
      tagline: 'Cantautora',
      bio: 'Bio <b>negrita</b>',
      longBio: 'x'.repeat(5000),
      categories: ['musica', 42, '<i>x</i>'],
      website: 'javascript:alert(1)',
      social: { instagram: '@luna', tiktok: '<svg onload=1>' },
      owner_id: 'no debe salir',
    },
  }, media);
  assert.equal(item.id, 'sb-a1b2c3d4-0000-4000-8000-000000000001');
  assert.equal(item.slug, 'luna-mestiza');
  assert.equal(item.name, 'img src=x onerror=alert(1)Luna Mestiza');
  assert.ok(!/[<>]/.test(item.name));
  assert.ok(!/[\u0000-\u0008]/.test(item.name));
  assert.equal(item.bio, 'Bio bnegrita/b');
  assert.equal(item.longBio.length, 4000);
  assert.deepEqual(item.categorySlugs, ['musica', 'ix/i']);
  assert.equal(item.website, '');
  assert.deepEqual(item.social, { instagram: '@luna', tiktok: 'svg onload=1' });
  assert.equal(item.avatarUrl, media('artist/a1/avatar.png'));
  assert.equal(item.coverUrl, '');
  assert.equal(item.tone, 'pink');
  assert.equal(item.contentStatus, 'published');
  assert.equal(item.isDemo, false);
  assert.equal(item.source, 'comunidad');
  assert.equal('owner_id' in item, false);
});

test('filas no válidas o no publicadas se descartan', () => {
  const base = { id: 'a1', slug: 'ok-slug', name: 'Ok', status: 'published', data: {} };
  assert.ok(artistFromRow(base));
  assert.equal(artistFromRow({ ...base, status: 'pending' }), null);
  assert.equal(artistFromRow({ ...base, slug: 'Mal Slug!' }), null);
  assert.equal(artistFromRow({ ...base, slug: '../x' }), null);
  assert.equal(artistFromRow({ ...base, name: '   ' }), null);
  assert.equal(artistFromRow({ ...base, id: 'a/1' }), null);
  assert.equal(artistFromRow(null), null);
  assert.equal(artistFromRow('texto'), null);
});

test('coordenadas: solo números finitos dentro de rango, se guardan como [lng, lat]', () => {
  assert.deepEqual(coordinatesFromMap({ lat: '19.4', lng: '-99.1' }), [-99.1, 19.4]);
  assert.equal(coordinatesFromMap({ lat: '', lng: '' }), null);
  assert.equal(coordinatesFromMap({ lat: null, lng: -99 }), null);
  assert.equal(coordinatesFromMap({ lat: 'NaN', lng: '-99' }), null);
  assert.equal(coordinatesFromMap({ lat: '95', lng: '-99' }), null);
  assert.equal(coordinatesFromMap(undefined), null);
});

test('fila de foro: categorías, punto conceptual sin coordenadas y textos recortados', () => {
  const sin = venueFromRow({
    id: 'v1',
    slug: 'foro-sur',
    name: 'Foro <script>Sur</script>',
    status: 'published',
    data: { zone: 'Coyoacán', bio: '', address: 'Calle 1', map: { category: 'teatro', extra: ['musica', 9], lat: '', lng: '' }, website: 'https://foro.mx' },
  }, media);
  assert.equal(sin.name, 'Foro scriptSur/script');
  assert.ok(!/[<>]/.test(sin.name));
  assert.equal(sin.zone, 'Coyoacán');
  assert.equal(sin.description, 'Espacio publicado en Cuicoyan.');
  assert.deepEqual(sin.categorySlugs, ['teatro', 'musica']);
  assert.deepEqual(sin.categories, ['Teatro', 'Música']);
  assert.equal(sin.coordinates, null);
  assert.deepEqual(sin.mapPoint, { x: 50, y: 50, isConceptual: true });
  assert.equal(sin.website, 'https://foro.mx/');
  assert.equal(sin.isDemo, false);
  assert.equal(sin.contentStatus, 'published');

  const con = venueFromRow({ id: 'v2', slug: 'casa-x', name: 'Casa X', status: 'published', data: { map: { lat: '19.42', lng: '-99.16' } } });
  assert.deepEqual(con.coordinates, [-99.16, 19.42]);
  assert.equal(con.mapPoint.isConceptual, false);
  assert.equal(con.zone, 'CDMX');
  assert.equal(con.avatarUrl, '');
});
