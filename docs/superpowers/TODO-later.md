# 水熊宝 AI 英语启蒙 - 后续工作清单

**创建日期:** 2026-03-27
**阶段:** S1 开发完成，待部署上线

---

## 一、配置类工作

### 1.1 微信小程序配置
- [ ] 注册微信小程序账号（如未注册）
- [ ] 获取小程序 AppID
- [ ] 在微信公众平台配置开发设置
- [ ] 配置服务器域名（云开发无需配置）

### 1.2 云开发环境配置
- [ ] 开通微信云开发服务
- [ ] 创建云开发环境（选择基础版或按量付费）
- [ ] 获取云开发环境 ID (`env-id`)
- [ ] 在代码中替换配置：
  - `miniprogram/app.js` 第 8 行：`env: 'your-env-id'`
  - `miniprogram/project.config.json` 第 39 行：`appid: 'your-appid'`

---

## 二、数据库初始化

### 2.1 创建数据库集合
在**云开发控制台** → **数据库**中创建以下集合：

#### 集合 1: `courses` (课程表)
| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | String | 自动生成的唯一 ID |
| `title` | String | 课程标题 |
| `type` | String | 课程类型：word/sentence/song |
| `stage` | String | 阶段：S1/S2/S3 |
| `coverImage` | String | 封面图 URL |
| `segments` | Array | 课程片段数组 |
| `createdAt` | Date | 创建时间 |

**segments 数组结构:**
```javascript
{
  id: "seg_001",
  text: "Hello, hello!",
  audioUrl: "cloud://xxx/seg_001.aac",
  order: 1
}
```

#### 集合 2: `learningRecords` (学习记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| `_id` | String | 自动生成的唯一 ID |
| `userId` | String | 用户 openid |
| `courseId` | String | 课程 ID |
| `segmentId` | String | 片段 ID |
| `audioUrl` | String | 原音文件 URL |
| `userRecordingUrl` | String | 用户录音 URL |
| `score` | Object | 评分详情 |
| `feedback` | String | AI 反馈文本 |
| `emotion` | String | 表情状态 |
| `createdAt` | Date | 创建时间 |

### 2.2 导入示例数据
在**云开发控制台** → **数据库** → `courses` 集合中导入以下示例数据：

```javascript
[
  {
    "_id": "course_001",
    "title": "Hello Song",
    "type": "song",
    "stage": "S1",
    "coverImage": "/images/covers/hello-song.png",
    "segments": [
      {
        "id": "seg_001",
        "text": "Hello, hello!",
        "audioUrl": "cloud://YOUR-ENV-ID.78696869-xxxx-xxxx-xxxx-xxxx.1234567890-seg_001.aac",
        "order": 1
      },
      {
        "id": "seg_002",
        "text": "How are you?",
        "audioUrl": "cloud://YOUR-ENV-ID.78696869-xxxx-xxxx-xxxx-xxxx.1234567890-seg_002.aac",
        "order": 2
      },
      {
        "id": "seg_003",
        "text": "I'm fine, thank you!",
        "audioUrl": "cloud://YOUR-ENV-ID.78696869-xxxx-xxxx-xxxx-xxxx.1234567890-seg_003.aac",
        "order": 3
      }
    ],
    "createdAt": {
      "$date": "2026-03-27T00:00:00.000Z"
    }
  },
  {
    "_id": "course_002",
    "title": "Apple",
    "type": "word",
    "stage": "S1",
    "coverImage": "/images/covers/apple.png",
    "segments": [
      {
        "id": "seg_004",
        "text": "Apple",
        "audioUrl": "cloud://YOUR-ENV-ID.78696869-xxxx-xxxx-xxxx-xxxx.1234567890-seg_004.aac",
        "order": 1
      },
      {
        "id": "seg_005",
        "text": "Banana",
        "audioUrl": "cloud://YOUR-ENV-ID.78696869-xxxx-xxxx-xxxx-xxxx.1234567890-seg_005.aac",
        "order": 2
      }
    ],
    "createdAt": {
      "$date": "2026-03-27T00:00:00.000Z"
    }
  }
]
```

---

## 三、音频素材准备

### 3.1 录制音频
- [ ] 准备课程音频文件（MP3 或 AAC 格式）
- [ ] 确保音频清晰、语速适中
- [ ] 建议由专业英语老师录制

### 3.2 上传音频到云存储
在**云开发控制台** → **云存储**中：
- [ ] 创建文件夹 `audio/courses/`
- [ ] 上传所有音频文件
- [ ] 记录每个文件的 `fileID`（格式：`cloud://xxx.aac`）
- [ ] 更新数据库中 `segments.audioUrl` 字段

