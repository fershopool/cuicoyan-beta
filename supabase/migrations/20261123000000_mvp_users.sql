-- MVP usuarios: perfiles y favoritos. Idempotente donde es posible.
-- Solo el dueño de cada fila puede leerla o modificarla (RLS con auth.uid()).

-- 1) Tablas ------------------------------------------------------------------

create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  item_type  text not null check (item_type in ('artista', 'foro', 'evento')),
  item_slug  text not null check (char_length(item_slug) between 1 and 120),
  created_at timestamptz not null default now(),
  primary key (user_id, item_type, item_slug)
);

-- 2) updated_at -----------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 3) Perfil automático al registrarse (Google u otro proveedor) -----------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Límite de favoritos por usuario (500) ----------------------------------------

create or replace function public.check_favorites_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Serializa inserciones del mismo usuario para que el conteo no se rebase.
  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 0));
  if (select count(*) from public.favorites where user_id = new.user_id) >= 500 then
    raise exception 'favorites_limit_exceeded' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists favorites_limit on public.favorites;
create trigger favorites_limit
  before insert on public.favorites
  for each row execute function public.check_favorites_limit();

-- 5) Permisos: nada para anon; authenticated solo lo necesario -------------------

revoke all on public.profiles  from anon, authenticated;
revoke all on public.favorites from anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;
grant select, insert, delete on public.favorites to authenticated;

-- 6) RLS: solo el dueño ----------------------------------------------------------

alter table public.profiles  enable row level security;
alter table public.favorites enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists favorites_select_own on public.favorites;
create policy favorites_select_own on public.favorites
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists favorites_insert_own on public.favorites;
create policy favorites_insert_own on public.favorites
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists favorites_delete_own on public.favorites;
create policy favorites_delete_own on public.favorites
  for delete to authenticated
  using (user_id = (select auth.uid()));
