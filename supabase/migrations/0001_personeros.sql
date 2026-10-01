-- ─────────────────────────────────────────────────────────────
-- Personeros de David Landa · San Martín
-- Ejecutar en Supabase: SQL Editor → New query → pegar todo → Run.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.personeros (
  id                  uuid primary key default gen_random_uuid(),
  dni                 char(8)     not null unique check (dni ~ '^[0-9]{8}$'),
  nombre              text        not null check (char_length(nombre) between 5 and 160),
  telefono            char(9)     not null check (telefono ~ '^9[0-9]{8}$'),
  correo              text                 check (correo is null or correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  region              text        not null default 'SAN MARTIN' check (region = 'SAN MARTIN'),
  provincia           text        not null,
  distrito            text        not null,
  experiencia         boolean     not null default false,
  detalle_experiencia text,
  acepta_datos        boolean     not null check (acepta_datos),
  created_at          timestamptz not null default now()
);

comment on table public.personeros is 'Personeros de mesa inscritos desde la web (/unirse).';

create index if not exists personeros_created_at_idx on public.personeros (created_at desc);
create index if not exists personeros_ubicacion_idx  on public.personeros (provincia, distrito);

-- Seguridad: RLS activado y SIN políticas públicas.
-- El navegador (rol anon/authenticated) no puede leer ni escribir; solo el servidor de la web,
-- que usa la service_role key, inserta registros y genera el Excel.
alter table public.personeros enable row level security;
revoke all on public.personeros from anon, authenticated;

-- Conteo rápido por distrito, útil para el panel de Supabase (Table Editor → personeros_por_distrito).
create or replace view public.personeros_por_distrito
with (security_invoker = true) as
select provincia, distrito, count(*)::int as total
from public.personeros
group by provincia, distrito
order by provincia, distrito;

revoke all on public.personeros_por_distrito from anon, authenticated;
