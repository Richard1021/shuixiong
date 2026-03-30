水熊宝 AI 英语启蒙产品设计方案
一、产品概述
1.1 产品定位
水熊宝 AI 英语启蒙是一款面向 3-8 岁儿童的智能英语陪练系统，基于水熊妈咪 S1-S3 三阶系统课程，提供课后陪练、家长监控、课程配置的完整解决方案。
1.2 核心价值
- 儿童端：温柔有趣的 AI 陪练，减轻开口压力，建立英语语感
- 家长端：实时监控学习进度，了解孩子表现，调整学习策略
- 管理员端：灵活配置课程内容、策略规则、素材库
1.3 产品架构
全部在微信小程序内实现，按角色划分独立页面入口，通过权限控制隔离。

┌─────────────────────────────────────────────────────────┐
│                   水熊宝微信小程序                        │
├─────────────────┬───────────────────┬───────────────────┤
│   儿童学习模块   │   家长管理模块     │   管理员配置模块    │
│  pages/home     │  pages/parent     │  pages/admin      │
│  pages/player   │  pages/parent/*   │  pages/admin/*    │
│  pages/profile  │                   │                   │
├─────────────────┴───────────────────┴───────────────────┤
│                  权限控制层                               │
│  儿童：默认身份，无需登录                                  │
│  家长：微信登录 + 设置家长密码后解锁                        │
│  管理员：独立管理员密码，仅产品运营人员持有                  │
└─────────────────────────────────────────────────────────┘

技术栈
- 前端：微信小程序原生（WXML/WXSS/JS）
- 后端：微信云开发（云函数 + 云数据库 + 云存储）
- 音频存储：微信云存储（小程序端直传）
- 数据库：微信云数据库（NoSQL）

1.4 角色与权限
| 角色 | 入口 | 验证方式 | 可访问页面 |
|------|------|---------|-----------|
| 儿童 | 直接进入 | 无需验证 | home、player、profile |
| 家长 | profile 页切换 | 家长密码 | parent/* |
| 管理员 | 特定入口 | 管理员密码 | admin/* |

---
二、儿童聊天工具（Chat App）
2.1 产品定位
专为 0-6岁儿童设计的英语熏听及口语练习应用，以课程内容为核心，提供音频熏听、跟读练习、趣味互动功能。
2.2 核心功能模块
2.2.1 课程阶段系统
功能描述
- 支持 S1、S2、S3 三阶段课程切换
- 仅家长可通过指定口令切换阶段
- 儿童无权修改阶段设置
交互设计
儿童界面：
┌──────────────────────────┐
│  🐻 水熊宝陪你练英语～    │
│                          │
│  [当前: S1 阶段]          │
│  [🔒 需要家长切换]        │
└──────────────────────────┘

家长口令切换：
家长输入："切换到 S2 阶段，口令：bear2024"
系统响应："好的～已经切换到 S2 阶段啦！"
技术实现要点
- 阶段锁定机制：Session 级别的阶段标识
- 权限验证：区分儿童/家长身份（基于口令验证）
- 跨阶段内容隔离：严格校验当前阶段，禁止跨阶段调取
2.2.2 S1 阶段功能设计
功能 1：课程熏听播放
核心定位：磨耳朵，建立英语语感，无开口压力
触发指令
- "播放《XX》童谣/绘本"
- "我要听 S1 动物/数字/颜色主题的童谣"
执行流程
Mermaid
话术设计
- 匹配成功："好呀宝贝，我们一起来听好听的儿歌磨耳朵吧～"
- 匹配失败："这首儿歌水熊宝要跟着水熊妈咪的课程一起学哦，我们先听这首好听的吧～"
- 异常处理："哎呀,音频有点小问题，我们换一首好听的儿歌吧～"
素材库结构
{"stage": "S1","themes": ["animals", "numbers", "colors", "daily_items"],"materials": [{"id": "s1_animal_001","name": "Little Bear","type": "nursery_rhyme","theme": "animals","audio_url": "https://cdn.example.com/s1/audio/little_bear.mp3","duration": 120,"key_phrases": [{"text": "Little bear", "words": 2},{"text": "Brown and sweet", "words": 3}]}]}
功能 2：跟唱引导
触发条件：音频播放结束后自动触发（可关闭）
执行逻辑
1. 截取核心短句（1-2 句，≤4 个单词）
2. 慢速清晰唱 2 遍
3. 输出温柔引导语，等待孩子回应
4. 孩子开口 → 立刻鼓励
5. 孩子不开口 → 重复示范，输出无压力引导
交互示例
[音频播放结束]
水熊宝：🎵 "Little bear, little bear~" 🎵
       🎵 "Little bear, little bear~" 🎵
       宝贝也来跟水熊宝一起唱吧～

[孩子开口]
水熊宝：哇～宝贝唱得真棒！继续加油哦～

[孩子沉默]
水熊宝：🎵 "Little bear~" 🎵
       没关系呀，宝贝可以先听，慢慢来～
2.2.3 对话管理策略
语气规范
- 可爱、温柔、童趣、有耐心
- 纯鼓励式表达，不批评、不否定
- 每轮对话≤3 句话
- 以英语为主，极少量中文引导
内容边界
- 优先调取课程内置素材（100%）
- 家长未触发"拓展"指令，不使用课程外内容
- 无关问题兜底："水熊宝只陪宝贝练课程里的英语哦～我们一起跟着水熊妈咪的课程说英语吧！"
难度控制
- 严格匹配当前阶段难度
- 绝对不超纲、不越级
- S1: 简单单词、短句（≤4 词）
- S2: 简单对话、场景句型（待定义）
- S3: 故事复述、情景互动（待定义）
2.3 界面设计要点
2.3.1 主界面布局
┌─────────────────────────────────┐
│  ← [返回]      🐻 水熊宝      ⚙️  │
├─────────────────────────────────┤
│                                 │
│  [对话气泡区域]                  │
│  ┌─────────────────────┐        │
│  │ 宝贝，我们一起听儿歌吧～ │     │
│  └─────────────────────┘        │
│                                 │
│         ┌─────────────┐         │
│         │ 播放小熊歌   │         │
│         └─────────────┘         │
│                                 │
│  🎵 [正在播放: Little Bear]     │
│  ━━━━━━━━━━○━━━ 1:23 / 2:00    │
│                                 │
├─────────────────────────────────┤
│  🎤 [长按说话]    📚 [课程库]    │
└─────────────────────────────────┘
2.3.2 快捷功能区
- 课程库：S1 主题分类浏览（动物、数字、颜色等）
- 今日学习：展示今日已练习内容
- 鼓励徽章：完成里程碑获得徽章奖励
2.4 技术架构
2.4.1 技术栈
- 框架：微信小程序原生（WXML/WXSS/JS）
- 后端：微信云开发云函数
- 音频播放：wx.createInnerAudioContext()
- 语音录制：wx.getRecorderManager()
- 语音识别：微信云函数调用第三方 ASR（如讯飞/腾讯云）
2.4.2 核心模块
阶段管理：globalData 存储当前阶段，密码验证后写入云数据库持久化
素材匹配：云函数按 stage/theme 查询 audioMaterials 集合
对话引擎：云函数调用大语言模型 API（GPT-4 / Claude），Prompt 存储于 appConfig 集合

---
三、家长管理平台（Parent Portal）
3.1 产品定位
为家长提供孩子学习监控、进度追踪、设置管理的 Web/App 平台。
3.2 核心功能模块
3.2.1 学习概览仪表板
数据展示
┌────────────────────────────────────────┐
│  📊 本周学习概览                        │
├────────────────────────────────────────┤
│  🎯 学习天数: 5/7 天                    ││  ⏱️  累计时长: 2 小时 35 分钟           ││  🎵 完成童谣: 12 首                     ││  🗣️  开口次数: 47 次                    │
│                                        │
│  📈 [本周趋势图]                        │
│     ▂▅▇▆▃▅▄                            │
│     一二三四五六日                       │
└────────────────────────────────────────┘
关键指标
- 学习频率：每日/周学习天数
- 时长统计：有效学习时长（区分熏听/互动）
- 内容完成度：已学童谣/绘本数量/已掌握的词汇统计
- 开口率：主动开口跟读次数
3.2.2 学习记录详情
对话回放
- 时间轴展示孩子与水熊宝的对话记录
- 音频回放：听取孩子的发音录音
- AI 评价：显示 AI 对孩子表现的鼓励话术
示例界面
┌────────────────────────────────────────┐
│  📅 2026-03-09 下午 3:25               │
├────────────────────────────────────────┤
│  [水熊宝] 我们一起听儿歌磨耳朵吧～      │
│  [小明]   播放小熊歌                    │
│  [水熊宝] 好呀宝贝～ [播放音频]         │
│                                        │
│  [跟唱环节]                             │
│  🎤 [录音] 孩子发音: "Little bear"      │
│  📊 流畅度: ★★★★☆                       │
│  💬 AI 鼓励: "哇～宝贝唱得真棒！"        │
└────────────────────────────────────────┘
3.2.3 阶段切换与设置
阶段切换入口
当前阶段: S1 (熏听磨耳朵)
[切换到 S2] [切换到 S3]

⚠️ 切换提示:
建议孩子完成 S1 全部 30 节课后再切换
当前进度: 12/30 (40%)

[确认切换] [暂不切换]
功能开关
- 跟唱引导：自动/手动/关闭
- 拓展内容：允许/禁止课程外素材
- 难度调整：严格/适中/宽松
3.2.4 学习报告
周报/月报自动生成
# 小明的英语学习周报（3.3-3.9）## 🎉 本周亮点- 学习坚持度: 连续 5 天学习，真棒！
- 开口进步: 本周开口 47 次，比上周提升 30%
- 新学内容: 掌握 8 首新童谣

## 📊 数据对比- 学习时长: 2h 35min（上周: 1h 50min）↑
- 完成童谣: 12 首（上周: 9 首）↑

## 💡 家长建议- 小明对"动物"主题兴趣浓厚，可多练习相关内容
- 建议每日固定时间学习，养成习惯

## 🎯 下周目标- 完成 S1 第 15-20 节课
- 尝试主动开口次数达到 60 次
3.3 技术架构
3.3.1 技术栈
- 框架：微信小程序原生（WXML/WXSS/JS）
- 后端：微信云开发云函数
- 数据库：微信云数据库
- 入口：profile 页底部「家长模式」按钮，输入家长密码后解锁
3.3.2 数据模型
// 学习记录interface LearningRecord {
  id: string;
  childId: string;
  sessionId: string;
  timestamp: Date;
  stage: 'S1' | 'S2' | 'S3';
  activity: 'listen' | 'sing_along' | 'chat';
  materialId: string;
  duration: number; // 秒interaction: {
    childInput?: string;
    childAudio?: string;
    aiResponse: string;
    encouragementGiven: boolean;
  };
}

// 学习统计interface LearningStats {
  childId: string;
  period: 'day' | 'week' | 'month';
  startDate: Date;
  endDate: Date;
  metrics: {
    totalDays: number;
    totalDuration: number;
    completedMaterials: number;
    speakingCount: number;
    averageDailyTime: number;
  };
}

---
四、配置管理平台（Admin Console）
4.1 产品定位
为课程开发者、内容运营人员提供课程配置、策略管理、素材上传的后台系统。
4.2 核心功能模块
4.2.1 课程内容管理
阶段配置
┌────────────────────────────────────────┐
│  📚 课程阶段管理                        │
├────────────────────────────────────────┤
│  S1 阶段配置                            │
│  ├─ 核心定位: 熏听磨耳朵，建立语感       │
│  ├─ 难度设定: 简单单词，≤4 词短句       │
│  ├─ 主题词库: [动物] [数字] [颜色]...  │
│  └─ 总课时数: 30 节                     │
│                                        │
│  [编辑] [添加主题] [课时管理]           │
└────────────────────────────────────────┘
素材库管理
- 音频素材：上传童谣/绘本音频，配置元数据
  - 名称、所属阶段、主题标签
  - 时长、关键短句标注
  - 难度等级（自动/手动标注）
- 话术模板：配置 AI 引导语、鼓励话术
{"type": "encouragement","stage": "S1","scenarios": [{"trigger": "child_speaks", "response": "哇～宝贝唱得真棒！"},{"trigger": "child_silent", "response": "没关系呀，宝贝可以先听～"}]}
- 关键短句库：为每首童谣标注核心短句
{"materialId": "s1_animal_001","keyPhrases": [{"text": "Little bear", "timing": "0:15", "difficulty": 1},{"text": "Brown and sweet", "timing": "0:30", "difficulty": 2}]}
4.2.2 策略规则配置
权限控制策略
# 阶段切换权限stage_switch:allowed_roles: [parent]
  password_required: truechild_access: deny# 拓展内容策略extension_content:trigger_keyword: "拓展"required_role: parentfallback_when_disabled: use_course_material_only
对话策略配置
# 对话长度控制conversation:max_sentences_per_turn: 3tone: [cute, gentle, patient, encouraging]
  language_mix:primary: englishsecondary: chinesechinese_usage: minimal_guidance# 难度适配difficulty:S1:max_words_per_phrase: 4complexity: simple_wordsS2:max_words_per_phrase: 8complexity: simple_sentencesS3:max_words_per_phrase: 15complexity: story_telling
兜底规则配置
{"fallback_rules": [{"condition": "material_not_found","action": "play_default_material","response": "这首儿歌水熊宝要跟着水熊妈咪的课程一起学哦～"},{"condition": "off_topic_question","action": "redirect_to_course","response": "水熊宝只陪宝贝练课程里的英语哦～"},{"condition": "audio_load_error","action": "switch_to_next","response": "哎呀，音频有点小问题，我们换一首吧～"}]}
4.2.3 数据监控与分析
素材使用统计
┌────────────────────────────────────────┐
│  📊 素材热度排行（本周）                 │
├────────────────────────────────────────┤
│  1. Little Bear (S1-动物)    2,345 次  │
│  2. Number Song (S1-数字)    1,876 次  │
│  3. Rainbow Colors (S1-颜色) 1,652 次  │
│  ...                                   │
│                                        │
│  🔍 低使用素材预警:                     │
│  - "Big Elephant" 使用率 < 5%          │
│    建议: 检查素材质量或推荐策略          │
└────────────────────────────────────────┘
策略效果分析
- 跟唱引导开启率 vs 孩子开口率
- 不同难度配置下的完成度
- 兜底规则触发频率分析
4.3 界面设计要点
4.3.1 素材上传流程
1. [选择阶段] S1 / S2 / S3
2. [上传音频] 拖拽文件 / 选择文件
3. [填写信息]
   - 素材名称: _____________
   - 主题标签: [动物] [数字] [颜色]
   - 时长: 自动识别 (2:00)
4. [标注短句]
   - 添加关键短句: "Little bear"
   - 时间点: 0:15
   - 难度: ★☆☆☆☆
5. [预览测试] 播放音频，检查短句标注
6. [提交发布]
4.3.2 策略配置界面
┌────────────────────────────────────────┐
│  ⚙️ 对话策略配置                        │
├────────────────────────────────────────┤
│  语气规范                               │
│  ☑ 可爱  ☑ 温柔  ☑ 童趣  ☑ 鼓励式      │
│                                        │
│  对话长度限制                           │
│  每轮最多 [3] 句话                      │
│                                        │
│  语言混合比例                           │
│  英语: ████████░░ 80%                  │
│  中文: ██░░░░░░░░ 20%                  │
│                                        │
│  难度控制                               │
│  S1: 最多 [4] 个单词                   │
│  S2: 最多 [8] 个单词                   │
│  S3: 最多 [15] 个单词                  │
│                                        │
│  [保存配置] [重置为默认]                │
└────────────────────────────────────────┘
4.4 技术架构
4.4.1 技术栈
- 框架：微信小程序原生（WXML/WXSS/JS）
- 后端：微信云开发云函数
- 文件存储：微信云存储（小程序端直传，支持批量上传 mp3）
- 数据库：微信云数据库（audioMaterials、courses 等集合）
- 入口：独立页面 pages/admin，需输入管理员密码，家长和儿童不可访问
4.4.2 云数据库集合设计
- courses：课程列表（stage、theme、title、segments）
- audioMaterials：音频素材（fileName、stage、theme、fileID、audioUrl）
- learningRecords：学习记录
- appConfig：策略配置、兜底规则等全局配置

---
五、数据模型设计
5.1 核心实体
5.1.1 用户体系
// 儿童账户interface Child {
  id: string;
  name: string;
  age: number;
  parentId: string;
  currentStage: 'S1' | 'S2' | 'S3';
  preferences: {
    favoriteThemes: string[];
    learningTime: string; // "morning" | "afternoon" | "evening"
  };
  createdAt: Date;
}

// 家长账户interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[]; // Child IDssubscription: {
    plan: 'basic' | 'premium';
    expiresAt: Date;
  };
}
5.1.2 课程体系
// 课程阶段interface CourseStage {
  id: string;
  code: 'S1' | 'S2' | 'S3';
  name: string;
  description: string;
  positioning: string; // "熏听磨耳朵"difficulty: {
    maxWordsPerPhrase: number;
    complexity: string;
  };
  themes: string[];
  totalLessons: number;
}

// 素材interface Material {
  id: string;
  stageId: string;
  name: string;
  type: 'nursery_rhyme' | 'picture_book' | 'story';
  theme: string;
  audioUrl: string;
  duration: number;
  keyPhrases: KeyPhrase[];
  metadata: {
    difficulty: number; // 1-5ageRange: [number, number];
    tags: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// 关键短句interface KeyPhrase {
  text: string;
  timing: string; // "0:15"wordCount: number;
  difficulty: number; // 1-5
}
5.1.3 会话记录
// 对话会话interface ChatSession {
  id: string;
  childId: string;
  stage: string;
  startTime: Date;
  endTime?: Date;
  messages: ChatMessage[];
  summary: {
    totalMessages: number;
    childSpeakCount: number;
    materialsPlayed: string[];
    duration: number;
  };
}

// 对话消息interface ChatMessage {
  id: string;
  sessionId: string;
  sender: 'child' | 'ai';
  content: string;
  audioUrl?: string; // 孩子的录音metadata: {
    intent?: string; // "request_material" | "sing_along"materialTriggered?: string;
    encouragementGiven?: boolean;
  };
  timestamp: Date;
}
5.2 策略配置实体
// 对话策略interface ConversationPolicy {
  id: string;
  stage: string;
  rules: {
    maxSentencesPerTurn: number;
    tone: string[];
    languageMix: {
      primary: string;
      secondary: string;
      secondaryUsage: string;
    };
  };
  updatedAt: Date;
}

// 兜底规则interface FallbackRule {
  id: string;
  condition: string; // "material_not_found"action: string; // "play_default_material"response: string;
  priority: number;
  enabled: boolean;
}

---
六、技术实现要点
6.1 AI 对话引擎
6.1.1 核心能力
- 意图识别：识别播放请求、阶段切换、拓展请求等意图
- 素材匹配：基于名称/主题查询云数据库 audioMaterials 集合
- 响应生成：遵循语气规范、长度限制的自然语言生成
- 语音识别：儿童语音识别（处理发音不标准、含糊等）
6.1.2 技术选型
- 大语言模型：GPT-4 / Claude（通过云函数调用，API Key 存储于云函数环境变量）
- 语音录制：wx.getRecorderManager()（微信小程序原生）
- 语音识别：云函数调用讯飞/腾讯云 ASR（儿童语音优化）
- 语音合成：云函数调用 TTS 生成音频，上传云存储后返回 fileID 播放
6.2 素材管理系统
6.2.1 存储架构
云存储目录结构
└─ audio/
   ├─ S1/
   │  ├─ animals/   ← mp3 文件
   │  ├─ numbers/
   │  ├─ colors/
   │  └─ daily_items/
   ├─ S2/
   └─ S3/

云数据库集合
├─ courses          ← 课程列表与 segments
├─ audioMaterials   ← 素材元数据 + fileID
├─ learningRecords  ← 学习记录
└─ appConfig        ← 策略配置、兜底规则
6.2.2 音频访问策略
- 小程序端通过 wx.cloud.getTempFileURL() 将 fileID 转为临时 HTTPS URL
- 临时 URL 有效期 2 小时，播放前动态获取
- 上传通过 admin 页面 wx.cloud.uploadFile() 直传云存储
6.3 权限与安全
6.3.1 身份验证
- 儿童：无需登录，默认进入，globalData.role = 'child'
- 家长：profile 页输入家长密码（存储于云数据库 appConfig），验证通过后 globalData.role = 'parent'，跳转 pages/parent
- 管理员：独立密码（硬编码于云函数或 appConfig），验证通过后 globalData.role = 'admin'，跳转 pages/admin
- 所有敏感云函数在服务端二次校验 role，防止绕过前端直接调用
6.3.2 数据隐私
- 儿童录音上传云存储，仅家长可查看
- 不采集儿童个人身份信息，用微信 openId 匿名标识

---
七、产品路线图
7.1 MVP 阶段（1-2 个月）
核心功能
- ✅ S1 阶段课程配置
- ✅ 基础聊天工具（音频播放、跟唱引导）
- ✅ 家长管理平台（学习记录查看、阶段切换）
- ✅ 配置平台（素材上传、策略配置基础功能）
技术实现
- 微信小程序（儿童端 + 家长端 + 管理员端，统一小程序访问，按角色权限隔离）
- 微信云开发（云函数 + 云数据库 + 云存储，无需独立部署后端）
7.2 V1.0 阶段（3-4 个月）
功能扩展
- ✅ S2、S3 阶段完整支持
- ✅ 拓展内容功能
- ✅ 学习报告自动生成
- ✅ 数据分析仪表板
- ✅ 素材热度分析
优化方向
- AI 对话自然度提升
- 语音识别准确率优化（儿童语音）
- 素材推荐算法
7.3 V2.0 阶段（5-6 个月）
高级功能
- 🎯 自适应学习路径（根据孩子表现调整难度）
- 🎯 家长-孩子互动功能（亲子共学模式）
- 🎯 社区分享（优秀学习记录分享）
- 🎯 多语言支持（除英语外，拓展其他语言）
技术升级
- 边缘计算（降低延迟）
- 离线模式支持
- AI 模型微调（基于儿童语料）

---
八、成功指标
8.1 业务指标
用户增长
- 注册用户数：目标 10,000 家庭（6 个月内）
- DAU（日活跃用户）：≥30% 注册用户
- 留存率：次日留存 ≥60%，7 日留存 ≥40%
学习效果
- 平均每周学习天数：≥4 天
- 平均单次学习时长：15-20 分钟
- 儿童开口率：≥60%（跟唱环节）
8.2 产品指标
功能使用
- 熏听播放完成率：≥70%
- 跟唱参与率：≥50%
- 拓展内容使用率：≥20%（家长主动触发）
体验指标
- 音频加载成功率：≥99%
- 对话响应延迟：≤2 秒
- 儿童语音识别准确率：≥80%
8.3 技术指标
- 系统可用性：≥99.9%（依赖微信云开发 SLA）
- 云函数响应时间：P95 ≤500ms（含冷启动）
- 音频加载成功率：≥99%（云存储临时 URL）
- 语音识别准确率（儿童）：≥75%

---
九、风险与挑战
9.1 技术风险
儿童语音识别难度
风险描述：儿童发音不标准、含糊，识别准确率低 缓解措施：
- 使用专门的儿童语音识别模型
- 降低识别阈值，采用鼓励式反馈（不纠错）
- 持续收集语料优化模型
AI 对话稳定性
风险描述：大语言模型可能生成不符合规范的内容 缓解措施：
- Prompt Engineering 严格定义规则
- 设置内容过滤层（敏感词、长度检查）
- 人工审核高频对话模板
9.2 业务风险
课程内容依赖
风险描述：产品强依赖水熊妈咪课程，课程更新滞后影响体验 缓解措施：
- 建立课程内容提前审核机制
- 开发拓展内容库作为补充
- 与课程团队建立紧密协作流程
家长参与度
风险描述：家长不主动监控，导致平台价值未体现 缓解措施：
- 周报/月报自动推送（微信/邮件）
- 关键里程碑提醒（如"孩子已连续学习 7 天"）
- 家长社区建设，促进交流分享
9.3 合规风险
儿童数据保护
风险描述：违反 COPPA、儿童隐私保护法规 缓解措施：
- 法务团队审核隐私政策
- 家长明确授权数据收集
- 数据最小化收集原则

---
十、附录
10.1 参考资料
- 飞书原型文档：https://my.feishu.cn/wiki/X4IxwWFjxiy2l5kqxCKc8D3Cncg
- COPPA 儿童隐私保护法：https://www.ftc.gov/coppa
- 微信小程序官方文档：https://developers.weixin.qq.com/miniprogram/dev/framework/
- 微信云开发文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html
- 微信云存储文档：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/storage/
10.2 术语表
- S1/S2/S3：课程的三个阶段，分别对应不同难度
- 熏听：通过大量听力输入建立语感的学习方式
- 跟唱引导：AI 引导孩子跟读童谣中的关键短句
- 兜底规则：当系统无法正常处理请求时的备用方案
- 云开发：微信云开发（Tencent CloudBase），无需独立部署服务器的 Serverless 后端
10.3 联系方式
- 产品负责人：[待补充]
- 技术负责人：[待补充]
- 项目启动时间：2026-03-09

---
十一、待办增强事项（Backlog）

11.1 AI 对话引擎接入方案（调研结论）

> 调研时间：2026-03-12，更新：2026-03-30
> 结论：当前技术栈为微信小程序，扣子 Chat SDK（Web JS SDK）不适用于小程序环境。推荐方案 C（云函数中转 Bot API）。

#### 小程序环境限制说明
微信小程序不支持 npm 包中依赖 DOM/BOM 的 Web SDK（如 `@coze/chat-sdk`），且不支持直接调用第三方 HTTPS API（需在小程序后台配置合法域名）。因此所有 AI 调用必须通过**微信云函数**作为中转层。

---

#### 方案 A：直接发布到豆包渠道（验证期可用）

**适用场景**：快速验证产品思路，面向豆包 App 用户群体推广（与小程序并行，不替代）

**优点**：零代码，10 分钟上线，借助豆包 App 流量

**缺点**：界面不可定制，无法注入自有素材库，无法与小程序数据打通

---

#### 方案 B：扣子 Chat SDK（不适用小程序）

**结论**：`@coze/chat-sdk` 是 Web JS SDK，依赖浏览器 DOM，**无法在微信小程序中使用**，跳过。

---

#### 方案 C：云函数中转 Bot API（⭐ 推荐，适用小程序）

**原理**：小程序调用云函数，云函数内部调用扣子 Bot API 或 OpenAI/Claude API，结果返回小程序端渲染。

```javascript
// 云函数 aiChat/index.js
const axios = require('axios');
exports.main = async (event) => {
  const { message, userId, stage } = event;
  const res = await axios.post('https://api.coze.cn/v3/chat', {
    bot_id: process.env.BOT_ID,
    user_id: userId,
    additional_messages: [{ role: 'user', content: message, content_type: 'text' }],
    stream: false,
  }, { headers: { Authorization: `Bearer ${process.env.COZE_TOKEN}` } });
  return { reply: res.data.messages?.[0]?.content };
};
```

**优点**：保留小程序自定义界面，AI 能力完全可控，API Key 安全存储于云函数环境变量

**缺点**：需要维护云函数，扣子 Bot 的 Prompt 需单独配置

---

#### 方案 D：直接调用 OpenAI/Claude API（最直接）

**原理**：云函数直接调用 OpenAI 或 Claude API，不依赖扣子平台，Prompt 完全自主管理。

**推荐**：MVP 阶段优先使用此方案，Prompt 存储于云数据库 appConfig 集合，管理员可在 admin 页面动态修改。

---

#### 综合推荐

| 阶段 | 方案 | 说明 |
|---|---|---|
| MVP 验证 | 方案 D（直接调用 LLM API） | 云函数调用 Claude/GPT，Prompt 存云数据库 |
| 产品验证 | 方案 A（豆包渠道）+ 方案 D | 豆包渠道引流，小程序提供完整体验 |
| 规模化 | 方案 C（扣子 Bot API）或继续 D | 视运营需求决定是否迁移到扣子 |

11.2 通用多租户 SaaS 平台
- 目标：将现有单机版改造为多租户架构，支持不同培训机构作为独立租户开通使用
- 核心需求：
  - 租户数据完全隔离（独立素材库、独立学员数据、独立配置策略）
  - 品牌定制：支持租户自定义 Logo、主色调、欢迎语、AI 角色名称
  - 租户管理后台：新建租户、分配配额、查看用量
  - 计费 / 配额管理：按学员数、存储用量、API 调用量计费
- 技术改造要点：
  - 数据库所有核心表增加 `tenant_id` 字段，查询全面加租户过滤
  - 存储目录按租户隔离：`/storage/{tenant_id}/S1/...`
  - 认证中心统一管理：JWT payload 携带 `tenant_id`
  - 超级管理员平台（Super Admin Console）：跨租户管理入口
