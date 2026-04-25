// Notice window constants for 2026-05-02 Terms & Privacy Policy revision
// Update these constants only — no other changes needed when the window shifts.
export const NOTICE_START = new Date('2026-04-25T00:00:00+09:00')
export const NOTICE_END_BANNER = new Date('2026-05-09T23:59:59+09:00')
export const NOTICE_END_FOOTER = new Date('2026-06-01T23:59:59+09:00')

export const BANNER_DISMISS_KEY = 'terms_notice_2026_05_02_dismissed'

export function isBannerWindowActive(): boolean {
  const now = new Date()
  return now >= NOTICE_START && now <= NOTICE_END_BANNER
}

export function isFooterNoticeActive(): boolean {
  const now = new Date()
  return now >= NOTICE_START && now <= NOTICE_END_FOOTER
}
