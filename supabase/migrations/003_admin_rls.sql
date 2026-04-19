-- Drop old admin write policy (it checked JWT 'role' claim which isn't set automatically)
drop policy if exists "companies_admin_write" on companies;

-- Admin insert: checks user_profiles table for role = 'admin'
create policy "companies_admin_insert" on companies for insert
  with check (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin update
create policy "companies_admin_update" on companies for update
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin delete
create policy "companies_admin_delete" on companies for delete
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );
