-- Un perfil solo puede apuntar a imágenes de la carpeta de su dueño en el bucket. Idempotente.
-- `not valid`: no revisa filas ya guardadas; sí todas las altas y cambios desde ahora.
do $$
declare t text;
begin
  foreach t in array array['artist_profiles', 'venue_profiles'] loop
    execute format('alter table public.%I drop constraint if exists %I', t, t || '_media_own');
    execute format($f$alter table public.%I add constraint %I check (
      (avatar_path is null or (starts_with(avatar_path, owner_id::text || '/') and position('..' in avatar_path) = 0)) and
      (cover_path is null or (starts_with(cover_path, owner_id::text || '/') and position('..' in cover_path) = 0))
    ) not valid$f$, t, t || '_media_own');
  end loop;
end $$;
