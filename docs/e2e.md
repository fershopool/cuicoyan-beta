# E2E completo (IdP real + API + web, un solo origen)

Un solo comando:

```
cd Cuicoyan/web/frontend && npm run e2e:full      # o: make -C ollin-platform e2e
```

Requisitos: Docker, Node 24, red (la verificación de Turnstile llama a `challenges.cloudflare.com` con las claves de prueba publicadas por Cloudflare: secreto `1x0000000000000000000000000000000AA`, token ficticio `XXXX.DUMMY.TOKEN.XXXX`). Puertos libres: 18787, 18790, 13001, 14173, 55434 (el script aborta si `make g1` u otra corrida los ocupa). `E2E_KEEP=1` conserva el Postgres al terminar. Registros en `Cuicoyan/web/.e2e/` (ignorado por git).

## Qué levanta (`scripts/e2e-full.sh`)
- Keycloak del lab (`ollin-platform/iac/idp-lab`, puerto 8081), sin tocar el contenedor `ollin-pg` ni Supabase.
- Un Postgres desechable (`cuicoyan-e2e-pg`, :55434) con UNA base `ollin_e2e` que contiene `app.*` (todas las migraciones del auth-server) y `cuicoyan.*` (migraciones 20260926 a 20261009). Roles `app_rw` (auth-server) y `cuicoyan_web` (API) con contraseñas aleatorias por corrida.
- auth-server real (:18790), API Next.js en build de producción (:13001) y la web estática (:14173).
- `scripts/e2e-proxy.mjs` (:18787): un único origen `http://localhost:18787` con `/auth/*` -> auth-server, `/api/*` -> API, resto -> web. `/admin/*` no se expone; el proxy sustituye `CF-Connecting-IP` como lo hace Cloudflare (`TRUST_PROXY=true` en la API).

## Qué prueba (`tests/e2e/full.test.mjs`, 11 pruebas)
1. Mismo origen y `/admin` oculto; páginas `/unete/` e `/invitacion/`.
2. Login real por Keycloak, cookie `__Host-sid`, admin en la API (membresía + sonda privilegiada), 401 sin sesión.
3. `/unete`: el servicio real del frontend (`contact-request.js`) crea la solicitud; falla cerrada sin captcha, sin CSRF, con origen ajeno o cuerpo > 16 KB; 429 por IP.
4. `withPrincipal` y RLS: `cuicoyan_web` sin acceso a `app.*`; anónimo solo publicados; cada principal ve lo suyo; no edita lo ajeno; el contexto no se hereda.
5. Invitación: token opaco de 256 bits, solo hash en BD, TTL 30 min, ligada al email (otra persona no la usa ni consume), un solo uso (reuso rechazado), reinvitar revoca la anterior, vencida rechazada, auditoría `invitation.created/accepted`, `?invite=` por query rechazado (L6).

## Límites y hallazgos
- Turnstile solo cubre el camino de éxito (secreto de prueba que siempre pasa); el rechazo se prueba con token ausente/vacío, no con los secretos de fallo de Cloudflare (requerirían otra instancia de la API).
- No se prueba el widget en navegador (sin `VITE_TURNSTILE_SITE_KEY`) ni el JS de `/invitacion/` en DOM real.
- Hallazgo menor: `next.config.mjs` aplica `Referrer-Policy: strict-origin-when-cross-origin` a todo y pisa el `no-referrer` que fija `me/invitations/accept`; sin impacto práctico (JSON, y la página lo fija por `<meta>`), pero conviene quitarlo de la config global para esa ruta.
- Depende de que el auth-server en el árbol compile (`npm run build`) y de las variables obligatorias de su `config.ts`.
