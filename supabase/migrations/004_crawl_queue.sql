-- Crawl job queue for automated company data collection
create type crawl_status as enum ('pending', 'running', 'done', 'failed', 'skipped');

create table crawl_jobs (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  status crawl_status not null default 'pending',
  -- Raw extracted data before DB insertion
  extracted jsonb,
  -- ID of the company record created/updated by this job
  company_id uuid references companies(id) on delete set null,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_crawl_jobs_status on crawl_jobs (status);
create index idx_crawl_jobs_url on crawl_jobs (url);

-- Only service role / admin can read/write crawl jobs
alter table crawl_jobs enable row level security;

create policy "crawl_jobs_admin_all" on crawl_jobs for all
  using (auth.jwt() ->> 'role' = 'admin');
