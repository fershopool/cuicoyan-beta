import assert from 'node:assert/strict';
import test from 'node:test';

const A = await import('../frontend/src/services/account-logic.js');

test('insignia de estado: texto y tono por estado, desconocido = borrador', () => {
  assert.deepEqual(A.statusBadge('pending'), { label: 'En revisión', tone: 'pending' });
  assert.deepEqual(A.statusBadge('published'), { label: 'Publicado', tone: 'published' });
  assert.deepEqual(A.statusBadge('rejected'), { label: 'Rechazado', tone: 'rejected' });
  assert.deepEqual(A.statusBadge('raro'), { label: 'Borrador', tone: 'draft' });
});

test('enlace a /perfil/: con y sin id, id codificado', () => {
  assert.equal(A.profileQuery('artista', ''), '?tipo=artista');
  assert.equal(A.profileQuery('foro', 'abc-1'), '?tipo=foro&id=abc-1');
  assert.equal(A.profileQuery('foro', 'a b'), '?tipo=foro&id=a%20b');
});

test('crear: bloqueado al llegar a 3 perfiles de un tipo', () => {
  assert.equal(A.createState(0).full, false);
  assert.equal(A.createState(2).full, false);
  assert.equal(A.createState(3).full, true);
  assert.match(A.createState(3).notice, /máximo/);
  assert.equal(A.createState(1).notice, '');
});

test('título de favorito: nombre legible o id si no se encontró', () => {
  assert.equal(A.favoriteTitle({ title: 'Sones del barrio' }, 'event-demo-sones'), 'Sones del barrio');
  assert.equal(A.favoriteTitle({ name: ' Foro Alicia ' }, 'foro-alicia-id'), 'Foro Alicia');
  assert.equal(A.favoriteTitle(null, 'event-demo-sones'), 'event-demo-sones');
  assert.equal(A.favoriteTitle({ name: '   ' }, 'x1'), 'x1');
});

test('aviso de favoritos locales solo con login disponible y sin sesión', () => {
  assert.match(A.favoritesNotice({ configured: true, signedIn: false, count: 2 }), /cuando inicies sesión/);
  assert.equal(A.favoritesNotice({ configured: true, signedIn: true, count: 2 }), '');
  assert.equal(A.favoritesNotice({ configured: true, signedIn: false, count: 0 }), '');
  assert.equal(A.favoritesNotice({ configured: false, signedIn: false, count: 2 }), '');
});

test('tipo: etiqueta legible', () => {
  assert.equal(A.kindTitle('artista'), 'Artista');
  assert.equal(A.kindTitle('foro'), 'Foro');
});
