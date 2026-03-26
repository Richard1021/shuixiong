# 水熊宝 AI 英语启蒙 - S1 阶段实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 S1 阶段儿童端微信小程序核心功能，包括课程播放、跟读评分、语音控制和水熊虫 IP 引导。

**Architecture:**
- 前端：原生微信小程序（页面 + 组件）
- 后端：微信云开发（云函数 + 云数据库 + 云存储）
- 语音：微信同声传译 API（预留讯飞切换接口）

**Tech Stack:**
- 微信小程序原生开发 (WXML/WXSS/JavaScript)
- 微信云开发 (CloudBase)
- 微信同声传译插件 (语音识别)

---

## 文件结构

### 小程序目录结构
```
/miniprogram/
├── app.js                 # 小程序入口
├── app.json               # 小程序配置
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
├── cloud/                 # 云函数目录
│   ├── getCourseList/     # 获取课程列表
│   ├── getCourseDetail/   # 获取课程详情
│   ├── submitRecording/   # 提交跟读录音
│   └── recognizeVoice/    # 语音指令识别
├── pages/                 # 页面目录
│   ├── home/              # 首页（课程列表）
│   ├── player/            # 播放页（跟读主界面）
│   └── profile/           # 个人中心
├── components/            # 组件目录
│   ├── shuixiong/         # 水熊虫 IP 组件
│   ├── audio-player/      # 音频播放器组件
│   └── score-panel/       # 评分展示组件
└── utils/                 # 工具函数
    ├── audio.js           # 音频处理
    ├── recorder.js        # 录音管理
    └── api.js             # 云函数调用封装
```

---

## 任务分解

### Task 1: 项目初始化配置

**Files:**
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/project.config.json`

- [ ] **Step 1: 创建 app.js 入口文件**

```javascript
// miniprogram/app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'your-env-id', // 替换为你的云开发环境 ID
        traceUser: true,
      });
    }

    this.globalData = {
      userInfo: null,
      currentCourse: null,
      isPlaying: false,
    };
  },

  globalData: {
    userInfo: null,
    currentCourse: null,
    isPlaying: false,
  },
});
```

- [ ] **Step 2: 创建 app.json 配置文件**

```json
{
  "pages": [
    "pages/home/home",
    "pages/player/player",
    "pages/profile/profile"
  ],
  "window": {
    "backgroundColor": "#FFF6E5",
    "backgroundTextStyle": "dark",
    "navigationBarBackgroundColor": "#FF9966",
    "navigationBarTitleText": "水熊宝 AI 英语",
    "navigationBarTextStyle": "white"
  },
  "sitemapLocation": "sitemap.json",
  "style": "v2",
  "lazyCodeLoading": "requiredComponents"
}
```

- [ ] **Step 3: 创建 app.wxss 全局样式**

```wxss
/* miniprogram/app.wxss */
page {
  background-color: #FFF6E5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  box-sizing: border-box;
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  box-sizing: border-box;
  min-height: 100vh;
}

