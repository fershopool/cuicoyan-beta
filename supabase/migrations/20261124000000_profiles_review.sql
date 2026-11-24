-- Perfiles de artista y de recinto: borrador, envío a revisión, aprobación por admin y fotos.
-- Idempotente. Depende de public.set_updated_at() (migración 20261123000000_mvp_users.sql).

-- 1) Admins (se llenan a mano con SQL; la API no los ve) --------------------

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 2) Tablas ------------------------------------------------------------------

create table if not exists public.artist_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  slug text not null unique
    check (char_length(slug) between 3 and 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 160),
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'published', 'rejected')),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 200000),
  avatar_path text,
  cover_path text,
  review_note text check (char_length(review_note) <= 500),
  submitted_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artist_profiles_owner_id_idx on public.artist_profiles (owner_id);
create index if not exists artist_profiles_status_idx on public.artist_profiles (status);

create table if not exists public.venue_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  slug text not null unique
    check (char_length(slug) between 3 and 80 and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 160),
  status text not null default 'draft'
    check (status in ('draft', 'pending', 'published', 'rejected')),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) < 200000),
  avatar_path text,
  cover_path text,
  review_note text check (char_length(review_note) <= 500),
  submitted_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venue_profiles_owner_id_idx on public.venue_profiles (owner_id);
create index if not exists venue_profiles_status_idx on public.venue_profiles (status);

-- 3) Funciones de trigger -----------------------------------------------------

-- Reglas de transición. Se usa en ambas tablas (mismas columnas).
-- SECURITY INVOKER a propósito: dentro de una función SECURITY DEFINER, current_user
-- es el dueño de la función (postgres) y saltaría el guard para todos.
-- Confianza = la sesión es postgres/service_role/supabase_admin (SQL editor, service role).
-- anon y authenticated nunca cumplen, tengan o no sub en los claims.
create or replace function public.profile_guard()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_trusted boolean := current_user in ('postgres', 'service_role', 'supabase_admin');
  v_admin boolean;
begin
  if not v_trusted then
    v_admin := public.is_admin();
  end if;

  if not v_trusted and new.owner_id is distinct from old.owner_id then
    raise exception 'owner_id no es editable' using errcode = '42501';
  end if;

  if not v_trusted and not v_admin then
    -- Slug inmutable para el dueño en cualquier estado (es la URL pública).
    if new.slug is distinct from old.slug then
      raise exception 'slug no es editable' using errcode = '42501';
    end if;
    -- En revisión el admin aprueba exactamente lo que se revisó.
    if old.status = 'pending' and (
         new.name is distinct from old.name
      or new.data is distinct from old.data
      or new.avatar_path is distinct from old.avatar_path
      or new.cover_path is distinct from old.cover_path) then
      raise exception 'el perfil está en revisión' using errcode = '42501';
    end if;
    if new.review_note is distinct from old.review_note then
      raise exception 'review_note solo lo cambia un admin' using errcode = '42501';
    end if;
    if new.published_at is distinct from old.published_at then
      raise exception 'published_at solo lo cambia el sistema' using errcode = '42501';
    end if;
    if new.status = 'rejected' or (new.status = 'published' and old.status <> 'published') then
      raise exception 'el dueño no puede marcar published o rejected' using errcode = '42501';
    end if;
    -- Editar un perfil publicado lo manda otra vez a revisión.
    if new.status = 'published' then
      new.status := 'pending';
    end if;
    -- Desde pending el dueño no cambia el estado (lo decide el admin).
    if old.status = 'pending' and new.status <> 'pending' then
      raise exception 'un perfil en revisión no cambia de estado' using errcode = '42501';
    end if;
  end if;

  if new.status = 'published' and old.status <> 'published' then
    new.published_at := now();
  end if;
  if new.status = 'pending' and old.status <> 'pending' then
    new.submitted_at := now();
  end if;

  return new;
end;
$$;

revoke execute on function public.profile_guard() from public, anon, authenticated;

-- Máximo 3 perfiles por owner y por tabla. El advisory lock evita carreras entre inserts simultáneos.
create or replace function public.profile_limit_per_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(tg_table_name || ':' || new.owner_id::text, 0));
  execute format('select count(*) from public.%I where owner_id = $1', tg_table_name)
    into v_count
    using new.owner_id;
  if v_count >= 3 then
    raise exception 'máximo 3 perfiles por cuenta' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

revoke execute on function public.profile_limit_per_owner() from public, anon, authenticated;

-- 4) Triggers ----------------------------------------------------------------

drop trigger if exists artist_profiles_guard on public.artist_profiles;
create trigger artist_profiles_guard
before update on public.artist_profiles
for each row execute function public.profile_guard();

