# 水熊宝 AI 英语启蒙 🧸

> 面向 0-6 岁儿童的智能英语陪练微信小程序

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![WeChat Mini Program](https://img.shields.io/badge/平台-微信小程序-green.svg)](https://developers.weixin.qq.com/miniprogram/dev/framework/)

## 产品简介

水熊宝 AI 英语启蒙是一款基于微信云开发的儿童英语跟读学习小程序。通过可爱的水熊虫 IP 形象陪伴，采用 AI 语音评分技术，让孩子在轻松愉快的氛围中建立英语语感。

## 核心功能

### 🎯 S1 阶段（已实现）

- **课程熏听播放** - 支持单词、句子、儿歌多种类型
- **智能跟读评分** - 发音、流利度、完整度三维度评测
- **语音控制** - "下一首"、"再听一遍"等语音指令
- **水熊虫 IP 互动** - 表情反馈 + 语音鼓励

### 📋 后续规划

- **S2 阶段** - 家长管理平台（学习报告、多账号管理）
- **S3 阶段** - 配置管理平台（可视化课程编排）

## 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                      微信小程序                          │
│                   (儿童端 - 本仓库)                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    微信云开发                            │
│   云函数 │ 云数据库 │ 云存储 │ 语音识别 API               │
└─────────────────────────────────────────────────────────┘
```

### 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | 原生微信小程序 (WXML/WXSS/JavaScript) |
| 后端 | 微信云开发 (云函数 + 云数据库 + 云存储) |
| 语音 | 微信同声传译 API (预留讯飞切换) |
| IP | 水熊虫卡通形象 (CSS 绘制) |

## 项目结构

```
shuixiong/
├── miniprogram/                 # 小程序前端
│   ├── app.js                   # 小程序入口
│   ├── app.json                 # 小程序配置
│   ├── app.wxss                 # 全局样式
│   ├── project.config.json      # 项目配置
│   ├── pages/                   # 页面
│   │   ├── home/                # 首页（课程列表）
│   │   ├── player/              # 播放页（跟读学习）
│   │   └── profile/             # 个人中心
│   ├── components/              # 组件
│   │   └── shuixiong/           # 水熊虫 IP 组件
│   └── utils/                   # 工具函数
│       ├── audio.js             # 音频播放管理
│       ├── recorder.js          # 录音管理
│       └── api.js               # API 调用封装
├── cloud/                       # 云函数
│   ├── getCourseList/           # 获取课程列表
│   ├── getCourseDetail/         # 获取课程详情
│   ├── submitRecording/         # 提交跟读录音
│   └── recognizeVoice/          # 语音指令识别
└── docs/                        # 文档
    ├── superpowers/
    │   ├── specs/               # 设计文档
    │   ├── plans/               # 实现计划
    │   └── TODO-later.md        # 后续工作清单
```

## 快速开始

### 前置要求

- 微信开发者工具 (最新版)
- 微信小程序账号
- 微信云开发环境

### 安装步骤

1. **克隆项目**
```bash
git clone git@github.com:Richard1021/shuixiong.git
cd shuixiong
```

2. **配置小程序**
   - 在 `miniprogram/project.config.json` 中替换 `appid`
   - 在 `miniprogram/app.js` 中替换云开发环境 ID `env`

3. **导入项目**
   - 打开微信开发者工具
   - 导入 `miniprogram/` 目录

4. **开通云开发**
   - 在开发者工具中点击"云开发"
   - 创建云开发环境
   - 记录环境 ID

5. **部署云函数**
```bash
# 在微信开发者工具中
# 右键每个云函数文件夹 → 上传并部署：云端安装依赖
- cloud/getCourseList
- cloud/getCourseDetail
- cloud/submitRecording
- cloud/recognizeVoice
```

6. **初始化数据库**
   - 在云开发控制台创建集合 `courses` 和 `learningRecords`
   - 导入示例数据（参考 `docs/superpowers/TODO-later.md`）

7. **上传音频素材**
   - 在云存储中创建 `audio/courses/` 文件夹
   - 上传课程音频文件
   - 更新数据库中的 `audioUrl` 字段

### 开发调试

```bash
# 在微信开发者工具中
1. 编译项目
2. 真机预览（扫码）
3. 调试云函数
```

## 云函数说明

| 函数名 | 功能 | 输入参数 | 返回格式 |
|--------|------|----------|----------|
| `getCourseList` | 获取课程列表 | `{stage, type}` | `{success, data, message}` |
| `getCourseDetail` | 获取课程详情 | `{courseId}` | `{success, data, message}` |
| `submitRecording` | 提交录音评分 | `{courseId, segmentId, audioFile}` | `{success, data: {score, feedback}}` |
| `recognizeVoice` | 语音指令识别 | `{voiceText}` | `{success, data: {command}}` |

## 数据库模型

### courses (课程表)

```javascript
{
  _id: String,
  title: String,           // 课程标题
  type: String,            // word/sentence/song
  stage: String,           // S1/S2/S3
  coverImage: String,      // 封面图 URL
  segments: Array,         // 课程片段
  createdAt: Date
}
```

### learningRecords (学习记录)

```javascript
{
  _id: String,
  userId: String,          // 用户 openid
  courseId: String,
  segmentId: String,
  userRecordingUrl: String,
  score: {
    total: Number,
    pronunciation: Number,
    fluency: Number,
    completeness: Number
  },
  feedback: String,
  emotion: String,
  createdAt: Date
}
```

## 功能演示

### 首页
- 课程分类筛选（全部/单词/句子/儿歌）
- 课程卡片展示
- 底部导航切换

### 播放页
- 水熊虫 IP 表情互动
- 句子/歌词显示
- 播放/录音控制
- 评分结果展示

### 个人中心
- 用户信息展示
- 学习统计（天数/次数/星星）
- 设置入口

## 后续工作

详细清单请查看：[docs/superpowers/TODO-later.md](docs/superpowers/TODO-later.md)

### 待办事项

- [ ] 配置小程序 AppID 和云开发环境 ID
- [ ] 创建数据库集合并导入示例数据
- [ ] 上传音频素材到云存储
- [ ] 真机测试（iOS + Android）
- [ ] 提交审核发布

## 设计文档

- [产品设计方案](docs/superpowers/specs/2026-03-27-shuixiongbao-ai-english-design.md)
- [S1 实现计划](docs/superpowers/plans/2026-03-27-shuixiongbao-s1-implementation.md)

## 开发团队

- 开发：Richard
- AI 协助：Claude Code

## License

MIT © 2026 水熊宝团队

---

**水熊宝 - 让每个孩子爱上英语！** 🌟