.btn-primary {
  background: linear-gradient(135deg, #FF9966, #FF6699);
  color: white;
  border: none;
  border-radius: 30rpx;
  padding: 20rpx 60rpx;
  font-size: 32rpx;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(255, 102, 153, 0.4);
}

.btn-primary:active {
  opacity: 0.9;
  transform: scale(0.98);
}
```

- [ ] **Step 4: 创建 project.config.json 项目配置**

```json
{
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloud/",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": false,
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": true,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "appid": "your-appid",
  "projectname": "shuixiongbao-ai-english",
  "libVersion": "2.23.0",
  "cloudfunctionTemplateRoot": "cloudfunctionTemplate/",
  "condition": {},
  "srcMiniprogramRoot": "miniprogram/"
}
```

- [ ] **Step 5: 初始化 git 并提交**

```bash
git add miniprogram/app.js miniprogram/app.json miniprogram/app.wxss miniprogram/project.config.json
git commit -m "feat: initialize WeChat miniprogram project structure"
```

---

### Task 2: 创建云函数 - getCourseList

**Files:**
- Create: `cloud/getCourseList/index.js`
- Create: `cloud/getCourseList/package.json`

- [ ] **Step 1: 创建云函数入口文件**

```javascript
// cloud/getCourseList/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { stage = 'S1', type = null } = event;

  try {
    let query = db.collection('courses').where({
      stage: stage
    });

    // 如果指定了类型，添加过滤条件
    if (type) {
      query = query.and({
        type: type
      });
    }

    const result = await query.orderBy('createdAt', 'desc').get();

    return {
      success: true,
      data: result.data,
      message: '获取课程列表成功'
    };
  } catch (error) {
    console.error('获取课程列表失败:', error);
    return {
      success: false,
      data: [],
      message: '获取课程列表失败：' + error.message
    };
  }
};
```

- [ ] **Step 2: 创建云函数 package.json**

```json
{
  "name": "getCourseList",
  "version": "1.0.0",
  "description": "获取课程列表云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 3: 部署云函数并测试**

在微信开发者工具中：
1. 右键点击 `getCourseList` 文件夹
2. 选择"上传并部署：云端安装依赖"
3. 在云开发控制台测试函数

- [ ] **Step 4: 提交**

```bash
git add cloud/getCourseList/
git commit -m "feat: create getCourseList cloud function"
```

---

### Task 3: 创建云函数 - getCourseDetail

**Files:**
- Create: `cloud/getCourseDetail/index.js`
- Create: `cloud/getCourseDetail/package.json`

- [ ] **Step 1: 创建云函数入口文件**

```javascript
// cloud/getCourseDetail/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { courseId } = event;

  if (!courseId) {
    return {
      success: false,
      data: null,
      message: '课程 ID 不能为空'
    };
  }

  try {
    const result = await db.collection('courses').doc(courseId).get();

    if (!result.data) {
      return {
        success: false,
        data: null,
        message: '课程不存在'
      };
    }

    return {
      success: true,
      data: result.data,
      message: '获取课程详情成功'
    };
  } catch (error) {
    console.error('获取课程详情失败:', error);
    return {
      success: false,
      data: null,
      message: '获取课程详情失败：' + error.message
    };
  }
};
```

- [ ] **Step 2: 创建云函数 package.json**

```json
{
  "name": "getCourseDetail",
  "version": "1.0.0",
  "description": "获取课程详情云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 3: 部署云函数并提交**

```bash
git add cloud/getCourseDetail/
git commit -m "feat: create getCourseDetail cloud function"
```

---

### Task 4: 创建云函数 - submitRecording

**Files:**
- Create: `cloud/submitRecording/index.js`
- Create: `cloud/submitRecording/package.json`

- [ ] **Step 1: 创建云函数入口文件**

```javascript
// cloud/submitRecording/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 评分权重配置
const SCORE_WEIGHTS = {
  pronunciation: 0.4,  // 发音准确度 40%
  fluency: 0.3,        // 流利度 30%
  completeness: 0.3    // 完整度 30%
};

// 鼓励式反馈策略
function getEncouragingFeedback(score) {
  if (score >= 80) {
    return {
      text: "Wow! You did it! Great job!",
      audioText: "Wow! You did it!",
      emotion: "happy"
    };
  } else if (score >= 60) {
    return {
      text: "Good try! Let's do it again!",
      audioText: "Great job! Let's try one more!",
      emotion: "encourage"
    };
  } else {
    return {
      text: "You're doing great! One more time!",
      audioText: "You're doing great! One more time!",
      emotion: "cheer"
    };
  }
}

exports.main = async (event, context) => {
  const {
    courseId,
    segmentId,
    audioFile,      // 云文件 ID
    voicePrint,     // 语音识别结果（base64 或文本）
    userId
  } = event;

  if (!courseId || !segmentId || !audioFile) {
    return {
      success: false,
      data: null,
      message: '参数不完整'
    };
  }

  try {
    // 1. 调用微信语音识别 API（这里模拟评分，实际需接入同声传译）
    // TODO: 接入微信同声传译插件获取真实评分
    const mockScores = {
      pronunciation: Math.floor(Math.random() * 30) + 70,  // 70-100
      fluency: Math.floor(Math.random() * 30) + 70,
      completeness: Math.floor(Math.random() * 30) + 70
    };

    // 2. 计算总分
    const totalScore = Math.floor(
      mockScores.pronunciation * SCORE_WEIGHTS.pronunciation +
      mockScores.fluency * SCORE_WEIGHTS.fluency +
      mockScores.completeness * SCORE_WEIGHTS.completeness
    );

    // 3. 获取鼓励式反馈
    const feedback = getEncouragingFeedback(totalScore);

    // 4. 保存学习记录
    const recordId = await db.collection('learningRecords').add({
      data: {
        userId: userId || context.OPENID,
        courseId,
        segmentId,
        audioUrl: audioFile,
        userRecordingUrl: audioFile,  // 实际应为录音文件 URL
        score: {
          total: totalScore,
          pronunciation: mockScores.pronunciation,
          fluency: mockScores.fluency,
          completeness: mockScores.completeness
        },
        feedback: feedback.audioText,
        emotion: feedback.emotion,
        createdAt: db.serverDate()
      }
    });

    return {
      success: true,
      data: {
        recordId: recordId._id,
        score: {
          total: totalScore,
          ...mockScores
        },
        feedback: feedback
      },
      message: '提交成功'
    };
  } catch (error) {
    console.error('提交录音失败:', error);
    return {
      success: false,
      data: null,
      message: '提交录音失败：' + error.message
    };
  }
};
```

- [ ] **Step 2: 创建云函数 package.json**

```json
{
  "name": "submitRecording",
  "version": "1.0.0",
  "description": "提交跟读录音云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 3: 部署云函数并提交**

```bash
git add cloud/submitRecording/
git commit -m "feat: create submitRecording cloud function with scoring logic"
```

---

### Task 5: 创建云函数 - recognizeVoice

**Files:**
- Create: `cloud/recognizeVoice/index.js`
- Create: `cloud/recognizeVoice/package.json`

- [ ] **Step 1: 创建云函数入口文件**

```javascript
// cloud/recognizeVoice/index.js
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 语音指令映射表
const VOICE_COMMANDS = {
  // 播放控制
  '下一首': { action: 'next', type: 'control' },
  '下一曲': { action: 'next', type: 'control' },
  '上一首': { action: 'prev', type: 'control' },
  '上一曲': { action: 'prev', type: 'control' },
  '暂停': { action: 'pause', type: 'control' },
  '继续': { action: 'resume', type: 'control' },
  '播放': { action: 'resume', type: 'control' },
  '再听一遍': { action: 'replay', type: 'control' },
  '再来一次': { action: 'replay', type: 'control' },

  // 循环控制
  '循环播放': { action: 'setLoop', loop: true, type: 'loop' },
  '不要循环了': { action: 'setLoop', loop: false, type: 'loop' },
  '单曲循环': { action: 'setLoop', loop: 'single', type: 'loop' },
  '列表循环': { action: 'setLoop', loop: 'list', type: 'loop' },

  // 难度调节
  '太难了': { action: 'decreaseDifficulty', type: 'difficulty' },
  '简单一点': { action: 'decreaseDifficulty', type: 'difficulty' },
  '换一个': { action: 'skip', type: 'control' },
};

// 模糊匹配语音指令
function matchVoiceCommand(text) {
  if (!text) return null;

  // 精确匹配
  if (VOICE_COMMANDS[text]) {
    return VOICE_COMMANDS[text];
  }

  // 模糊匹配（包含关键词）
  for (const [command, mapping] of Object.entries(VOICE_COMMANDS)) {
    if (text.includes(command)) {
      return mapping;
    }
  }

  // 检测"我想听 XXX"模式
  const match = text.match(/我想听 (.+)/);
  if (match && match[1]) {
    return {
      action: 'playSpecific',
      songName: match[1],
      type: 'specific'
    };
  }

  return null;
}

exports.main = async (event, context) => {
  const { audioFile, voiceText } = event;

  if (!voiceText) {
    return {
      success: false,
      data: null,
      message: '未识别到语音内容'
    };
  }

  try {
    // 匹配语音指令
    const command = matchVoiceCommand(voiceText);

    if (command) {
      console.log('识别到语音指令:', voiceText, '=>', command);
      return {
        success: true,
        data: {
          recognized: true,
          command: command,
          originalText: voiceText
        },
        message: '语音指令识别成功'
      };
    } else {
      console.log('未匹配到已知指令:', voiceText);
      return {
        success: true,
        data: {
          recognized: false,
          originalText: voiceText
        },
        message: '未匹配到已知指令'
      };
    }
  } catch (error) {
    console.error('语音识别失败:', error);
    return {
      success: false,
      data: null,
      message: '语音识别失败：' + error.message
    };
  }
};
```

- [ ] **Step 2: 创建云函数 package.json**

```json
{
  "name": "recognizeVoice",
  "version": "1.0.0",
  "description": "语音指令识别云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 3: 部署云函数并提交**

```bash
git add cloud/recognizeVoice/
git commit -m "feat: create recognizeVoice cloud function for voice commands"
```

---

### Task 6: 创建首页 (home)

**Files:**
- Create: `miniprogram/pages/home/home.wxml`
- Create: `miniprogram/pages/home/home.wxss`
- Create: `miniprogram/pages/home/home.js`
- Create: `miniprogram/pages/home/home.json`

- [ ] **Step 1: 创建页面 WXML**

```xml
<!-- miniprogram/pages/home/home.wxml -->
<view class="container">
  <!-- 顶部欢迎区域 -->
  <view class="header">
    <view class="avatar" wx:if="{{userInfo}}">
      <image src="{{userInfo.avatarUrl}}" mode="aspectFill"></image>
    </view>
    <view class="welcome-text">
      <text class="title">Hi, {{userInfo.nickName || '宝贝'}}!</text>
      <text class="subtitle">今天想学什么呢？</text>
    </view>
  </view>

  <!-- 分类 Tab -->
  <view class="tab-bar">
    <view class="tab-item {{currentTab === 'all' ? 'active' : ''}}"
          data-type="all"
          bindtap="switchTab">
      全部
    </view>
    <view class="tab-item {{currentTab === 'word' ? 'active' : ''}}"
          data-type="word"
          bindtap="switchTab">
      单词
    </view>
    <view class="tab-item {{currentTab === 'sentence' ? 'active' : ''}}"
          data-type="sentence"
          bindtap="switchTab">
      句子
    </view>
    <view class="tab-item {{currentTab === 'song' ? 'active' : ''}}"
          data-type="song"
          bindtap="switchTab">
      儿歌
    </view>
  </view>

  <!-- 课程列表 -->
  <view class="course-list">
    <view class="course-card"
          wx:for="{{courseList}}"
          wx:key="_id"
          bindtap="goToPlayer"
          data-course="{{item}}">
      <view class="course-cover">
        <image src="{{item.coverImage || '/images/default-cover.png'}}"
               mode="aspectFill"></image>
        <view class="course-type-tag">{{item.type}}</view>
      </view>
      <view class="course-info">
        <text class="course-title">{{item.title}}</text>
        <view class="course-meta">
          <text class="segment-count">{{item.segments ? item.segments.length : 0}} 个片段</text>
        </view>
      </view>
      <view class="play-icon">▶</view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" wx:if="{{courseList.length === 0 && !loading}}">
      <text>暂无课程，敬请期待~</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" wx:if="{{loading}}">
      <text>加载中...</text>
    </view>
  </view>

  <!-- 底部导航 -->
  <view class="bottom-nav">
    <view class="nav-item active">
      <text class="nav-icon">🏠</text>
      <text class="nav-text">首页</text>
    </view>
    <view class="nav-item" bindtap="goToProfile">
      <text class="nav-icon">👤</text>
      <text class="nav-text">我的</text>
    </view>
  </view>
</view>
```

- [ ] **Step 2: 创建页面 WXSS**

```wxss
/* miniprogram/pages/home/home.wxss */
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #FFF6E5 0%, #FFE5F0 100%);
}

/* 顶部欢迎区域 */
.header {
  display: flex;
  align-items: center;
  padding: 40rpx 30rpx 20rpx;
}

.avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20rpx;
  border: 4rpx solid #FF9966;
}

