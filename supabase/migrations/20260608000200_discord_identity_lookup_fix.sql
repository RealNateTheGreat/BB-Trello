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
