# 足彩理性投资助手测试用例

## 1. 测试范围

针对 H5 / 微信小程序端的核心页面和交互（首页概览、投注记录、数据分析、策略建议、赛事实况、设置与导出）进行功能测试，覆盖资金统计、算法计算、数据持久化与第三方数据接口展示等关键路径。

## 2. 测试环境

| 项目 | 配置 |
| --- | --- |
| 终端 | H5（Chrome DevTools 模拟 375×812），微信小程序开发者工具（基础库 >= 3.1） |
| 运行命令 | `npm install && npm run dev:h5` / `npm run dev:mp-weixin` |
| 后端依赖 | 本地 Node.js 数据服务 `npm run server:dev`（提供 `/api/matches` 及 `/api/matches/:id/plays` 数据） |
| 本地存储 | `uni.setStorageSync`，键：`frbt-bets`、`frbt-config` |

## 3. 数据准备

1. 通过设置页将“初始资金”配置为 10,000，固定比例 3%，凯利调整 0.5，止损 3 场，月度目标 10%。
2. 通过投注记录页录入至少 5 条样例数据，覆盖 `win`、`lose`、`half-win`、`half-lose`、`pending` 结果，以便验证统计与图表。
3. 启动本地 server，保证 `/api/matches` 返回不少于 2 天的赛事和至少一场支持单关的比赛。

## 4. 测试用例

### 4.1 首页概览（`src/pages/home/home.vue`）

| 用例 ID | 场景 | 前置条件 | 测试步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| HOME-01 | 余额与目标完成度展示 | 配置起始资金 10,000，累计盈亏 2,000 | 进入首页 | 余额显示 12,000；目标完成度显示 200%（封顶显示为 200%）；盈亏标签呈绿色趋势文案 |
| HOME-02 | 汇总卡片数据正确 | betStore 中存在 5 条投注 | 检查“总投入/累计盈亏/胜率/投资回报率”卡片 | 数值与 `totalStake/totalProfit/winningRate/statStore.roi` 一致，正负状态切换样式正确 |
| HOME-03 | 风控雷达 | 连续亏损次数 >= 止损值-1 | 查看“风控雷达”区 | “连续亏损”显示 `x / limit`；当接近上限时提示色保持醒目；最大回撤显示 statStore.drawdown 的百分比 |

### 4.2 投注记录页（`src/pages/record/record.vue` + `components/BetForm.vue`）

| 用例 ID | 场景 | 前置条件 | 测试步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| BET-01 | 新增记录 | 无 | 在 BetForm 填写完整信息并保存 | `betStore.addBet` 被调用，新记录显示在列表顶部，盈亏按结果自动计算；表单重置为默认值 |
| BET-02 | 结果映射与样式 | 记录包含多种 `result` | 查看列表 | `win/lose/half-win/half-lose/pending` 使用对应中文与颜色；未填写比赛名显示“未命名比赛” |
| BET-03 | 删除记录确认 | 至少有 1 条记录 | 点击“删除”并确认 | 记录从列表中移除，`frbt-bets` 同步更新（刷新后不再出现） |
| BET-04 | 表单标签输入 | 在标签输入 `竞彩,保守 , 反转` | 保存记录 | `tags` 被转换为去空格的数组 `['竞彩','保守','反转']` |

### 4.3 数据分析页（`src/pages/analysis/analysis.vue`）

| 用例 ID | 场景 | 前置条件 | 测试步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| ANA-01 | 盈亏趋势曲线 | 已存在多天数据 | 查看“盈亏趋势” | ChartProfit 组件收到 `statStore.trendSeries`，曲线与 `snapshots` 累计余额一致 |
| ANA-02 | 玩法盈亏占比 | 记录含多种 `betType` | 查看饼图 | `ChartPie` 显示各玩法盈亏，负值区块标识清晰，无数据时显示空态 |
| ANA-03 | 周度列表排序 | 存在不同周的投注 | 查看“周度盈亏” | 列表按周编码升序；无数据时显示“暂无数据” |

### 4.4 策略建议页（`src/pages/strategy/strategy.vue` + 算法工具）

