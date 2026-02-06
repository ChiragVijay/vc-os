create table if not exists public.diligence_report_sources (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.diligence_reports(id) on delete cascade,
  source_id text not null,
  url text not null,
  title text,
  source_type text not null,
  snippet text,
  score numeric,
  ordinal int not null,
  referenced_in jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.diligence_report_sources
  add constraint diligence_report_sources_report_id_source_id_key
  unique (report_id, source_id);

alter table public.diligence_report_sources
  add constraint diligence_report_sources_report_id_url_key
  unique (report_id, url);

create index if not exists diligence_report_sources_report_id_ordinal_idx
  on public.diligence_report_sources(report_id, ordinal);
