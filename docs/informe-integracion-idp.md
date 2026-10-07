# Integración Cuicoyan con el IdP Ollin (puntos 14-18)

La API de Cuicoyan NO vive en `Cuicoyan/web`: está en `AAA.Base/Identificador_tlatolli` (repo nuevo, base `82385d7`). Los puntos 14-17 están allí (cuatro commits); el 18 está en este repo (`573f0db`). Sin push.

## Qué se hizo
- 14 `supabase/20261001_cuicoyan_principal_fk.sql`: 5 FK pasan de `auth.users` a `app.principals`; columnas renombradas a `*_principal_id`; `admin_users` migra a membresía Ollin (scope `cuicoyan`); invitaciones ganan `token_hash`. Datos de laboratorio conservan su UUID; los principales migrados nacen `suspended` y sin identidad.
- 15 `lib/cuicoyan/db.ts:50` `withPrincipal` (BEGIN, `set_config(...,true)`, rol cuicoyan_web; falla si es superuser, BYPASSRLS o tiene escritura en app.*; si ROLLBACK falla destruye la conexión); `cuicoyanQuery` y `lib/cuicoyan/supabase/*` eliminados. `auth.ts` valida la cookie `__Host-sid` contra `/auth/me` del auth-server; rutas admin además sondean `/auth/sessions` (privilegiada). Migración `20261002` (grants + `cuicoyan.accept_invitation` SECURITY DEFINER, dueña app_system).
- Auditoría independiente (corregida): `20261005` rol `cuicoyan_web` sin USAGE en `app` (identidad/rol por funciones definer de solo lectura; antes app_rw podía autoescalar); `20261006` aceptar invitación no pisa rol ni reactiva revocadas; `20261007` `audit_log` solo admin/miembro con actor propio; `db.ts` release(true) tras ROLLBACK fallido.
- 16 `20261003_cuicoyan_rls_principal.sql`: RLS ENABLE+FORCE en las 6 tablas, políticas por principal/admin/miembro, principal suspendido sin acceso, auditoría append-only.
- 17 `20261004_cuicoyan_close_data_api.sql`: revoca anon, authenticated, service_role y PUBLIC en el esquema; solo SELECT en `v_profile_discovery` (y vistas de eventos si existen).
- 18 `frontend/src/services/auth.service.js`, `auth-errors.js`, `main.js:151-185`: login `/auth/login?return_to=`, cookie same-origin + cabecera CSRF, sin tokens en JS, mensajes fijos (sesión expirada, invitación inválida, IdP caído con `idpPhase` según `VITE_IDP_FAILURE_GRACE_SECONDS`).

## Verificado
- `tests/pg/run.sh` (Postgres 17 + pgTAP en Docker, contenedor `cuicoyan-pg-lab`, puerto 55433): archivos 14, 16, 17, 20 (rol web), 21 (aceptación), 22 (auditoría) en verde; `tests/db.test.mjs` (4) en verde. ollin-platform no se modificó. Mutando una política de 16 fallan 4 pruebas.
- API: `npx tsc --noEmit`, `npm run build` y `npm run test:cuicoyan` en verde.
- Web: `npm test` (6), `build`, `check:links`, `check:content` en verde.

## Defaults elegidos (más seguros)
- Admin = membresía activa `cuicoyan` con rol admin o reviewer (como antes).
- Invitación: token Ollin + token propio de un solo uso; el admin recibe `login_path` en la respuesta (no hay correo). El token viaja por query (L6 de ollin-platform pendiente).
- Vista pública con `security_invoker`: anon/authenticated tienen el GRANT pero fallan cerrado.

## Decisiones pendientes del usuario (hallazgos 2 y 6, sin cambiar)
- Enlace de invitación en query (`/auth/login?invite=...&return_to=...&token=...`): puede quedar en logs y Referer (ya era L6 en ollin-platform). Alternativa: POST o fragmento.
- `POST /api/cuicoyan/contact-requests` es anónimo y su límite es en memoria por proceso: sin rate limit distribuido (Cloudflare o tabla).

## Pendientes y límites
- Las tablas de eventos/espacios no están versionadas: grants y RLS de lectura se aplican solo si existen; revisar contra el esquema real. Lab usa stubs en `tests/pg/fixtures/lab_stub.sql`.
- Los scripts de migración requieren superusuario (ALTER FUNCTION OWNER, FORCE RLS). Nada se aplicó a Supabase real.
- Sin prueba end-to-end contra auth-server y Keycloak (solo `interpretMe` por lectura y mocks); falta aprobar el reparto `/auth` y `/api` bajo un mismo origen.
- Sin tests unitarios de `auth.ts`/`workflow.ts`.
- `dist/` está versionado y desactualizado: no se reconstruyó; hay 7 archivos de build sin trackear en `dist/` (rm denegado) que puede borrar a mano.
- `docs/cuicoyan-profile-workflow.md` (repo API) aún describe Supabase Auth; actualizar.
- Archivos `docs/auditoria-*` preexistentes sin trackear: no se tocaron.
