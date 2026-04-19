export interface ExtractedCompany {
  name: string | null
  description: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  province: string | null
  products: string[]
  certifications: string[]
  website: string
  rawText: string
}

// Pull a single meta tag value by name or property
function getMeta(html: string, attr: string, value: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:${attr})=["']${value}["'][^>]+content=["']([^"']+)["']`,
    'i'
  )
  const m = html.match(re)
  if (m) return m[1].trim()

  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:${attr})=["']${value}["']`,
    'i'
  )
  const m2 = html.match(re2)
  return m2 ? m2[1].trim() : null
}

function getTitle(html: string): string | null {
  const og = getMeta(html, 'property', 'og:title')
  if (og) return og

  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return m ? m[1].trim() : null
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function extractPhone(text: string): string | null {
  // Korean phone patterns: 02-xxx-xxxx, 031-xxx-xxxx, 010-xxxx-xxxx, etc.
  const m = text.match(/0\d{1,2}[-.\s]\d{3,4}[-.\s]\d{4}/)
  return m ? m[0].replace(/[\s.]/g, '-') : null
}

function extractEmail(text: string): string | null {
  const m = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/)
  return m ? m[0] : null
}

// Province detection from Korean text
const PROVINCE_MAP: Record<string, string> = {
  서울: '서울특별시',
  부산: '부산광역시',
  대구: '대구광역시',
  인천: '인천광역시',
  광주: '광주광역시',
  대전: '대전광역시',
  울산: '울산광역시',
  세종: '세종특별자치시',
  경기: '경기도',
  강원: '강원도',
  충북: '충청북도',
  충남: '충청남도',
  전북: '전라북도',
  전남: '전라남도',
  경북: '경상북도',
  경남: '경상남도',
  제주: '제주특별자치도',
}

function extractProvince(text: string): { province: string | null; city: string | null } {
  for (const [key, full] of Object.entries(PROVINCE_MAP)) {
    if (text.includes(key)) {
      const cityMatch = text.match(new RegExp(`${key}[^\\s]*\\s+([\\w]+[시군구])`))
      return { province: full, city: cityMatch ? cityMatch[1] : null }
    }
  }
  return { province: null, city: null }
}

function extractCertifications(text: string): string[] {
  const certKeywords = [
    'ISO 9001', 'ISO 14001', 'ISO 22000', 'HACCP', 'FSC', 'GRS', 'KS',
    'AEO', 'ESD', 'OK Compost', 'BRC', 'UN 위험물',
  ]
  return certKeywords.filter((k) => text.toUpperCase().includes(k.toUpperCase()))
}

export function extractCompanyInfo(html: string, url: string): ExtractedCompany {
  const rawText = stripTags(html)

  const name = getTitle(html)
  const description =
    getMeta(html, 'property', 'og:description') ??
    getMeta(html, 'name', 'description') ??
    null

  const phone = extractPhone(rawText)
  const email = extractEmail(rawText)
  const { province, city } = extractProvince(rawText)

  // Simple address extraction: grab text around 도로명 or 번지 patterns
  const addrMatch = rawText.match(
    /[가-힣\d\s]+(?:로|길|대로|번길)\s*\d+[^\s,]*/
  )
  const address = addrMatch ? addrMatch[0].trim() : null

  return {
    name,
    description: description ? description.slice(0, 500) : null,
    phone,
    email,
    address,
    city,
    province,
    products: [],
    certifications: extractCertifications(rawText),
    website: url,
    rawText: rawText.slice(0, 3000),
  }
}
