create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.users (
  id text primary key,
  email text unique not null,
  username text not null,
  display_name text,
  avatar_url text,
  dashboard_access boolean not null default false,
  permissions text[] not null default array['view_content'],
  role_level integer not null default 0,
  role_name text not null default 'Viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users add column if not exists display_name text;
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists dashboard_access boolean not null default false;
alter table public.users add column if not exists permissions text[] not null default array['view_content'];
alter table public.users add column if not exists role_level integer not null default 0;
alter table public.users add column if not exists role_name text not null default 'Viewer';
alter table public.users add column if not exists created_at timestamptz not null default now();
alter table public.users add column if not exists updated_at timestamptz not null default now();

create table if not exists public.role_hierarchy (
  id text primary key default gen_random_uuid()::text,
  role_name text unique not null,
  role_level integer unique not null,
  permissions text[] not null default '{}',
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_invites (
  id text primary key default gen_random_uuid()::text,
  email text unique not null,
  display_name text,
  avatar_url text,
  role_name text not null,
  role_level integer not null,
  permissions text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  invited_by text,
  accepted_by text,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pages (
  id text primary key default gen_random_uuid()::text,
  category_id text not null references public.categories(id) on delete cascade,
  title text not null,
  content text,
  image_url text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'published' check (status in ('published', 'draft', 'archived')),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credits (
  id text primary key default gen_random_uuid()::text,
  email text,
  display_name text not null,
  avatar_url text,
  role_name text not null,
  title text,
  contribution text,
  sort_order integer not null default 0,
  featured boolean not null default false,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.announcements (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  content text not null,
  type text not null default 'info' check (type in ('info', 'warning', 'success', 'error')),
  active boolean not null default true,
  priority integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.web_logos (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  type text not null check (type in ('banner', 'loading', 'favicon', 'logo')),
  image_url text not null,
  is_active boolean not null default false,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.has_app_permission(permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'perryng456@gmail.com'
    or exists (
      select 1
      from public.users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
        and permission = any(permissions)
    );
$$;

create or replace function public.current_app_role_level()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case
    when lower(coalesce(auth.jwt() ->> 'email', '')) = 'perryng456@gmail.com' then 100
    else coalesce((
      select role_level
      from public.users
      where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      limit 1
    ), 0)
  end;
$$;

create or replace function public.has_active_invite()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_invites
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and status in ('pending', 'accepted')
  );
$$;

insert into public.role_hierarchy (role_name, role_level, permissions, description)
values
  (
    'Web Owner',
    100,
    array[
      'view_management',
      'invite_users',
      'assign_roles',
      'manage_users',
      'manage_content',
      'manage_categories',
      'add_content',
      'edit_content',
      'delete_content',
      'manage_credits',
      'manage_announcements',
      'manage_branding'
    ],
    'Built-in owner role for perryng456@gmail.com.'
  ),
  (
    'Broken Blade Staff',
    80,
    array[
      'view_management',
      'invite_users',
      'assign_roles',
      'manage_users',
      'manage_content',
      'manage_categories',
      'add_content',
      'edit_content',
      'delete_content',
      'manage_credits',
      'manage_announcements',
      'manage_branding'
    ],
    'Full Broken Blade staff access.'
  ),
  (
    'Web Admin',
    70,
    array[
      'view_management',
      'invite_users',
      'assign_roles',
      'manage_users',
      'manage_content',
      'manage_categories',
      'add_content',
      'edit_content',
      'delete_content',
      'manage_credits',
      'manage_announcements',
      'manage_branding'
    ],
    'Full web management access below owner/staff rank.'
  ),
  (
    'Web Mod',
    40,
    array[
      'view_management',
      'manage_content',
      'manage_categories',
      'add_content',
      'edit_content',
      'delete_content'
    ],
    'Can manage content boards, categories, and posts.'
  )
on conflict (role_name) do update set
  role_level = excluded.role_level,
  permissions = excluded.permissions,
  description = excluded.description;

insert into public.categories (name, slug, description, icon)
values
  ('Forms', 'forms', 'Broken Blade form entries and structured posts.', 'forms'),
  ('Guides', 'guides', 'Gameplay notes, references, and guide cards.', 'guides'),
  ('Updates', 'updates', 'Patch notes and site updates.', 'updates')
on conflict (slug) do nothing;

insert into public.credits (email, display_name, role_name, title, contribution, sort_order, featured, is_visible)
values (
  'perryng456@gmail.com',
  'Perry',
  'Web Owner',
  'Site Owner',
  'Broken Blade web management and direction.',
  0,
  true,
  true
)
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_user_invites_updated_at on public.user_invites;
create trigger set_user_invites_updated_at
before update on public.user_invites
for each row execute function public.set_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists set_pages_updated_at on public.pages;
create trigger set_pages_updated_at
before update on public.pages
for each row execute function public.set_updated_at();

drop trigger if exists set_credits_updated_at on public.credits;
create trigger set_credits_updated_at
before update on public.credits
for each row execute function public.set_updated_at();

drop trigger if exists set_announcements_updated_at on public.announcements;
create trigger set_announcements_updated_at
before update on public.announcements
for each row execute function public.set_updated_at();

drop trigger if exists set_web_logos_updated_at on public.web_logos;
create trigger set_web_logos_updated_at
before update on public.web_logos
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.role_hierarchy enable row level security;
alter table public.user_invites enable row level security;
alter table public.categories enable row level security;
alter table public.pages enable row level security;
alter table public.credits enable row level security;
alter table public.announcements enable row level security;
alter table public.web_logos enable row level security;

drop policy if exists "users_read_management" on public.users;
create policy "users_read_management" on public.users
for select using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.has_app_permission('manage_users')
  or public.has_app_permission('invite_users')
  or public.has_app_permission('assign_roles')
);

drop policy if exists "users_write_management" on public.users;
create policy "users_write_management" on public.users
for all using (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'perryng456@gmail.com'
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.has_app_permission('manage_users')
  or public.has_app_permission('assign_roles')
) with check (
  lower(coalesce(auth.jwt() ->> 'email', '')) = 'perryng456@gmail.com'
  or (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    and public.has_active_invite()
  )
  or public.has_app_permission('manage_users')
  or public.has_app_permission('assign_roles')
);

drop policy if exists "roles_read_authenticated" on public.role_hierarchy;
create policy "roles_read_authenticated" on public.role_hierarchy
for select using (auth.role() = 'authenticated');

drop policy if exists "invites_management" on public.user_invites;
create policy "invites_management" on public.user_invites
for all using (public.has_app_permission('invite_users'))
with check (public.has_app_permission('invite_users'));

drop policy if exists "invites_claim_read" on public.user_invites;
create policy "invites_claim_read" on public.user_invites
for select using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status in ('pending', 'accepted')
);

drop policy if exists "invites_claim_update" on public.user_invites;
create policy "invites_claim_update" on public.user_invites
for update using (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status in ('pending', 'accepted')
) with check (
  lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  and status in ('accepted')
);

drop policy if exists "content_public_read" on public.categories;
create policy "content_public_read" on public.categories
for select using (true);

drop policy if exists "categories_management" on public.categories;
create policy "categories_management" on public.categories
for all using (public.has_app_permission('manage_categories'))
with check (public.has_app_permission('manage_categories'));

drop policy if exists "pages_public_read" on public.pages;
create policy "pages_public_read" on public.pages
for select using (status = 'published' or public.has_app_permission('manage_content'));

drop policy if exists "pages_management" on public.pages;
create policy "pages_management" on public.pages
for all using (public.has_app_permission('manage_content'))
with check (public.has_app_permission('manage_content'));

drop policy if exists "credits_public_read" on public.credits;
create policy "credits_public_read" on public.credits
for select using (is_visible = true or public.has_app_permission('manage_credits'));

drop policy if exists "credits_management" on public.credits;
create policy "credits_management" on public.credits
for all using (public.has_app_permission('manage_credits'))
with check (public.has_app_permission('manage_credits'));

drop policy if exists "announcements_public_read" on public.announcements;
create policy "announcements_public_read" on public.announcements
for select using (active = true or public.has_app_permission('manage_announcements'));

drop policy if exists "announcements_management" on public.announcements;
create policy "announcements_management" on public.announcements
for all using (public.has_app_permission('manage_announcements'))
with check (public.has_app_permission('manage_announcements'));

drop policy if exists "web_logos_public_read" on public.web_logos;
create policy "web_logos_public_read" on public.web_logos
for select using (true);

drop policy if exists "web_logos_management" on public.web_logos;
create policy "web_logos_management" on public.web_logos
for all using (public.has_app_permission('manage_branding'))
with check (public.has_app_permission('manage_branding'));

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
for select using (bucket_id = 'avatars');

drop policy if exists "avatars_authenticated_upload" on storage.objects;
create policy "avatars_authenticated_upload" on storage.objects
for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
