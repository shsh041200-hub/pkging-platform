# WUV (Weekly Unique Visitors) — Definition

**Owner:** CTO  
**Status:** Active  
**Source of truth:** Plausible Cloud dashboard at https://plausible.io/packlinx.com  
**Used as the denominator for:** SG-2 (한국어 패키징 핵심 50 키워드 SEO 점유율 40%), SG-3 (analytics foundation)

---

## Definition

**WUV** is the count of distinct devices ("unique visitors") that loaded any page on `packlinx.com` during a given **ISO-8601 week** (Monday 00:00 KST through Sunday 23:59 KST), as reported by Plausible Cloud's `Unique visitors` metric.

A "unique visitor" in Plausible is identified per-day by a hash of (IP + User-Agent + daily salt). When the same device returns on a later day in the same week, Plausible deduplicates within its weekly aggregation; the dashboard's "Last 7 days" view returns the deduplicated weekly count.

## Formula

```
WUV(week W) = unique_visitors( site=packlinx.com, range=W_start..W_end, exclude=bots ∪ admin ∪ self_excluded )
```

Read in Plausible as: dashboard → time range → **"Last 7 days"** (or a custom ISO-week range) → **"Unique visitors"** stat card.

## Inclusions / exclusions

| Class | Counted? | Mechanism |
|------|----------|-----------|
| Real human page loads on `packlinx.com` (any path) | ✅ | default Plausible script |
| Bot traffic matched by `proxy.ts` `BLOCKED_BOT_RE` (GPTBot, CCBot, Bytespider, etc.) | ❌ | edge-blocked with HTTP 403 → script never runs |
| Other known bots (Googlebot, Bingbot, Yeti, …) | ❌ | Plausible's built-in IAB/Spiders & Bots list filters them server-side |
| `/admin/*` routes | ❌ | `PlausibleProvider` short-circuits when `pathname.startsWith('/admin')` |
| Operator self-exclusion | ❌ | `PlausibleProvider` short-circuits when `localStorage['plausible_ignore'] === 'true'` |
| Non-production environments | ❌ | `PlausibleProvider` returns null when `NODE_ENV !== 'production'` |
| Internal IPs (founder, CTO local dev) | ⚠️ partial | covered by self-exclusion + non-prod gate; no dedicated IP allowlist (Plausible Cloud lacks IP-filter UI on starter tier) |

## ISO-week boundary

We anchor weeks to **ISO-8601** (Mon→Sun) in the `Asia/Seoul` time zone — this is what Plausible uses when the dashboard time-zone is set to Seoul. The site time-zone setting in Plausible must be `Asia/Seoul` for this to hold; verify under **Site settings → General → Timezone** before each baseline read.

## Ratio derived from WUV

For SG-2 measurement:

```
SEO_share(W) = organic_korean_unique_visitors(W) / WUV(W)
```

where `organic_korean_unique_visitors` is the WUV filtered to source ∈ {Google, Naver, Daum} and language `ko`. The numerator is computed in Plausible via the **"Sources"** breakdown; the denominator is the WUV defined above.

## Why this definition

* **ISO weeks** are the standard reporting cadence used by GSC, Naver Search Advisor, and most analytics tools — picking the same boundary avoids cross-tool reconciliation drift.
* **Unique visitors** (not pageviews, not sessions) is the right denominator for "audience reach" goals; pageviews reward thin spam-style content, sessions are tool-defined and inconsistent across vendors.
* **Plausible-native filters** (built-in bot list + our edge block) are sufficient for the solo-operator stage. Adding GA-style internal-IP filters costs more in operator time than it saves in measurement noise at our current volume (<1k WUV).

## Revisit triggers

Re-open this definition if any of the following occur:

1. WUV exceeds 10k/week — internal-IP noise becomes material; consider Plausible's Business plan IP filter or self-host CE.
2. We add a non-Korean market — language slicing in the SG-2 ratio needs revisiting.
3. We migrate off Plausible — definition must be re-anchored to the new tool's "unique visitor" semantics.

---

**References:** PACAA-83 (this issue), PACAA-25 plan v3 §3, PACAA-34 (Plausible setup).
