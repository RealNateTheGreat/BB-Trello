alter table public.users add column if not exists discord_id text;
alter table public.users alter column email drop not null;

alter table public.user_invites add column if not exists discord_id text;
alter table public.user_invites alter column email drop not null;

alter table public.credits add column if not exists discord_id text;

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

  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_invites_discord_id_key'
      and conrelid = 'public.user_invites'::regclass
  ) then
    alter table public.user_invites add constraint user_invites_discord_id_key unique (discord_id);
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
    select provider_id
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
    where discord_id = public.current_discord_id()
      and status in ('pending', 'accepted')
  );
$$;

update public.role_hierarchy
set description = 'Built-in owner role for Discord user ID 210768103594917888.'
where role_name = 'Web Owner';

update public.credits
set discord_id = '210768103594917888',
    email = null
where email = 'perryng456@gmail.com'
  and role_name = 'Web Owner';

insert into public.credits (discord_id, display_name, role_name, title, contribution, sort_order, featured, is_visible)
select
  '210768103594917888',
  'Perry',
  'Web Owner',
  'Site Owner',
  'Broken Blade web management and direction.',
  0,
  true,
  true
where not exists (
  select 1
  from public.credits
  where discord_id = '210768103594917888'
);

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
  or discord_id = public.current_discord_id()
  or public.has_app_permission('manage_users')
  or public.has_app_permission('assign_roles')
) with check (
  public.current_discord_id() = '210768103594917888'
  or (
    discord_id = public.current_discord_id()
    and (
      role_level = 0
      or public.has_active_invite()
    )
  )
  or public.has_app_permission('manage_users')
  or public.has_app_permission('assign_roles')
);

drop policy if exists "invites_management" on public.user_invites;
create policy "invites_management" on public.user_invites
for all using (public.has_app_permission('invite_users'))
with check (
  public.has_app_permission('invite_users')
  and role_level < public.current_app_role_level()
);

drop policy if exists "invites_claim_read" on public.user_invites;
create policy "invites_claim_read" on public.user_invites
for select using (
  discord_id = public.current_discord_id()
  and status in ('pending', 'accepted')
);

drop policy if exists "invites_claim_update" on public.user_invites;
create policy "invites_claim_update" on public.user_invites
for update using (
  discord_id = public.current_discord_id()
  and status in ('pending', 'accepted')
) with check (
  discord_id = public.current_discord_id()
  and status = 'accepted'
);
