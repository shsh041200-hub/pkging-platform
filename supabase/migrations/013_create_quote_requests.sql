-- quote_requests: stores quote request form submissions from prospective buyers
create table if not exists quote_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id),
  contact_name text not null,
  contact_phone text not null,
  packaging_type text not null,
  estimated_quantity text not null,
  company_name text,
  detail_request text,
  desired_deadline date,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_quote_requests_company on quote_requests(company_id);
create index idx_quote_requests_status on quote_requests(status);

-- RLS: enable row-level security
alter table quote_requests enable row level security;

-- Anyone (including anonymous users) can insert via the public quote form
create policy "public_insert_quote_requests"
  on quote_requests
  for insert
  to anon, authenticated
  with check (true);

-- Deny select/update/delete for non-service roles
-- service_role bypasses RLS entirely, so no explicit policy is needed for it
create policy "no_public_select_quote_requests"
  on quote_requests
  for select
  to anon, authenticated
  using (false);

create policy "no_public_update_quote_requests"
  on quote_requests
  for update
  to anon, authenticated
  using (false);

create policy "no_public_delete_quote_requests"
  on quote_requests
  for delete
  to anon, authenticated
  using (false);
