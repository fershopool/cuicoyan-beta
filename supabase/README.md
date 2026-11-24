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
