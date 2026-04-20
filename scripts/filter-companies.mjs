import { createClient } from '@supabase/supabase-js';

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const NEWS_MEDIA_NAMES = [
  '경기일보', '경북도민일보', '대경일보', '대전일보', '글로벌이코노믹',
  '뉴데일리', '바이라인네트워크', '비즈니스포스트', '비즈니스리포트',
  '비즈니스워치', '비즈월드', '더바이어', '더스쿠프', '산업일보',
  '로즈데일리', '뷰티경제', 'MBN', 'NewsTomato', 'SBS NEWS',
  '글로벌에픽', '비즈N', '넥스트유니콘', 'DAILYTREND',
  '비즈노(사업자등록번호정보)',
];

const NEWS_DOMAINS = [
  'sbs.co.kr', 'mbn.co.kr', 'donga.com', 'brunch.co.kr',
  'byline.network', 'businesspost.co.kr', 'ranktracker.com',
  'nextunicorn.kr',
];

const RESEARCH_DOMAINS = [
  'scienceon.kisti.re.kr', 'dspace.kci.go.kr', 'bioin.or.kr',
  'pypi.org', 'gminsights.com', 'fortunebusinessinsights.com',
];

const GOV_DOMAINS = [
  'guri.go.kr', 'gwangjin.go.kr', 'pyeongtaek.go.kr',
  'data.seoul.go.kr', 'ikcrc.or.kr',
];

const JOB_DOMAINS = [
  'saramin.co.kr', 'daangn.com', 'bzpp.co.kr',
];

const UNRELATED_DOMAINS = [
  'ruliweb.com', 'ssg.com', 'cognex.com', 'xrite.com',
  'dshm.co.kr', 'daeduck.com',
];

function isDomainMatch(website, domains) {
  if (!website) return false;
  return domains.some(d => website.includes(d));
}

function isNewsArticle(company) {
  const { name, description, website } = company;
  if (NEWS_MEDIA_NAMES.some(n => name.includes(n))) return true;
  if (isDomainMatch(website, NEWS_DOMAINS)) return true;
  if (!description) return false;
  const newsPatterns = [
    /\[산업일보\]/, /\[비즈월드\]/, /\[채널Who\]/,
    /\b기자\b.*\b보도/, /\b일보\b/,
  ];
  return newsPatterns.some(p => p.test(description));
}

function isResearchPaper(company) {
  const { name, description, website } = company;
  if (name.startsWith('ScienceON')) return true;
  if (name === 'earticle') return true;
  if (isDomainMatch(website, RESEARCH_DOMAINS)) return true;
  if (!description) return false;
  const patterns = [
    /연구개발 목표/, /연구.*수행/, /개발목표/, /\b논문\b/,
    /시장 규모.*달러.*성장/, /CAGR\s+\d/,
  ];
  return patterns.some(p => p.test(description));
}

function isGovernmentPage(company) {
  const { name, description, website } = company;
  if (isDomainMatch(website, GOV_DOMAINS)) return true;
  if (name.includes('시청 홈페이지') || name.includes('구청')) return true;
  if (name === '서울 열린데이터광장') return true;
  if (name.includes('대형폐기물 배출신청')) return true;
  if (name === 'EPR제도 소개') return true;
  if (name.startsWith('비닐류포장재분리배출')) return true;
  return false;
}

function isJobPosting(company) {
  const { name, website, description } = company;
  if (isDomainMatch(website, JOB_DOMAINS)) return true;
  if (!description) return false;
  const patterns = [/채용공고/, /경력:\d/, /학력:/, /마감일:\d{4}/];
  return patterns.some(p => p.test(description));
}

