足彩理性投资助手项目开发 Prompt 文档（一期版）
一、项目概述

项目名称： 足彩理性投资助手（Football Rational Betting Tracker）
技术框架： 参考zhimianxing-uniapp 项目
运行端： H5 + 微信小程序
数据库： MySQL
开发阶段： 一期（自用版，可扩展）

项目背景

作者为足彩投资爱好者，长期在多个投注平台下注。然而在长期实践中发现，冲动下注与缺乏资金管理导致盈利难以持续。
项目旨在开发一个理性投资辅助工具，用以记录下注行为、分析盈亏趋势、提供科学下注建议，实现长期稳健盈利。

> ✅ 现已集成本地竞彩爬虫/API 服务：详见 `server/README.md`，先启动 `pnpm run server:dev`（或 `npm run server:dev`）拉取数据，再启动 UniApp 项目即可通过 `/api` 代理获取实时赛事与赔率。

二、核心目标与价值主张
目标 说明
🧾 行为记录 全面记录每一笔足彩下注的关键数据。
📊 盈亏分析 自动统计周期性盈利、盈亏比、回报率。
🧠 投注建议 通过科学算法（凯利 + 固定比例 + 止损）计算合适下注额。
🔔 风险提示 在用户频繁下注、连续亏损时，进行理性提醒。
📈 数据可视化 用直观图表展示长期盈利走势、盈亏趋势与投注结构。
三、系统功能模块定义

1. 投注记录模块

功能描述： 用户记录每笔下注信息。

主要字段：

比赛名称、赛事类型（英超/欧冠等）

投注类型（胜平负、让球、大/小球、串关）

投注额、赔率、结果、盈利额

提现手续费（如有）

投注时间、平台名称

备注

特性：

支持快捷输入模板（如自动带入上次投注额）

本地缓存 + 同步机制（本地优先）

2. 数据统计与分析模块

统计项：

总投注额 / 总盈利 / 盈利率

平均下注额 / 平均赔率

各玩法盈亏占比（饼图）

周/月/赛季盈利趋势（折线图）

分析指标：

盈利率 = 总盈利 ÷ 总投注额

胜率 = 胜出场次 ÷ 投注场次

平均收益率 = (盈利额 ÷ 投注额) 平均值

最大连续亏损次数

3. 智能下注建议模块（混合策略版）

功能目标： 通过历史数据 + 风险控制算法，为用户计算合理投注额与风险提示。

计算逻辑：

固定比例法

建议投注额 = 当前资金 × 固定比例（默认 2%-5% 可自定义）

凯利公式法

凯利值 = (p × (b+1) - 1) ÷ b

实际投注比例 = 凯利值 × 调整系数（建议 0.5）

其中：

p = 用户主观胜率（或历史胜率）

b = 赔率 - 1

止损控制

连续亏损超过设定值（如 3 次） → 提示暂停投注

周期亏损率 > -20% → 触发风险警告

综合建议输出：
系统计算三种建议，取“较保守值”为最终推荐额度，并提供风险文字提示。

4. 资金管理模块

支持记录资金账户余额变动

显示实时余额、累计盈利、提现损耗

提供盈亏日报 / 周报 / 月报

支持自定义目标（如“月度盈利目标 10%”）

5. 辅助功能模块
   功能 说明
   导出功能 支持导出 CSV/Excel
   标签系统 可自定义标签（赛事类型、盘口风格）
   数据可视化 ECharts 展示盈亏与趋势
   本地缓存 IndexedDB 持久化保存
   云同步（预留） 后期商业化阶段接入云存储
   登录功能 微信授权登录（一期可隐藏）
   四、技术架构设计
   前端架构

框架： uni-app + Vue3 Composition API

状态管理： Pinia

UI 框架： uView Plus / NutUI（支持运动感风格）

图表： ECharts for uni-app

路由结构：

/pages/
├── home.vue # 首页：统计概览
├── record.vue # 投注记录页
├── analysis.vue # 盈亏分析页
├── strategy.vue # 投注建议页
├── settings.vue # 设置页

后端架构（轻量版）

语言： Node.js (Koa / Express)

数据库： MySQL

部署方式： 本地 + 可迁移云端（如腾讯云）

API 逻辑： 一期可由本地 JSON 模拟，后期接入数据库