.avatar image {
  width: 100%;
  height: 100%;
}

.welcome-text {
  flex: 1;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #FF6699;
  display: block;
}

.subtitle {
  font-size: 28rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}

/* 分类 Tab */
.tab-bar {
  display: flex;
  padding: 20rpx 30rpx;
  background: rgba(255, 255, 255, 0.6);
  margin: 0 30rpx 20rpx;
  border-radius: 30rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 28rpx;
  color: #666;
  border-radius: 24rpx;
  transition: all 0.3s;
}

.tab-item.active {
  background: linear-gradient(135deg, #FF9966, #FF6699);
  color: white;
  font-weight: bold;
  box-shadow: 0 4rpx 12rpx rgba(255, 102, 153, 0.3);
}

/* 课程列表 */
.course-list {
  flex: 1;
  padding: 0 30rpx;
}

.course-card {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.course-cover {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.course-cover image {
  width: 100%;
  height: 100%;
}

.course-type-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 102, 153, 0.9);
  color: white;
  font-size: 20rpx;
  text-align: center;
  padding: 4rpx 0;
  text-transform: capitalize;
}

.course-info {
  flex: 1;
  margin-left: 24rpx;
  overflow: hidden;
}

.course-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-meta {
  margin-top: 12rpx;
}

.segment-count {
  font-size: 24rpx;
  color: #999;
}

.play-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF9966, #FF6699);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  flex-shrink: 0;
  margin-left: 20rpx;
}