function isCompletelyUnrelated(company) {
  const { name, description, website } = company;
  if (name === 'PyPI') return true;
  if (name === 'TRDST') return true;
  if (name === 'FedEx') return true;
  if (name === 'Cold Chain Insight') return true;
  if (name === 'Global Market Insights Inc.') return true;
  if (name.includes('루리웹')) return true;
  if (name === '대호기어') return true;
  if (name === '대덕전자') return true;
  if (name === 'DS HiMetal') return true;
  if (name.startsWith('HSBOX')) return true;
  if (isDomainMatch(website, UNRELATED_DOMAINS)) return true;
  if (website && website.includes('domeggook.com')) return true;
  if (website && website.includes('ssg.com/item')) return true;

  if (description) {
    if (description.includes('Python-tesseract') || description.includes('Google\'s Tesseract')) return true;
    if (description.includes('LED adjustable metal wall light')) return true;
    if (description.includes("We're sorry, we can't process your request")) return true;
    if (description.includes('오퍼레이터가 굳어버리는 증상')) return true;
    if (description.includes('인쇄회로기판 제조 전문업체, 반도체')) return true;
    if (description.includes('반도체 패키지 소재 전문 기업, 솔더볼')) return true;
    if (description.includes('평기어') && description.includes('헬리컬기어') && description.includes('랙기어')) return true;
    if (description.includes('마마걸 봄신상 빅사이즈여성의류')) return true;
    if (description.includes('블랙박스 및 차량용 전자제품을 위한 SEO')) return true;
    if (description.includes('주5일 전자기기 쇼핑몰 노트북 수리')) return true;
    if (description.includes('미세조류 광생물반응기')) return true;
    if (description.includes('티셔츠디자인,티셔츠인쇄,디지털프린팅,나염티,단체티')) return true;
    if (description.includes('전기박스 종합메이커')) return true;
    if (description.includes('사업자정보') && description.includes('사업자등록번호')) return true;
    if (description.includes('[반도체]') || description.includes('[채널Who] 한국이 반도체')) return true;
  }

  return false;
}

function isArticleOrReport(company) {
  const { name, description } = company;
  const articlePatterns = [
    /독일.*신포장재법/, /독일.*환경보호.*리펀드/,
    /소비자의 선택.*패키징 혁명/,
    /네 가지 주요 포장 트렌드/,
    /Customized Packaging Box.*Powerful Tool/,
    /복약순응도를 높이는.*패키지디자인/,
    /기내 대량 생산 반하.*종구의.*포장 배양/,
  ];
  if (articlePatterns.some(p => p.test(name))) return true;
  if (articlePatterns.some(p => p.test(description || ''))) return true;

  if (name.includes('골판지 포장 시장 규모')) return true;
  if (name.includes('EPR제도')) return true;

  return false;
}

// Numbered review / case-study blog posts (e.g. "150번째 후기. ...")
function isBlogOrCaseStudy(company) {
  const { name, description, website } = company;

  // Name patterns: numbered reviews and case studies
  if (/^\d+번째\s*후기/.test(name)) return true;
  if (/^후기\s*\d+/.test(name)) return true;
  if (/제작사례/.test(name) && /^\d+/.test(name)) return true;
  if (/납품사례/.test(name) && /^\d+/.test(name)) return true;

  // Name pattern: sample product listing (not a company page)
  if (/^\[샘플제작\]/.test(name)) return true;

  // Description: classic blog-case-study openers
  if (/이번에\s*새롭게\s*체결된\s*거래처/.test(description || '')) return true;

  // Blog/post URL patterns (e.g. /27/?idx=20, ?bmode=view&idx=...)
  if (/\/\d+\/\?idx=\d+/.test(website || '')) return true;
  if (/[?&]bmode=view/.test(website || '')) return true;

  return false;
}

