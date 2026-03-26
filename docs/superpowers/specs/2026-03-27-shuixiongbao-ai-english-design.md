# 水熊宝 AI 英语启蒙 - 设计文档

**版本:** 1.0
**日期:** 2026-03-27
**阶段:** S1 儿童端 + 架构设计

---

## 一、产品概述

### 1.1 产品定位
水熊宝 AI 英语启蒙是一款面向 0-6 岁儿童的智能英语陪练系统，基于水熊妈咪 S1-S3 三阶系统课程，提供课后陪练、家长监控、课程配置的完整解决方案。

### 1.2 核心价值
- **儿童端**：温柔有趣的 AI 陪练，减轻开口压力，建立英语语感
- **家长端**：实时监控学习进度，了解孩子表现，调整学习策略
- **开发者端**：灵活配置课程内容、策略规则、素材库

### 1.3 产品架构
```
┌─────────────────────────────────────────────────────────┐
│                     水熊宝产品生态                        │
├─────────────────┬───────────────────┬───────────────────┤
│   儿童聊天工具   │   家长管理平台     │   配置管理平台      │
│   (Chat App)    │  (Parent Portal)  │  (Admin Console)  │
└─────────────────┴───────────────────┴───────────────────┘
```

---

## 二、技术架构

### 2.1 整体架构图
```
┌─────────────────────────────────────────────────────────────┐
│                      水熊宝产品生态                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐           ┌─────────────────────────┐  │
│  │   微信小程序     │           │    Web 管理后台          │  │
│  │   (儿童端)      │           │   (家长 + 配置平台)     │  │
│  │                 │           │                         │  │
│  │  - 水熊虫 IP 引导 │           │   - 学习进度监控        │  │
│  │  - 语音跟读      │           │   - 课程内容管理        │  │
│  │  - AI 评分反馈   │           │   - 素材库管理          │  │
│  │  - 语音控制播放  │           │   - 数据统计报表        │  │
│  └────────┬────────┘           └───────────┬─────────────┘  │
│           │                                 │                 │
│           ▼                                 ▼                 │
│  ┌─────────────────┐           ┌─────────────────────────┐   │
│  │  微信云开发      │           │   独立后端 API           │   │
│  │                 │           │                         │   │
│  │  - 云函数       │◄─────────►│   Node.js (NestJS)      │   │
│  │  - 云数据库     │  数据同步  │   - MySQL               │   │
│  │  - 云存储       │           │   - 用户管理            │   │
│  │  - 微信语音 API │           │   - 内容管理            │   │
│  └─────────────────┘           │   - 数据分析            │   │
│                                │   - 规则引擎            │   │
│                                └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈选型

| 模块 | 技术选型 | 说明 |
|------|----------|------|
| **小程序端** | 原生微信小程序 | 性能最好，微信 API 原生支持 |
| **小程序后端** | 微信云开发 | 云函数 + 云数据库 + 云存储，免运维 |
| **Web 管理后台** | Vue3 + Element Plus | 快速开发，生态成熟 |
| **管理后台后端** | Node.js (NestJS) | TypeScript，模块化，易扩展 |
| **小程序数据库** | 云数据库 (JSON 文档型) | 与云开发无缝集成 |
| **管理端数据库** | MySQL 8.0 | 关系型，复杂查询支持好 |
| **语音识别** | 微信同声传译 | 预留讯飞切换接口 |
| **对象存储** | 云存储 / COS | 音频文件存储 |
| **IP 形象** | 水熊虫卡通角色 | 品牌统一 |

### 2.3 架构决策说明

**采用混合架构（方案 B）的原因：**
1. 小程序端用云开发，快速上线，原生集成微信能力
2. 管理后台用独立后端，支持复杂业务和数据分析
3. 两端通过数据同步机制打通，平衡速度与扩展性

---

## 三、S1 阶段功能设计

### 3.1 范围说明
**本阶段聚焦：** 儿童端小程序核心功能
**暂不开发：** 家长平台、配置平台（预留接口）

### 3.2 核心功能模块

#### 模块一：课程熏听播放
| 功能 | 描述 |
|------|------|
| 播放控制 | 播放、暂停、继续 |
| 循环模式 | 单曲循环、列表循环、不循环 |
| 曲目选择 | 下一首、上一首、指定曲目 |
| 播放模式 | 熏听模式（后台播放）、跟读模式（互动） |

#### 模块二：跟唱引导
```
流程：
1. 播放原声音频
2. 等待孩子跟读（自动检测 silence）
3. 录音上传 + 语音识别
4. 多维度评分（发音、流利度、完整度）
5. 鼓励式语音反馈（"Great job!"）
6. 进入下一句或重复
```

**评分维度：**
- 发音准确度（40% 权重）
- 流利度（30% 权重）
- 完整度（30% 权重）

**鼓励策略：**
- 分数≥80：热情表扬 + 继续
- 分数 60-79：肯定 + 小建议
- 分数<60：鼓励 + 再试一次

#### 模块三：语音控制
| 指令类别 | 语音命令 |
|----------|----------|
| 播放控制 | "下一首"、"上一首"、"暂停"、"继续"、"再听一遍" |
| 指定曲目 | "我想听 XXX"（歌名/课程名） |
| 循环控制 | "循环播放"、"不要循环了"、"单曲循环" |
| 难度调节 | "太难了"、"简单一点"、"换一个" |

**语音识别方案：** 微信同声传译 API

#### 模块四：水熊虫 IP 形象
- 可爱的水熊虫卡通角色
- 表情动画配合反馈（开心、鼓励、加油）
- 语音播报时嘴型同步（可选）

### 3.3 内容类型
| 类型 | 描述 | 示例 |
|------|------|------|
| 单词跟读 | 单个单词发音 + 跟读 | "Apple" /æpəl/ |
| 单句跟读 | 短句发音 + 跟读 | "Hello, how are you?" |
| 儿歌/童谣 | 整首儿歌，分段跟唱 | "Twinkle Twinkle Little Star" |

**播放模式：** 不限片段数量，基于用户上传的音频素材

---

## 四、数据模型设计

### 4.1 小程序端（云数据库）

```javascript
// 用户表
{
  _id: "openid_xxx",
  nickname: String,
  avatar: String,
  createdAt: Date,
  lastLoginAt: Date
}

