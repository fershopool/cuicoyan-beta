import assert from 'node:assert/strict';
import test from 'node:test';

const logic = await import('../frontend/src/services/profiles-admin-logic.js');
const { validateDecision, buildPendingList, safeHttpUrl, canPreview, summaryFields, tableFor, formatDate, NOTE_MIN, NOTE_MAX, LIST_LIMIT } = logic;

test('rechazar exige nota de al menos 10 caracteres sin contar espacios de los extremos', () => {
  assert.equal(validateDecision('artista', 'rejected', 'abcdefghi').ok, false);
  assert.equal(validateDecision('artista', 'rejected', '   abcdefghi   ').ok, false);
  assert.equal(validateDecision('artista', 'rejected', 'abcdefghij').ok, true);
  assert.equal(validateDecision('foro', 'rejected', undefined).ok, false);
  assert.equal(NOTE_MIN, 10);
});

test('aprobar no exige nota y la nota vacía queda en null', () => {
  assert.deepEqual(validateDecision('foro', 'published', '   '), { ok: true, note: null });
  assert.deepEqual(validateDecision('foro', 'published', ' Listo '), { ok: true, note: 'Listo' });
});

test('la nota no puede superar 500 caracteres', () => {
  assert.equal(validateDecision('artista', 'published', 'x'.repeat(NOTE_MAX)).ok, true);
  assert.equal(validateDecision('artista', 'published', 'x'.repeat(NOTE_MAX + 1)).ok, false);
});

test('tipo y decisión no válidos se rechazan', () => {
  assert.equal(validateDecision('evento', 'published', '').ok, false);
  assert.equal(validateDecision('artista', 'pending', '').ok, false);
  assert.equal(tableFor('artista'), 'artist_profiles');
  assert.equal(tableFor('foro'), 'venue_profiles');
  assert.equal(tableFor('otro'), null);
});

test('la lista combina ambas tablas, marca el tipo, ordena por envío con nulos al final y filtra no pendientes', () => {
  const artists = [
    { id: 'a1', status: 'pending', submitted_at: '2026-11-05T10:00:00Z' },
    { id: 'a2', status: 'pending', submitted_at: null },
    { id: 'a3', status: 'published', submitted_at: '2026-01-01T00:00:00Z' },
  ];
  const venues = [
    { id: 'v1', status: 'pending', submitted_at: '2026-11-01T10:00:00Z' },
  ];
  const list = buildPendingList(artists, venues);
  assert.deepEqual(list.map((row) => row.id), ['v1', 'a1', 'a2']);
  assert.equal(list[0].kind, 'foro');
  assert.equal(list[0].kindLabel, 'Foro');
  assert.equal(list[1].kind, 'artista');
  assert.equal(list[1].kindLabel, 'Artista');
});

test('la lista tiene límite de 100 elementos', () => {
  const many = Array.from({ length: 150 }, (_, i) => ({ id: `x${i}`, status: 'pending', submitted_at: `2026-02-${String((i % 28) + 1).padStart(2, '0')}T00:00:00Z` }));
  assert.equal(buildPendingList(many, []).length, LIST_LIMIT);
  assert.deepEqual(buildPendingList(), []);
});

test('safeHttpUrl acepta solo http y https', () => {
  assert.equal(safeHttpUrl('https://cuicoyan.test/x'), 'https://cuicoyan.test/x');
  assert.equal(safeHttpUrl('http://ejemplo.mx'), 'http://ejemplo.mx/');
  assert.equal(safeHttpUrl('javascript:alert(1)'), null);
  assert.equal(safeHttpUrl('data:text/html,hola'), null);
  assert.equal(safeHttpUrl('cuicoyan.mx'), null);
  assert.equal(safeHttpUrl(''), null);
  assert.equal(safeHttpUrl(42), null);
});

test('canPreview solo con perfil publicado y slug', () => {
  assert.equal(canPreview({ status: 'published', slug: 'mi-danza' }), true);
  assert.equal(canPreview({ status: 'pending', slug: 'mi-danza' }), false);
  assert.equal(canPreview({ status: 'published', slug: '' }), false);
  assert.equal(canPreview(null), false);
});

test('summaryFields resume bio, lugar, redes y web sin HTML', () => {
  const s = summaryFields({ data: { bio: ' Compañía de danza ', discipline: 'Danza', zone: 'Coyoacán', social: { instagram: '@compania', tiktok: '' }, website: 'javascript:x' } });
  assert.equal(s.bio, 'Compañía de danza');
  assert.equal(s.place, 'Danza · Coyoacán');
  assert.deepEqual(s.social, ['Instagram: @compania']);
  assert.equal(s.website, null);
  const empty = summaryFields({ data: null });
  assert.deepEqual(empty, { bio: '', place: '', social: [], website: null });
});

test('formatDate devuelve vacío para fechas inválidas', () => {
  assert.equal(formatDate('no-es-fecha'), '');
  assert.equal(formatDate(null), '');
  assert.notEqual(formatDate('2026-11-05T10:00:00Z'), '');
});
