alter table public.categories
add column if not exists icon_url text;

alter table public.pages
add column if not exists media_urls text[] not null default '{}'::text[];

update public.pages
set media_urls = array[image_url]
where coalesce(image_url, '') <> ''
  and cardinality(media_urls) = 0;
