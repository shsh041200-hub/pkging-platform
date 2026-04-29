# WUV Baseline — packlinx.com

**Definition source:** [`wuv-definition.md`](./wuv-definition.md)  
**Dashboard:** https://plausible.io/packlinx.com  
**Owner:** CTO (capture) → CMO (weekly read once hired)

---

## Baseline anchor

| Field | Value |
|-------|-------|
| Site | `packlinx.com` |
| Tracker live since | 2026-04-29 (PACAA-34 merge `cdc0ebb7`) |
| Baseline ISO week | **2026-W18** (2026-04-27 Mon → 2026-05-03 Sun, Asia/Seoul) |
| Baseline WUV | _pending — read from dashboard at week close (2026-05-04 Mon)_ |
| Baseline source filter | none — total WUV across all traffic sources |
| Baseline organic-Korean WUV | _pending — Plausible Sources filter (Google + Naver + Daum)_ |

The first full ISO week with a complete `Mon..Sun` Plausible signal is **W18 (2026-04-27 → 2026-05-03)**. The tracker went live mid-week, so the partial 2026-W17 reading is not used as a baseline.

## How to capture the baseline

1. Open https://plausible.io/packlinx.com
2. Time range → **"Last 7 days"** on Monday 2026-05-04 (KST). Confirm it spans 2026-04-27 → 2026-05-03.
3. Verify timezone: Site settings → General → Timezone = `Asia/Seoul`.
4. Read the **"Unique visitors"** stat card → record into the **Baseline WUV** row above.
5. Click **Sources** → filter to Google + Naver + Daum → record the unique-visitors count → record into **Baseline organic-Korean WUV**.
6. Commit this file with the values + a note containing the screenshot ref or Plausible "Share" link.

## Decay & re-baseline

* The W18 baseline is the SG-2 denominator anchor. It is not re-baselined unless the WUV definition changes (see definition doc § "Revisit triggers").
* Subsequent weeks are appended to a rolling table below — do **not** overwrite W18.

## Weekly readings

| ISO week | Date range (KST) | WUV (total) | Organic KR WUV | SG-2 share | Notes |
|----------|------------------|-------------|----------------|------------|-------|
| 2026-W17 | 04-20 → 04-26 | n/a — tracker not live full week | — | — | Plausible installed mid-week |
| 2026-W18 | 04-27 → 05-03 | _pending_ | _pending_ | _pending_ | **Baseline** |
| 2026-W19 | 05-04 → 05-10 | | | | |
| 2026-W20 | 05-11 → 05-17 | | | | |

---

**References:** PACAA-83 (this issue), PACAA-34 (Plausible setup), SG-2 goal.
