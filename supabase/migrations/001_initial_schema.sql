-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- Categories enum
create type category_type as enum (
  'saneobyong',
  'food_grade',
  'jiryu',
  'plastic',
  'metal',
  'eco'
);

-- Companies table
create table companies (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  description text,
  category category_type not null,
  subcategory text,
  address text,
  city text,
  province text,
  phone text,
  email text,
  website text,
  logo_url text,
  products text[] default '{}',
  certifications text[] default '{}',
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Full-text search index on name and description
create index idx_companies_name_trgm on companies using gin (name gin_trgm_ops);
create index idx_companies_category on companies (category);
create index idx_companies_province on companies (province);

-- User profiles table
create table user_profiles (
  id uuid primary key references auth.users on delete cascade,
  role text not null default 'buyer' check (role in ('buyer', 'supplier', 'admin')),
  company_id uuid references companies(id) on delete set null,
  display_name text,
  created_at timestamptz default now()
);

-- Reviews table
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  rating integer not null check (rating between 1 and 5),
  content text,
  created_at timestamptz default now(),
  unique(company_id, user_id)
);

-- RLS policies
alter table companies enable row level security;
alter table user_profiles enable row level security;
alter table reviews enable row level security;

-- Companies: publicly readable
create policy "companies_public_read" on companies for select using (true);

-- Companies: only admins can insert/update via service role
create policy "companies_admin_write" on companies for all
  using (auth.jwt() ->> 'role' = 'admin');

-- User profiles: users can read/update their own
create policy "profiles_own_read" on user_profiles for select
  using (auth.uid() = id);

create policy "profiles_own_update" on user_profiles for update
  using (auth.uid() = id);

-- Reviews: public read, authenticated write
create policy "reviews_public_read" on reviews for select using (true);

create policy "reviews_auth_insert" on reviews for insert
  with check (auth.uid() = user_id);

create policy "reviews_own_delete" on reviews for delete
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Sample seed data
insert into companies (slug, name, description, category, province, city, phone, products, is_verified) values
  ('hangook-packaging', '한국패키징', '국내 최고 수준의 산업용 패키징 솔루션 제공업체', 'saneobyong', '경기도', '수원시', '031-000-0001', ARRAY['골판지 박스', '완충재', '테이프'], true),
  ('green-pack-korea', '그린팩코리아', '친환경 포장재 전문 제조업체 — FSC 인증', 'eco', '충청남도', '천안시', '041-000-0002', ARRAY['재생지 박스', '생분해 완충재'], true),
  ('food-safe-pack', '푸드세이프팩', '식품 안전 등급 포장재 전문', 'food_grade', '경상남도', '창원시', '055-000-0003', ARRAY['식품용 비닐백', '진공 포장재', 'PE 필름'], false),
  ('jiryu-master', '지류마스터', '고품질 종이 포장재 및 인쇄 패키징', 'jiryu', '서울특별시', '성동구', '02-000-0004', ARRAY['쇼핑백', '선물박스', '고급 포장지'], true),
  ('plastic-tech-pack', '플라스틱테크팩', 'PET/PP/HDPE 플라스틱 용기 제조', 'plastic', '인천광역시', '남동구', '032-000-0005', ARRAY['PET 병', 'PP 컨테이너', 'HDPE 드럼'], false);