五、数据库结构设计（MySQL 草案）
表 1：bets（投注记录表）
字段 类型 描述
id INT 主键
match_name VARCHAR(100) 比赛名称
bet_type VARCHAR(50) 投注类型
odds FLOAT 赔率
stake FLOAT 投注金额
result ENUM('win','lose','draw') 投注结果
profit FLOAT 盈利额（负数表示亏损）
fee FLOAT 手续费
platform VARCHAR(50) 投注平台
tag VARCHAR(50) 标签
bet_time DATETIME 投注时间
remark TEXT 备注
表 2：statistics（统计缓存表）
字段 类型 描述
id INT 主键
total_bet FLOAT 总投注额
total_profit FLOAT 总盈利
win_rate FLOAT 胜率
avg_odds FLOAT 平均赔率
avg_stake FLOAT 平均投注额
update_time DATETIME 更新时间
表 3：settings（系统配置表）
字段 类型 描述
id INT 主键
strategy_mode VARCHAR(50) 投注策略模式（固定比例 / 凯利 / 混合）
fixed_ratio FLOAT 固定比例参数
kelly_factor FLOAT 凯利调整系数
stop_loss_limit INT 连续亏损限制
created_at DATETIME 创建时间
六、逻辑与数据流简述
用户输入投注信息
↓
本地记录（bets 表）
↓
统计模块更新 → statistics 表
↓
策略模块读取历史数据 → 生成推荐投注额
↓
UI 界面更新 → 显示盈亏趋势 + 建议额度

七、算法模块设计（混合策略核心）

1. 凯利公式法
   输入：赔率 b，用户主观胜率 p
   凯利值 = (p _ (b+1) - 1) / b
   建议投注比例 = 凯利值 _ 调整系数 (如 0.5)

2. 固定比例法
   建议投注额 = 当前资金 × 固定比例（默认 0.03）

3. 止损控制
   连续亏损次数 ≥ 3 → 提示“暂停下注”
   周期亏损率 < -20% → 触发风险警告

4. 综合建议输出（伪逻辑）
   推荐投注额 = min(凯利建议额, 固定比例额)
   若风险触发 → 输出“建议暂停投注”

八、UI/UX 风格指南（运动感主题）
元素 建议方案
主色调 深绿 + 金色点缀
辅助色 灰白背景、浅黑字体
字体 轻量现代字体（Source Sans Pro / 思源黑体）
视觉元素 球场线条、胜率箭头、盈亏折线图
动画 盈利波动动画（ECharts smooth 动效）
九、开发阶段规划
阶段 内容 目标周期
1️⃣ 一期 MVP 基础记录 + 盈亏分析 + 简单建议 2-3 周
2️⃣ 二期 扩展 云同步 + 登录 + 多设备 4 周
3️⃣ 三期 智能化 AI 预测 / 回测分析 后续版本
十、AI Prompt 模板（用于生成代码/模块）

以下示例可直接输入至 AI 生成器（如：ChatGPT、Claude）以生成模块代码：

示例 Prompt：

请使用 Vue3 + uni-app + Pinia 构建一个投注记录页面：

- 表单字段包括比赛名称、投注类型、赔率、投注额、结果、盈利额；
- 数据保存到本地 IndexedDB；
- 提交后更新统计模块；
- 使用 ECharts 展示本月盈亏折线图；
- 页面风格遵循绿+金运动风。

✅ 总结：

该文档已经完整定义：

系统目标与功能范围

技术与架构设计

数据结构

混合算法逻辑

UI 风格与未来扩展方向


页面结构与组件设计蓝图

一、📂 项目层级结构
/src
 ├── pages/
 │   ├── home/              # 首页（概览页）
 │   │   └── home.vue
 │   ├── record/            # 投注记录页
 │   │   └── record.vue
 │   ├── analysis/          # 盈亏分析页
 │   │   └── analysis.vue
 │   ├── strategy/          # 投注建议页
 │   │   └── strategy.vue
 │   └── settings/          # 设置页
 │       └── settings.vue
 │
 ├── components/
 │   ├── BetForm.vue        # 投注表单组件
 │   ├── BetItem.vue        # 投注记录展示组件
 │   ├── StatCard.vue       # 统计卡片（盈利、胜率）
 │   ├── ChartProfit.vue    # 盈亏趋势折线图
 │   ├── ChartPie.vue       # 玩法占比饼图
 │   ├── KellyCalc.vue      # 凯利计算模块
 │   ├── FixedRatioCalc.vue # 固定比例策略模块
 │   ├── StopLossAlert.vue  # 止损提示组件
 │   ├── RatioConfig.vue    # 策略参数配置组件
 │   └── DataSummary.vue    # 数据汇总信息卡
 │
 ├── store/
 │   ├── useBetStore.js     # 投注记录管理
 │   ├── useStatStore.js    # 统计分析管理
 │   └── useConfigStore.js  # 用户配置与策略参数
 │
 ├── utils/
 │   ├── kelly.js           # 凯利公式计算逻辑
 │   ├── fixedRatio.js      # 固定比例逻辑
 │   ├── stopLoss.js        # 止损算法逻辑
 │   ├── db.js              # IndexedDB 封装
 │   ├── charts.js          # ECharts 封装
 │   └── format.js          # 数据格式化工具
 │
 ├── assets/
 │   ├── theme.scss         # 全局主题变量（绿金风）
 │   ├── icons/             # 图标
 │   └── fonts/             # 字体文件
 │
 ├── App.vue
 ├── main.js
 ├── manifest.json
 └── pages.json             # uni-app 路由配置

