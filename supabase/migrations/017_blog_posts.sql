-- KOR-184: Create blog_posts table for SEO content (KOR-181)
-- Supports CMO's 12-week content calendar

create table blog_posts (
  id               uuid        primary key default gen_random_uuid(),
  slug             text        unique not null,
  title            text        not null,
  excerpt          text,
  body             text        not null,
  cover_image_url  text,
  category         text,
  target_keywords  text[]      default '{}',
  meta_title       text,
  meta_description text,
  og_image_url     text,
  author           text        not null default 'BOXTER',
  status           text        not null default 'draft'
                               check (status in ('draft', 'published')),
  published_at     timestamptz,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- Indexes for common query patterns
create index idx_blog_posts_status        on blog_posts (status);
create index idx_blog_posts_category      on blog_posts (category);
create index idx_blog_posts_published_at  on blog_posts (published_at desc);

-- RLS
alter table blog_posts enable row level security;

-- Public read: published posts only
create policy "blog_posts_public_read" on blog_posts
  for select
  using (status = 'published');

-- Admin insert: checks user_profiles role (JWT role claim is not set automatically)
create policy "blog_posts_admin_insert" on blog_posts
  for insert
  with check (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin update
create policy "blog_posts_admin_update" on blog_posts
  for update
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin delete
create policy "blog_posts_admin_delete" on blog_posts
  for delete
  using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Week 1 seed data: 2 published blog posts
insert into blog_posts (
  slug,
  title,
  excerpt,
  body,
  category,
  target_keywords,
  meta_title,
  meta_description,
  author,
  status,
  published_at
) values
(
  'packaging-material-complete-guide',
  '포장재 종류 완전 가이드: 소재별 특징과 올바른 선택법',
  '박스, 완충재, 필름, 친환경 소재까지 — 비즈니스 유형별로 알맞은 포장재를 고르는 방법을 정리했습니다.',
  E'## 포장재, 왜 제대로 알아야 할까?\n\n잘못된 포장재 선택은 반품률 상승과 브랜드 이미지 훼손으로 이어집니다. 소재별 특성을 이해하면 비용을 절감하면서 품질을 높일 수 있습니다.\n\n## 1. 종이·골판지 포장재\n\n골판지 박스는 가장 범용적인 포장재입니다. 단겹(E플루트), 이중(B/C플루트), 삼중(BC복합)으로 구분되며 제품 무게와 충격 강도에 따라 선택합니다.\n\n**추천 업종:** 이커머스, 식품, 일반 소비재\n\n## 2. 플라스틱 용기\n\nPET, PP, HDPE 소재별로 내열성·내약품성이 다릅니다. 식품 접촉 제품은 반드시 식품 안전 등급(Food-Grade) 소재를 사용해야 합니다.\n\n**추천 업종:** 식품·음료, 화장품, 의약품\n\n## 3. 필름·파우치\n\n유연 포장(Flexible Packaging)은 공간 효율이 높고 인쇄 품질이 우수합니다. 진공 포장, 질소 충전 포장 등 기능성 포장에 적합합니다.\n\n**추천 업종:** 건강식품, 스낵, 커피\n\n## 4. 친환경 소재\n\nFSC 인증 재생지, 생분해성 PLA, 퇴비화 가능 필름 등이 있습니다. ESG 경영 트렌드에 따라 수요가 빠르게 증가하고 있습니다.\n\n**추천 업종:** 친환경 브랜드, 프리미엄 소비재\n\n## 포장재 선택 체크리스트\n\n1. 제품 무게와 부피 확인\n2. 유통 경로(직배송 vs 3PL) 파악\n3. 온도·습도 조건 검토\n4. 식품 접촉 여부 확인\n5. ESG 목표 반영 여부\n\n전국 포장재 공급업체를 한눈에 비교하려면 **BOXTER** 플랫폼에서 검색하세요.',
  'ecommerce-shipping',
  ARRAY['포장재 종류', '박스 종류', '포장재 선택 방법', '택배 박스', '골판지 박스', '친환경 포장재'],
  '포장재 종류 완전 가이드 | BOXTER',
  '골판지, 플라스틱, 필름, 친환경 포장재까지 소재별 특징과 비즈니스 유형에 맞는 올바른 포장재 선택 방법을 알아보세요.',
  'BOXTER',
  'published',
  '2026-04-14 09:00:00+09'
),
(
  'smartstore-seller-packaging-checklist',
  '스마트스토어 셀러 포장재 체크리스트: 반품률 줄이는 포장 전략',
  '스마트스토어 판매자를 위한 포장재 선택 가이드. 안전한 배송과 브랜드 경험을 동시에 잡는 포장 전략을 소개합니다.',
  E'## 스마트스토어 셀러의 포장, 왜 중요한가?\n\n네이버 스마트스토어 리뷰에서 "포장이 허술하다"는 평가는 재구매율을 크게 낮춥니다. 반면 브랜드 일관성 있는 포장은 자연스러운 SNS 공유로 이어집니다.\n\n## 필수 체크리스트\n\n### ✅ 배송 박스\n- 제품 크기보다 5~10cm 여유 있는 박스 선택\n- 무게 기준: 2kg 이하 → 이중골, 2~5kg → 삼중골\n- CJ대한통운·롯데택배 규격(60cm/80cm) 사전 확인\n\n### ✅ 완충재\n- 깨지기 쉬운 제품: 에어캡(버블랩) 2겹 이상\n- 식품: 단열 완충재 + 아이스팩 조합\n- 비용 절감: 재생 크라프트지 크링클 페이퍼\n\n### ✅ 테이프·봉함재\n- PP테이프(황색)는 방수성이 우수\n- 무인쇄 테이프보다 브랜드 인쇄 테이프가 브랜드 인지도 향상에 효과적\n\n### ✅ 브랜드 경험 요소\n- 감사 카드 또는 스티커 삽입 → 리뷰 유도\n- 브랜드 색상 티슈페이퍼 사용 → 언박싱 경험 향상\n- QR코드 스티커 → 재구매 링크 연결\n\n## 소량 구매 vs 대량 구매\n\n| 구분 | 소량(100개 이하) | 대량(500개 이상) |\n|------|-----------------|------------------|\n| 추천 채널 | 쿠팡 B2B, 다팔자 | BOXTER 플랫폼 비교 견적 |\n| 단가 절감 | 제한적 | 30~50% 절감 가능 |\n| 리드타임 | 1~2일 | 5~14일 |\n\n## 공급업체 선정 팁\n\n- 샘플 요청 후 직접 낙하 테스트 실시\n- MOQ(최소 주문 수량) 협의 가능 여부 확인\n- 식품 포장재는 반드시 위생 인증 확인\n\n전국 포장재 공급업체를 가격·지역별로 비교하려면 **BOXTER**에서 무료로 견적을 받아보세요.',
  'ecommerce-shipping',
  ARRAY['스마트스토어 포장', '셀러 포장재', '택배 포장 체크리스트', '스마트스토어 배송', '이커머스 포장', '포장재 비용'],
  '스마트스토어 셀러 포장재 체크리스트 | BOXTER',
  '스마트스토어 판매자를 위한 포장재 선택 가이드. 반품률을 줄이고 브랜드 경험을 높이는 포장 전략과 공급업체 선정 팁을 알아보세요.',
  'BOXTER',
  'published',
  '2026-04-17 09:00:00+09'
);
