# 水熊宝 AI 英语启蒙陪练小程序技术方案

## 1. 目标与范围

### 1.1 项目目标
本期目标是交付一个可上线验证的 S1 MVP，让家长在确认当前孩子后，孩子可一键进入连续陪练，系统可围绕 S1 内容动态出题，并在过程中通过语音引导方式与家长做轻量决策交互，练习结束后家长可查看该孩子的结果、趋势和建议。

### 1.2 本期范围
本期范围包括：
- 多孩子档案管理与默认孩子机制
- 儿童首页、练习页、结束页、家长结果页
- S1 内容池与动态出题能力
- 腾讯云 TTS/ASR 接入
- 语音引导式家长决策节点
- 切内容即切 session 的会话管理
- 结果聚合、趋势展示、建议生成
- 监控、告警与埋点
- 弱网与异常兜底

### 1.3 非本期范围
本期不包含：
- S2/S3 内容支持
- 复杂口语评测与考试式打分
- 离线缓存体系
- 复杂后台运营系统
- 多维度精细学习报告
- 晚安磨耳朵等扩展模式

### 1.4 设计原则
- 先确认孩子，再发起 session
- 前端只负责交互、媒体播放与事件上报
- 云端统一负责编排、聚合与规则判断
- 切内容时数据上新开 session，前端体验尽量无感
- 孩子侧不暴露技术错误，异常统一柔性承接
- 内容与规则优先配置化，不写死在代码中

## 2. 页面与交互设计

### 2.1 儿童首页
儿童首页只保留一个主 CTA：“开始今天陪练”。页面顶部弱透出当前孩子信息，例如“当前：小明”，并提供轻量切换入口。页面可轻提示今天将练习的内容类型，但不展示复杂信息。家长入口保持弱化，避免干扰儿童主路径。点击开始前，前端必须校验当前已选孩子；若无默认孩子，则先进入孩子档案管理流程。

### 2.2 练习页
练习页是核心主页面，承载启动音频播放、单词/短语练习、录音、语音引导、内容切换承接等完整流程。页面不因切模式、切内容、进入语音引导而跳页。页面顶部弱透出当前孩子与当前内容，主体区域展示当前 target 文本、角色引导、播放态与录音态。若命中家长引导规则，页面仍停留原位，只播放引导语音并等待家长反馈。

### 2.3 结束页
结束页用于展示一次练习后的轻量结果反馈，包括今天练习完成状态、听过内容数、尝试开口次数等，并提供“再来一次”“去家长页”“返回首页”等动作。若是切内容触发的旧 session 结束，则无需显式展示完整结束页，可在同页中轻过渡后直接进入新 session。

### 2.4 家长结果页
家长结果页用于展示某个孩子最近一次练习结果和近 7 日趋势。页面包含今日结果总卡、开口表现卡、最近进步卡、听过内容卡、水熊宝建议卡。页面顶部支持切换当前孩子，切换后刷新对应孩子的结果聚合数据。

### 2.5 孩子档案管理页
孩子档案管理页面向家长，支持新增孩子、查看孩子列表、设置默认孩子、切换当前孩子。页面设计保持轻量，不做复杂资料管理。若用户首次进入小程序或默认孩子失效，则将此页作为前置流程。

### 2.6 默认孩子与快速切换机制
系统记录家长上次使用的 `currentChildId`，下次打开小程序时自动命中该孩子，避免重复选择。首页、练习页、家长页都可弱透出当前孩子信息，并在需要时支持快速切换。若在练习中切换孩子，则需先结束当前 session，再以新的 `childId` 发起新 session。

### 2.7 切内容但前端无感的交互约束
当家长在练习中决定切换内容时，后端按“结束旧 session、创建新 session”处理，但前端仍停留在练习页。页面通过一段过渡语音或轻提示承接，不出现明显跳页、白屏或流程断裂感。

## 3. 系统架构与模块设计

### 3.1 总体架构
整体架构采用：
- 原生微信小程序前端
- 微信云函数作为业务编排层
- 腾讯云 TTS/ASR 作为语音能力层
- 云数据库 + 云存储 + 缓存作为数据层

### 3.2 前端模块
前端分为两部分：
- 页面层：儿童首页、练习页、结束页、家长页、孩子档案页
- 会话控制层：播放启动音频、触发录音、上传音频、调用接口、维护本地 UI 状态、承接引导语音

前端不承担内容编排、等级计算、趋势聚合等业务逻辑。