二、📱 页面结构设计（含逻辑职责）
1️⃣ 首页（/pages/home/home.vue）

功能定位： 盈亏总览与关键指标展示

布局结构：

顶部导航栏：应用标题 + 当前月份

统计区（组件：StatCard ×3）

总盈利额

盈利率

胜率

图表区（组件：ChartProfit）

盈亏趋势折线图

数据摘要（组件：DataSummary）

投注次数、平均赔率、平均下注额等

数据来源：

useStatStore 计算字段：

totalProfit, profitRate, winRate, avgStake, avgOdds

2️⃣ 投注记录页（/pages/record/record.vue）

功能定位： 投注信息的录入与展示

布局结构：

上方：新增记录按钮（打开 BetForm）

中部：投注记录列表（循环渲染 BetItem）

下方：统计信息汇总（DataSummary）

组件说明：

BetForm.vue
表单字段：

比赛名、投注类型、赔率、投注额、结果、盈利额、手续费、时间、备注
提交 → 触发 useBetStore.addBet()

BetItem.vue
卡片式显示单条记录，支持编辑/删除操作。

数据流：

用户输入表单 → BetStore.addBet() → IndexedDB.save()
                   ↓
useStatStore.updateStats()
                   ↓
Home页自动更新盈亏统计

3️⃣ 盈亏分析页（/pages/analysis/analysis.vue）

功能定位： 投注历史分析与趋势图展示

布局结构：

时间筛选栏（本周 / 本月 / 全部）

盈亏趋势图（组件：ChartProfit）

投注类型占比图（组件：ChartPie）

盈亏明细统计（表格或简卡片）

图表说明：

ChartProfit → 折线图（日期为横轴，盈利为纵轴）

ChartPie → 饼图（不同玩法盈亏占比）

4️⃣ 投注策略页（/pages/strategy/strategy.vue）

功能定位： 结合三种策略输出投注建议

模块组成：

资金与状态展示（余额、连续亏损次数）

策略选择区：

凯利公式（KellyCalc）

固定比例法（FixedRatioCalc）

止损提示（StopLossAlert）

综合建议卡片：

推荐下注额（取三种策略中最保守值）

风险提示文案（例如“近期亏损率偏高，请暂停下注”）

算法调用链：

strategy.vue
 ├─ import { calcKelly } from '@/utils/kelly'
 ├─ import { calcFixedRatio } from '@/utils/fixedRatio'
 ├─ import { checkStopLoss } from '@/utils/stopLoss'
 └─ 综合逻辑：recommendBet = min(kellyBet, fixedBet)

5️⃣ 设置页（/pages/settings/settings.vue）

功能定位： 策略参数与个性化配置

布局结构：

策略模式切换：固定比例 / 凯利公式 / 混合

配置组件（RatioConfig）：

固定比例（默认 3%）

凯利系数（默认 0.5）

止损限制（默认 3 次）

主题设置（深色 / 浅色）

数据导出按钮（CSV）

数据存储：

所有设置 → useConfigStore + 本地缓存（IndexedDB）

三、🧩 组件划分与命名规范
类型	前缀	示例	用途
页面级组件	pages/	home.vue	顶层页面入口
功能组件	components/	BetForm.vue	独立逻辑模块
展示组件	components/	StatCard.vue	单一展示元素
Store 模块	use...Store.js	useBetStore	状态管理
工具函数	utils/	kelly.js	独立逻辑函数
样式文件	theme.scss	全局样式与变量	

