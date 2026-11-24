# Auditoría de lanzamiento beta (2026-11-23)

Alcance: sitio estático en GitHub Pages + Supabase (Postgres + Google). Sin alta de artistas ni foros. Usuarios finales con login Google, perfil y favoritos.

## Hecho
- Creación/edición de perfiles de artista y foro oculta (`frontend/src/config/test-access.js`, `false`). Los editores se conservan para después.
- Login con Google (Supabase), página `/cuenta/`, favoritos sincronizados. Sin config: el sitio funciona sin sesión.
- Migración `supabase/migrations/20261123000000_mvp_users.sql` (perfiles, favoritos, RLS solo dueño). Probada en Postgres local, no en Supabase real.
- Workflow `.github/workflows/pages.yml` y guía `docs/lanzamiento-beta.md`.
- Build, 60 tests, check:links y check:content en verde.

## Bloqueantes para lanzar (acciones tuyas)
1. Crear proyecto Supabase, correr la migración, copiar URL y anon key (`supabase/README.md`).
2. Crear el OAuth client de Google (Google Cloud) y activarlo en Supabase Auth; pantalla de consentimiento con privacidad y términos.
3. Crear repo de GitHub para la beta (hoy el repo web es `fershopool/cuicoyan-web`, sitio actual), activar Pages con GitHub Actions y fijar variables `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SITE_BASE`.
4. DNS: CNAME del subdominio beta hacia `<usuario>.github.io`. `ollin.digital` lo administra Ollin: pedirle el registro.
5. Allowlist de redirect en Supabase con la URL final.

## Pendiente antes de invitar a artistas y foros
- Canal de captación sin formulario de alta: lista de espera o contacto (el texto «Próximamente» ya está). Falta decidir dónde se guardan esos datos.
- Revisar textos de privacidad/términos para datos de Google (nombre, correo, foto) y borrado de cuenta.
- Contenido: hoy los artistas, foros y eventos son demo estático (`src/data/*.json`). Reemplazar por contenido real o marcarlo como ejemplo.
- Rutas `/invitacion/` y `/admin/` (flujo Ollin) siguen en el código sin depender de la bandera; ocultarlas o retirarlas del build beta.
- Analítica y reporte de errores: no hay.

## Riesgos conocidos (aceptados en MVP)
- Favoritos: un cambio hecho durante la sincronización inicial puede deshacerse; no hay tombstones entre dispositivos.
- supabase-js se carga desde jsDelivr (versión fija 2.45.4, sin SRI). Mejor servirlo desde el propio dominio después.
- Errores de subida de favoritos se ignoran en silencio (incluido el tope de 500).

## No migrado
El backend anterior (`server/`, `bff/`, `db/`, Ollin/Keycloak, invitación y aprobación) no se usa en la beta. Sigue intacto en el repo principal para cuando Ollin cierre sus pendientes.
