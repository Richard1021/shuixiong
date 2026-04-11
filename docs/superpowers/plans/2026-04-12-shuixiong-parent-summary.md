# Shuixiong Miniapp Parent Summary Implementation Plan

> **For agentic workers:** REQUIRED: Use sp-executing-plans (if subagents available) or sp-executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the parent results page, session result aggregation, growth-level mapping, and child-switchable summary queries.

**Architecture:** Aggregate once at session end, then query cheaply for parent view rendering. Keep page rendering, aggregation logic, and growth-rule mapping separated so result UI and scoring rules can evolve independently.

**Tech Stack:** WeChat Mini Program native, WeChat Cloud Functions, Cloud Database, JavaScript, manual QA

---

## Chunk 1: Result aggregation foundations

### Planned files

**Create:**
- `cloud/getParentSummary/index.js`
- `cloud/getParentSummary/package.json`
- `cloud/shared/result-aggregator.js`
- `cloud/shared/growth-level.js`
- `miniprogram/pages/parent-summary/parent-summary.js`
- `miniprogram/pages/parent-summary/parent-summary.json`
- `miniprogram/pages/parent-summary/parent-summary.wxml`
- `miniprogram/pages/parent-summary/parent-summary.wxss`

**Modify:**
- `miniprogram/app.json`
- `miniprogram/pages/home/home.wxml`
- `miniprogram/pages/home/home.js`
- `miniprogram/utils/api.js`
- `cloud/advanceSession/index.js`

**Test:**
- Manual parent page rendering
- Function verification for aggregation and child switching

### Task 1: Add failing aggregation examples

**Files:**
- Test: plan-level aggregation example notes

- [ ] **Step 1: Write the failing test**

Capture this example before implementing:
- 3 word events, 2 phrase events, 1 stable attempt
- Expect aggregated heard/tried/stable counts and one growth level output

- [ ] **Step 2: Run verification to confirm current code does not aggregate results**

Run dev flow after dynamic practice.
Expected: no parent summary endpoint/page yet

- [ ] **Step 3: Write minimal implementation notes**

Define aggregator inputs:
- `session`
- `session_event[]`
- optional recent history for trend text

- [ ] **Step 4: Re-run verification after implementation**

Expected: one finished session produces one readable summary

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-04-12-shuixiong-parent-summary.md
git commit -m "docs: define parent summary aggregation cases"
```

### Task 2: Build aggregation and growth-level helpers

**Files:**
- Create: `cloud/shared/result-aggregator.js`
- Create: `cloud/shared/growth-level.js`
- Modify: `cloud/advanceSession/index.js`
- Test: local harness or cloud invocation against sample event payloads

- [ ] **Step 1: Write the failing test**

```js
const result = aggregateSessionResult({ events: sampleEvents })
expect(result.growthLevel).toBe('L3')
```

- [ ] **Step 2: Run test to verify it fails**

Run local harness.
Expected: helper missing

- [ ] **Step 3: Write minimal implementation**

Implement:
- heard/tried/stable counters by target type
- growth-level rule mapping
- suggestion text generation stub
- summary write trigger at session end / content switch end

- [ ] **Step 4: Run test to verify it passes**

Expected: sample payload returns deterministic counts and level

- [ ] **Step 5: Commit**

```bash
git add cloud/shared/result-aggregator.js cloud/shared/growth-level.js cloud/advanceSession/index.js
git commit -m "feat: add session result aggregation"
```

## Chunk 2: Parent page and child switching

### Task 3: Build getParentSummary cloud function

**Files:**
- Create: `cloud/getParentSummary/index.js`
- Create: `cloud/getParentSummary/package.json`
- Modify: `miniprogram/utils/api.js`
- Test: function invocation for latest child summary and 7-day trend

- [ ] **Step 1: Write the failing test**

```js
const summary = await getParentSummary({ childId: 'c1' })
expect(summary).toHaveProperty('growthLevel')
expect(summary).toHaveProperty('recentTrendText')
```

- [ ] **Step 2: Run test to verify it fails**

Run function invocation.
Expected: function not found

- [ ] **Step 3: Write minimal implementation**

Implement:
- latest `session_result` query by `childId`
- recent 7-day history query
- normalized parent summary response schema

- [ ] **Step 4: Run test to verify it passes**

Expected: valid summary object for a child with at least one completed/partial session

- [ ] **Step 5: Commit**

```bash
git add cloud/getParentSummary miniprogram/utils/api.js
git commit -m "feat: add parent summary query"
```

### Task 4: Build parent summary page with child switch

**Files:**
- Create: `miniprogram/pages/parent-summary/parent-summary.js`
- Create: `miniprogram/pages/parent-summary/parent-summary.json`
- Create: `miniprogram/pages/parent-summary/parent-summary.wxml`
- Create: `miniprogram/pages/parent-summary/parent-summary.wxss`
- Modify: `miniprogram/app.json`
- Modify: `miniprogram/pages/home/home.js`
- Modify: `miniprogram/pages/home/home.wxml`
- Test: manual rendering and child switch behavior

- [ ] **Step 1: Write the failing test**

Document expected page blocks:
- today result card
- speaking performance card
- recent progress card
- heard content card
- suggestion card

- [ ] **Step 2: Run test to verify it fails**

Run DevTools navigation.
Expected: page route missing

- [ ] **Step 3: Write minimal implementation**

Implement:
- parent page route and layout
- summary fetch on load/show
- child switch control reusing child profile source
- empty/partial states without harsh wording

- [ ] **Step 4: Run test to verify it passes**

Run manual flow:
- finish one session
- open parent page
- switch child
Expected: page refreshes correct result data per child

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/parent-summary miniprogram/app.json miniprogram/pages/home/home.js miniprogram/pages/home/home.wxml
 git commit -m "feat: add parent summary page"
```

---