命名风格：

组件：PascalCase（例：BetForm.vue）

状态模块：camelCase（例：useStatStore）

函数与工具：camelCase（例：calcKelly()）

四、🔄 数据流图（一期核心逻辑）
flowchart TD

A[用户输入投注数据] --> B[BetForm.vue 提交]
B --> C[useBetStore.addBet()]
C --> D[IndexedDB/本地存储]
C --> E[useStatStore.updateStats()]
E --> F[更新首页统计指标]
E --> G[更新分析页图表数据]
G --> H[ChartProfit / ChartPie]
C --> I[触发止损策略判断]
I --> J[Strategy.vue 更新提示]


说明：

所有页面依赖 useStatStore 的派生数据

统计计算与策略建议在前端完成（无后端依赖）

IndexedDB 数据每次增删操作后自动刷新分析结果

五、🎨 视觉与UI层级蓝图
层级	内容	风格
一级色	深绿 #1E5631	主调
二级色	金色 #D4AF37	点缀按钮与标题
背景	浅灰 #F8F8F8	稳重感
字体	思源黑体 / Source Sans Pro	现代感、清晰可读
按钮	圆角、渐变金绿	动态阴影 hover 效果
图表配色	盈利绿色、亏损红色	数据直观对比
六、🧱 数据依赖与交互关系
模块	输入数据	输出结果	依赖关系
BetForm	用户输入	新记录	调用 useBetStore
useBetStore	投注记录	更新统计	触发 useStatStore
useStatStore	bet 数据集	盈亏指标	被 Home / Analysis 使用
useConfigStore	用户配置	策略参数	被 Strategy 使用
utils/kelly	胜率+赔率	投注建议	被 Strategy 调用
utils/stopLoss	连续亏损次数	风险提示	被 Strategy 调用
七、🚀 一期开发优先级建议
优先级	模块	原因
🥇 高	投注记录（Record）	核心基础功能
🥈 高	盈亏统计（StatStore + Home + Analysis）	数据可视化价值高
🥉 中	投注策略页（Strategy）	实现“理性建议”核心逻辑
⚙️ 次要	设置页 + 导出	后期完善可上线时优化
八、📘 Codex 生成用补充提示（Blueprint模式）

输入 Codex 示例：

请基于以下蓝图创建 uni-app + Vue3 + Pinia 的前端项目：
- 页面：home、record、analysis、strategy、settings
- 组件：BetForm、StatCard、ChartProfit、KellyCalc、FixedRatioCalc、StopLossAlert
- 数据流参照上述流程图,统计通过 Pinia 共享。
- 界面遵循绿金运动风格，使用 ECharts 绘制盈亏图。
输出：项目结构、页面模板及主要组件示例代码。

---

## 📦 部署指南

### 快速开始

本项目支持部署到 **H5** 和 **微信小程序**，且可完全免费部署！

#### 📚 部署文档

- **[🚀 快速部署指南](./QUICK_DEPLOY.md)** - 15分钟快速上线
- **[📘 完整部署文档](./DEPLOYMENT.md)** - 详细部署流程和技术文档

#### 🎯 推荐部署方案（完全免费）

| 部署目标 | 推荐平台 | 费用 | 部署时间 |
|---------|---------|------|---------|
| 后端API | Render | ✅ 免费 | 5-10分钟 |
| H5网站 | Vercel | ✅ 免费 | 3-5分钟 |
| 微信小程序 | 微信公众平台 | ✅ 个人免费 | 5-10分钟 |

#### 🔧 快速构建

```bash
# 构建所有平台
./scripts/build-all.sh

# 或单独构建
npm run build:h5              # H5版本
npm run build:mp-weixin       # 微信小程序版本
```

#### 📱 一键部署（H5）

```bash
# 使用Vercel CLI一键部署H5
./scripts/deploy-h5.sh
```

#### ⚙️ 环境配置

部署前需要配置后端API地址：

1. **编辑 `src/utils/http.js`**，更新第10行为你的后端API地址
2. **或** 在部署平台（Vercel）配置环境变量 `VITE_API_BASE_URL`

#### 🎉 部署后访问

- **H5网站**: `https://your-project.vercel.app`
- **后端API**: `https://your-api.onrender.com`
- **微信小程序**: 通过微信搜索或扫码访问

### 详细说明

查看 **[QUICK_DEPLOY.md](./QUICK_DEPLOY.md)** 获取完整的分步部署指南。