| 用例 ID | 场景 | 前置条件 | 测试步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| STR-01 | 凯利投注额计算 | 余额 12,000，胜率 55%，赔率 1.90 | 输入主观胜率与赔率 | 显示凯利建议 = `calcKellyStake` 结果，随输入实时刷新 |
| STR-02 | 固定比例投注额 | 固定比例 3% | 查看固定比例卡片 | 建议金额 = 12,000 × 3% = 360，保留两位小数 |
| STR-03 | 综合建议取较小值 | 凯利 > 固定比例 | 观察“综合建议” | 推荐值等于两者较小值，描述提示“取凯利与固定比例中的更保守值” |
| STR-04 | 止损提醒 | 连续亏损 >= 止损限制，或最大回撤 < -20% | 进入策略页 | StopLossAlert 显示红色提示，“风险”文案为 `checkStopLoss` 返回的 warnings，shouldPause=true 时推荐卡片展示 danger 样式 |

### 4.5 赛事实况（`src/pages/matches/list.vue`、`plays.vue`）

| 用例 ID | 场景 | 前置条件 | 测试步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| MAT-01 | 赛事加载与刷新 | server 正常返回数据 | 打开赛事页，等待自动上拉加载完成 | mescroll 自动触发 `refreshMatches`，列表按日期分组，已完赛/待定过滤，header 显示“周X YYYY-MM-DD” |
| MAT-02 | 折叠/展开分组 | 已有多天分组 | 点击分组头 | `collapsedMap` 状态切换，对应比赛列表显隐 |
| MAT-03 | 单关标识 | 返回数据含 `is_single` 或玩法 is_single=1 | 检查赔率卡片 | 支持单关的 odds-item 添加 `single-ok` 样式，header 提示“红框选项可投单关” |
| MAT-04 | 玩法详情页 | 点击“更多玩法” | 跳转到 `/pages/matches/plays` | 顶部展示联赛、球队、时间及单关标签；若接口返回 had/hhad/ttg/hafu/crs，则各模块渲染表格；接口错误时展示“玩法加载失败” |
| MAT-05 | 空数据与错误状态 | server 返回空数组或 500 | 手动触发刷新 | mescroll empty 提示“暂无可售赛事”；错误时 `matchStore.error` 展示“加载失败”并停止加载 |

### 4.6 设置与导出（`src/pages/settings/settings.vue`、`stores/configStore.js`）

| 用例 ID | 场景 | 前置条件 | 测试步骤 | 期望结果 |
| --- | --- | --- | --- | --- |
| SET-01 | 参数回显 | configStore 已持久化数据 | 打开设置页 | 表单通过 `watch` 自动填充，固定比例/目标以百分比显示（乘以 100） |
| SET-02 | 保存参数 | 修改任意字段，点击“保存设置” | 触发 `config.updateConfig` 并 `uni.showToast` | `frbt-config` 更新；切换到首页/策略页使用新参数 |
| SET-03 | 主题切换 | 选择“深色”主题 | 保存并返回首页 | `config.theme` 更新为 `dark`，主题相关样式（若实现）切换；picker 显示“深色” |
| SET-04 | 导出 CSV | betStore 有数据 | 点击“导出 CSV” | 提示“已复制”，剪贴板内容包含表头 + 每条记录一行；无数据时提示“暂无数据” |

## 5. 回归重点

1. `betStore` 计算衍生字段（`totalStake/totalProfit/winningRate/consecutiveLosses`）是否随增删记录实时更新并持久化。
2. `statStore` 衍生指标（ROI、drawdown、trendSeries、periodStats）是否在不同页面共享无状态错乱。
3. API 失败、空数据、加载态在赛事列表与玩法详情页是否兜底，避免白屏。
4. 策略页的计算函数（`calcKellyStake`、`calcFixedRatioStake`、`checkStopLoss`）与配置参数联动正确。

## 6. 追踪与记录

- 缺陷提交到项目 issue（建议区分模块标签：`home`、`bet-record`、`analysis`、`strategy`、`matches`、`settings`）。
- 测试数据与执行记录保存在共享表格（如飞书/Google Sheet），列出用例 ID、执行人、状态、备注。