// 学习记录表
{
  _id: "record_xxx",
  userId: "openid_xxx",
  courseId: "course_xxx",
  lessonId: "lesson_xxx",
  segmentId: "segment_xxx",
  audioUrl: String,  // 原音
  userRecordingUrl: String,  // 跟读录音
  score: {
    total: Number,
    pronunciation: Number,
    fluency: Number,
    completeness: Number
  },
  feedback: String,  // AI 语音反馈文本
  createdAt: Date
}

// 课程表
{
  _id: "course_xxx",
  title: String,
  type: "word" | "sentence" | "song",
  stage: "S1" | "S2" | "S3",
  segments: [{
    id: "segment_xxx",
    text: String,
    audioUrl: String,
    order: Number
  }],
  coverImage: String,
  createdAt: Date
}
```

### 4.2 管理端（MySQL）

```sql
-- 用户表
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  openid VARCHAR(64) UNIQUE,
  nickname VARCHAR(100),
  avatar VARCHAR(255),
  role ENUM('admin', 'parent') DEFAULT 'parent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 课程表
CREATE TABLE courses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  type ENUM('word', 'sentence', 'song'),
  stage ENUM('S1', 'S2', 'S3'),
  status ENUM('draft', 'published', 'archived'),
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 课程片段表
CREATE TABLE course_segments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT,
  text TEXT,
  audio_url VARCHAR(512),
  audio_duration INT,  -- 秒
  order_index INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 学习记录表（同步自云数据库）
CREATE TABLE learning_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT,
  course_id BIGINT,
  segment_id BIGINT,
  total_score INT,
  pronunciation_score INT,
  fluency_score INT,
  completeness_score INT,
  recorded_at TIMESTAMP,
  synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 五、接口设计

