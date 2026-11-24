// ponytail: bandera del MVP beta. Con `false` no se puede crear ni editar perfiles de artista ni de foro:
// se ocultan «Perfil» en el menú, «Editar perfil», el selector de registro (/perfil/) y los formularios de
// /unete/ y /para-creadores/, que muestran «Próximamente: registro de artistas y foros».
// Los editores (components/profile-*.js, venue-editor.js, main.js renderProfile) se conservan. Con `true`
// vuelven los accesos de pruebas. Quitar la bandera al conectar la base de datos y la sesión real.
export const TEST_EDIT_ACCESS = false;
