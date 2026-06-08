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
  discord_id text unique,
  email text unique,
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

alter table public.users add column if not exists discord_id text;
alter table public.users alter column email drop not null;
alter table public.users add column if not exists display_name text;
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists dashboard_access boolean not null default false;
alter table public.users add column if not exists permissions text[] not null default array['view_content'];
alter table public.users add column if not exists role_level integer not null default 0;
alter table public.users add column if not exists role_name text not null default 'Viewer';
alter table public.users add column if not exists created_at timestamptz not null default now();
alter table public.users add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_discord_id_key'
      and conrelid = 'public.users'::regclass
  ) then
    alter table public.users add constraint users_discord_id_key unique (discord_id);
  end if;
end $$;

create table if not exists public.role_hierarchy (
  id text primary key default gen_random_uuid()::text,
  role_name text unique not null,
  role_level integer unique not null,
  permissions text[] not null default '{}',
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  icon_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.categories add column if not exists icon text;
alter table public.categories add column if not exists icon_url text;
alter table public.categories add column if not exists created_at timestamptz not null default now();
alter table public.categories add column if not exists updated_at timestamptz not null default now();

create table if not exists public.pages (
  id text primary key default gen_random_uuid()::text,
  category_id text not null references public.categories(id) on delete cascade,
  title text not null,
  content text,
  image_url text,
  media_urls text[] not null default '{}'::text[],
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'published' check (status in ('published', 'draft', 'archived')),
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pages add column if not exists image_url text;
alter table public.pages add column if not exists media_urls text[] not null default '{}'::text[];
alter table public.pages add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.pages add column if not exists status text not null default 'published';
alter table public.pages add column if not exists created_by text;
alter table public.pages add column if not exists created_at timestamptz not null default now();
alter table public.pages add column if not exists updated_at timestamptz not null default now();

update public.pages
set media_urls = array[image_url]
where coalesce(image_url, '') <> ''
  and cardinality(media_urls) = 0;

create table if not exists public.credits (
  id text primary key default gen_random_uuid()::text,
  discord_id text,
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

alter table public.credits add column if not exists discord_id text;
alter table public.credits add column if not exists email text;
alter table public.credits add column if not exists avatar_url text;
alter table public.credits add column if not exists title text;
alter table public.credits add column if not exists contribution text;
alter table public.credits add column if not exists sort_order integer not null default 0;
alter table public.credits add column if not exists featured boolean not null default false;
alter table public.credits add column if not exists is_visible boolean not null default true;
alter table public.credits add column if not exists created_at timestamptz not null default now();
alter table public.credits add column if not exists updated_at timestamptz not null default now();

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
    'Built-in owner role for Discord user ID 210768103594917888.'
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
    'Full web management access, including user access and role assignment below their own rank.'
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

do $$
begin
  if to_regclass('public.user_invites') is not null then
    execute $sql$
      insert into public.users (
        id,
        discord_id,
        email,
        username,
        display_name,
        avatar_url,
        dashboard_access,
        permissions,
        role_level,
        role_name
      )
      select
        'pending-' || discord_id,
        discord_id,
        null,
        coalesce(nullif(display_name, ''), 'discord-' || discord_id),
        nullif(display_name, ''),
        nullif(avatar_url, ''),
        role_level > 0,
        permissions,
        role_level,
        role_name
      from public.user_invites
      where status <> 'revoked'
        and coalesce(discord_id, '') <> ''
      on conflict (discord_id) do update set
        display_name = coalesce(excluded.display_name, public.users.display_name),
        avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url),
        dashboard_access = excluded.dashboard_access,
        permissions = excluded.permissions,
        role_level = excluded.role_level,
        role_name = excluded.role_name,
        updated_at = now()
    $sql$;
  end if;
end $$;

create or replace function public.current_discord_id()
returns text
language sql
stable
security definer
set search_path = public, auth
as $$
  select coalesce((
    select nullif(coalesce(
      provider_id,
      identity_data ->> 'provider_id',
      identity_data ->> 'sub',
      identity_data ->> 'id',
      identity_data ->> 'user_id'
    ), '')
    from auth.identities
    where user_id = auth.uid()
      and provider = 'discord'
    order by created_at desc
    limit 1
  ), '');
$$;

create or replace function public.has_app_permission(permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_discord_id() = '210768103594917888'
    or exists (
      select 1
      from public.users
      where discord_id = public.current_discord_id()
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
    when public.current_discord_id() = '210768103594917888' then 100
    else coalesce((
      select role_level
      from public.users
      where discord_id = public.current_discord_id()
      limit 1
    ), 0)
  end;
$$;

create or replace function public.claim_user_profile(
  p_discord_id text,
  p_email text,
  p_username text,
  p_display_name text,
  p_avatar_url text
)
returns public.users
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_discord_id text := trim(coalesce(p_discord_id, ''));
  v_current_discord_id text := public.current_discord_id();
  v_username text;
  v_display_name text;
  v_user public.users;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if v_discord_id = '' or v_current_discord_id <> v_discord_id then
    raise exception 'Discord identity mismatch';
  end if;

  v_username := coalesce(nullif(trim(coalesce(p_username, '')), ''), 'discord-' || v_discord_id);
  v_display_name := coalesce(nullif(trim(coalesce(p_display_name, '')), ''), v_username);

  if v_discord_id = '210768103594917888' then
    insert into public.users (
      id,
      discord_id,
      email,
      username,
      display_name,
      avatar_url,
      dashboard_access,
      permissions,
      role_level,
      role_name
    )
    values (
      auth.uid()::text,
      v_discord_id,
      nullif(p_email, ''),
      v_username,
      v_display_name,
      coalesce(p_avatar_url, ''),
      true,
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
      100,
      'Web Owner'
    )
    on conflict (discord_id) do update set
      id = excluded.id,
      email = excluded.email,
      username = excluded.username,
      display_name = excluded.display_name,
      avatar_url = excluded.avatar_url,
      dashboard_access = true,
      permissions = excluded.permissions,
      role_level = 100,
      role_name = 'Web Owner',
      updated_at = now()
    returning * into v_user;

    return v_user;
  end if;

  update public.users
  set
    id = auth.uid()::text,
    email = nullif(p_email, ''),
    username = v_username,
    display_name = v_display_name,
    avatar_url = coalesce(p_avatar_url, ''),
    dashboard_access = role_level > 0,
    updated_at = now()
  where discord_id = v_discord_id
  returning * into v_user;

  if found then
    return v_user;
  end if;

  insert into public.users (
    id,
    discord_id,
    email,
    username,
    display_name,
    avatar_url,
    dashboard_access,
    permissions,
    role_level,
    role_name
  )
  values (
    auth.uid()::text,
    v_discord_id,
    nullif(p_email, ''),
    v_username,
    v_display_name,
    coalesce(p_avatar_url, ''),
    false,
    array['view_content'],
    0,
    'Viewer'
  )
  returning * into v_user;

  return v_user;
end;
$$;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
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
alter table public.categories enable row level security;
alter table public.pages enable row level security;
alter table public.credits enable row level security;
alter table public.announcements enable row level security;
alter table public.web_logos enable row level security;

drop policy if exists "users_read_management" on public.users;
create policy "users_read_management" on public.users
for select using (
  discord_id = public.current_discord_id()
  or public.has_app_permission('manage_users')
  or public.has_app_permission('invite_users')
  or public.has_app_permission('assign_roles')
);

drop policy if exists "users_write_management" on public.users;
create policy "users_write_management" on public.users
for all using (
  public.current_discord_id() = '210768103594917888'
  or public.has_app_permission('manage_users')
  or public.has_app_permission('assign_roles')
) with check (
  public.current_discord_id() = '210768103594917888'
  or public.has_app_permission('manage_users')
  or public.has_app_permission('assign_roles')
);

drop policy if exists "roles_read_authenticated" on public.role_hierarchy;
create policy "roles_read_authenticated" on public.role_hierarchy
for select using (auth.role() = 'authenticated');

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

drop table if exists public.user_invites cascade;
drop function if exists public.has_active_invite();
