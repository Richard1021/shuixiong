# 水熊宝小程序（shuixiongv2）

水熊宝是一款面向低龄儿童的英语启蒙陪练微信小程序。

当前版本聚焦一个最小可运行闭环：
- 孩子档案管理
- 首页默认孩子读取
- 练习页绘本化展示
- 启动音频播放
- 跟读录音提交
- 云函数推进练习流程

## 项目结构

```text
shuixiongv2/
├── miniprogram/                # 小程序前端
│   ├── pages/
│   │   ├── home/              # 首页
│   │   ├── child-profile/     # 孩子档案页
│   │   └── practice/          # 练习页
│   ├── app.js
│   └── app.json
├── cloud/                     # 云函数
│   ├── initSession/           # 初始化练习 session
│   ├── getChildProfiles/      # 获取孩子列表
│   ├── saveChildProfile/      # 保存/切换孩子
│   ├── submitPracticeResult/  # 提交跟读结果
│   ├── advanceSession/        # 推进练习状态
│   └── shared/                # 云端共享逻辑
└── package.json               # 本地测试脚本
```

## 当前页面

- `pages/home/home`
  - 展示当前孩子
  - 进入练习流程
- `pages/child-profile/child-profile`
  - 新增孩子
  - 切换当前孩子
- `pages/practice/practice`
  - 绘本化练习页
  - 启动音频播放
  - 跟读录音与提交

## 云函数

当前已包含：
- `initSession`
- `getChildProfiles`
- `saveChildProfile`
- `submitPracticeResult`
- `advanceSession`

## 本地开发

### 1. 安装测试依赖

```bash
npm install
```

### 2. 运行测试

```bash
npm test
```

## 微信开发者工具配置

项目根配置：
- `project.config.json`
- `miniprogram/project.config.json`

已配置：
- `miniprogramRoot: miniprogram/`
- `cloudfunctionRoot: cloud/`

开发时请确认：
1. 使用微信开发者工具导入项目根目录
2. 绑定正确的小程序 AppID
3. 开启云开发并选择可用环境
4. 云函数完成“上传并部署”

## 云开发数据库建议集合

联调时至少准备以下集合：
- `child_profile`
- `session`
- `session_event`
- `session_result`
- `content_map`
- `content_target`

## 内容素材字段建议

### `content_map`
最小字段：
- `contentId`
- `stage`
- `displayTitle`
- `startAudioUrl`
- `startAudioDurationMs`
- `status`

可选字段：
- `coverImageUrl`：绘本封面图，未提供时前端自动回退到插画封面

### `content_target`
最小字段：
- `targetId`
- `contentId`
- `targetType`
- `text`
- `ttsText`
- `status`

## 当前交互说明

### 首页默认孩子
首页会优先读取本地缓存的 `currentChild`。
如果本地没有，但云端孩子列表里存在 `isCurrent = 1` 的孩子，会自动回写并展示。

### 练习页音频
当前为了联调提速，启动音频临时采用：
- 只播放前 5 秒
- 再播放最后 5 秒

后续需要恢复完整播放，相关 TODO 已记录在：
- `docs/superpowers/TODO-later.md`

## 测试现状

当前项目已接入 Jest。
已有测试覆盖主要集中在：
- 练习页状态逻辑
- 云函数推进逻辑
- TTS / ASR 适配逻辑

## 注意事项

- 点开头的本地工具目录已通过 `.gitignore` 忽略
- 云存储文件如使用 `cloud://`，需要先转换成可访问链接再用于前端播放
- 若联调中出现数据库集合不存在错误，请先在云开发控制台补齐集合
