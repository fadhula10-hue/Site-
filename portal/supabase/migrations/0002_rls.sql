-- =============================================================
-- Row Level Security — l'admin voit tout, le client uniquement son projet
-- =============================================================

alter table public.profiles       enable row level security;
alter table public.projects       enable row level security;
alter table public.stages         enable row level security;
alter table public.files          enable row level security;
alter table public.comments       enable row level security;
alter table public.reminder_tasks enable row level security;

-- Helper : est-ce que l'utilisateur courant est admin ?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- ===== profiles =====
create policy "profiles_self_read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ===== projects =====
create policy "projects_client_read" on public.projects
  for select using (client_id = auth.uid() or public.is_admin());
create policy "projects_admin_write" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

-- ===== stages =====
create policy "stages_client_read" on public.stages
  for select using (
    public.is_admin()
    or exists (select 1 from public.projects p
               where p.id = stages.project_id and p.client_id = auth.uid())
  );
create policy "stages_admin_write" on public.stages
  for all using (public.is_admin()) with check (public.is_admin());
-- Le client peut UPDATER son étape en 'review' pour passer à 'validated' ou 'rejected'
create policy "stages_client_validate" on public.stages
  for update using (
    exists (select 1 from public.projects p
            where p.id = stages.project_id and p.client_id = auth.uid())
    and stages.status = 'review'
  )
  with check (
    exists (select 1 from public.projects p
            where p.id = stages.project_id and p.client_id = auth.uid())
    and status in ('validated','rejected')
  );

-- ===== files =====
create policy "files_client_read" on public.files
  for select using (
    public.is_admin()
    or exists (select 1 from public.projects p
               where p.id = files.project_id and p.client_id = auth.uid())
  );
create policy "files_admin_write" on public.files
  for all using (public.is_admin()) with check (public.is_admin());

-- ===== comments =====
create policy "comments_read" on public.comments
  for select using (
    public.is_admin()
    or exists (select 1 from public.projects p
               where p.id = comments.project_id and p.client_id = auth.uid())
  );
create policy "comments_insert" on public.comments
  for insert with check (
    author_id = auth.uid() and (
      public.is_admin()
      or exists (select 1 from public.projects p
                 where p.id = comments.project_id and p.client_id = auth.uid())
    )
  );

-- ===== reminder_tasks =====
create policy "reminders_admin_only" on public.reminder_tasks
  for all using (public.is_admin()) with check (public.is_admin());

-- ===== Storage bucket pour fichiers à valider =====
insert into storage.buckets (id, name, public)
  values ('project-files', 'project-files', false)
  on conflict (id) do nothing;

create policy "storage_admin_all" on storage.objects
  for all to authenticated using (
    bucket_id = 'project-files' and public.is_admin()
  ) with check (
    bucket_id = 'project-files' and public.is_admin()
  );

create policy "storage_client_read" on storage.objects
  for select to authenticated using (
    bucket_id = 'project-files' and exists (
      select 1
      from public.files f
      join public.projects p on p.id = f.project_id
      where f.storage_path = storage.objects.name
        and p.client_id = auth.uid()
    )
  );