---

## 四、图片素材准备

### 4.1 准备图片
- [ ] 课程封面图（建议尺寸：300x300px）
- [ ] 默认封面图（`/images/default-cover.png`）
- [ ] 水熊虫 IP 图片（如需要替换 CSS 绘制）

### 4.2 上传图片到云存储
- [ ] 创建文件夹 `images/covers/`
- [ ] 上传所有图片
- [ ] 更新数据库中 `coverImage` 字段

---

## 五、本地测试

### 5.1 微信开发者工具测试
- [ ] 下载并安装微信开发者工具
- [ ] 导入项目（`miniprogram/` 目录）
- [ ] 配置 AppID
- [ ] 开启云开发
- [ ] 测试以下功能：

| 功能 | 测试项 | 状态 |
|------|--------|------|
| 首页 | 课程列表加载 | [ ] |
| 首页 | 分类 Tab 切换 | [ ] |
| 首页 | 底部导航切换 | [ ] |
| 播放页 | 音频播放 | [ ] |
| 播放页 | 录音功能 | [ ] |
| 播放页 | 评分展示 | [ ] |
| 播放页 | 水熊虫表情互动 | [ ] |
| 播放页 | 上一句/下一句 | [ ] |
| 个人中心 | 用户信息展示 | [ ] |
| 个人中心 | 学习统计 | [ ] |

### 5.2 真机测试
- [ ] iOS 设备测试（iPhone + 微信）
- [ ] Android 设备测试（主流品牌）
- [ ] 测试录音权限授权
- [ ] 测试音频播放兼容性

---

## 六、云函数部署

### 6.1 上传云函数
在**微信开发者工具**中：
- [ ] 右键 `cloud/getCourseList` → 上传并部署
- [ ] 右键 `cloud/getCourseDetail` → 上传并部署
- [ ] 右键 `cloud/submitRecording` → 上传并部署
- [ ] 右键 `cloud/recognizeVoice` → 上传并部署

### 6.2 测试云函数
在**云开发控制台** → **云函数**中：
- [ ] 测试 `getCourseList`（参数：`{stage: 'S1'}`）
- [ ] 测试 `getCourseDetail`（参数：`{courseId: 'course_001'}`）
- [ ] 测试 `submitRecording`（模拟录音提交）
- [ ] 测试 `recognizeVoice`（参数：`{voiceText: '下一首'}`）

---

## 七、小程序提交审核

### 7.1 代码上传
在**微信开发者工具**中：
- [ ] 点击"上传"按钮
- [ ] 填写版本号（如：1.0.0）
- [ ] 填写版本描述
- [ ] 确认上传

### 7.2 提交审核
在**微信公众平台** → **版本管理**中：
- [ ] 选择刚上传的版本
- [ ] 填写审核信息
- [ ] 选择服务标签（教育 > 儿童启蒙）
- [ ] 提交审核

### 7.3 审核注意事项
- [ ] 确保小程序名称符合规范
- [ ] 确保隐私政策完整
- [ ] 确保无侵权内容
- [ ] 确保音频内容适合儿童

---

## 八、发布上线

### 8.1 发布
审核通过后：
- [ ] 登录微信公众平台
- [ ] 进入版本管理
- [ ] 点击"发布"
- [ ] 填写发布说明
- [ ] 确认发布

### 8.2 发布后验证
- [ ] 扫码体验小程序
- [ ] 测试核心功能
- [ ] 检查数据统计

---

## 九、运营准备工作

### 9.1 数据监控
- [ ] 配置云开发统计
- [ ] 设置关键指标监控（日活、留存、完成率）

### 9.2 用户反馈
- [ ] 设置反馈入口
- [ ] 建立用户反馈处理流程

### 9.3 内容更新
- [ ] 规划后续课程内容（S2、S3 阶段）
- [ ] 建立内容更新流程

---

## 十、后续迭代计划

### S2 阶段（家长平台）
- [ ] 家长管理后台（Web 端）
- [ ] 学习报告推送
- [ ] 多孩子账号管理
- [ ] 独立后端 API（Node.js + MySQL）

### S3 阶段（配置平台）
- [ ] 配置管理后台（Web 端）
- [ ] 可视化课程编排
- [ ] 规则引擎配置
- [ ] 数据同步机制

---

## 联系与支持

如需帮助，请查阅：
- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

---

**最后更新:** 2026-03-27
