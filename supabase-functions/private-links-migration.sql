create table if not exists public.private_product_links (
  id uuid primary key default gen_random_uuid(),
  share_token text not null unique check (share_token ~ '^[0-9a-f]{64}$'),
  admin_name text not null check (char_length(admin_name) between 1 and 120),
  page_title text not null check (char_length(page_title) between 1 and 160),
  description text not null check (char_length(description) between 1 and 10000),
  image_path text,
  action_type text not null check (action_type in ('download', 'access')),
  target_url text,
  target_file_path text,
  original_file_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint private_product_links_target_check check (
    (action_type = 'download' and target_file_path is not null and target_url is null)
    or
    (action_type = 'access' and target_url is not null and target_file_path is null)
  )
);

create table if not exists public.private_product_link_events (
  id bigint generated always as identity primary key,
  link_id uuid not null references public.private_product_links(id) on delete cascade,
  event_type text not null check (event_type in ('view', 'click')),
  created_at timestamptz not null default now()
);

create index if not exists private_product_link_events_count_idx
  on public.private_product_link_events (link_id, event_type, created_at desc);

alter table public.private_product_links enable row level security;
alter table public.private_product_link_events enable row level security;

drop policy if exists "Block browser access to private links" on public.private_product_links;
create policy "Block browser access to private links"
on public.private_product_links as restrictive for all to anon, authenticated
using (false) with check (false);

drop policy if exists "Block browser access to private link events" on public.private_product_link_events;
create policy "Block browser access to private link events"
on public.private_product_link_events as restrictive for all to anon, authenticated
using (false) with check (false);

revoke all on table public.private_product_links from public, anon, authenticated;
revoke all on table public.private_product_link_events from public, anon, authenticated;
revoke all on sequence public.private_product_link_events_id_seq from public, anon, authenticated;
grant all on table public.private_product_links to service_role;
grant all on table public.private_product_link_events to service_role;
grant usage, select on sequence public.private_product_link_events_id_seq to service_role;

insert into storage.buckets (id, name, public)
values ('private-link-assets', 'private-link-assets', false)
on conflict (id) do update set public = false;

drop policy if exists "Admin reads private link assets" on storage.objects;
create policy "Admin reads private link assets"
on storage.objects for select to authenticated
using (
  bucket_id = 'private-link-assets'
  and exists (select 1 from public.admins where admins.user_id = auth.uid())
);

drop policy if exists "Admin uploads private link assets" on storage.objects;
create policy "Admin uploads private link assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'private-link-assets'
  and exists (select 1 from public.admins where admins.user_id = auth.uid())
);

drop policy if exists "Admin updates private link assets" on storage.objects;
create policy "Admin updates private link assets"
on storage.objects for update to authenticated
using (
  bucket_id = 'private-link-assets'
  and exists (select 1 from public.admins where admins.user_id = auth.uid())
)
with check (
  bucket_id = 'private-link-assets'
  and exists (select 1 from public.admins where admins.user_id = auth.uid())
);

drop policy if exists "Admin deletes private link assets" on storage.objects;
create policy "Admin deletes private link assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'private-link-assets'
  and exists (select 1 from public.admins where admins.user_id = auth.uid())
);