drop trigger if exists artist_profiles_set_updated_at on public.artist_profiles;
create trigger artist_profiles_set_updated_at
before update on public.artist_profiles
for each row execute function public.set_updated_at();

drop trigger if exists artist_profiles_limit on public.artist_profiles;
create trigger artist_profiles_limit
before insert on public.artist_profiles
for each row execute function public.profile_limit_per_owner();

drop trigger if exists venue_profiles_guard on public.venue_profiles;
create trigger venue_profiles_guard
before update on public.venue_profiles
for each row execute function public.profile_guard();

drop trigger if exists venue_profiles_set_updated_at on public.venue_profiles;
create trigger venue_profiles_set_updated_at
before update on public.venue_profiles
for each row execute function public.set_updated_at();

drop trigger if exists venue_profiles_limit on public.venue_profiles;
create trigger venue_profiles_limit
before insert on public.venue_profiles
for each row execute function public.profile_limit_per_owner();

-- 5) Privilegios y RLS -------------------------------------------------------

-- anon: solo columnas públicas (sin owner_id ni review_note).
-- authenticated: SELECT de tabla completa (no se puede dar por fila con grants de columna).
-- Decisión aceptada: en filas published ajenas puede leer owner_id (uuid opaco) y review_note.
-- Por eso review_note solo debe llevar texto que el dueño pueda ver.
revoke all on public.artist_profiles from anon, authenticated;
grant select (id, slug, name, status, data, avatar_path, cover_path,
  submitted_at, published_at, created_at, updated_at)
  on public.artist_profiles to anon;
grant select, insert, update on public.artist_profiles to authenticated;

revoke all on public.venue_profiles from anon, authenticated;
grant select (id, slug, name, status, data, avatar_path, cover_path,
  submitted_at, published_at, created_at, updated_at)
  on public.venue_profiles to anon;
grant select, insert, update on public.venue_profiles to authenticated;

alter table public.artist_profiles enable row level security;
alter table public.venue_profiles enable row level security;

drop policy if exists artist_profiles_select_anon on public.artist_profiles;
create policy artist_profiles_select_anon on public.artist_profiles
for select to anon
using (status = 'published');

drop policy if exists artist_profiles_select_auth on public.artist_profiles;
create policy artist_profiles_select_auth on public.artist_profiles
for select to authenticated
using (owner_id = (select auth.uid()) or status = 'published' or (select public.is_admin()));

drop policy if exists artist_profiles_insert_own on public.artist_profiles;
create policy artist_profiles_insert_own on public.artist_profiles
for insert to authenticated
with check (owner_id = (select auth.uid()) and status = 'draft');

drop policy if exists artist_profiles_update_own on public.artist_profiles;
create policy artist_profiles_update_own on public.artist_profiles
for update to authenticated
using (owner_id = (select auth.uid()) or (select public.is_admin()))
with check (owner_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists venue_profiles_select_anon on public.venue_profiles;
create policy venue_profiles_select_anon on public.venue_profiles
for select to anon
using (status = 'published');

drop policy if exists venue_profiles_select_auth on public.venue_profiles;
create policy venue_profiles_select_auth on public.venue_profiles
for select to authenticated
using (owner_id = (select auth.uid()) or status = 'published' or (select public.is_admin()));

drop policy if exists venue_profiles_insert_own on public.venue_profiles;
create policy venue_profiles_insert_own on public.venue_profiles
for insert to authenticated
with check (owner_id = (select auth.uid()) and status = 'draft');

drop policy if exists venue_profiles_update_own on public.venue_profiles;
create policy venue_profiles_update_own on public.venue_profiles
for update to authenticated
using (owner_id = (select auth.uid()) or (select public.is_admin()))
with check (owner_id = (select auth.uid()) or (select public.is_admin()));

-- 6) Fotos: bucket público (URLs /object/public sin política), carpeta <uid>/<artist|venue>/<profile_id>/<archivo> --
-- Sin SELECT público sobre storage.objects: nadie lista archivos ajenos ni borradores.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', true, 2097152,
  array['image/jpeg', 'image/png', 'image/webp'])
on conflict do nothing;

drop policy if exists profile_media_select_public on storage.objects;
drop policy if exists profile_media_select_own on storage.objects;
create policy profile_media_select_own on storage.objects
for select to authenticated
using (bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists profile_media_insert_own on storage.objects;
create policy profile_media_insert_own on storage.objects
for insert to authenticated
with check (bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists profile_media_update_own on storage.objects;
create policy profile_media_update_own on storage.objects
for update to authenticated
using (bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists profile_media_delete_own on storage.objects;
create policy profile_media_delete_own on storage.objects
for delete to authenticated
using (bucket_id = 'profile-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text);