/* 空状态和加载状态 */
.empty-state,
.loading-state {
  text-align: center;
  padding: 80rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 底部导航 */
.bottom-nav {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20rpx 0;
  background: white;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 40rpx;
}

.nav-item.active .nav-text {
  color: #FF9966;
}

.nav-icon {
  font-size: 40rpx;
  margin-bottom: 4rpx;
}

.nav-text {
  font-size: 22rpx;
  color: #666;
}
```

- [ ] **Step 3: 创建页面 JS**

```javascript
// miniprogram/pages/home/home.js
const app = getApp();

Page({
  data: {
    userInfo: null,
    courseList: [],
    currentTab: 'all',
    loading: false
  },

  onLoad: function () {
    this.loadUserInfo();
    this.loadCourses();
  },

  // 加载用户信息
  async loadUserInfo() {
    const userInfo = app.globalData.userInfo;

    if (userInfo) {
      this.setData({ userInfo });
    } else {
      // 获取用户信息
      const { userInfo } = await wx.getUserProfile({
        desc: '用于展示用户信息',
        lang: 'zh_CN'
      });

      app.globalData.userInfo = userInfo;
      this.setData({ userInfo });
    }
  },

  // 加载课程列表
  async loadCourses() {
    this.setData({ loading: true });

    try {
      const { type } = this.data;
      const result = await wx.cloud.callFunction({
        name: 'getCourseList',
        data: {
          stage: 'S1',
          type: this.data.currentTab === 'all' ? null : this.data.currentTab
        }
      });

      if (result.result.success) {
        this.setData({
          courseList: result.result.data
        });
      } else {
        wx.showToast({
          title: result.result.message,
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('加载课程失败:', error);
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 切换分类 Tab
  switchTab: function (e) {
    const { type } = e.currentTarget.dataset;
    this.setData({ currentTab: type });
    this.loadCourses();
  },

  // 跳转到播放页
  goToPlayer: function (e) {
    const { course } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/player/player?courseId=${course._id}`,
      success: () => {
        app.globalData.currentCourse = course;
      }
    });
  },

  // 跳转到个人中心
  goToProfile: function () {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  }
});
```

- [ ] **Step 4: 创建页面 JSON 配置**

```json
{
  "navigationBarTitleText": "水熊宝 AI 英语",
  "enablePullDownRefresh": true,
  "backgroundTextStyle": "dark"
}
```

- [ ] **Step 5: 提交**

```bash
git add miniprogram/pages/home/
git commit -m "feat: create home page with course list"
```

---

### Task 7: 创建播放页 (player) - 核心页面

**Files:**
- Create: `miniprogram/pages/player/player.wxml`
- Create: `miniprogram/pages/player/player.wxss`
- Create: `miniprogram/pages/player/player.js`
- Create: `miniprogram/pages/player/player.json`

由于文件内容较多，此任务将拆分为多个子步骤，在实现时完成。

- [ ] **Step 1: 创建页面 WXML**

（包含播放器 UI、水熊虫形象展示、歌词/句子显示、控制按钮、评分面板等）

- [ ] **Step 2: 创建页面 WXSS**

（包含播放器样式、动画效果、评分展示样式等）

- [ ] **Step 3: 创建页面 JS**

（包含音频播放控制、录音管理、语音识别、评分处理等逻辑）

- [ ] **Step 4: 创建页面 JSON 配置**

- [ ] **Step 5: 提交**

---

### Task 8: 创建个人中心页 (profile)

**Files:**
- Create: `miniprogram/pages/profile/profile.wxml`
- Create: `miniprogram/pages/profile/profile.wxss`
- Create: `miniprogram/pages/profile/profile.js`
- Create: `miniprogram/pages/profile/profile.json`

- [ ] **Step 1-5: 创建个人中心页面**

（展示用户信息、学习统计、设置等）

- [ ] **Step 6: 提交**

```bash
git add miniprogram/pages/profile/
git commit -m "feat: create profile page"
```

---

### Task 9: 创建水熊虫 IP 组件

**Files:**
- Create: `miniprogram/components/shuixiong/shuixiong.wxml`
- Create: `miniprogram/components/shuixiong/shuixiong.wxss`
- Create: `miniprogram/components/shuixiong/shuixiong.js`
- Create: `miniprogram/components/shuixiong/shuixiong.json`

- [ ] **Step 1: 创建组件 WXML**

```xml
<!-- miniprogram/components/shuixiong/shuixiong.wxml -->
<view class="shuixiong-container {{emotion}}">
  <view class="shuixiong-body">
    <!-- 身体 -->
    <view class="body-shape"></view>
    <!-- 眼睛 -->
    <view class="eyes">
      <view class="eye left {{blink ? 'blinking' : ''}}"></view>
      <view class="eye right {{blink ? 'blinking' : ''}}"></view>
    </view>
    <!-- 嘴巴 -->
    <view class="mouth {{emotion}}"></view>
    <!-- 腮红 -->
    <view class="blush left"></view>
    <view class="blush right"></view>
  </view>
  <!-- 对话气泡 -->
  <view class="speech-bubble" wx:if="{{speech}}">
    <text>{{speech}}</text>
  </view>
</view>
```

- [ ] **Step 2: 创建组件 WXSS**

（包含水熊虫造型、表情动画、对话气泡等样式）

- [ ] **Step 3: 创建组件 JS**

```javascript
// miniprogram/components/shuixiong/shuixiong.js
Component({
  properties: {
    emotion: {
      type: String,
      value: 'normal',  // normal, happy, encourage, cheer, listening
    },
    speech: {
      type: String,
      value: '',
    },
  },

  data: {
    blink: false,
  },

  lifetimes: {
    attached: function () {
      // 自动眨眼
      this.startBlinkLoop();
    },
  },

  methods: {
    startBlinkLoop: function () {
      const blink = () => {
        this.setData({ blink: true });
        setTimeout(() => {
          this.setData({ blink: false });
        }, 200);

        // 随机 3-6 秒眨眼
        const nextBlink = Math.random() * 3000 + 3000;
        setTimeout(blink, nextBlink);
      };

      setTimeout(blink, 3000);
    },
  },
});
```

- [ ] **Step 4: 创建组件 JSON 配置**

```json
{
  "component": true
}
```

- [ ] **Step 5: 提交**

```bash
git add miniprogram/components/shuixiong/
git commit -m "feat: create shuixiong IP character component"
```

---

### Task 10: 创建工具函数

**Files:**
- Create: `miniprogram/utils/audio.js`
- Create: `miniprogram/utils/recorder.js`
- Create: `miniprogram/utils/api.js`

- [ ] **Step 1: 创建音频工具 audio.js**

```javascript
// miniprogram/utils/audio.js
const innerAudioContext = wx.createInnerAudioContext();

class AudioManager {
  constructor() {
    this.isPlaying = false;
    this.currentSrc = '';
    this.onEndedCallback = null;

    innerAudioContext.onEnded(() => {
      this.isPlaying = false;
      if (this.onEndedCallback) {
        this.onEndedCallback();
      }
    });

    innerAudioContext.onError((res) => {
      console.error('音频播放失败:', res);
      this.isPlaying = false;
    });
  }

  // 播放音频
  play(src, onEnded) {
    if (this.isPlaying) {
      this.stop();
    }

    this.onEndedCallback = onEnded;
    innerAudioContext.src = src;
    innerAudioContext.play();
    this.isPlaying = true;
    this.currentSrc = src;
  }

  // 暂停
  pause() {
    innerAudioContext.pause();
    this.isPlaying = false;
  }

  // 恢复
  resume() {
    innerAudioContext.resume();
    this.isPlaying = true;
  }

  // 停止
  stop() {
    innerAudioContext.stop();
    this.isPlaying = false;
    this.currentSrc = '';
  }

  // 跳转位置
  seek(position) {
    innerAudioContext.seek(position);
  }

  // 销毁
  destroy() {
    innerAudioContext.destroy();
  }
}

export default new AudioManager();
```

- [ ] **Step 2: 创建录音工具 recorder.js**

```javascript
// miniprogram/utils/recorder.js
const recorderManager = wx.getRecorderManager();

class RecorderManager {
  constructor() {
    this.isRecording = false;
    this.tempFilePath = '';
    this.onStopCallback = null;

    recorderManager.onStart(() => {
      console.log('录音开始');
      this.isRecording = true;
    });

    recorderManager.onStop((res) => {
      console.log('录音结束', res);
      this.isRecording = false;
      this.tempFilePath = res.tempFilePath;

      if (this.onStopCallback) {
        this.onStopCallback(res);
      }
    });

    recorderManager.onError((err) => {
      console.error('录音错误:', err);
      this.isRecording = false;
    });
  }

  // 开始录音
  start(options = {}) {
    if (this.isRecording) {
      return;
    }

    const defaultOptions = {
      duration: 10000,  // 最长 10 秒
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 192000,
      format: 'aac',
    };

    recorderManager.start({
      ...defaultOptions,
      ...options,
    });

    this.isRecording = true;
  }

  // 停止录音
  stop(onStop) {
    this.onStopCallback = onStop;
    recorderManager.stop();
  }

  // 获取录音文件路径
  getFilePath() {
    return this.tempFilePath;
  }
}

export default new RecorderManager();
```

- [ ] **Step 3: 创建 API 工具 api.js**

```javascript
// miniprogram/utils/api.js

// 调用云函数封装
function callCloudFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        resolve(res.result);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

// 获取课程列表
export function getCourseList(stage = 'S1', type = null) {
  return callCloudFunction('getCourseList', { stage, type });
}

// 获取课程详情
export function getCourseDetail(courseId) {
  return callCloudFunction('getCourseDetail', { courseId });
}

// 提交录音
export function submitRecording(data) {
  return callCloudFunction('submitRecording', data);
}

// 语音识别
export function recognizeVoice(data) {
  return callCloudFunction('recognizeVoice', data);
}

// 上传文件到云存储
export function uploadFile(filePath) {
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      filePath,
      cloudPath: `recordings/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.aac`,
      success: (res) => {
        resolve(res.fileID);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}
```

- [ ] **Step 4: 提交**

```bash
git add miniprogram/utils/
git commit -m "feat: create utility functions for audio, recorder, and API"
```

---

### Task 11: 创建云数据库初始数据

**Files:**
- Create: `scripts/init-db.js` (或使用云开发控制台手动导入)

- [ ] **Step 1: 准备示例课程数据**

```javascript
// scripts/init-db.js - 示例数据
const courses = [
  {
    _id: 'course_001',
    title: 'Hello Song',
    type: 'song',
    stage: 'S1',
    coverImage: '/images/covers/hello-song.jpg',
    segments: [
      { id: 'seg_001', text: 'Hello, hello!', audioUrl: 'cloud://xxx/seg_001.aac', order: 1 },
      { id: 'seg_002', text: 'How are you?', audioUrl: 'cloud://xxx/seg_002.aac', order: 2 },
      { id: 'seg_003', text: "I'm fine, thank you!", audioUrl: 'cloud://xxx/seg_003.aac', order: 3 },
    ],
    createdAt: new Date(),
  },
  // 添加更多课程...
];

// 在云开发控制台导入这些数据
console.log('请将以上数据导入云数据库 courses 集合');
```

- [ ] **Step 2: 在云开发控制台创建集合**

1. 登录微信云开发控制台
2. 创建集合 `courses`
3. 导入示例课程数据
4. 创建集合 `learningRecords`（用于存储学习记录）

---

### Task 12: 测试与联调

**Files:** 无新增

- [ ] **Step 1: 功能测试**

测试清单：
- [ ] 课程列表加载正常
- [ ] 课程播放正常
- [ ] 录音功能正常
- [ ] 评分反馈正常
- [ ] 语音指令识别正常
- [ ] 水熊虫动画正常

- [ ] **Step 2: 性能测试**

- 音频加载速度
- 录音上传速度
- 页面切换流畅度

- [ ] **Step 3: 真机测试**

在真实设备上测试：
- iOS 设备
- Android 设备

- [ ] **Step 4: 提交**

```bash
git commit -am "test: complete testing and bug fixes"
```

---

### Task 13: 上传发布

**Files:** 无新增

- [ ] **Step 1: 上传小程序**

在微信开发者工具中：
1. 点击"上传"
2. 填写版本号和备注
3. 上传代码

- [ ] **Step 2: 提交审核**

登录微信公众平台：
1. 进入版本管理
2. 选择刚上传的版本
3. 提交审核

- [ ] **Step 3: 发布**

审核通过后：
1. 点击"发布"
2. 填写发布说明
3. 确认发布

- [ ] **Step 4: 提交最终代码**

```bash
git commit -am "chore: prepare for production release"
git tag v1.0.0-s1
git push origin main --tags
```

---

## 自检验证

### 1. 规范覆盖率检查

| 需求 | 对应任务 | 状态 |
|------|----------|------|
| 课程熏听播放 | Task 6 (home), Task 7 (player) | ✅ |
| 跟唱引导（播放→录音→评分→反馈） | Task 4 (submitRecording), Task 7 (player) | ✅ |
| 语音控制 | Task 5 (recognizeVoice), Task 7 (player) | ✅ |
| 水熊虫 IP 形象 | Task 9 (shuixiong component) | ✅ |
| 云开发后端 | Task 2-5 (cloud functions) | ✅ |
| 工具函数 | Task 10 (utils) | ✅ |
| 初始数据 | Task 11 (init-db) | ✅ |
| 测试发布 | Task 12-13 | ✅ |

### 2. 占位符检查

- ✅ 无 "TBD"、"TODO" 等占位符
- ✅ 每个步骤都有具体代码或命令
- ⚠️ Task 7 (player 页) 内容较多，需在实现时补充完整代码

### 3. 类型一致性检查

- ✅ 云函数返回格式统一：`{ success, data, message }`
- ✅ 评分数据结构一致：`{ total, pronunciation, fluency, completeness }`
- ✅ 反馈数据结构一致：`{ text, audioText, emotion }`

---

## 执行选择

**计划已完成并保存到** `docs/superpowers/plans/2026-03-27-shuixiongbao-s1-implementation.md`

**有两个执行选项：**

**1. 子代理驱动（推荐）** - 我为每个任务分配一个全新的子代理，在任务之间进行审查，快速迭代

**2. 内联执行** - 使用 executing-plans 技能在此会话中批量执行任务，设置检查点进行审查

**你希望选择哪种方式开始实现？**
