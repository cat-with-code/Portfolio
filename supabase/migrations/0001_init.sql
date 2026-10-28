-- Portfolio backend, step 1: tables, security rules (RLS) and the covers bucket.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
--
-- Security model
--   • Row Level Security is ON for every table: nothing is readable or writable unless a policy below allows it.
--   • Visitors (anon) can read only PUBLISHED content and game links. Nothing else.
--   • Only the owner (the user id stored in app_config, filled by the import script) can see drafts and write.
--     Any other signed-in user gets nothing, even if sign-ups were ever re-enabled.
--   • Contact messages are never writable from the browser: the server inserts them with the service key
--     after its own spam checks. Only the owner can read them.
--   • Checks on columns (lengths, allowed values, https links) are enforced by the database itself.

-- ── Helpers ────────────────────────────────────────────────────────────────

create type public.content_status as enum ('draft', 'published');

-- Single-row config. RLS on and no policies: only the service key (server) can read or change it.
create table public.app_config (
  id int primary key default 1 check (id = 1),
  owner_id uuid not null references auth.users (id) on delete restrict
);
alter table public.app_config enable row level security;

-- True when the signed-in user is the owner. SECURITY DEFINER so it can read app_config;
-- search_path pinned so it can't be hijacked.
create function public.is_owner() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.app_config c where c.owner_id = auth.uid());
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Links shown to visitors must be web links (no javascript:, data:, …).
create function public.is_web_url(u text) returns boolean
language sql immutable set search_path = ''
as $$ select u is null or u ~ '^https?://[^\s]+$' or u ~ '^/[A-Za-z0-9/_.\-]+$' $$;

-- ── Content ────────────────────────────────────────────────────────────────

