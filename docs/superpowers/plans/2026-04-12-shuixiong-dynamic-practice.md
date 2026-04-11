# Shuixiong Miniapp Dynamic Practice Implementation Plan

> **For agentic workers:** REQUIRED: Use sp-executing-plans (if subagents available) or sp-executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dynamic practice loop with target-pool selection, ASR submission, session advancement, and practice-page state transitions.

**Architecture:** Keep the practice loop split into three responsibilities: miniapp page state/rendering, cloud orchestration for progression, and persistence for session/event trails. Add only the minimum caching and rule evaluation required to support non-repeating dynamic practice.

**Tech Stack:** WeChat Mini Program native, WeChat Cloud Functions, Cloud Database, JavaScript, Tencent Cloud ASR/TTS adapters, manual QA

---

## Chunk 1: Dynamic content and session progression

### Planned files

**Create:**
- `cloud/advanceSession/index.js`
- `cloud/advanceSession/package.json`
- `cloud/submitPracticeResult/index.js`
- `cloud/submitPracticeResult/package.json`
- `cloud/shared/content-cache.js`
- `cloud/shared/session-cache.js`
- `cloud/shared/tencent-asr.js`
- `cloud/shared/tencent-tts.js`
- `miniprogram/utils/audio.js`
- `miniprogram/utils/recorder.js`

**Modify:**
- `miniprogram/pages/practice/practice.js`
- `miniprogram/pages/practice/practice.wxml`
- `miniprogram/pages/practice/practice.wxss`
- `miniprogram/utils/api.js`
- `cloud/initSession/index.js`

**Test:**
- Manual end-to-end practice loop in WeChat DevTools
- Function-level local/dev verification for progression behavior

### Task 1: Add failing progression scenarios

**Files:**
- Test: plan-level verification notes for dynamic practice

- [ ] **Step 1: Write the failing test**

Document these failing scenarios before implementation:
1. Same target appears twice in a row within one mode
2. Practice page cannot move from first target to second target after ASR submission
3. Practice page cannot recover when session cache is cold

- [ ] **Step 2: Run verification to confirm current flow cannot satisfy them**

Run in WeChat DevTools after P0 foundation:
- Start one session
Expected: no real target progression or ASR-backed loop exists yet

- [ ] **Step 3: Write minimal implementation plan notes**

Define the smallest progression contract:
- `submitPracticeResult` writes one event
- `advanceSession(practiceResultSubmitted)` returns next target or guidance phase
- content/session cache decides next target

- [ ] **Step 4: Re-run manual verification after implementation**

