# Shuixiong Miniapp Reliability and Guidance Rules Implementation Plan

> **For agentic workers:** REQUIRED: Use sp-executing-plans (if subagents available) or sp-executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add guidance-rule orchestration, graceful failure fallback, partial result support, and monitoring/analytics coverage for the miniapp practice loop.

**Architecture:** Keep rule configuration data-driven and runtime-loaded, then layer reliability around the existing loop: soft fallbacks first, persistence second, monitoring third. Treat every failure path as a valid user path with traceable telemetry.

**Tech Stack:** WeChat Mini Program native, WeChat Cloud Functions, Cloud Database, JavaScript, Tencent Cloud monitoring/logging, manual QA

---

## Chunk 1: Guidance rules and graceful fallback

### Planned files

**Create:**
- `cloud/shared/guidance-rule-cache.js`
- `cloud/shared/fallback-policy.js`
- `miniprogram/utils/track.js`

**Modify:**
- `cloud/advanceSession/index.js`
- `cloud/submitPracticeResult/index.js`
- `cloud/shared/tencent-tts.js`
- `cloud/shared/tencent-asr.js`
- `miniprogram/pages/practice/practice.js`
- `miniprogram/pages/practice/practice.wxml`
- `miniprogram/pages/practice/practice.wxss`
- `miniprogram/utils/api.js`

**Test:**
- Manual fallback scenarios
- Rule trigger verification from configured thresholds

### Task 1: Add failing guidance-rule scenarios

**Files:**
- Test: plan notes for guidance trigger cases

- [ ] **Step 1: Write the failing test**

Document these cases:
1. After 10 word practices, system should enter `parent_guidance`
2. After 5 minutes in one content, system should suggest content switch
3. Three ASR failures should not crash the loop

- [ ] **Step 2: Run verification to confirm current flow lacks configurable rules**

Run dynamic practice flow.
Expected: no rule-driven parent guidance configuration exists yet

- [ ] **Step 3: Write minimal implementation notes**

Define required runtime inputs:
- practice counters
- content duration
- response failure streaks
- cached `guidance_rule` definitions

- [ ] **Step 4: Re-run verification after implementation**

Expected: guidance phase triggers from configuration, not hardcoded page logic

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-04-12-shuixiong-reliability-guidance.md
git commit -m "docs: define guidance rule verification cases"
```

### Task 2: Implement guidance-rule cache and fallback policy

**Files:**
- Create: `cloud/shared/guidance-rule-cache.js`
- Create: `cloud/shared/fallback-policy.js`
- Modify: `cloud/advanceSession/index.js`
- Modify: `cloud/submitPracticeResult/index.js`
- Test: local/dev verification for rule hit and fallback outputs

- [ ] **Step 1: Write the failing test**

```js
const phase = evaluateGuidance(sampleSessionState, sampleRules)
expect(phase.nextPhase).toBe('parent_guidance')
```

- [ ] **Step 2: Run test to verify it fails**

Run local harness.
Expected: helper missing

- [ ] **Step 3: Write minimal implementation**

Implement:
- cached guidance-rule loading
- threshold evaluation by mode/content/duration/count
- fallback policy helper for TTS/ASR failures
- normalized `parent_guidance` response contract

- [ ] **Step 4: Run test to verify it passes**

Expected: matching rule returns guidance payload; failure path returns soft fallback instead of exceptioning user flow

- [ ] **Step 5: Commit**

```bash
git add cloud/shared/guidance-rule-cache.js cloud/shared/fallback-policy.js cloud/advanceSession/index.js cloud/submitPracticeResult/index.js
git commit -m "feat: add guidance rule evaluation and fallback policy"
```

## Chunk 2: Partial results and telemetry

### Task 3: Add partial result support on interrupted sessions

**Files:**
- Modify: `cloud/advanceSession/index.js`
- Modify: `cloud/shared/result-aggregator.js`
- Modify: `cloud/getParentSummary/index.js`
- Test: manual interrupt/content-switch scenario

- [ ] **Step 1: Write the failing test**

```js
const result = aggregateInterruptedSession(sampleInterruptedSession)
expect(result.partialResultFlag).toBe(true)
```

- [ ] **Step 2: Run test to verify it fails**

Run local harness.
Expected: no partial result flag generation yet

- [ ] **Step 3: Write minimal implementation**

Implement:
- partial result generation on content switch, timeout, or interrupted end
- parent summary response support for partial sessions
- soft copy selection for partial states

- [ ] **Step 4: Run test to verify it passes**

Expected: interrupted session still produces visible summary payload

- [ ] **Step 5: Commit**

```bash
git add cloud/advanceSession/index.js cloud/shared/result-aggregator.js cloud/getParentSummary/index.js
git commit -m "feat: support partial session results"
```

### Task 4: Add tracking, monitoring hooks, and failure telemetry

**Files:**
- Create: `miniprogram/utils/track.js`
- Modify: `miniprogram/pages/home/home.js`
- Modify: `miniprogram/pages/practice/practice.js`
- Modify: `miniprogram/pages/parent-summary/parent-summary.js`
- Modify: `cloud/initSession/index.js`
- Modify: `cloud/advanceSession/index.js`
- Modify: `cloud/submitPracticeResult/index.js`
- Modify: `cloud/getParentSummary/index.js`
- Test: manual event emission verification and log inspection

- [ ] **Step 1: Write the failing test**

Document expected telemetry:
- start practice event
- TTS failure event
- ASR failure event
- parent guidance trigger event
- parent summary view event

- [ ] **Step 2: Run test to verify it fails**

Run manual flow and inspect logs.
Expected: no structured tracking coverage yet

- [ ] **Step 3: Write minimal implementation**

Implement:
- front-end tracking wrapper with shared payload fields
- structured cloud logs/metrics payloads for core functions
- event names aligned with the design doc monitoring section

- [ ] **Step 4: Run test to verify it passes**

Run one full practice and inspect logs.
Expected: structured telemetry exists for major actions and failures

- [ ] **Step 5: Commit**

```bash
git add miniprogram/utils/track.js miniprogram/pages/home/home.js miniprogram/pages/practice/practice.js miniprogram/pages/parent-summary/parent-summary.js cloud/initSession/index.js cloud/advanceSession/index.js cloud/submitPracticeResult/index.js cloud/getParentSummary/index.js
 git commit -m "feat: add monitoring and telemetry hooks"
```

---
