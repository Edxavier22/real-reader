-- REAL Reader RC1 — Produto Vendável
-- Schema base para Supabase/Postgres.
-- Execute este arquivo no SQL Editor do Supabase antes de colocar o produto em produção.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  full_name text,
  last_accessed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan text not null check (plan in ('free', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_stripe_subscription_id_uidx
  on public.subscriptions(stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_customer_idx on public.subscriptions(stripe_customer_id);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  voice_mode text not null default 'browser'
    check (voice_mode in ('browser', 'neural', 'authorized-clone')),
  voice_profile_id text not null default 'narrador',
  speech_rate numeric(3, 2) not null default 1.00,
  updated_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  source_total_pages integer not null default 0,
  processed_pages integer not null default 0,
  extraction_mode text not null default 'fast',
  total_chars integer not null default 0,
  favorite boolean not null default false,
  last_read_page integer,
  last_read_at timestamptz,
  content_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_updated_at_idx on public.documents(updated_at desc);
create index if not exists documents_favorite_idx on public.documents(user_id, favorite);

create table if not exists public.study_blocks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  start_page integer not null,
  end_page integer not null,
  created_at timestamptz not null default now(),
  check (start_page > 0 and end_page >= start_page)
);

create index if not exists study_blocks_document_id_idx on public.study_blocks(document_id);
create index if not exists study_blocks_user_id_idx on public.study_blocks(user_id);

create table if not exists public.reading_bookmarks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  page_number integer not null,
  saved_at timestamptz not null default now()
);

create unique index if not exists reading_bookmarks_user_document_uidx
  on public.reading_bookmarks(user_id, document_id);
create index if not exists reading_bookmarks_document_id_idx on public.reading_bookmarks(document_id);

create table if not exists public.usage_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  month_key text not null,
  pages_processed integer not null default 0,
  ocr_pages integer not null default 0,
  voice_characters integer not null default 0,
  mp3_generations integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month_key)
);

create index if not exists usage_limits_user_month_idx on public.usage_limits(user_id, month_key);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  event_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists security_events_user_idx on public.security_events(user_id);
create index if not exists security_events_created_at_idx on public.security_events(created_at desc);

alter table public.users enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_preferences enable row level security;
alter table public.documents enable row level security;
alter table public.study_blocks enable row level security;
alter table public.reading_bookmarks enable row level security;
alter table public.usage_limits enable row level security;
alter table public.security_events enable row level security;

drop policy if exists "Users can read own profile" on public.users;
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

drop policy if exists "Users can read own subscriptions" on public.subscriptions;
create policy "Users can read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own preferences" on public.user_preferences;
create policy "Users can read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

drop policy if exists "Users can manage own preferences" on public.user_preferences;
create policy "Users can manage own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own documents" on public.documents;
create policy "Users can manage own documents"
  on public.documents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own study blocks" on public.study_blocks;
create policy "Users can manage own study blocks"
  on public.study_blocks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can manage own bookmarks" on public.reading_bookmarks;
create policy "Users can manage own bookmarks"
  on public.reading_bookmarks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can read own usage" on public.usage_limits;
create policy "Users can read own usage"
  on public.usage_limits for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own security events" on public.security_events;
create policy "Users can read own security events"
  on public.security_events for select
  using (auth.uid() = user_id);