### 3.3 云函数模块
云端核心云函数包括：
- `initSession`：初始化 session，选择 content，返回启动音频
- `submitPracticeResult`：调用 ASR，写入练习事件
- `advanceSession`：动态出题、命中规则、推进流程
- `getParentSummary`：返回家长页结果聚合

### 3.4 腾讯云语音能力接入
- TTS：为单词/短语生成示范音频或引导语音
- ASR：识别孩子录音，输出“有回应/无回应/识别失败”和可选识别文本
- 不引入复杂口语评测与打分

### 3.5 缓存与存储分层
- 内容缓存：缓存 `content_map`、`content_target`、`guidance_rule`
- 会话热缓存：缓存当前 mode、剩余题池、最近练习项、练习计数
- 云数据库：存放孩子档案、内容配置、session、event、result
- 云存储：存放预置音频与可复用 TTS 音频

### 3.6 模块边界说明
- 前端负责“展示什么、何时播、何时录、何时上报”
- 云端负责“练什么、何时引导、是否切换、如何结束”
- 配置层负责“有哪些内容、哪些规则、何时触发”
- 外部语音层负责“把文本变音频、把音频变结果”

## 4. 数据模型与索引设计

### 4.1 child_profile
用于管理孩子档案与默认孩子选择。

建议字段：
- `childId`
- `parentOpenId`
- `nickname`
- `birthYear`
- `currentStage`
- `isCurrent`
- `status`
- `createdAt`
- `updatedAt`

建议索引：
- `(parentOpenId, status)`
- `(parentOpenId, isCurrent)`

### 4.2 content_map
用于存储内容头信息和启动音频。

建议字段：
- `contentId`
- `stage`
- `displayTitle`
- `startAudioUrl`
- `version`
- `defaultFlag`
- `status`
- `createdAt`
- `updatedAt`

建议索引：
- `(stage, status)`
- `(contentId)`

### 4.3 content_target
用于存储单词/短语素材池。

建议字段：
- `targetId`
- `contentId`
- `targetType`：`word` / `phrase`
- `text`
- `ttsText`
- `status`
- `createdAt`
- `updatedAt`

建议索引：
- `(contentId, targetType, status)`

### 4.4 guidance_rule
用于存储语音引导式决策规则，由系统管理员配置。

建议字段：
- `ruleId`
- `stage`
- `triggerType`
- `triggerThreshold`
- `contentScope`
- `modeScope`
- `guidanceTextTemplate`
- `suggestedAction`
- `status`
- `version`
- `createdAt`
- `updatedAt`

建议索引：
- `(stage, status)`
- `(contentScope, modeScope, status)`

### 4.5 session
用于存储一次陪练会话主信息。

建议字段：
- `sessionId`
- `childId`
- `contentId`
- `currentMode`
- `startedAt`
- `endedAt`
- `completed`
- `partialResultFlag`
- `createdAt`
- `updatedAt`

建议索引：
- `(childId, startedAt desc)`
- `(sessionId)`

### 4.6 session_event
用于存储练习过程和切换过程明细。

建议字段：
- `sessionId`
- `sequenceNo`
- `eventType`
- `targetId`
- `targetType`
- `responseType`
- `recognizedText`
- `modeBefore`
- `modeAfter`
- `audioFileId`
- `createdAt`

建议索引：
- `(sessionId, sequenceNo)`
- `(sessionId, createdAt)`

### 4.7 session_result
用于存储一次会话的结果汇总。

建议字段：
- `sessionId`
- `childId`
- `heardWordCount`
- `heardPhraseCount`
- `triedWordCount`
- `triedPhraseCount`
- `stableWordCount`
- `stablePhraseCount`
- `growthLevel`
- `growthLevelShortName`
- `growthLevelFullDesc`
- `recentTrendText`
- `suggestionTitle`
- `suggestionDesc`
- `endedAt`

建议索引：
- `(childId, endedAt desc)`

### 4.8 索引设计
索引核心目标包括：
- 快速按家长查询孩子列表与默认孩子
- 快速按孩子查询最近 session 与结果
- 快速按 session 顺序回放 event
- 快速按内容与目标类型回源素材池
- 快速按阶段和范围加载引导规则

### 4.9 关键取数逻辑
- 查默认孩子：按 `parentOpenId + isCurrent=1 + status=active`
- 初始化内容：按 `childId` 对应 `stage=S1` 获取候选内容池，排除最近重复项后随机选取
- 动态出题：优先读会话热缓存，缓存失效时回源 `content_target`
- 规则触发：从缓存中的 `guidance_rule` 按当前 mode、content、练习计数和时长进行匹配
- 家长页结果：优先读 `session_result`，必要时补充近 7 日趋势聚合

