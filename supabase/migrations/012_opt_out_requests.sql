-- opt_out_requests: stores information deletion/modification requests from companies
create table if not exists opt_out_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  request_type text not null check (request_type in ('delete', 'update')),
  requester_name text not null,
  requester_email text not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'processed', 'rejected')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- RLS: enable row-level security
alter table opt_out_requests enable row level security;

-- Anyone can insert (anonymous form submission)
create policy "public_insert_opt_out_requests"
  on opt_out_requests
  for insert
  to anon, authenticated
  with check (true);

-- Only service role can select or update (admin/staff access only)
-- service_role bypasses RLS entirely, so no explicit policy needed for it
-- Deny all select/update/delete for non-service roles
create policy "no_public_select_opt_out_requests"
  on opt_out_requests
  for select
  to anon, authenticated
  using (false);
