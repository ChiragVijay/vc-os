create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null unique,
  created_at timestamptz not null default now()
);

do $$
begin
  create type public.diligence_report_status as enum (
    'pending',
    'processing',
    'completed',
    'failed'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.diligence_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  status public.diligence_report_status not null,
  data jsonb,
  score numeric,
  sources_used text[],
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  error text
);

create index if not exists diligence_reports_company_id_idx
  on public.diligence_reports(company_id);