// Market research reports, white papers
function isMarketReport(company) {
  const { name, description, website } = company;

  if (/시장\s*보고서/.test(name)) return true;
  if (/시장\s*분석\s*보고서/.test(name)) return true;
  if (/\d{4}년.*시장\s*규모/.test(name)) return true;
  if (/보고서\s*\d{4}/.test(name)) return true;

  // Market research aggregator domains
  const marketResearchDomains = [
    'imarcgroup.com', 'grandviewresearch.com', 'mordorintelligence.com',
    'marketsandmarkets.com', 'fortunebusinessinsights.com', 'gminsights.com',
  ];
  if (marketResearchDomains.some(d => (website || '').includes(d))) return true;

  if (/시장\s*규모.*CAGR|CAGR.*시장\s*규모/.test(description || '')) return true;

  return false;
}

// Pages that are FAQ, notice, portfolio pages — not company homepages
function isNonCompanyPage(company) {
  const { name, website } = company;

  if (/[?:]\s*(FAQ|notice|포트폴리오|portfolio)/i.test(name)) return true;
  if (/\s*:\s*notice$/.test(name)) return true;
  if (/포트폴리오$/.test(name) && /[?&](bmode|idx)=/.test(website || '')) return true;

  // Foreign B2B manufacturer aggregator pages (e.g. made-in-china.com)
  if (/made-in-china\.com/.test(website || '')) return true;
  // TV/cable shopping mall product pages
  if (/gsshop\.co/.test(website || '') || /lotteshoppingave\.com/.test(website || '')) return true;

  return false;
}

function isExhibitionListing(company) {
  const { name, website } = company;
  if (name === '대한민국ESG친환경대전 (ESG') return true;
  return false;
}

function classifyCompany(company) {
  if (isNewsArticle(company)) return 'news_media';
  if (isResearchPaper(company)) return 'research_paper';
  if (isGovernmentPage(company)) return 'government_page';
  if (isJobPosting(company)) return 'job_posting';
  if (isCompletelyUnrelated(company)) return 'completely_unrelated';
  if (isArticleOrReport(company)) return 'article_or_report';
  if (isExhibitionListing(company)) return 'exhibition';
  if (isBlogOrCaseStudy(company)) return 'blog_or_case_study';
  if (isMarketReport(company)) return 'market_report';
  if (isNonCompanyPage(company)) return 'non_company_page';
  return null;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const execute = process.argv.includes('--execute');

  const { data: companies, error } = await client
    .from('companies')
    .select('id, slug, name, description, category, website, products')
    .order('name');

  if (error) { console.error('Error:', error); process.exit(1); }

  const toRemove = [];
  for (const c of companies) {
    const reason = classifyCompany(c);
    if (reason) {
      toRemove.push({ ...c, reason });
    }
  }

  console.log(`\nTotal companies: ${companies.length}`);
  console.log(`Flagged for removal: ${toRemove.length}`);
  console.log(`Remaining after filter: ${companies.length - toRemove.length}\n`);

  const byReason = {};
  for (const c of toRemove) {
    if (!byReason[c.reason]) byReason[c.reason] = [];
    byReason[c.reason].push(c);
  }

  for (const [reason, items] of Object.entries(byReason)) {
    console.log(`\n=== ${reason.toUpperCase()} (${items.length}) ===`);
    for (const c of items) {
      console.log(`  - ${c.name} | ${c.website || 'no-website'}`);
    }
  }

  if (execute) {
    const ids = toRemove.map(c => c.id);
    console.log(`\nDeleting ${ids.length} irrelevant companies...`);

    const batchSize = 50;
    let deleted = 0;
    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);
      const { error: delError } = await client
        .from('companies')
        .delete()
        .in('id', batch);
      if (delError) {
        console.error(`Batch delete error:`, delError);
      } else {
        deleted += batch.length;
        console.log(`  Deleted batch ${Math.floor(i/batchSize) + 1}: ${batch.length} companies`);
      }
    }

    console.log(`\nDone. Deleted ${deleted} companies.`);

    const { count } = await client
      .from('companies')
      .select('*', { count: 'exact', head: true });
    console.log(`Remaining companies: ${count}`);
  } else {
    console.log('\n--- DRY RUN ---');
    console.log('Run with --execute to delete flagged companies.');
  }
}

main().catch(console.error);