## 5. 接口与端到端时序

### 5.1 initSession
用于创建新的练习会话。

入参：
- `childId`
- `contentId`（可选，仅切内容时传）

返回：
- `sessionId`
- `contentId`
- `displayTitle`
- `startAudioUrl`
- `startAudioDurationMs`

规则：
- 首次发起时仅传 `childId`
- 后端按当前阶段内容池做随机选择
- 优先避免最近重复的 content
- 切内容时显式传新的 `contentId`

### 5.2 submitPracticeResult
用于处理一次跟读结果。

入参：
- `sessionId`
- `targetId`
- `audioFileId`

返回：
- `responseType`
- `recognizedText`
- `shouldEncourage`

触发时机：
- 孩子完成一次跟读并上传录音后立即触发

作用：
- 调用腾讯云 ASR
- 写入 `session_event`
- 返回本次识别摘要供编排器使用

### 5.3 advanceSession
用于推进整个练习流程。

入参：
- `sessionId`
- `eventType`

支持事件：
- `startPlaybackFinished`
- `practiceResultSubmitted`
- `guidanceAcceptedContinueWord`
- `guidanceAcceptedContinuePhrase`
- `guidanceAcceptedSwitchContent`
- `guidanceAcceptedEnd`
- `ttsFailed`
- `asrFailed`
- `sessionTimeout`

返回：
- `nextPhase`
- `currentMode`
- `targetId`
- `targetType`
- `targetText`
- `promptAudioUrl`
- `promptText`
- `guidanceRuleId`
- `guidanceText`
- `guidanceAudioUrl`
- `suggestedAction`
- `sessionCompleted`

说明：
- 当 `nextPhase=practice` 时，继续返回下一练习项
- 当 `nextPhase=parent_guidance` 时，返回引导语音内容
- 当 `nextPhase=end` 时，表示当前 session 结束

### 5.4 getParentSummary
用于获取家长结果页聚合数据。

入参：
- `childId`

返回：
- `growthLevel`
- `growthLevelShortName`
- `growthLevelFullDesc`
- `heard/tried/stable` 相关统计
- `recentTrendText`
- `suggestionTitle`
- `suggestionDesc`

### 5.5 首次随机内容选择策略
首次 `initSession` 不要求前端传 `contentId`。后端根据孩子当前阶段查出可用内容池，并结合最近若干次历史 session，优先排除最近使用过的内容，再从剩余池随机选择。若所有内容都已覆盖，则重置内容池再随机。

### 5.6 语音引导式家长决策
家长决策不是独立页面，而是由后端命中的策略节点。命中时 `advanceSession` 返回 `nextPhase=parent_guidance` 和引导话术，如“已经练了 10 个单词，要不要试试短语”。前端停留在练习页，只负责播报这段语音并等待家长反馈。

### 5.7 切内容即切 session 的时序
当家长决定切换内容时：
1. 当前 session 完成收尾
2. 后端生成必要的 full/partial result
3. 前端在原页面静默调用新的 `initSession(childId, newContentId)`
4. 新 session 返回启动音频后继续下一段练习

## 6. 异常兜底与测试设计

### 6.1 TTS 失败兜底
若 TTS 生成失败，优先回退到文本提示或已有缓存音频；若仍无法获得音频，则跳过示范，直接承接下一步练习，不给孩子暴露技术错误。

### 6.2 ASR 失败兜底
若 ASR 失败，则统一按“识别失败”或“未稳定识别”处理，不给负反馈。编排器可选择鼓励承接、继续下一题或命中引导规则。

### 6.3 缓存失效恢复
- 内容缓存失效：回源数据库重新加载
- 会话热缓存失效：通过 `session + session_event` 重建当前上下文

### 6.4 partial result 机制
当 session 因切内容、弱网中断、异常退出等原因未完整结束，但已有可统计结果时，允许生成 `partialResultFlag=true` 的部分结果，供家长页展示。

### 6.5 功能测试
覆盖：
- 默认孩子命中
- 首次随机内容初始化
- 单词/短语练习流程
- 语音引导触发与承接
- 切内容与结束流程

### 6.6 规则测试
覆盖：
- 素材池避免连续重复
- 内容池避免最近重复
- 引导规则命中逻辑
- 内容池耗尽后的重置逻辑

### 6.7 异常测试
覆盖：
- TTS 失败
- ASR 失败
- 缓存失效
- 弱网中断
- partial result 展示