create table public.posts (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 120),
  title text not null check (char_length(title) between 1 and 160),
  display_title text check (char_length(display_title) <= 200),
  topic text not null check (topic in ('technology', 'books', 'fiction', 'notes', 'culture')),
  filter text not null check (filter in ('technology', 'books', 'stories', 'life')),
  category text not null check (char_length(category) <= 40),
  minutes int not null default 1 check (minutes between 1 and 120),
  excerpt text not null default '' check (char_length(excerpt) <= 400),
  dek text not null default '' check (char_length(dek) <= 200),
  cover_url text check (public.is_web_url(cover_url)),
  body jsonb check (body is null or (jsonb_typeof(body) = 'array' and pg_column_size(body) < 200000)),
  status public.content_status not null default 'draft',
  sort int not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  key text primary key check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(key) <= 80),
  name text not null check (char_length(name) between 1 and 120),
  eyebrow text not null default '' check (char_length(eyebrow) <= 60),
  category text not null default '' check (char_length(category) <= 80),
  description text not null default '' check (char_length(description) <= 300),
  disciplines text not null default '' check (char_length(disciplines) <= 120),
  thumb text check (public.is_web_url(thumb)),
  cover_url text check (public.is_web_url(cover_url)),
  href text check (href is null or href ~ '^/[a-z0-9/\-]*$'),
  card jsonb check (card is null or jsonb_typeof(card) = 'object'),
  case_study jsonb check (case_study is null or (jsonb_typeof(case_study) = 'object' and pg_column_size(case_study) < 200000)),
  status public.content_status not null default 'draft',
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  vibe text not null check (vibe in ('lofi', 'neo', 'ambient', 'rain', 'piano')),
  title text not null check (char_length(title) between 1 and 120),
  length text not null check (length ~ '^[0-9]{1,2}:[0-5][0-9]$'),
  audio_url text check (public.is_web_url(audio_url)),
  cover_url text check (public.is_web_url(cover_url)),
  status public.content_status not null default 'draft',
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.books (
  key text primary key check (key ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(key) <= 80),
  title text not null check (char_length(title) between 1 and 160),
  author text not null default '' check (char_length(author) <= 160),
  topic text not null default '' check (char_length(topic) <= 40),
  teaser text not null default '' check (char_length(teaser) <= 200),
  tint text not null default 'bg-accent-green-subtle'
    check (tint in ('bg-accent-green-subtle', 'bg-accent-blue-subtle', 'bg-accent-red-subtle', 'bg-accent-violet-subtle', 'bg-status-warning-subtle')),
  cover_url text check (public.is_web_url(cover_url)),
  brief jsonb not null default '{}'::jsonb check (jsonb_typeof(brief) = 'object' and pg_column_size(brief) < 20000),
  status public.content_status not null default 'draft',
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Where each game can be played. The games themselves live in the site's code.
create table public.game_links (
  game_key text primary key check (game_key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  url text not null check (url ~ '^https?://[^\s]+$' and char_length(url) <= 500),
  updated_at timestamptz not null default now()
);

-- ── Private ────────────────────────────────────────────────────────────────

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) <= 200 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  message text not null check (char_length(message) between 1 and 5000),
  choices text[] not null default '{}' check (cardinality(choices) <= 4),
  read boolean not null default false,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.settings (
  id int primary key default 1 check (id = 1),
  name text not null default '' check (char_length(name) <= 120),
  email text not null default '' check (char_length(email) <= 200),
  language text not null default 'en' check (language in ('en', 'km', 'zh')),
  prefs jsonb not null default '{}'::jsonb check (jsonb_typeof(prefs) = 'object'),
  updated_at timestamptz not null default now()
);

-- ── Timestamps ─────────────────────────────────────────────────────────────

create trigger posts_touch before update on public.posts for each row execute function public.touch_updated_at();
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();
create trigger tracks_touch before update on public.tracks for each row execute function public.touch_updated_at();
create trigger books_touch before update on public.books for each row execute function public.touch_updated_at();
create trigger game_links_touch before update on public.game_links for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- ── Row Level Security ─────────────────────────────────────────────────────

alter table public.posts enable row level security;
alter table public.projects enable row level security;
alter table public.tracks enable row level security;
alter table public.books enable row level security;
alter table public.game_links enable row level security;
alter table public.messages enable row level security;
alter table public.settings enable row level security;

-- Published content: anyone may read. Drafts and all writes: owner only.
create policy "visitors read published posts" on public.posts for select to anon, authenticated using (status = 'published');
create policy "owner reads all posts" on public.posts for select to authenticated using (public.is_owner());
create policy "owner writes posts" on public.posts for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "visitors read published projects" on public.projects for select to anon, authenticated using (status = 'published');
create policy "owner reads all projects" on public.projects for select to authenticated using (public.is_owner());
create policy "owner writes projects" on public.projects for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "visitors read published tracks" on public.tracks for select to anon, authenticated using (status = 'published');
create policy "owner reads all tracks" on public.tracks for select to authenticated using (public.is_owner());
create policy "owner writes tracks" on public.tracks for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "visitors read published books" on public.books for select to anon, authenticated using (status = 'published');
create policy "owner reads all books" on public.books for select to authenticated using (public.is_owner());
create policy "owner writes books" on public.books for all to authenticated using (public.is_owner()) with check (public.is_owner());

create policy "visitors read game links" on public.game_links for select to anon, authenticated using (true);
create policy "owner writes game links" on public.game_links for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Messages and settings: owner only. No insert policy for messages on purpose (server inserts with the service key).
create policy "owner reads messages" on public.messages for select to authenticated using (public.is_owner());
create policy "owner updates messages" on public.messages for update to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owner deletes messages" on public.messages for delete to authenticated using (public.is_owner());

create policy "owner reads settings" on public.settings for select to authenticated using (public.is_owner());
create policy "owner writes settings" on public.settings for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- Visitors don't need write privileges on anything at all.
revoke insert, update, delete on all tables in schema public from anon;

-- ── Storage: cover images ──────────────────────────────────────────────────
-- Public bucket (covers are shown on the site), images only, max 5 MB. Only the owner may upload, replace or delete.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('covers', 'covers', true, 5242880, array['image/png', 'image/jpeg', 'image/webp']);

-- No public select policy: visitors open covers by their direct URL but can't list the bucket.
create policy "owner lists covers" on storage.objects for select to authenticated
  using (bucket_id = 'covers' and public.is_owner());
create policy "owner uploads covers" on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and public.is_owner());
create policy "owner replaces covers" on storage.objects for update to authenticated
  using (bucket_id = 'covers' and public.is_owner()) with check (bucket_id = 'covers' and public.is_owner());
create policy "owner deletes covers" on storage.objects for delete to authenticated
  using (bucket_id = 'covers' and public.is_owner());
