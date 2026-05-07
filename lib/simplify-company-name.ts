const LEGAL_ENTITIES = /\(주\)|\(유\)|주식회사|유한회사|유한책임회사|합자회사|합명회사/g
const STAR_WRAPPED = /^★+\s*(.+?)\s*★+/
const BRACKET_WRAPPER = /^\[(.+?)\]$/
const LEADING_BRACKET_TAG = /^\[.+?\]\s+/
const SEPARATORS = /\s*[\/ㅣ|]\s*/
const COLON_SUFFIX = /\s*:\s+/

export function simplifyCompanyName(name: string): string {
  let s = name.trim()

  s = s.replace(LEGAL_ENTITIES, '').trim()

  const starMatch = s.match(STAR_WRAPPED)
  if (starMatch) {
    s = starMatch[1].trim()
  }

  const bracketMatch = s.match(BRACKET_WRAPPER)
  if (bracketMatch) {
    s = bracketMatch[1].trim()
  } else {
    s = s.replace(LEADING_BRACKET_TAG, '').trim()
  }

  s = splitAndKeepFirst(s, SEPARATORS, 3)
  s = splitAndKeepFirst(s, COLON_SUFFIX, 2)

  return s || name.trim()
}

function splitAndKeepFirst(s: string, sep: RegExp, minLen: number): string {
  const idx = s.search(sep)
  if (idx >= minLen) {
    return s.slice(0, idx).trim()
  }
  return s
}
