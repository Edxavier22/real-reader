-- REAL Reader V1.3 Comercial
-- Schema base para Supabase/Postgres. Ajuste políticas RLS antes de produção.

create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  full_name text,
  created_at timestamptz not null default now()
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
  created_at timestamptz not null default now()
);

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

create table if not exists public.reading_bookmarks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  page_number integer not null,
  saved_at timestamptz not null default now()
);

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

create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists study_blocks_document_id_idx on public.study_blocks(document_id);
create index if not exists reading_bookmarks_document_id_idx on public.reading_bookmarks(document_id);
create index if not exists usage_limits_user_month_idx on public.usage_limits(user_id, month_key);
