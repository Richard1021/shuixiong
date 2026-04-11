# Shuixiong Miniapp P0 Foundation Implementation Plan

> **For agentic workers:** REQUIRED: Use sp-executing-plans (if subagents available) or sp-executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the deleted miniprogram and cloud skeleton, add child profile management, default child selection, and a runnable start-to-practice entry path.

**Architecture:** Build the smallest vertical slice first: app shell, child selection flow, home page CTA, and `initSession` cloud function. Persist child identity in cloud storage/database and local app state so every later practice session starts with an explicit child context.

**Tech Stack:** WeChat Mini Program native, WeChat Cloud Functions, Cloud Database, JavaScript, manual QA

---

## Chunk 1: File structure and boundaries

### Planned files

**Create:**
- `miniprogram/app.js`
- `miniprogram/app.json`
- `miniprogram/app.wxss`
- `miniprogram/project.config.json`
- `project.config.json`
- `miniprogram/pages/home/home.js`
- `miniprogram/pages/home/home.json`
- `miniprogram/pages/home/home.wxml`
- `miniprogram/pages/home/home.wxss`
- `miniprogram/pages/child-profile/child-profile.js`
- `miniprogram/pages/child-profile/child-profile.json`
- `miniprogram/pages/child-profile/child-profile.wxml`
- `miniprogram/pages/child-profile/child-profile.wxss`
- `miniprogram/pages/practice/practice.js`
- `miniprogram/pages/practice/practice.json`
- `miniprogram/pages/practice/practice.wxml`
- `miniprogram/pages/practice/practice.wxss`
- `miniprogram/utils/api.js`
- `cloud/initSession/index.js`
- `cloud/initSession/package.json`
- `cloud/getChildProfiles/index.js`
- `cloud/getChildProfiles/package.json`
- `cloud/saveChildProfile/index.js`
- `cloud/saveChildProfile/package.json`

**Modify:**
- None; the codebase currently lacks these app files.

**Test / verify:**
- WeChat DevTools simulator manual checks
- Cloud function local invocation where available

### Task 1: Recreate miniprogram app shell

**Files:**
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/project.config.json`
- Create: `project.config.json`

- [ ] **Step 1: Write the failing verification target**

Define the expected app shell behavior in the plan notes:
- App boots without missing-page errors
- Default route resolves to `pages/home/home`
- Global config includes `pages/home/home`, `pages/child-profile/child-profile`, `pages/practice/practice`

- [ ] **Step 2: Run verification to confirm files are missing**

Run: `test -f /Users/lucas/shuixiongv2/miniprogram/app.json`
Expected: non-zero exit / file missing

- [ ] **Step 3: Write minimal implementation**

Create the app shell files with the smallest valid miniapp configuration and register the three pages above.

- [ ] **Step 4: Run verification to confirm structure exists**

Run: `test -f /Users/lucas/shuixiongv2/miniprogram/app.json && test -f /Users/lucas/shuixiongv2/miniprogram/pages/home/home.js`
Expected: exit code 0

- [ ] **Step 5: Commit**

```bash
git add miniprogram/app.js miniprogram/app.json miniprogram/app.wxss miniprogram/project.config.json project.config.json
git commit -m "feat: recreate miniprogram app shell"
```

### Task 2: Build child profile page and default-child flow

**Files:**
- Create: `miniprogram/pages/child-profile/child-profile.js`
- Create: `miniprogram/pages/child-profile/child-profile.json`
- Create: `miniprogram/pages/child-profile/child-profile.wxml`
- Create: `miniprogram/pages/child-profile/child-profile.wxss`
- Create: `miniprogram/utils/api.js`
- Test: WeChat DevTools manual flow for no-default-child and switch-child

- [ ] **Step 1: Write the failing test/verification case**

Document two manual cases:
1. No cached/default child → entering home and clicking start routes to child profile selection
2. Existing default child → home shows current child and does not block start

- [ ] **Step 2: Run verification to confirm page is absent**

Run: `test -f /Users/lucas/shuixiongv2/miniprogram/pages/child-profile/child-profile.wxml`
Expected: non-zero exit / file missing

- [ ] **Step 3: Write minimal implementation**

Implement:
- Child list render
- Add child form with only required fields
- Set current child action
- Local cache for current child summary
- API wrappers for `getChildProfiles` and `saveChildProfile`

- [ ] **Step 4: Run verification to confirm expected behavior**

Run in WeChat DevTools:
- Clear storage
- Open home page
- Tap start
Expected: app routes to child profile page

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/child-profile miniprogram/utils/api.js
git commit -m "feat: add child profile selection flow"
```

### Task 3: Add home page start CTA with current child context

**Files:**
- Create: `miniprogram/pages/home/home.js`
- Create: `miniprogram/pages/home/home.json`
- Create: `miniprogram/pages/home/home.wxml`
- Create: `miniprogram/pages/home/home.wxss`
- Test: WeChat DevTools manual check for weak current-child exposure and start CTA

- [ ] **Step 1: Write the failing verification case**

Document expected UI:
- One primary CTA only
- Current child shown weakly at top
- Start blocks only when there is no child context

- [ ] **Step 2: Run verification to confirm page is absent**

Run: `test -f /Users/lucas/shuixiongv2/miniprogram/pages/home/home.wxml`
Expected: non-zero exit / file missing

- [ ] **Step 3: Write minimal implementation**

Implement:
- Single primary CTA
- Current child summary read on load/show
- Start action that routes to child-profile if needed, otherwise calls `initSession`

- [ ] **Step 4: Run verification to confirm expected behavior**

Run in WeChat DevTools:
- With cached child, open home page
Expected: current child visible and start CTA enabled

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/home
git commit -m "feat: add home start entry with child context"
```

## Chunk 2: Cloud foundations

### Task 4: Create child profile cloud functions

**Files:**
- Create: `cloud/getChildProfiles/index.js`
- Create: `cloud/getChildProfiles/package.json`
- Create: `cloud/saveChildProfile/index.js`
- Create: `cloud/saveChildProfile/package.json`
- Test: function invocation against cloud database emulator or real dev env

- [ ] **Step 1: Write the failing test/verification case**

Define expected behavior:
- `getChildProfiles` returns active children for current parent and marks the current child
- `saveChildProfile` creates child records and updates `isCurrent`

- [ ] **Step 2: Run verification to confirm function files are absent**

Run: `test -f /Users/lucas/shuixiongv2/cloud/getChildProfiles/index.js`
Expected: non-zero exit / file missing

- [ ] **Step 3: Write minimal implementation**

Implement both functions with these boundaries:
- Read parent identity from cloud context
- Create child profile with minimal fields
- Ensure only one child has `isCurrent=1` per parent

- [ ] **Step 4: Run verification to confirm cloud functions behave correctly**

Run in cloud env/local tooling:
- Create two children
- Set one as current
Expected: only one current child returned

- [ ] **Step 5: Commit**

```bash
git add cloud/getChildProfiles cloud/saveChildProfile
git commit -m "feat: add child profile cloud functions"
```

### Task 5: Add initSession cloud function and practice placeholder page

**Files:**
- Create: `cloud/initSession/index.js`
- Create: `cloud/initSession/package.json`
- Create: `miniprogram/pages/practice/practice.js`
- Create: `miniprogram/pages/practice/practice.json`
- Create: `miniprogram/pages/practice/practice.wxml`
- Create: `miniprogram/pages/practice/practice.wxss`
- Test: manual start flow from home to practice page with session payload

- [ ] **Step 1: Write the failing test/verification case**

Expected behavior:
- Home CTA calls `initSession`
- Function returns `sessionId`, randomly selected `contentId`, `displayTitle`, `startAudioUrl`, `startAudioDurationMs`
- Practice page opens with returned payload shown minimally

- [ ] **Step 2: Run verification to confirm function/page are absent**

Run: `test -f /Users/lucas/shuixiongv2/cloud/initSession/index.js && test -f /Users/lucas/shuixiongv2/miniprogram/pages/practice/practice.js`
Expected: non-zero exit / file missing

- [ ] **Step 3: Write minimal implementation**

Implement:
- `initSession` using placeholder/random content fallback logic
- session record creation with `childId`, `contentId`, `currentMode=word`
- practice page placeholder that reads navigation params or local store payload

- [ ] **Step 4: Run verification to confirm expected behavior**

Run in WeChat DevTools:
- Select child
- Tap start
Expected: practice page opens with a valid session id and content title

- [ ] **Step 5: Commit**

```bash
git add cloud/initSession miniprogram/pages/practice miniprogram/pages/home/home.js miniprogram/utils/api.js
git commit -m "feat: add init session entry flow"
```

---
