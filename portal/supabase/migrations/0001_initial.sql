-- =============================================================
-- Olympe Production — Espace client
-- Schéma initial
-- =============================================================

create extension if not exists "pgcrypto";

-- ----- Profils (étend auth.users) -------------------------------
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  full_name   text,
  role        text not null default 'client' check (role in ('admin','client')),
  created_at  timestamptz not null default now()
);

-- ----- Projets ---------------------------------------------------
create table public.projects (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  client_id     uuid not null references public.profiles(id) on delete restrict,
  deadline      date,
  progress      smallint not null default 0 check (progress between 0 and 100),
  current_stage text not null default 'preprod' check (current_stage in ('preprod','prod','postprod')),
  archived      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on public.projects (client_id);

-- ----- Étapes (3 par projet) ------------------------------------
create table public.stages (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  kind         text not null check (kind in ('preprod','prod','postprod')),
  status       text not null default 'pending'
                 check (status in ('pending','in_progress','review','validated','rejected')),
  validated_at timestamptz,
  rejected_reason text,
  updated_at   timestamptz not null default now(),
  unique (project_id, kind)
);
create index on public.stages (project_id);
create index on public.stages (status) where status = 'review';

-- ----- Fichiers à valider ---------------------------------------
create table public.files (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  stage_id     uuid references public.stages(id) on delete set null,
  storage_path text not null,
  name         text not null,
  mime         text,
  size_bytes   bigint,
  uploaded_by  uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);
create index on public.files (project_id);

-- ----- Commentaires ---------------------------------------------
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index on public.comments (project_id, created_at desc);

-- ----- Relances quotidiennes ------------------------------------
-- Une ligne active par étape en attente de validation.
create table public.reminder_tasks (
  id            uuid primary key default gen_random_uuid(),
  stage_id      uuid not null references public.stages(id) on delete cascade,
  active        boolean not null default true,
  last_sent_at  timestamptz,
  send_count    int not null default 0,
  created_at    timestamptz not null default now(),
  unique (stage_id)
);
create index on public.reminder_tasks (active) where active;

-- ----- Trigger updated_at ---------------------------------------
create or replace function public.tg_set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger projects_updated before update on public.projects
  for each row execute function public.tg_set_updated_at();
create trigger stages_updated before update on public.stages
  for each row execute function public.tg_set_updated_at();

-- ----- Trigger : créer auto les 3 étapes à la création d'un projet
create or replace function public.tg_create_stages() returns trigger
language plpgsql as $$
begin
  insert into public.stages (project_id, kind, status) values
    (new.id, 'preprod', 'in_progress'),
    (new.id, 'prod',    'pending'),
    (new.id, 'postprod','pending');
  return new;
end; $$;
create trigger projects_after_insert after insert on public.projects
  for each row execute function public.tg_create_stages();

-- ----- Trigger : démarrer/arrêter les relances ------------------
create or replace function public.tg_stage_review() returns trigger
language plpgsql as $$
begin
  if new.status = 'review' and (old.status is distinct from 'review') then
    insert into public.reminder_tasks (stage_id, active)
      values (new.id, true)
    on conflict (stage_id) do update set active = true, last_sent_at = null, send_count = 0;
  elsif new.status in ('validated','rejected','pending','in_progress')
        and old.status = 'review' then
    update public.reminder_tasks set active = false where stage_id = new.id;
  end if;
  if new.status = 'validated' and old.status is distinct from 'validated' then
    new.validated_at = now();
  end if;
  return new;
end; $$;
create trigger stages_review_trigger before update on public.stages
  for each row execute function public.tg_stage_review();

-- ----- Profil auto à l'inscription ------------------------------
create or replace function public.tg_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'role', 'client'))
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.tg_handle_new_user();