### 5.1 小程序云函数

```javascript
// 获取课程列表
wx.cloud.callFunction({
  name: 'getCourseList',
  data: { stage: 'S1', type: 'song' }
})

// 获取课程详情
wx.cloud.callFunction({
  name: 'getCourseDetail',
  data: { courseId: 'xxx' }
})

// 提交跟读录音
wx.cloud.callFunction({
  name: 'submitRecording',
  data: {
    courseId: 'xxx',
    segmentId: 'xxx',
    audioFile: cloudID,
    voicePrint: base64
  }
})

// 语音指令识别
wx.cloud.callFunction({
  name: 'recognizeVoiceCommand',
  data: { audioFile: cloudID }
})
```

### 5.2 管理后台 API

```
GET    /api/courses          - 课程列表
POST   /api/courses          - 创建课程
PUT    /api/courses/:id      - 更新课程
DELETE /api/courses/:id      - 删除课程
POST   /api/courses/:id/segments - 添加片段

GET    /api/users            - 用户列表
GET    /api/users/:id/stats  - 用户学习统计

GET    /api/stats/overview   - 整体数据统计
GET    /api/stats/trends     - 趋势分析
```

---

## 六、数据同步机制

### 6.1 同步策略
- **实时同步：** 用户注册、学习记录完成时
- **定时同步：** 每 5 分钟批量同步增量数据
- **手动同步：** 管理后台触发全量同步

### 6.2 同步流程
```
云数据库 (学习记录)
       │
       ▼
云函数 (定时触发器)
       │
       ▼
消息队列 (缓冲)
       │
       ▼
管理端 API (批量写入 MySQL)
```

---

## 七、错误处理

### 7.1 语音识别失败
- 重试机制：最多 3 次
- 降级策略：识别失败时给鼓励反馈，不显示分数
- 日志记录：记录失败原因，便于分析

### 7.2 网络异常
- 离线缓存：录音文件本地缓存，网络恢复后上传
- 友好提示：用孩子能理解的语言提示

### 7.3 音频播放失败
- 自动重试
- 切换备选 CDN
- 提示家长检查网络

---

## 八、测试策略

### 8.1 单元测试
- 云函数逻辑测试
- 评分算法测试
- 语音指令识别测试

### 8.2 集成测试
- 播放→录音→评分完整流程
- 数据同步流程

### 8.3 用户测试
- 邀请 5-10 个目标年龄段儿童试用
- 收集开口率、完成率、满意度数据

---

## 九、部署计划

### 9.1 开发环境
- 微信开发者工具
- 云开发模拟器
- 本地 MySQL

### 9.2 测试环境
- 云开发测试环境
- 体验版小程序

### 9.3 生产环境
- 云发生产环境
- 正式发布版小程序

---

## 十、后续迭代规划

### S2 阶段（后续）
- 家长管理平台上线
- 学习报告推送
- 多孩子账号管理

### S3 阶段（后续）
- 配置管理平台上线
- 可视化课程编排
- 规则引擎配置

---

## 附录

### A. 语音指令完整列表
| 指令 | 意图 | 响应 |
|------|------|------|
| 下一首 | 切换曲目 | 播放下一首 |
| 上一首 | 切换曲目 | 播放上一首 |
| 暂停 | 暂停播放 | 暂停，等待指令 |
| 继续 | 继续播放 | 从暂停处继续 |
| 再听一遍 | 重播 | 重新播放当前曲目 |
| 我想听 XXX | 指定曲目 | 搜索并播放 |
| 循环播放 | 开启循环 | 设置循环模式 |
| 太难了 | 难度反馈 | 切换到简单级别 |

### B. 鼓励用语示例
- "Wow! You did it!" (80+ 分)
- "Great job! Let's try one more!" (60-79 分)
- "You're doing great! One more time!" (<60 分)

---

**文档状态：** 已批准
**下一步：** 调用 `writing-plans` 技能，制定实现计划
