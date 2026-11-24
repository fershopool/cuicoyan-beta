import assert from 'node:assert/strict';
import test from 'node:test';

const { configStatus, toRemoteFavorite, fromRemoteRows, mergeFavorites, displayNameFrom, avatarFrom } = await import('../frontend/src/services/supabase-logic.js');

test('sin configuración de Supabase el estado es sin-configurar y nunca lanza', () => {
  assert.equal(configStatus({}), 'sin-configurar');
  assert.equal(configStatus({ supabaseUrl: '', supabaseAnonKey: '' }), 'sin-configurar');
  assert.equal(configStatus({ supabaseUrl: 'https://x.supabase.co', supabaseAnonKey: '' }), 'sin-configurar');
  assert.equal(configStatus({ supabaseUrl: 'no es url', supabaseAnonKey: 'k' }), 'sin-configurar');
  assert.equal(configStatus({ supabaseUrl: 'http://ejemplo.com', supabaseAnonKey: 'k' }), 'sin-configurar');
  assert.equal(configStatus(), 'sin-configurar');
});

test('con URL https y clave, o localhost, la configuración está lista', () => {
  assert.equal(configStatus({ supabaseUrl: 'https://abc.supabase.co', supabaseAnonKey: 'k' }), 'lista');
  assert.equal(configStatus({ supabaseUrl: 'http://127.0.0.1:54321', supabaseAnonKey: 'k' }), 'lista');
});

test('favorito local se convierte en fila de public.favorites con tipos de la base', () => {
  assert.deepEqual(toRemoteFavorite('u1', { type: 'event', id: 'sones' }), { user_id: 'u1', item_type: 'evento', item_slug: 'sones' });
  assert.deepEqual(toRemoteFavorite('u1', { type: 'artist', id: 'luna' }), { user_id: 'u1', item_type: 'artista', item_slug: 'luna' });
  assert.deepEqual(toRemoteFavorite('u1', { type: 'venue', id: 'foro-alicia' }), { user_id: 'u1', item_type: 'foro', item_slug: 'foro-alicia' });
  assert.equal(toRemoteFavorite('u1', { type: 'otro', id: 'x' }), null);
  assert.equal(toRemoteFavorite(null, { type: 'event', id: 'x' }), null);
  assert.equal(toRemoteFavorite('u1', { type: 'event', id: '' }), null);
});

test('filas remotas vuelven a favoritos locales, descartan tipos desconocidos y duplicados', () => {
  const rows = [
    { item_type: 'evento', item_slug: 'sones' },
    { item_type: 'artista', item_slug: 'luna' },
    { item_type: 'evento', item_slug: 'sones' },
    { item_type: 'desconocido', item_slug: 'x' },
    null,
  ];
  assert.deepEqual(fromRemoteRows(rows), [{ type: 'event', id: 'sones' }, { type: 'artist', id: 'luna' }]);
  assert.deepEqual(fromRemoteRows(undefined), []);
});

test('mezcla local y remota: une sin duplicar y marca para subir solo lo que falta en el servidor', () => {
  const local = [{ type: 'event', id: 'a' }, { type: 'venue', id: 'b' }];
  const remote = [{ type: 'event', id: 'a' }, { type: 'artist', id: 'c' }];
  const { merged, toUpload } = mergeFavorites(local, remote);
  assert.deepEqual(merged, [{ type: 'event', id: 'a' }, { type: 'venue', id: 'b' }, { type: 'artist', id: 'c' }]);
  assert.deepEqual(toUpload, [{ type: 'venue', id: 'b' }]);
});

test('nombre visible y avatar salen de la sesión, sin datos inventados', () => {
  const session = { user: { email: 'persona@ejemplo.mx', user_metadata: { full_name: 'Persona Demo', avatar_url: 'https://img.ejemplo.mx/a.png' } } };
  assert.equal(displayNameFrom(session), 'Persona Demo');
  assert.equal(avatarFrom(session), 'https://img.ejemplo.mx/a.png');
  assert.equal(displayNameFrom({ user: { email: 'solo@ejemplo.mx' } }), 'solo@ejemplo.mx');
  assert.equal(displayNameFrom(null), 'Mi cuenta');
  assert.equal(avatarFrom({ user: { user_metadata: { picture: 'http://inseguro.mx/a.png' } } }), '');
});