Expected: practice can progress across multiple targets with no immediate duplicate target

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/plans/2026-04-12-shuixiong-dynamic-practice.md
git commit -m "docs: define dynamic practice verification cases"
```

### Task 2: Build content cache and target-pool selector

**Files:**
- Create: `cloud/shared/content-cache.js`
- Modify: `cloud/initSession/index.js`
- Test: local/dev invocation proving content selection avoids recent repetition

- [ ] **Step 1: Write the failing test**

Describe the selector case in executable pseudocode:
```js
const pool = ['a', 'b', 'c']
const recent = ['a']
const next = pickNextContent(pool, recent)
expect(next).not.toBe('a')
```

- [ ] **Step 2: Run test to verify it fails**

Run a local node harness or minimal function invocation against missing selector.
Expected: selector helper not found / behavior absent

- [ ] **Step 3: Write minimal implementation**

Implement:
- content config load with in-memory cache
- random content selection excluding recent content ids where possible
- target-pool fetch by `contentId + targetType`

- [ ] **Step 4: Run test to verify it passes**

Run selector harness again.
Expected: excluded recent content is not selected unless pool exhausted

- [ ] **Step 5: Commit**

```bash
git add cloud/shared/content-cache.js cloud/initSession/index.js
git commit -m "feat: add cached content selection"
```

### Task 3: Add session cache and non-repeating target selection

**Files:**
- Create: `cloud/shared/session-cache.js`
- Modify: `cloud/initSession/index.js`
- Modify: `cloud/advanceSession/index.js`
- Test: progression verification for remaining target pool / reset on exhaustion

- [ ] **Step 1: Write the failing test**

```js
const state = { remainingTargetIds: ['t1', 't2'], recentTargetIds: ['t1'] }
const next = pickNextTarget(state)
expect(next).toBe('t2')
```

- [ ] **Step 2: Run test to verify it fails**

Run selector harness.
Expected: helper missing / no exclusion logic

- [ ] **Step 3: Write minimal implementation**

Implement:
- session cache load/save by `sessionId`
- current mode state
- remaining target pool
- recent target exclusion
- pool reset when exhausted

- [ ] **Step 4: Run test to verify it passes**

Expected: next target respects non-repetition rule and resets only after exhaustion

- [ ] **Step 5: Commit**

```bash
git add cloud/shared/session-cache.js cloud/initSession/index.js cloud/advanceSession/index.js
git commit -m "feat: add session target pool state"
```

## Chunk 2: ASR/TTS loop and practice-page state

### Task 4: Implement submitPracticeResult with Tencent ASR adapter

**Files:**
- Create: `cloud/submitPracticeResult/index.js`
- Create: `cloud/submitPracticeResult/package.json`
- Create: `cloud/shared/tencent-asr.js`
- Modify: `miniprogram/utils/api.js`
- Test: dev invocation returning response type and recognized text

- [ ] **Step 1: Write the failing test**

```js
const result = await submitPracticeResult({ sessionId: 's1', targetId: 't1', audioFileId: 'file1' })
expect(result).toHaveProperty('responseType')
```

- [ ] **Step 2: Run test to verify it fails**

Run function invocation against missing function.
Expected: function not found

- [ ] **Step 3: Write minimal implementation**

Implement:
- audio file handoff to Tencent ASR adapter
- normalized output: `responseType`, `recognizedText`, `shouldEncourage`
- event write into `session_event`

- [ ] **Step 4: Run test to verify it passes**

Expected: function returns normalized schema even for fallback/error paths

- [ ] **Step 5: Commit**

```bash
git add cloud/submitPracticeResult cloud/shared/tencent-asr.js miniprogram/utils/api.js
git commit -m "feat: add submit practice result function"
```

### Task 5: Implement advanceSession and practice page progression

**Files:**
- Create: `cloud/advanceSession/index.js`
- Create: `cloud/advanceSession/package.json`
- Create: `cloud/shared/tencent-tts.js`
- Modify: `miniprogram/pages/practice/practice.js`
- Modify: `miniprogram/pages/practice/practice.wxml`
- Modify: `miniprogram/pages/practice/practice.wxss`
- Modify: `miniprogram/utils/audio.js`
- Modify: `miniprogram/utils/recorder.js`
- Test: manual loop from prompt playback -> record -> submit -> next target

- [ ] **Step 1: Write the failing test**

Document the expected loop:
1. `startPlaybackFinished` returns a practice target
2. recording and submission yield `practiceResultSubmitted`
3. next target returns with `promptAudioUrl` or fallback `promptText`

- [ ] **Step 2: Run test to verify it fails**

Run manual loop in DevTools.
Expected: no full progression loop exists yet

- [ ] **Step 3: Write minimal implementation**

Implement:
- `advanceSession` event routing
- `nextPhase=practice` response contract
- TTS generation/caching for target prompt audio
- practice page render/update cycle for target text, playback, recording, submit, next target

- [ ] **Step 4: Run test to verify it passes**

Run manual flow with at least 3 targets.
Expected: page progresses correctly and avoids immediate repeats

- [ ] **Step 5: Commit**

```bash
git add cloud/advanceSession cloud/shared/tencent-tts.js miniprogram/pages/practice miniprogram/utils/audio.js miniprogram/utils/recorder.js
 git commit -m "feat: add dynamic practice progression"
```

---
