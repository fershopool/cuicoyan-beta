import assert from 'node:assert/strict';
import test from 'node:test';

const L = await import('../frontend/src/services/profiles-logic.js');

test('slug: sin acentos, minúsculas, guiones y sufijo de 4 caracteres', () => {
  assert.equal(L.slugify('Raíces del Viento!'), 'raices-del-viento');
  assert.equal(L.slugify('   '), 'perfil');
  assert.equal(L.makeSlug('Ñandú Tango', () => 0), 'nandu-tango-aaaa');
  assert.match(L.makeSlug('Foro'), /^foro-[a-z0-9]{4}$/);
  assert.equal(L.slugify('x'.repeat(100)).length <= 48, true);
});

test('fila → objeto y de vuelta sin perder el contenido del editor', () => {
  const row = { id: 'u1', slug: 's', name: 'Ana', status: 'pending', review_note: null, data: { bio: 'x' }, avatar_path: 'a/b.png', cover_path: null };
  const profile = L.fromRow(row);
  assert.equal(profile.status, 'pending');
  assert.equal(profile.reviewNote, '');
  assert.deepEqual(profile.data, { bio: 'x' });
  assert.equal(profile.coverPath, null);
  assert.equal(L.fromRow(null), null);
  assert.deepEqual(L.toRowFields({ name: ' Ana ', data: { bio: 'x' } }), { name: 'Ana', data: { bio: 'x' } });
  assert.deepEqual(L.toRowFields({ name: 'A', data: {}, avatarPath: '', coverPath: 'c' }), { name: 'A', data: {}, avatar_path: null, cover_path: 'c' });
});

test('imágenes: solo jpeg, png o webp y máximo 2 MB', () => {
  assert.equal(L.validateImage({ type: 'image/jpeg', size: 1000 }), '');
  assert.equal(L.validateImage({ type: 'image/webp', size: 2 * 1024 * 1024 }), '');
  assert.match(L.validateImage({ type: 'image/gif', size: 10 }), /JPG, PNG o WebP/);
  assert.match(L.validateImage({ type: 'image/png', size: 2 * 1024 * 1024 + 1 }), /2 MB/);
  assert.match(L.validateImage({ type: 'image/png', size: 0 }), /vacía/);
});

test('ruta de storage: <uid>/<artist|venue>/<id>/<archivo>', () => {
  assert.equal(L.storagePath('u1', 'artista', 'p1', 'cover-1.jpg'), 'u1/artist/p1/cover-1.jpg');
  assert.equal(L.storagePath('u1', 'foro', 'p1', 'a b.png'), 'u1/venue/p1/a-b.png');
  assert.throws(() => L.storagePath('', 'foro', 'p1', 'x.png'));
  assert.throws(() => L.storagePath('u1', 'otro', 'p1', 'x.png'), /tipo-desconocido/);
  assert.match(L.imageFileName('cover', 'image/png', 5), /^cover-5\.png$/);
});

test('estados y límites: enviar solo desde borrador o rechazado, máximo 3 por tipo', () => {
  assert.equal(L.canSubmit('draft'), true);
  assert.equal(L.canSubmit('rejected'), true);
  assert.equal(L.canSubmit('pending'), false);
  assert.equal(L.canSubmit('published'), false);
  assert.equal(L.canCreate(2), true);
  assert.equal(L.canCreate(3), false);
  assert.equal(L.STATUS_LABELS.pending, 'En revisión');
});