### 6.8 多孩子测试
覆盖：
- 默认孩子记忆
- 快速切换孩子
- 不同孩子结果归属正确
- 多 session 隔离正常

## 7. 监控、告警与埋点设计

### 7.1 前端埋点
前端埋点覆盖关键页面曝光、主链路动作与失败场景。

建议埋点事件包括：
- 首页曝光
- 默认孩子命中
- 孩子切换
- 点击开始陪练
- 启动音频播放成功/失败
- 练习页曝光
- 录音开始/结束
- `submitPracticeResult` 发起
- ASR 结果返回
- 命中语音引导
- 家长接受继续单词
- 家长接受继续短语
- 家长接受切内容
- 家长接受结束
- 结束页曝光
- 家长页曝光

公共埋点字段建议包括：
- `parentOpenId`
- `childId`
- `sessionId`
- `contentId`
- `targetId`
- `eventTime`
- `resultCode`
- `networkType`

### 7.2 后端监控
后端监控依托云函数日志和腾讯云监控能力。

重点监控指标包括：
- `initSession` 调用量、失败率、平均耗时
- `submitPracticeResult` 调用量、失败率、平均耗时
- `advanceSession` 调用量、失败率、平均耗时
- `getParentSummary` 调用量、失败率、平均耗时
- 腾讯云 TTS 成功率与耗时
- 腾讯云 ASR 成功率与耗时
- 内容缓存命中率
- 会话热缓存命中率
- partial result 生成次数

### 7.3 腾讯云告警策略
告警建议统一配置在腾讯云监控侧。

建议告警项包括：
- `initSession` 失败率异常升高
- `advanceSession` 超时率升高
- `submitPracticeResult` 错误率升高
- TTS 连续失败
- ASR 连续失败
- 缓存命中率断崖下降
- partial result 突增
- 云函数整体错误数异常

告警方式可接入企业微信、短信或邮件。

### 7.4 关键指标看板
建议建立一版 MVP 看板，重点关注：
- 日活孩子数
- 开始陪练次数
- session 完成率
- 平均 session 时长
- 平均每次练习题数
- 家长语音引导触发次数
- 语音引导后继续率/结束率/切内容率
- ASR/TTS 成功率
- partial result 占比

## 8. 研发拆分与实施顺序

### 8.1 第一阶段：主链路
目标是先跑通“默认孩子 -> 开始陪练 -> 启动音频 -> 一次练习 -> 结束”的最小闭环。

范围包括：
- 孩子档案与默认孩子
- 儿童首页
- `initSession`
- 启动音频播放
- `submitPracticeResult`
- 最小版 `advanceSession`
- 结束页基础展示

### 8.2 第二阶段：动态练习闭环
目标是跑通完整的动态单词/短语练习流程。

范围包括：
- `content_map` / `content_target` 接入
- 动态素材池随机抽题
- 避免连续重复逻辑
- 腾讯云 TTS/ASR 接入
- 会话热缓存
- 练习页稳定承接

### 8.3 第三阶段：引导与聚合
目标是让家长引导与结果中心可用。

范围包括：
- `guidance_rule` 配置与加载
- 语音引导式家长决策
- 切模式与切内容链路
- `session_result` 聚合
- 家长页结果中心
- 最近趋势与建议模块

### 8.4 第四阶段：稳定性与提测
目标是形成可提测版本。

范围包括：
- 监控、埋点、告警
- 异常兜底完善
- 缓存失效恢复
- 多孩子场景验证
- 回归测试与问题修复

## 9. 风险与待确认项

### 9.1 技术风险
- 腾讯云 ASR 对儿童语音识别稳定性可能不足
- 腾讯云 TTS 实时生成可能带来额外时延
- 会话热缓存失效后重建逻辑复杂
- 切内容与切孩子时 session 边界易出错
- 云函数在高并发下的冷启动可能影响体验

### 9.2 交互风险
- 家长是否能及时理解语音引导并做出反馈
- 纯语音引导在噪声环境下是否足够稳定
- 切内容但前端无感的体验是否自然
- 当前孩子的弱透出是否足够明显
- 家长在练习中切换孩子是否会造成理解成本

### 9.3 待确认事项
- 家长对语音引导的反馈方式是否必须支持自然语言识别，还是可接受语音引导后配合轻量确认
- `guidance_rule` 的配置后台形态是内部工具、脚本导入还是轻量管理页
- S1 内容池首批内容规模与更新频率
- growthLevel 的最终规则口径
- 家长页建议文案是否完全规则化，还是允许人工运营配置
