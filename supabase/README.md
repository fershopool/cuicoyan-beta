# Supabase: configuración del MVP

Migración: `migrations/20261123000000_mvp_users.sql` (tablas `profiles` y `favorites`, RLS, triggers).

## 1. Crear el proyecto

1. En https://supabase.com crea un proyecto nuevo.
2. Anota el **Project URL** y la **anon key** (Settings > API).

## 2. Correr la migración

- **SQL Editor:** pega el contenido de `migrations/20261123000000_mvp_users.sql` y ejecútalo.
- **CLI:** desde la raíz del repo, `supabase link --project-ref <ref>` y luego `supabase db push`.

## 3. Habilitar Google

1. En Google Cloud, crea un OAuth client (tipo "Web application").
2. Como redirect URI usa `https://<ref>.supabase.co/auth/v1/callback`.
3. En Supabase: Authentication > Providers > Google. Pega Client ID y Client Secret y guarda.

## 4. URL Configuration

En Authentication > URL Configuration:

- **Site URL:** `https://<dominio-beta>`
- **Redirect URLs:** `https://<dominio-beta>/**` y `http://localhost:*`

## 5. Variables de GitHub Actions

En el repo: Settings > Secrets and variables > Actions, crea:

- `SUPABASE_URL`: el Project URL.
- `SUPABASE_ANON_KEY`: la anon key.

La anon key es pública y puede ir en el front. **Nunca** uses ni subas la `service_role` key.

## 6. Perfiles, aprobación y fotos

Migración: `migrations/20261124000000_profiles_review.sql` (ejecútala después de la de usuarios). Crea `artist_profiles`, `venue_profiles`, `admins` y el bucket `profile-media`.

- **Flujo:** el dueño crea el perfil en `draft` y lo envía a `pending` (se marca `submitted_at`). Un admin lo pasa a `published` (`published_at`) o a `rejected` con `review_note` (máx. 500). Si el dueño edita un perfil `published`, vuelve a `pending`.
- **Límite:** 3 perfiles por cuenta y por tabla.
- **Anon:** solo lee filas `published` y solo columnas públicas (sin `owner_id` ni `review_note`). Desde anon pide columnas explícitas en la consulta.
- **Admins:** se dan de alta a mano en el SQL editor con el `id` de `auth.users`: `insert into public.admins (user_id) values ('<uid>');`. La API no puede leer ni escribir esa tabla. El SQL editor no tiene JWT, así que ahí no se aplican las reglas de dueño (sirve para aprobar a mano).
- **Fotos:** bucket público `profile-media`, máx. 2 MB, JPEG, PNG o WebP. Ruta: `<uid>/<artist|venue>/<profile_id>/<archivo>`. Cada usuario solo escribe en su carpeta. Lo que se sube es legible por URL, pero solo el dueño puede listar su carpeta.
- **Probado:** en Postgres local con stubs de `auth` y `storage`: transiciones, RLS, columnas de anon, límite y re-ejecución idempotente. **No probado:** el storage real de Supabase y PostgREST.
