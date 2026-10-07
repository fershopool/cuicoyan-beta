# Integración Cuicoyan con el IdP Ollin (puntos 14-18, tareas A, B y C)

La API vive en `AAA.Base/Identificador_tlatolli` (puntos 14-17, A, B, C); la web en este repo (18, A, B, C). Sin push; nada aplicado a Supabase real.

## Base (14-18)
- FK a `app.principals`, `withPrincipal` (`lib/cuicoyan/db.ts`), rol `cuicoyan_web` sin acceso a `app.*`, RLS ENABLE+FORCE en todas las tablas, Data API cerrada, auditoría append-only. Web: login `/auth/login`, cookie same-origin + CSRF, mensajes fijos (`auth.service.js`, `auth-errors.js`).
- Admin = membresía Ollin activa `cuicoyan` con rol admin o reviewer. Vista pública con `security_invoker`.

## A: invitación de un solo uso
- `20261008`: `accept_invitation(token_hash)` consume en una sentencia (vigente, perfil activo, email verificado = invitado). TTL 30 min (`CUICOYAN_INVITE_TTL_MINUTES`, máx 24 h). Token solo como hash, en el fragmento `#`; la web lo quita con `replaceState`; `Referrer-Policy: no-referrer`; error único "Invitación no válida".
- Pendiente: el token de Ollin (`o`) pasa una vez por query en `/auth/login?invite=`.

## B: Turnstile en `contact_requests`
- `lib/cuicoyan/turnstile.ts`: origen, rate limit por IP (`CF-Connecting-IP` solo con `TRUST_PROXY=true`), cuerpo máx 16 KB, `siteverify`, falla cerrada. CSP solo abre `challenges.cloudflare.com`.
- `/unete` ya envía a `/api/cuicoyan/contact-requests` (`frontend/src/services/contact-request.js`) con el token; FormSubmit eliminado (JS y CSP).
- Pendiente: rate limit en memoria por proceso (falta Cloudflare o tabla); sin `VITE_TURNSTILE_SITE_KEY` el widget no aparece.

## C: cierre
- 009 (`ollin-platform`): revisada; funciones definer, search_path fijo, sin EXECUTE a PUBLIC/anon, email solo a su titular, sin PII en logs. Añadidos 5 pgTAP de privacidad (`conformance/pgtap.sql`, plan 45).
- Eventos/espacios: no estaban versionados; `20261009_cuicoyan_events_spaces.sql` crea tablas y vistas, RLS FORCE solo lectura (publicado para todos, borradores admin), pgTAP 23; grants condicionales eliminados de 20261002/04/05 y del stub.
- E2E: `npm run e2e` en `Cuicoyan/web/frontend` (requiere `make g1` y auth-server en :18787): login por Keycloak, cookie, `/auth/me` con principal y email, 401 sin cookie.
- Docs: `docs/cuicoyan-profile-workflow.md` reescrito al flujo IdP. `dist/` en `.gitignore`; borrados los 7 archivos sin trackear.

## Correcciones de auditoría
- `/unete` envía `X-Requested-With` (antes 403 real); la web y la API van en el mismo origen (ruta relativa). Test con el chequeo real `hasCuicoyanOrigin` (`lib/cuicoyan/csrf.ts`).
- CSP: `/unete` con `connect-src` de Turnstile; `/invitacion/` con CSP propia; token guardado caduca a los 10 min.
- Sin IP fiable (`TRUST_PROXY=false`) el captcha se verifica antes de contar el cubo global (`admitContact`): las peticiones inválidas no lo agotan.
- Reinvitar revoca las pendientes del mismo perfil y email (pgTAP 24). Hallazgos 5-7: pendientes de anotar (texto no recibido).

## Verificado
- `make g1`: G1 PASS (conformance 15, pgTAP 45). `tests/pg/run.sh`: archivos 14, 16, 17, 20-23 en verde + db.test (4). API: `tsc`, `next build`, `test:cuicoyan` (3), `test:turnstile` (5). Web: `npm test` 11, build, check:links, check:content.

## Pendiente y límites
- E2E completo (withPrincipal, invitación y formulario contra auth-server real) no hecho: la BD de la API (lab 55433) y la del auth-server (ollin-pg) son distintas; falta una BD compartida y arrancar `next dev` en el mismo origen.
- Las migraciones requieren superusuario; si el Supabase real ya tiene eventos con otra forma, reconciliar antes de 20261009.
- `dist/` sigue trackeado y desactualizado; falta aprobar el reparto `/auth` y `/api` bajo un mismo origen.
