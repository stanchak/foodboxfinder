---
phase: 20
slug: design-system-layout
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-20
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed (no test runner in project) |
| **Config file** | none — Wave 0 not needed (next build serves as gate) |
| **Quick run command** | `npx next build` |
| **Full suite command** | `npx next build` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx next build`
- **After every plan wave:** Run `npx next build` + manual responsive check at 375px, 768px, 1280px
- **Before `/gsd:verify-work`:** Full build must succeed + visual inspection
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | DS-01 | build-check | `npx next build` | N/A (CSS) | ⬜ pending |
| 20-02-01 | 02 | 1 | DS-02 | build-check + manual | `npx next build` | N/A | ⬜ pending |
| 20-03-01 | 03 | 2 | DS-03 | build-check + manual | `npx next build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers phase requirements. `next build` verifies TypeScript compilation, CSS compilation, and import correctness. No test framework installation needed for this phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Responsive header 375-1440px | DS-02 | Visual layout verification | Resize browser to 375px, 768px, 1024px, 1280px; verify header/footer render correctly |
| Mobile hamburger menu | DS-02 | Interactive state testing | At 375px, tap hamburger; verify drawer opens with all nav links |
| Component visual appearance | DS-03 | Aesthetic verification | Review each component variant; verify shadows, colors, typography match design decisions |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
