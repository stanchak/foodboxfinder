---
phase: 1
slug: data-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | No test framework installed (no Jest, Vitest, or Playwright) |
| **Config file** | none |
| **Quick run command** | `npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts` |
| **Full suite command** | `npx prisma generate && npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx prisma generate` (validates schema)
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DATA-01 | schema | `npx prisma generate` | N/A | pending |
| 01-01-02 | 01 | 1 | DATA-02 | schema | `npx prisma generate` | N/A | pending |
| 01-02-01 | 02 | 1 | DATA-03 | script | `npx tsx prisma/seed.ts` | N/A | pending |
| 01-02-02 | 02 | 1 | DATA-04 | script | `npx tsx prisma/seed.ts` | N/A | pending |
| 01-02-03 | 02 | 1 | DATA-05 | manual | `ls public/assets/providers/*.png` | N/A | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed for schema validation and seed script execution.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| .ico to .png conversion quality | DATA-05 | Visual inspection of converted images | Open converted .png files and verify they render correctly |
| Logo path correctness | DATA-04 | Requires visual spot-check | Verify 5 random providers have correct logoUrl pointing to existing files |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
